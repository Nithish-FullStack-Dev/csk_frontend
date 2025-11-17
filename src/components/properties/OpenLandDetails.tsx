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
  FileText,
  Check,
  X,
  Image as ImageIcon,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { OpenLand } from "@/types/OpenLand";

export function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    Reserved: "bg-purple-500",
    Blocked: "bg-red-500",
    "Under Discussion": "bg-yellow-500",
  };
  return (
    <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>
      {status}
    </Badge>
  );
}

interface OpenLandDetailsProps {
  land: OpenLand;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const OpenLandDetails = ({
  land,
  onBack,
  onEdit,
  onDelete,
}: OpenLandDetailsProps) => {
  const { user } = useAuth();
  const canEdit = user && ["owner", "admin"].includes(user.role);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const galleryImages = useMemo(() => {
    const images = new Set<string>(land.images || []);
    if (land.thumbnailUrl) images.add(land.thumbnailUrl);
    return Array.from(images);
  }, [land.images, land.thumbnailUrl]);

  const handleDownload = (e: React.MouseEvent, url?: string | null) => {
    e.stopPropagation();
    if (!url) return toast.error("No brochure available.");
    const API_BASE = import.meta.env.VITE_URL || "http://localhost:3000";

    const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
      url
    )}&filename=${encodeURIComponent(land.projectName)}`;

    window.open(proxyUrl, "_blank");
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
      {/* Header Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Open Lands
        </Button>

        {canEdit && (
          <div className="flex gap-3">
            <Button size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Overview */}
      <Card>
        <div className="flex flex-col md:flex-row">
          {land?.thumbnailUrl && (
            <div className="md:w-1/3">
              <img
                src={land?.thumbnailUrl}
                alt={land?.projectName}
                className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
          )}

          <div className={`p-6 ${land?.thumbnailUrl ? "md:w-2/3" : "w-full"}`}>
            <h2 className="text-2xl font-bold mb-1">{land?.projectName}</h2>
            {getStatusBadge(land?.availabilityStatus)}

            <p className="text-muted-foreground mt-1">
              {land?.location || "No location provided"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>
                  Land Area: {land?.landArea} {land?.areaUnit}
                </span>
              </div>

              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Land Type: {land?.landType}</span>
              </div>

              {land?.facing && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Facing: {land?.facing}</span>
                </div>
              )}

              {land?.pricePerUnit && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Price / Unit: ₹{land?.pricePerUnit}</span>
                </div>
              )}
            </div>

            {land?.brochureUrl && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={(e) => handleDownload(e, land?.brochureUrl)}
              >
                <FileText className="mr-2 h-4 w-4" /> Download Brochure
              </Button>
            )}
          </div>
        </div>
      </Card>
      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Legal Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Approval:</strong> {land?.landApproval}
          </p>

          <p>
            <strong>RERA Approved:</strong>{" "}
            {land?.reraApproved ? (
              <Check className="inline-block h-4 w-4 text-green-500" />
            ) : (
              <X className="inline-block h-4 w-4 text-red-500" />
            )}
          </p>

          {land?.reraNumber && (
            <p>
              <strong>RERA Number:</strong> {land?.reraNumber}
            </p>
          )}

          <p>
            <strong>Municipal Permission:</strong>{" "}
            {land?.municipalPermission ? (
              <Check className="inline-block h-4 w-4 text-green-500" />
            ) : (
              <X className="inline-block h-4 w-4 text-red-500" />
            )}
          </p>

          {land?.description && (
            <p className="mt-3">
              <strong>Description:</strong> {land?.description}
            </p>
          )}
        </CardContent>
      </Card>
      {/* Owner / Buyer / Interested */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <User className="mr-2 h-5 w-5" /> Customer Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <p>
            <strong>Owner:</strong>{" "}
            {land?.ownerCustomer?.name || "Not Assigned"}
          </p>

          <div>
            <strong>Interested Customers:</strong>
            {land?.interestedCustomers?.length ? (
              <ul className="list-disc ml-4">
                {land?.interestedCustomers.map((c: any, index: number) => (
                  <li key={index}>
                    {c.name} ({c.phone})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No interested customers</p>
            )}
          </div>

          <p>
            <strong>Sold To:</strong> {land?.soldToCustomer?.name || "Not Sold"}
          </p>

          <p>
            <strong>Sold Date:</strong>{" "}
            {land?.soldDate
              ? new Date(land?.soldDate).toLocaleDateString("en-IN")
              : "—"}
          </p>
        </CardContent>
      </Card>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" /> Gallery
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentImage(img);
                    setLightboxOpen(true);
                  }}
                  className="cursor-pointer rounded-lg overflow-hidden"
                >
                  <img
                    src={img}
                    alt="Land"
                    className="w-full h-32 object-cover hover:scale-110 transition"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}

      {land?.googleMapsLocation ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              title="Plot Location"
              src={getEmbeddableGoogleMapSrc(land?.googleMapsLocation)}
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
    </div>
  );
};

export default OpenLandDetails;
