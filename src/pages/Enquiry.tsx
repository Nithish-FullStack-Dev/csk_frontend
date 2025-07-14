import { useState, useEffect } from "react";
import axios from "axios";
import { add, format } from "date-fns";
import {
  Eye,
  UserPlus,
  Edit,
  CalendarIcon,
  Pencil,
  Mail,
  PhoneCall,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getCsrfToken, useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

// --- Interfaces ---
interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  project: string;
  address: string;
  budget: string;
  message: string;
  assignedTo?: string; // Salesperson's ID
  status:
    | "New"
    | "Enquiry"
    | "Assigned"
    | "Follow up"
    | "In Progress"
    | "Closed"
    | "Rejected";
  createdAt: string;
  lastContactDate?: string; // Date string (ISO)
  nextFollowUpDate?: string; // Date string (ISO)
  timeline?: { timestamp: string; note: string }[]; // Array of notes with timestamps
  currentNotes?: string; // Temp field for new notes in dialog
}

interface Salesperson {
  _id: string;
  name: string;
  email: string;
}

const EnquiryManagement = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);

  // Dialog states
  const [viewEnquiryDialogOpen, setViewEnquiryDialogOpen] = useState(false); // For both roles to view
  const [assignEnquiryDialogOpen, setAssignEnquiryDialogOpen] = useState(false); // Admin/Owner only
  const [manageEnquiryDialogOpen, setManageEnquiryDialogOpen] = useState(false); // Sales Manager only

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [assignedSalespersonId, setAssignedSalespersonId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [project, setProject] = useState("");
  const [address, setAddress] = useState("");

  // States for Sales Manager's update dialog
  const [currentLastContactDate, setCurrentLastContactDate] = useState<
    Date | undefined
  >(undefined);
  const [currentNextFollowUpDate, setCurrentNextFollowUpDate] = useState<
    Date | undefined
  >(undefined);
  const [newNote, setNewNote] = useState("");
  type Status =
    | "New"
    | "Enquiry"
    | "Assigned"
    | "Follow up"
    | "In Progress"
    | "Closed"
    | "Rejected";
  const [currentStatus, setCurrentStatus] = useState<Status>("New");

  // --- Role-based permissions ---
  const isAdminOrOwner = user && ["admin", "owner"].includes(user.role);
  const isSalesManager = user && user.role === "sales_manager";

  // ---- Updates the data correctly ----
  useEffect(() => {
    if (selectedEnquiry) {
      setProject(selectedEnquiry?.project);
      setAddress(selectedEnquiry?.address);
    }
  }, [selectedEnquiry]);

  // --- Fetching Data ---
  const fetchEnquiryDetails = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/enquiryForm/getAllEnquirys"
      );

      let filteredData = data;
      if (isSalesManager && user?._id) {
        // Sales Manager only sees enquiries assigned to them
        filteredData = data.filter(
          (enq: Enquiry) => enq.assignedTo === user._id
        );
      } else if (isAdminOrOwner) {
        // Admin/Owner sees all enquiries
        // No additional filtering needed here
      } else {
        // Non-logged in or other roles see nothing, or perhaps public inquiries if applicable
        filteredData = [];
      }
      setEnquiries(filteredData);
    } catch (error) {
      console.error("Failed to load enquiries:", error);
      toast.error("Failed to load enquiries.");
    }
  };

  const fetchSalespersons = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/user/getAllSales"
      );
      setSalespersons(data);
    } catch (error) {
      console.error("Failed to load salespersons:", error);
      toast.error("Failed to load salespersons for assignment.");
    }
  };

  useEffect(() => {
    fetchEnquiryDetails();
    if (isAdminOrOwner) {
      // Only fetch salespersons if admin/owner needs to assign
      fetchSalespersons();
    }
  }, [user, isAdminOrOwner, isSalesManager]); // Added isSalesManager for clarity, though user alone implies it

  // --- Handlers for Actions ---

  // For both roles
  const handleViewEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setViewEnquiryDialogOpen(true);
  };

  // Admin/Owner only
  const handleAssignEnquiryClick = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setAssignedSalespersonId(enquiry.assignedTo || "");
    setAssignEnquiryDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedEnquiry || !assignedSalespersonId) {
      toast.error("Please select a salesperson.");
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const selectedSalesperson = salespersons.find(
        (sp) => sp._id === assignedSalespersonId
      );

      if (!selectedSalesperson) {
        toast.error("Selected salesperson not found.");
        return;
      }

      const payload = {
        assignedTo: selectedSalesperson._id,
        status: "Assigned", // Status changes to Assigned upon assignment
      };

      const { data } = await axios.patch(
        `http://localhost:3000/api/enquiryForm/updateEnquiry/${selectedEnquiry._id}`,
        payload,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      setEnquiries((prevEnquiries) =>
        prevEnquiries.map((enq) =>
          enq._id === selectedEnquiry._id
            ? {
                ...enq,
                ...data.updatedEnquiry,
                assignedTo: selectedSalesperson._id,
                status: "Assigned",
              }
            : enq
        )
      );

      toast.success("Enquiry assigned successfully!");
      setAssignEnquiryDialogOpen(false);
      setSelectedEnquiry(null);
      setAssignedSalespersonId("");
      fetchEnquiryDetails();
    } catch (error) {
      console.error("Failed to assign enquiry:", error);
      toast.error("Failed to assign enquiry.");
    }
  };

  const handleEdit = async () => {
    const payload = {
      ...selectedEnquiry,
      project,
      address,
    };
    try {
      const csrfToken = await getCsrfToken();
      const { data } = await axios.patch(
        `http://localhost:3000/api/enquiryForm/updateEnquiry/${selectedEnquiry._id}`,
        payload,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      setEnquiries((prevEnquiries) =>
        prevEnquiries.map((enq) =>
          enq._id === selectedEnquiry._id
            ? {
                ...enq,
                ...data.updatedEnquiry,
                project,
                address,
              }
            : enq
        )
      );
      setSelectedEnquiry(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to edit enquiry:", error);
      toast.error("Failed to edit enquiry.");
    }
  };

  // Sales Manager only
  const handleManageEnquiryClick = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setCurrentLastContactDate(
      enquiry.lastContactDate ? new Date(enquiry.lastContactDate) : undefined
    );
    setCurrentNextFollowUpDate(
      enquiry.nextFollowUpDate ? new Date(enquiry.nextFollowUpDate) : undefined
    );
    setNewNote(""); // Clear new note field
    setManageEnquiryDialogOpen(true);
  };

  const handleManageSubmit = async () => {
    if (!selectedEnquiry) return;

    try {
      const csrfToken = await getCsrfToken();
      const updatedTimeline = selectedEnquiry.timeline
        ? [...selectedEnquiry.timeline]
        : [];

      if (newNote.trim()) {
        updatedTimeline.push({
          timestamp: new Date().toISOString(),
          note: newNote.trim(),
        });
      }

      const payload = {
        lastContactDate: currentLastContactDate?.toISOString(),
        nextFollowUpDate: currentNextFollowUpDate?.toISOString(),
        timeline: updatedTimeline,
        status: currentStatus, // Sales Manager can now update status
      };

      const { data } = await axios.patch(
        `http://localhost:3000/api/enquiryForm/updateEnquiry/${selectedEnquiry._id}`,
        payload,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      setEnquiries((prevEnquiries) =>
        prevEnquiries.map((enq) =>
          enq._id === selectedEnquiry._id
            ? { ...enq, ...data.updatedEnquiry } // Backend should return updated object
            : enq
        )
      );

      toast.success("Enquiry progress updated successfully!");
      setManageEnquiryDialogOpen(false);
      setSelectedEnquiry(null);
      setCurrentLastContactDate(undefined);
      setCurrentNextFollowUpDate(undefined);
      setNewNote("");
      setCurrentStatus("New"); // Reset status state
    } catch (error) {
      console.error("Failed to update enquiry progress:", error);
      toast.error("Failed to update enquiry progress.");
    }
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: Enquiry["status"]
  ) => {
    try {
      const csrfToken = await getCsrfToken();
      const { data } = await axios.patch(
        `http://localhost:3000/api/enquiryForm/updateEnquiry/${id}`,
        { status: newStatus },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      setEnquiries((prev) =>
        prev.map((enq) =>
          enq._id === id
            ? { ...enq, ...data.updatedEnquiry, status: newStatus }
            : enq
        )
      );
      fetchEnquiryDetails();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // --- Render Logic ---
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-md font-vidaloka">
              {isAdminOrOwner ? "Enquiry Management" : "My Assigned Enquiries"}
            </h1>
            <p className="text-muted-foreground font-sans">
              {isAdminOrOwner
                ? "Track customer enquiries and manage their responses"
                : "Manage and update progress on your assigned customer enquiries"}
            </p>
          </div>
          {isAdminOrOwner && ( // Only Admin/Owner can add new enquiries (if you have that functionality) or assign
            <div className="flex gap-2">
              {/* If you have 'Add New Enquiry' button, place it here for admin/owner */}
            </div>
          )}
        </div>

        <Card>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Name</TableHead>
                    <TableHead className="min-w-[150px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Project</TableHead>
                    <TableHead className="min-w-[120px]">
                      Property type
                    </TableHead>
                    <TableHead className="min-w-[100px]">Budget</TableHead>
                    <TableHead className="min-w-[100px]">Address</TableHead>
                    {isAdminOrOwner && ( // Only Admin/Owner sees these columns
                      <>
                        <TableHead className="min-w-[150px]">
                          Assigned To
                        </TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                      </>
                    )}
                    <TableHead className="min-w-[100px]">Received At</TableHead>
                    {isSalesManager && ( // Sales Manager sees last contact/follow up
                      <>
                        <TableHead className="min-w-[120px]">
                          Last Contact
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Next Follow-up
                        </TableHead>
                      </>
                    )}
                    <TableHead className=" min-w-[120px]">Actions</TableHead>
                    {isSalesManager && <TableHead>Status</TableHead>}
                    {isSalesManager && <TableHead>Edit</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isAdminOrOwner ? 9 : 7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {isSalesManager
                          ? "No enquiries assigned to you."
                          : "No enquiries found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    enquiries.map((enquiry) => (
                      <TableRow key={enquiry._id}>
                        <TableCell className="font-medium">
                          {enquiry.name}
                        </TableCell>
                        <TableCell>{enquiry.email}</TableCell>
                        <TableCell>{enquiry.propertyType}</TableCell>
                        <TableCell>{enquiry.project || "N/A"}</TableCell>
                        <TableCell>{enquiry.budget}</TableCell>
                        <TableCell>{enquiry.address || "N/A"}</TableCell>
                        {isAdminOrOwner && (
                          <>
                            <TableCell>
                              {enquiry.assignedTo
                                ? salespersons.find(
                                    (sp) => sp._id === enquiry.assignedTo
                                  )?.name || "Unknown"
                                : "Unassigned"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  enquiry.status === "New"
                                    ? "bg-blue-100 text-blue-800"
                                    : enquiry.status === "Assigned"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : enquiry.status === "Enquiry"
                                    ? "bg-green-100 text-green-800"
                                    : enquiry.status === "Follow up"
                                    ? "bg-purple-100 text-purple-800"
                                    : enquiry.status === "In Progress"
                                    ? "bg-orange-100 text-orange-800"
                                    : enquiry.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {enquiry.status}
                              </span>
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          {new Date(enquiry.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        {isSalesManager && (
                          <>
                            <TableCell>
                              {enquiry.lastContactDate
                                ? format(
                                    new Date(enquiry.lastContactDate),
                                    "PPP"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {enquiry.nextFollowUpDate
                                ? format(
                                    new Date(enquiry.nextFollowUpDate),
                                    "PPP"
                                  )
                                : "N/A"}
                            </TableCell>
                          </>
                        )}
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEnquiry(enquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdminOrOwner && !enquiry.assignedTo && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-estate-navy hover:bg-estate-navy/90"
                              onClick={() => handleAssignEnquiryClick(enquiry)}
                            >
                              <UserPlus className="h-4 w-4" /> Assign
                            </Button>
                          )}
                          {isSalesManager && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleManageEnquiryClick(enquiry)}
                            >
                              <Edit className="h-4 w-4" /> Manage
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {isSalesManager && (
                            <Select
                              value={enquiry?.status}
                              onValueChange={(value: Enquiry["status"]) =>
                                handleStatusUpdate(enquiry._id, value)
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Only allow relevant status updates from Sales Manager context */}
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Enquiry">Enquiry</SelectItem>
                                <SelectItem value="Assigned">
                                  Assigned
                                </SelectItem>
                                <SelectItem value="Follow up">
                                  Follow up
                                </SelectItem>
                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                                <SelectItem value="Rejected">
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          {isSalesManager && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-estate-navy/75 hover:bg-estate-navy/90"
                              onClick={() => {
                                setSelectedEnquiry(enquiry);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Dialogs --- */}

      {/* View Enquiry Details Dialog (for both Admin/Owner & Sales Manager) */}
      <Dialog
        open={viewEnquiryDialogOpen}
        onOpenChange={setViewEnquiryDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-6">
              {/* Header: Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${selectedEnquiry.name.replace(
                      " ",
                      "+"
                    )}&background=1A365D&color=fff&size=60`}
                  />
                  <AvatarFallback>{selectedEnquiry.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedEnquiry.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEnquiry.propertyType || "Property Interest"} •{" "}
                    {new Date(selectedEnquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Contact & Property Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Contact</p>
                  <div className="text-sm flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedEnquiry.email}</span>
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedEnquiry.phone || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Property Details</p>
                  <div className="text-sm flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedEnquiry.project || "N/A"}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Budget: ₹{selectedEnquiry.budget}
                  </div>
                </div>
              </div>

              {/* Message and Address */}
              <div>
                <p className="text-sm font-medium mb-1">Message</p>
                <p className="text-sm">{selectedEnquiry.message || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Address</p>
                <p className="text-sm">{selectedEnquiry.address || "N/A"}</p>
              </div>

              {/* Status and Assignment (for Admin/Owner) */}
              {isAdminOrOwner && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Assigned To</p>
                    <p className="text-sm">
                      {selectedEnquiry.assignedTo
                        ? salespersons.find(
                            (sp) => sp._id === selectedEnquiry.assignedTo
                          )?.name || "Unknown"
                        : "Unassigned"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Status</p>
                    <p
                      className={`text-sm inline-block px-2 py-1 rounded-full  font-semibold ${
                        selectedEnquiry.status === "New"
                          ? "bg-blue-100 text-blue-800"
                          : selectedEnquiry.status === "Assigned"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedEnquiry.status === "Enquiry"
                          ? "bg-green-100 text-green-800"
                          : selectedEnquiry.status === "Follow up"
                          ? "bg-purple-100 text-purple-800"
                          : selectedEnquiry.status === "In Progress"
                          ? "bg-orange-100 text-orange-800"
                          : selectedEnquiry.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedEnquiry.status}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Last Contact</p>
                  <p className="text-sm">
                    {selectedEnquiry.lastContactDate
                      ? format(new Date(selectedEnquiry.lastContactDate), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Next Follow-up</p>
                  <p className="text-sm">
                    {selectedEnquiry.nextFollowUpDate
                      ? format(
                          new Date(selectedEnquiry.nextFollowUpDate),
                          "PPP"
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-sm font-medium mb-1">Timeline</p>
                <div className="text-sm space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
                  {selectedEnquiry.timeline?.length > 0 ? (
                    selectedEnquiry.timeline.map((entry, index) => (
                      <div
                        key={index}
                        className="border-b pb-1 last:border-b-0"
                      >
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.timestamp), "PPP pp")}
                        </p>
                        <p>{entry.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No timeline entries.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Received At</p>
                <p className="text-sm">
                  {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => setViewEnquiryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Enquiry Dialog (Admin/Owner Only) */}
      {isAdminOrOwner && (
        <Dialog
          open={assignEnquiryDialogOpen}
          onOpenChange={setAssignEnquiryDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Enquiry</DialogTitle>
              <DialogDescription>
                Assign enquiry from <strong>{selectedEnquiry?.name}</strong>{" "}
                (ID: {selectedEnquiry?._id}) to a salesperson.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salesperson" className="text-right">
                  Salesperson
                </Label>
                <Select
                  value={assignedSalespersonId}
                  onValueChange={setAssignedSalespersonId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a Salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    {salespersons.length === 0 ? (
                      <SelectItem disabled value="no-salespersons">
                        No salespersons available
                      </SelectItem>
                    ) : (
                      salespersons.map((sp) => (
                        <SelectItem key={sp._id} value={sp._id}>
                          {sp.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignEnquiryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignSubmit}>Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Enquiry Dialog (Sales Manager Only) */}
      {isSalesManager && (
        <Dialog
          open={manageEnquiryDialogOpen}
          onOpenChange={setManageEnquiryDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px] md:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Enquiry Progress</DialogTitle>
              <DialogDescription>
                Update details for enquiry from{" "}
                <strong>{selectedEnquiry?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            {selectedEnquiry && (
              <div className="grid gap-4 py-4">
                {/* Last Contact Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastContact" className="text-right">
                    Last Contact
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !currentLastContactDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentLastContactDate ? (
                          format(currentLastContactDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentLastContactDate}
                        onSelect={setCurrentLastContactDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Next Follow-up Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nextFollowUp" className="text-right">
                    Next Follow-up
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !currentNextFollowUpDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentNextFollowUpDate ? (
                          format(currentNextFollowUpDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentNextFollowUpDate}
                        onSelect={setCurrentNextFollowUpDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* New Note */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="newNote" className="text-right pt-1">
                    Add Note
                  </Label>
                  <Textarea
                    id="newNote"
                    placeholder="Add a new timeline entry..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                {/* Current Timeline (Read-only in manage dialog) */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right font-medium pt-1">
                    Current Timeline:
                  </Label>
                  <div className="col-span-3 text-sm space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
                    {selectedEnquiry.timeline &&
                    selectedEnquiry.timeline.length > 0 ? (
                      selectedEnquiry.timeline.map((entry, index) => (
                        <div
                          key={index}
                          className="border-b pb-1 last:border-b-0"
                        >
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.timestamp), "PPP pp")}
                          </p>
                          <p>{entry.note}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No timeline entries yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setManageEnquiryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleManageSubmit}>Save Progress</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isSalesManager && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Enquiry Progress</DialogTitle>
              <DialogDescription>
                Update details for enquiry from{" "}
                <strong>{selectedEnquiry?.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            {/* Editable Fields */}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project">Property type</Label>
                <Input
                  id="project"
                  placeholder="Enter project name"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Edit Progress</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default EnquiryManagement;
