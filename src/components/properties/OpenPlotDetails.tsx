import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Edit,
  Trash,
  Map,
  Building,
  Calendar,
  IndianRupee,
  User,
  Phone,
  FileText,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OpenPlot } from "@/types/OpenPlots";
import { useAuth } from "@/contexts/AuthContext";

function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    Reserved: "bg-purple-500",
    Blocked: "bg-red-500",
    "Under Dispute": "bg-yellow-500",
    Completed: "bg-green-500",
    "In Progress": "bg-yellow-500",
    Pending: "bg-orange-500",
    "Not Started": "bg-gray-500",
  };

  return (
    <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
      {status}
    </Badge>
  );
}

interface OpenPlotDetailsProps {
  plot: OpenPlot;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function OpenPlotDetails({
  plot,
  onEdit,
  onDelete,
  onBack,
}: OpenPlotDetailsProps) {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canEdit = user && ["owner", "admin"].includes(user.role);

  console.log(plot);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to All Open Plots
        </Button>
        {canEdit && (
          <div className="space-x-2">
            <Button size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row">
          {plot.thumbnailUrl && (
            <div className="md:w-1/3">
              <img
                src={plot.thumbnailUrl}
                alt={plot.projectName}
                className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
          )}
          <div className={`${plot.thumbnailUrl ? "md:w-2/3" : "w-full"} p-6`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">{plot.projectName}</h2>
                {getStatusBadge(plot.availabilityStatus)}
                <p className="text-muted-foreground mt-1">
                  Plot No. {plot.plotNo} • Mem. No. {plot.memNo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Map className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Facing: {plot.facing}</span>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Extent: {plot.extentSqYards} sq. yards</span>
              </div>
              <div className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Total: {formatCurrency(plot.totalAmount)}</span>
              </div>
              <div className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>
                  Price/Sq.Yard: {formatCurrency(plot.pricePerSqYard)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span>
                  Amount Received: {formatCurrency(plot.amountReceived)}
                </span>
              </div>
              <Progress
                value={(plot.amountReceived / plot.totalAmount) * 100}
                className="h-2"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <User className="mr-2 h-5 w-5" /> Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Name:</strong> {plot.customerName || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {plot.customerContact || "N/A"}
            </p>
            <p>
              <strong>Agent:</strong> {plot.agentName || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Legal & Other Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Approval:</strong> {plot.approval}
            </p>
            <p>
              <strong>Corner Plot:</strong> {plot.isCornerPlot ? "Yes" : "No"}
            </p>
            <p>
              <strong>Gated Community:</strong>{" "}
              {plot.isGatedCommunity ? "Yes" : "No"}
            </p>
            <p>
              <strong>Registration:</strong>{" "}
              {getStatusBadge(plot.registrationStatus)}
            </p>
            <p className="flex items-center">
              <strong>EMI Scheme:</strong>{" "}
              {plot.emiScheme ? (
                <>
                  <Check className="ml-2 h-4 w-4 text-green-500" /> Available
                </>
              ) : (
                <>
                  <X className="ml-2 h-4 w-4 text-red-500" /> Not Available
                </>
              )}
            </p>
            <p className="flex items-start">
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
              {plot.remarks || "No remarks"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Google Maps */}
      {plot.googleMapsLink && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Map className="mr-2 h-5 w-5" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plot.googleMapsLink.includes("maps.google.com") ? (
              <iframe
                title="Plot Location"
                src={plot.googleMapsLink}
                className="w-full h-80 border-0 rounded-md"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <Button variant="outline" asChild className="w-full">
                <a
                  href={plot.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <Map className="mr-2 h-5 w-5" /> View on Google Maps
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this open plot? This action cannot
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
              Delete Plot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
