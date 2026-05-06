import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  Dialog,
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Search,
  Plus,
  BadgeIndianRupee,
  FileText,
  Package,
  CalendarClock,
  X,
  EclipseIcon,
  FlipVertical,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Project,
  usefetchProjectsForDropdown,
} from "@/utils/project/ProjectConfig";
import { useRBAC } from "@/config/RBAC";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Material {
  _id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  supplier: string;
  rate: number;
  totalCost: number;
  deliveryDate: string;
  project: any;
  status: string;
  poNumber: string;
  invoiceNumber: string;
  remarks?: string;
  contractor?: any;
}

const materialSchema = z.object({
  name: z.string().min(2, "Material name is required"),
  type: z.string().min(1, "Material type is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  supplier: z.string().min(2, "Supplier name is required"),
  rate: z.coerce.number().positive("Rate must be positive"),
  project: z.string().min(1, "Project is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  poNumber: z.string().min(1, "PO number is required"),
  invoiceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

const materialTypes = [
  "Cement",
  "Steel",
  "Sand",
  "Aggregate",
  "Bricks",
  "Paint",
  "Electrical",
  "Plumbing",
  "Timber",
  "Glass",
  "Tiles",
  "Hardware",
  "Chemicals",
  "Tools",
  "Other",
];

const materialUnits = [
  "Bags",
  "Kg",
  "Tons",
  "Cubic Meters",
  "Cubic Feet",
  "Pieces",
  "Bundles",
  "Rolls",
  "Liters",
  "Gallons",
  "Sets",
  "Sheets",
  "Boxes",
  "Pairs",
  "Units",
];

const ContractorMaterials = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { userCanAddUser } = useRBAC({ roleSubmodule: "Materials" });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [statusValue, setStatusValue] = useState("");
  const [dialogType, setDialogType] = useState<
    "add" | "edit" | "view" | "status" | null
  >(null);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      type: "Cement",
      unit: "Bags",
      project: "",
      deliveryDate: new Date().toISOString().split("T")[0],
    },
  });

  const editForm = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
  });

  const { data: projects = [], isLoading: isLoadingProjects } =
    usefetchProjectsForDropdown();

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/materials`, {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: MaterialFormValues) => {
      const payload = {
        ...values,
        quantity: Number(values.quantity),
        rate: Number(values.rate),
        deliveryDate: new Date(values.deliveryDate),
        project: values.project,
        status: "Ordered",
      };
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/materials`,
        payload,
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Material added successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      closeDialog();
    },
    onError: (error: any) => {
      if (error?.response?.data?.field === "poNumber") {
        form.setError("poNumber", { message: error.response.data.message });
      } else {
        toast.error("Failed to add material");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: MaterialFormValues;
    }) => {
      const payload = {
        ...values,
        quantity: Number(values.quantity),
        rate: Number(values.rate),
        deliveryDate: new Date(values.deliveryDate),
      };
      const res = await axios.put(
        `${import.meta.env.VITE_URL}/api/materials/${id}`,
        payload,
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Material updated successfully");
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      closeDialog();
    },
    onError: (error: any) => {
      if (error?.response?.data?.field === "poNumber") {
        editForm.setError("poNumber", { message: error.response.data.message });
      } else {
        toast.error("Failed to update material");
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await axios.patch(
        `${import.meta.env.VITE_URL}/api/materials/${id}/status`,
        { status },
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      setSelectedMaterial(null);
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      closeDialog();
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const openStatusDialog = (material: Material) => {
    setSelectedMaterial(material);
    setStatusValue(material.status);
    setDialogType("status");
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedMaterial(null);
    setStatusValue("");
    form.reset();
    editForm.reset();
  };

  const openAddDialog = () => {
    setSelectedMaterial(null);
    setDialogType("add");
  };

  const openViewDialog = (material: Material) => {
    setSelectedMaterial(material);
    setDialogType("view");
  };

  const filteredMaterials = materials.filter((material: Material) => {
    const query = searchQuery.toLowerCase();

    const materialName = material.name?.toLowerCase() || "";
    const materialType = material.type?.toLowerCase() || "";
    const supplier = material.supplier?.toLowerCase() || "";
    const status = material.status?.toLowerCase() || "";

    const projectName =
      typeof material.project?.projectId === "object"
        ? material.project.projectId?.projectName?.toLowerCase() || ""
        : "";

    const matchesSearch =
      materialName.includes(query) ||
      materialType.includes(query) ||
      supplier.includes(query) ||
      projectName.includes(query) ||
      status.includes(query);

    if (activeTab === "all") return matchesSearch;

    return (
      matchesSearch && material.status.toLowerCase() === activeTab.toLowerCase()
    );
  });

  const totalMaterialCost = materials.reduce(
    (sum, m) => sum + (m.totalCost || 0),
    0,
  );
  const pendingMaterialsCost = materials
    .filter((m) => m.status === "Pending" || m.status === "Ordered")
    .reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const deliveredMaterialsCount = materials.filter(
    (m) => m.status === "Delivered",
  ).length;

  const handleAddSubmit = (values: MaterialFormValues) => {
    createMutation.mutate(values);
  };

  const handleEditSubmit = (values: MaterialFormValues) => {
    if (selectedMaterial) {
      updateMutation.mutate({ id: selectedMaterial._id, values });
    }
  };

  const handleStatusSubmit = () => {
    if (!selectedMaterial) return;

    statusMutation.mutate({
      id: selectedMaterial._id,
      status: statusValue,
    });
  };

  const openEditDialog = (material: Material) => {
    setSelectedMaterial(material);

    editForm.reset({
      name: material.name,
      type: material.type,
      quantity: material.quantity,
      unit: material.unit,
      supplier: material.supplier,
      rate: material.rate,
      project:
        typeof material.project === "object"
          ? material.project._id
          : material.project,
      deliveryDate: new Date(material.deliveryDate).toISOString().split("T")[0],
      poNumber: material.poNumber,
      invoiceNumber: material.invoiceNumber || "",
      remarks: material.remarks || "",
    });

    setDialogType("edit");
  };

  const markAsDelivered = () => {
    if (selectedMaterial) {
      statusMutation.mutate({
        id: selectedMaterial._id,
        status: "Delivered",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{materials.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {deliveredMaterialsCount} delivered,{" "}
              {materials.length - deliveredMaterialsCount} pending/ordered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BadgeIndianRupee className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                ₹{totalMaterialCost.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {materials.length} materials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BadgeIndianRupee className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                ₹{pendingMaterialsCost.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalMaterialCost
                ? Math.round((pendingMaterialsCost / totalMaterialCost) * 100)
                : 0}
              % of total cost
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials, suppliers, projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {user?.role !== "admin" && userCanAddUser && (
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Material
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="In Transit">In Transit</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="ordered">Ordered</TabsTrigger>
          <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate (₹)</TableHead>
                <TableHead>Total (₹)</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No materials found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => {
                  const isBuildingDeleted =
                    material?.project?.projectId?.isDeleted === true;

                  const isFloorDeleted =
                    material?.project?.floorUnit?.isDeleted === true;

                  const isUnitDeleted =
                    material?.project?.unit?.isDeleted === true;

                  const isContractorDeleted =
                    material?.contractor?.isDeleted === true;

                  const isAnyDeleted =
                    isBuildingDeleted ||
                    isFloorDeleted ||
                    isUnitDeleted ||
                    isContractorDeleted;
                  return (
                    <TableRow
                      className={`transition-colors ${
                        isAnyDeleted ? "opacity-60" : "hover:bg-muted/30"
                      }`}
                      key={material._id}
                    >
                      <TableCell className="font-medium">
                        <span
                          className={
                            isAnyDeleted
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {material?.name || "N/A"}
                        </span>

                        {isBuildingDeleted && (
                          <Badge variant="destructive">
                            Building De-Activated
                          </Badge>
                        )}

                        {!isBuildingDeleted && isFloorDeleted && (
                          <Badge className="bg-orange-500 text-white">
                            Floor De-Activated
                          </Badge>
                        )}

                        {!isBuildingDeleted &&
                          !isFloorDeleted &&
                          isUnitDeleted && (
                            <Badge variant="secondary">Unit De-Activated</Badge>
                          )}

                        {!isBuildingDeleted &&
                          !isFloorDeleted &&
                          !isUnitDeleted &&
                          isContractorDeleted && (
                            <Badge variant="outline">Contractor Deleted</Badge>
                          )}
                      </TableCell>
                      <TableCell>{material.type}</TableCell>
                      <TableCell>
                        {material.quantity} {material.unit}
                      </TableCell>
                      <TableCell>₹{material.rate.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">
                        ₹{material.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className="max-w-[150px] truncate"
                        title={material.supplier}
                      >
                        {material.supplier}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {material.project?.projectId?.projectName ||
                          "Unnamed Project"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            material.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : material.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {material.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onSelect={() => openViewDialog(material)}
                            >
                              View
                            </DropdownMenuItem>

                            {!isAnyDeleted && (
                              <DropdownMenuItem
                                onSelect={() => openEditDialog(material)}
                              >
                                Edit
                              </DropdownMenuItem>
                            )}

                            {!isAnyDeleted && (
                              <DropdownMenuItem
                                onSelect={() => openStatusDialog(material)}
                              >
                                Update Status
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden p-4 space-y-4">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No materials found
            </div>
          ) : (
            filteredMaterials.map((material) => {
              const isBuildingDeleted =
                material?.project?.projectId?.isDeleted === true;

              const isFloorDeleted =
                material?.project?.floorUnit?.isDeleted === true;

              const isUnitDeleted = material?.project?.unit?.isDeleted === true;

              const isContractorDeleted =
                material?.contractor?.isDeleted === true;

              const isAnyDeleted =
                isBuildingDeleted ||
                isFloorDeleted ||
                isUnitDeleted ||
                isContractorDeleted;
              return (
                <div
                  key={material._id}
                  className={`border rounded-lg p-4 space-y-3 transition-all ${
                    isAnyDeleted ? "opacity-60 bg-muted/30 border-dashed" : ""
                  }`}
                >
                  <div className="font-semibold text-lg">{material.name}</div>
                  {isBuildingDeleted && (
                    <Badge variant="destructive">Building De-Activated</Badge>
                  )}

                  {!isBuildingDeleted && isFloorDeleted && (
                    <Badge className="bg-orange-500 text-white">
                      Floor De-Activated
                    </Badge>
                  )}

                  {!isBuildingDeleted && !isFloorDeleted && isUnitDeleted && (
                    <Badge variant="secondary">Unit De-Activated</Badge>
                  )}

                  {!isBuildingDeleted &&
                    !isFloorDeleted &&
                    !isUnitDeleted &&
                    isContractorDeleted && (
                      <Badge variant="outline">Contractor Deleted</Badge>
                    )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {material.type}
                    </div>
                    <div>
                      <span className="font-medium">Qty:</span>{" "}
                      {material.quantity} {material.unit}
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span> ₹
                      {material.rate}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> ₹
                      {material.totalCost}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Supplier:</span>{" "}
                    {material.supplier}
                  </div>
                  <div>
                    <Badge
                      className={
                        material.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : material.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                      }
                    >
                      {material.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(material)}
                    >
                      View
                    </Button>
                    {!isAnyDeleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(material)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog
        open={dialogType === "add"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="md:w-[600px] w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddSubmit)}
              className="space-y-6"
            >
              {/* Form fields same as before - kept for brevity but fully functional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialUnits.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
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
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" type="number" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingProjects}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingProjects
                                  ? "Loading..."
                                  : "Select project"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((p: any) => (
                            <SelectItem key={p._id} value={p._id}>
                              {p.projectId?.projectName} / Floor{" "}
                              {p.floorUnit?.floorNumber} / Plot {p.unit?.plotNo}
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
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border rounded-md p-4 bg-muted/50">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total Cost:</span>
                  <span>
                    ₹
                    {(
                      form.watch("quantity") * form.watch("rate") || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Material"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={dialogType === "edit"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="md:w-[600px] w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
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
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialUnits.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" type="number" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingProjects}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingProjects
                                  ? "Loading..."
                                  : "Select project"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((p: any) => (
                            <SelectItem key={p._id} value={p._id}>
                              {p.projectId?.projectName} / Floor{" "}
                              {p.floorUnit?.floorNumber} / Plot {p.unit?.plotNo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border rounded-md p-4 bg-muted/50">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total Cost:</span>
                  <span>
                    ₹
                    {(
                      Number(editForm.watch("quantity") || 0) *
                      Number(editForm.watch("rate") || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <FormField
                control={editForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Material"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedMaterial && (
        <Dialog
          open={dialogType === "view"}
          onOpenChange={(open) => !open && closeDialog()}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Material Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl">
                    {selectedMaterial?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMaterial?.type || "N/A"}
                  </p>
                </div>
                <Badge
                  className={
                    selectedMaterial?.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : selectedMaterial?.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                  }
                >
                  {selectedMaterial?.status || "N/A"}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity:</p>
                  <p>
                    {selectedMaterial?.quantity || "N/A"}{" "}
                    {selectedMaterial?.unit || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rate:</p>
                  <p className="flex items-center">
                    <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                    {selectedMaterial?.rate?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost:</p>
                  <p className="flex items-center font-bold">
                    <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                    {selectedMaterial?.totalCost?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier:</p>
                  <p>{selectedMaterial?.supplier || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project:</p>
                  <p>
                    {typeof selectedMaterial.project?.projectId === "object" &&
                      selectedMaterial.project?.projectId?.projectName +
                        "/" +
                        ((typeof selectedMaterial?.project?.floorUnit ===
                          "object" &&
                          selectedMaterial.project?.floorUnit?.floorNumber) ||
                          "N/A") +
                        "/" +
                        (typeof selectedMaterial.project?.unit === "object" &&
                          selectedMaterial.project?.unit?.plotNo)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivery Date:
                  </p>
                  <p>
                    {new Date(selectedMaterial.deliveryDate).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PO Number:</p>
                  <p>{selectedMaterial?.poNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Invoice Number:
                  </p>
                  <p>{selectedMaterial?.invoiceNumber || "-"}</p>
                </div>
              </div>

              {selectedMaterial?.remarks && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Remarks:</p>
                    <p className="mt-1">{selectedMaterial?.remarks || "N/A"}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={closeDialog}>
                  Close
                </Button>
                {selectedMaterial &&
                  selectedMaterial?.status !== "Delivered" && (
                    <Button onClick={markAsDelivered}>Mark as Delivered</Button>
                  )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={dialogType === "status"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Material Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>

              <Select value={statusValue} onValueChange={setStatusValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Ordered">Ordered</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>

              <Button
                onClick={handleStatusSubmit}
                disabled={
                  statusMutation.isPending ||
                  !selectedMaterial ||
                  statusValue === selectedMaterial.status
                }
              >
                {statusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorMaterials;
