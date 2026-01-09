import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MoreVertical, Eye } from "lucide-react";
import { usefetchProjectsForDropdown } from "@/utils/project/ProjectConfig";
import { fetchAgents } from "@/utils/buildings/CustomerConfig";
import { DeleteConfirmDialog } from "../properties/DeleteConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* -------------------- ZOD SCHEMA -------------------- */
const purchaseSchema = z.object({
  partyName: z.string().min(2, "Party name is required"),
  companyName: z.string().optional(),
  project: z.string().min(1, "Project is required"),
  agent: z.string().min(1, "Agent is required"),
  propertyDescription: z.string().optional(),
  paymentPlan: z.enum([
    "Full Payment",
    "Installments",
    "Construction Linked",
    "Other",
  ]),
  registrationStatus: z.enum(["Registered", "Not Registered", "Under Process"]),
  totalSaleConsideration: z.coerce
    .number()
    .min(0, "Total sale must be zero or positive"),
  advance: z.coerce.number().min(0, "Advance cannot be negative").optional(),
  lastPaymentDate: z.string().optional(),
  nextPaymentDate: z.string().optional(),
  paymentDetails: z.string().optional(),
  notes: z.string().optional(),
});

type PurchaseForm = z.infer<typeof purchaseSchema>;

/* -------------------- API HELPERS -------------------- */
const fetchPurchases = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/purchases/getAllPurchase`
  );
  return data.data;
};

const createPurchase = async (payload: PurchaseForm) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/purchases/addPurchase`,
    payload
  );
  return data;
};

const updatePurchase = async ({
  id,
  payload,
}: {
  id: string;
  payload: PurchaseForm;
}) => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_URL}/api/purchases/updatePurchase/${id}`,
    payload
  );
  return data;
};

const deletePurchase = async (id: string) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_URL}/api/purchases/deletePurchase/${id}`
  );
  return data;
};

