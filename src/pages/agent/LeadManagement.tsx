import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Filter,
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
  Download,
} from "lucide-react";
import axios from "axios";
import { format, formatDistanceToNow, set } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Property } from "../public/PropertyInterfaces";
import { useAuth, User } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import { AddCustomerDialog, CustomerPayload } from "./AddCustomerDialog";
import { Permission } from "@/types/permission";
import { fetchRolePermissions } from "../UserManagement";

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "hot" | "warm" | "cold";
  source: string;
  property: string | Property;
  propertyStatus:
    | "New"
    | "Assigned"
    | "Follow up"
    | "In Progress"
    | "Closed"
    | "Rejected";
  addedBy: User;
  lastContact: string;
  notes: string;
  createdAt: string;
}

export const fetchLeads = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getLeadsById`,
    { withCredentials: true }
  );
  return data || [];
};

export const fetchAllLeads = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getAllLeads`,
    { withCredentials: true }
  );
  return data.leads || [];
};

const saveLead = async (
  payload: Omit<
    Lead,
    "_id" | "lastContact" | "addedBy" | "propertyStatus" | "createdAt"
  >
) => {
  const dataToSend = {
    ...payload,
    property:
      typeof payload.property === "object"
        ? payload.property._id
        : payload.property,
  };

  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/leads/saveLead`,
    dataToSend,
    { withCredentials: true }
  );
  return data;
};

const saveCustomer = async (payload: CustomerPayload) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/customer/addCustomer`,
    payload,
    { withCredentials: true }
  );
  return data;
};

const updateLead = async (payload: Lead) => {
  const { _id, ...updateData } = payload;
  const dataToSend = {
    ...updateData,
    property:
      typeof updateData.property === "object"
        ? updateData.property._id
        : updateData.property,
  };

  const { data } = await axios.put(
    `${import.meta.env.VITE_URL}/api/leads/updateLead/${_id}`,
    dataToSend,
    { withCredentials: true }
  );
  return data;
};

const fetchAllcustomers = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`
  );
  return data;
};

export const fetchAllAgents = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllAgents`
  );
  return data;
};

