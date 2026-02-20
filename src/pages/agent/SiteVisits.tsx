import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Plus,
  CheckCircle2,
  Tag,
  StickyNote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { useAuth, User } from "@/contexts/AuthContext";
import axios from "axios";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllLeads, fetchLeads, Lead } from "@/utils/leads/LeadConfig";
import { useRBAC } from "@/config/RBAC";
import {
  ClientSelectionItemProps,
  fetchAllSiteVisits,
  fetchAllVehicles,
  SiteVisitData,
  SiteVisitPayload,
  useBookSiteVisit,
  Vehicle,
  VisitCardProps,
} from "@/utils/site-visit/SiteVisitConfig";

const SiteVisits = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Lead | null>(null);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitPeriod, setVisitPeriod] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [priority, setPriority] = useState(""); // Default priority
  const { user } = useAuth();
  const bookSiteVisitMutation = useBookSiteVisit();
  const isTeamLead = user && user.role === "team_lead";
  const isAgent = user && user.role === "agent";

  const [selectedVisit, setSelectedVisit] = useState<SiteVisitData | null>(
    null,
  ); // State for viewing visit details

  const fetchSiteVisitsOfAgent = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/siteVisit/getSiteVisitById/${user?._id}`,
      { withCredentials: true },
    );
    return data;
  };

  const {
    data: vehicles,
    isLoading,
    isError,
    error,
  } = useQuery<Vehicle[]>({
    queryKey: ["cars"],
    queryFn: fetchAllVehicles,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: clients,
    isLoading: clientLoading,
    isError: clientHasError,
    error: clientError,
  } = useQuery<Lead[]>({
    queryKey: ["sitevisit-leads", user?._id, user?.role],
    queryFn: () => {
      if (user?.role === "agent") return fetchLeads();
      return fetchAllLeads();
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: siteVisits,
    isLoading: siteVisitsLoading,
    isError: siteVisitsError,
    error: siteVisitsFetchError,
    refetch: refetchSiteVisits,
  } = useQuery<SiteVisitData[]>({
    queryKey: ["siteVisits"],
    queryFn: fetchAllSiteVisits,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: siteVisitOfAgent,
    isLoading: agentLoading,
    isError: agentError,
    error: agentErr,
  } = useQuery<SiteVisitData[]>({
    queryKey: ["siteVisitOfAgent", user?._id],
    queryFn: fetchSiteVisitsOfAgent,
    enabled: !!user?._id && isAgent,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { isRolePermissionsLoading, userCanAddUser } = useRBAC({
    roleSubmodule: "Site Visits",
  });

  if (
    clientLoading ||
    isLoading ||
    siteVisitsLoading ||
    agentLoading ||
    isRolePermissionsLoading
  )
    return <Loader />;

  if (isError || clientHasError || siteVisitsError || agentError) {
    if (isError) {
      toast.error("Failed to fetch vehicles.");
      console.error("Fetch vehicle error:", error);
    } else if (clientHasError) {
      toast.error("Failed to fetch leads.");
      console.error("Fetch client error:", clientError);
    } else if (siteVisitsError) {
      toast.error("Failed to fetch site visits.");
      console.error("Fetch site visits error:", siteVisitsFetchError);
    } else if (agentError) {
      toast.error("Failed to fetch agent's site visits.");
      console.error("Fetch agent site visits error:", agentErr);
    }
  }

  const filteredClients = (clients || []).filter((client: Lead) => {
    const matchesSearch =
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase());
    return matchesSearch;
  });

  const visitsToUse = isAgent ? siteVisitOfAgent : siteVisits; // Use agent's visits if role is agent

  const upcomingVisits =
    visitsToUse?.filter(
      (visit) => visit.status === "pending" || visit.status === "confirmed",
    ) || [];
  const completedVisits =
    visitsToUse?.filter((visit) => visit.status === "completed") || [];

  const handleVehicleSelect = (vehicle: Vehicle) => {
    if (!selectedClient) {
      toast.error("Select a client to select a vehicle.");
      return;
    }
    setSelectedVehicle(vehicle);
    setBookingStep(2);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time24 = e.target.value; // e.g., "14:30"
    setVisitTime(time24);

    // Convert to AM/PM
    const [hour, minute] = time24.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const formatted = `${hour12}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;

    setVisitPeriod(formatted); // or just store `period` if that's all you need
  };

  const handleBookingComplete = async () => {
    if (
      !selectedClient ||
      !visitDate ||
      !visitTime ||
      !visitPeriod ||
      !priority
    ) {
      toast.error("Please fill in all required booking details.");
      return;
    }

    const bookingPayload: SiteVisitPayload = {
      clientId: selectedClient._id,
      priority,
      date: visitDate,
      time: visitPeriod,
      notes: additionalNotes,
      ...(selectedVehicle && { vehicleId: selectedVehicle._id }),
    };

    try {
      await bookSiteVisitMutation.mutateAsync(bookingPayload);
      toast.success("Site visit scheduled successfully!");
      setIsBookingOpen(false);
      setSelectedVehicle(null);
      setSelectedClient(null);
      setBookingStep(1);
      setVisitDate("");
      setVisitTime("");
      setAdditionalNotes("");
      setPriority("medium"); // Reset priority
      refetchSiteVisits(); // Refetch all site visits after booking
    } catch (bookingError) {
      toast.error("Failed to schedule site visit.");
      console.error("Booking error:", bookingError);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Site Visits</h1>
            <p className="text-muted-foreground">
              Schedule and manage property visits with clients
            </p>
          </div>
          {userCanAddUser && isAgent && (
            <Button onClick={() => setIsBookingOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Book New Visit
            </Button>
          )}
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Visits</TabsTrigger>
            <TabsTrigger value="completed">Completed Visits</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="upcoming">
              <div className="grid gap-6">
                {upcomingVisits.length > 0 ? (
                  upcomingVisits.map((visit) => (
                    <VisitCard
                      key={visit._id}
                      visit={visit}
                      buttonText="View Details"
                      buttonVariant="outline"
                      onViewDetails={setSelectedVisit} // Pass the setter for selectedVisit
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground">No upcoming visits.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="grid gap-6">
                {completedVisits.length > 0 ? (
                  completedVisits.map((visit) => (
                    <VisitCard
                      key={visit._id}
                      visit={visit}
                      buttonText="View Details"
                      buttonVariant="outline"
                      showNotes
                      onViewDetails={setSelectedVisit} // Pass the setter for selectedVisit
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground">No completed visits.</p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Dialog for Vehicle Details (remains unchanged) */}
        {selectedVehicle && (
          <Dialog
            open={!!selectedVehicle && !isBookingOpen}
            onOpenChange={(open) => {
              if (!open) setSelectedVehicle(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vehicle Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-estate-navy" />
                  <h3 className="text-lg font-medium">
                    {selectedVehicle.model}
                  </h3>
                  <Badge
                    className={
                      selectedVehicle.status === "available"
                        ? "bg-green-100 text-green-800"
                        : selectedVehicle.status === "booked"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedVehicle.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Type:</p>
                    <p>{selectedVehicle.type}</p>
                  </div>
                  <div>
                    <p className="font-medium">Capacity:</p>
                    <p>{selectedVehicle.capacity}</p>
                  </div>
                  <div>
                    <p className="font-medium">Registration:</p>
                    <p>{selectedVehicle.licensePlate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Fuel Level:</p>
                    <p>{selectedVehicle.fuelLevel}</p>
                  </div>
                  <div>
                    <p className="font-medium">Last Maintenance:</p>
                    <p>
                      {new Date(selectedVehicle.lastService).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          year: "2-digit",
                          month: "short",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVehicle(null)}
                >
                  Close
                </Button>
                {selectedVehicle.status === "available" && (
                  <Button
                    onClick={() => {
                      setIsBookingOpen(true);
                      // No need to call handleVehicleSelect here, as selectedVehicle is already set
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book for Site Visit
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog for Booking a Site Visit */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] max-w-[90vw] rounded-xl overflow-y-auto  overflow-x-hidden ">
            <DialogHeader>
              <DialogTitle>Book a Site Visit</DialogTitle>
              <DialogDescription>
                Complete the form to book a vehicle for your client's site visit
              </DialogDescription>
            </DialogHeader>

            {bookingStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">1. Select a Client</p>
                  <Input
                    placeholder="Search clients..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                    }}
                  />
                  <div className="h-[200px] overflow-y-auto border rounded-md p-4">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <ClientSelectionItem
                          key={client._id}
                          client={client}
                          onClick={() => setSelectedClient(client)}
                          isSelected={selectedClient?._id === client?._id}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No clients found.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 p-4 border rounded-xl bg-white shadow-sm">
                  <p className="text-base font-semibold text-gray-700">
                    2. Client's Property Details
                  </p>

                  {selectedClient ? (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">
                          Property:{" "}
                        </span>
                        {typeof selectedClient?.property === "object"
                          ? `${selectedClient?.property?.projectName || "Unknown Project"} - ${(typeof selectedClient?.floorUnit === "object" && selectedClient?.floorUnit?.floorNumber) || "Unknown Floor"} - ${(typeof selectedClient?.unit === "object" && selectedClient?.unit?.propertyType) || "Unknown Type"}`
                          : "Property not assigned"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">
                          Notes:{" "}
                        </span>
                        {selectedClient.notes || "N/A"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No client selected.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">3. Select a Vehicle</p>
                  {(isTeamLead || isAgent) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {vehicles
                        ?.filter((v) => {
                          if (isTeamLead) return v.status === "available";
                          if (isAgent) return v.status === "assigned";
                          return false;
                        })
                        .map((vehicle) => (
                          <Button
                            key={vehicle._id}
                            variant={
                              selectedVehicle?._id === vehicle._id
                                ? "default"
                                : "outline"
                            }
                            className="justify-start h-auto p-3"
                            onClick={() => setSelectedVehicle(vehicle)}
                          >
                            <div className="flex items-center">
                              <Car className="mr-2 h-4 w-4 text-estate-navy" />
                              <div className="text-left">
                                <p className="font-medium">{vehicle.model}</p>
                                <p className="text-xs text-muted-foreground">
                                  {vehicle.type} • {vehicle.capacity}
                                </p>
                              </div>
                            </div>
                          </Button>
                        ))}
                    </div>
                  )}
                  {!isTeamLead && !isAgent && (
                    <p className="text-muted-foreground">
                      Only Team Leads and Agents can select vehicles.
                    </p>
                  )}
                  {selectedClient && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected Vehicle:{" "}
                      {selectedVehicle ? (
                        <span className="font-semibold">
                          {selectedVehicle.model} (
                          {selectedVehicle.licensePlate})
                        </span>
                      ) : (
                        "None"
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="space-y-4">
                {selectedVehicle ? (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-estate-navy" />
                      <p className="font-medium">{selectedVehicle.model}</p>
                      <Badge className="bg-green-100 text-green-800">
                        {selectedVehicle.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedVehicle.type} • {selectedVehicle.capacity} •{" "}
                      {selectedVehicle.licensePlate}
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground">
                    No vehicle selected for this visit
                  </div>
                )}

                <div className="mb-4">
                  <Label
                    htmlFor="priority"
                    className="block text-sm font-medium mb-1"
                  >
                    Priority
                  </Label>

                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger
                      id="priority"
                      className="w-[150px] border px-3 py-2 rounded-md"
                    >
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Visit Date & Time</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <Input
                        type="date"
                        required
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time</p>
                      <Input
                        type="time"
                        required
                        value={visitTime}
                        onChange={handleTimeChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Additional Information</p>
                  <Input
                    placeholder="Special requests or notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              {bookingStep === 1 ? (
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={() => setIsBookingOpen(false)}
                  >
                    Cancel
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setBookingStep(2)}
                      disabled={!selectedClient}
                    >
                      Skip vehicle
                    </Button>

                    <Button
                      onClick={() => setBookingStep(2)}
                      disabled={!selectedClient}
                    >
                      Next: Schedule Visit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={() => setBookingStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleBookingComplete}
                    disabled={
                      bookSiteVisitMutation.isPending ||
                      !visitDate ||
                      !visitTime ||
                      !priority
                    }
                  >
                    {bookSiteVisitMutation.isPending
                      ? "Booking..."
                      : "Confirm Booking"}
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for Viewing Site Visit Details */}
        <Dialog
          open={!!selectedVisit}
          onOpenChange={() => setSelectedVisit(null)}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] max-w-[90vw] rounded-xl overflow-auto">
            <DialogHeader>
              <DialogTitle>Site Visit Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about this site visit.
              </DialogDescription>
            </DialogHeader>
            {selectedVisit && selectedVisit.clientId ? (
              <div className="space-y-6 py-4">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Client & Property
                  </h3>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {(selectedVisit.clientId.name || "NA")
                          .split(" ")
                          .map((word) => word?.[0] ?? "")
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium text-lg">
                        {selectedVisit?.clientId?.name || "Unknown Client"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {selectedVisit?.clientId?.email || "No email provided"}
                      </p>

                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {typeof selectedVisit.clientId?.property === "object"
                          ? `${selectedVisit?.clientId?.property?.projectName || "Unknown Project"} - ${(typeof selectedVisit?.clientId?.floorUnit === "object" && selectedVisit.clientId?.floorUnit?.floorNumber) || "Unknown Floor"} - ${(typeof selectedVisit.clientId.unit === "object" && selectedVisit?.clientId?.unit?.propertyType) || "Unknown Type"}`
                          : "Property not assigned"}
                      </p>
                    </div>
                  </div>

                  {selectedVisit.clientId.notes ? (
                    <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                      <p className="font-medium">Client Notes:</p>
                      <p>{selectedVisit?.clientId?.notes}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground border-t pt-2">
                      No client notes available
                    </p>
                  )}
                </div>

                {/* Visit Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date:</p>
                      <p>
                        {selectedVisit.date
                          ? new Date(selectedVisit.date).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "Date not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time:</p>
                      <p>{selectedVisit.time || "Time not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Priority:</p>
                      <p className="capitalize">
                        {selectedVisit.priority || "normal"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Status:</p>
                      <Badge
                        className={getStatusColor(
                          selectedVisit.status || "pending",
                        )}
                      >
                        {selectedVisit.status || "pending"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    Assigned Vehicle
                  </h3>

                  {selectedVisit.vehicleId ? (
                    <div className="space-y-1">
                      <p className="font-medium">
                        {selectedVisit.vehicleId.model || "Unknown Model"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Type: {selectedVisit.vehicleId.type || "N/A"} •
                        Capacity: {selectedVisit.vehicleId.capacity ?? "N/A"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        License Plate:{" "}
                        {selectedVisit.vehicleId.licensePlate ||
                          "Not available"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Fuel Level: {selectedVisit.vehicleId.fuelLevel || "N/A"}{" "}
                        • Last Service:{" "}
                        {selectedVisit.vehicleId.lastService
                          ? new Date(
                              selectedVisit.vehicleId.lastService,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not serviced yet"}
                      </p>

                      <Badge
                        className={
                          selectedVisit.vehicleId.status === "available"
                            ? "bg-green-100 text-green-800"
                            : selectedVisit.vehicleId.status === "booked"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedVisit.vehicleId.status || "unknown"}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No vehicle assigned for this visit
                    </p>
                  )}
                </div>

                {/* Additional Notes */}
                {selectedVisit.notes ? (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <StickyNote className="h-5 w-5 text-muted-foreground" />
                      Additional Notes
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedVisit.notes}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No additional notes provided
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                Visit or client information is not available
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedVisit(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

// Component for visit cards
const VisitCard = ({
  visit,
  buttonText = "View",
  buttonVariant = "default",
  showNotes = false,
  onViewDetails, // Destructure the new prop
}: VisitCardProps) => {
  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const displayDate = new Date(visit.date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {visit?.clientId?.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase() || "NA"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{visit?.clientId?.name}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {visit.clientId && typeof visit.clientId?.property === "object"
                  ? `${visit.clientId?.property?.projectName || "Unknown Project"} - ${(typeof visit.clientId?.floorUnit === "object" && visit.clientId?.floorUnit?.floorNumber) || "Unknown Floor"} - ${(typeof visit.clientId?.unit === "object" && visit.clientId.unit?.propertyType) || "Unknown Type"}`
                  : "Property not assigned"}
              </div>
            </div>
          </div>
          <Badge
            className={statusColors[visit.status as keyof typeof statusColors]}
          >
            {visit?.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{displayDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{visit.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {visit.vehicleId ? visit.vehicleId.model : "No vehicle"}
            </span>
          </div>
        </div>

        {showNotes && visit.notes && (
          <div className="mt-4 text-sm border-t pt-4">
            <p className="font-medium">Notes:</p>
            <p className="text-muted-foreground mt-1">{visit.notes}</p>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button
            variant={buttonVariant}
            onClick={() => onViewDetails?.(visit)}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for client selection items
const ClientSelectionItem = ({
  client,
  onClick,
  isSelected,
}: ClientSelectionItemProps) => {
  return (
    <div
      className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 px-2 rounded-md"
      onClick={() => onClick(client)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={undefined} alt={client?.name} />
          <AvatarFallback>
            {client?.name
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase() || "NA"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{client?.name}</p>
          <p className="text-xs text-muted-foreground">{client?.email}</p>
        </div>
      </div>
      {isSelected ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <Button variant="ghost" size="sm">
          Select
        </Button>
      )}
    </div>
  );
};

export default SiteVisits;
