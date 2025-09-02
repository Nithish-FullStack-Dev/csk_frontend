// ContractorPhotoEvidencePage.tsx (modified to use API data)

import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PhotoDetailsDialog from "@/components/dashboard/contractor/PhotoDetailsDialog";
import UploadEvidenceDialog from "@/components/dashboard/contractor/UploadEvidenceDialog";
import { CONSTRUCTION_PHASES } from "@/types/construction";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Calendar,
  Camera,
  Upload,
  Download,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-amber-100 text-amber-800",
  pending_review: "bg-blue-100 text-blue-800",
};

const ContractorPhotoEvidencePage = () => {
  const [photoList, setPhotoList] = useState<any[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [photoDetailsOpen, setPhotoDetailsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_URL}/api/project/tasks`,
          {
            withCredentials: true,
          }
        ); // Adjust path if needed
        const tasks = res.data || [];

        const transformed = tasks
          .filter((task) => task.contractorUploadedPhotos.length > 0)
          .map((task) => ({
            id: task._id,
            title: task.evidenceTitleByContractor || "Photo Submission",
            task: task.taskTitle || "Untitled Task",
            project: task.projectName,
            unit: task.unit,
            category: task.constructionPhase || "",
            date: task.submittedByContractorOn || task.deadline || new Date(),
            status:
              task.status?.toLowerCase().replace(/\s/g, "_") || "in_progress",
            images: task.contractorUploadedPhotos.map((url) => ({
              url,
              caption: "",
            })),
          }));

        setPhotoList(transformed);
      } catch (err) {
        toast.error("Failed to load task photos");
        console.error(err);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const filtered = photoList.filter((photo) => {
      const matchesSearch =
        searchQuery === "" ||
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.task.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProject =
        projectFilter === "" ||
        projectFilter === "all" ||
        photo.project === projectFilter;

      const matchesCategory =
        categoryFilter === "" ||
        categoryFilter === "all" ||
        photo.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || photo.status === statusFilter;

      return (
        matchesSearch && matchesProject && matchesCategory && matchesStatus
      );
    });
    setFilteredPhotos(filtered);
  }, [photoList, searchQuery, projectFilter, categoryFilter, statusFilter]);

  const projects = Array.from(new Set(photoList.map((p) => p.project)));

  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto(photo);
    setPhotoDetailsOpen(true);
  };

  const handlePhotoUpload = (newEvidence: any) => {
    setPhotoList((prev) => [newEvidence, ...prev]);
    setDialogOpen(false);
    toast.success("Photo uploaded successfully");
  };

  const viewPhotoDetails = (photoId: string) => {
    const photo = photoList.find((p) => p.id === photoId);
    if (photo) handlePhotoClick(photo);
  };

  const downloadAllImages = async (photo) => {
    const loadingToast = toast.loading(
      `Preparing download for "${photo.title}"...`
    );

    try {
      console.log("trying...........");
      const zip = new JSZip();
      const folder = zip.folder(photo.title || "photo-evidence")!;

      for (let i = 0; i < photo.images.length; i++) {
        const img = photo.images[i];
        const response = await fetch(img.url);
        const blob = await response.blob();
        const extension = img.url.split(".").pop()?.split("?")[0] || "jpg";
        folder.file(`photo-${i + 1}.${extension}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${photo.title || "photo-evidence"}.zip`);
      console.log("ready...........");

      toast.success("Download ready!", { id: loadingToast });
    } catch (error) {
      console.error("Error downloading images:", error);
      toast.error("Failed to download images.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Photo Evidence</h1>
        <p className="text-muted-foreground">
          Capture, upload, and manage construction progress photos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <ContractorPhotoEvidence
              projectsData={projectsData}
              tasksData={inProgressTasks}
              onPhotoClick={handlePhotoClick}
            /> */}

          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Photo Submissions
                  </CardTitle>
                  <Camera className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{photoList.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {projects.length} projects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Review
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      photoList.filter((p) => p.status === "pending_review")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting inspection
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Latest Uploads
                  </CardTitle>
                  <Upload className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      photoList.filter((p) => {
                        const today = new Date();
                        const photoDate = new Date(p.date);
                        const diffTime = Math.abs(
                          today.getTime() - photoDate.getTime()
                        );
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        );
                        return diffDays <= 1;
                      }).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In the last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div>
              <Tabs defaultValue="all" onValueChange={setStatusFilter}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Photos</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="pending_review">
                    Pending Review
                  </TabsTrigger>
                </TabsList>

                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                  <div className="flex flex-1 items-center space-x-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search photo evidence..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select
                      value={projectFilter}
                      onValueChange={setProjectFilter}
                    >
                      <SelectTrigger className="w-fit">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>{projectFilter || "Project"}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-fit">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>
                            {categoryFilter
                              ? CONSTRUCTION_PHASES[
                                  categoryFilter as keyof typeof CONSTRUCTION_PHASES
                                ]?.title || categoryFilter
                              : "Category"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(CONSTRUCTION_PHASES).map(
                          ([key, phase]) => (
                            <SelectItem key={key} value={key}>
                              {phase.title}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Photos
                        </Button>
                      </DialogTrigger>
                      <UploadEvidenceDialog
                        onOpenChange={setDialogOpen}
                        projects={projectsData}
                        tasks={tasksData}
                        onSubmit={handlePhotoUpload}
                      /> 
                    </Dialog> */}
                </div>

                {/* Photos Table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title & Task</TableHead>
                        <TableHead>Project / Unit</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Photos</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPhotos.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-6 text-muted-foreground"
                          >
                            No photo evidence found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPhotos.map((photo) => (
                          <TableRow key={photo.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{photo.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {photo.task}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  <span className="font-medium">Category:</span>{" "}
                                  {CONSTRUCTION_PHASES[
                                    photo.category as keyof typeof CONSTRUCTION_PHASES
                                  ]?.title || photo.category}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{photo.project}</div>
                                <div className="text-xs text-muted-foreground">
                                  {photo.unit}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(photo.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={statusColors[photo.status]}
                              >
                                {photo.status
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {photo.images.slice(0, 2).map((image, idx) => (
                                  <div
                                    key={idx}
                                    className="w-10 h-10 rounded overflow-hidden"
                                  >
                                    <img
                                      src={image.url}
                                      alt={image.caption}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                                {photo.images.length > 2 && (
                                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-xs font-medium">
                                    +{photo.images.length - 2}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => viewPhotoDetails(photo.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem>
                                      Add More Photos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Edit Details
                                    </DropdownMenuItem> */}
                                  <DropdownMenuItem
                                    onClick={() => downloadAllImages(photo)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download All
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
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={photoDetailsOpen} onOpenChange={setPhotoDetailsOpen}>
        <PhotoDetailsDialog
          onOpenChange={setPhotoDetailsOpen}
          photoEvidence={selectedPhoto}
        />
      </Dialog>
    </div>
  );
};

export default ContractorPhotoEvidencePage;
