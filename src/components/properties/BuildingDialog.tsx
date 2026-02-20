import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Building } from "@/types/building";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { UploadCloud, X } from "lucide-react";

interface BuildingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building?: Building;
  mode: "add" | "edit";
  onSuccessfulSave: () => void;
}

export const BuildingDialog = ({
  open,
  onOpenChange,
  building,
  mode,
  onSuccessfulSave,
}: BuildingDialogProps) => {
  const [formData, setFormData] = useState<Building>({
    projectName: "",
    location: "",
    propertyType: "Apartment Complex",
    totalUnits: 0,
    availableUnits: 0,
    soldUnits: 0,
    constructionStatus: "Planned",
    completionDate: "",
    description: "",
    municipalPermission: false,
    reraApproved: false,
    reraNumber: "",
    thumbnailUrl: "",
    brochureUrl: null,
    googleMapsLocation: "",
    images: [],
    brochureFileId: null,
    amenities: [],
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [brochurePreview, setBrochurePreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    const safeDate = (date?: string | Date | null) => {
      if (!date) return "";
      const d = new Date(date);
      return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    };

    if (building) {
      setFormData({
        projectName: building.projectName || "",
        location: building.location || "",
        propertyType: building.propertyType || "Apartment Complex",
        totalUnits: building.totalUnits || 0,
        availableUnits: building.availableUnits || 0,
        soldUnits: building.soldUnits || 0,
        constructionStatus: building.constructionStatus || "Planned",
        completionDate: safeDate(building?.completionDate),
        description: building.description || "",
        municipalPermission: building.municipalPermission || false,
        reraApproved: building.reraApproved || false,
        reraNumber: building.reraNumber || "",
        thumbnailUrl: building.thumbnailUrl || "",
        brochureUrl: building.brochureUrl || null,
        googleMapsLocation: building.googleMapsLocation || "",
        images: building.images || [],
        brochureFileId: building.brochureFileId || null,
        amenities: building.amenities || [],
      });

      setThumbnailPreview(building.thumbnailUrl || "");
      setBrochurePreview(building.brochureUrl || null);
      setImagePreviews(building.images || []);
      setSelectedAmenities(building.amenities || []);
      setThumbnailFile(null);
      setBrochureFile(null);
      setImageFiles([]);
      setAmenityInput("");
    } else {
      resetForm();
    }
  }, [building, open]);

  const resetForm = () => {
    setFormData({
      projectName: "",
      location: "",
      propertyType: "Apartment Complex",
      totalUnits: 0,
      availableUnits: 0,
      soldUnits: 0,
      constructionStatus: "Planned",
      completionDate: "",
      description: "",
      municipalPermission: false,
      reraApproved: false,
      reraNumber: "",
      thumbnailUrl: "",
      brochureUrl: null,
      googleMapsLocation: "",
      images: [],
      brochureFileId: null,
      amenities: [],
    });
    setThumbnailFile(null);
    setBrochureFile(null);
    setThumbnailPreview("");
    setBrochurePreview(null);
    setImageFiles([]);
    setImagePreviews([]);
    setSelectedAmenities([]);
    setAmenityInput("");
    if (brochureInputRef.current) {
      brochureInputRef.current.value = "";
    }
  };

  const validateFile = (
    file: File,
    type: "image" | "pdf",
    maxSizeMB: number,
  ) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return false;
    }
    if (type === "pdf" && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return false;
    }
    if (file.size > maxSizeBytes) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    return true;
  };

  const createBuilding = useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/building/createBuilding`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Building added successfully");
      resetForm();
      onSuccessfulSave();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add building.");
    },
  });

  const updateBuilding = useMutation({
    mutationFn: async (payload: FormData) => {
      console.log(building?._id);
      const { data } = await axios.patch(
        `${import.meta.env.VITE_URL}/api/building/updateBuilding/${
          building?._id
        }`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Building updated successfully");
      resetForm();
      onSuccessfulSave();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update building.");
    },
  });

  const handleAddAmenity = () => {
    if (!amenityInput.trim()) {
      toast.error("Please enter an amenity");
      return;
    }
    if (selectedAmenities.includes(amenityInput.trim())) {
      toast.error("This amenity is already added");
      return;
    }
    setSelectedAmenities((prev) => [...prev, amenityInput.trim()]);
    setFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, amenityInput.trim()],
    }));
    setAmenityInput("");
  };

  const removeAmenity = (index: number) => {
    setSelectedAmenities((prev) => {
      const newAmenities = [...prev];
      newAmenities.splice(index, 1);
      return newAmenities;
    });
    setFormData((prev) => {
      const newAmenities = [...prev.amenities];
      newAmenities.splice(index, 1);
      return { ...prev, amenities: newAmenities };
    });
  };

  const validateForm = () => {
    if (!formData.projectName.trim()) {
      toast.error("Project name is required");
      return false;
    }

    if (!formData.location.trim()) {
      toast.error("Location is required");
      return false;
    }

    if (!formData.propertyType) {
      toast.error("Property type is required");
      return false;
    }

    if (!formData.totalUnits || formData.totalUnits <= 0) {
      toast.error("Total units must be greater than 0");
      return false;
    }

    if (formData.availableUnits < 0) {
      toast.error("Available units cannot be negative");
      return false;
    }

    if (formData.availableUnits > formData.totalUnits) {
      toast.error("Available units cannot exceed total units");
      return false;
    }

    if (!formData.constructionStatus) {
      toast.error("Construction status is required");
      return false;
    }

    if (formData.reraApproved && !formData.reraNumber?.trim()) {
      toast.error("RERA number is required when RERA approved");
      return false;
    }

    if (mode === "add" && !thumbnailFile) {
      toast.error("Thumbnail image is required");
      return false;
    }

    if (mode === "add" && !brochureFile) {
      toast.error("Project brochure PDF is required");
      return false;
    }
    if (
      formData.googleMapsLocation &&
      !/^https?:\/\/(www\.)?google\.[a-z.]+\/maps/.test(
        formData.googleMapsLocation,
      )
    ) {
      toast.error("Enter a valid Google Maps link");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = new FormData();

    payload.append("projectName", formData.projectName.trim());
    payload.append("location", formData.location.trim());
    payload.append("propertyType", formData.propertyType);
    payload.append("totalUnits", String(formData.totalUnits));
    payload.append("availableUnits", String(formData.availableUnits));
    payload.append(
      "soldUnits",
      String(formData.totalUnits - formData.availableUnits),
    );
    payload.append("constructionStatus", formData.constructionStatus);

    if (formData.completionDate)
      payload.append("completionDate", formData.completionDate);

    if (formData.description)
      payload.append("description", formData.description.trim());

    payload.append("municipalPermission", String(formData.municipalPermission));
    payload.append("reraApproved", String(formData.reraApproved));

    if (formData.reraNumber)
      payload.append("reraNumber", formData.reraNumber.trim());

    if (formData.googleMapsLocation)
      payload.append("googleMapsLocation", formData.googleMapsLocation.trim());

    if (thumbnailFile) payload.append("thumbnailUrl", thumbnailFile);
    if (brochureFile) payload.append("brochureUrl", brochureFile);

    if (mode === "edit" && !brochureFile && !brochurePreview) {
      payload.append("brochureRemoved", "true");
    }

    imageFiles.forEach((file) => payload.append("images", file));
    selectedAmenities.forEach((amenity) =>
      payload.append("amenities[]", amenity),
    );

    if (mode === "add") {
      createBuilding.mutate(payload);
    } else {
      updateBuilding.mutate(payload);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      const url = newPreviews[index];
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const removeBrochure = () => {
    if (brochurePreview && brochurePreview.startsWith("blob:")) {
      URL.revokeObjectURL(brochurePreview);
    }
    setBrochureFile(null);
    setBrochurePreview(null);
    setFormData((prev) => ({ ...prev, brochureUrl: null }));
    if (brochureInputRef.current) {
      brochureInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Property" : "Edit Property"}
          </DialogTitle>
          <DialogDescription>Manage Property details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project Name *</Label>
              <Input
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property Type *</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    propertyType: v as Building["propertyType"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment Complex">
                    Apartment Complex
                  </SelectItem>
                  <SelectItem value="Villa Complex">Villa Complex</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Plot Development">
                    Plot Development
                  </SelectItem>
                  <SelectItem value="Land Parcel">Land Parcel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Construction Status</Label>
              <Select
                value={formData.constructionStatus}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    constructionStatus: v as Building["constructionStatus"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Under Construction">
                    Under Construction
                  </SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total Units *</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={formData.totalUnits}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 0) return;

                  setFormData({
                    ...formData,
                    totalUnits: value,
                    availableUnits: Math.min(formData.availableUnits, value),
                  });
                }}
              />
            </div>
            <div>
              <Label>Available Units</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={formData.availableUnits}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 0) return;

                  if (value <= formData.totalUnits) {
                    setFormData({
                      ...formData,
                      availableUnits: value,
                    });
                  } else {
                    toast.error("Available units cannot exceed total units");
                  }
                }}
              />
            </div>
            <div>
              <Label>Sold Units</Label>
              <Input
                type="number"
                value={formData.totalUnits - formData.availableUnits}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <Label>Completion Date</Label>
            <Input
              type="date"
              value={formData.completionDate}
              onChange={(e) =>
                setFormData({ ...formData, completionDate: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Google Maps Location</Label>
            <Input
              value={formData.googleMapsLocation}
              onChange={(e) =>
                setFormData({ ...formData, googleMapsLocation: e.target.value })
              }
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* New Amenities Section */}
          <div>
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Enter an amenity (e.g., Swimming Pool)"
              />
              <Button type="button" onClick={handleAddAmenity}>
                Add
              </Button>
            </div>
            {selectedAmenities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAmenities.map((amenity, index) => (
                  <div
                    key={amenity + index}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    {amenity}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-5 w-5"
                      onClick={() => removeAmenity(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div>
              <Label>Thumbnail {mode === "add" ? "*" : ""}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-56 flex flex-col justify-center">
                <Input
                  id="thumbnailUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, "image", 5)) {
                      setThumbnailFile(file);
                      if (
                        thumbnailPreview &&
                        thumbnailPreview.startsWith("blob:")
                      ) {
                        URL.revokeObjectURL(thumbnailPreview);
                      }
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Plot Thumbnail"
                      className="mx-auto mb-2 max-h-40 rounded object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 bg-white/80 rounded-full"
                      onClick={() => {
                        if (thumbnailPreview?.startsWith("blob:")) {
                          URL.revokeObjectURL(thumbnailPreview);
                        }

                        setThumbnailFile(null);
                        setThumbnailPreview("");

                        // 🔥 IMPORTANT — tell backend thumbnail removed during edit
                        if (mode === "edit") {
                          setFormData((prev) => ({
                            ...prev,
                            thumbnailUrl: "",
                          }));
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() =>
                      document.getElementById("thumbnailUpload")?.click()
                    }
                  >
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Click to upload main image
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      This will be displayed on plot cards.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Project Gallery Images (upto 5 images)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-56 flex flex-col justify-center">
                <div
                  className="flex flex-col items-center justify-center cursor-pointer"
                  onClick={() =>
                    document.getElementById("additionalImagesUpload")?.click()
                  }
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-1" />
                  <p className="text-muted-foreground">
                    Click to add more images
                  </p>
                </div>

                <Input
                  id="additionalImagesUpload"
                  className="hidden"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).filter(
                      (file) => validateFile(file, "image", 5),
                    );
                    const totalImages =
                      formData.images.length + imageFiles.length + files.length;

                    if (totalImages > 5) {
                      toast.error("You can only upload a maximum of 5 images");
                      return;
                    }
                    if (files.length === 0) return;

                    const newPreviews = files.map((file) =>
                      URL.createObjectURL(file),
                    );
                    setImageFiles((prev) => [...prev, ...files]);
                    setImagePreviews((prev) => [...prev, ...newPreviews]);
                  }}
                />

                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imagePreviews.map((url, index) => (
                      <div key={url + index} className="relative">
                        <img
                          src={url}
                          alt={`Plot Image ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 bg-white/80 rounded-full h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Project Brochure (PDF) {mode === "add" ? "*" : ""}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-56 flex flex-col justify-center">
                <Input
                  id="brochureUpload"
                  className="hidden"
                  type="file"
                  accept="application/pdf"
                  ref={brochureInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, "pdf", 10)) {
                      setBrochureFile(file);
                      if (
                        brochurePreview &&
                        brochurePreview.startsWith("blob:")
                      ) {
                        URL.revokeObjectURL(brochurePreview);
                      }
                      setBrochurePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {brochurePreview ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <a
                        href={brochurePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Brochure
                      </a>
                      <div className="text-sm text-muted-foreground mt-1">
                        {brochureFile?.name || brochurePreview.split("/").pop()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeBrochure}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() =>
                      document.getElementById("brochureUpload")?.click()
                    }
                  >
                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Click to upload project brochure (PDF)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.municipalPermission}
              onCheckedChange={(v) =>
                setFormData({ ...formData, municipalPermission: !!v })
              }
            />
            <Label>Municipal Permission Obtained</Label>
          </div>

          <div className="flex items-center space-x-2 mt-3">
            <Switch
              checked={formData.reraApproved}
              onCheckedChange={(v) =>
                setFormData({
                  ...formData,
                  reraApproved: v,
                  reraNumber: v ? formData.reraNumber : "",
                })
              }
            />
            <Label>RERA Approved</Label>
          </div>

          {formData.reraApproved && (
            <div className="mt-2">
              <Label className="text-sm font-medium">RERA Number</Label>
              <Input
                type="text"
                value={formData.reraNumber}
                onChange={(e) =>
                  setFormData({ ...formData, reraNumber: e.target.value })
                }
                placeholder="Enter RERA Registration Number"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBuilding.isPending || updateBuilding.isPending}
            >
              {createBuilding.isPending || updateBuilding.isPending
                ? "Saving..."
                : mode === "add"
                  ? "Create"
                  : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
