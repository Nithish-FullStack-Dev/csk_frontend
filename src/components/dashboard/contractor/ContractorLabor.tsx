import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Search,
  Plus,
  BadgeIndianRupee,
  Users,
  CalendarClock,
  Badge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LaborTeam, useLaborTeams } from "@/utils/contractor/ContractorConfig";
import { usefetchProjectsForDropdown } from "@/utils/project/ProjectConfig";
import {
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import Loader from "@/components/Loader";
import CircleLoader from "@/components/CircleLoader";

// Form schema
const laborTeamSchema = z.object({
  name: z.string().min(2, "Team name is required"),
  supervisor: z.string().min(2, "Supervisor name is required"),
  type: z.string().min(1, "Team type is required"),
  members: z.coerce
    .number()
    .int()
    .positive("Number of members must be positive"),
  wage: z.coerce.number().positive("Daily wage must be positive"),
  project: z.string().min(2, "Project is required"),
  contact: z.string().min(10, "Valid contact number is required").max(15),
  remarks: z.string().optional(),
});

type LaborTeamFormValues = z.infer<typeof laborTeamSchema>;

const ContractorLabor = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewTeamDialogOpen, setViewTeamDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<LaborTeam | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [present, setPresent] = useState<number>(0);
  const [absent, setAbsent] = useState<number>(0);
  const queryClient = useQueryClient();
  const attendanceExists = selectedTeam?.attendanceRecords?.some(
    (r) =>
      r.date && new Date(r.date).toISOString().split("T")[0] === attendanceDate,
  );

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErr,
  } = usefetchProjectsForDropdown();

  const {
    data: teams = [],
    isLoading: laborTeamsLoading,
    isError: laborTeamsError,
    error: laborTeamsErr,
  } = useLaborTeams();

  useEffect(() => {
    if (!selectedTeam) return;

    const safePresent = Math.min(Math.max(present, 0), selectedTeam.members);

    setAbsent(selectedTeam.members - safePresent);
  }, [present, selectedTeam]);

  const form = useForm<LaborTeamFormValues>({
    resolver: zodResolver(laborTeamSchema),
    defaultValues: {
      type: "Masonry",
      members: 1,
      wage: 800,
      project: "",
      contact: "",
    },
  });

  const createSubmit = useMutation({
    mutationFn: async (data: LaborTeamFormValues) => {
      const { data: res } = await axios.post(
        `${import.meta.env.VITE_URL}/api/labor`,
        data,
        { withCredentials: true },
      );
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["laborTeams"] });
      toast.success(data.message || "Labor team added successfully");
      form.reset();
      setAddDialogOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
      console.error("Axios POST error:", error);
    },
  });

  const createdAttendance = useMutation({
    mutationFn: async () => {
      const payload = {
        date: attendanceDate,
        present,
        absent,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/labor/${selectedTeam?._id}/attendance`,
        payload,
        { withCredentials: true },
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Attendance recorded successfully");

      // 🔥 refetch teams so table updates instantly
      queryClient.invalidateQueries({ queryKey: ["laborTeams"] });

      setAttendanceDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to record attendance",
      );
    },
  });

  // Reset present/absent when selectedTeam changes

  if (laborTeamsError) {
    console.error("Failed to fetch labor teams:", laborTeamsErr);
    toast.error(laborTeamsErr?.message || "Could not load labor teams");
    return null;
  }
  if (projectsError) {
    console.error("Failed to fetch projects:", projectsErr);
    toast.error(projectsErr?.message || "Could not load projects");
    return null;
  }

  if (laborTeamsLoading) return <CircleLoader />;

  const handleSaveAttendance = () => {
    if (!selectedTeam) return;
    if (present < 0 || present > selectedTeam.members) {
      toast.error("Present count cannot exceed total members");
      return;
    }
    createdAttendance.mutate();
  };

  const handleSubmit = (data: LaborTeamFormValues) => {
    createSubmit.mutate(data);
  };

  const viewTeam = (team: LaborTeam) => {
    setSelectedTeam(team);
    setViewTeamDialogOpen(true);
  };

  const viewAttendance = (team: LaborTeam) => {
    setSelectedTeam(team);
    setAttendanceDialogOpen(true);
  };

  const getProjectDisplay = (team: LaborTeam) => {
    if (typeof team.project === "string") return team.project;
    const p = team.project;
    const name =
      (typeof p?.projectId === "object" && p?.projectId?.projectName) ||
      "Unknown Project";
    const floor =
      (typeof p?.floorUnit === "object" && p?.floorUnit?.floorNumber) || "N/A";
    const plot = (typeof p?.unit === "object" && p?.unit?.plotNo) || "N/A";
    return `${name} / Floor ${floor} / Plot ${plot}`;
  };

  const filteredTeams = teams.filter((team) =>
    [team.name, team.supervisor, team.type, getProjectDisplay(team)].some(
      (field) => field?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const totalTeams = teams.length;
  const activeTeams = teams.filter((t) => t.status === "Active").length;
  const totalWorkers = teams.reduce((acc, t) => acc + t.members, 0);
  const averageAttendance =
    teams.reduce((acc, t) => acc + (t.attendancePercentage || 0), 0) /
    (teams.length || 1);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{totalTeams}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTeams} active, {totalTeams - activeTeams} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {totalTeams} teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageAttendance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams, supervisors, projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Labor Team
        </Button>
      </div>

      {/* Table - Desktop */}
      <div className="border rounded-md">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Daily Wage (₹)</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No labor teams found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeams.map((team) => (
                  <TableRow key={team._id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{team.supervisor}</TableCell>
                    <TableCell>{team.type}</TableCell>
                    <TableCell>{team.members}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                        {team.wage}
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-[150px] truncate"
                      title={getProjectDisplay(team)}
                    >
                      {getProjectDisplay(team)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          team.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {team.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewTeam(team)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewAttendance(team)}
                        >
                          Attendance
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-4 p-2">
          {filteredTeams.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              No labor teams found.
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team._id}
                className="border rounded-lg p-4 shadow-sm space-y-2 bg-white"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{team.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      team.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Supervisor:</span>{" "}
                  {team.supervisor}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {team.type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Workers:</span> {team.members}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium mr-1">Daily Wage:</span>
                  <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                  {team.wage}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  <span className="font-medium">Project:</span>{" "}
                  {getProjectDisplay(team)}
                </p>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewTeam(team)}
                  >
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewAttendance(team)}
                  >
                    Attendance
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Labor Team Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] flex flex-col rounded-xl">
          <DialogHeader>
            <DialogTitle>Add New Labor Team</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the details below to add a new labor team.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 max-h-[80vh] overflow-y-auto p-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supervisor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supervisor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "Masonry",
                            "Electrical",
                            "Plumbing",
                            "Carpentry",
                            "Painting",
                            "Flooring",
                            "Welding",
                            "General Labor",
                          ].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="members"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Workers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Wage (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            type="number"
                            placeholder="800"
                            min={0}
                            step="50"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={projectsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                projectsLoading
                                  ? "Loading..."
                                  : "Select project"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => {
                            const projectName =
                              typeof project?.projectId === "object" &&
                              project?.projectId?.projectName
                                ? project?.projectId?.projectName
                                : "Unnamed Project";
                            const floorNumber =
                              typeof project?.floorUnit === "object" &&
                              project?.floorUnit?.floorNumber
                                ? project?.floorUnit?.floorNumber
                                : "No Floor";
                            const plotNo =
                              typeof project?.unit === "object" &&
                              project?.unit?.plotNo
                                ? project?.unit?.plotNo
                                : "No Plot";
                            return (
                              <SelectItem key={project._id} value={project._id}>
                                {`${projectName} / Floor ${floorNumber} / Plot ${plotNo}`}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Any additional information"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createSubmit.isPending}>
                  {createSubmit.isPending ? "Adding..." : "Add Team"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Team Dialog */}
      {selectedTeam && (
        <Dialog open={viewTeamDialogOpen} onOpenChange={setViewTeamDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle>Team Details</DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-sm text-muted-foreground">
              Here you can view the details of the selected team.
            </DialogDescription>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Team Name
                  </h4>
                  <p className="text-base font-medium">{selectedTeam.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Supervisor
                  </h4>
                  <p className="text-base">{selectedTeam.supervisor}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Team Type
                  </h4>
                  <p className="text-base">{selectedTeam.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Number of Workers
                  </h4>
                  <p className="text-base">{selectedTeam.members}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Daily Wage
                  </h4>
                  <p className="text-base flex items-center">
                    <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                    {selectedTeam.wage} per worker
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Daily Cost
                  </h4>
                  <p className="text-base flex items-center">
                    <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                    {(
                      selectedTeam.wage * selectedTeam.members
                    ).toLocaleString()}{" "}
                    total
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Project
                  </h4>
                  <p className="text-base">{getProjectDisplay(selectedTeam)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </h4>
                  <p className="text-base">{selectedTeam.contact}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Average Attendance
                  </h4>
                  <p className="text-base">
                    {selectedTeam.attendancePercentage}%
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h4>
                  <p
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedTeam.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedTeam.status}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setViewTeamDialogOpen(false);
                    setAttendanceDialogOpen(true);
                  }}
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  View Attendance
                </Button>
                <Button
                  type="button"
                  onClick={() => setViewTeamDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Attendance Dialog */}
      {selectedTeam && (
        <Dialog
          open={attendanceDialogOpen}
          onOpenChange={setAttendanceDialogOpen}
        >
          <DialogContent className="w-full sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                Attendance Record - {selectedTeam.name}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className=" text-sm text-muted-foreground">
              Here you can view the details of the selected team.
            </DialogDescription>

            <div className="space-y-4 mt-2">
              {/* Team Info */}
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Supervisor: {selectedTeam.supervisor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Workers: {selectedTeam.members}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Average Attendance: {selectedTeam.attendancePercentage}%
                  </p>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="hidden sm:block border rounded-md overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Daily Cost (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedTeam.attendanceRecords || []).map((record) => {
                      const total = record.present + record.absent;
                      const percentage =
                        total === 0
                          ? 0
                          : Math.round((record.present / total) * 100);

                      const dailyCost = record.present * selectedTeam.wage;

                      return (
                        <TableRow key={record._id}>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{record.present}</TableCell>
                          <TableCell>{record.absent}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span>{percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                              {dailyCost.toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {(selectedTeam.attendanceRecords || []).map((record) => {
                  const total = record.present + record.absent;
                  const percentage =
                    total === 0
                      ? 0
                      : Math.round((record.present / total) * 100);

                  const dailyCost = record.present * selectedTeam.wage;
                  return (
                    <div
                      key={record._id}
                      className="border rounded-md p-4 shadow-sm bg-white"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <Badge className="text-green-600">{percentage}%</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>Present:</strong> {record.present}
                        </div>
                        <div>
                          <strong>Absent:</strong> {record.absent}
                        </div>
                        <div className="flex items-center">
                          <strong className="mr-1">Progress:</strong>
                          <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span>{percentage}%</span>
                        </div>
                        <div className="flex items-center">
                          <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                          <span>{dailyCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Record Attendance Form */}
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-base font-medium">
                  Record Attendance for Today
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendance-date">Date</Label>
                    <Input
                      id="attendance-date"
                      type="date"
                      value={attendanceDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendance-present">Present</Label>
                    <Input
                      id="attendance-present"
                      type="number"
                      value={present}
                      min="0"
                      max={selectedTeam.members}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        if (!selectedTeam) return;

                        const clamped = Math.min(
                          Math.max(value, 0),
                          selectedTeam.members,
                        );

                        setPresent(clamped);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendance-absent">Absent</Label>
                    <Input
                      id="attendance-absent"
                      type="number"
                      value={absent}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    onClick={handleSaveAttendance}
                    disabled={createdAttendance.isPending || attendanceExists}
                  >
                    {attendanceExists
                      ? "Attendance Already Recorded"
                      : createdAttendance.isPending
                        ? "Saving..."
                        : "Save Attendance"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContractorLabor;
