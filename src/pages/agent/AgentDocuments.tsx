
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, Search, Filter, Download, Eye, UserCircle,
  FileUp, Clock, CheckCircle, XCircle, AlertCircle, 
  Plus, Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

// Sample document data
const documents = [
  {
    id: "1",
    name: "Sales Agreement - James Miller",
    type: "sales_agreement",
    client: {
      name: "James Miller",
      avatar: "https://ui-avatars.com/api/?name=James+Miller&background=1A365D&color=fff",
    },
    property: "Golden Heights Phase 2",
    uploadedAt: "2025-04-05T14:30:00",
    status: "pending_signature",
    size: "2.4 MB",
    format: "PDF",
  },
  {
    id: "2",
    name: "ID Proof - Patricia Garcia",
    type: "id_proof",
    client: {
      name: "Patricia Garcia",
      avatar: "https://ui-avatars.com/api/?name=Patricia+Garcia&background=718096&color=fff",
    },
    property: "Skyline Towers",
    uploadedAt: "2025-04-03T10:15:00",
    status: "verified",
    size: "1.8 MB",
    format: "JPEG",
  },
  {
    id: "3",
    name: "Address Proof - Susan Rodriguez",
    type: "address_proof",
    client: {
      name: "Susan Rodriguez",
      avatar: "https://ui-avatars.com/api/?name=Susan+Rodriguez&background=4299E1&color=fff",
    },
    property: "Riverside Apartments",
    uploadedAt: "2025-04-02T16:45:00",
    status: "requires_update",
    size: "3.2 MB",
    format: "PDF",
  },
  {
    id: "4",
    name: "Bank Statement - Michael Johnson",
    type: "bank_statement",
    client: {
      name: "Michael Johnson",
      avatar: "https://ui-avatars.com/api/?name=Michael+Johnson&background=38A169&color=fff",
    },
    property: "Parkview Residences",
    uploadedAt: "2025-03-28T11:20:00",
    status: "verified",
    size: "4.5 MB",
    format: "PDF",
  },
  {
    id: "5",
    name: "Booking Form - Elizabeth Taylor",
    type: "booking_form",
    client: {
      name: "Elizabeth Taylor",
      avatar: "https://ui-avatars.com/api/?name=Elizabeth+Taylor&background=ECC94B&color=fff",
    },
    property: "Downtown Lofts",
    uploadedAt: "2025-03-25T09:10:00",
    status: "pending_signature",
    size: "1.2 MB",
    format: "PDF",
  },
];

// Missing document requests
const missingDocuments = [
  {
    id: "1",
    documentName: "Income Proof",
    client: {
      name: "James Miller",
      avatar: "https://ui-avatars.com/api/?name=James+Miller&background=1A365D&color=fff",
    },
    property: "Golden Heights Phase 2",
    requestedOn: "2025-04-05T14:30:00",
    dueDate: "2025-04-12",
    priority: "high",
  },
  {
    id: "2",
    documentName: "Property Tax Receipt",
    client: {
      name: "Patricia Garcia",
      avatar: "https://ui-avatars.com/api/?name=Patricia+Garcia&background=718096&color=fff",
    },
    property: "Skyline Towers",
    requestedOn: "2025-04-03T10:15:00",
    dueDate: "2025-04-10",
    priority: "medium",
  },
  {
    id: "3",
    documentName: "Employment Verification",
    client: {
      name: "Susan Rodriguez",
      avatar: "https://ui-avatars.com/api/?name=Susan+Rodriguez&background=4299E1&color=fff",
    },
    property: "Riverside Apartments",
    requestedOn: "2025-04-02T16:45:00",
    dueDate: "2025-04-09",
    priority: "high",
  },
];

const AgentDocuments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [docPreview, setDocPreview] = useState<typeof documents[0] | null>(null);

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
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

        <Tabs defaultValue="all_docs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all_docs">All Documents</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="missing">Missing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all_docs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>
                  All documents collected from clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const statusColors = {
                        verified: "bg-green-100 text-green-800",
                        pending_signature: "bg-yellow-100 text-yellow-800",
                        requires_update: "bg-red-100 text-red-800",
                      };
                      
                      const statusLabels = {
                        verified: "Verified",
                        pending_signature: "Pending Signature",
                        requires_update: "Requires Update",
                      };

                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="bg-muted rounded-md p-2">
                                <FileText className="h-4 w-4 text-estate-navy" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.format} • {doc.size}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={doc.client.avatar} />
                                <AvatarFallback>{doc.client.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{doc.client.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[doc.status as keyof typeof statusColors]}>
                              {statusLabels[doc.status as keyof typeof statusLabels]}
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
                              <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredDocuments.length} of {documents.length} documents
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Documents</CardTitle>
                <CardDescription>
                  Documents awaiting review or signatures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.filter(doc => doc.status !== "verified").map((doc) => {
                      const statusColors = {
                        verified: "bg-green-100 text-green-800",
                        pending_signature: "bg-yellow-100 text-yellow-800",
                        requires_update: "bg-red-100 text-red-800",
                      };
                      
                      const statusLabels = {
                        verified: "Verified",
                        pending_signature: "Pending Signature",
                        requires_update: "Requires Update",
                      };

                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="bg-muted rounded-md p-2">
                                <FileText className="h-4 w-4 text-estate-navy" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.property}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={doc.client.avatar} />
                                <AvatarFallback>{doc.client.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{doc.client.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[doc.status as keyof typeof statusColors]}>
                              {statusLabels[doc.status as keyof typeof statusLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </Button>
                              {doc.status === "pending_signature" && (
                                <Button size="sm">
                                  Send Reminder
                                </Button>
                              )}
                              {doc.status === "requires_update" && (
                                <Button size="sm">
                                  Request Update
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missingDocuments.map((doc) => {
                      const priorityColors = {
                        high: "bg-estate-error/20 text-estate-error",
                        medium: "bg-estate-gold/20 text-estate-gold",
                        low: "bg-estate-teal/20 text-estate-teal",
                      };

                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{doc.documentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.property}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={doc.client.avatar} />
                                <AvatarFallback>{doc.client.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>{doc.client.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(new Date(doc.dueDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityColors[doc.priority as keyof typeof priorityColors]}>
                              {doc.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm">
                                Send Request
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Preview Dialog */}
        {docPreview && (
          <Dialog open={!!docPreview} onOpenChange={() => setDocPreview(null)}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Document Preview</DialogTitle>
                <DialogDescription>
                  Viewing: {docPreview.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={docPreview.client.avatar} />
                      <AvatarFallback>{docPreview.client.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{docPreview.client.name}</p>
                      <p className="text-sm text-muted-foreground">{docPreview.property}</p>
                    </div>
                  </div>
                  <Badge className={
                    docPreview.status === "verified" ? "bg-green-100 text-green-800" :
                    docPreview.status === "pending_signature" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {docPreview.status === "verified" ? "Verified" :
                     docPreview.status === "pending_signature" ? "Pending Signature" :
                     "Requires Update"}
                  </Badge>
                </div>
                
                <div className="border rounded-md p-6 min-h-[300px] flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Preview not available in this demo. In a real application, the document would be displayed here.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Document Type:</p>
                    <p>{docPreview.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                  </div>
                  <div>
                    <p className="font-medium">Format:</p>
                    <p>{docPreview.format}</p>
                  </div>
                  <div>
                    <p className="font-medium">Size:</p>
                    <p>{docPreview.size}</p>
                  </div>
                  <div>
                    <p className="font-medium">Uploaded On:</p>
                    <p>{format(new Date(docPreview.uploadedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
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
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default AgentDocuments;
