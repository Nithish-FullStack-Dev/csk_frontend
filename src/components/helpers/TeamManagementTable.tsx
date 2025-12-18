import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AgentList,
  AgentListResponse,
  useAgentList,
} from "@/utils/agent/AgentConfig";
import axios, { AxiosError } from "axios";
import {
  AlertTriangle,
  Download,
  Eye,
  FileX,
  Loader2,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { useUnAssignedAgents } from "@/utils/leads/LeadConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChangeEvent, FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usefetchProjectsForDropdown } from "@/utils/project/ProjectConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DeleteConfirmDialog } from "../properties/DeleteConfirmDialog";

const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  return d.toISOString().split("T")[0];
};

const TeamManagementTable = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AgentList>({
    agentId: "",
    panCard: "",
    aadharCard: "",
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    branchName: "",
    project: "",
    totalAmount: 0,
    agreedCommissionPercent: 0,
    amountReceived: 0,
    commissionPaid: 0,
    paymentDate: "",
    notes: "",
    approvedBy: null,
  });

  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState<AgentList | null>(null);

  const { data: response, isLoading, isError, error } = useAgentList();

  const {
    data: availableAgents,
    isLoading: isTeamMemLoading,
    isError: teamMemError,
  } = useUnAssignedAgents();

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErrorDetails,
  } = usefetchProjectsForDropdown();

  const addMutation = useMutation({
    mutationFn: async (payload: AgentList): Promise<AgentListResponse> => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/agentlist/addAgentList`,
        payload,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["agent-list"] });
      queryClient.invalidateQueries({ queryKey: ["agent-dropdown"] });
      setOpenDialog(false);
      reset();
      toast.success(data?.message ?? "Agent added Successfully !!!");
    },
    onError: async (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data?.message ?? "Something went wrong");
      else toast.error(error?.message ?? "Something went wrong");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | null;
      payload: AgentList;
    }): Promise<AgentListResponse> => {
      if (!id) throw new Error("Missing agent ID");
      const { data } = await axios.put(
        `${import.meta.env.VITE_URL}/api/agentlist/updateAgent/${id}`,
        payload,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["agent-list"] });
      queryClient.invalidateQueries({ queryKey: ["agent-dropdown"] });
      setOpenDialog(false);
      reset();
      toast.success(data?.message ?? "Agent updated Successfully !!!");
    },
    onError: async (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data?.message ?? "Something went wrong");
      else toast.error(error?.message ?? "Something went wrong");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<AgentListResponse> => {
      if (!id) throw new Error("Missing agent ID");
      const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/api/agentlist/deleteAgentList/${id}`,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["agent-list"] });
      queryClient.invalidateQueries({ queryKey: ["agent-dropdown"] });
      setDeleteDialogOpen(false);
      setDeleteId(null);
      reset();
      toast.success(data?.message ?? "Agent deleted Successfully !!!");
    },
    onError: async (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data?.message ?? "Something went wrong");
      else toast.error(error?.message ?? "Something went wrong");
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value: rawValue } = e.target;

    let value = rawValue;

    // Prevent negative values for all number fields
    const numberFields = [
      "totalAmount",
      "agreedCommissionPercent",
      "amountReceived",
      "commissionPaid",
    ];

    if (numberFields.includes(name)) {
      // Remove non-digit characters
      value = rawValue.replace(/[^0-9]/g, "");

      // Optional: Prevent leading zeros for clean UX
      if (value.startsWith("0") && value.length > 1)
        value = value.replace(/^0+/, "");

      setForm((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    // Aadhar
    if (name === "aadharCard") {
      value = rawValue.replace(/\D/g, "").slice(0, 12);
      if (value.length < 12)
        setErrors((p) => ({ ...p, aadharCard: "Aadhaar must be 12 digits" }));
      else
        setErrors((p) => {
          const { aadharCard, ...r } = p;
          return r;
        });
    }

    // PAN
    else if (name === "panCard") {
      value = rawValue
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (value.length === 10 && !panPattern.test(value))
        setErrors((p) => ({ ...p, panCard: "PAN format is invalid" }));
      else if (value.length < 10)
        setErrors((p) => ({ ...p, panCard: "PAN must be 10 characters" }));
      else
        setErrors((p) => {
          const { panCard, ...r } = p;
          return r;
        });
    }

    // Account number
    else if (name === "accountNumber") {
      value = rawValue.replace(/\D/g, "").slice(0, 18);
      if (value.length < 9)
        setErrors((p) => ({
          ...p,
          accountNumber: "Minimum 9 digits required",
        }));
      else
        setErrors((p) => {
          const { accountNumber, ...r } = p;
          return r;
        });
    }

    // IFSC
    else if (name === "ifsc") {
      value = rawValue
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 11);
      if (value.length !== 11)
        setErrors((p) => ({ ...p, ifsc: "IFSC must be 11 characters" }));
      else
        setErrors((p) => {
          const { ifsc, ...r } = p;
          return r;
        });
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === "add") {
      addMutation.mutate(form);
    } else {
      if (!editId) {
        toast.error("Cannot update: Missing agent ID!");
        return;
      }
      updateMutation.mutate({ id: editId, payload: form });
    }
  };

  const reset = () => {
    setSelectedAgent("");
    setSelectedProject("");
    setForm({
      agentId: "",
      panCard: "",
      aadharCard: "",
      accountHolderName: "",
      accountNumber: "",
      ifsc: "",
      bankName: "",
      branchName: "",
      project: "",
      totalAmount: 0,
      agreedCommissionPercent: 0,
      amountReceived: 0,
      commissionPaid: 0,
      paymentDate: "",
      notes: "",
      approvedBy: null,
    });
    setErrors({});
  };

  const resetFormState = () => {
    setMode("add");
    setEditId(null);
    setSelectedAgent("");
    setSelectedProject("");
    setErrors({});
    setForm({
      agentId: "",
      panCard: "",
      aadharCard: "",
      accountHolderName: "",
      accountNumber: "",
      ifsc: "",
      bankName: "",
      branchName: "",
      project: "",
      totalAmount: 0,
      agreedCommissionPercent: 0,
      amountReceived: 0,
      commissionPaid: 0,
      paymentDate: "",
      notes: "",
      approvedBy: null,
    });
  };

  const isFormInvalid =
    Object.keys(errors).length > 0 ||
    !form.agentId ||
    !form.panCard ||
    !form.aadharCard ||
    !form.accountHolderName ||
    !form.accountNumber ||
    !form.ifsc ||
    !form.bankName ||
    !form.branchName ||
    !form.project ||
    form.totalAmount <= 0 ||
    !form.agreedCommissionPercent;

  const handleViewAgent = (agent: AgentList) => {
    setViewData(agent);
    setViewOpen(true);
  };

  const handleEditAgent = (agent: AgentList) => {
    resetFormState();
    setMode("edit");
    setEditId(agent._id ?? null);
    const getId = (field: any): string => {
      if (!field) return null;
      if (typeof field === "string") return field;
      if (typeof field === "object" && field._id) return field._id;
      return null;
    };

    setForm({
      agentId: getId(agent.agentId),
      panCard: agent.panCard || "",
      aadharCard: agent.aadharCard || "",
      accountHolderName: agent.accountHolderName || "",
      accountNumber: agent.accountNumber || "",
      ifsc: agent.ifsc || "",
      bankName: agent.bankName || "",
      branchName: agent.branchName || "",
      project: getId(agent.project),
      totalAmount: agent.totalAmount || 0,
      agreedCommissionPercent: agent.agreedCommissionPercent || 0,
      amountReceived: agent.amountReceived || 0,
      commissionPaid: agent.commissionPaid || 0,
      paymentDate: agent.paymentDate ? formatDate(agent.paymentDate) : "",
      notes: agent.notes || "",
      approvedBy: getId(agent.approvedBy),
    });

    setSelectedAgent(
      typeof agent.agentId === "object" ? agent.agentId._id : ""
    );
    setSelectedProject(
      typeof agent.project === "object" ? agent.project._id : ""
    );

    setOpenDialog(true);
  };

  const handleDeleteAgent = () => {
    deleteMutation.mutate(deleteId);
  };

  return (
    <section>
      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 p-6 border border-red-300 rounded-lg bg-red-50 text-red-700">
          <AlertTriangle className="h-10 w-10" />
          <p className="font-medium text-lg">
            {axios.isAxiosError(error)
              ? error?.response?.data?.message ?? "Something went wrong"
              : "Something went wrong"}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading agents...</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex md:justify-end justify-normal">
          <Button
            onClick={() => {
              resetFormState();
              setOpenDialog(true);
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {mode === "add" ? "Add Agent" : "Edit Agent"}
          </Button>
        </div>
        <div>
          {!isLoading && !isError && response?.data?.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center border rounded-lg bg-muted/10">
              <FileX className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Agents Found</h3>
              <p className="text-sm text-muted-foreground">
                Add agents to see them listed here.
              </p>
            </div>
          )}
          {response?.data?.length > 0 && (
            <div className="border rounded-lg bg-white shadow-sm overflow-hidden max-w-[90vw]">
              <div className="overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader className="bg-muted/40 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">
                        Agent Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Contact
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        PAN
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Aadhar
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Account Holder
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        IFSC
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Bank
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Branch
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {response.data.map((agent: AgentList, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="py-3">
                          {typeof agent.agentId === "object"
                            ? agent.agentId.name
                            : "-"}
                        </TableCell>

                        <TableCell className="py-3">
                          {typeof agent.agentId === "object"
                            ? agent.agentId.phone
                            : "-"}
                        </TableCell>

                        <TableCell className="py-3">{agent.panCard}</TableCell>
                        <TableCell className="py-3">
                          {agent.aadharCard}
                        </TableCell>
                        <TableCell className="py-3">
                          {agent.accountHolderName}
                        </TableCell>
                        <TableCell className="py-3">{agent.ifsc}</TableCell>
                        <TableCell className="py-3">{agent.bankName}</TableCell>
                        <TableCell className="py-3">
                          {agent.branchName}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <DropdownMenuItem
                                onClick={() => handleViewAgent(agent)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setMode("edit");
                                  handleEditAgent(agent);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Edit Agent
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-700"
                                onClick={() => {
                                  setDeleteId(agent._id ?? null);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) resetFormState();
          setOpenDialog(open);
        }}
      >
        <DialogContent className="max-w-3xl w-[90vw] h-[85vh] rounded-md flex flex-col">
          <DialogHeader>
            <DialogTitle>Add the Agent</DialogTitle>
            <DialogDescription>
              Enter the agent details below.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mode === "add" && (
                  <div className="flex flex-col gap-1">
                    <Label>Agent</Label>
                    <Select
                      onValueChange={(val) => {
                        setSelectedAgent(val);
                        setForm((prev) => ({ ...prev, agentId: val }));
                      }}
                      value={selectedAgent}
                      disabled={isTeamMemLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAgents?.map((agent) => (
                          <SelectItem key={agent._id} value={agent._id}>
                            {agent.name} ({agent.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground mt-2">
                      {isTeamMemLoading
                        ? "Loading available agents..."
                        : teamMemError
                        ? "Failed to load available agents"
                        : `${availableAgents?.length ?? 0} agent(s) available`}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={selectedProject}
                    onValueChange={(val) => {
                      setSelectedProject(val);
                      setForm((preVal) => ({
                        ...preVal,
                        project: val,
                      }));
                    }}
                    required
                    disabled={projectsLoading}
                  >
                    <SelectTrigger id="project">
                      <SelectValue
                        placeholder={
                          projectsLoading ? "Loading..." : "Select project"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projectsLoading ? (
                        <SelectItem value="">Loading...</SelectItem>
                      ) : (
                        projects?.map((p: any) => (
                          <SelectItem key={p?._id} value={p?._id}>
                            {p.projectId?.projectName +
                              " floor no: " +
                              p?.floorUnit?.floorNumber +
                              " unit: " +
                              p?.unit?.plotNo || "Unnamed Project"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-2">
                    {projectsLoading
                      ? "Loading available projects..."
                      : projectsError
                      ? (projectsErrorDetails as any)
                        ? projectsErrorDetails?.message ??
                          "Failed to load available projects"
                        : "Failed to load available projects"
                      : `${projects?.length ?? 0} project(s) available`}
                  </div>
                </div>

                <InputField
                  label="PAN Card"
                  name="panCard"
                  value={form.panCard}
                  onChange={handleChange}
                  error={errors.panCard}
                />
                <InputField
                  label="Aadhar"
                  name="aadharCard"
                  value={form.aadharCard}
                  onChange={handleChange}
                  error={errors.aadharCard}
                />
                <InputField
                  label="Account Holder"
                  name="accountHolderName"
                  value={form.accountHolderName}
                  onChange={handleChange}
                />
                <InputField
                  label="Account Number"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  error={errors.accountNumber}
                />
                <InputField
                  label="IFSC"
                  name="ifsc"
                  value={form.ifsc}
                  onChange={handleChange}
                  error={errors.ifsc}
                />
                <InputField
                  label="Bank Name"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                />
                <InputField
                  label="Branch Name"
                  name="branchName"
                  value={form.branchName}
                  onChange={handleChange}
                />

                <InputField
                  label="Total Amount"
                  name="totalAmount"
                  value={form.totalAmount.toString()}
                  onChange={handleChange}
                />
                <InputField
                  label="Commission %"
                  name="agreedCommissionPercent"
                  value={form.agreedCommissionPercent.toString()}
                  onChange={handleChange}
                />

                <InputField
                  label="Amount Received"
                  name="amountReceived"
                  value={form.amountReceived?.toString() || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Commission Paid"
                  name="commissionPaid"
                  value={form.commissionPaid?.toString() || ""}
                  onChange={handleChange}
                />

                <InputField
                  label="Payment Date"
                  name="paymentDate"
                  value={form.paymentDate || ""}
                  onChange={handleChange}
                  type="date"
                />

                <InputField
                  label="Notes"
                  name="notes"
                  value={form.notes || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Approved By"
                  name="approvedBy"
                  value={form.approvedBy}
                  onChange={handleChange}
                />
              </div>
            </div>

            <DialogFooter>
              <div className="flex flex-col-reverse gap-2 w-full sm:flex-row sm:justify-end">
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={resetFormState}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    isFormInvalid ||
                    addMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="sm:min-w-[140px]"
                >
                  {mode === "add" ? "Save Changes" : "Edit Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="md:w-xl w-[90%] h-[80vh] flex flex-col rounded-md">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
            <DialogDescription>
              Full overview of the selected agent
            </DialogDescription>
          </DialogHeader>

          {viewData && (
            <div className="flex-1 overflow-y-scroll mt-4 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Agent Name</p>
                  <p>
                    {typeof viewData.agentId === "object"
                      ? viewData.agentId.name
                      : "-"}
                  </p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Contact</p>
                  <p>
                    {typeof viewData.agentId === "object"
                      ? viewData.agentId.phone
                      : "-"}
                  </p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">PAN</p>
                  <p>{viewData.panCard}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Aadhar</p>
                  <p>{viewData.aadharCard}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Account Holder</p>
                  <p>{viewData.accountHolderName}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Account Number</p>
                  <p>{viewData.accountNumber}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">IFSC</p>
                  <p>{viewData.ifsc}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Bank</p>
                  <p>{viewData.bankName}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Branch</p>
                  <p>{viewData.branchName}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Project</p>
                  <p>
                    {typeof viewData.project === "object" &&
                    typeof viewData.project.projectId === "object"
                      ? viewData.project?.projectId?.projectName || "-"
                      : "-"}
                  </p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Total Amount</p>
                  <p>{viewData.totalAmount}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Commission %</p>
                  <p>{viewData.agreedCommissionPercent}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Amount Received</p>
                  <p>{viewData.amountReceived}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Commission Paid</p>
                  <p>{viewData.commissionPaid}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20">
                  <p className="font-semibold">Payment Date</p>
                  <p>{viewData.paymentDate || "-"}</p>
                </div>

                <div className="border rounded-lg p-3 bg-muted/20 col-span-full">
                  <p className="font-semibold">Notes</p>
                  <p>{viewData.notes || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteAgent}
        title="Delete Unit"
        description="Are you sure you want to delete this unit? This action cannot be undone."
      />
    </section>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  name: string;
  value: any;
  onChange: any;
  error?: string;
  type?: string;
}) => (
  <div className="flex flex-col gap-1 col-span-1">
    <Label>{label}</Label>
    <Input name={name} value={value ?? ""} onChange={onChange} type={type} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default TeamManagementTable;
