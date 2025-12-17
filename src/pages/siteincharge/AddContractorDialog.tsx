import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { ContractorList } from "@/types/contractor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  contractorSchema,
  FormValues,
} from "@/utils/contractor/ContractorConfig";

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
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [billCopy, setBillCopy] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      userId: "",
      companyName: "",
      gstNumber: "",
      panCardNumber: "",
      contractorType: "",
      accountsIncharge: "",
      amount: 0,
      advancePaid: 0,
      balancePaid: 0,
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
      projectsAssigned: [],
      paymentDetails: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "paymentDetails",
  });

  const amount = watch("amount");
  const advancePaid = watch("advancePaid");

  useEffect(() => {
    setValue("balancePaid", Math.max((amount ?? 0) - (advancePaid ?? 0), 0));
  }, [amount, advancePaid, setValue]);

  const { data: contractorDropDown = [] } = usefetchContractorDropDown();
  const { data: allProjects = [] } = usefetchProjectsForDropdown();

  useEffect(() => {
    if (!openDialog) return;

    if (mode === "edit" && contractor) {
      const projects =
        contractor.projectsAssigned?.map((p: any) =>
          typeof p === "string" ? p : p._id
        ) || [];

      const payments =
        contractor.paymentDetails?.map((p: any) => ({
          modeOfPayment: p.modeOfPayment || "",
          paymentDate: p.paymentDate ? p.paymentDate.split("T")[0] : "",
          lastPaymentDate: p.lastPaymentDate
            ? p.lastPaymentDate.split("T")[0]
            : "",
        })) || [];

      reset({
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
        amount: contractor.amount || 0,
        advancePaid: contractor.advancePaid || 0,
        balancePaid: contractor.balancePaid || 0,
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
        billApprovedBySiteIncharge:
          contractor.billApprovedBySiteIncharge ?? false,
        billProcessedByAccountant:
          contractor.billProcessedByAccountant ?? false,
        isActive: contractor.isActive ?? true,
        bankName: contractor.bankName || "",
        accountNumber: contractor.accountNumber || "",
        ifscCode: contractor.ifscCode || "",
        branchName: contractor.branchName || "",
        projectsAssigned: projects,
        paymentDetails: payments,
      });

      setSelectedProjects(projects);

      // ✅ IMPORTANT: show existing image
      setImagePreview(contractor.billCopy || null);
    } else {
      reset();
      setSelectedProjects([]);
      setImagePreview(null);
    }

    setBillCopy(null);
  }, [openDialog, mode, contractor, reset]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
    onError: (error: any) => {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const isPending =
    addContractorMutation.isPending || updateContractorMutation.isPending;

  const handleAddProject = (value: string) => {
    if (value && !selectedProjects.includes(value)) {
      const newProjects = [...selectedProjects, value];
      setSelectedProjects(newProjects);
      setValue("projectsAssigned", newProjects);
    }
  };

  const handleRemoveProject = (id: string) => {
    const newProjects = selectedProjects.filter((p) => p !== id);
    setSelectedProjects(newProjects);
    setValue("projectsAssigned", newProjects);
  };

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();

    if (mode === "add") {
      formData.append("userId", data.userId);
      formData.append("siteIncharge", String(user?._id ?? ""));
    }

    formData.append("companyName", data.companyName);
    formData.append("gstNumber", data.gstNumber ?? "");
    formData.append("panCardNumber", data.panCardNumber ?? "");
    formData.append("contractorType", data.contractorType);
    if (data.accountsIncharge?.trim()) {
      formData.append("accountsIncharge", data.accountsIncharge);
    }
    formData.append("amount", String(data.amount));
    formData.append("advancePaid", String(data.advancePaid));
    formData.append("balancePaid", String(data.balancePaid));
    formData.append("billInvoiceNumber", data.billInvoiceNumber ?? "");
    formData.append("contractStartDate", data.contractStartDate ?? "");
    formData.append("contractEndDate", data.contractEndDate ?? "");
    formData.append("billedDate", data.billedDate ?? "");
    formData.append("finalPaymentDate", data.finalPaymentDate ?? "");
    formData.append("workDetails", data.workDetails ?? "");
    formData.append(
      "billApprovedBySiteIncharge",
      String(data.billApprovedBySiteIncharge)
    );
    formData.append(
      "billProcessedByAccountant",
      String(data.billProcessedByAccountant)
    );
    formData.append("isActive", String(data.isActive));
    formData.append("bankName", data.bankName ?? "");
    formData.append("accountNumber", data.accountNumber ?? "");
    formData.append("ifscCode", data.ifscCode ?? "");
    formData.append("branchName", data.branchName ?? "");

    data.projectsAssigned.forEach((id, index) => {
      formData.append(`projectsAssigned[${index}]`, id);
    });

    data.paymentDetails.forEach((rec, index) => {
      formData.append(
        `paymentDetails[${index}][modeOfPayment]`,
        rec.modeOfPayment ?? ""
      );
      formData.append(`paymentDetails[${index}][paymentDate]`, rec.paymentDate);
      formData.append(
        `paymentDetails[${index}][lastPaymentDate]`,
        rec.lastPaymentDate ?? ""
      );
    });

    if (billCopy) {
      formData.append("billcopy", billCopy);
    }

    if (mode === "edit") {
      updateContractorMutation.mutate(formData);
    } else {
      addContractorMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenConDialog}>
      <DialogContent className="max-w-[75vw] max-h-[90vh] flex flex-col rounded-xl">
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 flex-1 overflow-y-scroll p-2"
        >
          {mode === "add" && (
            <div className="col-span-2 space-y-1">
              <Label>Select Contractor</Label>
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractorDropDown?.data?.map((u: any) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.userId && (
                <p className="text-sm font-medium text-destructive">
                  {errors.userId.message}
                </p>
              )}
            </div>
          )}

          <div className="col-span-2 space-y-1">
            <Label>Add Project</Label>
            <Select value="" onValueChange={handleAddProject}>
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
                      p?.unit?.plotNo}
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
            <Input {...register("companyName")} />
            {errors.companyName && (
              <p className="text-sm font-medium text-destructive">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>GST Number</Label>
            <Input
              className="uppercase"
              {...register("gstNumber", {
                setValueAs: (v) => v?.toUpperCase(),
              })}
            />
            {errors.gstNumber && (
              <p className="text-sm font-medium text-destructive">
                {errors.gstNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>PAN Number</Label>
            <Input
              className="uppercase"
              {...register("panCardNumber", {
                setValueAs: (v) => v?.toUpperCase(),
              })}
            />
            {errors.panCardNumber && (
              <p className="text-sm font-medium text-destructive">
                {errors.panCardNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Contractor Type</Label>
            <Controller
              name="contractorType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.contractorType && (
              <p className="text-sm font-medium text-destructive">
                {errors.contractorType.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Accounts Incharge ID</Label>
            <Input {...register("accountsIncharge")} />
          </div>

          <div className="space-y-1">
            <Label>Total Amount</Label>
            <Input
              type="number"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm font-medium text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Advance Paid</Label>
            <Input
              type="number"
              {...register("advancePaid", { valueAsNumber: true })}
            />
            {errors.advancePaid && (
              <p className="text-sm font-medium text-destructive">
                {errors.advancePaid.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Balance Paid</Label>
            <Input type="number" value={watch("balancePaid")} readOnly />
          </div>

          <div className="space-y-1">
            <Label>Invoice Number</Label>
            <Input {...register("billInvoiceNumber")} />
          </div>

          <div className="space-y-1">
            <Label>Contract Start Date</Label>
            <Input type="date" {...register("contractStartDate")} />
          </div>

          <div className="space-y-1">
            <Label>Contract End Date</Label>
            <Input type="date" {...register("contractEndDate")} />
          </div>

          <div className="space-y-1">
            <Label>Bank Name</Label>
            <Input {...register("bankName")} />
          </div>

          <div className="space-y-1">
            <Label>Account Number</Label>
            <Input {...register("accountNumber")} />
            {errors.accountNumber && (
              <p className="text-sm font-medium text-destructive">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>IFSC Code</Label>
            <Input
              className="uppercase"
              {...register("ifscCode", {
                setValueAs: (v) => v?.toUpperCase(),
              })}
            />
            {errors.ifscCode && (
              <p className="text-sm font-medium text-destructive">
                {errors.ifscCode.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Branch Name</Label>
            <Input {...register("branchName")} />
          </div>

          <div className="col-span-2 space-y-2 flex flex-col">
            <Label>Payment Records</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  modeOfPayment: "",
                  paymentDate: "",
                  lastPaymentDate: "",
                })
              }
              className="mb-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Payment Record
            </Button>
            {errors.paymentDetails?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.paymentDetails.message}
              </p>
            )}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Payment Record {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label>Mode of Payment</Label>
                      <Controller
                        name={`paymentDetails.${index}.modeOfPayment`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            value={f.value ?? ""}
                            onValueChange={f.onChange}
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
                        )}
                      />
                      {errors.paymentDetails?.[index]?.modeOfPayment && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.paymentDetails[index]?.modeOfPayment?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        {...register(`paymentDetails.${index}.paymentDate`)}
                      />
                      {errors.paymentDetails?.[index]?.paymentDate && (
                        <p className="text-sm font-medium text-destructive">
                          {errors.paymentDetails[index]?.paymentDate?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label>Last Payment Date</Label>
                      <Input
                        type="date"
                        {...register(`paymentDetails.${index}.lastPaymentDate`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Billed Date</Label>
            <Input type="date" {...register("billedDate")} />
          </div>

          <div className="space-y-1">
            <Label>Final Payment Date</Label>
            <Input type="date" {...register("finalPaymentDate")} />
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Controller
              name="billApprovedBySiteIncharge"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="site-approved"
                />
              )}
            />
            <Label htmlFor="site-approved" className="cursor-pointer">
              Bill Approved by Site Incharge
            </Label>
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Controller
              name="billProcessedByAccountant"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="account-processed"
                />
              )}
            />
            <Label htmlFor="account-processed" className="cursor-pointer">
              Bill Processed by Accountant
            </Label>
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="active"
                />
              )}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Is Active
            </Label>
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Work Details</Label>
            <Textarea
              {...register("workDetails")}
              placeholder="Enter work details"
            />
          </div>

          <div className="col-span-2 space-y-1">
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Bill Copy Preview"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
              </div>
            )}

            <Label>Bill Copy</Label>
            <Input
              type="file"
              accept="image/*"
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
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : mode === "edit"
                ? "Update Contractor"
                : "Add Contractor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContractorDialog;
