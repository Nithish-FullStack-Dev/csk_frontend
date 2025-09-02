import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, subMonths } from "date-fns";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import {
  IndianRupee,
  TrendingUp,
  Download,
  ArrowUpRight,
  FileText,
  Info,
  PlusCircle,
  Edit,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { User } from "@/contexts/AuthContext";
import { Property } from "../public/PropertyInterfaces";
import { Lead } from "./LeadManagement";
import { Calendar } from "@/components/ui/calendar";

interface PopulatedLead extends Omit<Lead, "property" | "addedBy"> {
  property: Property;
  addedBy: User;
}

interface Commission {
  _id: string;
  clientId: PopulatedLead;
  commissionAmount: string;
  commissionPercent: string;
  saleDate: Date;
  paymentDate?: Date;
  status: "pending" | "paid";
}

interface CommissionEligibleLead extends Lead {
  property: Property;
}

const fetchAllCommission = async (): Promise<Commission[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/commission/getAllCommissions`,
    { withCredentials: true }
  );
  return Array.isArray(data) ? data : [];
};

const fetchCommissionEligibleLeads = async (): Promise<
  CommissionEligibleLead[]
> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getClosedLeads`,
    { withCredentials: true }
  );
  return Array.isArray(data)
    ? data
    : data && Array.isArray(data.leads)
    ? data.leads
    : data && Array.isArray(data.data)
    ? data.data
    : [];
};

