import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  UserCircle,
  FileUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Calendar,
  Edit, // Added Edit icon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth, User } from "@/contexts/AuthContext";
import axios from "axios";
import Loader from "@/components/Loader";
import { Customer } from "../CustomerManagement";
import { Property } from "../public/PropertyInterfaces";
import { MAX_VALUE_REG } from "recharts/types/util/ChartUtils";

const queryClient = new QueryClient();

interface Document {
  _id: string;
  docName: string;
  docType: string;
  docOfUser: User;
  uploadedAt: string;
  status: "verified" | "pending_signature" | "requires_update";
  size: string;
  format: string;
  filePath: string;
  uploadedBy: User;
  description?: string;
  property?: Property;
}

// --- API Functions ---
const fetchDocuments = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/document/getAllDocuments`,
    { withCredentials: true }
  );
  return data || [];
};

const fetchAllPurchasedProperties = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/customer/getAllPurchasedProp`,
    { withCredentials: true }
  );
  return data || [];
};

const uploadDocument = async (formData: FormData) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/document/upload`,
    formData,
    { withCredentials: true }
  );
  return data;
};

// New API function for updating a document
const updateDocument = async ({
  id,
  formData,
}: {
  id: string;
  formData: FormData;
}) => {
  console.log(id);
  const { data } = await axios.put(
    `${import.meta.env.VITE_URL}/api/document/updateDocument/${id}`,
    formData,
    { withCredentials: true }
  );
  return data;
};

// Modified fetchAllCustomers to be reusable and not directly depend on useAuth hook
const fetchAllCustomers = async (
  userRole: string | undefined,
  userId: string | undefined
) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`,
    { withCredentials: true }
  );

  if (userRole === "customer_purchased" && userId) {
    const filteredCustomers = data.data.filter(
      (c) => c.user && c.user._id === userId
    );
    return filteredCustomers;
  }
  return data.data;
};

