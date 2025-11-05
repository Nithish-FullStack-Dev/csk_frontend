import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Trees,
  Wifi,
  Dumbbell,
  Phone,
  Mail,
  Building,
  CheckCircle,
  XCircle,
  Ruler,
  LandPlot,
  ArrowLeft,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { SiteVisitDialog } from "@/components/public/SiteVisitDialog.tsx";
import axios from "axios";
import { Property } from "./PropertyInterfaces";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// --- Carousel Imports ---
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// --- Skeleton Loader Import ---
import PropertyDetailsSkeleton from "./PropertyDetailsSkeleton.tsx";
// import { usePropertyById } from "@/utils/public/Config.ts";
import { toast } from "sonner";
import CircleLoader from "@/components/CircleLoader.tsx";
import { usePropertyById } from "@/utils/public/Config.ts";

// --- Horizontal line for better separation ---

interface Amenity {
  name: string;
  icon: React.ElementType;
}

const ProjectDetailsPage = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // Embla Carousel Hooks
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Define a mapping of amenity names to icons for dynamic rendering
  const amenityIcons: { [key: string]: React.ElementType } = {
    Parking: Car,
    Garden: Trees,
    "Wi-Fi": Wifi,
    Gym: Dumbbell,
    "Swimming Pool": Bath, // Reusing Bath icon for pool, or you can add a new one
    // Add more mappings as needed based on your amenities data
  };

  const {
    data: property,
    isLoading: propertyByIdLoading,
    isError: propertyByIdError,
    error: propertyByIdErr,
    refetch,
  } = usePropertyById(id); // make sure 'id' is passed as a dependency
  console.log(property);
  if (propertyByIdError) {
    toast.error(propertyByIdErr.message);
    console.log("Ongoing properties error:", propertyByIdErr);
  }

  const handleSiteVisitSubmit = (data: any) => {
    console.log("Site visit scheduled:", data);
    setSiteVisitOpen(false);
  };

  const openLightbox = (imageSrc: string) => {
    setCurrentImage(imageSrc);
    setLightboxOpen(true);
  };

  if (propertyByIdLoading) {
    return (
      <PublicLayout>
        <PropertyDetailsSkeleton />
      </PublicLayout>
    );
  }

  if (error || !property) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p>{error || "Property details could not be loaded."}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go to Home
          </Button>
        </div>
      </PublicLayout>
    );
  }

  // Helper function to render amenity icons
  const renderAmenity = (amenityName: string) => {
    return (
      <div
        key={amenityName}
        className="flex items-center space-x-2 p-3 bg-navy-50 rounded-lg shadow-sm border border-navy-100"
      >
        <span className="text-sm font-medium text-navy-800">{amenityName}</span>
      </div>
    );
  };

  let allGalleryImages: string[] = [];

  if (property.images && property.images.length > 0) {
    allGalleryImages = [...allGalleryImages, ...property.images];
  }

  if (property?.images && property?.images.length > 0) {
    allGalleryImages = [...allGalleryImages, ...property?.images];
  }

  if (allGalleryImages.length === 0 && property?.thumbnailUrl) {
    allGalleryImages.push(property?.thumbnailUrl);
  }

  const galleryImages = allGalleryImages;

  const developer = {
    name: "Elite Homes Pvt. Ltd.",
    experience: "15+ years of experience",
    projects: "Delivered 50+ successful projects",
  };

  const showCarousel = galleryImages.length > 3;
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
      const API_BASE = import.meta.env.VITE_URL || "http://localhost:3000";
      const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
        url
      )}&filename=${encodeURIComponent(projectName || "brochure")}`;

      // Open in a new tab so the backend redirects to a signed Cloudinary URL and browser downloads
      window.open(proxyUrl, "_blank", "noopener,noreferrer");
      toast.success("Download starting...");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download brochure.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-gray-100">
      {/* Hero Section */}

      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={
            property?.thumbnailUrl ||
            "https://via.placeholder.com/1500x800/2C3E50/E8B923?text=Luxury+Property"
          }
          alt={property?.projectName}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <Badge
                className={`py-1 px-3 text-sm font-semibold rounded-full ${
                  status === "ongoing"
                    ? "bg-green-500 hover:bg-green-600"
                    : status === "completed"
                    ? "bg-gold-500 hover:bg-gold-600 text-navy-900"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {property?.constructionStatus}
              </Badge>
              <Badge
                variant="outline"
                className="text-white border-gold-400 bg-transparent hover:bg-gold-500 hover:text-navy-900 transition-colors"
              >
                {property?.propertyType}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-md font-vidaloka mb-3 leading-tight drop-shadow-lg text-gold-100">
              {property?.projectName}
            </h1>
            <p className="text-xl md:text-2xl flex items-center font-medium drop-shadow-md text-gold-300">
              <MapPin className="mr-3 h-6 w-6 text-gold-400" />
              {property?.location}
            </p>
          </div>
        </div>
      </section>

      {/* Project Overview and Sidebar */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    About This Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-navy-700 leading-relaxed text-base">
                    {property?.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="shadow-xl border-t-4 border-navy-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    Amenities & Features
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {property?.amenities && property.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {property.amenities.map((amenity) =>
                        renderAmenity(amenity)
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-navy-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-7 w-7 text-navy-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2m10 0v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4"
                          />
                        </svg>
                      </div>
                      <p className="text-navy-700 font-medium text-base">
                        No amenities added yet
                      </p>
                      <p className="text-navy-500 text-sm">
                        Amenities & features will appear here once added.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    Property Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Total Units:</span>{" "}
                        {property?.totalUnits}
                      </p>
                    </div>
                    {/* <div className="flex items-center space-x-3">
                      <Ruler className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Unit Size:</span>{" "}
                        {property?.}
                      </p>
                    </div> */}
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Launch Date:</span>{" "}
                        {new Date(property?.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gold-600" />
                      <p className="text-navy-700">
                        <span className="font-semibold">Possession:</span>{" "}
                        {new Date(property?.completionDate).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {property?.municipalPermission ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <p className="text-navy-700">
                        <span className="font-semibold">Approval:</span>{" "}
                        {property?.municipalPermission ? "Approved" : "Pending"}
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
                      Property Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showCarousel ? (
                      <div className="embla relative">
                        <div className="embla__viewport" ref={emblaRef}>
                          <div className="embla__container">
                            {galleryImages.map((image, index) => (
                              <div className="embla__slide" key={index}>
                                <AspectRatio ratio={16 / 9}>
                                  <img
                                    src={image}
                                    alt={`${property?.projectName} ${
                                      index + 1
                                    }`}
                                    className="w-full h-full object-cover rounded-lg cursor-pointer shadow-md"
                                    onClick={() => openLightbox(image)}
                                  />
                                </AspectRatio>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          className="embla_button embla_button--prev absolute top-1/2 -translate-y-1/2 left-2 p-2 bg-gold-500 text-navy-900 rounded-full shadow-lg hover:bg-gold-600 transition-colors"
                          onClick={scrollPrev}
                        >
                          <ArrowLeft className="h-6 w-6" />
                        </button>
                        <button
                          className="embla_button embla_button--next absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-gold-500 text-navy-900 rounded-full shadow-lg hover:bg-gold-600 transition-colors"
                          onClick={scrollNext}
                        >
                          <ArrowRight className="h-6 w-6" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImages.map((image, index) => (
                          <AspectRatio key={index} ratio={16 / 9}>
                            <img
                              src={image}
                              alt={`${property?.projectName} ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-md"
                              onClick={() => openLightbox(image)}
                            />
                          </AspectRatio>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Location Map Placeholder */}
              {property?.googleMapsLocation && (
                <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                      Location on Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm italic overflow-hidden">
                      <iframe
                        src={property?.googleMapsLocation}
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                    <p className="mt-4 text-center text-gold-600 hover:underline cursor-pointer">
                      <a
                        href={property?.googleMapsLocation}
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
              {/* Price & CTA */}
              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardContent className="p-6 text-center space-y-5">
                  {/* <div className="text-4xl font-extrabold text-gold-700">
                    {property?.priceRange?.min}
                  </div> */}
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 text-lg rounded-lg shadow-md transition-colors font-md "
                      onClick={() => setSiteVisitOpen(true)}
                    >
                      Schedule Site Visit
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gold-600 text-gold-600 hover:bg-gold-50 hover:text-gold-700 py-3 text-lg rounded-lg transition-colors flex items-center justify-center font-semibold"
                    >
                      <Phone className="mr-3 h-5 w-5" />
                      Call Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gold-600 text-gold-600 hover:bg-gold-50 hover:text-gold-700 py-3 text-lg rounded-lg transition-colors flex items-center justify-center font-semibold"
                      onClick={(e) =>
                        handleDownload(
                          e,
                          property?.brochureUrl ?? null,
                          property?.projectName
                        )
                      }
                    >
                      <Mail className="mr-3 h-5 w-5" />
                      Get Brochure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Key Details */}
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
                        status === "ongoing"
                          ? "bg-green-500"
                          : status === "completed"
                          ? "bg-gold-500 text-navy-900"
                          : "bg-orange-500"
                      }`}
                    >
                      {property?.constructionStatus}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-navy-100">
                    <span className="text-navy-700 font-medium">
                      Completion:
                    </span>
                    <span className="text-navy-800 font-semibold">
                      {new Date(property?.completionDate).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-navy-100">
                    <span className="text-navy-700 font-medium">Type:</span>
                    <span className="text-navy-800 font-semibold">
                      {property?.propertyType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b last:border-b-0 border-navy-100">
                    <span className="text-navy-700 font-medium">
                      Units Available:
                    </span>
                    <span className="text-green-600 font-bold">
                      {property?.constructionStatus === "Completed"
                        ? "Available"
                        : "Limited/Sold Out"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Developer Info */}
              <Card className="shadow-xl border-t-4 border-gold-600 bg-navy-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-md font-vidaloka text-navy-800">
                    Developer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-semibold text-lg text-navy-800">
                    {developer.name}
                  </p>
                  <p className="text-sm text-navy-600 flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gold-600" />
                    {developer.experience}
                  </p>
                  <p className="text-sm text-navy-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-gold-600" />
                    {developer.projects}
                  </p>
                  {/* Add more developer contact info if available in your data */}
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
        onSubmit={handleSiteVisitSubmit}
        projectName={property?.projectName}
      />

      {/* Lightbox for image gallery */}
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

export default ProjectDetailsPage;
