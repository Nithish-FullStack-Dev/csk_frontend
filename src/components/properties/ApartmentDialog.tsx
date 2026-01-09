import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Property,
  PropertyDocument,
  VillaFacing,
  PropertyStatus,
  RegistrationStatus,
  ProjectStatus,
} from "@/types/property";
import { toast } from "sonner";
import { X, UploadCloud, Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUnit } from "@/utils/units/Methods";

interface ApartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment?: Property | null;
  mode: "add" | "edit";
  onSave?: (data: FormData, mode: "add" | "edit") => void;
  isCreating?: boolean;
  isUpdating?: boolean;
}

export const ApartmentDialog = ({
  open,
  onOpenChange,
  apartment,
  mode,
  onSave,
  isCreating,
  isUpdating,
}: ApartmentDialogProps) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    memNo: "",
    plotNo: "",
    villaFacing: "North",
    extent: 0,
    status: "Available",
    projectStatus: "upcoming",
    amountReceived: 0,
    balanceAmount: 0,
    ratePlan: "",
    deliveryDate: "",
    emiScheme: false,
    municipalPermission: false,
    remarks: "",
    thumbnailUrl: "",
    documents: [],
    enquiryCustomerName: "",
    enquiryCustomerContact: "",
    purchasedCustomerName: "",
    purchasedCustomerContact: "",
    workCompleted: 0,
    registrationStatus: "Not Started",
    customerStatus: "Open",
    googleMapsLocation: "",
    images: [],
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [enquiryCustomers, setEnquiryCustomers] = useState([
    { name: "", contact: "" },
  ]);
  const [purchasedCustomer, setPurchasedCustomer] = useState({
    name: "",
    contact: "",
  });

  const { data: fetchedUnit, isLoading: isFetchingUnit } = useQuery({
    queryKey: ["unit", apartment?._id],
    queryFn: () => fetchUnit(apartment!._id),
    enabled: !!apartment?._id && mode === "edit",
  });

  useEffect(() => {
    if (mode === "edit" && fetchedUnit && open) {
      setFormData({
        ...fetchedUnit,
        memNo: fetchedUnit.memNo || "",
        plotNo: fetchedUnit.plotNo || "",
        villaFacing: fetchedUnit.villaFacing || "North",
        extent: fetchedUnit.extent || 0,
        status: fetchedUnit.status || "Available",
        projectStatus: fetchedUnit.projectStatus || "upcoming",
        amountReceived: fetchedUnit.amountReceived || 0,
        balanceAmount: fetchedUnit.balanceAmount || 0,
        ratePlan: fetchedUnit.ratePlan || "",
        deliveryDate: fetchedUnit.deliveryDate
          ? new Date(fetchedUnit.deliveryDate).toISOString().split("T")[0]
          : "",
        emiScheme: fetchedUnit.emiScheme || false,
        municipalPermission: fetchedUnit.municipalPermission || false,
        remarks: fetchedUnit.remarks || "",
        thumbnailUrl: fetchedUnit.thumbnailUrl || "",
        documents: fetchedUnit.documents || [],
        enquiryCustomerName: fetchedUnit.enquiryCustomerName || "",
        enquiryCustomerContact: fetchedUnit.enquiryCustomerContact || "",
        purchasedCustomerName: fetchedUnit.purchasedCustomerName || "",
        purchasedCustomerContact: fetchedUnit.purchasedCustomerContact || "",
        workCompleted: fetchedUnit.workCompleted || 0,
        registrationStatus: fetchedUnit.registrationStatus || "Not Started",
        customerStatus: fetchedUnit.customerStatus || "Open",
        googleMapsLocation: fetchedUnit.googleMapsLocation || "",
        images: fetchedUnit.images || [],
      });

      setThumbnailPreview(fetchedUnit.thumbnailUrl || "");
      setImagePreviews(fetchedUnit.images || []);
      setThumbnailFile(null);
      setImageFiles([]);
    } else if (mode === "add" && open) {
      resetForm();
    }

    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [fetchedUnit, mode, open]);

  const resetForm = () => {
    setFormData({
      memNo: "",
      plotNo: "",
      villaFacing: "North",
      extent: 0,
      status: "Available",
      projectStatus: "upcoming",
      amountReceived: 0,
      balanceAmount: 0,
      ratePlan: "",
      deliveryDate: "",
      emiScheme: false,
      municipalPermission: false,
      remarks: "",
      thumbnailUrl: "",
      documents: [],
      enquiryCustomerName: "",
      enquiryCustomerContact: "",
      purchasedCustomerName: "",
      purchasedCustomerContact: "",
      workCompleted: 0,
      registrationStatus: "Not Started",
      customerStatus: "Open",
      googleMapsLocation: "",
      images: [],
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setImageFiles([]);
    setImagePreviews([]);
    setEnquiryCustomers([{ name: "", contact: "" }]);
    setPurchasedCustomer({ name: "", contact: "" });
  };

  const validateFile = (file: File, type: "image", maxSizeMB: number) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return false;
    }
    if (file.size > maxSizeBytes) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memNo || !formData.plotNo) {
      toast.error("Membership and Plot number are required");
      return;
    }
    if (
      mode === "add" &&
      (!thumbnailFile || imageFiles.length + imagePreviews.length === 0)
    ) {
      toast.error("Please upload thumbnail and at least one gallery image");
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "documents" &&
        key !== "images" &&
        key !== "thumbnailUrl" &&
        value !== null &&
        value !== undefined
      ) {
        payload.append(key, String(value));
      }
    });

    if (thumbnailFile) payload.append("thumbnailUrl", thumbnailFile);
    imageFiles.forEach((file) => payload.append("images", file));

    onSave?.(payload, mode);
  };

  const removeThumbnail = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const removeGalleryImage = (index: number) => {
    setImagePreviews((prev) => {
      const url = prev[index];
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEnquiry = () => {
    setEnquiryCustomers([...enquiryCustomers, { name: "", contact: "" }]);
  };

  const handleRemoveEnquiry = (index: number) => {
    setEnquiryCustomers(enquiryCustomers.filter((_, i) => i !== index));
  };

  const handleEnquiryChange = (
    index: number,
    field: "name" | "contact",
    value: string
  ) => {
    const updated = [...enquiryCustomers];
    updated[index][field] = value;
    setEnquiryCustomers(updated);
  };

  if (isFetchingUnit) return <div>Loading unit details...</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Unit" : "Edit Unit"}
          </DialogTitle>
          <DialogDescription>
            Fill in the apartment/unit details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Membership Number *</Label>
              <Input
                value={formData.memNo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, memNo: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Plot/Unit Number *</Label>
              <Input
                value={formData.plotNo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, plotNo: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Extent (sq.ft) *</Label>
              <Input
                type="number"
                min={1}
                value={formData.extent || 0}
                onChange={(e) =>
                  setFormData({ ...formData, extent: Number(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <Label>Facing</Label>
              <Select
                value={formData.villaFacing || "North"}
                onValueChange={(v) =>
                  setFormData({ ...formData, villaFacing: v as VillaFacing })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "North",
                    "East",
                    "West",
                    "South",
                    "North-East",
                    "North-West",
                    "South-East",
                    "South-West",
                  ].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status || "Available"}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as PropertyStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Under Construction">
                    Under Construction
                  </SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project Status</Label>
              <Select
                value={formData.projectStatus || "upcoming"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    projectStatus: v as ProjectStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Registration Status</Label>
              <Select
                value={formData.registrationStatus || "Not Started"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    registrationStatus: v as RegistrationStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expected Delivery Date</Label>
              <Input
                type="date"
                value={formData.deliveryDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryDate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Thumbnail {mode === "add" ? "*" : ""}</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-56 flex flex-col justify-center">
              <Input
                id="apartmentThumbnail"
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
                    )
                      URL.revokeObjectURL(thumbnailPreview);
                    setThumbnailPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="mx-auto mb-2 max-h-40 rounded object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 bg-white/80 rounded-full"
                    onClick={removeThumbnail}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer"
                  onClick={() =>
                    document.getElementById("apartmentThumbnail")?.click()
                  }
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Click to upload thumbnail
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will be the main display image
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Gallery Images (up to 5)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-56 flex flex-col justify-center">
              <Input
                id="apartmentGallery"
                className="hidden"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).filter((f) =>
                    validateFile(f, "image", 5)
                  );
                  const total = imagePreviews.length + files.length;
                  if (total > 5) {
                    toast.error("You can upload a maximum of 5 gallery images");
                    return;
                  }
                  const newPreviews = files.map((f) => URL.createObjectURL(f));
                  setImageFiles((prev) => [...prev, ...files]);
                  setImagePreviews((prev) => [...prev, ...newPreviews]);
                }}
              />
              <div
                className="flex flex-col items-center justify-center cursor-pointer"
                onClick={() =>
                  document.getElementById("apartmentGallery")?.click()
                }
              >
                <UploadCloud className="h-8 w-8 text-muted-foreground mb-1" />
                <p className="text-muted-foreground">
                  Click to add gallery images
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {imagePreviews.map((url, i) => (
                    <div key={url + i} className="relative">
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 bg-white/80 rounded-full h-6 w-6"
                        onClick={() => removeGalleryImage(i)}
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
            <Label>Remarks</Label>
            <Textarea
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* <div>
            <Label className="font-semibold text-lg mb-2 block">
              Enquiry Customers
            </Label>
            {enquiryCustomers.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 mb-3 items-end"
              >
                <div>
                  <Label>Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      handleEnquiryChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Contact</Label>
                    <Input
                      value={item.contact}
                      onChange={(e) =>
                        handleEnquiryChange(index, "contact", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    {index === enquiryCustomers.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddEnquiry}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    {enquiryCustomers.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveEnquiry(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div> */}

          {/* <div>
            <Label className="font-semibold text-lg mb-2 block">
              Purchased Customer
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={purchasedCustomer.name}
                  onChange={(e) =>
                    setPurchasedCustomer({
                      ...purchasedCustomer,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Contact</Label>
                <Input
                  value={purchasedCustomer.contact}
                  onChange={(e) =>
                    setPurchasedCustomer({
                      ...purchasedCustomer,
                      contact: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div> */}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!formData.emiScheme}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, emiScheme: !!v })
                }
              />
              <Label>EMI Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!formData.municipalPermission}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, municipalPermission: !!v })
                }
              />
              <Label>Municipal Permission</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? "Saving..."
                : mode === "add"
                ? "Create Unit"
                : "Update Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