const AgentDocuments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [docPreview, setDocPreview] = useState<Document | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all_docs");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // New state for edit dialog
  const [editingDocument, setEditingDocument] = useState<Document | null>(null); // New state for document being edited
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "",
    userId: user?.role === "customer_purchased" ? user._id : "",
    property: "",
    file: null as File | null,
    description: "",
  });
  const [currentTab, setCurrentTab] = useState("all_docs"); // New state for current tab

  const {
    data: documents,
    isLoading,
    isError,
    error,
  } = useQuery<Document[], Error>({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  });

  const {
    data: purchasedProp,
    isLoading: propLoad,
    isError: propError,
    error: propErr,
  } = useQuery<Property[]>({
    queryKey: ["purchasedProperties"], // Unique key for purchased properties
    queryFn: fetchAllPurchasedProperties,
  });

  const {
    data: customers,
    isLoading: customersLoad,
    isError: customersError,
    error: customersErr,
  } = useQuery<Customer[]>({
    queryKey: ["customers", user?.role, user?._id],
    queryFn: () => fetchAllCustomers(user?.role, user?._id),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsUploadDialogOpen(false);
      setNewDocument({
        name: "",
        type: "",
        userId: user?.role === "customer_purchased" ? user._id : "", // Reset userId based on role
        property: "",
        file: null,
        description: "",
      });
      alert("Document uploaded successfully!");
    },
    onError: (err: any) => {
      alert(`Error uploading document: ${err.message || "Unknown error"}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      alert("Document updated successfully!");
    },
    onError: (err: any) => {
      alert(`Error updating document: ${err.message || "Unknown error"}`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({ ...newDocument, file: e.target.files[0] });
    }
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditingDocument({ ...editingDocument!, file: e.target.files[0] });
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newDocument.file ||
      !newDocument.name ||
      !newDocument.type ||
      !newDocument.userId ||
      !newDocument.property
    ) {
      alert("Please fill all required fields and select a file.");
      return;
    }
    if (!user || !user._id) {
      alert("User information missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("docName", newDocument.name);
    formData.append("docType", newDocument.type);
    formData.append("docOfUser", newDocument.userId);
    formData.append("property", newDocument.property);
    formData.append("description", newDocument.description || "");
    formData.append("file", newDocument.file);
    formData.append("uploadedBy", user._id); // Correctly append uploadedBy

    uploadMutation.mutate(formData);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument || !editingDocument._id) {
      alert("No document selected for editing.");
      return;
    }

    const formData = new FormData();
    // Only append fields that might be updated, and ensure they exist
    formData.append("docName", editingDocument.docName);
    formData.append("docType", editingDocument.docType);
    formData.append("docOfUser", editingDocument.docOfUser._id); // Send ID for ref
    formData.append("property", editingDocument.property?._id || ""); // Send ID for ref
    formData.append("description", editingDocument.description || "");
    formData.append("status", editingDocument.status); // Allow status to be updated

    if (editingDocument.file) {
      formData.append("file", editingDocument.file);
    }
    // uploadedBy should not change during edit, but if your backend requires it
    // formData.append("uploadedBy", editingDocument.uploadedBy._id);

    updateMutation.mutate({ id: editingDocument._id, formData });
  };

  const filteredDocuments =
    documents?.filter((doc) => {
      const matchesSearch =
        doc.docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.docType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.docOfUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.property?.basicInfo?.projectName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesTab = () => {
        if (currentTab === "all_docs") return true;
        if (currentTab === "pending_review")
          return (
            doc.status === "pending_signature" ||
            doc.status === "requires_update"
          );
        // "missing" tab logic would go here if you implemented a "missing" status
        // For now, it will show nothing unless specifically filtered.
        return false;
      };

      return matchesSearch && matchesTab();
    }) || [];

  if (isLoading || propLoad || customersLoad) return <Loader />;
  if (isError)
    return (
      <MainLayout>
        <div>Error: {error?.message}</div>
      </MainLayout>
    );
  if (propError)
    return (
      <MainLayout>
        <div>Error: {propErr?.message}</div>
      </MainLayout>
    );
  if (customersError)
    return (
      <MainLayout>
        <div>Error: {customersErr?.message}</div>
      </MainLayout>
    );

  const isCustomerPurchased = user?.role === "customer_purchased";

  const statusColors = {
    verified: "bg-green-100 text-green-800",
    pending_signature: "bg-yellow-100 text-yellow-800",
    requires_update: "bg-red-100 text-red-800",
  };

  const statusIcons = {
    verified: <CheckCircle className="h-4 w-4 mr-1" />,
    pending_signature: <Clock className="h-4 w-4 mr-1" />,
    requires_update: <AlertCircle className="h-4 w-4 mr-1" />,
  };

  const statusLabels = {
    verified: "Verified",
    pending_signature: "Pending Signature",
    requires_update: "Requires Update",
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Client Documents</h1>
            <p className="text-muted-foreground">
              Manage and track client documentation
            </p>
          </div>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Fill in the details to upload a new client document.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="documentName">Document Name</Label>
                  <Input
                    id="documentName"
                    value={newDocument.name}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, name: e.target.value })
                    }
                    placeholder="e.g., Sales Agreement - John Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewDocument({ ...newDocument, type: value })
                    }
                    value={newDocument.type}
                    required
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_agreement">
                        Sales Agreement
                      </SelectItem>
                      <SelectItem value="id_proof">ID Proof</SelectItem>
                      <SelectItem value="address_proof">
                        Address Proof
                      </SelectItem>
                      <SelectItem value="bank_statement">
                        Bank Statement
                      </SelectItem>
                      <SelectItem value="booking_form">Booking Form</SelectItem>
                      <SelectItem value="income_proof">Income Proof</SelectItem>
                      <SelectItem value="property_tax_receipt">
                        Property Tax Receipt
                      </SelectItem>
                      <SelectItem value="employment_verification">
                        Employment Verification
                      </SelectItem>
                      {/* Add more document types as needed */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditionally render Select User based on role */}
                {!isCustomerPurchased && (
                  <div className="grid gap-2">
                    <Label htmlFor="selectUser">Select User</Label>
                    <Select
                      onValueChange={(value) =>
                        setNewDocument({ ...newDocument, userId: value })
                      }
                      value={newDocument.userId}
                      required
                    >
                      <SelectTrigger id="selectUser">
                        <SelectValue placeholder="Select User" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers && customers.length === 0 ? (
                          <SelectItem value="no-user" disabled>
                            No user available
                          </SelectItem>
                        ) : (
                          customers?.map((customer) => (
                            <SelectItem
                              value={customer?.user?._id}
                              key={customer._id}
                            >
                              {customer.user.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="selectProperty">Select Property</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewDocument({ ...newDocument, property: value })
                    }
                    value={newDocument.property}
                    required
                  >
                    <SelectTrigger id="selectProperty">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchasedProp && purchasedProp.length === 0 ? (
                        <SelectItem value="no-properties" disabled>
                          No properties available
                        </SelectItem>
                      ) : (
                        purchasedProp?.map((p) => (
                          <SelectItem value={p._id} key={p._id}>
                            {p?.basicInfo?.projectName}{" "}
                            {p?.basicInfo?.plotNumber}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newDocument.description}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        description: e.target.value,
                      })
                    }
                    placeholder="Add any relevant notes"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">Document File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending
                      ? "Uploading..."
                      : "Upload Document"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="md:w-auto w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          {/* Desktop Tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all_docs">All Documents</TabsTrigger>
            <TabsTrigger value="pending_review">Pending Review</TabsTrigger>
            <TabsTrigger value="missing">Missing</TabsTrigger>
          </TabsList>

          {/* Mobile Select */}
          <div className="md:hidden mb-4">
            <Select value={currentTab} onValueChange={setCurrentTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_docs">All Documents</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all_docs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>
                  All documents collected from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        {!isCustomerPurchased && (
                          <TableHead className="hidden md:table-cell">
                            Client
                          </TableHead>
                        )}
                        <TableHead className="hidden md:table-cell">
                          Property
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Uploaded
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                          <TableRow key={doc._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="bg-muted rounded-md p-2">
                                  <FileText className="h-4 w-4 text-estate-navy" />
                                </div>
                                <div>
                                  <p className="font-medium">{doc.docName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.format} • {doc.size}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            {!isCustomerPurchased && (
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={doc?.docOfUser?.avatar} />
                                    <AvatarFallback>
                                      {doc?.docOfUser?.name?.[0] || (
                                        <UserCircle className="h-4 w-4" />
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{doc?.docOfUser?.name || "N/A"}</span>
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="hidden md:table-cell">
                              {doc?.property?.basicInfo?.projectName || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`flex items-center ${
                                  statusColors[doc.status]
                                }`}
                              >
                                {statusIcons[doc.status]}
                                {statusLabels[doc.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDocPreview(doc)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    window.open(doc.filePath, "_blank")
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                {!isCustomerPurchased && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setEditingDocument(doc);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={isCustomerPurchased ? 5 : 6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No documents found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="border rounded-lg p-4 bg-white shadow-sm space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-muted rounded-md p-2">
                            <FileText className="h-4 w-4 text-estate-navy" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.docName}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.format} • {doc.size}
                            </p>
                          </div>
                        </div>

                        {!isCustomerPurchased && doc?.docOfUser && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={doc.docOfUser.avatar} />
                              <AvatarFallback>
                                {doc.docOfUser.name?.[0] || (
                                  <UserCircle className="h-4 w-4" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span>{doc.docOfUser.name || "N/A"}</span>
                          </div>
                        )}

                        <div>
                          <span className="font-medium">Property:</span>{" "}
                          {doc?.property?.basicInfo?.projectName || "N/A"}
                        </div>

                        <div>
                          <span className="font-medium">Status:</span>{" "}
                          <Badge
                            className={`flex items-center max-w-[50%] ${
                              statusColors[doc.status]
                            }`}
                          >
                            {statusIcons[doc.status]} {statusLabels[doc.status]}
                          </Badge>
                        </div>

                        <div>
                          <span className="font-medium">Uploaded:</span>{" "}
                          {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDocPreview(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(doc.filePath, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {!isCustomerPurchased && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setEditingDocument(doc);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found.
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredDocuments.length} of {documents?.length || 0}{" "}
                  documents
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="pending_review" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Documents</CardTitle>
                <CardDescription>
                  Documents awaiting signature or requiring updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length > 0 ? ( // This will already be filtered by currentTab
                      filteredDocuments.map((doc) => {
                        return (
                          <TableRow key={doc._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="bg-muted rounded-md p-2">
                                  <FileText className="h-4 w-4 text-estate-navy" />
                                </div>
                                <div>
                                  <p className="font-medium">{doc.docName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.docType}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={doc?.docOfUser?.avatar} />
                                  <AvatarFallback>
                                    {doc?.docOfUser?.name?.[0] || (
                                      <UserCircle className="h-4 w-4" />
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{doc?.docOfUser?.name || "N/A"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`flex items-center ${
                                  statusColors[doc.status]
                                }`}
                              >
                                {statusIcons[doc.status]}
                                {statusLabels[doc.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDocPreview(doc)}
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  View
                                </Button>
                                {doc.status === "pending_signature" && (
                                  <Button size="sm">Send Reminder</Button>
                                )}
                                {doc.status === "requires_update" && (
                                  <Button size="sm">Request Update</Button>
                                )}
                                {!isCustomerPurchased && ( // Only show edit for non-customer_purchased roles
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setEditingDocument(doc);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No pending or required update documents found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="missing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Missing Documents</CardTitle>
                <CardDescription>
                  Documents that need to be collected from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Due Date
                      </TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No missing documents found. (Implementation for
                        'missing' documents goes here)
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Preview Dialog */}
        {docPreview && (
          <Dialog open={!!docPreview} onOpenChange={() => setDocPreview(null)}>
            <DialogContent className="sm:max-w-[700px] max-h-[80dvh] max-w-[90dvw] rounded-xl">
              <DialogHeader>
                <DialogTitle>Document Preview</DialogTitle>
                <DialogDescription>
                  Viewing: {docPreview.docName}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-auto max-h-[60vh]">
                {docPreview.filePath && (
                  <iframe
                    src={docPreview.filePath}
                    title="Document Preview"
                    className="w-full h-full min-h-[400px] border rounded-md"
                  >
                    Your browser does not support iframes.
                  </iframe>
                )}
              </div>
              <DialogFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  {docPreview.status === "requires_update" && (
                    <Button variant="outline">
                      <FileUp className="mr-2 h-4 w-4" />
                      Request Updated Version
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDocPreview(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => window.open(docPreview.filePath, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Document Edit Dialog */}
        {editingDocument && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-[90vw] max-h-[80vh] rounded-xl ">
              <DialogHeader>
                <DialogTitle>Edit Document</DialogTitle>
                <DialogDescription>
                  Modify details for {editingDocument.docName}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editDocumentName">Document Name</Label>
                  <Input
                    id="editDocumentName"
                    value={editingDocument.docName}
                    onChange={(e) =>
                      setEditingDocument({
                        ...editingDocument,
                        docName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editDocumentType">Document Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setEditingDocument({ ...editingDocument, docType: value })
                    }
                    value={editingDocument.docType}
                    required
                  >
                    <SelectTrigger id="editDocumentType">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_agreement">
                        Sales Agreement
                      </SelectItem>
                      <SelectItem value="id_proof">ID Proof</SelectItem>
                      <SelectItem value="address_proof">
                        Address Proof
                      </SelectItem>
                      <SelectItem value="bank_statement">
                        Bank Statement
                      </SelectItem>
                      <SelectItem value="booking_form">Booking Form</SelectItem>
                      <SelectItem value="income_proof">Income Proof</SelectItem>
                      <SelectItem value="property_tax_receipt">
                        Property Tax Receipt
                      </SelectItem>
                      <SelectItem value="employment_verification">
                        Employment Verification
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Selection for editing */}
                <div className="grid gap-2">
                  <Label htmlFor="editDocumentStatus">Status</Label>
                  <Select
                    onValueChange={(
                      value:
                        | "verified"
                        | "pending_signature"
                        | "requires_update"
                    ) =>
                      setEditingDocument({ ...editingDocument, status: value })
                    }
                    value={editingDocument.status}
                    required
                  >
                    <SelectTrigger id="editDocumentStatus">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending_signature">
                        Pending Signature
                      </SelectItem>
                      <SelectItem value="requires_update">
                        Requires Update
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="editDescription">
                    Description (Optional)
                  </Label>
                  <Input
                    id="editDescription"
                    value={editingDocument.description || ""}
                    onChange={(e) =>
                      setEditingDocument({
                        ...editingDocument,
                        description: e.target.value,
                      })
                    }
                    placeholder="Add any relevant notes"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editFile">
                    Replace Document File (Optional)
                  </Label>
                  <Input
                    id="editFile"
                    type="file"
                    onChange={handleEditFileUpload}
                  />
                  {editingDocument.filePath && (
                    <p className="text-sm text-muted-foreground">
                      Current file: {editingDocument.filePath.split("/").pop()}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default AgentDocuments;
