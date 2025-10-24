import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Users,
  Building,
  CheckSquare,
  Clock,
  Phone,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Star,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import {
  Contractor,
  usefetchContractorDropDown,
  usefetchContractors,
  usefetchProjectsForDropdown,
} from "@/utils/project/ProjectConfig";
import Loader from "@/components/Loader";
import { Label } from "@/components/ui/label";
import { User } from "@/contexts/AuthContext";

const contractors: Contractor[] = [
  {
    _id: "c1",
    name: "John Smith",
    company: "ABC Construction Ltd.",
    specialization: "Structural Works",
    projects: ["Riverside Tower", "Valley Heights"],
    contactPerson: "John Smith",
    phone: "+91 98765 43210",
    email: "john.smith@abcconstruction.com",
    status: "active",
    completedTasks: 28,
    totalTasks: 45,
    rating: 4,
  },
  {
    _id: "c2",
    name: "Rajesh Kumar",
    company: "XYZ Builders",
    specialization: "Masonry Work",
    projects: ["Green Villa"],
    contactPerson: "Rajesh Kumar",
    phone: "+91 87654 32109",
    email: "rajesh@xyzbuilders.com",
    status: "active",
    completedTasks: 15,
    totalTasks: 22,
    rating: 3,
  },
  {
    _id: "c3",
    name: "Amit Patel",
    company: "PowerTech Systems",
    specialization: "Electrical Works",
    projects: ["Valley Heights", "Riverside Tower"],
    contactPerson: "Amit Patel",
    phone: "+91 76543 21098",
    email: "amit@powertechsystems.com",
    status: "active",
    completedTasks: 12,
    totalTasks: 18,
    rating: 5,
  },
  {
    _id: "c4",
    name: "Suresh Reddy",
    company: "Elite Ceramics",
    specialization: "Tiling & Finishing",
    projects: ["Riverside Tower"],
    contactPerson: "Suresh Reddy",
    phone: "+91 65432 10987",
    email: "suresh@eliteceramics.com",
    status: "on_hold",
    completedTasks: 8,
    totalTasks: 15,
    rating: 2,
  },
  {
    _id: "c5",
    name: "David Wilson",
    company: "Top Shelter Inc.",
    specialization: "Roofing",
    projects: ["Valley Heights"],
    contactPerson: "David Wilson",
    phone: "+91 54321 09876",
    email: "david@topshelter.com",
    status: "inactive",
    completedTasks: 0,
    totalTasks: 5,
    rating: 3,
  },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  on_hold: "bg-amber-100 text-amber-800",
  inactive: "bg-gray-100 text-gray-800",
};

const ContractorsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // const [contractors, setContractors] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);
  const [viewTasksDialogOpen, setViewTasksDialogOpen] = useState(false);
  const [contractorTasks, setContractorTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  // const [allProjects, setAllProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contractor: "",
    project: "",
    taskTitle: "",
    deadline: "",
    priority: "medium",
  });

  const {
    data: allProjects = [],
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: projectsDropdownError,
  } = usefetchProjectsForDropdown();

  const {
    data: contractors = [],
    isLoading: isLoadingContractors,
    isError: isErrorContractors,
    error: contractorsDropdownError,
    refetch: refetchContractors,
  } = usefetchContractors();

  const {
    data: contractorDropDown = [],
    isLoading: isLoadingContractorProjects,
    isError: isErrorContractorProjects,
    error: contractorProjectsDropdownError,
  } = usefetchContractorDropDown();

  if (isErrorProjects) {
    console.error(
      "Error fetching projects for dropdown:",
      projectsDropdownError
    );
    toast.error("Error fetching projects for dropdown");
  }
  if (isErrorContractors) {
    console.error("Error fetching contractors:", contractorsDropdownError);
    toast.error("Error fetching contractors");
  }
  if (isErrorContractorProjects) {
    console.error(
      "Error fetching contractor projects:",
      contractorProjectsDropdownError
    );
    toast.error("Error fetching contractor projects");
  }
  if (isLoadingProjects || isLoadingContractors) return <Loader />;

  const projects = Array.from(new Set(contractors.flatMap((c) => c.projects)));

  const filteredContractors = contractors.filter((contractor) => {
    // Apply search query
    const matchesSearch =
      searchQuery === "" ||
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.company.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply specialization filter
    const matchesSpecialization =
      specializationFilter === "" ||
      specializationFilter === "all-specializations" ||
      contractor.specialization === specializationFilter;

    // Apply project filter
    const matchesProject =
      projectFilter === "" ||
      projectFilter === "all-projects" ||
      contractor.projects.includes(projectFilter);

    // Apply status filter
    const matchesStatus =
      statusFilter === "" ||
      statusFilter === "all-statuses" ||
      contractor.status === statusFilter;

    return (
      matchesSearch && matchesSpecialization && matchesProject && matchesStatus
    );
  });

  const specializations = Array.from(
    new Set(contractors.map((c) => c.specialization))
  );

  return (
    <MainLayout>
      <div className="space-y-6 md:p-8 p-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contractors</h1>
          <p className="text-muted-foreground">
            Manage contractors working on your construction sites
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contractors
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractors.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Contractors
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contractors.filter((c) => c.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contractors.reduce(
                  (sum, contractor) =>
                    sum + (contractor.totalTasks - contractor.completedTasks),
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex flex-wrap items-center space-x-0 space-y-2 sm:space-x-2 sm:space-y-0">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contractors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={specializationFilter}
              onValueChange={setSpecializationFilter}
            >
              <SelectTrigger className="w-fit">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>
                    {specializationFilter === "all-specializations" ||
                    !specializationFilter
                      ? "All Specializations"
                      : specializationFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-specializations">
                  All Specializations
                </SelectItem>
                {specializations.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-fit">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  <span>
                    {projectFilter === "all-projects" || !projectFilter
                      ? "All Projects"
                      : projectFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-fit">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>
                    {statusFilter === "all-statuses" || !statusFilter
                      ? "All Statuses"
                      : statusFilter
                          .replace("_", " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setOpenDialog(true)}>
            <Users className="h-4 w-4 mr-2" />
            Add Contractor
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center">
                        Contractor
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead>Rating</TableHead> */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContractors.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No contractors found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContractors.map((contractor) => (
                      <TableRow key={contractor._id}>
                        <TableCell className="font-medium">
                          {contractor.name}
                          <div className="text-xs text-muted-foreground">
                            {contractor.company}
                          </div>
                        </TableCell>
                        <TableCell>{contractor.specialization}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {contractor.projects.map((project, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="max-w-fit"
                              >
                                {project}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              {contractor.phone}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {contractor.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs">
                              {contractor.completedTasks} /{" "}
                              {contractor.totalTasks} Tasks
                            </div>
                            <Progress
                              value={
                                (contractor.completedTasks /
                                  contractor.totalTasks) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusColors[contractor.status]}
                          >
                            {contractor.status === "on_hold"
                              ? "On Hold"
                              : contractor.status.charAt(0).toUpperCase() +
                                contractor.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {/* <TableCell>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < contractor.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </TableCell> */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedContractor(contractor);
                                  setIsContractorDialogOpen(true);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={async () => {
                                  setSelectedContractor(contractor);
                                  setViewTasksDialogOpen(true);
                                  setIsLoadingTasks(true);
                                  try {
                                    const res = await axios.get(
                                      `${
                                        import.meta.env.VITE_URL
                                      }/api/project/site-incharge/${
                                        contractor._id
                                      }/contractor/tasks`,
                                      { withCredentials: true }
                                    );
                                    setContractorTasks(res.data.tasks);
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setIsLoadingTasks(false);
                                  }
                                }}
                              >
                                View Tasks
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => navigate("/messaging")}
                              >
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedContractor(contractor);
                                  setNewStatus(contractor.status);
                                  setStatusDialogOpen(true);
                                }}
                              >
                                Update Status
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem>
                              Performance Report
                            </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden">
              {filteredContractors.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No contractors found matching your filters
                </div>
              ) : (
                <div className="grid gap-4 p-2">
                  {filteredContractors.map((contractor) => (
                    <Card
                      key={contractor._id}
                      className="rounded-xl border shadow-sm p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{contractor.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {contractor.company}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedContractor(contractor);
                                setIsContractorDialogOpen(true);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                setSelectedContractor(contractor);
                                setViewTasksDialogOpen(true);
                                setIsLoadingTasks(true);
                                try {
                                  const res = await axios.get(
                                    `${
                                      import.meta.env.VITE_URL
                                    }/api/project/site-incharge/${
                                      contractor._id
                                    }/contractor/tasks`,
                                    { withCredentials: true }
                                  );
                                  setContractorTasks(res.data.tasks);
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setIsLoadingTasks(false);
                                }
                              }}
                            >
                              View Tasks
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate("/messaging")}
                            >
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedContractor(contractor);
                                setNewStatus(contractor.status);
                                setStatusDialogOpen(true);
                              }}
                            >
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-3 text-sm">
                        <p>
                          <span className="font-semibold">
                            Specialization:{" "}
                          </span>
                          {contractor.specialization}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold">Contact: </span>
                          {contractor.phone}, {contractor.email}
                        </p>
                        <div className="mt-2">
                          <span className="font-semibold">Projects: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contractor.projects.map((project, index) => (
                              <Badge key={index} variant="outline">
                                {project}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-semibold">Progress: </span>
                          <div className="text-xs">
                            {contractor.completedTasks} /{" "}
                            {contractor.totalTasks} Tasks
                          </div>
                          <Progress
                            value={
                              (contractor.completedTasks /
                                contractor.totalTasks) *
                              100
                            }
                            className="h-2 mt-1"
                          />
                        </div>
                        <div className="mt-2">
                          <span className="font-semibold">Status: </span>
                          <Badge
                            variant="outline"
                            className={statusColors[contractor.status]}
                          >
                            {contractor.status === "on_hold"
                              ? "On Hold"
                              : contractor.status.charAt(0).toUpperCase() +
                                contractor.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* ALL YOUR DIALOGS ARE LEFT UNTOUCHED BELOW */}
            {/* -------------------- Add Contractor Dialog -------------------- */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>Add Contractor Details</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Fill in the details below to assign a new contractor to a
                  project.
                </DialogDescription>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      console.log("ADDING........");
                      console.log(formData);
                      const res = await axios.post(
                        `${
                          import.meta.env.VITE_URL
                        }/api/project/site-incharge/ass-contractor`,
                        formData,
                        { withCredentials: true }
                      );
                      if (res) {
                        toast.success("Contractor assigned successfully");
                        setOpenDialog(false);
                        refetchContractors();
                        // optionally reset form
                      } else {
                        toast.error("Failed to assign contractor");
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Something went wrong");
                    }
                  }}
                >
                  <div>
                    <Label htmlFor="contractor">Select Contractor</Label>
                    <Select
                      value={formData.contractor}
                      onValueChange={(value) =>
                        setFormData({ ...formData, contractor: value })
                      }
                    >
                      <SelectTrigger className="w-full border p-2 rounded">
                        <SelectValue placeholder="Select Contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingContractorProjects ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : !contractorDropDown.data ||
                          contractorDropDown.data.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            {contractorDropDown.message ||
                              "No contractors available"}
                          </SelectItem>
                        ) : (
                          contractorDropDown &&
                          contractorDropDown.data?.map(
                            (contractor: User, idx) => (
                              <SelectItem
                                key={contractor?._id || idx}
                                value={contractor?._id}
                              >
                                {contractor?.name}
                              </SelectItem>
                            )
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project">Select Project</Label>

                    <Select
                      value={formData.project}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          project: value,
                        });
                      }}
                    >
                      <SelectTrigger className="w-full border p-2 rounded">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {allProjects.map((proj) => (
                          <SelectItem key={proj._id} value={proj._id}>
                            {typeof proj.projectId === "object"
                              ? proj.projectId?.projectName || "Unnamed Project"
                              : proj.projectId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Task Title Input */}

                  <Input
                    placeholder="Task Title"
                    value={formData.taskTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, taskTitle: e.target.value })
                    }
                  />

                  {/* Deadline Input */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium">
                      Deadline
                    </label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />
                  </div>

                  {/* Priority Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium mt-4">
                      Priority
                    </label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger className="w-full border p-2 rounded">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Contractor</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* -------------------- Update Status Dialog -------------------- */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
                <div className="flex justify-between items-start">
                  <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                  </DialogHeader>
                  {/* <DialogClose asChild>
                                  <Button variant="ghost" size="icon">
                                    <X className="h-5 w-5" />
                                  </Button>
                                </DialogClose> */}
                </div>

                <div className="grid gap-4 mt-4">
                  <div className="flex gap-2 justify-between">
                    {["active", "inactive"].map((status) => (
                      <Button
                        key={status}
                        variant={newStatus === status ? "default" : "outline"}
                        onClick={() => setNewStatus(status)}
                        className="flex-1 capitalize"
                      >
                        {status.replace("_", " ")}
                      </Button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStatusDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await axios.patch(
                            `${import.meta.env.VITE_URL}/api/user/${
                              selectedContractor._id
                            }/status`,
                            {
                              status: newStatus,
                            },
                            { withCredentials: true }
                          );
                          setStatusDialogOpen(false);
                          refetchContractors();
                        } catch (err) {
                          console.error("Failed to update status", err);
                          // Optionally show error toast
                        }
                      }}
                    >
                      Save Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* -------------------- Contractor Details Dialog -------------------- */}
            <Dialog
              open={isContractorDialogOpen}
              onOpenChange={setIsContractorDialogOpen}
            >
              <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>Contractor Details</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Detailed information about the contractor
                </DialogDescription>
                {selectedContractor && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          selectedContractor.avatar ||
                          "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(selectedContractor.name)
                        }
                        alt="Contractor Avatar"
                        className="h-16 w-16 rounded-full border"
                      />
                      <div>
                        <div className="text-lg font-semibold">
                          {selectedContractor.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedContractor.company}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-muted-foreground">
                          Specialization
                        </div>
                        <div>{selectedContractor.specialization}</div>
                      </div>

                      <div>
                        <div className="font-semibold text-muted-foreground">
                          Status
                        </div>
                        <Badge
                          className={statusColors[selectedContractor.status]}
                        >
                          {selectedContractor.status === "on_hold"
                            ? "On Hold"
                            : selectedContractor.status
                                .charAt(0)
                                .toUpperCase() +
                              selectedContractor.status.slice(1)}
                        </Badge>
                      </div>

                      <div>
                        <div className="font-semibold text-muted-foreground">
                          Phone
                        </div>
                        <div>{selectedContractor.phone}</div>
                      </div>

                      <div>
                        <div className="font-semibold text-muted-foreground">
                          Email
                        </div>
                        <div>{selectedContractor.email}</div>
                      </div>

                      <div className="col-span-2">
                        <div className="font-semibold text-muted-foreground mb-1">
                          Projects
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedContractor.projects.map((project, i) => (
                            <Badge key={i} variant="outline">
                              {project}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="font-semibold text-muted-foreground mb-1">
                          Progress
                        </div>
                        <div className="text-xs mb-1">
                          {selectedContractor.completedTasks} /{" "}
                          {selectedContractor.totalTasks} Tasks
                        </div>
                        <Progress
                          value={
                            (selectedContractor.completedTasks /
                              selectedContractor.totalTasks) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* -------------------- View Tasks Dialog -------------------- */}
            <Dialog
              open={viewTasksDialogOpen}
              onOpenChange={setViewTasksDialogOpen}
            >
              <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Tasks of {selectedContractor?.name || "Contractor"}
                  </DialogTitle>
                  <DialogDescription>
                    All assigned tasks under your supervision
                  </DialogDescription>
                </DialogHeader>

                {isLoadingTasks ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Loading tasks...
                  </div>
                ) : contractorTasks.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No tasks assigned yet.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {contractorTasks.map((task, index) => (
                      <Card
                        key={task?._id || index}
                        className="border rounded-lg shadow-sm p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{task?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              <strong>Project:</strong> {task?.projectName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>floorNumber:</strong> {task?.floorNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>unitType:</strong> {task?.unitType}
                            </p>
                            <p className="text-sm">
                              <strong>priority:</strong>{" "}
                              <Badge variant="outline" className="capitalize">
                                {task?.priority}
                              </Badge>
                            </p>
                          </div>
                          <div className="mt-3 sm:mt-0 w-full sm:w-48">
                            <Progress
                              value={task.progressPercentage}
                              className="h-2"
                            />
                            <div className="text-right text-xs mt-1">
                              {task.progressPercentage}% Complete
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContractorsList;
