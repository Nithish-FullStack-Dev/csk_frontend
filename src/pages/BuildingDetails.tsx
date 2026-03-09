import { useState, useEffect, useMemo } from "react";
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
  Calendar,
  PercentIcon,
  Building,
} from "lucide-react";
import { FloorUnit } from "@/types/building";
import { useAuth } from "@/contexts/AuthContext";
import { BuildingDialog } from "@/components/properties/BuildingDialog";
import { FloorDialog } from "@/components/properties/FloorDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";
import {
  createFloor,
  deleteFloor,
  getBuildingById,
  getFloorsByBuildingId,
  updateFloor,
} from "@/utils/public/Config";
import BulkFloorGenerator from "./Properties/BulkFloorGenerator";
import BulkCsvUploader from "./Properties/BulkCsvUploader";
import { Progress } from "@radix-ui/react-progress";
import { getImageUrl } from "@/lib/image";

const BuildingDetails = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [openFloorId, setOpenFloorId] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
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
    projectName?: string | null,
  ) => {
    e.stopPropagation();
    if (!url) return toast.error("No brochure available");

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${projectName || "brochure"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download brochure");
    }
  };
  const { data: allUnits = [], isLoading: unitsLoading } = useQuery({
    queryKey: ["all-units", buildingId],
    queryFn: async () => {
      const responses = await Promise.all(
        (floors || []).map((floor) =>
          axios.get(
            `${import.meta.env.VITE_URL}/api/unit/getUnitsByFloorIdAndBuildingId/${buildingId}/${floor._id}`,
            { withCredentials: true },
          ),
        ),
      );

      return responses.flatMap((res) => res.data?.data || []);
    },
    enabled: !!floors && floors.length > 0,
  });
  const unitProgressQueries = useQueries({
    queries: (allUnits || []).map((unit: any) => ({
      queryKey: ["unit-project-full", unit._id],
      queryFn: async () => {
        const floorId =
          typeof unit.floorId === "object" ? unit.floorId?._id : unit.floorId;

        if (!buildingId || !floorId) return null;

        // 1️⃣ Get project details + tasks
        const { data: projectRes } = await axios.get(
          `${import.meta.env.VITE_URL}/api/project/units/${buildingId}/${unit._id}/completed-tasks`,
          { withCredentials: true },
        );

        // 2️⃣ Get overall progress
        const { data: progressRes } = await axios.get(
          `${import.meta.env.VITE_URL}/api/project/getProject/${buildingId}/${floorId}/${unit._id}/unit-progress`,
          { withCredentials: true },
        );

        return {
          unitId: unit._id,
          overallProgress: progressRes?.data?.overallProgress || 0,
          projectDetails: projectRes?.data?.projectDetails || null,
          completedTasks: projectRes?.data?.completedTasks || [],
        };
      },
      enabled: !!buildingId && !!unit.floorId,
    })),
  });
  const progressMap = useMemo(() => {
    const map: Record<string, any> = {};
    unitProgressQueries.forEach((query) => {
      if (query.data) {
        map[query.data.unitId] = query.data;
      }
    });
    return map;
  }, [unitProgressQueries]);
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
      queryClient.invalidateQueries({ queryKey: ["building", buildingId] });
    },

    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to add floor";

      toast.error(msg);
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
      queryClient.invalidateQueries({ queryKey: ["building", buildingId] });
    },

    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update floor";

      toast.error(msg);
    },
  });

  const deleteFloorMutation = useMutation({
    mutationFn: deleteFloor,
    onSuccess: (data) => {
      toast.success(data.message || "Floor/Unit deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["floors", buildingId] });
      queryClient.invalidateQueries({ queryKey: ["building", buildingId] });
    },

    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete floor");
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/api/building/deleteBuilding/${id}`,
        {
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: async (data) => {
      toast.success(data?.message || "Building deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["buildings"] });
      await queryClient.invalidateQueries({ queryKey: ["trash-buildings"] });
      // await queryClient.refetchQueries({ queryKey: ["buildings"] });
      navigate("/properties");
    },
    onError: (error: any) => {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : error.message,
      );
    },
  });

  if (buildError) {
    toast.error(buildErr?.message || "Failed to fetch building");
  }
  if (floorsError) {
    toast.error(floorsErr?.message || "Failed to fetch floors");
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
    if (!data.unitType?.trim()) {
      toast.error("Unit type is required");
      return;
    }

    if (!data.floorNumber || data.floorNumber < 1) {
      toast.error("Valid floor number required");
      return;
    }

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
                  src={getImageUrl(building.thumbnailUrl)}
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

              {/* {building.brochureUrl && (
                <Button variant="outline" asChild className="mt-4">
                  <a
                    // href={building.brochureUrl}
                    onClick={(e) =>
                      handleDownload(
                        e,
                        building.brochureUrl,
                        building.projectName,
                      )
                    }
                    // target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Download Project Brochure
                  </a>
                </Button>
              )} */}

              {building?.amenities && building?.amenities.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-500" />{" "}
                      Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {building.amenities.map((amenity, idx) => (
                        <Badge
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                <div className="flex gap-2">
                  <Button onClick={handleAddFloor}>
                    <Plus className="mr-2 h-4 w-4" /> Add Floor/Unit
                  </Button>

                  <Button onClick={() => setBulkDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Bulk Generator
                  </Button>
                  <Button onClick={() => setCsvOpen(true)}>Upload CSV</Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4">
              {(floors || [])
                .slice()
                .sort((a, b) => a.floorNumber - b.floorNumber)
                .map((floor, idx) => (
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
                                  onClick={(e) =>
                                    handleDeleteFloor(floor._id, e)
                                  }
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
                              `/properties/building/${buildingId}/floor/${floor._id}`,
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
        {/* Construction Overview */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Construction Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {unitsLoading && (
              <p className="text-muted-foreground">
                Loading construction data...
              </p>
            )}

            {/* Floors Accordion */}
            <div className="space-y-4">
              {(floors || []).map((floor) => {
                const isOpen = openFloorId === floor._id;

                const floorUnits = allUnits.filter((u: any) => {
                  const unitFloorId =
                    typeof u.floorId === "object" ? u.floorId?._id : u.floorId;
                  return unitFloorId === floor._id;
                });

                return (
                  <div
                    key={floor._id}
                    className="border rounded-2xl bg-white shadow-sm transition-all"
                  >
                    {/* Floor Header */}
                    <button
                      onClick={() => setOpenFloorId(isOpen ? null : floor._id)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          Floor {floor.floorNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {floorUnits.length} units
                        </span>
                      </div>

                      <ChevronLeft
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isOpen ? "rotate-90" : "-rotate-90"
                        }`}
                      />
                    </button>

                    {/* Animated Content */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isOpen
                          ? "max-h-[2000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {floorUnits.map((unit: any) => {
                            const project = progressMap[unit._id];

                            const latestTask = project?.completedTasks?.length
                              ? [...project.completedTasks].sort(
                                  (a: any, b: any) =>
                                    new Date(
                                      b.submittedOn || b.updatedAt,
                                    ).getTime() -
                                    new Date(
                                      a.submittedOn || a.updatedAt,
                                    ).getTime(),
                                )[0]
                              : null;

                            return (
                              <div
                                key={unit._id}
                                className="border rounded-2xl p-4 bg-muted/30 hover:bg-muted/40 transition-all"
                              >
                                {/* Header */}
                                <div className="flex justify-between mb-3">
                                  <h4 className="font-semibold text-sm">
                                    Unit {unit.plotNo}
                                  </h4>
                                  <Badge className="bg-blue-600 text-white text-xs">
                                    {project?.overallProgress || 0}%
                                  </Badge>
                                </div>

                                {latestTask && (
                                  <div className="mb-3">
                                    <p className="text-[11px] text-muted-foreground">
                                      Latest Task
                                    </p>
                                    <p className="text-sm font-medium truncate">
                                      {latestTask.title}
                                    </p>
                                  </div>
                                )}

                                <div className="mb-3">
                                  <p className="text-[11px] text-muted-foreground">
                                    Site Incharge
                                  </p>
                                  <p className="text-sm font-medium">
                                    {project?.projectDetails?.siteIncharge
                                      ?.name || "N/A"}
                                  </p>
                                </div>

                                <div className="mb-4">
                                  <p className="text-[11px] text-muted-foreground">
                                    Contractors
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {project?.projectDetails?.contractors?.map(
                                      (c: any) => (
                                        <Badge
                                          key={c._id}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {c.name}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>

                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{
                                      width: `${project?.overallProgress || 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                {building?.images?.map((img, index) => (
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
                      src={getImageUrl(img)}
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
                      src={getImageUrl(selectedImage)}
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
                  src={building?.googleMapsLocation || ""}
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
      <BulkFloorGenerator
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        buildingId={buildingId!}
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
      <BulkCsvUploader
        open={csvOpen}
        onOpenChange={setCsvOpen}
        buildingId={buildingId!}
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
