import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Camera, Plus, BadgeIndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import ContractorProjectsOverview from "@/components/dashboard/contractor/ContractorProjectsOverview";
import ContractorTaskList from "@/components/dashboard/contractor/ContractorTaskList";
import ContractorActivityFeed from "@/components/dashboard/contractor/ContractorActivityFeed";
import ContractorUpcomingTasks from "@/components/dashboard/contractor/ContractorUpcomingTasks";
import ContractorTimeline from "@/components/dashboard/contractor/ContractorTimeline";
import ContractorMaterials from "@/components/dashboard/contractor/ContractorMaterials";
import ContractorLabor from "@/components/dashboard/contractor/ContractorLabor";
import ContractorInvoices from "@/components/dashboard/contractor/ContractorInvoices";
import ContractorPhotoEvidence from "@/components/dashboard/contractor/ContractorPhotoEvidence";
import AddTaskDialog from "@/components/dashboard/contractor/AddTaskDialog";
import UploadEvidenceDialog from "@/components/dashboard/contractor/UploadEvidenceDialog";
import ContractorDashboardStats from "./ContractorDashboardStats";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import {
  Project,
  usefetchProjects,
  usefetchProjectsForDropdown,
} from "@/utils/project/ProjectConfig";
import { useFetchInvoices } from "@/utils/invoices/InvoiceConfig";
import Loader from "@/components/Loader";

// Define interfaces to match backend
interface Task {
  _id: string;
  taskTitle: string;
  projectName: string;
  unit: string;
  constructionPhase: string;
  status:
    | "In progress"
    | "completed"
    | "pending review"
    | "pending verification"
    | "approved"
    | "rework"
    | "rejected";
  deadline: string;
  progress: number;
  priority: "high" | "medium" | "low" | string;
  contractorUploadedPhotos: string[];
  projectId: string;
  contractorId: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
}

interface CompletedTask {
  taskId: string;
  title: string;
  projectName: string;
  unit: string;
}

