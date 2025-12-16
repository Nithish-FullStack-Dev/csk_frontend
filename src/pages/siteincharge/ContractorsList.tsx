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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
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
  IndianRupee,
  FileText,
  Edit,
  Trash2,
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
  useContractorList,
  usefetchContractorDropDown,
  usefetchContractorListDropDown,
  usefetchContractors,
  usefetchProjectsForDropdown,
} from "@/utils/project/ProjectConfig";
import Loader from "@/components/Loader";
import { Label } from "@/components/ui/label";
import { useAuth, User } from "@/contexts/AuthContext";
import { set } from "date-fns";
import { CONSTRUCTION_PHASES } from "@/types/construction";
import AddContractorDialog from "./AddContractorDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContractorList } from "@/types/contractor";

const ContractorsList = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);
  const [viewTasksDialogOpen, setViewTasksDialogOpen] = useState(false);
  const [contractorTasks, setContractorTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConDialog, setOpenConDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [editingContractor, setEditingContractor] = useState(null);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contractor: "",
    project: "",
    taskTitle: "",
    deadline: "",
    priority: "medium",
  });
  const [isContractorAdding, setIsContractorAdding] = useState(false);

  const queryClient = useQueryClient();

  const deleteContractorMutation = useMutation({
    mutationFn: async (contractorId) => {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_URL
        }/api/contractor/deleteContractor/${contractorId}`,
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractors-list"] });
      toast.success("Contractor deleted successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete contractor");
    },
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
  } = usefetchContractorListDropDown();

  const {
    data: contractorList,
    isLoading: isLoadingContractorList,
    isError: isErrorContractorList,
    error: contractorListError,
    refetch: refetchContractorList,
  } = useContractorList();

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
  if (isErrorContractorList) {
    console.error("Error fetching contractor List:", contractorListError);
    toast.error(
      contractorListError?.message ?? "Error fetching contractor projects"
    );
  }
  if (isLoadingProjects || isLoadingContractors) return <Loader />;

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      searchQuery === "" ||
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialization =
      specializationFilter === "" ||
      specializationFilter === "all-specializations" ||
      contractor.specialization === specializationFilter;

    const matchesStatus =
      statusFilter === "" ||
      statusFilter === "all-statuses" ||
      contractor.status === statusFilter;

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const specializations = Array.from(
    new Set(contractors.map((c) => c.specialization))
  );

  const handleEdit = (contractor) => {
    setEditingContractor(contractor);
    setOpenConDialog(true);
  };

  const handleDelete = (contractorId) => {
    if (confirm("Are you sure you want to delete this contractor?")) {
      deleteContractorMutation.mutate(contractorId);
    }
  };

  const handleCloseEditDialog = () => {
    setEditingContractor(null);
    setOpenConDialog(false);
  };

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
          <div className="flex flex-wrap items-center space-x-0 space-y-2 sm:space-x-2 sm:space-y-0 md:gap-4">
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
                {specializations?.map((specialization, index) => {
                  if (!specialization || specialization.trim() === "")
                    return null;

                  return (
                    <SelectItem key={index} value={specialization}>
                      {specialization}
                    </SelectItem>
                  );
                })}
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="contractorlist">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="contractorlist">
                  Contractor List
                </TabsTrigger>
                {user.role !== "accountant" && (
                  <TabsTrigger value="assignedcontractor">
                    Assigned Contractors
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="assignedcontractor">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Assigned Contractors</h2>
                    <Button onClick={() => setOpenDialog(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Assign Contractor
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <div className="overflow-x-auto rounded-md border">
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
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContractors.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-6 text-muted-foreground"
                              >
                                No contractors found matching your filters
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredContractors.map((contractor) => (
                              <TableRow key={contractor._id}>
                                <TableCell className="font-medium">
                                  {contractor?.name}
                                  <div className="text-xs text-muted-foreground">
                                    Status: {contractor?.status}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {contractor.specialization || "General"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1.5">
                                    {contractor?.projects?.length === 0 && (
                                      <span className="text-xs text-muted-foreground">
                                        No projects assigned
                                      </span>
                                    )}
                                    {contractor?.projects?.map(
                                      (project, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {project.projectName} — F
                                          {project.floorNumber}/U
                                          {project.unitType}
                                        </Badge>
                                      )
                                    )}
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
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                      >
                                        <span className="sr-only">
                                          Open menu
                                        </span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
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
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="block md:hidden space-y-4">
                    {filteredContractors.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No contractors found matching your filters
                      </div>
                    ) : (
                      filteredContractors.map((contractor) => (
                        <Card
                          key={contractor._id}
                          className="p-4 rounded-xl border shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {contractor.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {contractor?.status}
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

                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-medium">
                                Specialization:{" "}
                              </span>
                              {contractor.specialization || "General"}
                            </p>
                            <p>
                              <span className="font-medium">Contact: </span>
                              {contractor.phone}, {contractor.email}
                            </p>
                            <div>
                              <span className="font-medium">Projects: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {contractor?.projects?.map((project, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {project.projectName} — F
                                    {project.floorNumber} / U{project.unitType}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Progress: </span>
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
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contractorlist">
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Contractor List</h2>
                    <Button
                      onClick={() => {
                        setEditingContractor(null);
                        setOpenConDialog(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Add Contractor
                    </Button>
                  </div>
                  {isLoadingContractorList ? (
                    <Loader />
                  ) : (
                    <>
                      <div className="hidden md:block">
                        <div className="overflow-x-auto border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Company Name</TableHead>
                                <TableHead>GST Number</TableHead>
                                <TableHead>Contractor Type</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Amount (₹)</TableHead>
                                <TableHead>Advance (₹)</TableHead>
                                <TableHead>Balance (₹)</TableHead>
                                <TableHead>Work Details</TableHead>
                                <TableHead>Bill No.</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Billed Date</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {contractorList?.data?.map((contractor) => (
                                <TableRow key={contractor._id}>
                                  <TableCell className="font-medium">
                                    {contractor.companyName}
                                  </TableCell>
                                  <TableCell>{contractor.gstNumber}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {contractor.contractorType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {(typeof contractor?.userId === "object" &&
                                      contractor?.userId?.phone) ||
                                      "—"}
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {(typeof contractor?.userId === "object" &&
                                      contractor?.userId?.email) ||
                                      "—"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ₹{(contractor.amount ?? 0).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-green-600">
                                    ₹
                                    {(
                                      contractor.advancePaid ?? 0
                                    ).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-red-600">
                                    ₹
                                    {(
                                      contractor.balancePaid ?? 0
                                    ).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="max-w-md">
                                    {contractor.workDetails || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {contractor.billInvoiceNumber || "—"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        contractor.isActive
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {contractor.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {contractor.billedDate
                                      ? new Date(
                                          contractor.billedDate
                                        ).toLocaleDateString()
                                      : "—"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          className="h-8 w-8 p-0"
                                        >
                                          <span className="sr-only">
                                            Open menu
                                          </span>
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                          onClick={() => handleEdit(contractor)}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDelete(contractor._id)
                                          }
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <div className="md:hidden space-y-4">
                        {contractorList?.data?.map((contractor) => (
                          <Card key={contractor._id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                  <span>{contractor.companyName}</span>
                                </CardTitle>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(contractor)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(contractor._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                                <Badge
                                  variant={
                                    contractor.isActive
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {contractor.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="font-medium">GST:</span>
                                <span>{contractor.gstNumber}</span>
                                <span className="font-medium">Type:</span>
                                <span>{contractor.contractorType}</span>
                                <span className="font-medium">Phone:</span>
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {(typeof contractor?.userId === "object" &&
                                    contractor?.userId?.phone) ||
                                    "—"}
                                </span>
                                <span className="font-medium">Email:</span>
                                <span className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {(typeof contractor?.userId === "object" &&
                                    contractor?.userId?.email) ||
                                    "—"}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm border-t pt-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    Total Amount:
                                  </span>
                                  <span>
                                    ₹{(contractor.amount ?? 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Advance:</span>
                                  <span>
                                    ₹
                                    {(
                                      contractor.advancePaid ?? 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Balance:</span>
                                  <span>
                                    ₹
                                    {(
                                      contractor.balancePaid ?? 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    Billed Date:
                                  </span>
                                  <span>
                                    {contractor.billedDate
                                      ? new Date(
                                          contractor.billedDate
                                        ).toLocaleDateString()
                                      : "—"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Work:</span>{" "}
                                {contractor.workDetails || "—"}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Bill No:</span>{" "}
                                {contractor.billInvoiceNumber || "—"}
                              </div>
                              {contractor?.billCopy && (
                                <div className="pt-2">
                                  <a
                                    href={contractor.billCopy}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 hover:underline text-sm"
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    View Bill
                                  </a>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}

                  {contractorList?.data?.length === 0 && (
                    <Card className="text-center py-12">
                      <CardContent>
                        <p className="text-muted-foreground">
                          No contractors found.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <AddContractorDialog
              openDialog={openConDialog}
              setOpenConDialog={handleCloseEditDialog}
              contractor={editingContractor}
              mode={editingContractor ? "edit" : "add"}
            />

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
                      setIsContractorAdding(true);
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
                      } else {
                        toast.error("Failed to assign contractor");
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Something went wrong");
                    } finally {
                      setIsContractorAdding(false);
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
                            (contractor: ContractorList, idx) => (
                              <SelectItem
                                key={
                                  (typeof contractor?.userId === "object" &&
                                    contractor?.userId?._id) ||
                                  idx
                                }
                                value={
                                  (typeof contractor?.userId === "object" &&
                                    contractor?.userId?._id) ||
                                  idx
                                }
                              >
                                {typeof contractor?.userId === "object" &&
                                  contractor?.userId?.name}
                              </SelectItem>
                            )
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                      required
                      disabled={isLoadingProjects}
                    >
                      <SelectTrigger id="project">
                        <SelectValue
                          placeholder={
                            isLoadingProjects ? "Loading..." : "Select project"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingProjects ? (
                          <SelectLabel>Loading...</SelectLabel>
                        ) : (
                          allProjects?.map((p: any) => (
                            <SelectItem key={p?._id} value={p?._id}>
                              {p.projectId?.projectName +
                                " floor no: " +
                                p?.floorUnit?.floorNumber +
                                " unit: " +
                                p?.unit?.plotNo || "Unnamed Project"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Input
                    placeholder="Task Title"
                    value={formData.taskTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, taskTitle: e.target.value })
                    }
                  />

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
                    <Button type="submit" disabled={isContractorAdding}>
                      {isContractorAdding
                        ? "Adding Contractor..."
                        : "Add Contractor"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
                <div className="flex justify-between items-start">
                  <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                  </DialogHeader>
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
                            { status: newStatus },
                            { withCredentials: true }
                          );
                          setStatusDialogOpen(false);
                          refetchContractors();
                        } catch (err) {
                          console.error("Failed to update status", err);
                        }
                      }}
                    >
                      Save Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            selectedContractor.name
                          )}`
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
                        <div>
                          {selectedContractor.specialization || "General"}
                        </div>
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
                            <div
                              key={i}
                              className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 w-fit"
                            >
                              {project.projectName} — Floor{" "}
                              {project.floorNumber}, Unit {project.unitType}
                            </div>
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