/* -------------------- MAIN COMPONENT -------------------- */
export default function PurchaseCrud() {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const {
    data: projects,
    isLoading: projectLoading,
    isError: projectError,
  } = usefetchProjectsForDropdown();

  const {
    data: agents,
    isLoading: agentLoad,
    isError: agentError,
  } = useQuery({
    queryKey: ["agentsfordropdown"],
    queryFn: fetchAgents,
    staleTime: 0,
  });

  const {
    data: purchases,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchases"],
    queryFn: fetchPurchases,
  });

  useEffect(() => {
    if (projectError) toast.error("Failed to load projects");
  }, [projectError]);
  useEffect(() => {
    if (agentError) toast.error("Failed to load agents");
  }, [agentError]);

  const filteredPurchases = useMemo(() => {
    // Always return array
    if (!Array.isArray(purchases) || purchases.length === 0) {
      return [];
    }

    const query = (search ?? "").trim().toLowerCase();
    if (!query) return purchases;

    return purchases.filter((p: any) => {
      if (!p || typeof p !== "object") return false;

      const partyName = String(p.partyName ?? "").toLowerCase();
      const companyName = String(p.companyName ?? "").toLowerCase();

      const projectName =
        typeof p.project === "object"
          ? String(p.project?.projectId?.projectName ?? "").toLowerCase()
          : "";

      const floorNo =
        typeof p.project === "object"
          ? String(p.project?.floorUnit?.floorNumber ?? "").toLowerCase()
          : "";

      const unitNo =
        typeof p.project === "object"
          ? String(p.project?.unit?.plotNo ?? "").toLowerCase()
          : "";

      const agentName =
        typeof p.agent === "object"
          ? String(p.agent?.name ?? "").toLowerCase()
          : "";

      return (
        partyName.includes(query) ||
        companyName.includes(query) ||
        projectName.includes(query) ||
        floorNo.includes(query) ||
        unitNo.includes(query) ||
        agentName.includes(query)
      );
    });
  }, [purchases, search]);

  const form = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      partyName: "",
      companyName: "",
      project: "",
      agent: "",
      propertyDescription: "",
      paymentPlan: undefined,
      registrationStatus: "Not Registered",
      totalSaleConsideration: 0,
      advance: 0,
      lastPaymentDate: "",
      nextPaymentDate: "",
      paymentDetails: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load purchases");
  }, [isError]);

  const createMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success(data.message ?? "Purchase created successfully");
      setOpen(false);
      form.reset();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message ?? "Failed to create purchase");
      } else {
        toast.error("Failed to create purchase");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePurchase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success(data?.message ?? "Purchase updated successfully");
      setOpen(false);
      setSelected(null);
      form.reset();
    },
    onError: (err: any) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message ?? "Failed to update purchase");
      } else {
        toast.error("Failed to update purchase");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success(data?.message ?? "Purchase deleted successfully");
      setDeleteId(null);
      setDeleteDialogOpen(false);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message ?? "Failed to delete purchase");
      } else {
        toast.error("Failed to delete purchase");
      }
    },
  });

  const onSubmit = (values: PurchaseForm) => {
    const payload = { ...values };

    if (mode === "add") {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ id: selected._id, payload });
    }
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const formatDateForInput = (date: any): string => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const handleExportExcel = () => {
    if (!filteredPurchases || filteredPurchases.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = filteredPurchases.map((p: any) => ({
      "Party Name": p.partyName || "N/A",
      "Company Name": p.companyName || "N/A",
      Project:
        p?.project?.projectId?.projectName +
          "/" +
          p?.project?.floorUnit?.floorNumber +
          "/" +
          p?.project?.unit?.plotNo || "",
      Agent: p?.agent?.name || "",
      "Payment Plan": p.paymentPlan || "N/A",
      "Property Description": p.propertyDescription || "N/A",
      "Registration Status": p.registrationStatus || "N/A",
      "Total Sale": p.totalSaleConsideration || "N/A",
      "Payment Details": p.paymentDetails || "N/A",
      Advance: p.advance || 0,
      Balance: p.balance || 0,
      "Last Payment Date": p.lastPaymentDate
        ? new Date(p.lastPaymentDate).toLocaleDateString()
        : "N/A",
      "Next Payment Date": p.nextPaymentDate
        ? new Date(p.nextPaymentDate).toLocaleDateString()
        : "N/A",
      Notes: p.notes || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

    XLSX.writeFile(workbook, "purchases.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end md:gap-5 gap-2 w-full md:flex-row flex-col">
        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={filteredPurchases.length === 0}
        >
          Export to Excel
        </Button>
        <div className="mb-3">
          <Input
            placeholder="Search party, project, unit, agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          onClick={() => {
            setMode("add");
            form.reset({
              partyName: "",
              companyName: "",
              project: "",
              agent: "",
              propertyDescription: "",
              paymentPlan: undefined,
              registrationStatus: "Not Registered",
              totalSaleConsideration: 0,
              advance: 0,
              lastPaymentDate: "",
              nextPaymentDate: "",
              paymentDetails: "",
              notes: "",
            });
            setOpen(true);
          }}
        >
          Add Purchase
        </Button>
      </div>
      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Party</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="animate-spin inline" />
                </TableCell>
              </TableRow>
            ) : filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <span className="text-sm font-medium">
                      No Purchase records found
                    </span>
                    <span className="text-xs">
                      Start by adding a new purchases using the button above
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases?.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell>{p.partyName}</TableCell>
                  <TableCell>
                    {p?.project?.projectId?.projectName ? (
                      p?.project?.projectId?.projectName +
                        "/" +
                        p?.project?.floorUnit?.floorNumber +
                        "/" +
                        p?.project?.unit?.plotNo || "N/A"
                    ) : (
                      <span className="text-muted-foreground italic">
                        Details not available
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{p.totalSaleConsideration}</TableCell>
                  <TableCell>{p.balance}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelected(p);
                            setViewOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setMode("edit");
                            setSelected(p);
                            form.reset({
                              partyName: p.partyName || "",
                              companyName: p.companyName || "",
                              project:
                                typeof p.project === "object"
                                  ? p.project._id
                                  : p.project,
                              agent:
                                typeof p.agent === "object"
                                  ? p.agent._id
                                  : p.agent,
                              propertyDescription: p.propertyDescription || "",
                              paymentPlan: p.paymentPlan,
                              registrationStatus:
                                p.registrationStatus || "Not Registered",
                              totalSaleConsideration:
                                p.totalSaleConsideration || 0,
                              advance: p.advance || 0,
                              lastPaymentDate: formatDateForInput(
                                p.lastPaymentDate
                              ),
                              nextPaymentDate: formatDateForInput(
                                p.nextPaymentDate
                              ),
                              paymentDetails: p.paymentDetails || "",
                              notes: p.notes || "",
                            });
                            setOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setDeleteId(p._id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="md:w-[60%] w-[90%] max-h-[80vh] flex flex-col rounded-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Add Purchase" : "Edit Purchase"}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 overflow-y-auto"
          >
            <div className="p-5 space-y-4">
              <div>
                <Label>Party Name</Label>
                <Input {...form.register("partyName")} />
                <p className="text-sm text-red-500">
                  {form.formState.errors.partyName?.message}
                </p>
              </div>

              <div>
                <Label>Company Name</Label>
                <Input {...form.register("companyName")} />
              </div>

              <div>
                <Label>Project</Label>
                <Select
                  value={form.watch("project")}
                  onValueChange={(v) => {
                    form.setValue("project", v, { shouldValidate: true });
                  }}
                  disabled={projectLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        projectLoading
                          ? "Loading projects..."
                          : "Select project"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projectLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      projects?.map((project: any) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project?.projectId?.projectName} -{" "}
                          {project?.floorUnit?.floorNumber} -{" "}
                          {project?.unit?.plotNo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-red-500">
                  {form.formState.errors.project?.message}
                </p>
              </div>

              <div>
                <Label>Agent</Label>
                <Select
                  value={form.watch("agent")}
                  onValueChange={(v) => form.setValue("agent", v)}
                  disabled={agentLoad}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        agentLoad ? "Loading agents..." : "Select agent"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {agentLoad ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      agents?.map((agent: any) => (
                        <SelectItem key={agent._id} value={agent._id}>
                          {agent.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-red-500">
                  {form.formState.errors.agent?.message}
                </p>
              </div>

              <div>
                <Label>Property Description</Label>
                <Textarea {...form.register("propertyDescription")} />
              </div>

              <div>
                <Label>Payment Plan</Label>
                <Select
                  value={form.watch("paymentPlan")}
                  onValueChange={(v) => form.setValue("paymentPlan", v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Payment">Full Payment</SelectItem>
                    <SelectItem value="Installments">Installments</SelectItem>
                    <SelectItem value="Construction Linked">
                      Construction Linked
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-red-500">
                  {form.formState.errors.paymentPlan?.message}
                </p>
              </div>

              <div>
                <Label>Registration Status</Label>
                <Select
                  value={form.watch("registrationStatus")}
                  onValueChange={(v) =>
                    form.setValue("registrationStatus", v as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select registration status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Not Registered">
                      Not Registered
                    </SelectItem>
                    <SelectItem value="Under Process">Under Process</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-red-500">
                  {form.formState.errors.registrationStatus?.message}
                </p>
              </div>

              <div>
                <Label>Total Sale Consideration</Label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("totalSaleConsideration")}
                />
                <p className="text-sm text-red-500">
                  {form.formState.errors.totalSaleConsideration?.message}
                </p>
              </div>

              <div>
                <Label>Advance</Label>
                <Input type="number" min={0} {...form.register("advance")} />
                <p className="text-sm text-red-500">
                  {form.formState.errors.advance?.message}
                </p>
              </div>

              <div>
                <Label>Last Payment Date</Label>
                <Input type="date" {...form.register("lastPaymentDate")} />
              </div>

              <div>
                <Label>Next Payment Date</Label>
                <Input type="date" {...form.register("nextPaymentDate")} />
              </div>

              <div>
                <Label>Payment Details</Label>
                <Textarea {...form.register("paymentDetails")} />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea {...form.register("notes")} />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {mode === "add" ? "Create" : "Update"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="md:max-w-4xl max-w-[90vw] rounded-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Party Name" value={selected?.partyName} />
            <Detail label="Company Name" value={selected?.companyName} />

            <Detail
              label="Project"
              value={
                selected?.project?.projectId?.projectName +
                  "/" +
                  selected?.project?.floorUnit?.floorNumber +
                  "/" +
                  selected?.project?.unit?.plotNo || "N/A"
              }
            />
            <Detail label="Agent" value={selected?.agent?.name} />

            <div className="col-span-2">
              <p className="text-muted-foreground">Property Description</p>
              <p className="font-medium whitespace-pre-wrap">
                {selected?.propertyDescription || "N/A"}
              </p>
            </div>

            <Detail label="Payment Plan" value={selected?.paymentPlan} />
            <Detail
              label="Registration Status"
              value={selected?.registrationStatus}
            />

            <Detail
              label="Total Sale Consideration"
              value={selected?.totalSaleConsideration}
            />
            <Detail label="Advance" value={selected?.advance} />
            <Detail label="Balance" value={selected?.balance} />

            <Detail
              label="Last Payment Date"
              value={
                selected?.lastPaymentDate
                  ? new Date(selected.lastPaymentDate).toLocaleDateString()
                  : "—"
              }
            />
            <Detail
              label="Next Payment Date"
              value={
                selected?.nextPaymentDate
                  ? new Date(selected.nextPaymentDate).toLocaleDateString()
                  : "—"
              }
            />

            <div className="col-span-2">
              <p className="text-muted-foreground">Payment Details</p>
              <p className="font-medium whitespace-pre-wrap">
                {selected?.paymentDetails ?? "—"}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium whitespace-pre-wrap">
                {selected?.notes ?? "—"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Purchase"
        description="Are you sure you want to delete this purchase? This action cannot be undone."
      />
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value?: any }) => (
  <div>
    <p className="text-muted-foreground">{label}</p>
    <p className="font-medium">{value ?? "—"}</p>
  </div>
);
