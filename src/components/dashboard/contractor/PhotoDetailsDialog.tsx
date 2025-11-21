import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONSTRUCTION_PHASES } from "@/types/construction";
import { ChevronLeft, ChevronRight, Download, Printer } from "lucide-react";
import { PhotoEvidence } from "@/utils/contractor/ContractorConfig";

interface PhotoDetailsDialogProps {
  onOpenChange: (open: boolean) => void;
  photoEvidence: PhotoEvidence;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-amber-100 text-amber-800",
  pending_review: "bg-blue-100 text-blue-800",
};

const PhotoDetailsDialog = ({
  onOpenChange,
  photoEvidence,
}: PhotoDetailsDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!photoEvidence) {
    return null;
  }

  const { images } = photoEvidence;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    if (images.length === 1) {
      downloadImage(images[0].url, `photo-${currentImageIndex + 1}.jpg`);
    } else {
      images.forEach((image, idx) =>
        downloadImage(image.url, `photo-${idx + 1}.jpg`)
      );
    }
  };

  const handlePrint = () => {
    const image = images[currentImageIndex];
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Print Photo</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; }
            img { max-width: 100%; height: auto; }
            .caption { margin-top: 12px; font-size: 14px; }
          </style>
        </head>
        <body>
          <img src="${image.url}" alt="${image.caption}" />
          <div class="caption">${image.caption || ""}</div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
      printWindow.document.close();
    }
  };

  return (
    <DialogContent className="max-h-[90vh] sm:max-w-[600px] max-w-[90vw] w-full overflow-y-auto p-6 rounded-xl">
      <DialogHeader>
        <DialogTitle>{photoEvidence.title}</DialogTitle>
      </DialogHeader>
      <DialogDescription></DialogDescription>

      <Tabs defaultValue="photos" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="pt-4 space-y-4">
          <div className="relative bg-black rounded-md overflow-hidden">
            <div className="aspect-video flex items-center justify-center">
              <img
                src={images[currentImageIndex]?.url}
                alt={images[currentImageIndex]?.caption}
                className="max-h-[400px] max-w-full object-contain"
              />
            </div>

            {images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
              </>
            )}
          </div>

          <div className="text-sm font-medium">
            {images[currentImageIndex].caption}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {currentImageIndex + 1} of {images.length}
            </div>

            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 mt-4">
            {images.map((image, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-md overflow-hidden border-2 cursor-pointer ${
                  idx === currentImageIndex
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Project
              </p>
              <p>{photoEvidence.project}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Floor Number
              </p>
              <p>{photoEvidence.floorNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Unit Plot No
              </p>
              <p>{photoEvidence?.plotNo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Category
              </p>
              <p>
                {CONSTRUCTION_PHASES[
                  photoEvidence.category as keyof typeof CONSTRUCTION_PHASES
                ]?.title || photoEvidence.category}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p>{new Date(photoEvidence.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                variant="outline"
                className={statusColors[photoEvidence.status]}
              >
                {photoEvidence.status
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Photo Count
              </p>
              <p>{photoEvidence.images.length}</p>
            </div>
          </div>

          {photoEvidence.task && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Related Task
              </p>
              <p>{photoEvidence.task}</p>
            </div>
          )}

          {/* <div>
            <p className="text-sm font-medium text-muted-foreground">GPS Location</p>
            <p className="text-sm">12.9716° N, 77.5946° E (Bengaluru, Karnataka)</p>
          </div> */}

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Photo Details</p>
            <div className="space-y-2">
              {photoEvidence.images.map((image, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm">
                      {image.caption || `Photo ${idx + 1}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PhotoDetailsDialog;
