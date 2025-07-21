import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose for better dialog management
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckSquare,
  Clock,
  X,
  Check,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define an interface for the site visit request data for better type safety
interface SiteVisitRequest {
  _id: string;
  title: string;
  description: string;
  requestedBy: {
    name: string;
    avatar: string;
    role: string;
  };
  bookedBy?: {
    // Optional as it might not be present for approved/rejected mocks
    name: string;
    avatar: string;
    _id: string; // Assuming an ID for the user
  };
  priority: "high" | "medium" | "low";
  createdAt: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled"; // Add status to the type
  approvedAt?: string; // For approved requests
  approvedBy?: string; // For approved requests
  approvalNotes?: string; // For approved/rejected requests
}

const fetchAllAgentSiteVisit = async (): Promise<SiteVisitRequest[]> => {
  const { data } = await axios.get(
    "http://localhost:3000/api/siteVisit/getSiteVisitOfAgents"
  );
  return data;
};

const Approvals = () => {
  const [selectedRequest, setSelectedRequest] =
    useState<SiteVisitRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog open/close

  const {
    data: allSiteVisits = [],
    isLoading: approvalLoading,
    isError: approvalError,
    error: approvalErr,
  } = useQuery<SiteVisitRequest[]>({
    queryKey: ["siteVisitsOfAgents"],
    queryFn: fetchAllAgentSiteVisit,
    staleTime: 0,
  });

  const updateSiteVisitStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      approvalNotes,
    }: {
      id: string;
      status: "confirmed" | "cancelled";
      approvalNotes?: string | null;
    }) => {
      const response = await axios.patch(
        `http://localhost:3000/api/siteVisit/approvalOrReject`,
        {
          _id: id,
          status,
          approvalNotes: approvalNotes || null,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Request updated successfully");
      queryClient.invalidateQueries({ queryKey: ["siteVisitsOfAgents"] });
      setApprovalNotes("");
      setSelectedRequest(null);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update request");
      console.error("Update site visit error:", error);
    },
  });

  if (approvalLoading) return <Loader />;
  if (approvalError) {
    toast.error("Failed to fetch approval site visits.");
    console.error("Fetch site visit error:", approvalErr);
    return (
      <MainLayout>
        <div className="text-center text-red-500">
          Error loading approvals. Please try again later.
        </div>
      </MainLayout>
    );
  }

  // Filter requests based on status for each tab
  const pendingRequests = allSiteVisits.filter(
    (request) => request.status === "pending"
  );
  const approvedRequests = allSiteVisits.filter(
    (request) => request.status === "confirmed"
  );
  const rejectedRequests = allSiteVisits.filter(
    (request) => request.status === "cancelled"
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "site_visit":
        return <MapPin className="h-4 w-4" />;
      case "expense":
        return <DollarSign className="h-4 w-4" />;
      case "leave":
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "site_visit":
        return "bg-blue-100 text-blue-800";
      case "expense":
        return "bg-green-100 text-green-800";
      case "leave":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAction = (id: string, status: "confirmed" | "cancelled") => {
    updateSiteVisitStatus.mutate({ id, status, approvalNotes });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold">Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage team approval requests
          </p>
        </div>

        {/* Info Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {pendingRequests.length}
                </span>
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {pendingRequests.filter((r) => r.priority === "high").length}
                </span>
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {/* This count needs to be dynamic based on approvedRequests today */}
                <span className="text-2xl font-bold">
                  {
                    approvedRequests.filter(
                      (req) =>
                        new Date(req.createdAt).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </span>
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {/* This is hardcoded. You'd need logic to calculate this. */}
                <span className="text-2xl font-bold">4h</span>
                <CheckSquare className="h-6 w-6 text-estate-navy" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab Content */}
          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No pending requests found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card
                  key={request._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.bookedBy?.avatar || ""} />
                          <AvatarFallback>
                            {request.bookedBy?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">
                              Site Visit Request
                            </h3>
                            <Badge
                              className={getPriorityColor(request.priority)}
                            >
                              {request.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>
                              Requested by:{" "}
                              {request.bookedBy?.name || "Unknown"}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(request.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Dialog
                          open={
                            isDialogOpen && selectedRequest?._id === request._id
                          }
                          onOpenChange={setIsDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </DialogTrigger>
                          {selectedRequest && ( // Only render dialog content if a request is selected
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Site Visit Request</DialogTitle>
                                <DialogDescription>
                                  Review request details and take action
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Requested By</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={
                                            selectedRequest.bookedBy?.avatar ||
                                            ""
                                          }
                                        />
                                        <AvatarFallback>
                                          {selectedRequest.bookedBy?.name?.charAt(
                                            0
                                          ) || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {selectedRequest.bookedBy?.name}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Request Time</Label>
                                    <p className="text-sm mt-1">
                                      {new Date(
                                        selectedRequest.createdAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Details</Label>
                                  <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Date:</span>
                                      <span>{selectedRequest.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Time:</span>
                                      <span>{selectedRequest.time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Priority:</span>
                                      <span>{selectedRequest.priority}</span>
                                    </div>
                                    {selectedRequest.notes && (
                                      <div className="flex justify-between">
                                        <span>Notes:</span>
                                        <span>{selectedRequest.notes}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="approval-notes">
                                    Approval Notes (Optional)
                                  </Label>
                                  <Textarea
                                    id="approval-notes"
                                    placeholder="Add any notes or conditions..."
                                    onChange={(e) =>
                                      setApprovalNotes(e.target.value)
                                    }
                                    value={approvalNotes}
                                  />
                                </div>

                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    className="flex-1 text-red-600 border-red-200"
                                    onClick={() =>
                                      handleAction(
                                        selectedRequest._id,
                                        "cancelled"
                                      )
                                    }
                                    disabled={updateSiteVisitStatus.isPending}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                      handleAction(
                                        selectedRequest._id,
                                        "confirmed"
                                      )
                                    }
                                    disabled={updateSiteVisitStatus.isPending}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleAction(request._id, "cancelled")}
                          disabled={updateSiteVisitStatus.isPending}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(request._id, "confirmed")}
                          disabled={updateSiteVisitStatus.isPending}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Approved Requests Tab Content */}
          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No approved requests found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.bookedBy?.avatar || ""} />
                          <AvatarFallback>
                            {request.bookedBy?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">
                              Site Visit Request
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>
                              Approved by:{" "}
                              {/* You might need to store who approved it in your backend data */}
                              You
                            </span>
                            <span>•</span>
                            <span>
                              {/* Display approval date if available, otherwise creation date */}
                              {request.approvedAt
                                ? new Date(request.approvedAt).toLocaleString()
                                : new Date(request.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {request.approvalNotes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Notes: {request.approvalNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Rejected Requests Tab Content */}
          <TabsContent value="rejected" className="space-y-4">
            {rejectedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No rejected requests found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              rejectedRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.bookedBy?.avatar || ""} />
                          <AvatarFallback>
                            {request.bookedBy?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">
                              Site Visit Request
                            </h3>
                            <Badge className="bg-red-100 text-red-800">
                              <X className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>
                              Rejected by:{" "}
                              {/* You might need to store who rejected it in your backend data */}
                              You
                            </span>
                            <span>•</span>
                            <span>
                              {/* Display rejection date if available, otherwise creation date */}
                              {request.approvedAt // Assuming 'approvedAt' could also store rejection date
                                ? new Date(request.approvedAt).toLocaleString()
                                : new Date(request.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {request.approvalNotes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Notes: {request.approvalNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Approvals;
