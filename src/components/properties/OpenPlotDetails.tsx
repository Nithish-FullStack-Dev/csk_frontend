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
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Edit,
  Trash,
  Map,
  Building,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import { OpenPlot } from "@/types/OpenPlots";
import { useAuth } from "@/contexts/AuthContext";
import { useLeadbyOpenPlotId } from "@/utils/buildings/Projects";
import { Lead } from "@/utils/leads/LeadConfig";
import axios from "axios";
import { InnerPlotDialog } from "./InnerPlotDialog";
import { useNavigate } from "react-router-dom";
import { getAllInnerPlot } from "@/api/innerPlot.api";
import { useQuery } from "@tanstack/react-query";

export function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    Blocked: "bg-red-500",
    Clear: "bg-green-500",
    Disputed: "bg-yellow-500",
    NA: "bg-gray-500",
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
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [innerPlotDialogOpen, setInnerPlotDialogOpen] = useState(false);

  const canEdit = user && ["owner", "admin"].includes(user.role);

  // const {
  //   data: leads = [],
  //   isLoading: leadsLoading,
  //   isError: leadsError,
  //   error: leadErr,
  // } = useLeadbyOpenPlotId(plot._id);

  const {
    data: innerPlots = [],
    isLoading: innerPlotsLoading,
    isError: innerPlotsError,
  } = useQuery({
    queryKey: ["inner-plots", plot._id],
    queryFn: () => getAllInnerPlot(plot._id),
    enabled: !!plot._id,
  });

  const galleryImages = useMemo(() => {
    const allImages = new Set<string>(plot.images || []);
    if (plot.thumbnailUrl) allImages.add(plot.thumbnailUrl);
    return Array.from(allImages);
  }, [plot.images, plot.thumbnailUrl]);

  const openLightbox = (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setLightboxOpen(true);
  };

  const getEmbeddableGoogleMapSrc = (location?: string): string => {
    if (!location) return "";
    return `https://www.google.com/maps?q=${encodeURIComponent(
      location,
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
        <div className="flex md:flex-row flex-col gap-3">
          {canEdit && (
            <>
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
            </>
          )}
        </div>
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
                {getStatusBadge(plot.status)}
                <p className="text-muted-foreground mt-1">
                  Open Plot No: {plot.openPlotNo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Map className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Location: {plot.location}</span>
              </div>

              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>
                  Total Area: {plot.totalArea} {plot.areaUnit}
                </span>
              </div>

              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Facing: {plot.facing || "N/A"}</span>
              </div>

              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Road Width: {plot.roadWidthFt ?? "N/A"} ft</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Inner plot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Building className="h-5 w-5" />
            Inner Plots
          </CardTitle>

          <Button
            variant="default"
            onClick={() => setInnerPlotDialogOpen(true)}
          >
            Add Plot
          </Button>
        </CardHeader>

        <CardContent>
          {innerPlotsLoading && <p>Loading inner plots...</p>}

          {innerPlotsError && (
            <p className="text-red-500">Failed to load inner plots</p>
          )}

          {!innerPlotsLoading && innerPlots.length === 0 && (
            <p className="text-muted-foreground italic">
              No inner plots added yet.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {innerPlots.map((inner) => (
              <Card
                key={inner._id}
                className="overflow-hidden hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                {inner.thumbnailUrl ? (
                  <img
                    src={inner.thumbnailUrl}
                    alt={inner.plotNo}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 opacity-30" />
                  </div>
                )}

                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      Plot No: {inner.plotNo}
                    </h3>
                    <Badge
                      className={
                        inner.status === "Available"
                          ? "bg-green-500 text-white"
                          : inner.status === "Sold"
                            ? "bg-blue-500 text-white"
                            : "bg-red-500 text-white"
                      }
                    >
                      {inner.status}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Area</span>
                      <span>{inner.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facing</span>
                      <span>{inner.facing || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type</span>
                      <span>{inner.plotType}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => navigate(`/inner-detail/${plot._id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Legal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Survey No:</strong> {plot.surveyNo || "N/A"}
            </p>
            <p>
              <strong>Approval Authority:</strong>{" "}
              {plot.approvalAuthority || "N/A"}
            </p>
            <p>
              <strong>RERA No:</strong> {plot.reraNo || "N/A"}
            </p>
            <p>
              <strong>Document No:</strong> {plot.documentNo || "N/A"}
            </p>
            <p>
              <strong>Title Status:</strong> {getStatusBadge(plot.titleStatus)}
            </p>
            <p className="flex items-start">
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              {plot.remarks || "No remarks"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Building className="mr-2 h-5 w-5" /> Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plot.boundaries || "No boundary information available."}
          </CardContent>
        </Card>
      </div>

      {/* Interested Leads */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Interested Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          {leadsLoading && <p>Loading leads...</p>}
          {leadsError && (
            <p className="text-red-500">
              {axios.isAxiosError(leadErr)
                ? leadErr.response.data.message
                : leadErr?.message}
            </p>
          )}
          {!leadsLoading && !leadsError && leads.length === 0 && (
            <p className="text-gray-500 italic">No interested leads found.</p>
          )}
          {!leadsLoading && !leadsError && leads.length > 0 && (
            <ul className="list-disc list-inside">
              {leads.map((lead: Lead, idx: number) => (
                <li key={lead?._id || idx}>
                  {lead?.name} - {lead?.phone}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card> */}

      {/* Gallery */}
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

      {/* Map */}
      {plot.location ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              title="Plot Location"
              src={getEmbeddableGoogleMapSrc(plot.location)}
              className="w-full h-96 rounded-lg border"
              loading="lazy"
            />
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500 italic">No map available.</p>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this open plot?
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

      <InnerPlotDialog
        open={innerPlotDialogOpen}
        onOpenChange={setInnerPlotDialogOpen}
        openPlotId={plot._id}
      />
    </div>
  );
}