const fetchAllCustomer_purchased = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllcustomer_purchased`
  );
  return data;
};

export const useSaveLead = () => {
  return useMutation({
    mutationFn: saveLead,
  });
};

export const useSaveCustomer = () => {
  return useMutation({
    mutationFn: saveCustomer,
  });
};

export const useUpdateLead = () => {
  return useMutation({
    mutationFn: updateLead,
  });
};

const LeadManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [isEditLeadDialogOpen, setIsEditLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const { user } = useAuth();

  // Form states for adding/editing leads
  const [status, setStatus] = useState<Lead["status"] | "">("");
  const [propertyStatus, setPropertyStatus] = useState<
    Lead["propertyStatus"] | ""
  >("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [property, setProperty] = useState(""); // This state should hold the string ID
  const [notes, setNote] = useState("");

  // Form states for the new customer
  const [bookingDate, setBookingDate] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("Down Payment");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [purchasedFromAgent, setPurchasedFromAgent] = useState("");

  const [availableAgents, setAvailableAgents] = useState<User[]>([]);
  const [availableCustomer, setAvailableCustomer] = useState<User[]>([]);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setloading] = useState(false);
  const [updating, setupdating] = useState(false);

  const { mutate: submitLead } = useSaveLead();
  const { mutate: editLead } = useUpdateLead();
  const { mutate: submitCustomer } = useSaveCustomer();
  const isSalesManager = user.role === "sales_manager";
  type LeadInput = Omit<
    Lead,
    "_id" | "lastContact" | "addedBy" | "propertyStatus" | "createdAt"
  >;

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
    data: agents,
    isLoading: agentsLoad,
    isError: agentError,
    error: agentErr,
  } = useQuery<User[]>({
    queryKey: ["agents"],
    queryFn: fetchAllAgents,
    staleTime: 0,
  });

  const {
    data: customer_purchased,
    isLoading: CustomerLoad,
    isError: customerError,
    error: customerErr,
  } = useQuery<User[]>({
    queryKey: ["customer_purchased"],
    queryFn: fetchAllCustomer_purchased,
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

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["available-properties"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_URL}/api/leads/getLeadProp`
      );
      const json = await res.json();
      return json.properties;
    },
  });

  const availableProperties = properties.filter((prop) =>
    ["Available", "Upcoming", "Under Construction"].includes(
      prop.customerInfo?.propertyStatus
    )
  );

  // Effect to populate form fields when a lead is selected for editing
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
      setStatus(leadToEdit.status);
      setPropertyStatus(leadToEdit.propertyStatus);
      setNote(leadToEdit.notes);
      setIsEditLeadDialogOpen(true); // Open the edit dialog
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setSource("");
      setProperty("");
      setStatus("");
      setNote("");
    }
  }, [leadToEdit]);

  useEffect(() => {
    if (agents) setAvailableAgents(agents);
  }, [agents]);

  useEffect(() => {
    if (customer_purchased) setAvailableCustomer(customer_purchased);
  }, [customer_purchased]);

  if (isError) {
    toast.error("Failed to fetch leads");
    console.error("Error fetching leads", error);
  }
  if (agentError) {
    toast.error("Failed to fetch agents");
    console.error("Error fetching agents", agentErr);
  }
  if (customerError) {
    toast.error("Failed to fetch customer");
    console.error("Error fetching customer_purchased", customerErr);
  }

  if (isRolePermissionsError) {
    console.error("Error fetching role permissions:", rolePermissionsError);
    toast.error("Failed to load role permissions");
  }

  if (isLoading || agentsLoad || CustomerLoad || isRolePermissionsLoading) {
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

  // Filter leads based on search and tab
  const filteredLeads = (leadData || []).filter((lead: Lead) => {
    // Get the property display name for search purposes
    const leadPropertyId =
      typeof lead.property === "object" ? lead.property._id : lead.property;
    const interestedProperty = availableProperties.find(
      (prop) => prop._id === leadPropertyId
    );
    const propertySearchName = interestedProperty
      ? `${interestedProperty.basicInfo.projectName} - ${interestedProperty.basicInfo.plotNumber}`
      : typeof lead.property === "string"
      ? lead.property
      : ""; // Use empty string if it's an object but not found, or not a string

    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertySearchName.toLowerCase().includes(searchTerm.toLowerCase()); // Search by display name or ID if property is string

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && lead.status === activeTab;
  });

  const handleSaveLead = async () => {
    setloading(true);
    if (!name || !email || !source || !status || !phone) {
      toast.error("Please fill all required fields");
      setloading(false);
      return;
    }
    const payload: LeadInput = {
      name,
      email,
      source,
      property,
      status: status as Lead["status"],
      notes,
      phone,
    };
    submitLead(payload, {
      onSuccess: (res) => {
        toast.success("Lead saved successfully!");
        console.log(res.lead);
        queryClient.invalidateQueries({
          queryKey: ["leads"],
          refetchType: "active",
        });
        setIsAddLeadDialogOpen(false); // Close the add dialog
      },
      onError: (err) => {
        toast.error("Failed to save lead.");
        console.error(err);
      },
    });

    // Clear form states after submission attempt
    setName("");
    setEmail("");
    setSource("");
    setProperty("");
    setStatus("");
    setNote("");
    setPhone("");
    setloading(false);
  };

  const handleUpdateLead = async () => {
    if (!leadToEdit) return;
    setupdating(true);
    if (!name || !email || !source || !status || !phone) {
      toast.error("Please fill all required fields");
      setupdating(false);
      return;
    }
    const payload: Lead = {
      ...leadToEdit,
      name,
      email,
      source,
      property,
      status: status as Lead["status"],
      propertyStatus: propertyStatus as Lead["propertyStatus"],
      notes,
      phone,
    };

    editLead(payload, {
      onSuccess: (res) => {
        toast.success("Lead updated successfully!");
        console.log(res.lead);
        queryClient.invalidateQueries({
          queryKey: isSalesManager ? ["allLeads"] : ["leads"],
          refetchType: "active",
        });
        setIsEditLeadDialogOpen(false);
        setLeadToEdit(null); // Clear the lead being edited
      },
      onError: (err) => {
        toast.error("Failed to update lead.");
        console.error(err);
      },
    });
    setupdating(false);
  };

  const handleSaveCustomer = () => {
    const payload: CustomerPayload = {
      user: selectedUser,
      property: selectedProperty,
      bookingDate,
      finalPrice: Number(finalPrice),
      paymentPlan: paymentPlan as "Down Payment" | "EMI" | "Full Payment",
      paymentStatus: paymentStatus as "Pending" | "In Progress" | "Completed",
      purchasedFrom: purchasedFromAgent,
    };
    submitCustomer(payload, {
      onSuccess: (res) => {
        toast.success("Customer saved successfully!");
        setIsAddCustomerDialogOpen(false); // Close the add dialog
      },
      onError: (err) => {
        toast.error("Failed to save customer.");
        console.error(err);
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
            {isSalesManager && (
              <AddCustomerDialog
                isSalesManager={isSalesManager}
                isAddCustomerDialogOpen={isAddCustomerDialogOpen}
                setIsAddCustomerDialogOpen={setIsAddCustomerDialogOpen}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                finalPrice={finalPrice}
                setFinalPrice={setFinalPrice}
                paymentPlan={paymentPlan}
                setPaymentPlan={setPaymentPlan}
                paymentStatus={paymentStatus}
                setPaymentStatus={setPaymentStatus}
                selectedProperty={selectedProperty}
                setSelectedProperty={setSelectedProperty}
                purchasedFromAgent={purchasedFromAgent}
                setPurchasedFromAgent={setPurchasedFromAgent}
                availableProperties={availableProperties}
                availableAgents={availableAgents}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                usersPurchased={availableCustomer}
                handleSaveCustomer={handleSaveCustomer}
              />
            )}

            {/* Add New Lead Dialog */}
            <Dialog
              onOpenChange={setIsAddLeadDialogOpen}
              open={isAddLeadDialogOpen}
            >
              <DialogTrigger asChild>
                {!isSalesManager && userCanAddUser && (
                  <Button
                    onClick={() => {
                      setLeadToEdit(null); // Ensure no lead is in edit mode when adding
                      // Clear form states for new lead
                      setName("");
                      setEmail("");
                      setPhone("");
                      setSource("");
                      setProperty("");
                      setStatus("");
                      setNote("");
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
                  <DialogDescription>
                    Enter the details of the new lead. All fields marked with *
                    are required.
                  </DialogDescription>
                </DialogHeader>
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
                    <label htmlFor="property" className="text-sm font-medium">
                      Property Interest
                    </label>
                    <Select
                      onValueChange={(value) => setProperty(value)}
                      value={property} // Value will be the string ID
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Property" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProperties.map((prop) => (
                          <SelectItem key={prop._id} value={prop._id}>
                            {prop.basicInfo.projectName} -{" "}
                            {prop.basicInfo.plotNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as "hot" | "warm" | "cold" | "")
                      }
                    >
                      <SelectTrigger
                        id="status"
                        className="w-[150px] border px-3 py-2 rounded-md"
                      >
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
                    {loading ? "Saving Lead..." : "Save Lead"}
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
            {/* Desktop Table */}
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

                    // Determine property name
                    const leadPropertyId =
                      typeof lead.property === "object"
                        ? lead.property._id
                        : lead.property;
                    const interestedProperty = availableProperties.find(
                      (prop) => prop._id === leadPropertyId
                    );
                    let propertyDisplayName = "N/A";
                    if (interestedProperty) {
                      propertyDisplayName = `${interestedProperty.basicInfo.projectName} - ${interestedProperty.basicInfo.plotNumber}`;
                    } else if (
                      typeof lead.property === "object" &&
                      "basicInfo" in lead.property
                    ) {
                      propertyDisplayName = `${lead.property.basicInfo.projectName} - ${lead.property.basicInfo.plotNumber}`;
                    } else if (
                      typeof lead.property === "string" &&
                      lead.property
                    ) {
                      propertyDisplayName = lead.property;
                    }

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
                                lead?.status as keyof typeof statusColors
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
                                lead?.propertyStatus as keyof typeof propertyStatusColors
                              ]
                            }
                          >
                            {lead.propertyStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead?.lastContact
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
                                <a href={`tel:${user.phone}`}>
                                  <DropdownMenuItem>
                                    <PhoneCall className="mr-2 h-4 w-4" /> Call
                                  </DropdownMenuItem>
                                </a>
                                <a
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                    user.email
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1"
                                >
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" /> Email
                                  </DropdownMenuItem>
                                </a>
                                {!isSalesManager && (
                                  <DropdownMenuItem
                                    onClick={() => navigate("/visits")}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />{" "}
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

            {/* Mobile Cards */}
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

                  const leadPropertyId =
                    typeof lead.property === "object"
                      ? lead.property._id
                      : lead.property;
                  const interestedProperty = availableProperties.find(
                    (prop) => prop._id === leadPropertyId
                  );
                  let propertyDisplayName = "N/A";
                  if (interestedProperty) {
                    propertyDisplayName = `${interestedProperty.basicInfo.projectName} - ${interestedProperty.basicInfo.plotNumber}`;
                  } else if (
                    typeof lead.property === "object" &&
                    "basicInfo" in lead.property
                  ) {
                    propertyDisplayName = `${lead.property.basicInfo.projectName} - ${lead.property.basicInfo.plotNumber}`;
                  } else if (
                    typeof lead.property === "string" &&
                    lead.property
                  ) {
                    propertyDisplayName = lead.property;
                  }

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
                              lead?.status as keyof typeof statusColors
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
                              lead?.propertyStatus as keyof typeof propertyStatusColors
                            ]
                          }
                        >
                          {lead.propertyStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Last Contact:</span>
                        <span>
                          {lead?.lastContact
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
                              <MoreHorizontal className="h-4 w-4 mr-1" />{" "}
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <PhoneCall className="mr-2 h-4 w-4" /> Call
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" /> Email
                            </DropdownMenuItem>
                            {!isSalesManager && (
                              <DropdownMenuItem
                                onClick={() => navigate("/visits")}
                              >
                                <Calendar className="mr-2 h-4 w-4" /> Schedule
                                Visit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setLeadToEdit(lead)}
                            >
                              <FileText className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
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

        {/* Lead Detail Dialog */}
        {selectedLead && (
          <Dialog
            open={!!selectedLead}
            onOpenChange={() => setSelectedLead(null)}
          >
            <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
              <DialogHeader>
                <DialogTitle>Lead Details</DialogTitle>
                <DialogDescription>
                  You can see the lead details below
                </DialogDescription>
              </DialogHeader>
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
                          // Determine the ID, handling if selectedLead.property is already an object
                          const propertyId =
                            typeof selectedLead.property === "object"
                              ? selectedLead.property._id
                              : selectedLead.property;

                          const interestedProperty = availableProperties.find(
                            (prop) => prop._id === propertyId
                          );

                          if (interestedProperty) {
                            return `${interestedProperty.basicInfo.projectName} - ${interestedProperty.basicInfo.plotNumber}`;
                          } else if (
                            typeof selectedLead.property === "object" &&
                            selectedLead.property !== null &&
                            "basicInfo" in selectedLead.property
                          ) {
                            // If selectedLead.property is already the full object, use its basicInfo
                            return `${selectedLead.property.basicInfo.projectName} - ${selectedLead.property.basicInfo.plotNumber}`;
                          }
                          return "N/A"; // Fallback
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

        {/* Edit Lead Dialog */}
        {leadToEdit && (
          <Dialog
            open={isEditLeadDialogOpen}
            onOpenChange={setIsEditLeadDialogOpen}
          >
            <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
              <DialogHeader>
                <DialogTitle>Edit Lead</DialogTitle>
                <DialogDescription>
                  Update the details for {leadToEdit.name}. All fields marked
                  with * are required.
                </DialogDescription>
              </DialogHeader>
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
                  <label htmlFor="property" className="text-sm font-medium">
                    Property Interest
                  </label>
                  <Select
                    onValueChange={(value) => setProperty(value)}
                    value={property} // Value will be the string ID
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Property" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProperties.map((prop) => (
                        <SelectItem key={prop._id} value={prop._id}>
                          {prop.basicInfo.projectName} -{" "}
                          {prop.basicInfo.plotNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="editStatus" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as "hot" | "warm" | "cold" | "")
                    }
                  >
                    <SelectTrigger
                      id="editStatus"
                      className="w-[150px] border px-3 py-2 rounded-md"
                    >
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
                    <label htmlFor="editStatus" className="text-sm font-medium">
                      Property Status
                    </label>
                    <p className="text-sm text-muted-foreground">
                      when this lead is{" "}
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
                      <SelectTrigger
                        id="editStatus"
                        className="w-[150px] border px-3 py-2 rounded-md"
                      >
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
                    setLeadToEdit(null); // Clear the lead being edited
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateLead} disabled={updating}>
                  {updating ? "Updating Changes..." : "Update Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default LeadManagement;
