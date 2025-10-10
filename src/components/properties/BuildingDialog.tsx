import { useEffect, useState } from "react";
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
    thumbnailUrl: "",
    brochureUrl: null,
    googleMapsLocation: "",
    images: [],
    brochureFileId: null,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [brochurePreview, setBrochurePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      if (brochurePreview) URL.revokeObjectURL(brochurePreview);
    };
  }, [thumbnailPreview, brochurePreview]);

  useEffect(() => {
    if (building) {
      setFormData({
        ...building,
        projectName: building.projectName || "",
        location: building.location || "",
        propertyType: building.propertyType || "Apartment Complex",
        totalUnits: building.totalUnits || 0,
        availableUnits: building.availableUnits || 0,
        soldUnits: building.soldUnits || 0,
        constructionStatus: building.constructionStatus || "Planned",
        completionDate: building.completionDate || "",
        description: building.description || "",
        municipalPermission: building.municipalPermission || false,
        thumbnailUrl: building.thumbnailUrl || "",
        brochureUrl: building.brochureUrl || null,
        googleMapsLocation: building.googleMapsLocation || "",
        images: building.images || [],
        brochureFileId: building.brochureFileId || null,
      });
      setThumbnailPreview(building.thumbnailUrl || "");
      setBrochurePreview(building.brochureUrl || null);
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
      thumbnailUrl: "",
      brochureUrl: null,
      googleMapsLocation: "",
      images: [],
      brochureFileId: null,
    });
    setThumbnailFile(null);
    setBrochureFile(null);
    setThumbnailPreview("");
    setBrochurePreview(null);
  };

  const createBuilding = useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/building/createBuilding`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
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
      const errorMessage =
        err.response?.data?.message || "Failed to add building.";
      toast.error(errorMessage);
    },
  });

  const updateBuilding = useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_URL}/api/building/updateBuilding/${
          building?._id
        }`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
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
      const errorMessage =
        err.response?.data?.message || "Failed to update building.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.projectName ||
      !formData.location ||
      !formData.propertyType ||
      formData.totalUnits <= 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (mode === "add" && (!thumbnailFile || !brochureFile)) {
      toast.error("Please upload thumbnail and brochure files");
      return;
    }

    const payload = new FormData();
    payload.append("projectName", formData.projectName);
    payload.append("location", formData.location);
    payload.append("propertyType", formData.propertyType);
    payload.append("totalUnits", formData.totalUnits.toString());
    payload.append("availableUnits", formData.availableUnits.toString());
    payload.append("soldUnits", formData.soldUnits.toString());
    payload.append("constructionStatus", formData.constructionStatus);
    if (formData.completionDate)
      payload.append("completionDate", formData.completionDate);
    if (formData.description)
      payload.append("description", formData.description);
    payload.append(
      "municipalPermission",
      formData.municipalPermission.toString()
    );
    if (formData.googleMapsLocation)
      payload.append("googleMapsLocation", formData.googleMapsLocation);
    // Append files if provided (required for add, optional for edit)
    if (thumbnailFile) payload.append("thumbnailUrl", thumbnailFile);
    if (brochureFile) payload.append("brochureUrl", brochureFile);

    if (mode === "add") {
      createBuilding.mutate(payload);
    } else {
      updateBuilding.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Building" : "Edit Building"}
          </DialogTitle>
          <DialogDescription>Manage building details</DialogDescription>
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
                value={formData.totalUnits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalUnits: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div>
              <Label>Available Units</Label>
              <Input
                type="number"
                min={0}
                value={formData.availableUnits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availableUnits: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Sold Units</Label>
              <Input
                type="number"
                min={0}
                value={formData.soldUnits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    soldUnits: Number(e.target.value),
                  })
                }
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

          <div>
            <Label>Thumbnail (Image File) {mode === "add" ? "*" : ""}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (!file.type.startsWith("image/")) {
                    toast.error("Only images allowed");
                    return;
                  }
                  setThumbnailFile(file);
                  if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
                  const previewUrl = URL.createObjectURL(file);
                  setThumbnailPreview(previewUrl);
                  toast.success("Thumbnail selected");
                }
              }}
            />
            {thumbnailPreview && (
              <p className="text-sm text-muted-foreground mt-1">
                ✓ Thumbnail selected (
                <img
                  src={thumbnailPreview}
                  alt="thumbnail preview"
                  className="w-20 h-20 object-cover inline-block"
                />
                )
              </p>
            )}
          </div>

          <div>
            <Label>Project Brochure (PDF) {mode === "add" ? "*" : ""}</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.type !== "application/pdf") {
                    toast.error("Only PDF allowed");
                    return;
                  }
                  setBrochureFile(file);
                  if (brochurePreview) URL.revokeObjectURL(brochurePreview);
                  const previewUrl = URL.createObjectURL(file);
                  setBrochurePreview(previewUrl);
                  toast.success("Brochure selected");
                }
              }}
            />
            {brochurePreview && (
              <p className="text-sm text-muted-foreground mt-1">
                ✓ Brochure selected
              </p>
            )}
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
