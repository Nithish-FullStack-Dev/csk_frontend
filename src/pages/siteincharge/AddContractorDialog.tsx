import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  usefetchContractorDropDown,
  usefetchProjectsForDropdown,
} from "@/utils/project/ProjectConfig";
import { ContractorList, PaymentRecord } from "@/types/contractor";

type Props = {
  openDialog: boolean;
  setOpenConDialog: (value: boolean) => void;
  contractor?: ContractorList;
  mode: "add" | "edit";
};

const AddContractorDialog = ({
  openDialog,
  setOpenConDialog,
  contractor,
  mode,
}: Props) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    userId: "",
    companyName: "",
    gstNumber: "",
    panCardNumber: "",
    contractorType: "",
    accountsIncharge: "",
    amount: "",
    advancePaid: "",
    balancePaid: "",
    billInvoiceNumber: "",
    contractStartDate: "",
    contractEndDate: "",
    billedDate: "",
    finalPaymentDate: "",
    workDetails: "",
    billApprovedBySiteIncharge: false,
    billProcessedByAccountant: false,
    isActive: true,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
  });

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [billCopy, setBillCopy] = useState<File | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);

  const { data: contractorDropDown = [] } = usefetchContractorDropDown();
  const { data: allProjects = [] } = usefetchProjectsForDropdown();

  useEffect(() => {
    if (mode === "edit" && contractor) {
      setForm({
        userId:
          typeof contractor.userId === "string"
            ? contractor.userId
            : contractor.userId?._id || "",

        companyName: contractor.companyName || "",
        gstNumber: contractor.gstNumber || "",
        panCardNumber: contractor.panCardNumber || "",
        contractorType: contractor.contractorType || "",

        accountsIncharge:
          typeof contractor.accountsIncharge === "string"
            ? contractor.accountsIncharge
            : contractor.accountsIncharge?._id || "",

        amount: String(contractor.amount || ""),
        advancePaid: String(contractor.advancePaid || ""),
        balancePaid: String(contractor.balancePaid || ""),

        billInvoiceNumber: contractor.billInvoiceNumber || "",

        contractStartDate: contractor.contractStartDate
          ? contractor.contractStartDate.split("T")[0]
          : "",
        contractEndDate: contractor.contractEndDate
          ? contractor.contractEndDate.split("T")[0]
          : "",

        billedDate: contractor.billedDate
          ? contractor.billedDate.split("T")[0]
          : "",

        finalPaymentDate: contractor.finalPaymentDate
          ? contractor.finalPaymentDate.split("T")[0]
          : "",

        workDetails: contractor.workDetails || "",
        billApprovedBySiteIncharge: contractor.billApprovedBySiteIncharge,
        billProcessedByAccountant: contractor.billProcessedByAccountant,
        isActive: contractor.isActive,

        // NEW MODEL BANK FIELDS
        bankName: contractor.bankName || "",
        accountNumber: contractor.accountNumber || "",
        ifscCode: contractor.ifscCode || "",
        branchName: contractor.branchName || "",
      });

      setPaymentRecords(
        contractor.paymentDetails?.map((p) => ({
          modeOfPayment: p.modeOfPayment,
          paymentDate: p.paymentDate ? p.paymentDate.split("T")[0] : "",
          lastPaymentDate: p.lastPaymentDate
            ? p.lastPaymentDate.split("T")[0]
            : "",
        })) || []
      );

      setSelectedProjects(
        contractor.projectsAssigned?.map((p) =>
          typeof p === "string" ? p : p._id
        ) || []
      );
    } else {
      setForm((prev) => ({ ...prev }));
      setSelectedProjects([]);
      setPaymentRecords([]);
      setBillCopy(null);
    }
  }, [contractor, mode]);

  const addContractorMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/contractor/addContractor`,
        formData,
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contractors-list"] });
      setOpenConDialog(false);
      toast.success(data?.message ?? "Contractor added successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  const updateContractorMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.put(
        `${import.meta.env.VITE_URL}/api/contractor/updateContractor/${
          contractor?._id
        }`,
        formData,
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contractors-list"] });
      setOpenConDialog(false);
      toast.success(data?.message ?? "Contractor updated successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  const addPaymentRecord = () => {
    setPaymentRecords([
      ...paymentRecords,
      { modeOfPayment: undefined, paymentDate: "", lastPaymentDate: "" },
    ]);
  };

  const removePaymentRecord = (index: number) => {
    setPaymentRecords(paymentRecords.filter((_, i) => i !== index));
  };

  const updatePaymentRecord = (
    index: number,
    field: keyof PaymentRecord,
    value: string
  ) => {
    const updated = [...paymentRecords];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentRecords(updated);
  };

  const handleAddProject = (value: string) => {
    if (value && !selectedProjects.includes(value)) {
      setSelectedProjects([...selectedProjects, value]);
    }
  };

  const handleRemoveProject = (id: string) => {
    setSelectedProjects(selectedProjects.filter((p) => p !== id));
  };

  const onSubmit = () => {
    const formData = new FormData();

    if (mode === "add") {
      formData.append("userId", form.userId);
      formData.append("siteIncharge", String(user?._id));
    }

    formData.append("companyName", form.companyName);
    formData.append("gstNumber", form.gstNumber);
    formData.append("panCardNumber", form.panCardNumber);
    formData.append("contractorType", form.contractorType);
    if (form.accountsIncharge && form.accountsIncharge.trim() !== "") {
      formData.append("accountsIncharge", form.accountsIncharge);
    }
    formData.append("amount", form.amount);
    formData.append("advancePaid", form.advancePaid);
    formData.append("balancePaid", form.balancePaid);
    formData.append("billInvoiceNumber", form.billInvoiceNumber);
    formData.append("billedDate", form.billedDate);
    formData.append("finalPaymentDate", form.finalPaymentDate);
    formData.append("workDetails", form.workDetails);
    formData.append(
      "billApprovedBySiteIncharge",
      String(form.billApprovedBySiteIncharge)
    );
    formData.append(
      "billProcessedByAccountant",
      String(form.billProcessedByAccountant)
    );
    formData.append("isActive", String(form.isActive));

    selectedProjects.forEach((id, index) => {
      formData.append(`projectsAssigned[${index}]`, id);
    });

    formData.append("bankName", form.bankName);
    formData.append("accountNumber", form.accountNumber);
    formData.append("ifscCode", form.ifscCode);
    formData.append("branchName", form.branchName);

    formData.append("contractStartDate", form.contractStartDate);
    formData.append("contractEndDate", form.contractEndDate);

    if (paymentRecords.length === 0) {
      toast.error("At least one payment record is required");
      return;
    }

    paymentRecords.forEach((rec, index) => {
      formData.append(
        `paymentDetails[${index}][modeOfPayment]`,
        rec.modeOfPayment || ""
      );
      formData.append(`paymentDetails[${index}][paymentDate]`, rec.paymentDate);
      formData.append(
        `paymentDetails[${index}][lastPaymentDate]`,
        rec.lastPaymentDate
      );
    });

    if (billCopy) {
      formData.append("billcopy", billCopy);
    }

    if (mode === "edit") updateContractorMutation.mutate(formData);
    else addContractorMutation.mutate(formData);
  };

  const updateAmountFields = (field: string, value: string) => {
    const updated = { ...form, [field]: value };

    const total = Number(field === "amount" ? value : updated.amount);
    const advance = Number(
      field === "advancePaid" ? value : updated.advancePaid
    );

    if (!isNaN(total) && !isNaN(advance)) {
      updated.balancePaid = String(Math.max(total - advance, 0));
    }

    setForm(updated);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenConDialog}>
      <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Contractor" : "Add Contractor"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the contractor details."
              : "Fill in the details to add a new contractor."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 space-y-2">
          <div className="col-span-2 space-y-1">
            <Label>Select Contractor</Label>
            <Select
              value={form.userId}
              onValueChange={(v) => setForm({ ...form, userId: v })}
              disabled={mode === "edit"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Contractor" />
              </SelectTrigger>
              <SelectContent>
                {contractorDropDown?.data?.map((u: any) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Add Project</Label>
            <Select onValueChange={handleAddProject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {allProjects.map((p: any) => (
                  <SelectItem key={p?._id} value={p?._id}>
                    {p.projectId?.projectName +
                      " floor no: " +
                      p?.floorUnit?.floorNumber +
                      " unit: " +
                      p?.unit?.plotNo || "Unnamed Project"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Selected Projects</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedProjects.map((id) => {
                const proj = allProjects.find((p: any) => p._id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {(typeof proj?.projectId === "object" &&
                      proj?.projectId?.projectName) ||
                      "Unknown"}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveProject(id)}
                    >
                      ×
                    </Button>
                  </Badge>
                );
              })}
              {selectedProjects.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No projects selected
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Company Name</Label>
            <Input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>GST Number</Label>
            <Input
              value={form.gstNumber}
              onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>PAN Number</Label>
            <Input
              value={form.panCardNumber}
              onChange={(e) =>
                setForm({ ...form, panCardNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Contractor Type</Label>
            <Select
              value={form.contractorType}
              onValueChange={(v) => setForm({ ...form, contractorType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Contractor Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Firm">Firm</SelectItem>
                <SelectItem value="Private Ltd">Private Ltd</SelectItem>
                <SelectItem value="LLP">LLP</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Accounts Incharge ID</Label>
            <Input
              value={form.accountsIncharge}
              onChange={(e) =>
                setForm({ ...form, accountsIncharge: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Total Amount</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => updateAmountFields("amount", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Advance Paid</Label>
            <Input
              type="number"
              value={form.advancePaid}
              onChange={(e) =>
                updateAmountFields("advancePaid", e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Balance Paid</Label>
            <Input type="number" value={form.balancePaid} readOnly />
          </div>

          <div className="space-y-1">
            <Label>Invoice Number</Label>
            <Input
              value={form.billInvoiceNumber}
              onChange={(e) =>
                setForm({ ...form, billInvoiceNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Contract Start Date</Label>
            <Input
              type="date"
              value={form.contractStartDate}
              onChange={(e) =>
                setForm({ ...form, contractStartDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Contract End Date</Label>
            <Input
              type="date"
              value={form.contractEndDate}
              onChange={(e) =>
                setForm({ ...form, contractEndDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Bank Name</Label>
            <Input
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Account Number</Label>
            <Input
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>IFSC Code</Label>
            <Input
              value={form.ifscCode}
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Branch Name</Label>
            <Input
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
            />
          </div>

          <div className="space-y-1 col-span-2">
            <Label>Payment Records</Label>
            <Button
              type="button"
              variant="outline"
              onClick={addPaymentRecord}
              className="mb-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Payment Record
            </Button>

            <div className="space-y-4">
              {paymentRecords.map((record, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Payment Record {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePaymentRecord(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label>Mode of Payment</Label>
                      <Select
                        value={record.modeOfPayment}
                        onValueChange={(v) =>
                          updatePaymentRecord(index, "modeOfPayment", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="NEFT">NEFT</SelectItem>
                          <SelectItem value="RTGS">RTGS</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={record.paymentDate}
                        onChange={(e) =>
                          updatePaymentRecord(
                            index,
                            "paymentDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label>Last Payment Date</Label>
                      <Input
                        type="date"
                        value={record.lastPaymentDate}
                        onChange={(e) =>
                          updatePaymentRecord(
                            index,
                            "lastPaymentDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Billed Date</Label>
            <Input
              type="date"
              value={form.billedDate}
              onChange={(e) => setForm({ ...form, billedDate: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Final Payment Date</Label>
            <Input
              type="date"
              value={form.finalPaymentDate}
              onChange={(e) =>
                setForm({ ...form, finalPaymentDate: e.target.value })
              }
            />
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              checked={form.billApprovedBySiteIncharge}
              onCheckedChange={(v) =>
                setForm({ ...form, billApprovedBySiteIncharge: Boolean(v) })
              }
              id="site-approved"
            />
            <Label htmlFor="site-approved">
              Bill Approved by Site Incharge
            </Label>
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              checked={form.billProcessedByAccountant}
              onCheckedChange={(v) =>
                setForm({ ...form, billProcessedByAccountant: Boolean(v) })
              }
              id="account-processed"
            />
            <Label htmlFor="account-processed">
              Bill Processed by Accountant
            </Label>
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm({ ...form, isActive: Boolean(v) })
              }
              id="active"
            />
            <Label htmlFor="active">Is Active</Label>
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Work Details</Label>
            <Textarea
              value={form.workDetails}
              onChange={(e) =>
                setForm({ ...form, workDetails: e.target.value })
              }
              placeholder="Enter work details"
            />
          </div>

          <div className="col-span-2 space-y-1">
            {imagePreview && (
              <div className="col-span-2 mt-2">
                <img
                  src={imagePreview}
                  alt="Bill Copy Preview"
                  className="w-full h-auto rounded-lg border"
                />
              </div>
            )}

            <Label>Bill Copy</Label>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setBillCopy(file);
                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          <div className="col-span-2 flex justify-end">
            <Button
              onClick={onSubmit}
              disabled={
                (mode === "add" && addContractorMutation.isPending) ||
                (mode === "edit" && updateContractorMutation.isPending)
              }
            >
              {(mode === "add" && addContractorMutation.isPending) ||
              (mode === "edit" && updateContractorMutation.isPending)
                ? "Saving..."
                : mode === "edit"
                ? "Update Contractor"
                : "Add Contractor"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContractorDialog;
