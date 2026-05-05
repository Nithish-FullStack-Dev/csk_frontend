import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Search,
  MapPin,
  Calendar,
  Check,
  Plus,
  Pencil,
  Trash2,
  Download,
  X,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Building } from "@/types/building";
import { BuildingDialog } from "@/components/properties/BuildingDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";
import axios from "axios";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { OpenPlot } from "@/types/OpenPlots";
import { OpenPlotDialog } from "@/components/properties/OpenPlotsDialog";
import { getStatusBadge } from "@/components/properties/OpenPlotDetails";
import {
  getAllBuildings,
  useOPenLand,
  useOpenPlots,
} from "@/utils/buildings/Projects";
import { OpenLand } from "@/types/OpenLand";
import { OpenLandDialog } from "@/components/properties/OpenLandDialog";
import { useRBAC } from "@/config/RBAC";
import { getImageUrl } from "@/lib/image";
import { useAuth } from "@/contexts/AuthContext";
const fixImageUrl = (url?: string) => {
  if (!url) return "";
  return url.replace("/uploads/", "/api/uploads/");
};
const NewProperties = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "building" | "plot" | "land" | null
  >(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const [dialogOpenPlot, setDialogOpenPlot] = useState(false);
  const [currentOpenPlot, setCurrentOpenPlot] = useState<OpenPlot | undefined>(
    undefined,
  );
  const [restoreDialog, setRestoreDialog] = useState(false);

  const [filteredOpenPlots, setFilteredOpenPlots] = useState<OpenPlot[]>([]);
  const [filteredOpenLand, setFilteredOpenLand] = useState<OpenLand[]>([]);

  const [openLandDialog, setopenLandDialog] = useState(false);
  const [currentOpenLand, setCurrentOpenLand] = useState<OpenLand | undefined>(
    undefined,
  );
  const [restorePlotOpen, setRestorePlotOpen] = useState(false);
  const [restoreId, setRestoreId] = useState(null);
  const [restorePlotId, setRestorePlotId] = useState(null);

  const {
    data: buildings,
    isLoading: buildingsLoading,
    isError: buildError,
    error: buildErr,
  } = useQuery<Building[]>({
    queryKey: ["buildings"],
    queryFn: getAllBuildings,
    staleTime: 600000,
    placeholderData: keepPreviousData,
  });

  const {
    data: openPlots,
    isLoading: openPlotsLoading,
    isError: openPlotsError,
    error: openPlotsErr,
  } = useOpenPlots();

  const {
    data: openLandData,
    isLoading: openLandLoading,
    isError: openLandError,
    error: openLandErr,
  } = useOPenLand();

  const {
    isRolePermissionsLoading,
    userCanAddUser,
    userCanDeleteUser,
    userCanEditUser,
  } = useRBAC({ roleSubmodule: "Properties" });

  const deleteBuilding = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/building/deleteBuilding/${id}`,
        {
          withCredentials: true,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      toast.success("Building deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete building");
    },
  });

  const deleteOpenPlotMutation = useMutation({
    mutationFn: async () => {
      if (!currentOpenPlot) return;
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/openPlot/deleteOpenPlot/${
          currentOpenPlot._id
        }`,
        {
          withCredentials: true,
        },
      );
    },
    onSuccess: () => {
      toast.success("Open plot deleted");
      queryClient.invalidateQueries({ queryKey: ["openPlots"] });
    },
    onError: (err: any) => {
      console.error("deleteOpenPlot error:", err?.response || err);
      toast.error(err?.response?.data?.message || "Failed to delete open plot");
    },
  });

  const deleteOpenLandMutation = useMutation({
    mutationFn: async () => {
      if (!currentOpenLand) return;
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/openLand/deleteOpenLand/${
          currentOpenLand._id
        }`,
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      toast.success("Open land deleted");

      // optional but recommended
      setCurrentOpenLand(undefined);
      // setSelectedOpenLand(undefined);

      queryClient.invalidateQueries({ queryKey: ["openLand"] });
    },
    onError: (err: any) => {
      console.error("deleteOpenLand error:", err?.response || err);
      toast.error(err?.response?.data?.message || "Failed to delete open land");
    },
  });

  useEffect(() => {
    let results = (buildings || []).slice();
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(
        (b) =>
          (b.projectName || "").toLowerCase().includes(lower) ||
          (b.location || "").toLowerCase().includes(lower),
      );
    }
    if (typeFilter !== "all")
      results = results.filter(
        (b) =>
          (b.propertyType || "").toLowerCase().trim() ===
          typeFilter.toLowerCase().trim(),
      );
    if (statusFilter !== "all")
      results = results.filter((b) => b.constructionStatus === statusFilter);
    setFilteredBuildings(results);
  }, [searchTerm, typeFilter, statusFilter, buildings]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();

    let plotResults = (openPlots || []).slice();

    if (searchTerm) {
      plotResults = plotResults.filter(
        (p) =>
          (p.projectName || "").toLowerCase().includes(lower) ||
          (p.location || "").toLowerCase().includes(lower) ||
          (p.openPlotNo || "").toLowerCase().includes(lower),
      );
    }

    if (statusFilter !== "all") {
      plotResults = plotResults.filter((p) => p.status === statusFilter);
    }

    if (typeFilter !== "all") {
      if (typeFilter !== "Plot Development" && typeFilter !== "Open Plot") {
        plotResults = [];
      }
    }

    setFilteredOpenPlots(plotResults);

    let landResults = (openLandData || []).slice();

    if (searchTerm) {
      landResults = landResults.filter(
        (l) =>
          (l.projectName || "").toLowerCase().includes(lower) ||
          (l.location || "").toLowerCase().includes(lower) ||
          (l.surveyNumber || "").toLowerCase().includes(lower),
      );
    }

    if (statusFilter !== "all") {
      landResults = landResults.filter((l) => l.landStatus === statusFilter);
    }

    if (typeFilter !== "all") {
      if (typeFilter !== "Land Parcel") {
        landResults = [];
      }
    }

    setFilteredOpenLand(landResults);
  }, [searchTerm, typeFilter, statusFilter, openPlots, openLandData]);

  const restoreLandMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_URL}/api/openLand/restore/${id}`,
        {},
        { withCredentials: true },
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Open land restored");

      setRestoreId(null);
      setRestoreDialog(false);

      queryClient.invalidateQueries({ queryKey: ["openLand"] });
    },
    onError: (err) => {
      console.error("restored OpenLand error:", err);
      toast.error(
        axios.isAxiosError(err)
          ? err?.response?.data?.message || "Failed to delete open land"
          : err.message,
      );
    },
  });

  const restorePlotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_URL}/api/openPlot/restoreOpenplot/${id}`,
        {},
        { withCredentials: true },
      );
      return data;
    },

    onSuccess: (data) => {
      toast.success(data?.message || "Open plot restore successfully");
      queryClient.invalidateQueries({ queryKey: ["openPlots"] });
      setRestorePlotOpen(false);
      setRestorePlotId(null);
    },

    onError: (error) => {
      toast.error(
        axios.isAxiosError(error)
          ? error.response.data.message
          : "Failed to restore open plot",
      );
    },
  });

  if (openPlotsError) {
    toast.error((openPlotsErr as any)?.message || "Failed to fetch open plots");
    console.error(openPlotsErr);
  }
  if (openLandError) {
    toast.error((openLandErr as any)?.message || "Failed to fetch open lands");
    console.error(openLandErr);
  }
  if (buildError) {
    toast.error((buildErr as any)?.message || "Failed to fetch buildings");
    console.error(buildErr);
  }

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const handleAddBuildingWithType = (type: string) => {
    setSelectedBuilding({
      propertyType: type,
    } as Building);

    setDialogMode("add");
    setBuildingDialogOpen(true);
  };

  const handleEditBuilding = (building: Building, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBuilding(building);
    setDialogMode("edit");
    setBuildingDialogOpen(true);
  };

  const handleRestore = () => {
    if (!restoreId) return;
    restoreLandMutation.mutate(restoreId);
  };

  const handleDeleteConfirm = () => {
    if (!deleteType || !itemToDeleteId) return;

    if (deleteType === "building") {
      deleteBuilding.mutate(itemToDeleteId);
    }

    if (deleteType === "plot") {
      setCurrentOpenPlot(openPlots.find((p) => p._id === itemToDeleteId));
      deleteOpenPlotMutation.mutate();
    }

    if (deleteType === "land") {
      setCurrentOpenLand(openLandData?.find((l) => l._id === itemToDeleteId));
      deleteOpenLandMutation.mutate();
    }

    setDeleteDialogOpen(false);
    setItemToDeleteId(null);
    setDeleteType(null);
  };

  const handleSuccessfulSave = () => {
    queryClient.invalidateQueries({ queryKey: ["buildings"] });
  };

  const handleOpenLandSubmit = (savedLand: OpenLand) => {
    queryClient.setQueryData<OpenLand[]>(["openLand"], (old = []) => {
      const exists = old.some((l) => l._id === savedLand._id);

      if (exists) {
        // update case
        return old.map((l) => (l._id === savedLand._id ? savedLand : l));
      }

      // create case
      return [savedLand, ...old];
    });

    setCurrentOpenLand(savedLand);
    // setSelectedOpenLand(savedLand);
    setopenLandDialog(false);
  };

  const handlePlotRestore = () => {
    if (!restorePlotId) return;
    restorePlotMutation.mutate(restorePlotId);
  };

  const handleEditOpenPlot = (plot: OpenPlot, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentOpenPlot(plot);
    setDialogOpenPlot(true);
  };

  const handleEditOpenLand = (land: OpenLand, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentOpenLand(land);
    setopenLandDialog(true);
  };

  const openDeleteDialog = (
    type: "building" | "plot" | "land",
    id: string,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    setDeleteType(type);
    setItemToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDownload = async (
    e: React.MouseEvent,
    url: string,
    name?: string,
    id?: string,
  ) => {
    e.stopPropagation();

    if (!url) {
      toast.error("No brochure available");
      return;
    }

    try {
      setDownloadingId(id || null);
      const fixedUrl = url.replace("http://", "https://");

      const response = await fetch(fixedUrl);

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${name || "brochure"}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download brochure");
    } finally {
      setDownloadingId(null);
    }
  };

  if (
    buildingsLoading ||
    openPlotsLoading ||
    openLandLoading ||
    isRolePermissionsLoading
  ) {
    return <Loader />;
  }

  const canEdit = userCanEditUser;

  return (
    <MainLayout>
      <div className="space-y-6">
        <section>
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Building2 className="mr-2 h-7 w-7" />
                Properties
              </h1>
              <p className="text-muted-foreground">
                Manage buildings and view details
              </p>
            </div>

            {userCanAddUser && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
                <Button
                  className=""
                  onClick={() => {
                    setCurrentOpenLand(undefined);
                    setopenLandDialog(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Land
                </Button>

                <Button
                  className="bg-estate-tomato hover:bg-estate-tomato/90"
                  onClick={() => {
                    setCurrentOpenPlot(undefined);
                    setDialogOpenPlot(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Plot
                </Button>

                <Button
                  onClick={() => handleAddBuildingWithType("Villa Complex")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Villa
                </Button>

                <Button
                  onClick={() => handleAddBuildingWithType("Apartment Complex")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Apartment
                </Button>

                <Button onClick={() => handleAddBuildingWithType("Commercial")}>
                  <Plus className="mr-2 h-4 w-4" /> Add Commercial
                </Button>
              </div>
            )}
          </div>

          {/* Filters + Buildings Grid */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or location..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Apartment Complex">
                      Apartment Complex
                    </SelectItem>
                    <SelectItem value="Villa Complex">Villa Complex</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Land Parcel">Land Parcel</SelectItem>
                    <SelectItem value="Open Plot">Open Plot</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Under Construction">
                      Under Construction
                    </SelectItem>
                    <SelectItem value="Planned">Planned</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm !== "" ||
                  typeFilter !== "all" ||
                  statusFilter !== "all") && (
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" /> Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Property</h2>
              <div />
            </div>

            <Card>
              <CardContent className="p-6">
                {filteredBuildings.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">
                      No Property found
                    </h3>
                    {user?.role === "customer_purchased" ? (
                      <p className="text-muted-foreground">
                        No properties found for your account.
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        No properties available. Please add a new property using
                        the button above.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuildings.map((b, idx) => (
                      <Card
                        key={b._id || idx}
                        className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                      >
                        <div className="relative">
                          {b.thumbnailUrl ? (
                            <img
                              src={getImageUrl(b.thumbnailUrl)}
                              alt={b.projectName}
                              className="h-48 w-full object-cover"
                            />
                          ) : (
                            <div className="h-48 bg-muted flex items-center justify-center">
                              <Building2 className="h-10 w-10 opacity-20" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(b.constructionStatus)}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-lg">
                              {b.projectName}
                            </h3>
                            <div
                              className="flex gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {canEdit && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => handleEditBuilding(b, e)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {userCanDeleteUser && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) =>
                                    openDeleteDialog("building", b._id!, e)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4 mr-1" /> {b.location}
                          </div>

                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between">
                              <span>Total Units</span>
                              <span>{b.totalUnits}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Available</span>
                              <span className="text-green-600">
                                {b.availableUnits}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sold</span>
                              <span className="text-blue-600">
                                {b.soldUnits}
                              </span>
                            </div>
                          </div>

                          <div className="border-t pt-3 text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" /> Completion
                              </span>
                              <span>
                                {new Date(
                                  b.completionDate,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Municipal</span>
                              {b.municipalPermission ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>

                            {/* RERA Status */}
                            <div className="flex justify-between mt-2">
                              <span>RERA Approved</span>
                              {b.reraApproved ? (
                                <div className="flex items-center space-x-2">
                                  <Check className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-medium">
                                    {b.reraNumber || "N/A"}
                                  </span>
                                </div>
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                navigate(`/properties/building/${b?._id}`)
                              }
                            >
                              View More
                            </Button>
                            {b?.brochureUrl && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) =>
                                    handleDownload(
                                      e,
                                      b?.brochureUrl!,
                                      b?.projectName,
                                      b._id,
                                    )
                                  }
                                  disabled={downloadingId === b._id}
                                  title="Download Brochure"
                                >
                                  {downloadingId === b._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                                {/* <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) =>
                                  handleShare(e, b.brochureUrl!, b.projectName)
                                }
                                title="Copy Share Link"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button> */}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ---------- Open Plots Section ---------- */}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Open Plots</h2>
              <div />
            </div>

            <Card>
              <CardContent className="p-6">
                {filteredOpenPlots.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">
                      No open plots found
                    </h3>
                    {user?.role === "customer_purchased" ? (
                      <p className="text-muted-foreground">
                        No open plot found for your account.
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        No open plot available. Please add a new open plot using
                        the button above.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOpenPlots.map((plot) => {
                      const isUserDeleted = plot?.isDeleted === true;
                      return (
                        <Card
                          className={`overflow-hidden hover:shadow-lg transition cursor-pointer ${
                            isUserDeleted ? "opacity-60" : "hover:bg-muted/30"
                          }`}
                          key={plot._id}
                          onClick={() =>
                            navigate(`/properties/openplot/${plot._id}`)
                          }
                        >
                          {/* ---------- THUMBNAIL ---------- */}
                          <div className="relative">
                            {plot.thumbnailUrl ? (
                              <img
                                src={plot.thumbnailUrl}
                                alt={plot.projectName}
                                className="h-48 w-full object-cover"
                              />
                            ) : (
                              <div className="h-48 bg-muted flex items-center justify-center">
                                <Building2 className="h-10 w-10 opacity-20" />
                              </div>
                            )}
                          </div>

                          <CardContent className="p-4">
                            {/* ---------- HEADER ---------- */}
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-lg">
                                {plot.projectName} — {plot.openPlotNo}
                              </h3>

                              <div
                                className="flex gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {!isUserDeleted && canEdit && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => handleEditOpenPlot(plot, e)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {!isUserDeleted && userCanDeleteUser && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) =>
                                      openDeleteDialog("plot", plot._id, e)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {isUserDeleted && userCanDeleteUser && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setRestorePlotId(plot._id);
                                      setRestorePlotOpen(true);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* ---------- LOCATION ---------- */}
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              {plot.location || "Location not specified"}
                            </div>

                            {/* ---------- LAND DETAILS ---------- */}
                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex justify-between">
                                <span>Total Area</span>
                                <span>
                                  {plot.totalArea} {plot.areaUnit}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span>Facing</span>
                                <span>{plot.facing || "—"}</span>
                              </div>

                              <div className="flex justify-between">
                                <span>Road Width</span>
                                <span>
                                  {plot.roadWidthFt
                                    ? `${plot.roadWidthFt} ft`
                                    : "—"}
                                </span>
                              </div>
                            </div>

                            {/* ---------- LEGAL / STATUS ---------- */}
                            <div className="border-t pt-3 text-sm space-y-2">
                              <div className="flex justify-between">
                                <span>Status</span>
                                <span>{plot.status}</span>
                              </div>

                              <div className="flex justify-between">
                                <span>Title</span>
                                <span>{plot.titleStatus}</span>
                              </div>

                              <div className="flex justify-between">
                                <span>Approval</span>
                                <span>{plot.approvalAuthority || "—"}</span>
                              </div>
                            </div>

                            {/* ---------- ACTION ---------- */}
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/properties/openplot/${plot._id}`);
                                }}
                              >
                                View Details
                              </Button>
                              {plot?.brochureUrl && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) =>
                                      handleDownload(
                                        e,
                                        plot?.brochureUrl!,
                                        plot?.projectName,
                                        plot?._id,
                                      )
                                    }
                                    disabled={downloadingId === plot?._id}
                                    title="Download Brochure"
                                  >
                                    {downloadingId === plot?._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ---------- Open Lands Section ---------- */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Open Land</h2>
              <div />
            </div>

            <Card>
              <CardContent className="p-6">
                {filteredOpenLand?.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">
                      No open Land found
                    </h3>
                    {user?.role === "customer_purchased" ? (
                      <p className="text-muted-foreground">
                        No Open Land found for your account.
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        No Open Land available. Please add a new open land using
                        the button above.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOpenLand?.map((land) => {
                      const isUserDeleted = land?.isDeleted === true;
                      return (
                        <Card
                          className={`overflow-hidden hover:shadow-lg transition cursor-pointer ${
                            isUserDeleted ? "opacity-60" : "hover:bg-muted/30"
                          }`}
                          key={land?._id}
                          onClick={() =>
                            navigate(`/properties/openland/${land?._id}`)
                          }
                        >
                          <div className="relative">
                            {land?.thumbnailUrl ? (
                              <img
                                src={getImageUrl(land?.thumbnailUrl)}
                                alt={land?.projectName}
                                className="h-48 w-full object-cover"
                              />
                            ) : (
                              <div className="h-48 bg-muted flex items-center justify-center">
                                <Building2 className="h-10 w-10 opacity-20" />
                              </div>
                            )}
                          </div>

                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-lg">
                                {land?.projectName} — {land?.surveyNumber}
                              </h3>

                              <div
                                className="flex gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {!isUserDeleted && canEdit && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => handleEditOpenLand(land, e)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {!isUserDeleted && userCanDeleteUser && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) =>
                                      openDeleteDialog("land", land?._id!, e)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {isUserDeleted && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setRestoreId(land._id);
                                      setRestoreDialog(true);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              {land?.location || "Location not specified"}
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex justify-between">
                                <span>Land Type</span>
                                <span>{land?.landType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Facing</span>
                                <span>{land?.facing}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Land Area</span>
                                <span>
                                  {land?.landArea}/{land?.areaUnit}
                                </span>
                              </div>
                            </div>

                            <div className="border-t pt-3 text-sm space-y-2">
                              <div className="flex justify-between">
                                <span>Availability</span>
                                <span>
                                  {land?.availableDate
                                    ? new Date(
                                        land?.availableDate,
                                      ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/properties/openland/${land._id}`);
                                }}
                              >
                                View Land Details
                              </Button>
                              {land?.brochureUrl && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) =>
                                      handleDownload(
                                        e,
                                        land?.brochureUrl!,
                                        land?.projectName,
                                        land?._id,
                                      )
                                    }
                                    disabled={downloadingId === land?._id}
                                    title="Download Brochure"
                                  >
                                    {downloadingId === land._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                  {/* <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) =>
                                      handleShare(
                                        e,
                                        land.brochureUrl!,
                                        land.projectName
                                      )
                                    }
                                    title="Copy Share Link"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button> */}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </section>
      </div>

      {/* Dialogs */}
      <BuildingDialog
        key={
          selectedBuilding?._id || dialogMode + selectedBuilding?.propertyType
        }
        open={buildingDialogOpen}
        onOpenChange={(val) => {
          setBuildingDialogOpen(val);

          if (!val) {
            setSelectedBuilding(null);
          }
        }}
        building={selectedBuilding || undefined}
        mode={dialogMode}
        onSuccessfulSave={handleSuccessfulSave}
      />

      <DeleteConfirmDialog
        open={restoreDialog}
        onOpenChange={setRestoreDialog}
        onConfirm={handleRestore}
        title={"Restore Open Land"}
        description={"Are you sure you want to restore this open land?"}
        btnTxt="Restore"
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={
          deleteType === "building"
            ? "Delete Building"
            : deleteType === "plot"
              ? "Delete Open Plot"
              : "Delete Open Land"
        }
        description={
          deleteType === "building"
            ? "Are you sure you want to delete this building?"
            : deleteType === "plot"
              ? "Are you sure you want to delete this open plot?"
              : "Are you sure you want to delete this open land?"
        }
      />

      <DeleteConfirmDialog
        title="Confirm Restore"
        description="Are you sure you want to restore this open plot?"
        open={restorePlotOpen}
        onOpenChange={setRestorePlotOpen}
        onConfirm={handlePlotRestore}
        btnTxt="Restore"
      />

      {/* OpenPlot dialog (calls your existing component) */}
      <OpenPlotDialog
        open={dialogOpenPlot}
        onOpenChange={(val: boolean) => {
          setDialogOpenPlot(val);
          if (!val) setCurrentOpenPlot(undefined);
        }}
        openPlot={currentOpenPlot}
      />
      {/* OpenLand dialog (calls your existing component) */}
      <OpenLandDialog
        open={openLandDialog}
        onOpenChange={(val: boolean) => {
          setopenLandDialog(val);
          if (!val) setCurrentOpenLand(undefined);
        }}
        openLand={currentOpenLand}
        onSubmit={handleOpenLandSubmit}
      />
    </MainLayout>
  );
};

export default NewProperties;
