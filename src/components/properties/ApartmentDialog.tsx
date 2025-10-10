import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Property,
  PropertyDocument,
  VillaFacing,
  PropertyType,
  PropertyStatus,
  RegistrationStatus,
  CustomerStatus,
  ProjectStatus,
} from "@/types/property";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ApartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment?: Property | null;
  mode: "add" | "edit";
  onSave?: (data: FormData, mode: "add" | "edit") => void;
  isCreating?: boolean;
  isUpdating?: boolean;
}

export const fetchUnit = async (unitId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/unit/getUnit/${unitId}`,
    { withCredentials: true }
  );
  return data.data as Property;
};

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
    propertyType: "Apartment",
    status: "Available",
    projectStatus: "upcoming",
    totalAmount: 0,
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
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [documentPreviews, setDocumentPreviews] = useState<
    {
      id: string;
      title: string;
      previewUrl: string;
      mimeType: string;
      visibility: PropertyDocument["visibility"];
      createdAt?: string;
    }[]
  >([]);

  const { data: fetchedUnit, isLoading: isFetchingUnit } = useQuery({
    queryKey: ["unit", apartment?._id],
    queryFn: () => fetchUnit(apartment!._id),
    enabled: !!apartment?._id && mode === "edit",
  });

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      documentPreviews.forEach((doc) => URL.revokeObjectURL(doc.previewUrl));
    };
  }, [thumbnailPreview, documentPreviews]);

  useEffect(() => {
    if (mode === "edit" && fetchedUnit) {
      setFormData({
        ...fetchedUnit,
        memNo: fetchedUnit.memNo || "",
        plotNo: fetchedUnit.plotNo || "",
        villaFacing: fetchedUnit.villaFacing || "North",
        extent: fetchedUnit.extent || 0,
        propertyType: fetchedUnit.propertyType || "Apartment",
        status: fetchedUnit.status || "Available",
        projectStatus: fetchedUnit.projectStatus || "upcoming",
        totalAmount: fetchedUnit.totalAmount || 0,
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
        customerId: fetchedUnit.customerId || undefined,
        contractor: fetchedUnit.contractor || undefined,
        siteIncharge: fetchedUnit.siteIncharge || undefined,
        agentId: fetchedUnit.agentId || undefined,
        googleMapsLocation: fetchedUnit.googleMapsLocation || "",
        images: fetchedUnit.images || [],
      });
      setThumbnailPreview(fetchedUnit.thumbnailUrl || "");
      setDocumentPreviews(
        (fetchedUnit.documents || []).map((doc) => ({
          id: doc.id,
          title: doc.title,
          previewUrl: doc.fileUrl,
          mimeType: doc.mimeType,
          visibility: doc.visibility || "PURCHASER_ONLY",
          createdAt: doc.createdAt,
        }))
      );
      setThumbnailFile(null);
      setDocumentFiles([]);
    } else if (mode === "add") {
      resetForm();
    }
  }, [fetchedUnit, mode, open]);

  const resetForm = () => {
    setFormData({
      memNo: "",
      plotNo: "",
      villaFacing: "North",
      extent: 0,
      propertyType: "Apartment",
      status: "Available",
      projectStatus: "upcoming",
      totalAmount: 0,
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
    setDocumentFiles([]);
    setThumbnailPreview("");
    setDocumentPreviews([]);
  };

  useEffect(() => {
    const total = Number(formData.totalAmount) || 0;
    const received = Number(formData.amountReceived) || 0;
    setFormData((prev) => ({
      ...prev,
      balanceAmount: Math.max(0, total - received),
    }));
  }, [formData.totalAmount, formData.amountReceived]);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed for thumbnail");
        return;
      }
      setThumbnailFile(file);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      setFormData((prev) => ({ ...prev, thumbnailUrl: previewUrl }));
      toast.success("Thumbnail selected");
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (f) => f.type === "application/pdf" || f.type.startsWith("image/")
    );
    if (validFiles.length !== files.length) {
      toast.error("Only PDF and image files are allowed");
      return;
    }
    const newDocs = validFiles.map((f) => ({
      id: Math.random().toString(36).substring(7),
      title: f.name,
      previewUrl: URL.createObjectURL(f),
      mimeType: f.type,
      visibility: "PURCHASER_ONLY" as PropertyDocument["visibility"],
      createdAt: new Date().toISOString(),
    }));
    setDocumentFiles((prev) => [...prev, ...validFiles]);
    setDocumentPreviews((prev) => [...prev, ...newDocs]);
    setFormData((prev) => ({
      ...prev,
      documents: [
        ...(prev.documents || []),
        ...newDocs.map((doc) => ({
          id: doc.id,
          title: doc.title,
          fileUrl: doc.previewUrl,
          mimeType: doc.mimeType,
          visibility: doc.visibility,
          createdAt: doc.createdAt,
        })),
      ],
    }));
    toast.success(`${newDocs.length} document(s) uploaded`);
  };

  const removeDocument = (docId: string) => {
    setDocumentFiles((prev) =>
      prev.filter((_, index) =>
        documentPreviews[index] ? documentPreviews[index].id !== docId : true
      )
    );
    setDocumentPreviews((prev) => {
      const doc = prev.find((d) => d.id === docId);
      if (doc) URL.revokeObjectURL(doc.previewUrl);
      return prev.filter((d) => d.id !== docId);
    });
    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.id !== docId),
    }));
    toast.success("Document removed");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memNo || !formData.plotNo) {
      toast.error("Membership and Plot number are required");
      return;
    }
    if ((formData.totalAmount || 0) <= 0) {
      toast.error("Total amount must be greater than 0");
      return;
    }
    if (mode === "add" && !thumbnailFile) {
      toast.error("Thumbnail is required for new units");
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "documents" && value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });

    // Append document metadata as a JSON string
    if (formData.documents && formData.documents.length > 0) {
      const documentMetadata = formData.documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        visibility: doc.visibility,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt,
      }));
      payload.append("documentMetadata", JSON.stringify(documentMetadata));
    }

    if (thumbnailFile) {
      payload.append("thumbnailUrl", thumbnailFile);
    }

    if (documentFiles.length > 0) {
      documentFiles.forEach((file) => {
        payload.append("documents", file);
      });
    }

    onSave?.(payload, mode);
  };

  if (isFetchingUnit) return <div>Loading unit details...</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Unit" : "Edit Unit"}
          </DialogTitle>
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
                value={String(formData.extent || 0)}
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
                  <SelectValue placeholder="Select facing" />
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
                  ].map((facing) => (
                    <SelectItem key={facing} value={facing}>
                      {facing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Property Type</Label>
              <Select
                value={formData.propertyType || "Apartment"}
                onValueChange={(v) =>
                  setFormData({ ...formData, propertyType: v as PropertyType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Land Parcel">Land Parcel</SelectItem>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total Amount (₹) *</Label>
              <Input
                type="number"
                min={1}
                value={String(formData.totalAmount || 0)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalAmount: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div>
              <Label>Amount Received (₹)</Label>
              <Input
                type="number"
                min={0}
                value={String(formData.amountReceived || 0)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amountReceived: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Balance (₹)</Label>
              <Input
                readOnly
                value={String(formData.balanceAmount || 0)}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Auto-calculated</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rate Plan</Label>
              <Input
                value={formData.ratePlan || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ratePlan: e.target.value })
                }
              />
            </div>
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

          <div>
            <Label>Google Maps Location</Label>
            <Input
              value={formData.googleMapsLocation || ""}
              onChange={(e) =>
                setFormData({ ...formData, googleMapsLocation: e.target.value })
              }
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div>
            <Label>Thumbnail (Image File) {mode === "add" ? "*" : ""}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
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
            <Label>Documents (PDF/Images)</Label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={handleDocumentUpload}
              className="mt-2"
            />
            {documentPreviews.length > 0 && (
              <div className="mt-2 space-y-2">
                {documentPreviews.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.title}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Enquiry Customer Name</Label>
              <Input
                value={formData.enquiryCustomerName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enquiryCustomerName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Enquiry Customer Contact</Label>
              <Input
                value={formData.enquiryCustomerContact || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enquiryCustomerContact: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Purchased Customer Name</Label>
              <Input
                value={formData.purchasedCustomerName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchasedCustomerName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Purchased Customer Contact</Label>
              <Input
                value={formData.purchasedCustomerContact || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchasedCustomerContact: e.target.value,
                  })
                }
              />
            </div>
          </div>

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
                ? "Loading..."
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
