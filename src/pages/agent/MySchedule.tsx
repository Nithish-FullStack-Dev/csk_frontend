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
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
// import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { RescheduleDialog } from "./RescheduleDialog";
import { DetailsDialog } from "./DetailsDialog";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useRBAC } from "@/config/RBAC";
import Loader from "@/components/Loader";

const MySchedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date()); // Using April 10, 2025
  const [view, setView] = useState<"day" | "calendar">("day");
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [unit, setUnit] = useState("");
  const [projects, setProjects] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isRescheduleOpen, setRescheduleOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [units, setUnits] = useState<string[]>([]);

  const { register, handleSubmit, setValue, reset } = useForm();
  // const { register, handleSubmit, reset} = useForm();

  const onSubmit = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        clientId: formData.clientId,
        property: formData.propertyId,
        type: formData.type,
        startTime: `${formData.date}T${formData.startTime}`,
        endTime: `${formData.date}T${formData.endTime}`,
        location: formData.location,
        notes: formData.notes,
        date: formData.date,
        status: formData.status || "pending",
      };

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/user-schedule/schedule`,
        payload,
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description: "Appointment created successfully.",
      });

      reset(); // Clear form
      setOpen(false); // Close dialog
      fetchAppointments();
      // Optionally refetch your appointment list
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.error ||
          "Something went wrong while saving appointment.",
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/user-schedule/schedules`,
        { withCredentials: true }
      );

      const schedules = response.data.schedules || [];

      const processedSchedules = schedules.map((appt) => ({
        ...appt,
        date: new Date(appt.date),
        startTime: new Date(appt.startTime),
        endTime: new Date(appt.endTime),
      }));
      console.log(processedSchedules);
      setAppointments(processedSchedules);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const clientsRes = await axios.get(
        `${import.meta.env.VITE_URL}/api/user/contractor`,
        { withCredentials: true }
      ); // Replace with your actual route
      const projectRes = await axios.get(
        `${import.meta.env.VITE_URL}/api/project/projects`,
        { withCredentials: true }
      );

      setClients(clientsRes.data.data);
      setProjects(projectRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, []);

  const {
    isRolePermissionsLoading,
    userCanAddUser,
    userCanDeleteUser,
    userCanEditUser,
  } = useRBAC({ roleSubmodule: "My Schedule" });

  if (isRolePermissionsLoading) return <Loader />;
  const todaysAppointments = appointments.filter((appointment) =>
    date ? isSameDay(appointment.date, date) : false
  );

  const handlePreviousDay = () => {
    if (date) setDate(subDays(date, 1));
  };

  const handleNextDay = () => {
    if (date) setDate(addDays(date, 1));
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

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input {...register("title")} placeholder="Title" required />

                  <Select
                    onValueChange={(value) => setValue("clientId", value)}
                  >
                    <SelectTrigger>
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

                  {/* Project Dropdown */}
                  <select
                    className="w-full border p-2 rounded"
                    value={selectedProjectId}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      setSelectedProjectId(projectId);

                      const project =
                        projects.find((p) => p._id === projectId) || null;
                      setUnits(project?.unitNames || []);
                      setSelectedUnit(""); // reset unit on project change

                      // update form value for backend
                      setValue("propertyId", projectId);
                    }}
                  >
                    <option value="">Select Project</option>
                    {projects.map((proj) => (
                      <option key={proj._id} value={proj._id}>
                        {proj.projectTitle || proj.name || "Unnamed Project"}
                      </option>
                    ))}
                  </select>

                  {/* Unit Dropdown */}
                  <select
                    className="w-full border p-2 rounded"
                    value={selectedUnit}
                    onChange={(e) => {
                      setSelectedUnit(e.target.value);
                      setValue("unit", e.target.value); // update form field
                    }}
                    disabled={!selectedProjectId}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unitName) => (
                      <option key={unitName} value={unitName}>
                        {unitName}
                      </option>
                    ))}
                  </select>

                  <Input type="date" {...register("date")} required />
                  <Input type="time" {...register("startTime")} required />
                  <Input type="time" {...register("endTime")} required />
                  <Input {...register("location")} placeholder="Location" />
                </div>

                <Select
                  onValueChange={(value) => setValue("type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mode of Engagement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site_visit">Site Visit</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  {...register("notes")}
                  placeholder="Notes or Description"
                  className="min-h-[100px]"
                />

                <Select
                  onValueChange={(value) => setValue("status", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <DialogFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setUnit("");
                      setSelectedProject(null);
                      setSelectedUnit(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
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
                        key={appointment.id}
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
                                {appointment.client.name || "anonymous"}
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
                                  setSelectedSchedule(appointment); // pass the full appointment object
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
                      fetchAppointments={fetchAppointments}
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
