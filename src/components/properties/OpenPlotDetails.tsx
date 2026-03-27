// src\components\properties\OpenPlotDetails.tsx
import { useState, useMemo, useEffect } from "react";
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
// import { getAllInnerPlot } from "@/api/inneropenPlotData?.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BulkInnerPlotGenerator from "./BulkInnerPlotGenerator";
import CsvInnerPlotUploader from "./CsvInnerPlotUploader";
import { toast } from "sonner";
import { getAllInnerPlot } from "@/api/innerPlot.api";
import MainLayout from "../layout/MainLayout";
import { OpenPlotDialog } from "./OpenPlotsDialog";
import { get } from "http";
import { getImageUrl } from "@/lib/image";

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
// const getImageUrl = (url?: string) => {
//   if (!url) return "";

//   // Cloudinary or external images
//   if (url.startsWith("http")) return url;

//   // Local images
//   return `${import.meta.env.VITE_IMAGE_URL}${url}`;
// };
export function OpenPlotDetails({
  plot,
  onEdit,
  onDelete,
  onBack,
}: OpenPlotDetailsProps) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [innerPlotDialogOpen, setInnerPlotDialogOpen] = useState(false);
  const [bulkManualOpen, setBulkManualOpen] = useState(false);
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const canEdit = user && ["owner", "admin"].includes(user.role);
  const queryClient = useQueryClient();

  const { data: openPlotData, isLoading: plotLoading } = useQuery({
    queryKey: ["open-plot", plot?._id],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/openPlot/getOpenplot/${plot?._id}`,
      );
      return res.data.data;
    },
    enabled: !!plot?._id,
  });
  const {
    data: innerPlots = [],
    isLoading: innerPlotsLoading,
    isError: innerPlotsError,
  } = useQuery({
    queryKey: ["inner-plots", openPlotData?._id],
    queryFn: () => getAllInnerPlot(openPlotData?._id),
    enabled: !!openPlotData?._id,
  });

  const galleryImages = useMemo(() => {
    return openPlotData?.images || [];
  }, [openPlotData?.images]);

  const openLightbox = (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setLightboxOpen(true);
  };

  const getEmbeddableGoogleMapSrc = (mapLink?: string): string => {
    if (!mapLink) return "";

    // If already embed link → use directly
    if (mapLink.includes("google.com/maps/embed")) {
      return mapLink;
    }

    // If share link → convert to embed
    if (mapLink.includes("google.com/maps")) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        mapLink,
      )}&output=embed`;
    }

    return "";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back + Edit/Delete */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/properties")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Open Plots
          </Button>
          <div className="flex md:flex-row flex-col gap-3">
            {canEdit && (
              <>
                <Button size="sm" onClick={() => setEditOpen(true)}>
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
            {openPlotData?.thumbnailUrl && (
              <div className="md:w-1/3">
                <img
                  src={getImageUrl(openPlotData?.thumbnailUrl)}
                  alt={openPlotData?.projectName}
                  className="h-64 w-full object-cover"
                />
              </div>
            )}
            <div
              className={`${openPlotData?.thumbnailUrl ? "md:w-2/3" : "w-full"} p-6`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {openPlotData?.projectName}
                  </h2>
                  {getStatusBadge(openPlotData?.status)}
                  <p className="text-muted-foreground mt-1">
                    Open Plot No: {openPlotData?.openPlotNo}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <Map className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Location: {openPlotData?.location}</span>
                </div>

                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    Total Area: {openPlotData?.totalArea}{" "}
                    {openPlotData?.areaUnit}
                  </span>
                </div>

                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Facing: {openPlotData?.facing || "N/A"}</span>
                </div>

                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    Road Width: {openPlotData?.roadWidthFt ?? "N/A"} ft
                  </span>
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

            <div className="flex gap-2">
              <Button variant="default" onClick={() => setBulkManualOpen(true)}>
                Plots Generate
              </Button>

              <Button variant="default" onClick={() => setCsvUploadOpen(true)}>
                Upload CSV
              </Button>

              <Button
                variant="destructive"
                onClick={() => setInnerPlotDialogOpen(true)}
              >
                Add Plot
              </Button>
            </div>
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
              {innerPlots.map((inner, idx) => {
                return (
                  <Card
                    key={inner._id || idx}
                    className="overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Thumbnail */}
                    {inner.thumbnailUrl ? (
                      <img
                        src={getImageUrl(inner.thumbnailUrl)}
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
                        onClick={() =>
                          navigate(
                            `/properties/openplot/${openPlotData?._id}/inner-detail/${inner._id}`,
                          )
                        }
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
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
                <strong>Survey No:</strong> {openPlotData?.surveyNo || "N/A"}
              </p>
              <p>
                <strong>Approval Authority:</strong>{" "}
                {openPlotData?.approvalAuthority || "N/A"}
              </p>
              <p>
                <strong>RERA No:</strong> {openPlotData?.reraNo || "N/A"}
              </p>
              <p>
                <strong>Document No:</strong>{" "}
                {openPlotData?.documentNo || "N/A"}
              </p>
              <p>
                <strong>Title Status:</strong>{" "}
                {getStatusBadge(openPlotData?.titleStatus)}
              </p>
              <p className="flex items-start">
                <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                {openPlotData?.remarks || "No remarks"}
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
              {openPlotData?.boundaries || "No boundary information available."}
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
                      src={getImageUrl(image)}
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
        {openPlotData?.googleMapsLocation ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <MapPin className="mr-2 h-5 w-5" /> Location Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                title="Plot Location"
                src={(() => {
                  const url = openPlotData?.googleMapsLocation || "";
                  if (!url) return "";
                  if (url.includes("/embed?pb=")) return url;
                  if (url.includes("/maps/place/"))
                    return url.replace("/maps/place/", "/maps/embed/place/");
                  const q = url.match(/q=([^&]+)/);
                  return `https://www.google.com/maps?q=${
                    q ? decodeURIComponent(q[1]) : encodeURIComponent(url)
                  }&output=embed`;
                })()}
                className="w-full h-96 rounded-lg border"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </CardContent>
          </Card>
        ) : (
          <p className="text-gray-500 italic">
            No map available for this openPlotData?.
          </p>
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
        <OpenPlotDialog
          open={editOpen}
          onOpenChange={(val) => {
            setEditOpen(val);

            if (!val) {
              queryClient.invalidateQueries({
                queryKey: ["open-plot", openPlotData?._id],
              });

              queryClient.refetchQueries({
                queryKey: ["open-plot", openPlotData?._id],
              });
            }
          }}
          openPlot={openPlotData}
        />
        {/* Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl h-[80vh] p-0">
            <img
              src={getImageUrl(currentImage)}
              alt="Full view of plot"
              className="w-full h-full object-contain"
            />
          </DialogContent>
        </Dialog>
        <InnerPlotDialog
          open={innerPlotDialogOpen}
          onOpenChange={(val) => {
            setInnerPlotDialogOpen(val);

            if (!val) {
              queryClient.invalidateQueries({
                queryKey: ["inner-plots", openPlotData?._id],
              });

              queryClient.refetchQueries({
                queryKey: ["inner-plots", openPlotData?._id],
              });
            }
          }}
          openPlotId={openPlotData?._id}
        />

        <BulkInnerPlotGenerator
          open={bulkManualOpen}
          onOpenChange={(val) => {
            setBulkManualOpen(val);

            if (!val) {
              queryClient.invalidateQueries({
                queryKey: ["inner-plots", openPlotData?._id],
              });

              queryClient.refetchQueries({
                queryKey: ["inner-plots", openPlotData?._id],
              });
            }
          }}
          openPlotId={openPlotData?._id}
        />

        <CsvInnerPlotUploader
          open={csvUploadOpen}
          onOpenChange={(val) => {
            setCsvUploadOpen(val);

            if (!val) {
              queryClient.invalidateQueries({
                queryKey: ["inner-plots", openPlotData?._id],
              });

              queryClient.refetchQueries({
                queryKey: ["inner-plots", openPlotData?._id],
              });
            }
          }}
          openPlotId={openPlotData?._id}
        />
      </div>
    </MainLayout>
  );
}
