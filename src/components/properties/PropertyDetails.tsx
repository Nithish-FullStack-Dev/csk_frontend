import { useState } from "react";
import {
  Check,
  Building,
  Map,
  Calendar,
  Edit,
  Trash,
  FileText,
  PercentIcon,
  Phone,
  User,
  MessageSquare,
  ChevronLeft,
  X,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/types/property";
import { formatCurrency } from "@/lib/utils";

// Helper for colored status badges
const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    "Under Construction": "bg-yellow-500",
    Reserved: "bg-purple-500",
    Blocked: "bg-red-500",
    Purchased: "bg-blue-500",
    Inquiry: "bg-yellow-500",
    Open: "bg-green-500",
    Completed: "bg-green-600",
    "In Progress": "bg-yellow-600",
    Pending: "bg-orange-500",
    "Not Started": "bg-gray-500",
  };

  return (
    <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>
      {status}
    </Badge>
  );
};

interface PropertyDetailsProps {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function PropertyDetails({
  property,
  onEdit,
  onDelete,
  onBack,
}: PropertyDetailsProps) {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canEdit = user && ["owner", "admin"].includes(user.role);

  // Date formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Properties
          </Button>

          {canEdit && (
            <div className="flex flex-row gap-3">
              <Button size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Header Info */}
        <Card>
          <div className="flex flex-col md:flex-row">
            {property.thumbnailUrl && (
              <div className="md:w-1/3">
                <img
                  src={property.thumbnailUrl}
                  alt={property.projectName}
                  className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
            )}
            <div
              className={`${property.thumbnailUrl ? "md:w-2/3" : "w-full"} p-6`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-2xl font-bold">
                      {property.projectName}
                    </h2>
                    {getStatusBadge(property.status)}
                  </div>
                  <p className="text-muted-foreground">
                    Plot No. {property.plotNo || "N/A"} • Mem. No.{" "}
                    {property.memNo || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <Map className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Facing: {property.villaFacing || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Extent: {property.extent || 0} sq. ft</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Delivery: {formatDate(property.deliveryDate)}</span>
                </div>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    Total: {formatCurrency(property.totalAmount || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span>
                    Construction Progress: {property.workCompleted || 0}%
                  </span>
                </div>
                <Progress value={property.workCompleted || 0} className="h-2" />
              </div>
            </div>
          </div>
        </Card>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium">
                  {property.customerId?.user?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer Status</p>
                <div>{getStatusBadge(property.customerStatus || "N/A")}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  {property.contactNo || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Agent Name</p>
                <p className="font-medium">{property.agentId?.name || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <IndianRupee className="mr-2 h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium text-lg">
                {formatCurrency(property.totalAmount || 0)}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Amount Received
                  </p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(property.amountReceived || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Balance Amount
                  </p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(property.balanceAmount || 0)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Rate Plan (Scheme)
              </p>
              <p className="font-medium">{property.ratePlan || "N/A"}</p>

              <p className="text-sm text-muted-foreground">EMI Scheme</p>
              <p className="font-medium flex items-center">
                {property.emiScheme ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" /> Available
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4 text-red-500" /> Not Available
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        {property.googleMapsLocation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Map className="mr-2 h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {property.googleMapsLocation.includes("maps.google.com") ? (
                <iframe
                  title="Property Location"
                  src={property.googleMapsLocation}
                  className="w-full h-80 border-0 rounded-md"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <Button variant="outline" asChild className="w-full">
                  <a
                    href={property.googleMapsLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <Map className="mr-2 h-5 w-5" />
                    View on Google Maps
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
            >
              Delete Property
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
