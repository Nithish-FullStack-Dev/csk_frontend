import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Property, PropertyDocument } from "@/types/property";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ApartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment?: Property;
  mode: "add" | "edit";
}

export const ApartmentDialog = ({
  open,
  onOpenChange,
  apartment,
  mode,
}: ApartmentDialogProps) => {
  const { user } = useAuth();
  const canEditCustomerDetails =
    user &&
    ["owner", "admin", "sales_manager", "team_lead"].includes(user.role);

  const [formData, setFormData] = useState({
    memNo: apartment?.memNo || "",
    plotNo: apartment?.plotNo || "",
    villaFacing: apartment?.villaFacing || "",
    extent: apartment?.extent || 0,
    propertyType: apartment?.propertyType || "Apartment",
    status: apartment?.status || "Available",
    totalAmount: apartment?.totalAmount || 0,
    amountReceived: apartment?.amountReceived || 0,
    balanceAmount: apartment?.balanceAmount || 0,
    ratePlan: apartment?.ratePlan || "",
    deliveryDate: apartment?.deliveryDate || "",
    emiScheme: apartment?.emiScheme || false,
    municipalPermission: apartment?.municipalPermission || false,
    remarks: apartment?.remarks || "",
    thumbnailUrl: apartment?.thumbnailUrl || "",
    documents: apartment?.documents || ([] as PropertyDocument[]),
    enquiryCustomerName: apartment?.enquiryCustomerName || "",
    enquiryCustomerContact: apartment?.enquiryCustomerContact || "",
    purchasedCustomerName: apartment?.purchasedCustomerName || "",
    purchasedCustomerContact: apartment?.purchasedCustomerContact || "",
  });

  const [errors, setErrors] = useState({
    memNo: "",
    plotNo: "",
    totalAmount: "",
  });

  // Auto-calculate balance amount
  useEffect(() => {
    const balance = Math.max(0, formData.totalAmount - formData.amountReceived);
    setFormData((prev) => ({ ...prev, balanceAmount: balance }));
  }, [formData.totalAmount, formData.amountReceived]);

  const validateAlphanumeric = (value: string, field: string) => {
    const pattern = /^[a-zA-Z0-9\-_\/]+$/;
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [field]: `${
          field === "memNo" ? "Membership" : "Plot"
        } number is required`,
      }));
      return false;
    }
    if (!pattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Only letters, numbers, -, _, and / allowed",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
    return true;
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

    const newDocs: PropertyDocument[] = validFiles.map((f) => ({
      id: Math.random().toString(36).substring(7),
      title: f.name,
      fileUrl: URL.createObjectURL(f),
      mimeType: f.type,
      visibility: "PURCHASER_ONLY",
      createdAt: new Date().toISOString(),
    }));

    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newDocs],
    }));
    toast.success(`${validFiles.length} document(s) uploaded`);
  };

  const removeDocument = (docId: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate alphanumeric fields
    const memNoValid = validateAlphanumeric(formData.memNo, "memNo");
    const plotNoValid = validateAlphanumeric(formData.plotNo, "plotNo");

    // Validate total amount is positive
    if (formData.totalAmount <= 0) {
      setErrors((prev) => ({
        ...prev,
        totalAmount: "Total amount must be greater than 0",
      }));
      return;
    } else {
      setErrors((prev) => ({ ...prev, totalAmount: "" }));
    }

    if (!memNoValid || !plotNoValid) {
      toast.error("Please fix validation errors");
      return;
    }

    // In a real app, this would save to the database
    toast.success(
      mode === "add" ? "Unit created successfully" : "Unit updated successfully"
    );
    onOpenChange(false);
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
            <div className="space-y-2">
              <Label htmlFor="memNo">Membership Number *</Label>
              <Input
                id="memNo"
                value={formData.memNo}
                onChange={(e) => {
                  setFormData({ ...formData, memNo: e.target.value });
                  validateAlphanumeric(e.target.value, "memNo");
                }}
                onBlur={(e) => validateAlphanumeric(e.target.value, "memNo")}
                pattern="^[a-zA-Z0-9\-_\/]+$"
                className={errors.memNo ? "border-red-500" : ""}
                required
              />
              {errors.memNo && (
                <p className="text-sm text-red-500">{errors.memNo}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, -, _, / allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plotNo">Plot/Unit Number *</Label>
              <Input
                id="plotNo"
                value={formData.plotNo}
                onChange={(e) => {
                  setFormData({ ...formData, plotNo: e.target.value });
                  validateAlphanumeric(e.target.value, "plotNo");
                }}
                onBlur={(e) => validateAlphanumeric(e.target.value, "plotNo")}
                pattern="^[a-zA-Z0-9\-_\/]+$"
                className={errors.plotNo ? "border-red-500" : ""}
                required
              />
              {errors.plotNo && (
                <p className="text-sm text-red-500">{errors.plotNo}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, -, _, / allowed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="extent">Extent (sq.ft) *</Label>
              <Input
                id="extent"
                type="number"
                min={1}
                step="0.01"
                value={formData.extent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    extent: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="villaFacing">Facing</Label>
              <Input
                id="villaFacing"
                value={formData.villaFacing}
                onChange={(e) =>
                  setFormData({ ...formData, villaFacing: e.target.value })
                }
                placeholder="e.g., North, East"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) =>
                  setFormData({ ...formData, propertyType: value as any })
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
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
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

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
              <Input
                id="totalAmount"
                type="number"
                min={1}
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value) || 0);
                  setFormData({ ...formData, totalAmount: value });
                  if (value > 0) {
                    setErrors((prev) => ({ ...prev, totalAmount: "" }));
                  }
                }}
                className={errors.totalAmount ? "border-red-500" : ""}
                required
              />
              {errors.totalAmount && (
                <p className="text-sm text-red-500">{errors.totalAmount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Advance Received (₹)</Label>
              <Input
                id="amountReceived"
                type="number"
                min={0}
                step="0.01"
                value={formData.amountReceived}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amountReceived: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balanceAmount">Balance Payment (₹)</Label>
              <Input
                id="balanceAmount"
                type="number"
                value={formData.balanceAmount}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Auto-calculated</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratePlan">Rate Plan</Label>
              <Input
                id="ratePlan"
                value={formData.ratePlan}
                onChange={(e) =>
                  setFormData({ ...formData, ratePlan: e.target.value })
                }
                placeholder="e.g., Standard Plan"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) =>
                setFormData({ ...formData, deliveryDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) =>
                setFormData({ ...formData, thumbnailUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Customer Details Section */}
          <Separator className="my-6" />
          <h3 className="text-lg font-semibold mb-4">Customer Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enquiryCustomerName">Enquiry Customer Name</Label>
              <Input
                id="enquiryCustomerName"
                value={formData.enquiryCustomerName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enquiryCustomerName: e.target.value,
                  })
                }
                placeholder="Enter customer name"
                disabled={!canEditCustomerDetails}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enquiryCustomerContact">
                Enquiry Customer Contact
              </Label>
              <Input
                id="enquiryCustomerContact"
                type="tel"
                value={formData.enquiryCustomerContact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enquiryCustomerContact: e.target.value,
                  })
                }
                placeholder="+91 XXXXX XXXXX"
                disabled={!canEditCustomerDetails}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasedCustomerName">
                Purchased Customer Name
              </Label>
              <Input
                id="purchasedCustomerName"
                value={formData.purchasedCustomerName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchasedCustomerName: e.target.value,
                  })
                }
                placeholder="Enter customer name"
                disabled={!canEditCustomerDetails}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasedCustomerContact">
                Purchased Customer Contact
              </Label>
              <Input
                id="purchasedCustomerContact"
                type="tel"
                value={formData.purchasedCustomerContact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchasedCustomerContact: e.target.value,
                  })
                }
                placeholder="+91 XXXXX XXXXX"
                disabled={!canEditCustomerDetails}
              />
            </div>
          </div>

          {!canEditCustomerDetails && (
            <p className="text-xs text-muted-foreground mt-2">
              Only admins, owners, sales managers, and team leads can edit
              customer details.
            </p>
          )}

          <Separator className="my-6" />

          <div className="space-y-2">
            <Label htmlFor="documents">Unit Documents (PDF/Images)</Label>
            <div className="flex items-center gap-2">
              <input
                id="documents"
                type="file"
                accept="application/pdf,image/*"
                multiple
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={handleDocumentUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Documents are visible only to purchaser (and admin/owner)
            </p>

            {formData.documents.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {doc.visibility === "PURCHASER_ONLY"
                          ? "Purchaser Only"
                          : "Public"}
                      </Badge>
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
                id="emiScheme"
                checked={formData.emiScheme}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, emiScheme: checked })
                }
              />
              <Label htmlFor="emiScheme">EMI Available</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="municipalPermission"
                checked={formData.municipalPermission}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, municipalPermission: checked })
                }
              />
              <Label htmlFor="municipalPermission">Municipal Permission</Label>
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
