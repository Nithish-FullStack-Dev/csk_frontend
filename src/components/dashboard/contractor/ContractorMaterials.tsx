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

// Material interface
interface Material {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  supplier: string;
  rate: number;
  totalCost: number;
  deliveryDate: string;
  project: string;
  status: string;
  poNumber: string;
  invoiceNumber: string;
  remarks?: string;
}

// Sample materials data
const initialMaterials: Material[] = [
  {
    id: "1",
    name: "Cement OPC 43 Grade",
    type: "Cement",
    quantity: 500,
    unit: "Bags",
    supplier: "Dalmia Cement",
    rate: 420,
    totalCost: 210000,
    deliveryDate: "2023-06-15",
    project: "Skyline Towers Construction",
    status: "Delivered",
    poNumber: "PO-2023-001",
    invoiceNumber: "INV-DAL-789",
  },
  {
    id: "2",
    name: "TMT Steel Bars 16mm",
    type: "Steel",
    quantity: 2500,
    unit: "Kg",
    supplier: "JSW Steel",
    rate: 75,
    totalCost: 187500,
    deliveryDate: "2023-06-18",
    project: "Skyline Towers Construction",
    status: "Delivered",
    poNumber: "PO-2023-002",
    invoiceNumber: "INV-JSW-456",
  },
  {
    id: "3",
    name: "Sand Fine",
    type: "Sand",
    quantity: 40,
    unit: "Cubic Meters",
    supplier: "Krishna Suppliers",
    rate: 3800,
    totalCost: 152000,
    deliveryDate: "2023-06-20",
    project: "Green Valley Villas Phase 1",
    status: "Delivered",
    poNumber: "PO-2023-003",
    invoiceNumber: "INV-KS-321",
  },
  {
    id: "4",
    name: "Bricks Red Clay",
    type: "Bricks",
    quantity: 15000,
    unit: "Pieces",
    supplier: "Lakshmi Brick Industry",
    rate: 8,
    totalCost: 120000,
    deliveryDate: "2023-06-25",
    project: "Green Valley Villas Phase 1",
    status: "Pending",
    poNumber: "PO-2023-004",
    invoiceNumber: "",
  },
  {
    id: "5",
    name: "Electrical Wiring Bundle",
    type: "Electrical",
    quantity: 15,
    unit: "Rolls",
    supplier: "Havells",
    rate: 8500,
    totalCost: 127500,
    deliveryDate: "2023-07-05",
    project: "Skyline Towers Construction",
    status: "Ordered",
    poNumber: "PO-2023-005",
    invoiceNumber: "",
  },
];

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
  //const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewMaterialDialogOpen, setViewMaterialDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [projects, setProjects] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      type: "Cement",
      unit: "Bags",
      project: "Skyline Towers Construction",
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

  const handleSubmit = async (data: any) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/materials`,
        data,
        { withCredentials: true }
      );
      toast.success("Material added successfully");

      // Optionally refresh your material list
      setAddDialogOpen(false);
      fetchMaterials();
    } catch (error: any) {
      console.error("Failed to add material", error);
      toast.error(error?.response?.data?.message || "Failed to add material");
    }
  };

  const viewMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setViewMaterialDialogOpen(true);
  };

  const fetchDropdownData = async () => {
    try {
      const projectsRes = await axios.get(
        `${import.meta.env.VITE_URL}/api/project/projects`,
        { withCredentials: true }
      );

      setProjects(projectsRes.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/materials`, {
        withCredentials: true,
      }); // or your full backend URL
      setMaterials(res.data);
      setFilteredMaterials(res.data); // apply filters later if needed
    } catch (error) {
      console.error("Failed to fetch materials", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchDropdownData();
  }, []);

  const markAsDelivered = async () => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_URL}/api/materials/${
          selectedMaterial._id
        }/status`,
        {
          status: "Delivered",
        }
      );

      // Update state locally
      const updatedMaterials = materials.map((material) =>
        material.id === selectedMaterial.id
          ? { ...material, status: "Delivered" }
          : material
      );
      setMaterials(updatedMaterials);
      setSelectedMaterial({ ...selectedMaterial, status: "Delivered" });
      fetchMaterials();
      toast.success("Material marked as delivered");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to mark as delivered");
    }
  };

  // Filter materials based on search and active tab
  const filteredMaterials2 = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.project.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "delivered")
      return matchesSearch && material.status === "Delivered";
    if (activeTab === "pending")
      return matchesSearch && material.status === "Pending";
    if (activeTab === "ordered")
      return matchesSearch && material.status === "Ordered";

    return matchesSearch;
  });

  // Calculate statistics
  const totalMaterialCost = materials.reduce(
    (total, material) => total + material.totalCost,
    0
  );
  const pendingMaterialsCost = materials
    .filter(
      (material) =>
        material.status === "Pending" || material.status === "Ordered"
    )
    .reduce((total, material) => total + material.totalCost, 0);
  const deliveredMaterialsCount = materials.filter(
    (material) => material.status === "Delivered"
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
                0}
              % of total cost
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Materials Table */}
      <div className="border rounded-md overflow-x-auto">
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
                  <TableCell className="font-medium">{material.name}</TableCell>
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
                    className="max-w-[150px] truncate"
                    title={material.project}
                  >
                    {material.project.projectId.basicInfo.projectName}
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

      {/* Add Material Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                        <Input type="number" placeholder="100" {...field} />
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.projectTitle}
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
                <Button type="submit">Add Material</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Material Dialog */}
      {selectedMaterial && (
        <Dialog
          open={viewMaterialDialogOpen}
          onOpenChange={setViewMaterialDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px]">
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
                    {selectedMaterial.project.projectId.basicInfo.projectName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivery Date:
                  </p>
                  <p>
                    {new Date(selectedMaterial.deliveryDate).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" }
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
                  <Button
                    onClick={() => {
                      // Mark material as delivered
                      const updatedMaterials = materials.map((material) =>
                        material.id === selectedMaterial.id
                          ? { ...material, status: "Delivered" }
                          : material
                      );
                      setMaterials(updatedMaterials);
                      setSelectedMaterial({
                        ...selectedMaterial,
                        status: "Delivered",
                      });
                      toast.success("Material marked as delivered");
                      markAsDelivered();
                    }}
                  >
                    Mark as Delivered
                  </Button>
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
