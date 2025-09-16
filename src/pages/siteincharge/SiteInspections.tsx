import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Grid3X3 } from "lucide-react";
import {
  Camera,
  Search,
  Calendar,
  MoreHorizontal,
  Building,
  Plus,
  Upload,
  XCircle,
  MapPin,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { handleExportReport } from "./generateInspectionPDF";

interface SiteInspection {
  id: string;
  title: string;
  project: string;
  unit: string;
  type: "routine" | "quality_issue" | "milestone";
  inspectionDate: string;
  status: "planned" | "completed";
  location: string;
  notes?: string;
  photoCount: number;
}

const typeColors: Record<string, string> = {
  routine: "bg-blue-100 text-blue-800",
  quality_issue: "bg-red-100 text-red-800",
  milestone: "bg-amber-100 text-amber-800",
};

const statusColors: Record<string, string> = {
  planned: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

const SiteInspections = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newInspectionOpen, setNewInspectionOpen] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [siteInspections, setSiteInspections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [unit, setUnit] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [selectedInspectionForPhotos, setSelectedInspectionForPhotos] =
    useState(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isInspection, setIsInspection] = useState(false);

  const handleUpdateStatus = (inspection) => {
    setSelectedInspection(inspection);
    setNewStatus(inspection.status);
    setStatusDialogOpen(true);
  };

  const handleViewDetails = (inspection) => {
    setSelectedInspection(inspection);
    setOpenDialog(true);
  };

  const fetchInspections = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/site-inspection/inspections`,
        { withCredentials: true }
      );
      setSiteInspections(response.data.inspections || []);
    } catch (error) {
      console.error("Failed to fetch inspections:", error);
    }
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

  useEffect(() => {
    fetchInspections();
    fetchDropdownData();
  }, []);

  const filteredInspections = siteInspections.filter((inspection) => {
    // Apply search query
    if (
      searchQuery &&
      !inspection.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply project filter
    if (
      projectFilter &&
      projectFilter !== "all-projects" &&
      inspection.project !== projectFilter
    ) {
      return false;
    }

    // Apply type filter
    if (
      typeFilter &&
      typeFilter !== "all-types" &&
      inspection.type !== typeFilter
    ) {
      return false;
    }

    // Apply status filter
    if (
      statusFilter &&
      statusFilter !== "all-statuses" &&
      inspection.status !== statusFilter
    ) {
      return false;
    }

    return true;
  });

  //const projects = Array.from(new Set(siteInspections.map(inspection => inspection.project)));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsInspection(true);
    // 1. Upload photos one-by-one
    const uploadedImageUrls: string[] = [];
    for (const photo of photos) {
      const formData = new FormData();
      formData.append("file", photo);

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (res.data.url) uploadedImageUrls.push(res.data.url);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    // 2. Create inspection object
    const inspectionData = {
      title,
      date,
      project: selectedProject,
      unit,
      type: selectedType,
      location,
      notes,
      photos: uploadedImageUrls,
    };

    // 3. Send inspection data to backend
    try {
      await axios.post(
        `${import.meta.env.VITE_URL}/api/site-inspection/inspection/create`,
        inspectionData,
        { withCredentials: true }
      );
      toast.success("Inspection created successfully!");
      setNewInspectionOpen(false); // close modal
      fetchInspections();
      setTitle("");
      setDate("");
      setSelectedProject("");
      setUnit("");
      setSelectedType("");
      setLocation("");
      setNotes("");
    } catch (error) {
      toast.error("Failed to create inspection.");
      console.error("Inspection error:", error);
    } finally {
      setIsInspection(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 md:p-8 p-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Site Inspections
          </h1>
          <p className="text-muted-foreground">
            Document and track all site inspections with photo evidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Planned Inspections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Planned Inspections
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  siteInspections.filter(
                    (inspection) => inspection.status === "planned"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Upcoming inspections
              </p>
            </CardContent>
          </Card>

          {/* Completed Inspections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Inspections
              </CardTitle>
              <Camera className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  siteInspections.filter(
                    (inspection) => inspection.status === "completed"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          {/* Total Photos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Photos
              </CardTitle>
              <Grid3X3 className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {siteInspections.reduce(
                  (sum, inspection) => sum + (inspection.photos?.length || 0),
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Documentation images
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex flex-wrap items-center space-x-0 space-y-2 sm:space-x-2 sm:space-y-0">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inspections..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-fit">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  <span>
                    {projectFilter === "all-projects" || !projectFilter
                      ? "All Projects"
                      : projectFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                {projects.map((project, idx) => (
                  <SelectItem key={project._id || idx} value={project._id}>
                    {project.projectTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-fit">
                <div className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  <span>
                    {typeFilter === "all-types" || !typeFilter
                      ? "All Types"
                      : typeFilter
                          .replace("_", " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="quality_issue">Quality Issue</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-fit">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {statusFilter === "all-statuses" || !statusFilter
                      ? "All Statuses"
                      : statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={newInspectionOpen} onOpenChange={setNewInspectionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Inspection
              </Button>
            </DialogTrigger>
            <DialogContent className="md:w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl">
              <DialogHeader>
                <DialogTitle>Create New Inspection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Inspection Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter inspection title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Inspection Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project, idx) => (
                          <SelectItem
                            key={project._id || idx}
                            value={project._id}
                          >
                            {project.projectTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Building/Unit identifier"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Inspection Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="quality_issue">
                          Quality Issue
                        </SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location Details</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Specific location within site"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes & Observations</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any observations or notes about the inspection"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Photos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative rounded-md overflow-hidden border border-border h-32"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Inspection ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full"
                          onClick={() => removePhoto(index)}
                        >
                          <XCircle className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    ))}

                    {photos.length < 9 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-32 border-dashed flex flex-col"
                        onClick={() =>
                          document
                            .getElementById("inspection-photo-upload")
                            ?.click()
                        }
                      >
                        <Upload className="mb-2 h-6 w-6" />
                        <span>Add Photos</span>
                      </Button>
                    )}
                  </div>
                  <Input
                    id="inspection-photo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewInspectionOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isInspection}
                  >
                    {isInspection
                      ? "Creating Inspection..."
                      : "Create Inspection"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project / Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No inspections found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInspections.map((inspection) => (
                    <TableRow key={inspection._id}>
                      <TableCell className="font-medium">
                        {inspection.title}
                        <div className="text-xs text-muted-foreground">
                          {inspection.locations}
                        </div>
                      </TableCell>
                      <TableCell>
                        {inspection?.project?.projectId?.basicInfo
                          ?.projectName || "N/A"}{" "}
                        / {inspection?.unit || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={typeColors[inspection.type] || ""}
                        >
                          {inspection.type === "quality_issue"
                            ? "Quality Issue"
                            : inspection.type.charAt(0).toUpperCase() +
                              inspection.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(inspection.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[inspection.status] || ""}
                        >
                          {inspection.status.charAt(0).toUpperCase() +
                            inspection.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Camera className="h-4 w-4 mr-1 text-muted-foreground" />
                          {inspection.photos?.length || "0"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(inspection)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInspectionForPhotos(inspection);
                                setOpenPhotoDialog(true);
                              }}
                            >
                              Add Photos
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(inspection)}
                            >
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportReport(inspection)}
                            >
                              Export Report
                            </DropdownMenuItem>

                            {/* {inspection.status === "planned" && (
                              <DropdownMenuItem>
                                Complete Inspection
                              </DropdownMenuItem>
                            )} */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Inspection Details</DialogTitle>
                </DialogHeader>
                {selectedInspection && (
                  <div className="space-y-4 text-sm">
                    <p>
                      <strong>Title:</strong> {selectedInspection.title}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedInspection.locations}
                    </p>
                    <p>
                      <strong>Project:</strong>{" "}
                      {selectedInspection?.project?.projectId?.basicInfo
                        ?.projectName || "N/A"}
                    </p>
                    <p>
                      <strong>Unit:</strong> {selectedInspection.unit}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedInspection.type}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedInspection.status}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(selectedInspection.date).toLocaleDateString()}
                    </p>
                    <div>
                      <strong>Photos:</strong>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {selectedInspection.photos?.length > 0 ? (
                          selectedInspection.photos.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Inspection"
                              className="w-full h-24 object-cover rounded border"
                            />
                          ))
                        ) : (
                          <p className="text-muted-foreground text-xs">
                            No photos available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent className="max-w-sm">
                <div className="flex justify-between items-start">
                  <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                  </DialogHeader>
                  {/* <DialogClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </DialogClose> */}
                </div>

                <div className="grid gap-4 mt-4">
                  <div className="flex gap-2 justify-between">
                    {["completed", "planned"].map((status) => (
                      <Button
                        key={status}
                        variant={newStatus === status ? "default" : "outline"}
                        onClick={() => setNewStatus(status)}
                        className="flex-1 capitalize"
                      >
                        {status.replace("_", " ")}
                      </Button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStatusDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          await axios.patch(
                            `${
                              import.meta.env.VITE_URL
                            }/api/site-inspection/inspection/${
                              selectedInspection._id
                            }/status`,
                            {
                              status: newStatus,
                            },
                            { withCredentials: true }
                          );

                          // // Update local data (example: using setFilteredIssues if you maintain state)
                          // setFilteredIssues(prev =>
                          //   prev.map((i) =>
                          //     i._id === selectedIssue._id ? { ...i, status: newStatus } : i
                          //   )
                          // )

                          setStatusDialogOpen(false);
                          fetchInspections();
                        } catch (err) {
                          console.error("Failed to update status", err);
                          // Optionally show error toast
                        }
                      }}
                    >
                      Save Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={openPhotoDialog} onOpenChange={setOpenPhotoDialog}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload Photos</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setPhotoFiles(Array.from(e.target.files || []))
                    }
                    className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                  />

                  {photoFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {photoFiles.map((file, i) => (
                        <img
                          key={i}
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="h-24 w-full object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={async () => {
                      if (
                        !selectedInspectionForPhotos ||
                        photoFiles.length === 0
                      )
                        return;

                      setIsUploading(true);
                      const uploadedImageUrls: string[] = [];
                      for (const photo of photoFiles) {
                        const formData = new FormData();
                        formData.append("file", photo);

                        try {
                          const res = await axios.post(
                            `${import.meta.env.VITE_URL}/api/uploads/upload`,
                            formData,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            }
                          );
                          if (res.data.url)
                            uploadedImageUrls.push(res.data.url);
                        } catch (err) {
                          console.error("Upload failed", err);
                        }
                      }

                      // Now call your backend to update the inspection
                      try {
                        await axios.patch(
                          `${
                            import.meta.env.VITE_URL
                          }/api/site-inspection/add-photos/${
                            selectedInspectionForPhotos._id
                          }`,
                          { photos: uploadedImageUrls },
                          { withCredentials: true }
                        );
                        toast.success("Photos added successfully!");
                        // Optional: Refresh inspections here
                      } catch (err) {
                        console.error("DB update failed:", err);
                        toast.error("Failed to update inspection photos.");
                      }

                      // Reset states
                      setPhotoFiles([]);
                      setIsUploading(false);
                      setOpenPhotoDialog(false);
                      fetchInspections();
                    }}
                    disabled={isUploading || photoFiles.length === 0}
                  >
                    {isUploading ? "Uploading..." : "Confirm Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SiteInspections;
