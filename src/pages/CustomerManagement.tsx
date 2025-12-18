import CustomerDialog from "@/components/helpers/CustomerDialog";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Customer, useGetCustomers } from "@/utils/buildings/CustomerConfig";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PurchaseCrud from "@/components/customer/PurchaseCrud";
import CashExpenseDialog from "@/components/accountant/CashExpenseDialog";
import CashExpensesPage from "@/components/accountant/CashExpensesPage";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as XLSX from "xlsx";

const CustomerManagement = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [uploadPdfOpen, setUploadPdfOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("add");

  const isSalesManager =
    (user && user.role === "sales_manager") || user.role === "accountant";

  const {
    data: customersResponse,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    error: customersError,
  } = useGetCustomers(user);

  const customers = customersResponse?.data ?? [];

  const filteredCustomers = useMemo(() => {
    // Always return array
    if (!Array.isArray(customers) || customers.length === 0) {
      return [];
    }

    const query = (search ?? "").trim().toLowerCase();

    // If no search, return original list
    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      if (!customer || typeof customer !== "object") return false;

      const customerName =
        typeof customer.customerId === "object"
          ? String(customer.customerId?.name ?? "").toLowerCase()
          : "";

      const customerEmail =
        typeof customer.customerId === "object"
          ? String(customer.customerId?.email ?? "").toLowerCase()
          : "";

      const agentName =
        typeof customer.purchasedFrom === "object"
          ? String(customer.purchasedFrom?.name ?? "").toLowerCase()
          : "";

      const projectName =
        typeof customer.property === "object"
          ? String(customer.property?.projectName ?? "").toLowerCase()
          : "";

      const unitNo =
        typeof customer.unit === "object"
          ? String(customer.unit?.plotNo ?? "").toLowerCase()
          : "";

      return (
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        agentName.includes(query) ||
        projectName.includes(query) ||
        unitNo.includes(query)
      );
    });
  }, [customers, search]);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/api/customer/deleteCustomer/${id}`,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Customer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete customer");
    },
  });

  const uploadPdfMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer?._id || !pdfFile) {
        throw new Error("Missing customer or PDF");
      }

      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const { data } = await axios.put(
        `${import.meta.env.VITE_URL}/api/customer/customers/${
          selectedCustomer._id
        }/upload-pdf`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "PDF uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setUploadPdfOpen(false);
      setPdfFile(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "PDF upload failed");
    },
  });

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const renderStatusBadge = (status: Customer["status"]) => {
    const map: Record<Customer["status"], string> = {
      Active: "bg-blue-100 text-blue-800",
      Completed: "bg-emerald-100 text-emerald-800",
      Delayed: "bg-amber-100 text-amber-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={map[status] || ""} variant="outline">
        {status}
      </Badge>
    );
  };

  const renderPaymentStatusBadge = (
    paymentStatus: Customer["paymentStatus"]
  ) => {
    if (!paymentStatus) return null;
    const map: Record<NonNullable<Customer["paymentStatus"]>, string> = {
      Pending: "bg-amber-100 text-amber-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-emerald-100 text-emerald-800",
    };
    return (
      <Badge className={map[paymentStatus] || ""} variant="outline">
        {paymentStatus}
      </Badge>
    );
  };

  const handleExportCustomersExcel = () => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      toast.error("No customers to export");
      return;
    }

    const exportData = filteredCustomers.map((c, index) => {
      const customer = typeof c.customerId === "object" && c.customerId;
      const agent = typeof c.purchasedFrom === "object" && c.purchasedFrom;
      const siteIncharge =
        typeof c.siteInchargeId === "object" && c.siteInchargeId;
      const contractor = typeof c.contractorId === "object" && c.contractorId;
      const property = typeof c.property === "object" && c.property;
      const unit = typeof c.unit === "object" && c.unit;
      const floorUnit = typeof c.floorUnit === "object" && c.floorUnit;

      return {
        "S No": index + 1,

        /* CUSTOMER */
        "Customer Name": customer?.name ?? "N/A",
        "Customer Email": customer?.email ?? "N/A",
        "Customer Phone": customer?.phone ?? "N/A",

        /* AGENT */
        "Agent Name": agent?.name ?? "N/A",
        "Agent Email": agent?.email ?? "N/A",
        "Agent Phone": agent?.phone ?? "N/A",

        /* PROPERTY */
        "Project Name": property?.projectName ?? "N/A",
        Location: property?.location ?? "N/A",
        "Unit No": unit?.plotNo ?? "N/A",
        "Floor No": floorUnit?.floorNumber ?? "N/A",

        /* FINANCIAL */
        "Total Amount": c.totalAmount ?? 0,
        "Advance Received": c.advanceReceived ?? 0,
        "Balance Payment": c.balancePayment ?? 0,
        "Final Price": c.finalPrice ?? 0,

        /* REGISTRATION & PAYMENT */
        "Registration Status": c.registrationStatus ?? "N/A",
        "Payment Status": c.paymentStatus ?? "N/A",
        "Payment Plan": c.paymentPlan ?? "N/A",
        "Booking Date": c.bookingDate?.split("T")[0] ?? "N/A",
        "Last Payment Date": c.lastPaymentDate?.split("T")[0] ?? "N/A",

        /* CONSTRUCTION */
        "Construction Stage": c.constructionStage ?? "N/A",
        "Expected Delivery Date":
          c.expectedDeliveryDate?.split("T")[0] ?? "N/A",
        "Delivery Date": c.deliveryDate?.split("T")[0] ?? "N/A",

        /* SITE INCHARGE */
        "Site Incharge Name": siteIncharge?.name ?? "N/A",
        "Site Incharge Phone": siteIncharge?.phone ?? "N/A",
        "Site Incharge Email": siteIncharge?.email ?? "N/A",

        /* CONTRACTOR */
        "Contractor Name": contractor?.name ?? "N/A",
        "Contractor Phone": contractor?.phone ?? "N/A",
        "Contractor Email": contractor?.email ?? "N/A",

        /* REFERRAL */
        "Referral Name": c.referralName ?? "N/A",
        "Referral Contact": c.referralContact ?? "N/A",

        /* NOTES */
        Notes: c.notes ?? "N/A",

        /* PAYMENT DETAILS (flattened) */
        "Payment Records":
          c.paymentDetails?.length > 0
            ? c.paymentDetails
                .map(
                  (p: any) =>
                    `₹${p.amount} | ${p.paymentMode} | ${
                      p.date?.split("T")[0]
                    } | ${p.referenceNumber ?? "-"}`
                )
                .join(" || ")
            : "N/A",

        /* DOCUMENTS */
        Images: c.images?.length ? c.images.join(", ") : "N/A",
        "PDF Document": c.pdfDocument ?? "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Details");
    XLSX.writeFile(workbook, "customer-details.xlsx");
  };

  return (
    <MainLayout>
      <div className="space-y-6 md:p-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your customer base and their property purchase details.
            </p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="md:hidden">
            <Select value={selectedTab} onValueChange={setSelectedTab}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tab"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Customer</SelectItem>
                <SelectItem value="purchase">Add Purchase Sheet</SelectItem>
                <SelectItem value="cash">Add Cash Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsList className="hidden md:inline-block">
            <TabsTrigger value="add">Add Customer</TabsTrigger>
            <TabsTrigger value="purchase">Add Purchase Sheet</TabsTrigger>
            <TabsTrigger value="cash">Add Cash Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <>
              {isSalesManager && (
                <div className="flex md:justify-end justify-normal w-full mb-5 md:gap-5 gap-2 md:flex-row flex-col">
                  <Button
                    variant="outline"
                    onClick={handleExportCustomersExcel}
                    disabled={filteredCustomers.length === 0}
                  >
                    Export to Excel
                  </Button>

                  <div className="md:mb-4">
                    <Input
                      placeholder="Search by customer, agent, project, unit..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="md:max-w-sm"
                    />
                  </div>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="mt-2 md:mt-0 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Customer
                  </Button>
                </div>
              )}
              <div className="rounded-lg border border-gray-200 shadow-sm p-4 bg-white">
                {isLoadingCustomers ? (
                  <div className="flex justify-center items-center gap-2 text-gray-600 py-8">
                    <Loader2 className="animate-spin" />
                    <span>Loading customers...</span>
                  </div>
                ) : isErrorCustomers ? (
                  <div className="text-red-500 text-sm py-4">
                    {(customersError as Error)?.message ||
                      "Something went wrong while fetching customers."}
                  </div>
                ) : customers.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">
                    No customers found.
                  </p>
                ) : (
                  <>
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Advance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCustomers.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={9}
                                className="h-32 text-center"
                              >
                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                  <span className="text-sm font-medium">
                                    No Customer records found
                                  </span>
                                  <span className="text-xs">
                                    Start by adding a new customer using the
                                    button above
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredCustomers.map((customer) => (
                              <TableRow key={customer._id}>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {(typeof customer.customerId ===
                                        "object" &&
                                        customer.customerId?.name) ||
                                        "N/A"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {typeof customer.customerId ===
                                        "object" && customer.customerId?.email}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {(typeof customer.purchasedFrom ===
                                        "object" &&
                                        customer.purchasedFrom?.name) ||
                                        "N/A"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {typeof customer.purchasedFrom ===
                                        "object" &&
                                        customer.purchasedFrom?.email}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {(typeof customer.property === "object" &&
                                        customer.property?.projectName) ||
                                        "N/A"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {typeof customer.property === "object" &&
                                        customer.property?.location}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {(typeof customer.unit === "object" &&
                                        customer.unit?.plotNo) ||
                                        "N/A"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {typeof customer.floorUnit === "object" &&
                                      customer.floorUnit?.floorNumber
                                        ? `Floor ${
                                            typeof customer.floorUnit ===
                                              "object" &&
                                            customer.floorUnit.floorNumber
                                          }`
                                        : ""}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  ₹
                                  {customer.totalAmount?.toLocaleString(
                                    "en-IN"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {customer.advanceReceived != null
                                    ? `₹${customer.advanceReceived.toLocaleString(
                                        "en-IN"
                                      )}`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {renderStatusBadge(customer.status)}
                                </TableCell>
                                <TableCell>
                                  {renderPaymentStatusBadge(
                                    customer.paymentStatus
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleView(customer)}
                                      >
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleEdit(customer)}
                                      >
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedCustomer(customer);
                                          setUploadPdfOpen(true);
                                        }}
                                      >
                                        Upload PDF
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                          handleDeleteClick(customer)
                                        }
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
                  </>
                )}
              </div>
            </>
          </TabsContent>
          <TabsContent value="purchase">
            <PurchaseCrud />
          </TabsContent>
          <TabsContent value="cash">
            <CashExpensesPage />
          </TabsContent>
        </Tabs>

        <CustomerDialog
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          mode="add"
        />
        <CustomerDialog
          onOpenChange={setEditOpen}
          open={editOpen}
          mode="edit"
          initialData={editingCustomer}
        />

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="md:max-w-screen-lg max-w-[80%] rounded-md">
            <DialogHeader>
              <DialogTitle>
                {(typeof selectedCustomer?.customerId === "object" &&
                  selectedCustomer?.customerId?.name) ||
                  "Customer Details"}
              </DialogTitle>
              <DialogDescription>
                Detailed information about this customer purchase.
              </DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6 text-sm max-h-[80vh] overflow-y-auto max-w-[80vw]">
                {/* CUSTOMER & AGENT */}
                <div className="space-y-3">
                  <SectionTitle title="Customer & Agent" />

                  <InfoItem
                    label="Customer"
                    value={
                      typeof selectedCustomer.customerId === "object"
                        ? `${selectedCustomer.customerId.name} (${selectedCustomer.customerId.email})`
                        : "N/A"
                    }
                  />

                  <InfoItem
                    label="Agent"
                    value={
                      typeof selectedCustomer.purchasedFrom === "object"
                        ? `${selectedCustomer.purchasedFrom.name} (${selectedCustomer.purchasedFrom.email})`
                        : "N/A"
                    }
                  />
                </div>

                {/* PROPERTY DETAILS */}
                <div className="space-y-3">
                  <SectionTitle title="Property Details" />

                  <InfoItem
                    label="Project"
                    value={
                      typeof selectedCustomer.property === "object"
                        ? selectedCustomer.property.projectName
                        : "N/A"
                    }
                    subValue={
                      typeof selectedCustomer.property === "object"
                        ? selectedCustomer.property.location
                        : ""
                    }
                  />

                  <InfoItem
                    label="Unit"
                    value={
                      typeof selectedCustomer.unit === "object"
                        ? selectedCustomer.unit.plotNo
                        : "N/A"
                    }
                    subValue={
                      typeof selectedCustomer.floorUnit === "object"
                        ? `Floor ${selectedCustomer.floorUnit.floorNumber}`
                        : ""
                    }
                  />
                </div>

                {/* FINANCIAL INFO */}
                <div className="space-y-3">
                  <SectionTitle title="Financial Details" />

                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Total Amount"
                      value={`₹${selectedCustomer.totalAmount.toLocaleString(
                        "en-IN"
                      )}`}
                    />

                    <InfoItem
                      label="Advance Received"
                      value={
                        selectedCustomer.advanceReceived != null
                          ? `₹${selectedCustomer.advanceReceived.toLocaleString(
                              "en-IN"
                            )}`
                          : "-"
                      }
                    />

                    <InfoItem
                      label="Balance Payment"
                      value={`₹${selectedCustomer.balancePayment?.toLocaleString(
                        "en-IN"
                      )}`}
                    />

                    <InfoItem
                      label="Final Price"
                      value={
                        selectedCustomer.finalPrice != null
                          ? `₹${selectedCustomer.finalPrice.toLocaleString(
                              "en-IN"
                            )}`
                          : "-"
                      }
                    />
                  </div>
                </div>

                {/* REGISTRATION & PAYMENTS */}
                <div className="space-y-3">
                  <SectionTitle title="Registration & Payments" />

                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Registration Status"
                      value={selectedCustomer.registrationStatus}
                    />
                    <InfoItem
                      label="Payment Status"
                      value={selectedCustomer.paymentStatus || "N/A"}
                    />
                    <InfoItem
                      label="Payment Plan"
                      value={selectedCustomer.paymentPlan || "N/A"}
                    />
                    <InfoItem
                      label="Booking Date"
                      value={
                        selectedCustomer.bookingDate?.split("T")[0] || "N/A"
                      }
                    />
                    <InfoItem
                      label="Last Payment Date"
                      value={
                        selectedCustomer.lastPaymentDate?.split("T")[0] || "N/A"
                      }
                    />
                  </div>
                </div>

                {/* CONSTRUCTION DETAILS */}
                <div className="space-y-3">
                  <SectionTitle title="Construction Details" />

                  {/* Construction Stage */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Site Incharge */}
                    <InfoItem
                      label="Site Incharge"
                      value={
                        typeof selectedCustomer.siteInchargeId === "object"
                          ? `${selectedCustomer.siteInchargeId.name} (${selectedCustomer.siteInchargeId.phone})`
                          : "N/A"
                      }
                      subValue={
                        typeof selectedCustomer.siteInchargeId === "object"
                          ? selectedCustomer.siteInchargeId.email
                          : ""
                      }
                    />

                    {/* Contractor */}
                    <InfoItem
                      label="Contractor"
                      value={
                        typeof selectedCustomer.contractorId === "object"
                          ? `${selectedCustomer.contractorId.name} (${selectedCustomer.contractorId.phone})`
                          : "N/A"
                      }
                      subValue={
                        typeof selectedCustomer.contractorId === "object"
                          ? selectedCustomer.contractorId.email
                          : ""
                      }
                    />
                  </div>

                  {/* Delivery Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Expected Delivery Date"
                      value={
                        selectedCustomer.expectedDeliveryDate?.split("T")[0] ||
                        "N/A"
                      }
                    />
                    <InfoItem
                      label="Delivery Date"
                      value={
                        selectedCustomer.deliveryDate?.split("T")[0] || "N/A"
                      }
                    />
                    <InfoItem
                      label="Construction Stage"
                      value={selectedCustomer.constructionStage || "N/A"}
                    />
                  </div>
                </div>

                {/* REFERRAL DETAILS */}
                {(selectedCustomer.referralName ||
                  selectedCustomer.referralContact) && (
                  <div className="space-y-3">
                    <SectionTitle title="Referral Details" />
                    <InfoItem
                      label="Referral Name"
                      value={selectedCustomer.referralName || "N/A"}
                    />
                    <InfoItem
                      label="Referral Contact"
                      value={selectedCustomer.referralContact || "N/A"}
                    />
                  </div>
                )}

                {/* NOTES */}
                {selectedCustomer.notes && (
                  <div className="space-y-3">
                    <SectionTitle title="Notes" />
                    <p className="text-sm">{selectedCustomer.notes}</p>
                  </div>
                )}

                {/* DOCUMENTS */}
                <div className="space-y-3">
                  <SectionTitle title="Documents" />

                  {selectedCustomer.images?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedCustomer.images.map((doc, idx) => {
                        const clean = doc.split("?")[0];
                        const name = clean.split("/").pop() || "Document";
                        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                          clean
                        );

                        return (
                          <div
                            key={idx}
                            className="border rounded-lg bg-white shadow-sm relative overflow-hidden"
                          >
                            {isImage ? (
                              <img
                                src={doc}
                                alt={name}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="w-full h-32 flex items-center justify-center bg-gray-100 p-2">
                                <span className="text-xs text-gray-600 text-center break-all">
                                  {name}
                                </span>
                              </div>
                            )}
                            <span className="absolute bottom-1 left-1 bg-black text-white text-xs px-2 py-1 rounded">
                              Doc
                            </span>
                          </div>
                        );
                      })}

                      {selectedCustomer.pdfDocument ? (
                        <div className="space-y-2">
                          <SectionTitle title="PDF Document" />

                          <a
                            href={selectedCustomer.pdfDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            View Uploaded PDF
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No PDF uploaded.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No documents uploaded.
                    </p>
                  )}
                </div>

                {/* PAYMENT DETAILS */}
                {selectedCustomer.paymentDetails?.length ? (
                  <div className="space-y-3">
                    <SectionTitle title="Payment Details" />

                    <div className="space-y-2">
                      {selectedCustomer.paymentDetails.map((p, i) => (
                        <div
                          key={i}
                          className="p-3 border rounded-lg bg-gray-50 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs"
                        >
                          <InfoItem label="Amount" value={`₹${p.amount}`} />
                          <InfoItem
                            label="Date"
                            value={p.date?.split("T")[0] || "N/A"}
                          />
                          <InfoItem
                            label="Mode"
                            value={p.paymentMode || "N/A"}
                          />
                          <InfoItem
                            label="Ref No"
                            value={p.referenceNumber || "N/A"}
                          />
                          <InfoItem
                            label="Remarks"
                            value={p.remarks || "N/A"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No payments recorded.</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={uploadPdfOpen} onOpenChange={setUploadPdfOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload PDF</DialogTitle>
              <DialogDescription>
                Upload a PDF document for{" "}
                <span className="font-medium">
                  {typeof selectedCustomer?.customerId === "object"
                    ? selectedCustomer.customerId.name
                    : "this customer"}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.type !== "application/pdf") {
                    toast.error("Only PDF files are allowed");
                    return;
                  }

                  setPdfFile(file);
                }}
              />

              {pdfFile && (
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{pdfFile.name}</span>
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadPdfOpen(false);
                  setPdfFile(null);
                }}
                disabled={uploadPdfMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                onClick={() => uploadPdfMutation.mutate()}
                disabled={!pdfFile || uploadPdfMutation.isPending}
              >
                {uploadPdfMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Upload PDF"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete customer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this customer record? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setCustomerToDelete(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (customerToDelete?._id) {
                    deleteMutation.mutate(customerToDelete._id);
                  }
                }}
              >
                {deleteMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default CustomerManagement;

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-base font-semibold text-gray-700 border-b pb-1">
    {title}
  </h3>
);

const InfoItem = ({
  label,
  value,
  subValue,
}: {
  label: string;
  value: any;
  subValue?: string;
}) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
    {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
  </div>
);
