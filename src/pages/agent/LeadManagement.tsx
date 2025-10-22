import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  PhoneCall,
  Mail,
  MapPin,
  FileText,
  ChevronRight,
  Loader2,
  Trash,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Property } from "@/types/property";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import { Permission } from "@/types/permission";
import { fetchRolePermissions } from "../UserManagement";
import {
  useAvaliableUnits,
  useFloorUnits,
  useProjects,
} from "@/utils/buildings/Projects";
import { Label } from "@/components/ui/label";
import {
  fetchAllLeads,
  fetchLeads,
  Lead,
  useDeleteLead,
  useSaveLead,
  useUpdateLead,
} from "@/utils/leads/LeadConfig";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";

const LeadManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [isEditLeadDialogOpen, setIsEditLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState("");
  const { user } = useAuth();

  const [status, setStatus] = useState<Lead["status"] | "">("");
  const [propertyStatus, setPropertyStatus] = useState<
    Lead["propertyStatus"] | ""
  >("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [property, setProperty] = useState("");
  const [unit, setUnit] = useState("");
  const [floorUnit, setFloorUnit] = useState("");
  const [notes, setNote] = useState("");

  const { mutate: submitLead, isPending: loading } = useSaveLead();
  const { mutate: editLead, isPending: updating } = useUpdateLead();
  const { mutate: deleteLead } = useDeleteLead();

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFloorUnit, setSelectedFloorUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isSalesManager = user.role === "sales_manager";
  type LeadInput = Omit<
    Lead,
    "_id" | "lastContact" | "addedBy" | "propertyStatus" | "createdAt"
  >;

  const {
    data: projects,
    isLoading: projectLoading,
    error: dropdownError,
    isError: dropdownIsError,
  } = useProjects();

  const {
    data: floorUnits = [],
    isLoading: floorUnitsLoading,
    isError: floorUnitsError,
    error: floorUnitsErrorMessage,
  } = useFloorUnits(selectedProject);

  const {
    data: unitsByFloor = [],
    isLoading: unitsByFloorLoading,
    isError: unitsByFloorError,
    error: unitsByFloorErrorMessage,
  } = useAvaliableUnits(selectedProject, selectedFloorUnit);

  const {
    data: leadData,
    isLoading,
    isError,
    error,
  } = useQuery<Lead[]>({
    queryKey: [isSalesManager ? "allLeads" : "leads"],
    queryFn: isSalesManager ? fetchAllLeads : fetchLeads,
    staleTime: 0,
  });

  const {
    data: rolePermissions,
    isLoading: isRolePermissionsLoading,
    error: rolePermissionsError,
    isError: isRolePermissionsError,
  } = useQuery<Permission>({
    queryKey: ["rolePermissions", user?.role],
    queryFn: () => fetchRolePermissions(user?.role as string),
    enabled: !!user?.role,
  });

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name);
      setEmail(leadToEdit.email);
      setPhone(leadToEdit.phone);
      setSource(leadToEdit.source);
      setProperty(
        typeof leadToEdit.property === "object"
          ? leadToEdit.property._id
          : leadToEdit.property
      );
      setUnit(
        typeof leadToEdit.unit === "object"
          ? leadToEdit.unit._id
          : leadToEdit.unit
      );
      setFloorUnit(
        typeof leadToEdit.floorUnit === "object"
          ? leadToEdit.floorUnit._id
          : leadToEdit.floorUnit
      );
      setStatus(leadToEdit.status);
      setPropertyStatus(leadToEdit.propertyStatus);
      setNote(leadToEdit.notes);
      setIsEditLeadDialogOpen(true);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setSource("");
      setProperty("");
      setUnit("");
      setFloorUnit("");
      setStatus("");
      setNote("");
    }
  }, [leadToEdit]);

  if (isError) {
    toast.error("Failed to fetch leads");
    console.error("Error fetching leads", error);
  }

  if (isRolePermissionsError) {
    console.error("Error fetching role permissions:", rolePermissionsError);
    toast.error("Failed to load role permissions");
  }

  if (floorUnitsError) {
    console.log("Failed to load floor units. Please try again.");
    toast.error(floorUnitsErrorMessage.message);
    return null;
  }

  if (unitsByFloorError) {
    console.log("Failed to load units. Please try again.");
    toast.error(unitsByFloorErrorMessage.message);
    return null;
  }

  if (dropdownIsError) {
    console.log("Failed to load dropdown data. Please try again.");
    toast.error(dropdownError.message);
    return null;
  }

  if (isLoading || isRolePermissionsLoading) {
    return <Loader />;
  }

  const userCanAddUser = rolePermissions?.permissions.some(
    (per) => per.submodule === "Lead Management" && per.actions.write
  );
  const userCanEditUser = rolePermissions?.permissions.some(
    (per) => per.submodule === "Lead Management" && per.actions.edit
  );
  const userCanDeleteUser = rolePermissions?.permissions.some(
    (per) => per.submodule === "Lead Management" && per.actions.delete
  );

  const filteredLeads = (leadData || []).filter((lead: Lead) => {
    const leadPropertyId =
      typeof lead.property === "object" ? lead.property?._id : lead.property;
    const leadUnit = lead.unit as Property;
    const propertySearchName = leadUnit
      ? `${leadUnit.projectName} - ${leadUnit.plotNo}`
      : leadPropertyId || "";

    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertySearchName.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && lead.status === activeTab;
  });

  const handleSaveLead = async () => {
    if (
      !name ||
      !email ||
      !source ||
      !status ||
      !phone ||
      !selectedProject ||
      !selectedFloorUnit ||
      !selectedUnit
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    const payload: LeadInput = {
      name,
      email,
      source,
      property: selectedProject,
      floorUnit: selectedFloorUnit,
      unit: selectedUnit,
      status: status as Lead["status"],
      notes,
      phone,
    };
    submitLead(payload, {
      onSuccess: () => {
        toast.success("Lead saved successfully!");
        queryClient.invalidateQueries({
          queryKey: isSalesManager ? ["allLeads"] : ["leads"],
          refetchType: "active",
        });
        setIsAddLeadDialogOpen(false);
        setName("");
        setEmail("");
        setSource("");
        setProperty("");
        setUnit("");
        setFloorUnit("");
        setStatus("");
        setNote("");
        setPhone("");
        setSelectedProject("");
        setSelectedFloorUnit("");
        setSelectedUnit("");
      },
      onError: (err) => {
        toast.error(err.message);
        console.error(err);
      },
    });
  };

  const handleUpdateLead = async () => {
    if (!leadToEdit) return;
    if (
      !name ||
      !email ||
      !source ||
      !status ||
      !phone ||
      !property ||
      !unit ||
      !floorUnit
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    const payload: Lead = {
      ...leadToEdit,
      name,
      email,
      source,
      property,
      unit,
      floorUnit,
      status: status as Lead["status"],
      propertyStatus: propertyStatus as Lead["propertyStatus"],
      notes,
      phone,
    };

    editLead(payload, {
      onSuccess: () => {
        toast.success("Lead updated successfully!");
        queryClient.invalidateQueries({
          queryKey: isSalesManager ? ["allLeads"] : ["leads"],
          refetchType: "active",
        });
        setIsEditLeadDialogOpen(false);
        setLeadToEdit(null);
      },
      onError: (err) => {
        toast.error("Failed to update lead.");
        console.error(err);
      },
    });
  };

  const handleDeleteFloor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteLead(leadToDelete, {
      onSuccess: () => {
        toast.success("Lead deleted successfully!");
        queryClient.invalidateQueries({
          queryKey: isSalesManager ? ["allLeads"] : ["leads"],
          refetchType: "active",
        });
        setDeleteDialogOpen(false);
        setLeadToDelete("");
      },
      onError: (err) => {
        toast.error("Failed to delete lead.");
        console.error(err);
        setDeleteDialogOpen(false);
        setLeadToDelete("");
      },
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Lead Management</h1>
            <p className="text-muted-foreground">
              Track and manage your sales leads
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog
              onOpenChange={setIsAddLeadDialogOpen}
              open={isAddLeadDialogOpen}
            >
              <DialogTrigger asChild>
                {!isSalesManager && userCanAddUser && (
                  <Button
                    onClick={() => {
                      setLeadToEdit(null);
                      setName("");
                      setEmail("");
                      setPhone("");
                      setSource("");
                      setProperty("");
                      setUnit("");
                      setFloorUnit("");
                      setStatus("");
                      setNote("");
                      setSelectedProject("");
                      setSelectedFloorUnit("");
                      setSelectedUnit("");
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Lead
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Fill in the details below to add a new lead.
                </DialogDescription>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name *
                      </label>
                      <Input
                        id="name"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone *
                      </label>
                      <Input
                        id="phone"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="source" className="text-sm font-medium">
                        Source *
                      </label>
                      <Input
                        id="source"
                        placeholder="Lead source"
                        onChange={(e) => setSource(e.target.value)}
                        value={source}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                      disabled={projectLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            projectLoading
                              ? "Loading projects..."
                              : "Select project"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {projectLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          projects &&
                          projects.map((project, idx) => (
                            <SelectItem
                              key={project._id || idx}
                              value={project._id}
                            >
                              {project.projectName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floorUnit">Floor Units *</Label>
                    <Select
                      value={selectedFloorUnit}
                      onValueChange={setSelectedFloorUnit}
                      disabled={
                        floorUnitsLoading ||
                        !floorUnits ||
                        floorUnits.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            floorUnitsLoading
                              ? "Loading Floor Units..."
                              : !floorUnits || floorUnits.length === 0
                              ? "No floor units available"
                              : "Select Floor Unit"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {floorUnitsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : !floorUnits || floorUnits.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No floor units available
                          </SelectItem>
                        ) : (
                          floorUnits &&
                          floorUnits.map((floor, idx) => (
                            <SelectItem
                              key={floor._id || idx}
                              value={floor._id}
                            >
                              Floor {floor.floorNumber}, {floor.unitType}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Units *</Label>
                    <Select
                      value={selectedUnit}
                      onValueChange={setSelectedUnit}
                      disabled={
                        unitsByFloorLoading ||
                        !unitsByFloor ||
                        unitsByFloor.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            unitsByFloorLoading
                              ? "Loading Units..."
                              : !unitsByFloor || unitsByFloor.length === 0
                              ? "No units available"
                              : "Select Unit"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {unitsByFloorLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : !unitsByFloor || unitsByFloor.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No units available
                          </SelectItem>
                        ) : (
                          unitsByFloor &&
                          unitsByFloor.map((unit, idx) => (
                            <SelectItem key={unit._id || idx} value={unit._id}>
                              Plot {unit.plotNo}, {unit.propertyType}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status *
                    </label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as "hot" | "warm" | "cold" | "")
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">Hot</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="cold">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </label>
                    <Input
                      id="notes"
                      placeholder="Additional notes"
                      onChange={(e) => setNote(e.target.value)}
                      value={notes}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddLeadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLead} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Lead...
                      </>
                    ) : (
                      "Save Lead"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Card>
          <CardHeader className="p-4 pb-0">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Leads</TabsTrigger>
                <TabsTrigger value="hot">Hot</TabsTrigger>
                <TabsTrigger value="warm">Warm</TabsTrigger>
                <TabsTrigger value="cold">Cold</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="hidden sm:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Property
                  </TableHead>
                  <TableHead>Property Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Last Contact
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-2">😕</div>
                        <h1 className="text-lg font-semibold">
                          No Leads Found
                        </h1>
                        <p className="text-sm text-gray-400">
                          Try changing your filters or add a new lead.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const statusColors = {
                      hot: "bg-estate-error/20 text-estate-error",
                      warm: "bg-estate-gold/20 text-estate-gold",
                      cold: "bg-estate-teal/20 text-estate-teal",
                    };
                    const propertyStatusColors: Record<string, string> = {
                      New: "bg-blue-100 text-blue-800",
                      Enquiry: "bg-yellow-100 text-yellow-800",
                      Assigned: "bg-purple-100 text-purple-800",
                      "Follow up": "bg-orange-100 text-orange-800",
                      "In Progress": "bg-indigo-100 text-indigo-800",
                      Closed: "bg-green-100 text-green-800",
                      Rejected: "bg-red-100 text-red-800",
                    };

                    const leadUnit = lead.unit as Property;
                    const propertyDisplayName = leadUnit
                      ? `${leadUnit.propertyType} - ${leadUnit.plotNo}`
                      : "N/A";

                    return (
                      <TableRow key={lead._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?name=${lead.name.replace(
                                  " ",
                                  "+"
                                )}&background=1A365D&color=fff`}
                              />
                              <AvatarFallback>{lead.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {lead.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              statusColors[
                                lead.status as keyof typeof statusColors
                              ]
                            }
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {propertyDisplayName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              propertyStatusColors[
                                lead.propertyStatus as keyof typeof propertyStatusColors
                              ]
                            }
                          >
                            {lead.propertyStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead.lastContact
                            ? formatDistanceToNow(new Date(lead.lastContact), {
                                addSuffix: true,
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <a href={`tel:${lead.phone}`}>
                                  <DropdownMenuItem>
                                    <PhoneCall className="mr-2 h-4 w-4" /> Call
                                  </DropdownMenuItem>
                                </a>
                                <a
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                    lead.email
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" /> Email
                                  </DropdownMenuItem>
                                </a>
                                {!isSalesManager && (
                                  <DropdownMenuItem
                                    onClick={() => navigate("/visits")}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule Visit
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {userCanEditUser && (
                                  <DropdownMenuItem
                                    onClick={() => setLeadToEdit(lead)}
                                  >
                                    <FileText className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {userCanDeleteUser && (
                                  <DropdownMenuItem
                                    onClick={(e) =>
                                      handleDeleteFloor(lead._id, e)
                                    }
                                  >
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <div className="sm:hidden space-y-4 p-4">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">😕</div>
                  <h1 className="text-lg font-semibold">No Leads Found</h1>
                  <p className="text-sm text-gray-400">
                    Try changing your filters or add a new lead.
                  </p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const statusColors = {
                    hot: "bg-estate-error/20 text-estate-error",
                    warm: "bg-estate-gold/20 text-estate-gold",
                    cold: "bg-estate-teal/20 text-estate-teal",
                  };
                  const propertyStatusColors: Record<string, string> = {
                    New: "bg-blue-100 text-blue-800",
                    Enquiry: "bg-yellow-100 text-yellow-800",
                    Assigned: "bg-purple-100 text-purple-800",
                    "Follow up": "bg-orange-100 text-orange-800",
                    "In Progress": "bg-indigo-100 text-indigo-800",
                    Closed: "bg-green-100 text-green-800",
                    Rejected: "bg-red-100 text-red-800",
                  };

                  const leadUnit = lead.unit as Property;
                  const propertyDisplayName = leadUnit
                    ? `${leadUnit.propertyType} - ${leadUnit.plotNo}`
                    : "N/A";

                  return (
                    <div
                      key={lead._id}
                      className="bg-white border rounded-lg shadow p-4 space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${lead.name.replace(
                              " ",
                              "+"
                            )}&background=1A365D&color=fff`}
                          />
                          <AvatarFallback>{lead.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge
                          className={
                            statusColors[
                              lead.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Property:</span>
                        <span>{propertyDisplayName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Property Status:</span>
                        <Badge
                          className={
                            propertyStatusColors[
                              lead.propertyStatus as keyof typeof propertyStatusColors
                            ]
                          }
                        >
                          {lead.propertyStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Last Contact:</span>
                        <span>
                          {lead.lastContact
                            ? formatDistanceToNow(new Date(lead.lastContact), {
                                addSuffix: true,
                              })
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 flex items-center justify-center"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <ChevronRight className="h-4 w-4 mr-1" /> View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 flex items-center justify-center"
                            >
                              <MoreHorizontal className="h-4 w-4 mr-1" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <a href={`tel:${lead.phone}`}>
                              <DropdownMenuItem>
                                <PhoneCall className="mr-2 h-4 w-4" /> Call
                              </DropdownMenuItem>
                            </a>
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                lead.email
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" /> Email
                              </DropdownMenuItem>
                            </a>
                            {!isSalesManager && (
                              <DropdownMenuItem
                                onClick={() => navigate("/visits")}
                              >
                                <Calendar className="mr-2 h-4 w-4" /> Schedule
                                Visit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {userCanEditUser && (
                              <DropdownMenuItem
                                onClick={() => setLeadToEdit(lead)}
                              >
                                <FileText className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            )}
                            {userCanDeleteUser && (
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteFloor(lead._id, e)}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-4">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{filteredLeads.length}</strong> of{" "}
              <strong>{leadData?.length || 0}</strong> leads
            </div>
          </CardFooter>
        </Card>

        {selectedLead && (
          <Dialog
            open={!!selectedLead}
            onOpenChange={() => setSelectedLead(null)}
          >
            <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
              <DialogHeader>
                <DialogTitle>Lead Details</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                View the details of the selected lead.
              </DialogDescription>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${selectedLead.name.replace(
                        " ",
                        "+"
                      )}&background=1A365D&color=fff&size=60`}
                    />
                    <AvatarFallback>{selectedLead.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{selectedLead.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedLead.source} • Added on{" "}
                      {format(new Date(selectedLead.lastContact), "PPP")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Contact Information</p>
                    <div className="text-sm flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Property Interest</p>
                    <div className="text-sm flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {(() => {
                          const leadUnit = selectedLead.unit as Property;
                          return leadUnit
                            ? `${leadUnit.propertyType} - ${leadUnit.plotNo}`
                            : "N/A";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {isSalesManager && (
                  <div>
                    <p className="text-sm font-medium mb-1">Lead Added By</p>
                    <p className="text-sm">
                      Name: {selectedLead?.addedBy?.name}
                    </p>
                    <p className="text-sm">
                      Email: {selectedLead?.addedBy?.email}
                    </p>
                    <p className="text-sm">
                      Added on:{" "}
                      {new Date(selectedLead?.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          year: "numeric",
                          month: "short",
                        }
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Close
                </Button>
                {!isSalesManager && (
                  <Button onClick={() => navigate("/visits")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Site Visit
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {leadToEdit && (
          <Dialog
            open={isEditLeadDialogOpen}
            onOpenChange={setIsEditLeadDialogOpen}
          >
            <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
              <DialogHeader>
                <DialogTitle>Edit Lead</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Edit the details of the selected lead.
              </DialogDescription>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="editName" className="text-sm font-medium">
                      Name *
                    </label>
                    <Input
                      id="editName"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="editEmail" className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="editEmail"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="editPhone" className="text-sm font-medium">
                      Phone *
                    </label>
                    <Input
                      id="editPhone"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="editSource" className="text-sm font-medium">
                      Source *
                    </label>
                    <Input
                      id="editSource"
                      placeholder="Lead source"
                      onChange={(e) => setSource(e.target.value)}
                      value={source}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select
                    value={property}
                    onValueChange={setProperty}
                    disabled={projectLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          projectLoading
                            ? "Loading projects..."
                            : "Select project"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projectLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        projects &&
                        projects.map((project, idx) => (
                          <SelectItem
                            key={project._id || idx}
                            value={project._id}
                          >
                            {project.projectName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floorUnit">Floor Units *</Label>
                  <Select
                    value={floorUnit}
                    onValueChange={setFloorUnit}
                    disabled={
                      floorUnitsLoading ||
                      !floorUnits ||
                      floorUnits.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          floorUnitsLoading
                            ? "Loading Floor Units..."
                            : !floorUnits || floorUnits.length === 0
                            ? "No floor units available"
                            : "Select Floor Unit"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {floorUnitsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : !floorUnits || floorUnits.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No floor units available
                        </SelectItem>
                      ) : (
                        floorUnits &&
                        floorUnits.map((floor, idx) => (
                          <SelectItem key={floor._id || idx} value={floor._id}>
                            Floor {floor.floorNumber}, {floor.unitType}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Units *</Label>
                  <Select
                    value={unit}
                    onValueChange={setUnit}
                    disabled={
                      unitsByFloorLoading ||
                      !unitsByFloor ||
                      unitsByFloor.length === 0
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          unitsByFloorLoading
                            ? "Loading Units..."
                            : !unitsByFloor || unitsByFloor.length === 0
                            ? "No units available"
                            : "Select Unit"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {unitsByFloorLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : !unitsByFloor || unitsByFloor.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No units available
                        </SelectItem>
                      ) : (
                        unitsByFloor &&
                        unitsByFloor.map((unit, idx) => (
                          <SelectItem key={unit._id || idx} value={unit._id}>
                            Plot {unit.plotNo}, {unit.propertyType}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="editStatus" className="text-sm font-medium">
                    Status *
                  </label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as "hot" | "warm" | "cold" | "")
                    }
                  >
                    <SelectTrigger id="editStatus">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isSalesManager && (
                  <div className="space-y-2">
                    <label
                      htmlFor="editPropertyStatus"
                      className="text-sm font-medium"
                    >
                      Property Status
                    </label>
                    <p className="text-sm text-muted-foreground">
                      When this lead is{" "}
                      <span className="font-medium">closed</span> — no further
                      status updates allowed.
                    </p>
                    <Select
                      disabled={leadToEdit?.propertyStatus === "Closed"}
                      value={propertyStatus}
                      onValueChange={(value: Lead["propertyStatus"]) =>
                        setPropertyStatus(value)
                      }
                    >
                      <SelectTrigger id="editPropertyStatus">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="Follow up">Follow up</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="editNotes" className="text-sm font-medium">
                    Notes
                  </label>
                  <Input
                    id="editNotes"
                    placeholder="Additional notes"
                    onChange={(e) => setNote(e.target.value)}
                    value={notes}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditLeadDialogOpen(false);
                    setLeadToEdit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateLead} disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Changes...
                    </>
                  ) : (
                    "Update Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title={"Delete Lead"}
          description={
            "Are you sure you want to delete this lead? This action cannot be undone."
          }
        />
      </div>
    </MainLayout>
  );
};

export default LeadManagement;
