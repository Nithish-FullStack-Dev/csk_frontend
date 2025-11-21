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
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PhotoEvidence,
  useTasksForPhotoEvidenceList,
} from "@/utils/contractor/ContractorConfig";

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-amber-100 text-amber-800",
  pending_review: "bg-blue-100 text-blue-800",
};

const ContractorPhotoEvidencePage = () => {
  const { data: photoList = [], isLoading } = useTasksForPhotoEvidenceList();
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoEvidence[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [photoDetailsOpen, setPhotoDetailsOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEvidence | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoEvidence | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handlePhotoClick = (photo: PhotoEvidence) => {
    setSelectedPhoto(photo);
    setPhotoDetailsOpen(true);
  };

  // Fixed: onSubmit now matches UploadEvidenceDialog expected type
  const handlePhotoUpload = (newEvidence: any) => {
    setDialogOpen(false);
    toast.success("Photo uploaded successfully");
  };

  const viewPhotoDetails = (photoId: string) => {
    const photo = photoList.find((p) => p._id === photoId || p._id === photoId);
    if (photo) handlePhotoClick(photo as PhotoEvidence);
  };

  const downloadAllImages = async (photo: PhotoEvidence) => {
    const loadingToast = toast.loading(
      `Preparing download for "${photo.title}"...`
    );
    try {
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
      toast.success("Download ready!", { id: loadingToast });
    } catch (error) {
      console.error("Error downloading images:", error);
      toast.error("Failed to download images.", { id: loadingToast });
    }
  };

  const openEditDialog = (photo: PhotoEvidence) => {
    setEditingPhoto({
      ...photo,
      category: photo.category || "",
      status: photo.status || "in_progress",
      title: photo.title || "",
      notes: photo.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedFields: {
    title: string;
    category: string;
    status: string;
    notes?: string;
  }) => {
    if (!editingPhoto) return;

    setSavingEdit(true);
    const projectId = editingPhoto.projectId;
    const taskId = editingPhoto._id;

    const payload: any = {
      evidenceTitleByContractor: updatedFields.title,
      constructionPhase: updatedFields.category,
      status: updatedFields.status,
      noteBySiteIncharge: updatedFields.notes || undefined,
    };

    try {
      if (projectId && taskId) {
        await axios.patch(
          `${
            import.meta.env.VITE_URL
          }/api/project/contractor/${projectId}/${taskId}/task`,
          payload,
          { withCredentials: true }
        );
        toast.success("Details updated successfully");
      } else {
        toast.warning("Updated locally (no projectId to persist to server).");
      }
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to update task on server:", err);
      toast.error("Failed to update on server — changes saved locally.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div>Loading photo evidence...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 md:p-8 p-2">
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
            <div className="space-y-6">
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

              <div>
                <div className="md:hidden mb-4">
                  <Select defaultValue="all" onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Photos</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending_review">
                        Pending Review
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="all" onValueChange={setStatusFilter}>
                  <TabsList className="hidden md:inline-block mb-4">
                    <TabsTrigger value="all">All Photos</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                    <TabsTrigger value="pending_review">
                      Pending Review
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div className="flex flex-1 items-center space-x-2 md:flex-row flex-col gap-5">
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

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Photos
                        </Button>
                      </DialogTrigger>
                      <UploadEvidenceDialog
                        onOpenChange={setDialogOpen}
                        onSubmit={handlePhotoUpload}
                      />
                    </Dialog>
                  </div>

                  <div className="border rounded-md">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title & Task</TableHead>
                            <TableHead>Project / Unit</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Photos</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
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
                              <TableRow key={photo._id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {photo.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {photo.task}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      <span className="font-medium">
                                        Category:
                                      </span>{" "}
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
                                      {photo.floorNumber
                                        ? `Floor: ${photo.floorNumber} `
                                        : ""}{" "}
                                      |{" "}
                                      {photo.plotNo
                                        ? `Plot: ${photo.plotNo}`
                                        : "N/A"}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  Deadline:{" "}
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
                                        (w) =>
                                          w.charAt(0).toUpperCase() + w.slice(1)
                                      )
                                      .join(" ")}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {photo.images
                                      .slice(0, 2)
                                      .map((image, idx) => (
                                        <div
                                          key={idx}
                                          className="w-10 h-10 rounded overflow-hidden"
                                        >
                                          <img
                                            src={image.url}
                                            alt=""
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
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          viewPhotoDetails(photo._id)
                                        }
                                      >
                                        <Eye className="h-4 w-4 mr-2" /> View
                                        Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        Add More Photos
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => openEditDialog(photo)}
                                      >
                                        Edit Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => downloadAllImages(photo)}
                                      >
                                        <Download className="h-4 w-4 mr-2" />{" "}
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

                    {/* Mobile cards unchanged except using photo._id as key */}
                    <div className="block md:hidden">
                      {filteredPhotos.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          No photo evidence found matching your filters
                        </div>
                      ) : (
                        <div className="space-y-4 p-2">
                          {filteredPhotos.map((photo) => (
                            <div
                              key={photo._id}
                              className="border rounded-lg p-4 shadow-sm bg-white"
                            >
                              {/* Title & Task */}
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

                              {/* Project / Unit */}
                              <div className="mt-2">
                                <div>{photo.project}</div>
                                <div className="text-xs text-muted-foreground">
                                  {photo?.floorNumber
                                    ? `Floor: ${photo.floorNumber} `
                                    : ""}
                                  {photo?.plotNo
                                    ? `| Plot: ${photo.plotNo} `
                                    : ""}
                                </div>
                              </div>

                              {/* Date & Status */}
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-sm">
                                  Deadline:{" "}
                                  {new Date(photo.date).toLocaleDateString()}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={statusColors[photo.status]}
                                >
                                  {photo.status
                                    .split("_")
                                    .map(
                                      (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                </Badge>
                              </div>

                              {/* Photos */}
                              <div className="mt-2 flex items-center gap-1">
                                {photo.images
                                  .slice(0, 2)
                                  .map((image: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="w-12 h-12 rounded overflow-hidden"
                                    >
                                      <img
                                        src={image.url}
                                        alt={image.caption}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                {photo.images.length > 2 && (
                                  <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-xs font-medium">
                                    +{photo.images.length - 2}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="mt-3 flex justify-end">
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
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        viewPhotoDetails(photo._id)
                                      }
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(photo)}
                                    >
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => downloadAllImages(photo)}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download All
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="md:w-[650px] w-[90vw] max-h-[80vh] overflow-y-scroll rounded-xl">
            <DialogHeader>
              <DialogTitle>Edit Evidence Details</DialogTitle>
              <DialogDescription>
                Update title, phase, status or notes for this evidence.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4  px-4 sm:px-6">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingPhoto?.title || ""}
                  onChange={(e) =>
                    setEditingPhoto((prev) => ({
                      ...prev!,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Construction Phase</Label>
                <Select
                  value={editingPhoto?.category || ""}
                  onValueChange={(val) =>
                    setEditingPhoto((prev) => ({ ...prev!, category: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select construction phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONSTRUCTION_PHASES).map(([key, phase]) => (
                      <SelectItem key={key} value={key}>
                        {phase.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editingPhoto?.status || "in_progress"}
                  onValueChange={(val) =>
                    setEditingPhoto((prev) => ({ ...prev!, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending_review">
                      Pending Review
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingPhoto?.notes || ""}
                  onChange={(e) =>
                    setEditingPhoto((prev) => ({
                      ...prev!,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Project</Label>
                  <div className="p-2 rounded border">
                    {editingPhoto?.project}
                  </div>
                </div>
                <div>
                  <Label>Floor Number</Label>
                  <div className="p-2 rounded border">
                    {editingPhoto?.floorNumber || "N/A"}
                  </div>
                </div>
                <div>
                  <Label>Unit Plot No</Label>
                  <div className="p-2 rounded border">
                    {editingPhoto?.plotNo}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingPhoto(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleSaveEdit({
                    title: editingPhoto?.title || "",
                    category: editingPhoto?.category || "",
                    status: editingPhoto?.status || "in_progress",
                    notes: editingPhoto?.notes || "",
                  })
                }
                disabled={savingEdit}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ContractorPhotoEvidencePage;
