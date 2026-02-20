import { useState, useEffect } from "react";
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
  FormDescription,
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Project,
  usefetchProjectsForDropdown,
} from "@/utils/project/ProjectConfig";
import { Building } from "@/types/building";

// Material interface
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
  project: Project;
  status: string;
  poNumber: string;
  invoiceNumber: string;
  remarks?: string;
}

// Form schema
const materialSchema = z.object({
  name: z.string().min(2, "Material name is required"),
  type: z.string().min(1, "Material type is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  supplier: z.string().min(2, "Supplier name is required"),
  rate: z.coerce.number().positive("Rate must be positive"),
  project: z.string().min(2, "Project is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  poNumber: z.string().min(1, "PO number is required"),
  invoiceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

const ContractorMaterials = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewMaterialDialogOpen, setViewMaterialDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  // const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      type: "Cement",
      unit: "Bags",
      project: "", // This should be an empty string, not a hardcoded name
      deliveryDate: new Date().toISOString().split("T")[0],
    },
  });

  // Material types
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

  // Material units
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

  const handleSubmit = async (values: MaterialFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        quantity: Number(values.quantity),
        rate: Number(values.rate),
        deliveryDate: new Date(values.deliveryDate),
        project: values.project, // ObjectId string OK
        status: "Ordered",
      };

      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/materials`,
        payload,
        { withCredentials: true },
      );

      toast.success("Material added successfully");
      setAddDialogOpen(false);
      fetchMaterials();
    } catch (error: any) {
      if (error?.response?.data?.field === "poNumber") {
        form.setError("poNumber", {
          message: error.response.data.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const viewMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setViewMaterialDialogOpen(true);
  };

  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    error: fetchProjectsError,
  } = usefetchProjectsForDropdown();

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/materials`, {
        withCredentials: true,
      });
      // Assuming your backend returns an array of materials with a 'status' field.
      // And the project is a nested object.
      setMaterials(res.data);
    } catch (error) {
      console.error("Failed to fetch materials", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Use a new useEffect to apply filters whenever 'materials', 'activeTab', or 'searchQuery' changes
  useEffect(() => {
    const applyFilters = () => {
      let tempMaterials = [...materials];

      // Filter by search query
      tempMaterials = tempMaterials.filter((material) => {
        const materialName = material.name?.toLowerCase() || "";
        const materialType = material.type?.toLowerCase() || "";
        const supplier = material.supplier?.toLowerCase() || "";
        const projectName =
          (typeof material.project?.projectId === "object" &&
            material.project?.projectId?.projectName?.toLowerCase()) ||
          "";
        const query = searchQuery.toLowerCase();

        return (
          materialName.includes(query) ||
          materialType.includes(query) ||
          supplier.includes(query) ||
          projectName.includes(query)
        );
      });

      // Filter by active tab
      if (activeTab === "delivered") {
        tempMaterials = tempMaterials.filter(
          (material) => material.status === "Delivered",
        );
      } else if (activeTab === "pending") {
        tempMaterials = tempMaterials.filter(
          (material) => material.status === "Pending",
        );
      } else if (activeTab === "ordered") {
        tempMaterials = tempMaterials.filter(
          (material) => material.status === "Ordered",
        );
      }

      setFilteredMaterials(tempMaterials);
    };

    applyFilters();
  }, [materials, activeTab, searchQuery]);

  if (isErrorProjects) {
    toast.error(fetchProjectsError.message || "Error fetching projects");
    console.error("Error fetching projects:", fetchProjectsError);
    return null;
  }

  const markAsDelivered = async () => {
    try {
      if (!selectedMaterial) return;
      await axios.patch(
        `${import.meta.env.VITE_URL}/api/materials/${
          selectedMaterial._id
        }/status`,
        {
          status: "Delivered",
        },
      );

      toast.success("Material marked as delivered");
      setViewMaterialDialogOpen(false);
      fetchMaterials(); // Re-fetch to get the latest data
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to mark as delivered");
    }
  };

  // Calculate statistics
  const totalMaterialCost = materials.reduce(
    (total, material) => total + material.totalCost,
    0,
  );
  const pendingMaterialsCost = materials
    .filter(
      (material) =>
        material.status === "Pending" || material.status === "Ordered",
    )
    .reduce((total, material) => total + material.totalCost, 0);
  const deliveredMaterialsCount = materials.filter(
    (material) => material.status === "Delivered",
  ).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
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
              {Math.round((pendingMaterialsCost / totalMaterialCost) * 100) ||
                0}{" "}
              % of total cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- */}

      {/* Search and Actions */}
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
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      {/* --- */}

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center">
            <Package className="mr-2 h-4 w-4" /> Delivered
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center">
            <CalendarClock className="mr-2 h-4 w-4" /> Pending
          </TabsTrigger>
          <TabsTrigger value="ordered" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Ordered
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* --- */}

      {/* Materials Table */}
      <div className="border rounded-md">
        {/* Desktop Table */}
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
                    No materials found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => (
                  <TableRow key={material._id}>
                    <TableCell className="font-medium">
                      {material.name}
                    </TableCell>
                    <TableCell>{material.type}</TableCell>
                    <TableCell>
                      {material.quantity} {material.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                        {material.rate.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                        {material.totalCost.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-[150px] truncate"
                      title={material.supplier}
                    >
                      {material.supplier}
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={
                        typeof material.project?.projectId === "object" &&
                        material.project?.projectId !== null
                          ? `${
                              material.project?.projectId?.projectName ||
                              "Unnamed Project"
                            } / Floor ${
                              (typeof material.project?.floorUnit ===
                                "object" &&
                                material.project?.floorUnit?.floorNumber) ||
                              "N/A"
                            } / Plot ${
                              (typeof material.project?.unit === "object" &&
                                material.project?.unit?.plotNo) ||
                              "N/A"
                            }`
                          : "Unnamed Project"
                      }
                    >
                      {material.project?.projectId
                        ? `${
                            typeof material.project?.projectId === "object" &&
                            material.project?.projectId?.projectName
                          } / Floor ${
                            (typeof material.project?.floorUnit === "object" &&
                              material.project?.floorUnit?.floorNumber) ||
                            "N/A"
                          } / Plot ${
                            (typeof material.project?.unit === "object" &&
                              material.project?.unit?.plotNo) ||
                            "N/A"
                          }`
                        : "Unnamed Project"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`${
                          material.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : material.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {material.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewMaterial(material)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- */}

        {/* Mobile Cards */}
        <div className="block md:hidden p-2 space-y-4">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500">
              No materials found.
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div
                key={material._id}
                className="border rounded-lg p-4 shadow-sm bg-white space-y-3"
              >
                <div className="font-semibold text-lg">{material.name}</div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {material.type}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Quantity:</span>{" "}
                  {material.quantity} {material.unit}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium mr-1">Rate:</span>
                  <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                  {material.rate.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium mr-1">Total:</span>
                  <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                  {material.totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  <span className="font-medium">Supplier:</span>{" "}
                  {material.supplier}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  <span className="font-medium">Project:</span>{" "}
                  {typeof material.project?.projectId === "object" &&
                    material.project?.projectId?.projectName}
                </div>
                <div>
                  <Badge
                    className={`${
                      material.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : material.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {material.status}
                  </Badge>
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewMaterial(material)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- */}

      {/* Add Material Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-y-scroll rounded-xl">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter material name" {...field} />
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
                      <FormLabel>Material Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                        <Input
                          type="number"
                          placeholder="100"
                          min={0}
                          {...field}
                        />
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
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
                        <Input placeholder="Enter supplier name" {...field} />
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
                          <Input
                            className="pl-10"
                            type="number"
                            placeholder="100"
                            min={0}
                            {...field}
                          />
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
                        defaultValue={field.value}
                        disabled={isLoadingProjects}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingProjects
                                  ? "Loading projects..."
                                  : "Select project"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => {
                            const projectName =
                              typeof project.projectId === "object" &&
                              project.projectId !== null
                                ? project.projectId.projectName
                                : "Unnamed Project";

                            const floorNumber =
                              typeof project.floorUnit === "object" &&
                              project.floorUnit !== null
                                ? project.floorUnit.floorNumber
                                : "No Floor";

                            const plotNo =
                              typeof project.unit === "object" &&
                              project.unit !== null
                                ? project.unit.plotNo
                                : "No Plot";

                            return (
                              <SelectItem key={project._id} value={project._id}>
                                {`${projectName} / Floor ${floorNumber} / Plot ${plotNo}`}
                              </SelectItem>
                            );
                          })}
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
                      <FormLabel>Expected Delivery Date</FormLabel>
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
                        <Input placeholder="PO-2023-001" {...field} />
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
                      <FormLabel>Invoice Number (if available)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="INV-2023-001"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Total Cost Calculation */}
              <div className="border rounded-md p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <span className="text-xl font-bold flex items-center">
                    <BadgeIndianRupee className="h-5 w-5 mr-1" />
                    {form.watch("quantity") && form.watch("rate")
                      ? (
                          form.watch("quantity") * form.watch("rate")
                        ).toLocaleString()
                      : "0"}
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
                      <Textarea
                        placeholder="Any additional notes about the material"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
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
                  onClick={() => setAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Add Material
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* --- */}

      {/* View Material Dialog */}
      {selectedMaterial && (
        <Dialog
          open={viewMaterialDialogOpen}
          onOpenChange={setViewMaterialDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
            <DialogHeader>
              <DialogTitle>Material Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl">{selectedMaterial.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMaterial.type}
                  </p>
                </div>
                <Badge
                  className={`${
                    selectedMaterial.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : selectedMaterial.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedMaterial.status}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity:</p>
                  <p>
                    {selectedMaterial.quantity} {selectedMaterial.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rate:</p>
                  <p className="flex items-center">
                    <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                    {selectedMaterial.rate.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost:</p>
                  <p className="flex items-center font-bold">
                    <BadgeIndianRupee className="h-3.5 w-3.5 mr-1" />
                    {selectedMaterial.totalCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier:</p>
                  <p>{selectedMaterial.supplier}</p>
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
                  <p>{selectedMaterial.poNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Invoice Number:
                  </p>
                  <p>{selectedMaterial.invoiceNumber || "-"}</p>
                </div>
              </div>

              {selectedMaterial.remarks && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Remarks:</p>
                    <p className="mt-1">{selectedMaterial.remarks}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewMaterialDialogOpen(false)}
                >
                  Close
                </Button>
                {selectedMaterial.status !== "Delivered" && (
                  <Button onClick={markAsDelivered}>Mark as Delivered</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContractorMaterials;
