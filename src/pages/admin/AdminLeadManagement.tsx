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
  Search,
  MoreHorizontal,
  PhoneCall,
  Mail,
  MapPin,
  ChevronRight,
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
import { useAuth, User } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import { Permission } from "@/types/permission";
import { fetchRolePermissions } from "../UserManagement";
import { AddCustomerDialog } from "../agent/AddCustomerDialog";
import {
  useAvaliableUnits,
  useFloorUnits,
  useProjects,
} from "@/utils/buildings/Projects";
import {
  fetchAllAgents,
  fetchAllCustomer_purchased,
  fetchAllLeads,
  fetchLeads,
  Lead,
  useSaveLead,
  useUpdateLead,
} from "@/utils/leads/LeadConfig";
import { Property } from "@/types/property";
import CircleLoader from "@/components/CircleLoader";
import { Building } from "@/types/building";

const AdminLeadManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { user } = useAuth();

  const {
    data: leadData,
    isLoading,
    isError,
    error,
  } = useQuery<Lead[]>({
    queryKey: ["allLeads"],
    queryFn: fetchAllLeads,
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

  if (isError) {
    toast.error("Failed to fetch leads");
    console.error("Error fetching leads", error);
  }

  if (isRolePermissionsError) {
    console.error("Error fetching role permissions:", rolePermissionsError);
    toast.error("Failed to load role permissions");
  }

  if (isRolePermissionsLoading) {
    return <Loader />;
  }

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
                {isLoading ? (
                  <CircleLoader />
                ) : filteredLeads.length === 0 ? (
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

                    const leadUnit = lead?.unit as Property;
                    const leadProperty = lead?.property as Building;
                    const propertyDisplayName = leadUnit
                      ? `${leadProperty?.projectName} - ${leadUnit.plotNo}`
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
                          {typeof lead?.property === "object" &&
                            lead?.property?.projectName +
                              " / " +
                              propertyDisplayName}
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

                                <DropdownMenuSeparator />
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

                  const leadUnit = lead.unit as Property;
                  const leadProperty = lead?.property as Building;
                  const propertyDisplayName = leadUnit
                    ? `${leadProperty?.projectName} - ${leadUnit?.plotNo}`
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

                {
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
                }

                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminLeadManagement;
