import { useState, useMemo } from "react";
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
  IndianRupee,
  User,
  FileText,
  MessageSquare,
  Check,
  X,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OpenPlot } from "@/types/OpenPlots";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function getStatusBadge(status: string) {
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const canEdit = user && ["owner", "admin"].includes(user.role);

  const galleryImages = useMemo(() => {
    const allImages = new Set<string>(plot.images || []);
    if (plot.thumbnailUrl) {
      allImages.add(plot.thumbnailUrl);
    }
    return Array.from(allImages);
  }, [plot.images, plot.thumbnailUrl]);

  const openLightbox = (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setLightboxOpen(true);
  };
  const handleDownload = async (
    e: React.MouseEvent,
    url?: string | null,
    projectName?: string | null
  ) => {
    e.stopPropagation();
    if (!url) return toast.error("No brochure available to download.");

    try {
      const API_BASE = import.meta.env.VITE_URL || "http://localhost:3000";
      const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
        url
      )}&filename=${encodeURIComponent(projectName || "brochure")}`;

      window.open(proxyUrl, "_blank");
      toast.success("Download starting...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download brochure.");
    }
  };

  // ✅ Converts a normal Google Maps URL → embeddable URL automatically
  const getEmbeddableGoogleMapSrc = (url?: string): string => {
    if (!url) return "";

    // Already embed link
    if (url.includes("/embed?pb=")) return url;

    // Handle links like https://www.google.com/maps/place/Hyderabad/@17.385,78.486
    if (url.includes("/maps/place/")) {
      return url.replace("/maps/place/", "/maps/embed/place/");
    }

    // Handle links like https://goo.gl/maps/xxxxx or ?q=lat,lng
    if (url.includes("goo.gl") || url.includes("?q=")) {
      const queryMatch = url.match(/q=([^&]+)/);
      const query = queryMatch ? decodeURIComponent(queryMatch[1]) : "";
      return `https://www.google.com/maps?q=${query}&output=embed`;
    }

    // Fallback to search embed
    return `https://www.google.com/maps?q=${encodeURIComponent(
      url
    )}&output=embed`;
  };

  return (
    <div className="space-y-6">
      {/* Back + Edit/Delete */}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to All Open Plots
        </Button>
        {canEdit && (
          <div className="flex md:flex-row flex-col gap-3">
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

      {/* Basic Info */}
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
              {/* <div className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Total: {formatCurrency(plot.totalAmount)}</span>
              </div>
              <div className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>
                  Price/Sq.Yard: {formatCurrency(plot.pricePerSqYard)}
                </span>
              </div> */}
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Plot Type: {plot.plotType}</span>
              </div>
            </div>

            {/* <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span>
                  Amount Received: {formatCurrency(plot.amountReceived)}
                </span>
              </div>
              <Progress
                value={(plot.amountReceived / plot.totalAmount) * 100}
                className="h-2"
              />
            </div> */}
            {plot?.brochureUrl && (
              <Button variant="outline" asChild className="mt-4">
                <a
                  // href={building.brochureUrl}
                  onClick={(e) =>
                    handleDownload(e, plot?.brochureUrl, plot?.projectName)
                  }
                  // target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="mr-2 h-4 w-4" /> Download Project
                  Brochure
                </a>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Customer + Financial Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <User className="mr-2 h-5 w-5" /> Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Name:</strong> {plot.customerId?.user?.name || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {plot.customerContact || "N/A"}
            </p>
            <p>
              <strong>Agent:</strong> {plot.agentId?.name || "N/A"}
            </p>
          </CardContent>
        </Card>
        {/* Legal Info */}
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
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <IndianRupee className="mr-2 h-5 w-5" /> Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Price/Sq.Yard:</strong>{" "}
              {formatCurrency(plot.pricePerSqYard)}
            </p>
            <p>
              <strong>Total Amount:</strong> {formatCurrency(plot.totalAmount)}
            </p>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span>
                  Amount Received: {formatCurrency(plot.amountReceived)}
                </span>
                <span>
                  {Math.round((plot.amountReceived / plot.totalAmount) * 100)}%
                </span>
              </div>
              <Progress
                value={(plot.amountReceived / plot.totalAmount) * 100}
                className="h-2"
              />
            </div>
            <p>
              <strong>Balance:</strong>{" "}
              {formatCurrency(plot.totalAmount - plot.amountReceived)}
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* 🖼️ Gallery - Bento Grid */}
      {galleryImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" /> Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 auto-rows-[150px]">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer overflow-hidden rounded-lg shadow-sm ${
                    index % 5 === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                  onClick={() => openLightbox(image)}
                >
                  <img
                    src={image}
                    alt={`Plot image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🗺️ Google Map Embed (free) */}
      {plot.googleMapsLink ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              title="Plot Location"
              src={getEmbeddableGoogleMapSrc(plot.googleMapsLink)}
              className="w-full h-96 rounded-lg border"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500 italic">No map available for this plot.</p>
      )}

      {/* Delete Dialog */}
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

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <img
            src={currentImage}
            alt="Full view of plot"
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
