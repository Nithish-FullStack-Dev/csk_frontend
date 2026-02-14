"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Edit,
  Trash,
  Building,
  FileText,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InnerPlot } from "@/types/InnerPlot";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInnerPlots, deleteInnerPlot } from "@/api/innerPlot.api";
import MainLayout from "../layout/MainLayout";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { InnerPlotForm } from "./InnerPlotForm";
import { EditInnerPlotForm } from "./EditInnerPlotForm";

/* ---------- STATUS BADGE ---------- */
export function getInnerPlotStatusBadge(status: string) {
  const colors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    Blocked: "bg-red-500",
  };

  return (
    <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>
      {status}
    </Badge>
  );
}

export function InnerPlotDetails() {
  const { openPlotId } = useParams<{ openPlotId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canEdit = user && ["owner", "admin"].includes(user.role);

  /* ---------- FETCH INNER PLOTS ---------- */
  const {
    data: plots = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["innerPlots", openPlotId],
    queryFn: () => getInnerPlots(openPlotId!),
    enabled: !!openPlotId,
  });

  /* assuming details view shows one inner plot at a time */
  const plot: InnerPlot | undefined = plots[0];

  /* ---------- STATE ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  /* ---------- DELETE ---------- */
  const deleteMutation = useMutation({
    mutationFn: deleteInnerPlot,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["innerPlots", openPlotId],
      });
      navigate(-1);
    },
  });

  /* ---------- GALLERY ---------- */
  const galleryImages = useMemo(() => {
    if (!plot) return [];
    const imgs = new Set<string>(plot.images || []);
    if (plot.thumbnailUrl) imgs.add(plot.thumbnailUrl);
    return Array.from(imgs);
  }, [plot]);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !plot) return <p>Inner plot not found</p>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ---------- TOP BAR ---------- */}
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Inner Plots
          </Button>

          {canEdit && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </div>

        {/* ---------- BASIC INFO ---------- */}
        <Card>
          <div className="flex flex-col md:flex-row">
            {plot.thumbnailUrl && (
              <div className="md:w-1/3">
                <img
                  src={plot.thumbnailUrl}
                  alt={`Plot ${plot.plotNo}`}
                  className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
            )}

            <div className={`${plot.thumbnailUrl ? "md:w-2/3" : "w-full"} p-6`}>
              <h2 className="text-2xl font-bold mb-1">
                Inner Plot – {plot.plotNo}
              </h2>
              {getInnerPlotStatusBadge(plot.status)}
              <p className="text-muted-foreground mt-1">
                Plot Type: {plot.plotType}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  Area: {plot.area}
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  Facing: {plot.facing || "N/A"}
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  Road Width: {plot.roadWidthFt ?? "N/A"} ft
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  Wastage Area: {plot.wastageArea || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ---------- REMARKS ---------- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Remarks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
            {plot.remarks || "No remarks available"}
          </CardContent>
        </Card>

        {/* ---------- GALLERY ---------- */}
        {galleryImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" /> Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 auto-rows-[150px]">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrentImage(img);
                      setLightboxOpen(true);
                    }}
                    className={`cursor-pointer overflow-hidden rounded-lg ${
                      i % 5 === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover hover:scale-110 transition"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------- DELETE DIALOG ---------- */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this inner plot?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(plot._id)}
                disabled={deleteMutation.isPending}
              >
                Delete Plot
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ---------- LIGHTBOX ---------- */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl h-[80vh] p-0">
            <img src={currentImage} className="w-full h-full object-contain" />
          </DialogContent>
        </Dialog>

        {/* ---------- EDIT DIALOG ---------- */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Inner Plot</DialogTitle>
            </DialogHeader>

            <EditInnerPlotForm
              innerPlot={plot}
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: ["innerPlots", openPlotId],
                });
                setEditOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Inner Plot"
          description="Are you sure you want to delete this inner plot?"
          onConfirm={() => deleteMutation.mutate(plot._id)}
        />
      </div>
    </MainLayout>
  );
}
