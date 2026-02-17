import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LandPlot,
  LandPlotIcon,
} from "lucide-react";
import { format } from "date-fns";
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
import {
  useAvaliableUnits,
  useFloorUnits,
  useOPenLand,
  useOpenPlots,
  useProjects,
} from "@/utils/buildings/Projects";
import { Label } from "@/components/ui/label";
import {
  fetchAllLeads,
  fetchLeads,
  Lead,
  useDeleteLead,
  useSaveLead,
  useUpdatePropertyLead,
} from "@/utils/leads/LeadConfig";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { Building } from "@/types/building";
import { fetchRolePermissions } from "@/utils/units/Methods";
import OpenPlotLeadDialog from "./OpenPlotLeadDialog";
import OpenPlotLeadsTable from "./OpenPlotLeadsTable";
import OpenLandLeadsTable from "./OpenLandLeadsTable";
import PropertyLeadsTab from "./PropertyLeadsTab";
import OpenLandLeadDialog from "./OpenLandLeadDialog";

const LeadManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [isEditLeadDialogOpen, setIsEditLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState("");
  const { user } = useAuth();

  const [propertyLeadToEdit, setPropertyLeadToEdit] = useState<Lead | null>(
    null,
  );
  const [plotLeadToEdit, setPlotLeadToEdit] = useState<Lead | null>(null);
  const [landLeadToEdit, setLandLeadToEdit] = useState<Lead | null>(null);
  const [isPropertyEditOpen, setIsPropertyEditOpen] = useState(false);

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
  const { mutate: updatePropertyLead, isPending: updating } =
    useUpdatePropertyLead();
  const { mutate: deleteLead } = useDeleteLead();

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFloorUnit, setSelectedFloorUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedOpenLand, setSelectedOpenLand] = useState("");
  const [selectedOpenPlot, setSelectedOpenPlot] = useState("");
  const [isOpenPlotLead, setIsOpenPlotLead] = useState(false);
  const [isOpenLandLead, setIsOpenLandLead] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("property");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLeadFormOpen = isAddLeadDialogOpen || isEditLeadDialogOpen;

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
  } = useProjects(isLeadFormOpen);

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
    queryKey: [
      "lead-management",
      user?._id,
      user?.role,
      isSalesManager ? "all" : "self",
    ],
    queryFn: () => {
      if (user?.role === "admin" || user?.role === "sales_manager") {
        return fetchAllLeads();
      }
      return fetchLeads(); // agent + team lead RBAC
    },
    enabled: !!user?._id,
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
    if (!propertyLeadToEdit) return;

    const propertyId =
      typeof propertyLeadToEdit.property === "object"
        ? propertyLeadToEdit.property._id
        : propertyLeadToEdit.property;

    const floorUnitId =
      typeof propertyLeadToEdit.floorUnit === "object"
        ? propertyLeadToEdit.floorUnit._id
        : propertyLeadToEdit.floorUnit;

    const unitId =
      typeof propertyLeadToEdit.unit === "object"
        ? propertyLeadToEdit.unit._id
        : propertyLeadToEdit.unit;

    setName(propertyLeadToEdit.name);
    setEmail(propertyLeadToEdit.email);
    setPhone(propertyLeadToEdit.phone);
    setSource(propertyLeadToEdit.source);
    setStatus(propertyLeadToEdit.status);
    setPropertyStatus(propertyLeadToEdit.propertyStatus);
    setNote(propertyLeadToEdit.notes);

    // 🔑 CRITICAL PART
    setProperty(propertyId);
    setSelectedProject(propertyId); // ✅ triggers floorUnits fetch

    setFloorUnit(floorUnitId);
    setSelectedFloorUnit(floorUnitId); // ✅ triggers units fetch

    setUnit(unitId);
  }, [propertyLeadToEdit]);

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
    (per) => per.submodule === "Lead Management" && per.actions.write,
  );
  const userCanEditUser = rolePermissions?.permissions.some(
    (per) => per.submodule === "Lead Management" && per.actions.edit,
  );
  const userCanDeleteUser = rolePermissions?.permissions.some(
    (per) => per.submodule === "Lead Management" && per.actions.delete,
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
      openPlot: null,
      openLand: null,
      isPropertyLead: true,
      isPlotLead: false,
      isLandLead: false,
    };
    submitLead(payload, {
      onSuccess: () => {
        toast.success("Lead saved successfully!");
        queryClient.invalidateQueries({
          queryKey: ["lead-management", user?._id],
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
        setSelectedOpenLand("");
        setSelectedOpenPlot("");
      },
      onError: (err) => {
        toast.error(err.message);
        console.error(err);
      },
    });
  };

  const handleUpdateLead = () => {
    if (!propertyLeadToEdit) return;

    if (
      !name ||
      !email ||
      !phone ||
      !source ||
      !status ||
      !property ||
      !floorUnit ||
      !unit
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    updatePropertyLead(
      {
        _id: propertyLeadToEdit._id,

        name,
        email,
        phone,
        source,
        status: status as Lead["status"],
        propertyStatus: propertyStatus as Lead["propertyStatus"],
        notes,

        property,
        floorUnit,
        unit,

        isPropertyLead: true,
        isPlotLead: false,
        isLandLead: false,
      } as const,
      {
        onSuccess: () => {
          toast.success("Lead updated successfully!");
          setIsPropertyEditOpen(false);
          setPropertyLeadToEdit(null);
        },
        onError: () => toast.error("Failed to update lead"),
      },
    );
  };

  const handleEditLead = (lead: Lead) => {
    if (lead.isPropertyLead) {
      setPropertyLeadToEdit(lead);
      setIsPropertyEditOpen(true);
      return;
    }

    if (lead.isPlotLead) {
      setPlotLeadToEdit(lead);
      setIsOpenPlotLead(true);
      return;
    }

    if (lead.isLandLead) {
      setLandLeadToEdit(lead);
      setIsOpenLandLead(true);
    }
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
          queryKey: ["lead-management", user?._id],
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
  const propertyLeads = filteredLeads.filter(
    (lead) => lead.isPropertyLead === true,
  );
  const plotLeads = filteredLeads.filter((lead) => lead.isPlotLead === true);

  const landLeads = filteredLeads.filter((lead) => lead.isLandLead === true);

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
                      setPropertyLeadToEdit(null);
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
                        maxLength={10}
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
                              Plot {unit.plotNo}
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
            <Button onClick={() => setIsOpenPlotLead(true)}>
              <LandPlot /> Add Open Plot Lead
            </Button>
            <Button onClick={() => setIsOpenLandLead(true)}>
              <LandPlotIcon /> Add Open Land Lead
            </Button>
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

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          {/* Mobile: Select */}
          <div className="md:hidden">
            <Select value={selectedTab} onValueChange={setSelectedTab}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="property">Property Leads</SelectItem>
                <SelectItem value="plot">Open Plot Leads</SelectItem>
                <SelectItem value="land">Open Land Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsList className="hidden md:grid grid-cols-3 w-full">
            <TabsTrigger value="property">Property Leads</TabsTrigger>
            <TabsTrigger value="plot">Open Plot Leads</TabsTrigger>
            <TabsTrigger value="land">Open Land Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="property">
            <PropertyLeadsTab
              filteredLeads={propertyLeads}
              leadData={leadData || []}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setSelectedLead={setSelectedLead}
              onEdit={handleEditLead}
              handleDeleteFloor={handleDeleteFloor}
              isSalesManager={isSalesManager}
              userCanEditUser={userCanEditUser}
              userCanDeleteUser={userCanDeleteUser}
            />
          </TabsContent>
          <TabsContent value="plot">
            <OpenPlotLeadsTable
              leads={plotLeads}
              handleDeleteLead={handleDeleteFloor}
              onEdit={handleEditLead}
              setSelectedLead={setSelectedLead}
              userCanDeleteUser={userCanDeleteUser}
              userCanEditUser={userCanEditUser}
            />
          </TabsContent>

          <TabsContent value="land">
            <OpenLandLeadsTable
              leads={landLeads || []}
              setSelectedLead={setSelectedLead}
              onEdit={handleEditLead}
              handleDeleteLead={handleDeleteFloor}
              userCanEditUser={userCanEditUser}
              userCanDeleteUser={userCanDeleteUser}
            />
          </TabsContent>
        </Tabs>

        {selectedLead && (
          <Dialog
            open={!!selectedLead}
            onOpenChange={() => setSelectedLead(null)}
          >
            <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-y-scroll rounded-xl">
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
                        "+",
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
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Interest Details</p>
                    {renderLeadInterest(selectedLead)}
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
                        },
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

        {propertyLeadToEdit && (
          <Dialog
            open={isPropertyEditOpen}
            onOpenChange={setIsPropertyEditOpen}
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
                    disabled={!selectedProject || floorUnitsLoading}
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
                    disabled={!selectedFloorUnit || unitsByFloorLoading}
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
                            Plot {unit.plotNo}
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
                      disabled={propertyLeadToEdit?.propertyStatus === "Closed"}
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
                    setIsPropertyEditOpen(false);
                    setPropertyLeadToEdit(null);
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
        <OpenPlotLeadDialog
          open={isOpenPlotLead}
          mode={plotLeadToEdit ? "edit" : "create"}
          lead={plotLeadToEdit}
          onClose={() => {
            setIsOpenPlotLead(false);
            setPlotLeadToEdit(null);
          }}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["lead-management"] })
          }
        />
        <OpenLandLeadDialog
          open={isOpenLandLead}
          mode={landLeadToEdit ? "edit" : "create"}
          lead={landLeadToEdit}
          onClose={() => {
            setIsOpenLandLead(false);
            setLandLeadToEdit(null);
          }}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["lead-management"] })
          }
        />
      </div>
    </MainLayout>
  );
};

