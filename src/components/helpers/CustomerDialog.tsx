import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Customer,
  CustomerValidationSchema,
  fetchAgents,
  PaymentDetail,
} from "@/utils/buildings/CustomerConfig";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllCustomer_purchased } from "@/utils/leads/LeadConfig";
import {
  useProjects,
  useFloorUnits,
  useAvaliableUnits,
} from "@/utils/buildings/Projects";
import {
  useContractorsFroDropDown,
  useSiteInchargeFroDropDown,
} from "@/utils/contractor/ContractorConfig";
import axios from "axios";
import { toast } from "sonner";

type CustomerForm = z.infer<typeof CustomerValidationSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: Customer | null;
};

const CustomerDialog = ({ onOpenChange, open, mode, initialData }: Props) => {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState("");
  const [floorUnitId, setFloorUnitId] = useState("");
  const [documentPreviews, setDocumentPreviews] = useState<
    { url: string; name: string; isImage: boolean }[]
  >([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CustomerForm>({
    resolver: zodResolver(CustomerValidationSchema),
    defaultValues: {
      paymentDetails: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "paymentDetails",
  });

  const watchedCustomerId = watch("customerId");
  const watchedPurchasedFrom = watch("purchasedFrom");
  const watchedProperty = watch("property");
  const watchedFloorUnit = watch("floorUnit");
  const watchedUnit = watch("unit");

  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    error: customersError,
  } = useQuery({
    queryKey: ["availableCustomersForSelection"],
    queryFn: fetchAllCustomer_purchased,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: agents = [],
    isLoading: isLoadingAgents,
    isError: isErrorAgents,
    error: agentsError,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: contractors,
    isLoading: isLoadingContractors,
    isError: isErrorContractors,
    error: contractorsError,
  } = useContractorsFroDropDown();

  const {
    data: siteIncharge,
    isLoading: isLoadingSiteIncharge,
    isError: isErrorSiteIncharge,
    error: siteInchargeError,
  } = useSiteInchargeFroDropDown();

  const {
    data: projects = [],
    isLoading: projectLoading,
    isError: projectError,
    error: projectErrorMessage,
  } = useProjects();

  const {
    data: floorUnits = [],
    isLoading: floorUnitsLoading,
    isError: floorUnitsError,
    error: floorUnitsErrorMessage,
  } = useFloorUnits(projectId);

  const {
    data: units = [],
    isLoading: unitsLoading,
    isError: unitsError,
    error: unitsErrorMessage,
  } = useAvaliableUnits(projectId, floorUnitId);

  useEffect(() => {
    if (mode !== "edit") {
      setDocumentPreviews([]);
      setNewDocuments([]);
      setExistingDocuments([]);
      return;
    }
    if (!initialData) return;

    const defaultValues: Partial<CustomerForm> = {
      customerId:
        (typeof initialData.customerId === "object" &&
          initialData.customerId?._id) ||
        "",
      purchasedFrom:
        (typeof initialData.purchasedFrom === "object" &&
          initialData.purchasedFrom?._id) ||
        "",
      projectCompany: initialData.projectCompany || "",
      property:
        (typeof initialData.property === "object" &&
          initialData.property?._id) ||
        "",
      floorUnit:
        (typeof initialData.floorUnit === "object" &&
          initialData.floorUnit?._id) ||
        "",
      unit:
        (typeof initialData.unit === "object" && initialData.unit?._id) || "",
      referralName: initialData.referralName || "",
      referralContact: initialData.referralContact || "",
      registrationStatus: initialData.registrationStatus,
      bookingDate: initialData.bookingDate?.split("T")[0] || "",
      totalAmount: initialData.totalAmount,
      advanceReceived: initialData.advanceReceived,
      paymentPlan: initialData.paymentPlan,
      notes: initialData.notes,
      contractorId:
        (typeof initialData.contractorId === "object" &&
          initialData.contractorId?._id) ||
        "",
      siteInchargeId:
        (typeof initialData.siteInchargeId === "object" &&
          initialData.siteInchargeId?._id) ||
        "",
      status: initialData.status,
      finalPrice: initialData.finalPrice,
      paymentStatus: initialData.paymentStatus,
      lastPaymentDate: initialData.lastPaymentDate?.split("T")[0] || "",
      constructionStage: initialData.constructionStage || "",
      expectedDeliveryDate:
        initialData.expectedDeliveryDate?.split("T")[0] || "",
      deliveryDate: initialData.deliveryDate?.split("T")[0] || "",
      paymentDetails:
        initialData.paymentDetails?.map((p) => ({
          ...p,
          date: p.date ? p.date.split("T")[0] : "",
        })) || [],
    };

    reset(defaultValues);

    setProjectId(
      (typeof initialData.property === "object" && initialData.property?._id) ||
        ""
    );
    setFloorUnitId(
      (typeof initialData.floorUnit === "object" &&
        initialData.floorUnit?._id) ||
        ""
    );

    setExistingDocuments(initialData.images || []);
    setDocumentPreviews([]);
    setNewDocuments([]);
  }, [initialData, mode, reset, open]);

  useEffect(() => {
    if (!initialData) return;

    if (
      floorUnits.length > 0 &&
      typeof initialData.floorUnit === "object" &&
      initialData.floorUnit?._id
    ) {
      setValue(
        "floorUnit",
        typeof initialData.floorUnit === "object" && initialData.floorUnit._id,
        { shouldValidate: false }
      );
    }

    if (
      units.length > 0 &&
      typeof initialData.unit === "object" &&
      initialData.unit?._id
    ) {
      setValue(
        "unit",
        typeof initialData.unit === "object" && initialData.unit._id,
        { shouldValidate: false }
      );
    }
  }, [floorUnits, units, initialData, setValue]);

  useEffect(() => {
    return () => {
      documentPreviews.forEach((preview) => {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [documentPreviews]);

  const addMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/customer/addCustomer`,
        payload,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Customer added successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({
        queryKey: ["availableCustomersForSelection"],
      });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add customer");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.put(
        `${import.meta.env.VITE_URL}/api/customer/updateCustomer/${
          initialData?._id
        }`,
        payload,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Customer updated");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onOpenChange(false);
    },
  });

  const onSubmit = (formData: CustomerForm) => {
    const adjustedFormData = { ...formData };
    if (adjustedFormData.lastPaymentDate) {
      adjustedFormData.lastPaymentDate += "T00:00:00";
    }
    if (adjustedFormData.expectedDeliveryDate) {
      adjustedFormData.expectedDeliveryDate += "T00:00:00";
    }
    if (adjustedFormData.deliveryDate) {
      adjustedFormData.deliveryDate += "T00:00:00";
    }

    const payload = new FormData();
    Object.entries(adjustedFormData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        key !== "documents" &&
        key !== "paymentDetails"
      ) {
        payload.append(key, value as any);
      }
    });

    adjustedFormData.paymentDetails?.forEach((p, index) => {
      Object.entries(p).forEach(([key, value]) => {
        payload.append(`paymentDetails[${index}][${key}]`, value as any);
      });
    });
    if (pdfFile) {
      payload.append("pdfFile", pdfFile);
    }
    newDocuments.forEach((file) => {
      payload.append("documents", file);
    });

    if (mode === "edit") updateMutation.mutate(payload);
    else addMutation.mutate(payload);
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Allow only images
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed.");
      return;
    }

    // Total allowed = 5 (existing + new)
    const totalFiles =
      existingDocuments.length + newDocuments.length + imageFiles.length;

    if (totalFiles > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    const newPreviews = imageFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      isImage: true,
    }));

    setDocumentPreviews((prev) => [...prev, ...newPreviews]);
    setNewDocuments((prev) => [...prev, ...imageFiles]);
  };

  const removePreview = (index: number) => {
    setDocumentPreviews((prev) => {
      const updatedPreviews = prev.filter((_, i) => i !== index);
      const removedUrl = prev[index].url;
      if (removedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removedUrl);
      }
      return updatedPreviews;
    });
    setNewDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[80vw] max-h-[80vh] overflow-y-scroll rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {mode === "edit"
              ? "Update customer details."
              : "Add a new customer to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Customer</Label>
                <Select
                  disabled={isLoadingCustomers || isErrorCustomers}
                  onValueChange={(v) =>
                    setValue("customerId", v, { shouldValidate: true })
                  }
                  value={watchedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingCustomers
                          ? "Loading customers..."
                          : isErrorCustomers
                          ? "Failed to load customers"
                          : "Select Customer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.length === 0 &&
                    !isLoadingCustomers &&
                    !isErrorCustomers ? (
                      <SelectItem value="no-customers" disabled>
                        No customers available
                      </SelectItem>
                    ) : (
                      customers.map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.customerId?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.customerId.message}
                  </p>
                )}
                {isErrorCustomers && (
                  <p className="text-red-500 text-xs">
                    {(customersError as Error)?.message ||
                      "Error loading customers"}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Purchased From (Agent)</Label>
                <Select
                  disabled={isLoadingAgents || isErrorAgents}
                  onValueChange={(v) =>
                    setValue("purchasedFrom", v, { shouldValidate: true })
                  }
                  value={watchedPurchasedFrom}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingAgents
                          ? "Loading agents..."
                          : isErrorAgents
                          ? "Failed to load agents"
                          : "Select Agent"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.length === 0 &&
                    !isLoadingAgents &&
                    !isErrorAgents ? (
                      <SelectItem value="no-agents" disabled>
                        No agents available
                      </SelectItem>
                    ) : (
                      agents.map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          {a.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.purchasedFrom?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.purchasedFrom.message}
                  </p>
                )}
                {isErrorAgents && (
                  <p className="text-red-500 text-xs">
                    {(agentsError as Error)?.message || "Error loading agents"}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Property</Label>
                <Select
                  disabled={projectLoading || projectError}
                  onValueChange={(id) => {
                    setProjectId(id);
                    setValue("property", id, { shouldValidate: true });
                    setFloorUnitId("");
                  }}
                  value={watchedProperty}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        projectLoading
                          ? "Loading projects..."
                          : projectError
                          ? "Failed to load projects"
                          : "Select project"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.length === 0 &&
                    !projectLoading &&
                    !projectError ? (
                      <SelectItem value="empty" disabled>
                        No projects found
                      </SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.projectName} , {project.propertyType}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.property?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.property.message}
                  </p>
                )}
                {projectError && (
                  <p className="text-red-500 text-xs">
                    {(projectErrorMessage as Error)?.message ||
                      "Error loading projects"}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Floor Unit</Label>
                <Select
                  disabled={!projectId || floorUnitsLoading || floorUnitsError}
                  onValueChange={(id) => {
                    setFloorUnitId(id);
                    setValue("floorUnit", id, { shouldValidate: true });
                  }}
                  value={watchedFloorUnit}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !projectId
                          ? "Select project first"
                          : floorUnitsLoading
                          ? "Loading floor units..."
                          : floorUnitsError
                          ? "Failed to load floor units"
                          : "Select Floor Unit"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {floorUnits.length === 0 &&
                    !floorUnitsLoading &&
                    !floorUnitsError &&
                    projectId ? (
                      <SelectItem value="no-floor-units" disabled>
                        No floor units found
                      </SelectItem>
                    ) : (
                      floorUnits.map((f) => (
                        <SelectItem key={f._id} value={f._id}>
                          {f.floorNumber}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.floorUnit?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.floorUnit.message}
                  </p>
                )}
                {floorUnitsError && (
                  <p className="text-red-500 text-xs">
                    {(floorUnitsErrorMessage as Error)?.message ||
                      "Error loading floor units"}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Unit</Label>
                <Select
                  disabled={!floorUnitId || unitsLoading || unitsError}
                  onValueChange={(id) => {
                    setValue("unit", id, { shouldValidate: true });
                  }}
                  value={watchedUnit}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !floorUnitId
                          ? "Select floor unit first"
                          : unitsLoading
                          ? "Loading units..."
                          : unitsError
                          ? "Failed to load units"
                          : "Select Unit"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {units.length === 0 &&
                    !unitsLoading &&
                    !unitsError &&
                    floorUnitId ? (
                      <SelectItem value="no-units" disabled>
                        No units found
                      </SelectItem>
                    ) : (
                      units.map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.plotNo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.unit?.message && (
                  <p className="text-red-500 text-sm">{errors.unit.message}</p>
                )}
                {unitsError && (
                  <p className="text-red-500 text-xs">
                    {(unitsErrorMessage as Error)?.message ||
                      "Error loading units"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Project Company</Label>
                <Input
                  {...register("projectCompany")}
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-1">
                <Label>Referral Name</Label>
                <Input
                  {...register("referralName")}
                  placeholder="Person Name"
                />
              </div>

              <div className="space-y-1">
                <Label>Referral Contact</Label>
                <Input
                  {...register("referralContact")}
                  maxLength={10}
                  placeholder="Phone Number"
                />
                {errors.referralContact?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.referralContact.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Registration Status</Label>
                <Select
                  onValueChange={(v) =>
                    setValue(
                      "registrationStatus",
                      v as CustomerForm["registrationStatus"],
                      { shouldValidate: true }
                    )
                  }
                  value={watch("registrationStatus")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Booked">Booked</SelectItem>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.registrationStatus?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.registrationStatus.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Booking Date</Label>
                <Input {...register("bookingDate")} type="date" />
                {errors.bookingDate?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.bookingDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Total Amount</Label>
                <Input
                  {...register("totalAmount", { valueAsNumber: true })}
                  type="number"
                  min={0}
                />
                {errors.totalAmount?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.totalAmount.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Advance Received</Label>
                <Input
                  {...register("advanceReceived", { valueAsNumber: true })}
                  type="number"
                  min={0}
                />
                {errors.advanceReceived?.message && (
                  <p className="text-red-500 text-sm">
                    {errors.advanceReceived.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Payment Plan</Label>
              <Select
                onValueChange={(v) =>
                  setValue("paymentPlan", v as CustomerForm["paymentPlan"], {
                    shouldValidate: true,
                  })
                }
                value={watch("paymentPlan")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Down Payment">Down Payment</SelectItem>
                  <SelectItem value="Monthly EMI">Monthly EMI</SelectItem>
                  <SelectItem value="Construction Linked Plan">
                    Construction Linked Plan
                  </SelectItem>
                  <SelectItem value="Custom Plan">Custom Plan</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentPlan?.message && (
                <p className="text-red-500 text-sm">
                  {errors.paymentPlan.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea {...register("notes")} placeholder="Notes" />
              {errors.notes?.message && (
                <p className="text-red-500 text-sm">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Contractor</Label>
              <Select
                disabled={isLoadingContractors || isErrorContractors}
                onValueChange={(v) =>
                  setValue("contractorId", v, { shouldValidate: true })
                }
                value={watch("contractorId")}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingContractors
                        ? "Loading contractors..."
                        : isErrorContractors
                        ? "Failed to load contractors"
                        : "Select Contractor"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {contractors?.length
                    ? contractors.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))
                    : !isLoadingContractors &&
                      !isErrorContractors && (
                        <SelectItem disabled value="none">
                          No contractors found
                        </SelectItem>
                      )}
                </SelectContent>
              </Select>

              {errors.contractorId?.message && (
                <p className="text-red-500 text-sm">
                  {errors.contractorId.message}
                </p>
              )}
              {isErrorContractors && (
                <p className="text-red-500 text-xs">
                  {(contractorsError as Error)?.message ||
                    "Error loading contractors"}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Site Incharge</Label>
              <Select
                disabled={isLoadingSiteIncharge || isErrorSiteIncharge}
                onValueChange={(v) =>
                  setValue("siteInchargeId", v, { shouldValidate: true })
                }
                value={watch("siteInchargeId")}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingSiteIncharge
                        ? "Loading site incharge..."
                        : isErrorSiteIncharge
                        ? "Failed to load site incharge"
                        : "Select Incharge"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {siteIncharge?.length
                    ? siteIncharge.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))
                    : !isLoadingSiteIncharge &&
                      !isErrorSiteIncharge && (
                        <SelectItem disabled value="none">
                          No site incharge found
                        </SelectItem>
                      )}
                </SelectContent>
              </Select>

              {errors.siteInchargeId?.message && (
                <p className="text-red-500 text-sm">
                  {errors.siteInchargeId.message}
                </p>
              )}
              {isErrorSiteIncharge && (
                <p className="text-red-500 text-xs">
                  {(siteInchargeError as Error)?.message ||
                    "Error loading site incharge"}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                onValueChange={(v) =>
                  setValue("status", v as CustomerForm["status"], {
                    shouldValidate: true,
                  })
                }
                value={watch("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status?.message && (
                <p className="text-red-500 text-sm">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Final Price</Label>
              <Input
                {...register("finalPrice", { valueAsNumber: true })}
                type="number"
                min={0}
              />
              {errors.finalPrice?.message && (
                <p className="text-red-500 text-sm">
                  {errors.finalPrice.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Payment Status</Label>
            <Select
              onValueChange={(v) =>
                setValue("paymentStatus", v as CustomerForm["paymentStatus"], {
                  shouldValidate: true,
                })
              }
              value={watch("paymentStatus")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentStatus?.message && (
              <p className="text-red-500 text-sm">
                {errors.paymentStatus.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Images</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleDocumentsChange}
            />
            {(documentPreviews.length > 0 || existingDocuments.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 border rounded-lg bg-gray-50">
                {documentPreviews.map((preview, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative border rounded-lg overflow-hidden bg-white shadow-sm"
                  >
                    {preview.isImage ? (
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                        <span className="text-sm text-gray-600 truncate px-2">
                          {preview.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                      onClick={() => removePreview(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {mode === "edit" &&
                  existingDocuments.map((url, idx) => {
                    const name =
                      url.split("/").pop()?.split("?")[0] || "Document";
                    const path = url.split("?")[0];
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                      path
                    );
                    return (
                      <div
                        key={`existing-${idx}`}
                        className="relative border rounded-lg overflow-hidden bg-white shadow-sm"
                      >
                        {isImage ? (
                          <img
                            src={url}
                            alt={name}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                            <span className="text-sm text-gray-600 truncate px-2">
                              {name}
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black text-white text-xs px-2 py-1 rounded">
                          Existing
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Payment Details</Label>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col md:flex-row gap-2 border p-4 rounded-lg bg-gray-50"
                >
                  <Controller
                    name={`paymentDetails.${index}.amount`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={value || ""}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="flex-1"
                      />
                    )}
                  />
                  {errors.paymentDetails?.[index]?.amount && (
                    <p className="text-red-500 text-sm">
                      {errors.paymentDetails[index]?.amount?.message}
                    </p>
                  )}

                  <Controller
                    name={`paymentDetails.${index}.date`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        type="date"
                        value={value || ""}
                        onChange={onChange}
                        className="flex-1"
                      />
                    )}
                  />
                  {errors.paymentDetails?.[index]?.date && (
                    <p className="text-red-500 text-sm">
                      {errors.paymentDetails[index]?.date?.message}
                    </p>
                  )}

                  <Controller
                    name={`paymentDetails.${index}.paymentMode`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder="Payment Mode"
                        value={value || ""}
                        onChange={onChange}
                        className="flex-1"
                      />
                    )}
                  />

                  <Controller
                    name={`paymentDetails.${index}.referenceNumber`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder="Ref Number"
                        value={value || ""}
                        onChange={onChange}
                        className="flex-1"
                      />
                    )}
                  />

                  <Controller
                    name={`paymentDetails.${index}.remarks`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder="Remarks"
                        value={value || ""}
                        onChange={onChange}
                        className="flex-1"
                      />
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    className="w-20"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={() =>
                append({
                  amount: 0,
                  date: "",
                  paymentMode: "",
                  referenceNumber: "",
                  remarks: "",
                })
              }
            >
              Add Payment Row
            </Button>
            {errors.paymentDetails && (
              <p className="text-red-500 text-sm">
                {typeof errors.paymentDetails === "string"
                  ? errors.paymentDetails
                  : ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Last Payment Date</Label>
              <Input {...register("lastPaymentDate")} type="date" />
              {errors.lastPaymentDate?.message && (
                <p className="text-red-500 text-sm">
                  {errors.lastPaymentDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Construction Stage</Label>
              <Input
                {...register("constructionStage")}
                placeholder="Eg: Slab Completed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Expected Delivery Date</Label>
              <Input {...register("expectedDeliveryDate")} type="date" />
              {errors.expectedDeliveryDate?.message && (
                <p className="text-red-500 text-sm">
                  {errors.expectedDeliveryDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Delivery Date</Label>
              <Input {...register("deliveryDate")} type="date" />
              {errors.deliveryDate?.message && (
                <p className="text-red-500 text-sm">
                  {errors.deliveryDate.message}
                </p>
              )}
            </div>
            <div className="space-y-4">
              <Label>PDF Document</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.type === "application/pdf") {
                    setPdfFile(file);
                  } else {
                    toast.error("Please upload a valid PDF file.");
                  }
                }}
              />

              {mode === "edit" && initialData?.pdfDocument && (
                <a
                  href={initialData.pdfDocument}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Existing PDF
                </a>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                isSubmitting ||
                addMutation.isPending ||
                updateMutation.isPending
              }
              type="submit"
              className="flex gap-1 px-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {mode === "edit"
                ? updateMutation?.isPending
                  ? "Updating..."
                  : "Update"
                : addMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDialog;