// Form schema
const invoiceSchema = z.object({
  project: z.string().min(2, "Project is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  sgst: z.coerce
    .number()
    .min(0, "SGST rate must be positive")
    .max(14, "SGST rate cannot exceed 14%"),
  cgst: z.coerce
    .number()
    .min(0, "CGST rate must be positive")
    .max(14, "CGST rate cannot exceed 14%"),
  notes: z.string().optional(),
  task: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const invoiceItemSchema = z.object({
  description: z.string().min(2, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  rate: z.coerce.number().positive("Rate must be positive"),
  taxRate: z.coerce
    .number()
    .min(0, "Tax rate must be positive")
    .max(28, "Tax rate cannot exceed 28%"),
  task: z.string().optional(),
});

type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

const ContractorDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [uploadEvidenceOpen, setUploadEvidenceOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [relatedToTask, setRelatedToTask] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const navigate = useNavigate();

  const {
    data: invoices = [],
    isLoading: invoiceLoading,
    isError: invoiceError,
    error: fetchError,
    refetch,
  } = useFetchInvoices();

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsFetchError,
  } = usefetchProjects();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      project: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      sgst: 9,
      cgst: 9,
      unit: "",
    },
  });

  const itemForm = useForm<InvoiceItemFormValues>({
    resolver: zodResolver(invoiceItemSchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unit: "Job",
      rate: 0,
      taxRate: 18,
    },
    mode: "onChange",
  });

  const watchProject = form.watch("project");

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/project/tasks`,
        { withCredentials: true }
      );
      const mapped = response.data.map((task: any, index: number) => ({
        _id: task._id,
        taskTitle: task.taskTitle,
        projectName: task.projectName,
        unit: task.unit,
        constructionPhase: task.constructionPhase,
        status: task.status as Task["status"],
        deadline: task.deadline,
        progress: task.progress,
        priority: task.priority || "medium",
        contractorUploadedPhotos: task.contractorUploadedPhotos || [],
        projectId: task.projectId,
        contractorId: task.contractorId,
      }));
      setTasks(mapped);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks. Please try again.");
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/invoices/completed/tasks`,
        { withCredentials: true }
      );
      setCompletedTasks(
        res.data.tasks.map((task: any) => ({
          taskId: task._id,
          title: task.taskTitle,
          projectName: task.projectName,
          unit: task.unit,
        }))
      );
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
      toast.error("Failed to fetch completed tasks.");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCompletedTasks();
  }, []);

  useEffect(() => {
    const found = projects.find((proj) => proj._id === watchProject);
    if (found !== selectedProject) {
      setSelectedProject(found || null);
    }
  }, [watchProject, projects]);

  const addInvoiceItem = async (data: InvoiceItemFormValues) => {
    const amount = data.quantity * data.rate;
    const newItem: InvoiceItem = {
      id: (invoiceItems.length + 1).toString(),
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      rate: data.rate,
      amount,
      taxRate: data.taxRate,
    };
    setInvoiceItems((prev) => [...prev, newItem]);
    itemForm.reset({
      description: "",
      quantity: 1,
      unit: "Job",
      rate: 0,
      taxRate: 18,
    });
    setShowAddItem(false);
    toast.success("Item added to invoice");
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    toast.success("Item removed from invoice");
  };

  const handleSubmit = async (data: InvoiceFormValues) => {
    try {
      if (invoiceItems.length === 0) {
        toast.error("Please add at least one item to the invoice");
        return;
      }

      const subtotal = invoiceItems.reduce(
        (sum, item) => sum + item.quantity * item.rate,
        0
      );
      const sgstAmount = (data.sgst / 100) * subtotal;
      const cgstAmount = (data.cgst / 100) * subtotal;
      const totalAmount = subtotal + sgstAmount + cgstAmount;

      const payload = {
        project: data.project,
        task: relatedToTask ? data.task : null,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        items: invoiceItems,
        sgst: data.sgst,
        cgst: data.cgst,
        notes: data.notes || "",
        subtotal,
        total: totalAmount,
        unit: data.unit,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/invoices`,
        payload,
        { withCredentials: true }
      );

      toast.success(
        `Invoice ${response.data.invoiceNumber || "created"} successfully`
      );

      refetch();
      form.reset({
        project: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        sgst: 9,
        cgst: 9,
        unit: "",
      });
      setInvoiceItems([]);
      setCreateDialogOpen(false);
      setRelatedToTask(false);
    } catch (error: any) {
      console.error("Invoice creation error:", error);
      toast.error(
        error?.response?.data?.error || "Failed to create invoice. Try again."
      );
    }
  };

  if (projectsLoading || invoiceLoading) return <Loader />;
  if (projectsError || invoiceError) {
    toast.error(
      projectsError
        ? projectsFetchError?.message || "Failed to load projects"
        : fetchError?.message || "Failed to load invoices"
    );
    return (
      <MainLayout>
        <div className="text-red-500 p-8">
          Error:{" "}
          {projectsError ? projectsFetchError?.message : fetchError?.message}
        </div>
      </MainLayout>
    );
  }

  // Derive unit names from selected project's units
  const unitNames = selectedProject
    ? Object.keys(selectedProject.units || {})
    : [];

  return (
    <MainLayout>
      <div className="space-y-4 md:p-8 p-2">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-md font-vidaloka tracking-tight">
            Contractor Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your projects, tasks, and invoices
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </DialogTrigger>
            <AddTaskDialog
              onOpenChange={setAddTaskOpen}
              fetchTasks={fetchTasks}
            />
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="project"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem
                                  key={project._id}
                                  value={project._id}
                                >
                                  {project.projectId?.projectName ||
                                    "Untitled Project"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedProject}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {unitNames.length === 0 ? (
                                <SelectItem value="__none__" disabled>
                                  No units available
                                </SelectItem>
                              ) : (
                                unitNames.map((unitName) => (
                                  <SelectItem key={unitName} value={unitName}>
                                    {unitName}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sgst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SGST (%)</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select SGST rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="2.5">2.5%</SelectItem>
                              <SelectItem value="6">6%</SelectItem>
                              <SelectItem value="9">9%</SelectItem>
                              <SelectItem value="14">14%</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cgst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CGST (%)</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select CGST rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="2.5">2.5%</SelectItem>
                              <SelectItem value="6">6%</SelectItem>
                              <SelectItem value="9">9%</SelectItem>
                              <SelectItem value="14">14%</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <FormItem>
                      <FormLabel>Related to a Task?</FormLabel>
                      <div className="flex space-x-4 mt-1">
                        <Button
                          type="button"
                          variant={relatedToTask ? "default" : "outline"}
                          onClick={() => setRelatedToTask(true)}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={!relatedToTask ? "default" : "outline"}
                          onClick={() => setRelatedToTask(false)}
                        >
                          No
                        </Button>
                      </div>
                    </FormItem>
                  </div>

                  {relatedToTask && (
                    <FormField
                      control={form.control}
                      name="task"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Select Task</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a completed task" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {completedTasks.length === 0 ? (
                                <SelectItem value="__none__" disabled>
                                  No completed tasks
                                </SelectItem>
                              ) : (
                                completedTasks.map((task) => (
                                  <SelectItem
                                    key={task.taskId}
                                    value={task.taskId}
                                  >
                                    {`${task.title} - ${task.projectName} / ${task.unit}`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Invoice Items</h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddItem(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                      </Button>
                    </div>

                    {invoiceItems.length === 0 ? (
                      <div className="border rounded-md p-4 text-center text-muted-foreground">
                        No items added to this invoice. Click "Add Item" to get
                        started.
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Rate (₹)</TableHead>
                              <TableHead>Tax %</TableHead>
                              <TableHead>Amount (₹)</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                  ₹{item.rate.toLocaleString()}
                                </TableCell>
                                <TableCell>{item.taxRate}%</TableCell>
                                <TableCell>
                                  ₹{item.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeInvoiceItem(item.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {showAddItem && (
                      <Form {...itemForm}>
                        <div className="border rounded-md p-4 mt-4">
                          <h4 className="text-sm font-medium mb-4">
                            Add New Item
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={itemForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Item description"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={itemForm.control}
                                name="quantity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(Number(e.target.value))
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={itemForm.control}
                                name="unit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Unit</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="Job">Job</SelectItem>
                                        <SelectItem value="Hours">
                                          Hours
                                        </SelectItem>
                                        <SelectItem value="Days">
                                          Days
                                        </SelectItem>
                                        <SelectItem value="Sq.ft">
                                          Sq.ft
                                        </SelectItem>
                                        <SelectItem value="Units">
                                          Units
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={itemForm.control}
                              name="rate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rate (₹)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        className="pl-10"
                                        type="number"
                                        min="0"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(Number(e.target.value))
                                        }
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={itemForm.control}
                              name="taxRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tax Rate (%)</FormLabel>
                                  <Select
                                    onValueChange={(value) =>
                                      field.onChange(Number(value))
                                    }
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select tax rate" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="0">0%</SelectItem>
                                      <SelectItem value="5">5%</SelectItem>
                                      <SelectItem value="12">12%</SelectItem>
                                      <SelectItem value="18">18%</SelectItem>
                                      <SelectItem value="28">28%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2 mt-5">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowAddItem(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={async () => {
                                const isValid = await itemForm.trigger();
                                if (isValid) {
                                  addInvoiceItem(itemForm.getValues());
                                } else {
                                  toast.error(
                                    "Please correct the errors in the item form"
                                  );
                                }
                              }}
                            >
                              Add Item
                            </Button>
                          </div>
                        </div>
                      </Form>
                    )}
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>
                        ₹
                        {invoiceItems
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>SGST ({form.watch("sgst")}%):</span>
                      <span>
                        ₹
                        {(
                          invoiceItems.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ) *
                          (form.watch("sgst") / 100)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>CGST ({form.watch("cgst")}%):</span>
                      <span>
                        ₹
                        {(
                          invoiceItems.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ) *
                          (form.watch("cgst") / 100)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>
                        ₹
                        {(
                          invoiceItems.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ) *
                          (1 + (form.watch("sgst") + form.watch("cgst")) / 100)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes for the invoice"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRelatedToTask(false);
                        setCreateDialogOpen(false);
                        setInvoiceItems([]);
                        setShowAddItem(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Invoice</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={uploadEvidenceOpen}
            onOpenChange={setUploadEvidenceOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Camera className="mr-2 h-4 w-4" />
                Upload Evidence
              </Button>
            </DialogTrigger>
            <UploadEvidenceDialog onOpenChange={setUploadEvidenceOpen} />
          </Dialog>
        </div>

        {tasks && projects && (
          <ContractorDashboardStats tasks={tasks} projects={projects} />
        )}

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-4"
        >
          <div className="hidden lg:block">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
              <TabsTrigger value="tasks">Task Management</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="labor">Labor</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="evidence">Photo Evidence</TabsTrigger>
            </TabsList>
          </div>

          <div className="block lg:hidden">
            <Select value={selectedTab} onValueChange={setSelectedTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="projects">My Projects</SelectItem>
                <SelectItem value="tasks">Task Management</SelectItem>
                <SelectItem value="timeline">Timeline</SelectItem>
                <SelectItem value="materials">Materials</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="invoices">Invoices</SelectItem>
                <SelectItem value="evidence">Photo Evidence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Projects Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractorProjectsOverview
                    projects={projects}
                    isLoading={projectsLoading}
                    isError={projectsError}
                    error={projectsFetchError}
                  />
                </CardContent>
              </Card>
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractorUpcomingTasks />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorProjectsOverview
                  projects={projects}
                  isLoading={projectsLoading}
                  isError={projectsError}
                  error={projectsFetchError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorTaskList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Construction Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorTimeline />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Materials Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorMaterials />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Labor Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorLabor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorInvoices />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photo Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorPhotoEvidence />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ContractorDashboard;