const MyCommissions = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCommission, setSelectedCommission] =
    useState<Commission | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [commissionFormData, setCommissionFormData] = useState({
    _id: "",
    clientId: "",
    commissionAmount: "",
    commissionPercent: "",
    saleDate: new Date(),
    paymentDate: null as Date | null,
    status: "pending",
  });
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: commissions,
    isLoading: isCommissionLoading,
    isError: isCommError,
    error: commErr,
  } = useQuery<Commission[], Error>({
    queryKey: ["commissions"],
    queryFn: fetchAllCommission,
    staleTime: 0,
  });

  const {
    data: commissionEligibleLeads,
    isLoading: isLeadsLoading,
    isError: isLeadsError,
    error: leadsErr,
  } = useQuery<CommissionEligibleLead[], Error>({
    queryKey: ["commissionEligibleLeads"],
    queryFn: fetchCommissionEligibleLeads,
    staleTime: 0,
  });

  const addCommissionMutation = useMutation({
    mutationFn: async (
      newCommission: Omit<Commission, "_id" | "clientId"> & { clientId: string }
    ) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/commission/addCommissions`,
        newCommission
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Commission added successfully!");
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["commissionEligibleLeads"] });
      setIsAddEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add commission: ${
          error.response?.data?.message || error.message
        }`
      );
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: async (updatedCommissionData: {
      _id: string;
      commissionAmount: string;
      commissionPercent: string;
      saleDate: string;
      paymentDate: string | null;
      status: "pending" | "paid";
    }) => {
      const { data } = await axios.put(
        `${import.meta.env.VITE_URL}/api/commission/updateCommissions/${
          updatedCommissionData._id
        }`,
        updatedCommissionData
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Commission updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setIsAddEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        `Failed to update commission: ${
          error.response?.data?.message || error.message
        }`
      );
    },
  });

  useEffect(() => {
    if (isCommError) {
      toast.error("Failed to fetch commissions.");
    }
  }, [isCommError, commErr]);

  useEffect(() => {
    if (isLeadsError) {
      toast.error("Failed to fetch commission eligible leads.");
    }
  }, [isLeadsError, leadsErr]);

  if (isCommissionLoading || isLeadsLoading) {
    return <Loader />;
  }

  const actualCommissions: Commission[] = commissions || [];
  const actualCommissionEligibleLeads: CommissionEligibleLead[] =
    commissionEligibleLeads || [];

  const totalEarned = actualCommissions.reduce((sum, commission) => {
    if (commission.status === "paid") {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const pendingAmount = actualCommissions.reduce((sum, commission) => {
    if (commission.status === "pending") {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const totalSales = actualCommissions.length;

  const currentMonth = format(new Date(), "MMMM");
  const currentYear = format(new Date(), "yyyy");

  const thisMonthEarned = actualCommissions.reduce((sum, commission) => {
    const saleDate = new Date(commission.saleDate);
    if (
      commission.status === "paid" &&
      format(saleDate, "MMMM") === currentMonth &&
      format(saleDate, "yyyy") === currentYear
    ) {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const prevMonth = subMonths(new Date(), 1);
  const lastMonthName = format(prevMonth, "MMMM");
  const lastMonthYear = format(prevMonth, "yyyy");

  const lastMonthEarned = actualCommissions.reduce((sum, commission) => {
    const saleDate = new Date(commission.saleDate);
    if (
      commission.status === "paid" &&
      format(saleDate, "MMMM") === lastMonthName &&
      format(saleDate, "yyyy") === lastMonthYear
    ) {
      return sum + parseFloat(commission.commissionAmount.replace(/[₹,]/g, ""));
    }
    return sum;
  }, 0);

  const commissionSummary = {
    totalEarned: `₹${totalEarned.toLocaleString("en-IN")}`,
    pendingAmount: `₹${pendingAmount.toLocaleString("en-IN")}`,
    thisMonth: `₹${thisMonthEarned.toLocaleString("en-IN")}`,
    lastMonth: `₹${lastMonthEarned.toLocaleString("en-IN")}`,
    totalSales: totalSales,
    conversionRate: totalSales > 0 ? "42%" : "0%",
    pendingTransactions: actualCommissions.filter((c) => c.status === "pending")
      .length,
  };

  const monthlySummaryMap = actualCommissions.reduce((acc, commission) => {
    const saleDate = new Date(commission.saleDate);
    const monthYear = format(saleDate, "MMMMyyyy");
    const monthOnly = format(saleDate, "MMMM");

    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthOnly,
        sales: 0,
        amount: 0,
        sortDate: saleDate,
      };
    }
    acc[monthYear].sales += 1;
    acc[monthYear].amount += parseFloat(
      commission.commissionAmount.replace(/[₹,]/g, "")
    );
    return acc;
  }, {} as Record<string, { month: string; sales: number; amount: number; sortDate: Date }>);

  const monthlySummary = Object.values(monthlySummaryMap)
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    .slice(-4)
    .map((data) => ({
      ...data,
      amount: `₹${data.amount.toLocaleString("en-IN")}`,
    }));

  const maxAmountForChart = monthlySummary.reduce((max, current) => {
    const amount = parseFloat(current.amount.replace(/[^\d]/g, ""));
    return amount > max ? amount : max;
  }, 0);

  const filteredCommissions = actualCommissions.filter((commission) => {
    if (activeTab === "all") return true;
    return commission.status === activeTab;
  });

  const handleDownloadReport = () => {
    if (!filteredCommissions || filteredCommissions.length === 0) {
      toast.info("No data to download for the current tab.");
      return;
    }

    const headers = [
      "Client Name",
      "Property Name",
      "Unit",
      "Property Value",
      "Commission Amount",
      "Commission Percent",
      "Sale Date",
      "Payment Date",
      "Status",
      "Transaction ID",
    ];

    const csvRows = filteredCommissions.map((commission) => {
      const saleDateFormatted = format(
        new Date(commission.saleDate),
        "yyyy-MM-dd"
      );
      const paymentDateFormatted = commission.paymentDate
        ? format(new Date(commission.paymentDate), "yyyy-MM-dd")
        : "N/A";

      return [
        `"${commission.clientId.addedBy.name}"`, // Access client name from populated Lead's addedBy
        `"${commission.clientId.property.basicInfo.projectName}"`, // Access property name from populated Lead's property
        `"${commission.clientId.property.basicInfo.plotNumber}"`,
        `"${commission.clientId.property.financialDetails.totalAmount.toLocaleString(
          "en-IN"
        )}"`,
        `"${commission.commissionAmount}"`,
        `"${commission.commissionPercent}"`,
        `"${saleDateFormatted}"`,
        `"${paymentDateFormatted}"`,
        `"${commission.status}"`,
        `"CSK-COM-${commission._id}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `commissions_report_${activeTab}_${format(
        new Date(),
        "yyyyMMdd_HHmmss"
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Commission report downloaded successfully!");
  };

  const handleAddCommissionClick = () => {
    setIsEditing(false);
    setCommissionFormData({
      _id: "",
      clientId: "",
      commissionAmount: "",
      commissionPercent: "",
      saleDate: new Date(),
      paymentDate: null,
      status: "pending",
    });
    setIsAddEditDialogOpen(true);
  };

  const handleEditCommissionClick = (commission: Commission) => {
    setIsEditing(true);
    setCommissionFormData({
      _id: commission._id,
      clientId: commission.clientId._id,
      commissionAmount: parseFloat(
        commission.commissionAmount.replace(/[₹,]/g, "")
      ).toString(),
      commissionPercent: parseFloat(
        commission.commissionPercent.replace(/%/, "")
      ).toString(),
      saleDate: new Date(commission.saleDate),
      paymentDate: commission.paymentDate
        ? new Date(commission.paymentDate)
        : null,
      status: commission.status,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCommissionFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setCommissionFormData((prev) => ({
      ...prev,
      clientId: value,
    }));
  };

  const handleDateChange = (
    date: Date | undefined,
    field: "saleDate" | "paymentDate"
  ) => {
    setCommissionFormData((prev) => ({
      ...prev,
      [field]: date || null,
    }));
  };

  const handleStatusChange = (checked: boolean) => {
    setCommissionFormData((prev) => ({
      ...prev,
      status: checked ? "paid" : "pending",
      paymentDate: checked ? new Date() : null,
    }));
  };

  const handleSubmitCommission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commissionFormData.clientId && !isEditing) {
      toast.error("Please select a closed property to add a commission.");
      return;
    }
    if (
      !commissionFormData.commissionAmount ||
      !commissionFormData.commissionPercent
    ) {
      toast.error("Please enter both commission amount and percentage.");
      return;
    }
    if (
      isNaN(parseFloat(commissionFormData.commissionAmount)) ||
      isNaN(parseFloat(commissionFormData.commissionPercent))
    ) {
      toast.error("Commission amount and percentage must be numbers.");
      return;
    }
    if (!commissionFormData.saleDate) {
      toast.error("Please select a sale date.");
      return;
    }

    const formattedPayload = {
      commissionAmount: `₹${parseFloat(
        commissionFormData.commissionAmount
      ).toLocaleString("en-IN")}`,
      commissionPercent: `${parseFloat(commissionFormData.commissionPercent)}%`,
      saleDate: commissionFormData.saleDate.toISOString(),
      paymentDate: commissionFormData.paymentDate
        ? commissionFormData.paymentDate.toISOString()
        : null,
      status: commissionFormData.status as "pending" | "paid",
    };

    if (isEditing) {
      updateCommissionMutation.mutate({
        _id: commissionFormData._id,
        ...formattedPayload,
      });
    } else {
      addCommissionMutation.mutate({
        clientId: commissionFormData.clientId,
        ...formattedPayload,
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Commissions</h1>
            <p className="text-muted-foreground">
              Track your earnings and payment history
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddCommissionClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Commission
            </Button>
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commission Earned
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissionSummary.totalEarned}
              </div>
              <p className="text-xs text-muted-foreground">
                From {commissionSummary.totalSales} property sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissionSummary.pendingAmount}
              </div>
              <div className="flex items-center pt-1 text-estate-gold">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span className="text-xs">
                  From {commissionSummary.pendingTransactions} pending
                  transactions
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {commissionSummary.thisMonth}
              </div>
              <div className="flex items-center pt-1 text-estate-success">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span className="text-xs">
                  {parseFloat(
                    commissionSummary.thisMonth.replace(/[₹,]/g, "")
                  ) >
                  parseFloat(commissionSummary.lastMonth.replace(/[₹,]/g, ""))
                    ? "+ Increased"
                    : "- Decreased"}{" "}
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Earnings by Month</CardTitle>
            <CardDescription>
              Your commission earnings summary for the past{" "}
              {monthlySummary.length} months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <div className="grid grid-cols-4 gap-4 h-full">
                {monthlySummary.map((month, i) => {
                  const normalizedValue =
                    maxAmountForChart > 0
                      ? parseFloat(month.amount.replace(/[^\d]/g, "")) /
                        maxAmountForChart
                      : 0;
                  const barHeight = `${Math.max(normalizedValue * 80, 10)}%`;

                  return (
                    <div
                      key={month.month}
                      className="flex flex-col items-center justify-end h-full"
                    >
                      <div
                        className={`w-full max-w-[60px] bg-estate-navy rounded-t-md`}
                        style={{ height: barHeight }}
                      ></div>
                      <div className="mt-2 text-center">
                        <p className="font-medium">{month.month}</p>
                        <p className="text-xs text-muted-foreground">
                          {month.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {month.sales} {month.sales === 1 ? "sale" : "sales"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
            <CardDescription>
              Details of all your commission earnings to date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Desktop Tabs */}
              <TabsList className="hidden md:grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

              {/* Mobile Tabs as Select */}
              <div className="md:hidden mb-4">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Sale Date
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.length > 0 ? (
                      filteredCommissions.map((commission) => (
                        <TableRow key={commission._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    commission.clientId.addedBy?.avatar || ""
                                  }
                                />
                                <AvatarFallback>
                                  {commission.clientId.addedBy?.name
                                    ? commission.clientId.addedBy.name[0]
                                    : "N/A"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {commission.clientId.addedBy?.name || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>
                                {commission.clientId.property?.basicInfo
                                  ?.projectName || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Unit:{" "}
                                {commission.clientId.property?.basicInfo
                                  ?.plotNumber || "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {commission.commissionAmount}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {commission.commissionPercent} of ₹
                                {(
                                  commission.clientId.property?.financialDetails
                                    ?.totalAmount || 0
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {commission.saleDate
                              ? format(
                                  new Date(commission.saleDate),
                                  "MMM d, yyyy"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                commission.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {commission.status === "paid"
                                ? "Paid"
                                : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedCommission(commission)
                                }
                              >
                                <Info className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditCommissionClick(commission)
                                }
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Commission</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          No commissions found for this category.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredCommissions.length > 0 ? (
                  filteredCommissions.map((commission) => (
                    <div
                      key={commission._id}
                      className="border rounded-lg p-4 bg-white shadow-sm space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={commission.clientId.addedBy?.avatar || ""}
                          />
                          <AvatarFallback>
                            {commission.clientId.addedBy?.name
                              ? commission.clientId.addedBy.name[0]
                              : "N/A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {commission.clientId.addedBy?.name || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium">Property:</span>{" "}
                        {commission.clientId.property?.basicInfo?.projectName ||
                          "N/A"}
                        <p className="text-xs text-muted-foreground">
                          Unit:{" "}
                          {commission.clientId.property?.basicInfo
                            ?.plotNumber || "N/A"}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">Commission:</span>{" "}
                        {commission.commissionAmount} (
                        {commission.commissionPercent} of ₹
                        {(
                          commission.clientId.property?.financialDetails
                            ?.totalAmount || 0
                        ).toLocaleString("en-IN")}
                        )
                      </div>

                      <div>
                        <span className="font-medium">Sale Date:</span>{" "}
                        {commission.saleDate
                          ? format(new Date(commission.saleDate), "MMM d, yyyy")
                          : "N/A"}
                      </div>

                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge
                          className={
                            commission.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {commission.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedCommission(commission)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditCommissionClick(commission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No commissions found for this category.
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>

          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Showing {filteredCommissions.length} of {actualCommissions.length}{" "}
              transactions
            </div>
          </CardFooter>
        </Card>

        {selectedCommission && (
          <Dialog
            open={!!selectedCommission}
            onOpenChange={() => setSelectedCommission(null)}
          >
            <DialogContent className="max-w-[90vw] max-h-[80vh] rounded-xl overflow-scroll">
              <DialogHeader>
                <DialogTitle>Commission Details</DialogTitle>
                <DialogDescription>
                  Sale transaction information and payment details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedCommission.clientId.addedBy?.avatar || ""}
                      />
                      <AvatarFallback>
                        {selectedCommission.clientId.addedBy?.name
                          ? selectedCommission.clientId.addedBy.name[0]
                          : "N/A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedCommission.clientId.addedBy?.name || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">Client</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      selectedCommission.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {selectedCommission.status === "paid" ? "Paid" : "Pending"}
                  </Badge>
                </div>

                <div className="border-t border-b py-4">
                  <h3 className="font-medium mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">
                        {selectedCommission.clientId.property?.basicInfo
                          ?.projectName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unit</p>
                      <p className="font-medium">
                        {selectedCommission.clientId.property?.basicInfo
                          ?.plotNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sale Value
                      </p>
                      <p className="font-medium">
                        ₹
                        {(
                          selectedCommission.clientId.property?.financialDetails
                            ?.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sale Date</p>
                      <p className="font-medium">
                        {selectedCommission.saleDate
                          ? format(
                              new Date(selectedCommission.saleDate),
                              "MMMM d, yyyy"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-medium mb-3">Commission Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Commission Rate
                      </p>
                      <p className="font-medium">
                        {selectedCommission.commissionPercent}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Commission Amount
                      </p>
                      <p className="font-medium">
                        {selectedCommission.commissionAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Status
                      </p>
                      <p className="font-medium">
                        {selectedCommission.status === "paid"
                          ? "Paid"
                          : "Pending"}
                      </p>
                    </div>
                    {selectedCommission.paymentDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Payment Date
                        </p>
                        <p className="font-medium">
                          {format(
                            new Date(selectedCommission.paymentDate),
                            "MMMM d, yyyy"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Transaction ID: CSK-COM-{selectedCommission._id}
                  </p>
                  {selectedCommission.status === "pending" && (
                    <p className="text-sm text-estate-gold">
                      Expected payment by{" "}
                      {selectedCommission.saleDate
                        ? format(
                            addDays(new Date(selectedCommission.saleDate), 15),
                            "MMMM d, yyyy"
                          )
                        : "N/A"}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCommission(null)}
                >
                  Close
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Dialog
          open={isAddEditDialogOpen}
          onOpenChange={setIsAddEditDialogOpen}
        >
          <DialogContent className="max-w-[90vw] max-h-[80vh] rounded-xl overflow-scroll">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Commission" : "Add New Commission"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update details for this commission."
                  : "Enter details for the new commission linked to a closed property sale."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCommission} className="grid gap-4 py-4">
              {!isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="clientId">Select Closed Property</Label>
                  <Select
                    onValueChange={handleSelectChange}
                    value={commissionFormData.clientId}
                    disabled={
                      isLeadsLoading ||
                      actualCommissionEligibleLeads.length === 0
                    }
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue
                        placeholder={
                          isLeadsLoading
                            ? "Loading leads..."
                            : actualCommissionEligibleLeads.length === 0
                            ? "No eligible leads available"
                            : "Select a client/property"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {actualCommissionEligibleLeads.length > 0 ? (
                        actualCommissionEligibleLeads.map((lead) => (
                          <SelectItem key={lead._id} value={lead._id}>
                            {lead.name || "N/A"} -{" "}
                            {lead.property?.basicInfo?.projectName || "N/A"} (
                            {lead.property?.basicInfo?.plotNumber || "N/A"})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-leads" disabled>
                          No eligible leads available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only properties with a "Closed" status and no existing
                    commission are shown.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="commissionAmount">
                    Commission Amount (₹)
                  </Label>
                  <Input
                    id="commissionAmount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50000"
                    value={commissionFormData.commissionAmount}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="commissionPercent">
                    Commission Percentage (%)
                  </Label>
                  <Input
                    id="commissionPercent"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2.5"
                    value={commissionFormData.commissionPercent}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="saleDate">Sale Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !commissionFormData.saleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {commissionFormData.saleDate ? (
                        format(commissionFormData.saleDate, "PPP")
                      ) : (
                        <span>Pick a sale date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={commissionFormData.saleDate}
                      onSelect={(date) => handleDateChange(date, "saleDate")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="paymentDate">Payment Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !commissionFormData.paymentDate &&
                            "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {commissionFormData.paymentDate ? (
                          format(commissionFormData.paymentDate, "PPP")
                        ) : (
                          <span>Pick a payment date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={commissionFormData.paymentDate || undefined}
                        onSelect={(date) =>
                          handleDateChange(date, "paymentDate")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {isEditing && (
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="status"
                    checked={commissionFormData.status === "paid"}
                    onCheckedChange={(checked) => handleStatusChange(!!checked)}
                  />
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark as Paid
                  </Label>
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addCommissionMutation.isPending ||
                    updateCommissionMutation.isPending
                  }
                >
                  {isEditing
                    ? updateCommissionMutation.isPending
                      ? "Saving..."
                      : "Save Changes"
                    : addCommissionMutation.isPending
                    ? "Adding..."
                    : "Add Commission"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default MyCommissions;
