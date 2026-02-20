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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import {
  fetchInspections,
  useFloorUnits,
  useProjects,
  useUnits,
} from "@/utils/buildings/Projects";
import { DialogDescription } from "@radix-ui/react-dialog";

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
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFloorUnit, setSelectedFloorUnit] = useState("");
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
  const queryClient = useQueryClient();

  const {
    data: siteInspections,
    isLoading: siteLoading,
    error: siteError,
    isError: siteIsError,
  } = useQuery({
    queryKey: ["inspections"],
    queryFn: fetchInspections,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: projects,
    isLoading: projectLoading,
    error: dropdownError,
    isError: dropdownIsError,
  } = useProjects();

  const {
    data: floorUnits = [],
    isLoading: floorUnitsLoading,
    isError: floorUnitsError,
    error: floorUnitsErrorMessage,
  } = useFloorUnits(selectedProject);

  const {
    data: unitsByFloor,
    isLoading: unitsByFloorLoading,
    isError: unitsByFloorError,
    error: unitsByFloorErrorMessage,
  } = useUnits(selectedProject, selectedFloorUnit);

  const createInspection = useMutation({
    mutationFn: async () => {
      if (photos.length === 0) {
        throw new Error("Please upload at least one photo");
      }

      setIsUploading(true);
      const uploadedImageUrls: string[] = [];

      for (const photo of photos) {
        const formData = new FormData();
        formData.append("file", photo);

        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const cloudinaryResponse = res.data?.url;
        const imageUrl =
          typeof cloudinaryResponse === "string"
            ? cloudinaryResponse
            : cloudinaryResponse?.secure_url;

        if (!imageUrl) {
          throw new Error("Image upload failed");
        }

        uploadedImageUrls.push(imageUrl);
      }

      const inspectionData = {
        title,
        date,
        project: selectedProject,
        floorUnit: selectedFloorUnit,
        unit,
        type: selectedType,
        location,
        notes,
        photos: uploadedImageUrls,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/site-inspection/inspection/create`,
        inspectionData,
        { withCredentials: true },
      );
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Inspection created successfully");
      setNewInspectionOpen(false);
      // fetchInspections();
      setTitle("");
      setDate("");
      setSelectedProject("");
      setUnit("");
      setSelectedFloorUnit("");
      setSelectedType("");
      setLocation("");
      setNotes("");
      setPhotos([]);
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error?.message || "Failed to create inspection");
      console.error("Inspection error:", error);
    },
  });

  const handleUpdateStatus = (inspection) => {
    setSelectedInspection(inspection);
    setNewStatus(inspection.status);
    setStatusDialogOpen(true);
  };

  const handleViewDetails = (inspection) => {
    setSelectedInspection(inspection);
    setOpenDialog(true);
  };

  if (siteIsError) {
    console.log("Failed to load inspection. Please try again.");
    toast.error(siteError.message);
    return null;
  }

  if (floorUnitsError) {
    console.log("Failed to load floor units. Please try again.");
    toast.error(floorUnitsErrorMessage.message);
    return null;
  }

  if (unitsByFloorError) {
    console.log("Failed to load units. Please try again.");
    toast.error(unitsByFloorErrorMessage.message);
    return null;
  }

  if (dropdownIsError) {
    console.log("Failed to load dropdown data. Please try again.");
    toast.error(dropdownError.message);
    return null;
  }

  if (siteLoading) return <Loader />;

  const selectedProjectName =
    projects?.find((p) => p._id === projectFilter)?.projectName ||
    (projectFilter === "all-projects" || !projectFilter
      ? "All Projects"
      : "Unknown");

  const filteredInspections = siteInspections.filter((inspection) => {
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
      inspection.project?._id !== projectFilter
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createInspection.mutate();
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
                    (inspection) => inspection.status === "planned",
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
                    (inspection) => inspection.status === "completed",
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
                  0,
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
                  <span>{selectedProjectName}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                {projects.map((project, idx) => (
                  <SelectItem key={project._id || idx} value={project._id}>
                    {project.projectName}
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
                              word.charAt(0).toUpperCase() + word.slice(1),
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
              <DialogDescription>
                Fill in the details below to create a new site inspection
                record.
              </DialogDescription>
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
                          projects &&
                          projects.map((project, idx) => (
                            <SelectItem
                              key={project._id || idx}
                              value={project._id}
                            >
                              {project.projectName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Floor Units</Label>
                    <Select
                      value={selectedFloorUnit}
                      onValueChange={setSelectedFloorUnit}
                      disabled={
                        floorUnitsLoading ||
                        !floorUnits ||
                        floorUnits.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            floorUnitsLoading
                              ? "Loading Floor Units..."
                              : !floorUnits || floorUnits.length === 0
                                ? "No floor units available"
                                : "Select Floor Unit"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {floorUnitsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : !floorUnits || floorUnits.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No floor units available
                          </SelectItem>
                        ) : (
                          floorUnits &&
                          floorUnits?.map((floor, idx) => (
                            <SelectItem
                              key={floor._id || idx}
                              value={floor._id}
                            >
                              floor no: {floor.floorNumber} ,{floor.unitType}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Units</Label>
                    <Select
                      value={unit}
                      onValueChange={setUnit}
                      disabled={
                        unitsByFloorLoading ||
                        !unitsByFloor ||
                        unitsByFloor.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            unitsByFloorLoading
                              ? "Loading Units..."
                              : !unitsByFloor || unitsByFloor.length === 0
                                ? "No units available"
                                : "Select Unit"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {unitsByFloorLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : !unitsByFloor || unitsByFloor.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No units available
                          </SelectItem>
                        ) : (
                          unitsByFloor &&
                          unitsByFloor?.map((unit, idx) => (
                            <SelectItem key={unit._id || idx} value={unit._id}>
                              plot no:{unit.plotNo}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
                    disabled={createInspection.isPending || isUploading}
                  >
                    {createInspection.isPending
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
            {/* Desktop Table */}
            <div className="hidden md:block">
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
                            {inspection.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          {inspection?.project?.projectName || "N/A"} /{" "}
                          {inspection?.floorUnit?.floorNumber || "N/A"}/{" "}
                          {inspection?.unit?.propertyType || "N/A"}
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredInspections.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No inspections found matching your filters
                </div>
              ) : (
                filteredInspections.map((inspection) => (
                  <div
                    key={inspection._id}
                    className="border rounded-md p-4 shadow-sm bg-white space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{inspection.title}</h4>
                      <Badge
                        variant="outline"
                        className={statusColors[inspection.status] || ""}
                      >
                        {inspection.status.charAt(0).toUpperCase() +
                          inspection.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {inspection.location}
                    </p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Project: {inspection?.project?.projectName || "N/A"}
                      </span>
                      <span>
                        Unit: {inspection?.floorUnit?.floorNumber || "N/A"}
                      </span>
                      <span>
                        Unit: {inspection?.unit?.propertyType || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Type:{" "}
                        {inspection.type === "quality_issue"
                          ? "Quality Issue"
                          : inspection.type}
                      </span>
                      <span>
                        Date: {new Date(inspection.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Camera className="h-4 w-4 mr-1" />{" "}
                      {inspection.photos?.length || "0"} Photos
                    </div>
                    <div className="flex justify-end mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Inspection Details Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] max-w-[90vw] rounded-xl overflow-scroll">
                <DialogHeader>
                  <DialogTitle>Inspection Details</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Detailed information about the selected inspection.
                </DialogDescription>
                {selectedInspection && (
                  <div className="space-y-4 text-sm">
                    <p>
                      <strong>Title:</strong> {selectedInspection.title}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedInspection.location}
                    </p>
                    <p>
                      <strong>Project: </strong>{" "}
                      {selectedInspection?.project?.projectName || "N/A"}
                    </p>
                    <p>
                      <strong>Floor Unit: </strong>{" "}
                      {selectedInspection.floorUnit?.floorNumber}
                    </p>
                    <p>
                      <strong>Unit: </strong>{" "}
                      {selectedInspection.unit?.propertyType}
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

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] max-w-[90vw] rounded-xl overflow-y-auto">
                <div className="flex justify-between items-start">
                  <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Update the status of the selected inspection.
                  </DialogDescription>
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
                            { status: newStatus },
                            { withCredentials: true },
                          );
                          setStatusDialogOpen(false);
                          queryClient.invalidateQueries({
                            queryKey: ["inspections"],
                          });
                          toast.success("Status updated");
                        } catch (err) {
                          console.error("Failed to update status", err);
                        }
                      }}
                    >
                      Save Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Upload Photos Dialog */}
            <Dialog open={openPhotoDialog} onOpenChange={setOpenPhotoDialog}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] max-w-[90vw] rounded-xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload Photos</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Upload additional photos for this inspection.
                </DialogDescription>
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
                      const uploadedImageUrls = [];
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
                            },
                          );
                          const cloudinaryResponse = res.data?.url;
                          const imageUrl =
                            typeof cloudinaryResponse === "string"
                              ? cloudinaryResponse
                              : cloudinaryResponse?.secure_url;

                          if (imageUrl) {
                            uploadedImageUrls.push(imageUrl);
                          }
                          queryClient.invalidateQueries({
                            queryKey: ["inspections"],
                          });
                        } catch (err) {
                          console.error("Upload failed", err);
                        }
                      }
                      try {
                        await axios.patch(
                          `${
                            import.meta.env.VITE_URL
                          }/api/site-inspection/add-photos/${
                            selectedInspectionForPhotos._id
                          }`,
                          { photos: uploadedImageUrls },
                          { withCredentials: true },
                        );
                        toast.success("Photos added successfully!");
                      } catch (err) {
                        console.error("DB update failed:", err);
                        toast.error("Failed to update inspection photos.");
                      }
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
