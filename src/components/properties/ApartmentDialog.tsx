// src/components/properties/ApartmentDialog.tsx
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
import { Property, PropertyDocument } from "@/types/property";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";

interface ApartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment?: Property | undefined | null;
  mode: "add" | "edit";
  onSave?: (data: Partial<Property>, mode: "add" | "edit") => void;
}

export const ApartmentDialog = ({
  open,
  onOpenChange,
  apartment,
  mode,
  onSave,
}: ApartmentDialogProps) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    memNo: "",
    plotNo: "",
    villaFacing: "North",
    extent: 0,
    propertyType: "Apartment",
    status: "Available",
    totalAmount: 0,
    amountReceived: 0,
    balanceAmount: 0,
    ratePlan: "",
    deliveryDate: "",
    emiScheme: false,
    municipalPermission: false,
    remarks: "",
    thumbnailUrl: "",
    documents: [] as PropertyDocument[],
    enquiryCustomerName: "",
    enquiryCustomerContact: "",
    purchasedCustomerName: "",
    purchasedCustomerContact: "",
    workCompleted: 0,
  });

  useEffect(() => {
    if (apartment) {
      setFormData({ ...apartment });
    } else {
      setFormData((prev) => ({
        ...prev,
        memNo: "",
        plotNo: "",
        villaFacing: "North",
        extent: 0,
        propertyType: "Apartment",
        status: "Available",
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
      }));
    }
  }, [apartment, open]);

  // compute balance
  useEffect(() => {
    const total = Number(formData.totalAmount) || 0;
    const received = Number(formData.amountReceived) || 0;
    setFormData((prev) => ({
      ...prev,
      balanceAmount: Math.max(0, total - received),
    }));
  }, [formData.totalAmount, formData.amountReceived]);

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
      fileUrl: URL.createObjectURL(f),
      mimeType: f.type,
      visibility: "PURCHASER_ONLY",
      createdAt: new Date().toISOString(),
    })) as PropertyDocument[];
    setFormData((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), ...newDocs],
    }));
    toast.success(`${newDocs.length} document(s) uploaded`);
  };

  const removeDocument = (docId: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.id !== docId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memNo || !formData.plotNo) {
      toast.error("Membership and Plot number are required");
      return;
    }
    if ((formData.totalAmount || 0) <= 0) {
      toast.error("Total amount must be > 0");
      return;
    }
    toast.success(
      mode === "add" ? "Unit created successfully" : "Unit updated successfully"
    );
    onSave?.(formData, mode);
  };

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
              <Input
                value={String(formData.villaFacing || "North")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    villaFacing: e.target.value as any,
                  })
                }
                placeholder="e.g., North"
              />
            </div>
            <div>
              <Label>Property Type</Label>
              <Select
                value={String(formData.propertyType || "Apartment")}
                onValueChange={(v) =>
                  setFormData({ ...formData, propertyType: v as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={String(formData.status || "Available")}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as any })
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
          </div>

          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <Label>Rate Plan</Label>
              <Input
                value={formData.ratePlan || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ratePlan: e.target.value })
                }
              />
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
            <Label>Thumbnail URL</Label>
            <Input
              value={formData.thumbnailUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, thumbnailUrl: e.target.value })
              }
              placeholder="https://..."
            />
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

          <div className="my-4">
            <Label>Documents (PDF/Images)</Label>
            <input
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={handleDocumentUpload}
              className="mt-2"
            />
            {formData.documents && formData.documents.length > 0 && (
              <div className="mt-2 space-y-2">
                {(formData.documents || []).map((doc) => (
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
            <Button type="submit">
              {mode === "add" ? "Create Unit" : "Update Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
