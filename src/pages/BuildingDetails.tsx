import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Building2,
  MapPin,
  Home,
  Layers,
  CalendarClock,
  Check,
  X,
  Map,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Edit,
  GalleryThumbnails,
  Image,
} from "lucide-react";
import { Building, FloorUnit } from "@/types/building";
import { useAuth } from "@/contexts/AuthContext";
import { BuildingDialog } from "@/components/properties/BuildingDialog";
import { FloorDialog } from "@/components/properties/FloorDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";
import {
  createFloor,
  deleteFloor,
  getBuildingById,
  getFloorsByBuildingId,
  updateFloor,
} from "@/utils/public/Config";

const BuildingDetails = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch floors
  const {
    data: floors,
    isLoading: floorsLoading,
    isError: floorsError,
    error: floorsErr,
  } = useQuery<FloorUnit[]>({
    queryKey: ["floors", buildingId],
    queryFn: () => getFloorsByBuildingId(buildingId!),
    enabled: !!buildingId,
  });
  const handleDownload = async (
    e: React.MouseEvent,
    url?: string | null,
    projectName?: string | null
  ) => {
    e.stopPropagation();
    if (!url) return toast.error("No brochure available to download.");

    try {
      const API_BASE = import.meta.env.VITE_URL || "http://localhost:3000";
      const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
        url
      )}&filename=${encodeURIComponent(projectName || "brochure")}`;

      window.open(proxyUrl, "_blank");
      toast.success("Download starting...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download brochure.");
    }
  };
  const {
    data: building,
    isLoading: buildingLoading,
    isError: buildError,
    error: buildErr,
  } = useQuery({
    queryKey: ["building", buildingId],
    queryFn: () => getBuildingById(buildingId!),
    enabled: !!buildingId,
  });

  // Dialog states
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [floorDialogOpen, setFloorDialogOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<FloorUnit | undefined>();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "building" | "floor";
    id: string;
  } | null>(null);

  const canEdit = user && ["owner", "admin"].includes(user.role);

  // Mutations for floors
  const createFloorMutation = useMutation({
    mutationFn: createFloor,
    onSuccess: (data) => {
      toast.success(data.message || "Floor/Unit added successfully");
      queryClient.invalidateQueries({ queryKey: ["floors", buildingId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add floor");
    },
  });

  const updateFloorMutation = useMutation({
    mutationFn: ({
      floorId,
      payload,
    }: {
      floorId: string;
      payload: FormData;
    }) => updateFloor(floorId, payload),
    onSuccess: (data) => {
      toast.success(data.message || "Floor/Unit updated successfully");
      queryClient.invalidateQueries({ queryKey: ["floors", buildingId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update floor");
    },
  });

  const deleteFloorMutation = useMutation({
    mutationFn: deleteFloor,
    onSuccess: (data) => {
      toast.success(data.message || "Floor/Unit deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["floors", buildingId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete floor");
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/building/deleteBuilding/${id}`,
        {
          withCredentials: true,
        }
      ),
    onSuccess: async () => {
      toast.success("Building deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["buildings"] });
      await queryClient.refetchQueries({ queryKey: ["buildings"] });
      navigate("/properties");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete building");
    },
  });

  if (buildError) {
    toast.error(buildErr?.message || "Failed to fetch building");
    console.log("Failed to fetch building", buildErr);
  }
  if (floorsError) {
    toast.error(floorsErr?.message || "Failed to fetch floors");
    console.log("Failed to fetch floors", floorsErr);
  }

  // Loading state
  if (floorsLoading || buildingLoading) {
    return <Loader />;
  }

  // Building not found
  if (!building) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Building not found</h3>
          <Button onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Building actions
  const handleEditBuilding = () => setBuildingDialogOpen(true);
  const handleDeleteBuilding = () => {
    setDeleteTarget({ type: "building", id: buildingId! });
    setDeleteDialogOpen(true);
  };

  // Floor actions
  const handleAddFloor = () => {
    setSelectedFloor(undefined);
    setDialogMode("add");
    setFloorDialogOpen(true);
  };

  const handleEditFloor = (floor: FloorUnit, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFloor(floor);
    setDialogMode("edit");
    setFloorDialogOpen(true);
  };

  const handleDeleteFloor = (floorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ type: "floor", id: floorId });
    setDeleteDialogOpen(true);
  };

  const handleFloorSave = (data: FloorUnit, mode: "add" | "edit") => {
    const payload = new FormData();
    payload.append("buildingId", buildingId!);
    payload.append("floorNumber", data.floorNumber.toString());
    payload.append("unitType", data.unitType);
    payload.append("totalSubUnits", data.totalSubUnits.toString());
    payload.append("availableSubUnits", data.availableSubUnits.toString());

    if (mode === "add") {
      createFloorMutation.mutate(payload);
    } else {
      updateFloorMutation.mutate({ floorId: data._id, payload });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget?.type === "building") {
      deleteBuildingMutation.mutate(deleteTarget.id);
    } else if (deleteTarget?.type === "floor") {
      deleteFloorMutation.mutate(deleteTarget.id);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleSuccessfulSave = () => {
    queryClient.invalidateQueries({ queryKey: ["building", buildingId] });
    queryClient.invalidateQueries({ queryKey: ["buildings"] });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between md:items-center items-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/properties")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Buildings
          </Button>

          {canEdit && (
            <div className="flex gap-2 md:flex-row flex-col">
              <Button variant="outline" onClick={handleEditBuilding}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={handleDeleteBuilding}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </div>

        {/* Building Info */}
        <Card>
          <div className="flex flex-col md:flex-row">
            {building.thumbnailUrl && (
              <div className="md:w-1/3">
                <img
                  src={building.thumbnailUrl}
                  alt={building.projectName}
                  className="h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
            )}
            <div className="p-6 flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {building.projectName}
              </h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" /> {building.location}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Floors</p>
                  <p className="text-xl font-semibold text-purple-600">
                    {(floors || []).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="text-xl font-semibold">{building.totalUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-xl font-semibold text-green-600">
                    {building.availableUnits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="text-xl font-semibold text-blue-600">
                    {building.soldUnits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-green-500 text-white">
                    {building.constructionStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
                  {building.propertyType}
                </div>
                <div className="flex items-center">
                  <CalendarClock className="h-5 w-5 mr-2 text-muted-foreground" />
                  Completed:{" "}
                  {building.completionDate
                    ? new Date(building.completionDate).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="flex items-center">
                  {building.municipalPermission ? (
                    <>
                      <Check className="h-5 w-5 mr-2 text-green-500" />{" "}
                      Municipal Permission
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 mr-2 text-red-500" /> Awaiting
                      Permission
                    </>
                  )}
                </div>
              </div>

              {building.description && (
                <p className="mt-4 text-muted-foreground">
                  {building.description}
                </p>
              )}

              {building.brochureUrl && (
                <Button variant="outline" asChild className="mt-4">
                  <a
                    // href={building.brochureUrl}
                    onClick={(e) =>
                      handleDownload(
                        e,
                        building.brochureUrl,
                        building.projectName
                      )
                    }
                    // target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Download Project
                    Brochure
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Floors/Units */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Layers className="mr-2 h-5 w-5" /> Floors & Units
              </CardTitle>
              {canEdit && (
                <Button onClick={handleAddFloor}>
                  <Plus className="mr-2 h-4 w-4" /> Add Floor/Unit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4">
              {(floors || []).map((floor, idx) => (
                <Card
                  key={floor._id || idx}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Home className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">
                              Floor {floor.floorNumber} - {floor.unitType}
                            </h3>
                          </div>
                          {canEdit && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleEditFloor(floor, e)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDeleteFloor(floor._id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            Total Units:{" "}
                            <span className="font-medium">
                              {floor.totalSubUnits}
                            </span>
                          </div>
                          <div>
                            Available:{" "}
                            <span className="font-medium text-green-600">
                              {floor.availableSubUnits}
                            </span>
                          </div>
                          <div>
                            Sold:{" "}
                            <span className="font-medium text-blue-600">
                              {floor.totalSubUnits - floor.availableSubUnits}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          navigate(
                            `/properties/building/${buildingId}/floor/${floor._id}`
                          )
                        }
                      >
                        View Units
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!floors || floors.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No floors found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        {building?.images?.length > 0 && (
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle>
                <Image className="w-5 h-5 mr-2 inline" /> Gallery
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {building.images.map((img, index) => (
                  <div
                    key={index}
                    className={`
                        relative group overflow-hidden cursor-pointer rounded-lg
                        ${
                          index === 0
                            ? "col-span-2 md:col-span-2 row-span-2"
                            : "h-40"
                        }
                      `}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img}
                      alt={`Building Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        View Image
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fullscreen Lightbox */}
              {selectedImage && (
                <div
                  className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <div
                    className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-10 right-0 text-white hover:text-red-400 transition"
                    >
                      <X className="h-8 w-8" />
                    </button>

                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-auto max-w-full h-auto max-h-[80vh] rounded-lg shadow-lg object-contain"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map */}
        {building?.googleMapsLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-64 overflow-hidden rounded-lg">
                <iframe
                  src={building?.googleMapsLocation}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                ></iframe>
              </div>

              <p className="mt-4 text-center text-blue-600 hover:underline cursor-pointer">
                <a
                  href={building?.googleMapsLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <BuildingDialog
        open={buildingDialogOpen}
        onOpenChange={setBuildingDialogOpen}
        building={building}
        mode="edit"
        onSuccessfulSave={handleSuccessfulSave}
      />

      <FloorDialog
        open={floorDialogOpen}
        onOpenChange={setFloorDialogOpen}
        floor={selectedFloor}
        buildingId={buildingId!}
        mode={dialogMode}
        onSave={handleFloorSave}
        isSaving={
          createFloorMutation.isPending || updateFloorMutation.isPending
        }
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={
          deleteTarget?.type === "building"
            ? "Delete Building"
            : "Delete Floor/Unit"
        }
        description={
          deleteTarget?.type === "building"
            ? "Are you sure you want to delete this building? This action cannot be undone."
            : "Are you sure you want to delete this floor/unit? This action cannot be undone."
        }
      />
    </MainLayout>
  );
};

export default BuildingDetails;
