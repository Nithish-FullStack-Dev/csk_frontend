import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Upload,
  Calendar,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Eye,
  Edit,
} from "lucide-react";
import TaxOverviewCards from "@/components/tax/TaxOverviewCards";
import TaxCalculator from "@/components/tax/TaxCalculator";
import MainLayout from "@/components/layout/MainLayout";
import axios from "axios";
import { toast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Switch } from "@radix-ui/react-switch";

const TaxDocuments = () => {
  const [activeTab, setActiveTab] = useState("gst");
  const [newTaxDoc, setNewTaxDoc] = useState<any>({
    type: "",
  });

  const [gstDocs, setGstDocs] = useState([]);
  const [tdsDocs, setTdsDocs] = useState([]);
  const [itrDocs, setItrDocs] = useState([]);
  const [form16Docs, setForm16Docs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [viewGstDialogOpen, setViewGstDialogOpen] = useState(false);
  const [selectedGstDoc, setSelectedGstDoc] = useState(null);
  const [tdsDialogOpen, setTdsDialogOpen] = useState(false);
  const [selectedTdsRecord, setSelectedTdsRecord] = useState(null);
  const [openAddDoc, setOpenAddDoc] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null); // holds gstDoc, tdsDoc, etc.
  const [newStatus, setNewStatus] = useState(""); // updated value
  const [overview, setOverview] = useState({
    gstCollected: 0,
    tdsDeducted: 0,
    pendingReturns: 0,
    complianceScore: 0,
  });
  const [auditorName, setAuditorName] = useState("");
  const [auditDocuments, setAuditDocuments] = useState([]);
  const [complianceChecklist, setComplianceChecklist] = useState({
    gstFiled: false,
    tdsPaid: false,
    itrFiled: false,
    auditDone: false,
  });

  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditStatus, setAuditStatus] = useState("");

  // Just below fetchTaxDocuments or inside useEffect after setting GST & ITR docs
  const buildAuditDocuments = (gstDocs, itrDocs) => {
    const auditFromGST = gstDocs
      .filter((doc) => doc.status === "filed")
      .map((doc) => ({
        id: doc._id,
        type: doc.type, // <-- MUST be "gstr1" or "gstr3b"
        period: doc.period,
        auditor: doc.auditorName || "—",
        status: doc.isApprovedByAuditor ? "Completed" : "Pending",
        date: doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : "—",
      }));

    const auditFromITR = itrDocs
      .filter((doc) => doc.status === "filed")
      .map((doc) => ({
        id: doc._id,
        type: "itr", // <-- backend expects exactly "itr"
        period: doc.financialYear,
        auditor: doc.auditorName || "—",
        status: doc.isApprovedByAuditor ? "Completed" : "Pending",
        date: doc.filingDate
          ? new Date(doc.filingDate).toLocaleDateString()
          : "—",
      }));

    return [...auditFromGST, ...auditFromITR];
  };

  // const handleAddTaxDoc = () => {
  //   console.log("Adding tax document:", newTaxDoc);
  //   setNewTaxDoc({
  //     type: "",
  //     period: "",
  //     amount: "",
  //     dueDate: "",
  //   });
  // };

  const fetchTaxDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/tax/documents`,
        {
          withCredentials: true,
        }
      );

      const {
        gstDocuments = [],
        tdsDocuments = [],
        itrDocuments = [],
        form16Documents = [],
      } = res.data.taxDocuments || {};

      setGstDocs(gstDocuments);
      setTdsDocs(tdsDocuments);
      setItrDocs(itrDocuments);
      setForm16Docs(form16Documents);

      // Calculate overview data
      const gstCollected = gstDocuments.reduce(
        (sum, doc) => sum + (doc.amount || 0),
        0
      );
      const tdsDeducted = tdsDocuments.reduce(
        (sum, doc) => sum + (doc.amountDeducted || 0),
        0
      );
      const pendingReturns = gstDocuments.filter(
        (doc) => doc.status !== "Filed"
      ).length;

      const totalReturns =
        gstDocuments.length +
        tdsDocuments.length +
        itrDocuments.length +
        form16Documents.length;
      const filedReturns =
        gstDocuments.filter((doc) => doc.status === "Filed").length +
        tdsDocuments.filter((doc) => doc.status === "Paid").length +
        itrDocuments.filter((doc) => doc.status === "Filed").length +
        form16Documents.filter((doc) => doc.status === "Generated").length;

      const complianceScore =
        totalReturns > 0 ? Math.round((filedReturns / totalReturns) * 100) : 0;

      // Set overview
      setOverview({
        gstCollected,
        tdsDeducted,
        pendingReturns,
        complianceScore,
      });

      // Determine compliance status
      const gstFiled = gstDocuments.some(
        (doc) => doc.status?.toLowerCase() === "filed"
      );
      const tdsPaid = tdsDocuments.some(
        (doc) => doc.status?.toLowerCase() === "paid"
      );
      const itrFiled = itrDocuments.some(
        (doc) => doc.status?.toLowerCase() === "filed"
      );
      const auditDone = gstDocuments
        .concat(itrDocuments)
        .some(
          (doc) =>
            doc.status?.toLowerCase() === "filed" && doc.isApprovedByAuditor
        );

      // ROC Filed — since it’s not in DB, keep false (or fetch it separately if added later)
      //const rocFiled = false;

      setComplianceChecklist({
        gstFiled,
        tdsPaid,
        itrFiled,
        auditDone,
      });
    } catch (error) {
      console.error("Failed to fetch tax documents:", error);
      toast.error("Failed to load tax documents");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAddTaxDoc = async () => {
    setIsLoading(true);
    try {
      const formData = { ...newTaxDoc };
      let fileUrl = "";

      // 1. Upload file to Cloudinary if provided
      if (formData.file) {
        const fileForm = new FormData();
        fileForm.append("file", formData.file);

        const uploadRes = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          fileForm,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        fileUrl = uploadRes.data.url;
      }

      // 2. Prepare payload
      const payload = {
        type: formData.type, // Get from props/context
        data: {},
      };

      switch (formData.type) {
        case "gstr1":
        case "gstr3b":
          payload.data = {
            type: formData.type,
            period: formData.period,
            amount: formData.amount,
            dueDate: formData.dueDate,
            documentUrl: fileUrl,
            auditorName: formData.auditorName || "",
          };
          break;

        case "tds":
          payload.data = {
            quarter: formData.quarter,
            section: formData.section,
            amountDeducted: formData.amountDeducted,
            challanNumber: formData.challan,
            paymentDate: formData.paymentDate,
            documentUrl: fileUrl,
          };
          break;

        case "itr":
          payload.data = {
            financialYear: formData.financialYear,
            filingDate: formData.filingDate,
            amount: formData.amount,
            documentUrl: fileUrl,
          };
          break;

        case "form16":
          payload.data = {
            financialYear: formData.financialYear,
            issueDate: formData.filingDate,
            amount: formData.amount,
            documentUrl: fileUrl,
          };
          break;
      }

      // 3. Submit tax document to backend
      await axios.post(
        `${import.meta.env.VITE_URL}/api/tax/documents`,
        payload,
        {
          withCredentials: true,
        }
      );

      toast.success("Tax document added successfully!");
      fetchTaxDocuments();
      setNewTaxDoc({ type: "" }); // Reset form
      setOpenAddDoc(false);
    } catch (error) {
      console.error("Add Tax Doc Error:", error);
      toast.error("Error adding tax document");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxDocuments();
  }, []);

  useEffect(() => {
    if (gstDocs.length || itrDocs.length) {
      const audits = buildAuditDocuments(gstDocs, itrDocs);
      setAuditDocuments(audits);
    }
  }, [gstDocs, itrDocs]);

  return (
    <MainLayout>
      <div className="md:p-6 p-2 space-y-6">
        <div className="flex justify-between items-center md:flex-row flex-col md:gap-0 gap-5">
          <div>
            <h1 className="text-3xl font-bold">Tax Documents & Compliance</h1>
            <p className="text-muted-foreground">
              Manage GST, TDS, Income Tax, and compliance documents
            </p>
          </div>
          <Dialog open={openAddDoc} onOpenChange={setOpenAddDoc}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Tax Document
              </Button>
            </DialogTrigger>
            <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
              <DialogHeader>
                <DialogTitle>Add New Tax Document</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Document Type Selector */}
                <div>
                  <Label htmlFor="type">Document Type</Label>
                  <Select
                    value={newTaxDoc.type}
                    onValueChange={(value) =>
                      setNewTaxDoc({ ...newTaxDoc, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gstr1">GSTR-1</SelectItem>
                      <SelectItem value="gstr3b">GSTR-3B</SelectItem>
                      <SelectItem value="tds">TDS Return</SelectItem>
                      <SelectItem value="itr">Income Tax Return</SelectItem>
                      <SelectItem value="form16">Form 16</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* === Common Fields for GSTR-1 / GSTR-3B === */}
                {(newTaxDoc.type === "gstr1" ||
                  newTaxDoc.type === "gstr3b") && (
                  <>
                    <div>
                      <Label htmlFor="period">Period</Label>
                      <Input
                        id="period"
                        value={newTaxDoc.period || ""}
                        onChange={(e) =>
                          setNewTaxDoc({ ...newTaxDoc, period: e.target.value })
                        }
                        placeholder="e.g., May 2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Tax Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newTaxDoc.amount || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            amount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        placeholder="Enter tax amount"
                        min={0} // allows only positive numbers
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTaxDoc.dueDate || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="upload">Upload Document</Label>
                      <Input
                        id="upload"
                        type="file"
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            file: e.target.files?.[0],
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {/* === Fields for TDS Return === */}
                {newTaxDoc.type === "tds" && (
                  <>
                    <div>
                      <Label htmlFor="quarter">Quarter</Label>
                      <Select
                        value={newTaxDoc.quarter || ""}
                        onValueChange={(value) =>
                          setNewTaxDoc({ ...newTaxDoc, quarter: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Q1">Q1 (Apr - Jun)</SelectItem>
                          <SelectItem value="Q2">Q2 (Jul - Sep)</SelectItem>
                          <SelectItem value="Q3">Q3 (Oct - Dec)</SelectItem>
                          <SelectItem value="Q4">Q4 (Jan - Mar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        value={newTaxDoc.section || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            section: e.target.value,
                          })
                        }
                        placeholder="e.g., 194C"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amountDeducted">
                        Amount Deducted (₹)
                      </Label>
                      <Input
                        id="amountDeducted"
                        type="number"
                        value={newTaxDoc.amountDeducted || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            amountDeducted: Math.max(0, Number(e.target.value)),
                          })
                        }
                        placeholder="Enter deducted amount"
                        max={0}
                      />
                    </div>
                    <div>
                      <Label htmlFor="challan">Challan Number</Label>
                      <Input
                        id="challan"
                        value={newTaxDoc.challan || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            challan: e.target.value,
                          })
                        }
                        placeholder="Enter challan number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentDate">Payment Date</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={newTaxDoc.paymentDate || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            paymentDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {/* === Fields for Income Tax Return / Form 16 === */}
                {(newTaxDoc.type === "itr" || newTaxDoc.type === "form16") && (
                  <>
                    <div>
                      <Label htmlFor="docType">Type</Label>
                      <Select
                        value={newTaxDoc.docType || ""}
                        onValueChange={(value) =>
                          setNewTaxDoc({ ...newTaxDoc, docType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Form 26AS">Form 26AS</SelectItem>
                          <SelectItem value="ITR-4">ITR-4</SelectItem>
                          <SelectItem value="FORM 16">Form 16</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="financialYear">Financial Year</Label>
                      <Input
                        id="financialYear"
                        value={newTaxDoc.financialYear || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            financialYear: e.target.value,
                          })
                        }
                        placeholder="e.g., 2023-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="filingDate">Date of Filing</Label>
                      <Input
                        id="filingDate"
                        type="date"
                        value={newTaxDoc.filingDate || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            filingDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newTaxDoc.amount || ""}
                        onChange={(e) =>
                          setNewTaxDoc({
                            ...newTaxDoc,
                            amount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        placeholder="Enter amount"
                        max={0}
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleAddTaxDoc}
                  className="w-full"
                  disabled={isloading}
                >
                  {isloading ? "Adding Document" : "Add Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TaxOverviewCards
          gstCollected={overview.gstCollected}
          tdsDeducted={overview.tdsDeducted}
          pendingReturns={overview.pendingReturns}
          complianceScore={overview.complianceScore}
        />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tabs for desktop */}
          <TabsList className="hidden md:grid w-full grid-cols-4">
            <TabsTrigger value="gst">GST Management</TabsTrigger>
            <TabsTrigger value="tds">TDS Records</TabsTrigger>
            <TabsTrigger value="income">Income Tax</TabsTrigger>
            <TabsTrigger value="audit">Audit & Compliance</TabsTrigger>
          </TabsList>

          {/* Select for mobile */}
          <div className="block md:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gst">GST Management</SelectItem>
                <SelectItem value="tds">TDS Records</SelectItem>
                <SelectItem value="income">Income Tax</SelectItem>
                <SelectItem value="audit">Audit & Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="gst">
            <Card>
              <CardHeader>
                <CardTitle>GST Returns Management</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDocs ? (
                  <p className="text-muted-foreground">
                    Loading tax documents...
                  </p>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Return Type</TableHead>
                            <TableHead>Tax Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="px-16">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gstDocs.map((gstReturn) => (
                            <TableRow key={gstReturn.id}>
                              <TableCell>{gstReturn.period}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {gstReturn.type.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                ₹{gstReturn.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(
                                  new Date(gstReturn.dueDate),
                                  "dd-MM-yyyy"
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    gstReturn.status === "filed"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {gstReturn.status.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDoc(gstReturn);
                                      setNewStatus(gstReturn.status);
                                      setStatusDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedGstDoc(gstReturn);
                                      setViewGstDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {/* {gstReturn.documentUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const link =
                                          document.createElement("a");
                                        link.href = gstReturn.documentUrl;
                                        link.download = "";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  )} */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block md:hidden space-y-4">
                      {gstDocs.map((gstReturn) => (
                        <div
                          key={gstReturn.id}
                          className="rounded-lg border p-4 shadow-sm bg-white"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">
                              {gstReturn.period}
                            </h3>
                            <Badge
                              variant={
                                gstReturn.status === "filed"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {gstReturn.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="mt-2 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">Return Type:</span>
                              <Badge variant="outline">
                                {gstReturn.type.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Tax Amount:</span>
                              <span>₹{gstReturn.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Due Date:</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(
                                  new Date(gstReturn.dueDate),
                                  "dd-MM-yyyy"
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 flex gap-2 md:flex-row flex-col">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDoc(gstReturn);
                                setNewStatus(gstReturn.status);
                                setStatusDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedGstDoc(gstReturn);
                                setViewGstDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {gstReturn.documentUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = gstReturn.documentUrl;
                                  link.download = "";
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tds">
            <div className="space-y-6">
              {loadingDocs ? (
                <p className="text-muted-foreground">
                  Loading tax documents...
                </p>
              ) : (
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Amount Deducted</TableHead>
                        <TableHead>Challan Number</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tdsDocs.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.quarter}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.section}</Badge>
                          </TableCell>
                          <TableCell>
                            ₹{record.amountDeducted.toLocaleString()}
                          </TableCell>
                          <TableCell>{record.challanNumber}</TableCell>
                          <TableCell>
                            {format(new Date(record.paymentDate), "dd-MM-yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {record.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDoc(record);
                                  setNewStatus(record.status);
                                  setStatusDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTdsRecord(record);
                                  setTdsDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {record.documentUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = record.documentUrl;
                                    link.download = "";
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Mobile Card View */}
              {!loadingDocs && (
                <div className="md:hidden space-y-4">
                  {tdsDocs.map((record) => (
                    <Card key={record.id} className="w-full">
                      <CardHeader>
                        <CardTitle>TDS Deduction Record</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Quarter:</span>
                          <span>{record.quarter}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Section:</span>
                          <Badge variant="outline">{record.section}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Amount Deducted:</span>
                          <span>₹{record.amountDeducted.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Challan Number:</span>
                          <span>{record.challanNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Payment Date:</span>
                          <span>
                            {format(new Date(record.paymentDate), "dd-MM-yyyy")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge variant="default">
                            {record.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDoc(record);
                              setNewStatus(record.status);
                              setStatusDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTdsRecord(record);
                              setTdsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {record.documentUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = record.documentUrl;
                                link.download = "";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <TaxCalculator />
            </div>
          </TabsContent>

          <TabsContent value="income">
            <div className="space-y-6">
              {loadingDocs ? (
                <p className="text-muted-foreground">
                  Loading tax documents...
                </p>
              ) : (
                <div className="hidden md:block">
                  <Card>
                    <CardHeader>
                      <CardTitle>Income Tax Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document Type</TableHead>
                            <TableHead>Financial Year</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {itrDocs.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  {doc.type || "unknown type"}
                                </div>
                              </TableCell>
                              <TableCell>{doc.financialYear}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    doc.status === "filed"
                                      ? "default"
                                      : doc.status === "Generated"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {doc.status.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(new Date(doc.filingDate), "dd-MM-yyyy")}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDoc(doc);
                                      setNewStatus(doc.status);
                                      setStatusDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {doc.documentUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const link =
                                          document.createElement("a");
                                        link.href = doc.documentUrl;
                                        link.download = "";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Mobile Card View */}
              {!loadingDocs && (
                <div className="md:hidden space-y-4">
                  {itrDocs.map((doc) => (
                    <Card key={doc.id} className="w-full">
                      <CardHeader>
                        <CardTitle>Income Tax Document</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />{" "}
                            {doc.type || "unknown type"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Financial Year:</span>
                          <span>{doc.financialYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge
                            variant={
                              doc.status === "filed"
                                ? "default"
                                : doc.status === "Generated"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {doc.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>
                            {format(new Date(doc.filingDate), "dd-MM-yyyy")}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setNewStatus(doc.status);
                              setStatusDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDoc(doc);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doc.documentUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = doc.documentUrl;
                                link.download = "";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <div className="space-y-6">
              {/* Desktop Table View */}
              <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Audit Type</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Auditor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Update</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditDocuments.map((audit) => (
                          <TableRow key={audit.id}>
                            <TableCell>{audit.type}</TableCell>
                            <TableCell>{audit.period}</TableCell>
                            <TableCell>{audit.auditor}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  audit.status === "Completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {audit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{audit.date}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAudit(audit);
                                    setAuditStatus(audit.status);
                                    setAuditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          label: "GST Returns Filed",
                          status: complianceChecklist.gstFiled,
                        },
                        {
                          label: "TDS Payments Made",
                          status: complianceChecklist.tdsPaid,
                        },
                        {
                          label: "Income Tax Return Filed",
                          status: complianceChecklist.itrFiled,
                        },
                        {
                          label: "Audit Documentation",
                          status: complianceChecklist.auditDone,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          {item.status ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {auditDocuments.map((audit) => (
                  <Card key={audit.id} className="w-full">
                    <CardHeader>
                      <CardTitle>Audit Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Audit Type:</span>
                        <span>{audit.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Period:</span>
                        <span>{audit.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Auditor:</span>
                        <span>{audit.auditor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={
                            audit.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {audit.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Due Date:</span>
                        <span>{audit.date}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAudit(audit);
                            setAuditStatus(audit.status);
                            setAuditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Compliance Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          label: "GST Returns Filed",
                          status: complianceChecklist.gstFiled,
                        },
                        {
                          label: "TDS Payments Made",
                          status: complianceChecklist.tdsPaid,
                        },
                        {
                          label: "Income Tax Return Filed",
                          status: complianceChecklist.itrFiled,
                        },
                        {
                          label: "Audit Documentation",
                          status: complianceChecklist.auditDone,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          {item.status ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={viewGstDialogOpen} onOpenChange={setViewGstDialogOpen}>
          <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
            <DialogHeader>
              <DialogTitle>GST Document Details</DialogTitle>
            </DialogHeader>

            {selectedGstDoc && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="font-medium text-lg">
                    {selectedGstDoc.type?.toUpperCase()} -{" "}
                    {selectedGstDoc.period}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Amount: ₹{selectedGstDoc.amount?.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due Date:{" "}
                    {format(new Date(selectedGstDoc.dueDate), "dd-MM-yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {selectedGstDoc.status}
                  </p>
                </div>

                {selectedGstDoc.documentUrl && (
                  <div className="space-y-2">
                    <Label>Uploaded Document</Label>
                    <a
                      href={selectedGstDoc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      View / Download File
                    </a>
                  </div>
                )}

                {/* You can add more fields here if needed */}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={tdsDialogOpen} onOpenChange={setTdsDialogOpen}>
          <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
            <DialogHeader>
              <DialogTitle>TDS Deduction Details</DialogTitle>
              <DialogDescription>
                View information regarding this TDS deduction record.
              </DialogDescription>
            </DialogHeader>

            {selectedTdsRecord && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md space-y-1">
                  <p className="font-medium text-lg">
                    {selectedTdsRecord.quarter} - Section{" "}
                    {selectedTdsRecord.section}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Amount Deducted: ₹
                    {selectedTdsRecord.amountDeducted.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Challan No: {selectedTdsRecord.challanNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Payment Date:{" "}
                    {format(
                      new Date(selectedTdsRecord.paymentDate),
                      "dd-MM-yyyy"
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {selectedTdsRecord.status}
                  </p>
                </div>

                {selectedTdsRecord.documentUrl && (
                  <div className="space-y-2">
                    <Label>Supporting Document</Label>
                    <a
                      href={selectedTdsRecord.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      View / Download File
                    </a>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Update Status
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Seamlessly switch the status of the selected tax document.
              </DialogDescription>
            </DialogHeader>

            {selectedDoc && (
              <div className="space-y-6 pt-4">
                {/* Document Preview */}
                <div className="bg-muted/40 border border-border rounded-xl p-4 shadow-sm">
                  <div className="text-sm text-muted-foreground">
                    Document Summary
                  </div>
                  <div className="mt-1">
                    <p className="font-medium text-lg">
                      {selectedDoc.type?.toUpperCase() ||
                        selectedDoc.section ||
                        "Tax Document"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Amount: ₹
                      {(
                        selectedDoc.amount || selectedDoc.amountDeducted
                      )?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Status:{" "}
                      <span className="font-semibold">
                        {selectedDoc.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Toggle Options */}
                <div>
                  <Label className="block mb-2 text-sm font-medium">
                    Update Status
                  </Label>
                  <div className="flex gap-3 justify-between bg-secondary rounded-lg p-3">
                    {(selectedDoc.type ||
                      (!selectedDoc.type && !selectedDoc.section)) && (
                      <>
                        <Button
                          variant={
                            newStatus === "Filed" ? "default" : "outline"
                          }
                          onClick={() => setNewStatus("Filed")}
                          className="flex-1 justify-center"
                        >
                          ✅ Filed
                        </Button>
                        <Button
                          variant={
                            newStatus === "Pending" ? "default" : "outline"
                          }
                          onClick={() => setNewStatus("Pending")}
                          className="flex-1 justify-center"
                        >
                          ⏳ Pending
                        </Button>
                      </>
                    )}
                    {selectedDoc.section && (
                      <>
                        <Button
                          variant={newStatus === "Paid" ? "default" : "outline"}
                          onClick={() => setNewStatus("Paid")}
                          className="flex-1 justify-center"
                        >
                          💰 Paid
                        </Button>
                        <Button
                          variant={
                            newStatus === "Unpaid" ? "default" : "outline"
                          }
                          onClick={() => setNewStatus("Unpaid")}
                          className="flex-1 justify-center"
                        >
                          ❌ Unpaid
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Auditor Name input (only if 'Filed' and not TDS) */}
                {newStatus === "Filed" && !selectedDoc.section && (
                  <div>
                    <Label className="block mb-1 text-sm font-medium">
                      Auditor Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter auditor name"
                      value={auditorName}
                      onChange={(e) => setAuditorName(e.target.value)}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStatusDialogOpen(false);
                      setSelectedDoc(null);
                      setNewStatus("");
                      setAuditorName("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      selectedDoc.status === newStatus ||
                      (newStatus === "Filed" &&
                        !selectedDoc.section &&
                        !auditorName)
                    }
                    onClick={async () => {
                      try {
                        await axios.put(
                          `${
                            import.meta.env.VITE_URL
                          }/api/tax/documents/updateStatus/${selectedDoc._id}`,
                          {
                            status: newStatus,
                            auditorName:
                              newStatus === "Filed" && !selectedDoc.section
                                ? auditorName
                                : undefined,
                          },
                          { withCredentials: true }
                        );

                        toast.success("Status updated successfully!");
                        setStatusDialogOpen(false);
                        setAuditorName("");
                        fetchTaxDocuments();
                      } catch (err) {
                        toast.error("Failed to update status.");
                      }
                    }}
                  >
                    Update
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
          <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Update Audit Status
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Change the audit status for this document.
              </DialogDescription>
            </DialogHeader>

            {selectedAudit && (
              <div className="space-y-6 pt-4">
                <div className="bg-muted/40 border border-border rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Audit Type: {selectedAudit.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Period: {selectedAudit.period}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Auditor: {selectedAudit.auditor}
                  </p>
                </div>

                <div>
                  <Label className="block mb-2 text-sm font-medium">
                    Audit Status
                  </Label>
                  <div className="flex gap-3 justify-between bg-secondary rounded-lg p-3">
                    <Button
                      variant={
                        auditStatus === "Completed" ? "default" : "outline"
                      }
                      onClick={() => setAuditStatus("Completed")}
                      className="flex-1 justify-center"
                    >
                      ✅ Completed
                    </Button>
                    <Button
                      variant={
                        auditStatus === "In Progress" ? "default" : "outline"
                      }
                      onClick={() => setAuditStatus("In Progress")}
                      className="flex-1 justify-center"
                    >
                      🔄 In Progress
                    </Button>
                    <Button
                      variant={
                        auditStatus === "Not Started" ? "default" : "outline"
                      }
                      onClick={() => setAuditStatus("Not Started")}
                      className="flex-1 justify-center"
                    >
                      ⏳ Not Started
                    </Button>
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAuditDialogOpen(false);
                      setSelectedAudit(null);
                      setAuditStatus("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={auditStatus === selectedAudit.status}
                    onClick={async () => {
                      try {
                        await axios.put(
                          `${
                            import.meta.env.VITE_URL
                          }/api/tax/documents/updateAuditStatus/${
                            selectedAudit.id
                          }`, // you must pass this key when constructing `auditDocuments`
                          {
                            auditStatus,
                            type: selectedAudit.type,
                          },
                          { withCredentials: true }
                        );
                        toast.success("Audit status updated!");
                        setAuditDialogOpen(false);
                        fetchTaxDocuments();
                      } catch (err) {
                        toast.error("Failed to update audit status.");
                      }
                    }}
                  >
                    Update
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default TaxDocuments;
