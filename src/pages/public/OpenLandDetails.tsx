import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Edit,
  Trash,
  MapPin,
  Building,
  Ruler,
  LandPlot,
  User,
  FileText,
  MessageSquare,
  Check,
  X,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Calendar,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { OpenLand } from "@/types/OpenLand";
// import { OpenLand } from "@/types/openLand";

interface OpenLandDetailsProps {
  land: OpenLand;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    Reserved: "bg-purple-500",
    Blocked: "bg-red-500",
  };
  return (
    <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>
      {status}
    </Badge>
  );
}

const developer = {
  name: "CSK Real Estate",
  experience: "15+ years experience",
  projects: "Delivered 50+ projects",
};

export function OpenLandDetails({
  land,
  onEdit,
  onDelete,
  onBack,
}: OpenLandDetailsProps) {
  const { user } = useAuth();
  const canEdit = user && ["owner", "admin"].includes(user.role);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000 }),
  ]);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const galleryImages = useMemo(() => {
    const all = new Set<string>(land.images || []);
    if (land.thumbnailUrl) all.add(land.thumbnailUrl);
    return Array.from(all);
  }, [land]);

  const openLightbox = (img: string) => {
    setCurrentImage(img);
    setLightboxOpen(true);
  };

  const handleDownload = async (e: any, url?: string | null) => {
    e.stopPropagation();
    if (!url) return toast.error("No brochure available.");

    const API_BASE = import.meta.env.VITE_URL;
    const proxy = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
      url
    )}&filename=${encodeURIComponent(land.projectName)}`;

    window.open(proxy, "_blank");
    toast.success("Starting download...");
  };

  const embedMap = (url?: string) =>
    url ? `${url}` : "https://www.google.com/maps";

  const showCarousel = galleryImages.length > 3;

  return (
    <div className="space-y-6">
      {/* Back & Edit/Delete */}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to All Lands
        </Button>

        {canEdit && (
          <div className="flex gap-3">
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

      {/* HERO */}
      <div className="relative h-72 w-full overflow-hidden rounded-xl shadow-lg">
        <img
          src={
            land.thumbnailUrl ||
            "https://via.placeholder.com/1500x800/2C3E50/E8B923?text=Open+Land"
          }
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            {getStatusBadge(land.landStatus)}
            <Badge variant="outline" className="text-white border-white">
              {land.landType}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            {land.projectName}
          </h1>
        </div>
      </div>

      {/* DESCRIPTION */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" /> About this Land
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            {land.description || "No description available."}
          </p>
        </CardContent>
      </Card>

      {/* SPECS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Building className="mr-2 h-5 w-5" /> Land Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong>Land Type:</strong> {land.landType}
          </p>
          <p>
            <strong>Approval:</strong> {land.LandApproval}
          </p>
          <p>
            <strong>Facing:</strong> {land.facing}
          </p>
          <p>
            <strong>Area:</strong> {land.landArea} {land.areaUnit}
          </p>
          <p>
            <strong>Road Access:</strong> {land.roadAccessWidth || "N/A"}
          </p>
          <p>
            <strong>Available Date:</strong>{" "}
            {land.availableDate
              ? new Date(land.availableDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>RERA Approved:</strong>{" "}
            {land.reraApproved ? (
              <Check className="inline h-4 w-4 text-green-600" />
            ) : (
              <X className="inline h-4 w-4 text-red-600" />
            )}
          </p>
        </CardContent>
      </Card>

      {/* OWNER */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <User className="mr-2 h-5 w-5" /> Owner Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Name:</strong>{" "}
            {land.ownerCustomer?.name || land.ownerName || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {land.ownerCustomer?.phone || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {land.ownerCustomer?.email || "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* INTERESTED LEADS */}
      {land.interestedCustomers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Interested Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {land.interestedCustomers.map((entry: any) => (
              <div
                key={entry._id}
                className="p-3 border-b border-gray-200 last:border-none"
              >
                <p className="font-semibold">{entry.lead?.name}</p>
                <p className="text-sm text-gray-600">{entry.lead?.phone}</p>
                <p className="text-xs text-gray-500">
                  Agent: {entry.agent?.name}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* GALLERY */}
      {galleryImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" /> Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showCarousel ? (
              <div className="embla relative">
                <div className="embla__viewport" ref={emblaRef}>
                  <div className="embla__container">
                    {galleryImages.map((image, i) => (
                      <div className="embla__slide" key={i}>
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={image}
                            className="w-full h-full object-cover rounded-lg cursor-pointer"
                            onClick={() => openLightbox(image)}
                          />
                        </AspectRatio>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/60 text-white rounded-full p-2"
                  onClick={scrollPrev}
                >
                  <ArrowLeft />
                </button>

                <button
                  className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/60 text-white rounded-full p-2"
                  onClick={scrollNext}
                >
                  <ArrowRight />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((image, i) => (
                  <AspectRatio key={i} ratio={16 / 9}>
                    <img
                      src={image}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => openLightbox(image)}
                    />
                  </AspectRatio>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MAP */}
      {land.googleMapsLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={embedMap(land.googleMapsLocation)}
              className="w-full h-96 rounded-lg border"
              loading="lazy"
            ></iframe>
          </CardContent>
        </Card>
      )}

      {/* LIGHTBOX */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 bg-black">
          <img src={currentImage} className="w-full h-full object-contain" />
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <h2 className="text-lg font-bold mb-2">Confirm Delete</h2>
          <p>Are you sure you want to delete this Open Land?</p>

          <div className="flex justify-end gap-3 mt-4">
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
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
