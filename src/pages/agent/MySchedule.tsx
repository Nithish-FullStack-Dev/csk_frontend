import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isSameDay, subDays } from "date-fns";
import axios from "axios";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RescheduleDialog } from "./RescheduleDialog";
import { DetailsDialog } from "./DetailsDialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useRBAC } from "@/config/RBAC";
import Loader from "@/components/Loader";
import { useQuery } from "@tanstack/react-query";
import { fetchContractor, fetchSchedules } from "@/utils/buildings/Projects";
import PropertySelect from "@/hooks/PropertySelect";
import { Label } from "@/components/ui/label";

const MySchedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isRescheduleOpen, setRescheduleOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFloorUnit, setSelectedFloorUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [formDate, setFormDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  // Fetch schedules
  const {
    data: schedules = [],
    isLoading: schedulesLoading,
    isError: schedulesError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules,
    staleTime: 2 * 60 * 1000,
  });
  const {
    data: clients = [],
    isLoading: clientsLoading,
    isError: clientsError,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchContractor,
    staleTime: 2 * 60 * 1000,
  });

  const { isRolePermissionsLoading, userCanAddUser } = useRBAC({
    roleSubmodule: "Inspection Schedule",
  });

  if (schedulesError || clientsError) {
    toast.error("Failed to load data. Please try again.");
    return null;
  }

  if (isRolePermissionsLoading || clientsLoading || schedulesLoading)
    return <Loader />;

  const processedSchedules = schedules.map((appt: any) => ({
    ...appt,
    date: new Date(appt.date),
    startTime: new Date(appt.startTime),
    endTime: new Date(appt.endTime),
  }));

  const todaysAppointments = processedSchedules.filter((appt) =>
    date ? isSameDay(appt.date, date) : false
  );

  const handlePreviousDay = () => {
    if (date) setDate(subDays(date, 1));
  };

  const handleNextDay = () => {
    if (date) setDate(addDays(date, 1));
  };

  const resetForm = () => {
    setTitle("");
    setClientId("");
    setSelectedProject("");
    setSelectedFloorUnit("");
    setSelectedUnit("");
    setFormDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setType("");
    setNotes("");
    setStatus("pending");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !title ||
      !clientId ||
      !selectedProject ||
      !selectedFloorUnit ||
      !selectedUnit ||
      !formDate ||
      !startTime ||
      !endTime ||
      !type
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        clientId,
        property: selectedProject,
        type,
        startTime: `${formDate}T${startTime}`,
        endTime: `${formDate}T${endTime}`,
        location,
        notes,
        date: formDate,
        status,
        unit: selectedUnit,
        floorUnit: selectedFloorUnit,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/user-schedule/schedule`,
        payload,
        { withCredentials: true }
      );

      toast.success("Appointment created successfully.");

      resetForm();
      setOpen(false);
      refetchSchedules();
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        error?.response?.data?.error ||
          "Something went wrong while saving appointment."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground">
              Manage your appointments and meetings
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              {userCanAddUser && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              )}
            </DialogTrigger>

            <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>New Appointment</DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">Contractor *</Label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger id="clientId">
                        <SelectValue placeholder="Select Contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(clients) &&
                          clients.map((client) => (
                            <SelectItem key={client._id} value={client._id}>
                              {client.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Dropdown */}
                  <PropertySelect
                    index={0}
                    selectedFloorUnit={selectedFloorUnit}
                    selectedProject={selectedProject}
                    selectedUnit={selectedUnit}
                    setSelectedProject={setSelectedProject}
                    setSelectedFloorUnit={setSelectedFloorUnit}
                    setSelectedUnit={setSelectedUnit}
                    useAvailable={false}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Mode of Engagement *</Label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select Mode of Engagement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site_visit">Site Visit</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes or Description"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={setStatus} required>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-4">
              <Calendar mode="single" selected={date} onSelect={setDate} />
              <div className="flex justify-between w-full mt-4">
                {/* <Button variant="outline" onClick={() => setView("calendar")}>
                  Month View
                </Button>
                <Button variant="outline" onClick={() => setView("day")}>
                  Day View
                </Button> */}
              </div>
            </CardContent>
          </Card>

          {/* Appointments for the selected day */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle>
                  {date ? format(date, "EEEE, MMMM do, yyyy") : "Schedule"}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousDay}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No appointments scheduled for this day
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment) => {
                    const typeIcons = {
                      site_visit: <MapPin className="h-4 w-4" />,
                      consultation: <UserCircle className="h-4 w-4" />,
                      document: <CalendarIcon className="h-4 w-4" />,
                      meeting: <UserCircle className="h-4 w-4" />,
                    };

                    const typeColors = {
                      site_visit: "bg-estate-teal/20 text-estate-teal",
                      consultation: "bg-estate-navy/20 text-estate-navy",
                      document: "bg-estate-gold/20 text-estate-gold",
                      meeting: "bg-estate-success/20 text-estate-success",
                    };

                    const statusColors = {
                      confirmed: "bg-green-100 text-green-800",
                      pending: "bg-yellow-100 text-yellow-800",
                      cancelled: "bg-red-100 text-red-800",
                    };

                    return (
                      <div
                        key={appointment._id}
                        className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center w-16 text-center">
                          <span className="text-sm font-medium">
                            {format(appointment.startTime, "h:mm")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(appointment.startTime, "a")}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="font-medium">{appointment.title}</h3>
                            <Badge
                              className={
                                statusColors[
                                  appointment.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>
                                {format(appointment.startTime, "h:mm a")} -{" "}
                                {format(appointment.endTime, "h:mm a")}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>

                          {appointment.client && (
                            <div className="flex items-center mt-2 gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={appointment.client.avatar} />
                                <AvatarFallback>
                                  {appointment.client?.name?.[0] ?? "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {appointment.client?.name || "anonymous"}
                              </span>
                              {appointment?.property?.projectId?.basicInfo
                                ?.projectName && (
                                <>
                                  <span className="text-muted-foreground mx-1">
                                    •
                                  </span>
                                  <span className="text-sm">
                                    {
                                      appointment?.property?.projectId
                                        ?.basicInfo?.projectName
                                    }
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={
                                typeColors[
                                  appointment.type as keyof typeof typeColors
                                ]
                              }
                            >
                              <span className="flex items-center">
                                {
                                  typeIcons[
                                    appointment.type as keyof typeof typeIcons
                                  ]
                                }
                                <span className="ml-1 capitalize">
                                  {appointment.type.replace("_", " ")}
                                </span>
                              </span>
                            </Badge>

                            <div className="flex-1"></div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSchedule(appointment);
                                  setRescheduleOpen(true);
                                }}
                              >
                                Reschedule
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSchedule(appointment);
                                  setDetailsOpen(true);
                                }}
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {selectedSchedule && (
                    <RescheduleDialog
                      open={isRescheduleOpen}
                      setOpen={setRescheduleOpen}
                      schedule={selectedSchedule}
                      fetchAppointments={refetchSchedules}
                    />
                  )}

                  {selectedSchedule && (
                    <DetailsDialog
                      open={isDetailsOpen}
                      setOpen={setDetailsOpen}
                      schedule={selectedSchedule}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MySchedule;