export default LeadManagement;

const renderLeadInterest = (lead: Lead) => {
  /* ---------- PROPERTY LEAD ---------- */
  if (lead.isPropertyLead) {
    const property = lead.property as Building;
    const unit = lead.unit as Property;

    return (
      <>
        <DetailRow
          label="Property"
          value={`${property?.projectName} - ${unit?.plotNo}`}
        />
        <DetailRow label="Property Type" value={property?.propertyType} />
      </>
    );
  }

  /* ---------- OPEN PLOT LEAD ---------- */
  if (lead.isPlotLead) {
    const openPlot = lead.openPlot as any;
    const innerPlot = lead.innerPlot as any;

    return (
      <>
        <DetailRow label="Open Plot Project" value={openPlot?.projectName} />
        <DetailRow label="Open Plot No" value={openPlot?.openPlotNo} />
        <DetailRow label="Inner Plot No" value={innerPlot?.plotNo} />
      </>
    );
  }

  /* ---------- OPEN LAND LEAD ---------- */
  if (lead.isLandLead) {
    const land = lead.openLand as any;

    return (
      <>
        <DetailRow label="Land Name" value={land?.projectName} />
        <DetailRow label="Land Type" value={land?.landType} />
        <DetailRow label="Location" value={land?.location} />
      </>
    );
  }

  return <DetailRow label="Interest" value="N/A" />;
};

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col gap-1">
    <p className="text-sm font-medium">{label}</p>
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <span>{value || "N/A"}</span>
    </div>
  </div>
);
