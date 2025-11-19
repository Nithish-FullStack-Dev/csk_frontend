// src/pages/public/OpenLandDetails.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  XCircle,
  Building,
  Phone,
  Mail,
  TreePine,
  Ruler,
  Truck,
  Droplet,
  Zap,
  User,
  Fence,
  Compass,
} from "lucide-react";
import { SiteVisitDialog } from "@/components/public/SiteVisitDialog";
import { toast } from "sonner";
import CircleLoader from "@/components/CircleLoader";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useOpenLandById } from "@/utils/public/Config";
import { OpenLand } from "@/types/OpenLand";

const OpenLandDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // UI state
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");

  // Embla carousel hook (always called to keep hooks order stable)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3500, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Query hook (from your utils)
  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useOpenLandById(id || "");

  // Normalize response into a single OpenLand | null
  const land: OpenLand | null = useMemo(() => {
    if (!rawData) return null;

    // Cases:
    // 1) API returned object { success: true, lands: [...] }
    // 2) API returned { data: {...} } or { data: { lands: [...] } }
    // 3) API returned single object already (land)
    // 4) Your fetcher might have returned the actual land or wrapped shapes

    // attempt common shapes:
    const r: any = rawData as any;

    // shape: { success, lands: [...] }
    if (Array.isArray(r.lands) && r.lands.length > 0) return r.lands[0];

    // shape: { data: { lands: [...] } }
    if (r.data && Array.isArray(r.data.lands) && r.data.lands.length > 0)
      return r.data.lands[0];

    // shape: { data: {...land...} }
    if (r.data && typeof r.data === "object" && !Array.isArray(r.data))
      return r.data;

    // shape: the object itself is the land
    if (r._id || r.projectName || r.landType) return r as OpenLand;

    // fallback null
    return null;
  }, [rawData]);

  useEffect(() => {
    if (isError && error) {
      // show readable message
      toast.error((error as any)?.message || "Failed to load open land");
      console.error("OpenLand fetch error:", error);
    }
  }, [isError, error]);

  // Build gallery images
  const galleryImages: string[] = useMemo(() => {
    if (!land) return [];
    const imgs: string[] = [];

    if (Array.isArray(land.images) && land.images.length > 0) {
      imgs.push(...land.images);
    }

    // ensure thumbnail is included first if present
    if (land.thumbnailUrl && !imgs.includes(land.thumbnailUrl)) {
      imgs.unshift(land.thumbnailUrl);
    }

    // unique
    return Array.from(new Set(imgs));
  }, [land]);

  const showCarousel = galleryImages.length > 3;

  // Map features derived from land fields
  const features = useMemo(() => {
    if (!land) return [];
    const list: { name: string; Icon?: React.ElementType }[] = [];

    if (land.fencingAvailable)
      list.push({ name: "Fencing Available", Icon: Fence });
    if (land.waterFacility)
      list.push({ name: "Water Facility", Icon: Droplet });
    if (land.electricity) list.push({ name: "Electricity", Icon: Zap });
    if (land.facing)
      list.push({ name: `${land.facing} Facing`, Icon: Compass });
    if (land.roadAccessWidth)
      list.push({ name: `${land.roadAccessWidth} Road Access`, Icon: Truck });
    if (land.LandApproval)
      list.push({ name: `${land.LandApproval} Approval`, Icon: Building });
    if (land.landArea && land.areaUnit)
      list.push({ name: `${land.landArea} ${land.areaUnit}`, Icon: Ruler });

    // fallback
    if (list.length === 0)
      list.push({ name: land.landType || "Land", Icon: Building });

    return list;
  }, [
    land?.fencingAvailable,
    land?.waterFacility,
    land?.electricity,
    land?.facing,
    land?.roadAccessWidth,
    land?.LandApproval,
    land?.landArea,
    land?.areaUnit,
    land?.landType,
  ]);

  const openLightbox = (src: string) => {
    setCurrentImage(src);
    setLightboxOpen(true);
  };

  const handleDownload = async (
    e: React.MouseEvent,
    url?: string | null,
    projectName?: string | null
  ) => {
    e.stopPropagation();
    if (!url) {
      toast.error("No brochure available to download.");
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_URL || "";
      const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
        url
      )}&filename=${encodeURIComponent(projectName || "brochure")}`;
      window.open(proxyUrl, "_blank", "noopener,noreferrer");
      toast.success("Download starting...");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download brochure.");
    }
  };

  // Loading / not found states
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <CircleLoader />
        </div>
      </PublicLayout>
    );
  }

  if (!land) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">Not Found</h1>
        <p className="mt-4 text-gray-600">
          Open land details could not be loaded.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="outline" className="ml-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-gray-100">
      {/* HERO */}
      <section className="relative h-80 md:h-[420px] overflow-hidden">
        <img
          src={
            land.thumbnailUrl ||
            "https://via.placeholder.com/1500x800?text=Open+Land"
          }
          alt={land.projectName}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <Badge
                className={`py-1 px-3 text-sm font-semibold rounded-full ${
                  land.landStatus === "Available"
                    ? "bg-green-500"
                    : land.landStatus === "Sold"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {land.landStatus || "Status"}
              </Badge>
              <Badge
                variant="outline"
                className="text-white border-white/30 bg-transparent"
              >
                {land.landType || "Land"}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-md font-vidaloka mb-2 leading-tight drop-shadow-lg">
              {land.projectName}
            </h1>

            <p className="text-lg md:text-xl flex items-center gap-3 text-white/90">
              <MapPin className="h-5 w-5" />
              {land.location || "Location not specified"}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN + SIDEBAR */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    About this Land
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-navy-700 leading-relaxed text-base">
                    {land.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="shadow-xl border-t-4 border-navy-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    Land Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {features.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {features.map((f, idx) => {
                        const Icon = f.Icon || User;
                        return (
                          <div
                            key={idx}
                            className="flex items-center space-x-3 p-3 bg-navy-50 rounded-lg shadow-sm border border-navy-100"
                          >
                            <Icon className="h-5 w-5 text-gold-600" />
                            <span className="text-sm font-medium text-navy-800">
                              {f.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-navy-600">
                      No features available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Owner:</span>{" "}
                        {land.ownerName || "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Available From:</span>{" "}
                        {land.availableDate
                          ? new Date(land.availableDate).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Ruler className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Area:</span>{" "}
                        {land.landArea
                          ? `${land.landArea} ${land.areaUnit || ""}`
                          : "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Approval:</span>{" "}
                        {land.LandApproval || "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Ruler className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Road Access:</span>{" "}
                        {land.roadAccessWidth || "-"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-gold-600 font-semibold">
                        Survey#
                      </span>
                      <p className="text-navy-700">
                        {land.surveyNumber || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <Card className="shadow-xl border-t-4 border-navy-600 bg-navy-50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                      Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showCarousel ? (
                      <div className="embla relative">
                        <div className="embla__viewport" ref={emblaRef}>
                          <div className="embla__container">
                            {galleryImages.map((img, idx) => (
                              <div className="embla__slide" key={idx}>
                                <AspectRatio ratio={16 / 9}>
                                  <img
                                    src={img}
                                    alt={`${land.projectName} ${idx + 1}`}
                                    className="w-full h-full object-cover rounded-lg cursor-pointer shadow-md"
                                    onClick={() => openLightbox(img)}
                                  />
                                </AspectRatio>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          className="embla__button embla__button--prev absolute top-1/2 -translate-y-1/2 left-2 p-2 bg-gold-500 text-navy-900 rounded-full shadow-lg hover:bg-gold-600 transition-colors"
                          onClick={scrollPrev}
                        >
                          <ArrowLeft className="h-6 w-6" />
                        </button>
                        <button
                          className="embla__button embla__button--next absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-gold-500 text-navy-900 rounded-full shadow-lg hover:bg-gold-600 transition-colors"
                          onClick={scrollNext}
                        >
                          <ArrowRight className="h-6 w-6" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImages.map((img, idx) => (
                          <AspectRatio key={idx} ratio={16 / 9}>
                            <img
                              src={img}
                              alt={`${land.projectName} ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-md"
                              onClick={() => openLightbox(img)}
                            />
                          </AspectRatio>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              {land.googleMapsLocation && (
                <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                      Location on Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={land.googleMapsLocation}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <p className="mt-4 text-center text-gold-600 hover:underline cursor-pointer">
                      <a
                        href={land.googleMapsLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Google Maps
                      </a>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardContent className="p-6 text-center space-y-5">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full border-gold-600 text-gold-600 hover:bg-gold-50 hover:text-gold-700 py-3 text-lg rounded-lg transition-colors flex items-center justify-center font-semibold"
                      asChild
                    >
                      <a href="tel:+919876543212">
                        <Phone className="mr-3 h-5 w-5" />
                        Call Now
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-gold-600 text-gold-600 hover:bg-gold-50 hover:text-gold-700 py-3 text-lg rounded-lg transition-colors flex items-center justify-center font-semibold"
                      onClick={(e) =>
                        handleDownload(
                          e,
                          land.brochureUrl ?? null,
                          land.projectName
                        )
                      }
                    >
                      <Mail className="mr-3 h-5 w-5" />
                      Get Brochure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-t-4 border-navy-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    Key Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-navy-100">
                    <span className="text-navy-700 font-medium">Status:</span>
                    <Badge
                      className={`py-1 px-3 text-sm font-semibold rounded-full ${
                        land.landStatus === "Available"
                          ? "bg-green-500"
                          : land.landStatus === "Sold"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {land.landStatus}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-navy-100">
                    <span className="text-navy-700 font-medium">Type:</span>
                    <span className="text-navy-800 font-semibold">
                      {land.landType || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-navy-100">
                    <span className="text-navy-700 font-medium">Area:</span>
                    <span className="text-navy-800 font-semibold">
                      {land.landArea
                        ? `${land.landArea} ${land.areaUnit || ""}`
                        : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-navy-100">
                    <span className="text-navy-700 font-medium">Approval:</span>
                    <span className="text-navy-800 font-semibold">
                      {land.LandApproval || "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    Owner & Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="h-6 w-6 text-gold-600" />
                      <div>
                        <div className="text-navy-800 font-semibold">
                          {land.ownerName || "-"}
                        </div>
                        <div className="text-navy-600 text-sm">Owner</div>
                      </div>
                    </div>

                    {Array.isArray(land.interestedCustomers) &&
                    land.interestedCustomers.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-base font-semibold text-navy-800">
                          Interested Customers
                        </h4>
                        <div className="space-y-2">
                          {land.interestedCustomers.map((ic: any) => (
                            <div
                              key={ic._id}
                              className="p-3 border rounded-lg bg-white/60 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm font-medium">
                                  {ic.lead?.name}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-navy-600">
                                  {ic.agent?.name}
                                </div>
                                <div className="text-xs text-navy-500">
                                  {ic.createdAt
                                    ? new Date(
                                        ic.createdAt
                                      ).toLocaleDateString()
                                    : ""}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-navy-600">
                        No interested leads yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Site Visit Dialog */}
      <SiteVisitDialog
        open={siteVisitOpen}
        onOpenChange={setSiteVisitOpen}
        onSubmit={() => setSiteVisitOpen(false)}
        projectName={land.projectName}
      />

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-screen-xl h-[90vh] p-0 flex items-center justify-center bg-black/80">
          <img
            src={currentImage}
            alt="Full view"
            className="max-h-full max-w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpenLandDetails;
