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
import { Badge } from "@/components/ui/badge";
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
  Share2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Building } from "@/types/building";
import { BuildingDialog } from "@/components/properties/BuildingDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import { OpenPlot } from "@/types/OpenPlots";
import { OpenPlotDialog } from "@/components/properties/OpenPlotsDialog";
import { getStatusBadge } from "@/components/properties/OpenPlotDetails";
import { OpenPlotCardDetailed } from "@/components/properties/OpenCardDetailed";
import { OpenPlotDetails } from "@/components/properties/OpenPlotDetails";

export const getAllBuildings = async (): Promise<Building[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getAllBuildings`,
    { withCredentials: true }
  );
  return data?.data || [];
};

export const getAllOpenPlots = async (): Promise<OpenPlot[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/openPlot/getAllOpenPlot`,
    { withCredentials: true }
  );
  // Your backend returned { plots: [...] } earlier; fallback to data shapes
  return data?.plots || data?.data || [];
};

const NewProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- state for buildings UI ---
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // building dialogs & deletion
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);

  // --- state for open plots UI ---
  const [dialogOpenPlot, setDialogOpenPlot] = useState(false);
  const [openPlotSubmitting, setOpenPlotSubmitting] = useState(false);
  const [currentOpenPlot, setCurrentOpenPlot] = useState<OpenPlot | undefined>(
    undefined
  );

  // local copies for open plots (synced with react-query)
  const [openPlots, setOpenPlots] = useState<OpenPlot[]>([]);
  const [filteredOpenPlots, setFilteredOpenPlots] = useState<OpenPlot[]>([]);
  const [selectedOpenPlot, setSelectedOpenPlot] = useState<OpenPlot | null>(
    null
  );
  const canEdit = user && ["owner", "admin"].includes(user.role);

  const {
    data: buildings,
    isLoading: buildingsLoading,
    isError: buildError,
    error: buildErr,
  } = useQuery<Building[]>({
    queryKey: ["buildings"],
    queryFn: getAllBuildings,
    staleTime: 1000 * 60,
  });

  const {
    data: openPlotsData,
    isLoading: openPlotsLoading,
    isError: openPlotsError,
    error: openPlotsErr,
  } = useQuery<OpenPlot[]>({
    queryKey: ["openPlots"],
    queryFn: getAllOpenPlots,
    staleTime: 1000 * 60,
  });

  // ---------- Mutations ----------
  const deleteBuilding = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/building/deleteBuilding/${id}`,
        {
          withCredentials: true,
        }
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

  const createOpenPlotMutation = useMutation({
    mutationFn: async (payload: Partial<OpenPlot>) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/openPlot/saveOpenPlot`,
        payload,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Open plot created");
      queryClient.invalidateQueries({ queryKey: ["openPlots"] });
      setDialogOpenPlot(false);
      setCurrentOpenPlot(undefined);
    },
    onError: (err: any) => {
      console.error("createOpenPlot error:", err?.response || err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          toast.error(
            err.response?.data?.message || "Conflict while creating open plot"
          );
        } else {
          toast.error(
            err.response?.data?.message || "Failed to create open plot"
          );
        }
      } else {
        toast.error("Failed to create open plot");
      }
    },
  });

  const updateOpenPlotMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<OpenPlot>;
    }) => {
      const { data } = await axios.put(
        `${import.meta.env.VITE_URL}/api/openPlot/updateOpenPlot/${id}`,
        payload,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: (updatedData) => {
      toast.success("Open plot updated");
      setDialogOpenPlot(false);
      setCurrentOpenPlot(undefined);
      // Invalidate the query to refetch in the background
      queryClient.invalidateQueries({ queryKey: ["openPlots"] });
      // Immediately update the detailed view with the fresh data from the server
      if (updatedData?.data) setSelectedOpenPlot(updatedData.data);
    },
    onError: (err: any) => {
      console.error("updateOpenPlot error:", err?.response || err);
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Failed to update open plot"
        );
      } else {
        toast.error("Failed to update open plot");
      }
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
        }
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

  // ---------- Effects ----------
  // Sync react-query open plots to local state
  useEffect(() => {
    const list = openPlotsData || [];
    setOpenPlots(list);
    setFilteredOpenPlots(list);
  }, [openPlotsData]);

  // Errors -> toast (safe inside effects)
  useEffect(() => {
    if (buildError) {
      toast.error((buildErr as any)?.message || "Failed to fetch buildings");
      console.error(buildErr);
    }
  }, [buildError, buildErr]);

  useEffect(() => {
    if (openPlotsError) {
      toast.error(
        (openPlotsErr as any)?.message || "Failed to fetch open plots"
      );
      console.error(openPlotsErr);
    }
  }, [openPlotsError, openPlotsErr]);

  // Filter buildings when inputs change
  useEffect(() => {
    let results = (buildings || []).slice();
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(
        (b) =>
          (b.projectName || "").toLowerCase().includes(lower) ||
          (b.location || "").toLowerCase().includes(lower)
      );
    }
    if (typeFilter !== "all")
      results = results.filter((b) => b.propertyType === typeFilter);
    if (statusFilter !== "all")
      results = results.filter((b) => b.constructionStatus === statusFilter);
    setFilteredBuildings(results);
  }, [searchTerm, typeFilter, statusFilter, buildings]);

  // ---------- Handlers ----------
  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const handleAddBuilding = () => {
    setSelectedBuilding(null);
    setDialogMode("add");
    setBuildingDialogOpen(true);
  };

  const handleEditBuilding = (building: Building, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBuilding(building);
    setDialogMode("edit");
    setBuildingDialogOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBuildingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!buildingToDelete) return;
    deleteBuilding.mutate(buildingToDelete);
    setBuildingToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleSuccessfulSave = () => {
    queryClient.invalidateQueries({ queryKey: ["buildings"] });
  };

  // OpenPlot handlers
  const handleOpenPlotSubmit = async (formData: any) => {
    try {
      setOpenPlotSubmitting(true);
      if (currentOpenPlot && currentOpenPlot._id) {
        await updateOpenPlotMutation.mutateAsync({
          id: currentOpenPlot._id,
          payload: formData,
        });
      } else {
        await createOpenPlotMutation.mutateAsync(formData);
      }
      // react-query invalidation in mutation callbacks will refresh openPlotsData
    } catch (err) {
      console.error("handleOpenPlotSubmit error:", err);
    } finally {
      setOpenPlotSubmitting(false);
    }
  };

  const handleEditOpenPlot = (plot: OpenPlot, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentOpenPlot(plot);
    setDialogOpenPlot(true);
  };

  const handleDeleteOpenPlot = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentOpenPlot(openPlots.find((p) => p._id === id));
    // confirm quickly
    if (!window.confirm("Delete this open plot?")) return;
    deleteOpenPlotMutation.mutate();
  };

  const handleDeleteOpenPlotFromDetails = async () => {
    if (!selectedOpenPlot) return;
    setCurrentOpenPlot(selectedOpenPlot);
    if (!window.confirm("Delete this open plot?")) return;
    await deleteOpenPlotMutation.mutateAsync();
    setSelectedOpenPlot(null); // Go back to the list view
  };

  const handleDownload = async (
    e: React.MouseEvent,
    url?: string | null,
    projectName?: string | null
  ) => {
    e.stopPropagation();
    if (!url) return toast.error("No brochure available to download.");

    // Use a backend proxy to bypass browser CORS issues for authenticated downloads.
    // This also keeps the Cloudinary URL private.
    const proxyUrl = `${
      import.meta.env.VITE_URL
    }/api/download-proxy?url=${encodeURIComponent(
      url
    )}&filename=${encodeURIComponent(projectName || "brochure")}.pdf`;

    // Navigate to the proxy URL to trigger the download.
    window.location.href = proxyUrl;
  };

  const handleShare = async (
    e: React.MouseEvent,
    url?: string | null,
    projectName?: string | null
  ) => {
    e.stopPropagation();
    if (!url) {
      toast.error("No brochure available to share");
      return;
    }

    const shareData = {
      title: projectName || "Brochure",
      text: `Check out the brochure for ${projectName || "this project"}`,
      url: url,
    };

    try {
      // Use the modern Web Share API if available
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop: copy link to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Brochure link copied to clipboard!");
      }
    } catch (error) {
      console.error("Sharing failed:", error);
      await navigator.clipboard.writeText(url);
      toast.success("Brochure link copied to clipboard!");
    }
  };

  // ---------- Loading UX ----------
  if (buildingsLoading || openPlotsLoading) {
    return <Loader />;
  }

  // ---------- Render ----------
  return (
    <MainLayout>
      <div className="space-y-6">
        {selectedOpenPlot ? (
          <OpenPlotDetails
            plot={selectedOpenPlot}
            onEdit={() => {
              handleEditOpenPlot(selectedOpenPlot);
            }}
            onDelete={handleDeleteOpenPlotFromDetails}
            onBack={() => setSelectedOpenPlot(null)}
          />
        ) : (
          <>
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

              {canEdit && (
                <div className="flex gap-3">
                  <Button
                    className="bg-estate-tomato hover:bg-estate-tomato/90"
                    onClick={() => {
                      setCurrentOpenPlot(undefined);
                      setDialogOpenPlot(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Open Plots
                  </Button>

                  <Button onClick={handleAddBuilding}>
                    <Plus className="mr-2 h-4 w-4" /> Add Building
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
                      <SelectItem value="Villa Complex">
                        Villa Complex
                      </SelectItem>
                      <SelectItem value="Plot Development">
                        Plot Development
                      </SelectItem>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredBuildings.map((b, idx) => (
                    <Card
                      key={b._id || idx}
                      className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="relative">
                        {b.thumbnailUrl ? (
                          <img
                            src={b.thumbnailUrl}
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
                          {canEdit && (
                            <div
                              className="flex gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleEditBuilding(b, e)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDeleteClick(b._id!, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
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
                            <span className="text-blue-600">{b.soldUnits}</span>
                          </div>
                        </div>

                        <div className="border-t pt-3 text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" /> Completion
                            </span>
                            <span>
                              {new Date(b.completionDate).toLocaleDateString()}
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
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              navigate(`/properties/building/${b._id}`)
                            }
                          >
                            View More
                          </Button>

                          {b.brochureUrl && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) =>
                                  handleDownload(
                                    e,
                                    b.brochureUrl!,
                                    b.projectName
                                  )
                                }
                                title="Download Brochure"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) =>
                                  handleShare(e, b.brochureUrl!, b.projectName)
                                }
                                title="Copy Share Link"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ---------- Open Plots Section ---------- */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Open Plots</h2>
                <div />
              </div>

              <Card>
                <CardContent className="p-6">
                  {openPlots.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">
                        No open plots found
                      </h3>
                      <p className="text-muted-foreground">
                        Add open plots using the button above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {openPlots.map((plot) => (
                        <Card
                          key={plot._id}
                          onClick={() => setSelectedOpenPlot(plot)}
                          className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                        >
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
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-lg">
                                {plot.projectName} — {plot.plotNo}
                              </h3>
                              {canEdit && (
                                <div
                                  className="flex gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => handleEditOpenPlot(plot, e)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) =>
                                      handleDeleteOpenPlot(plot._id!, e)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4 mr-1" />{" "}
                              {plot.googleMapsLink ? (
                                <a
                                  className="underline"
                                  href={plot.googleMapsLink}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View on map
                                </a>
                              ) : (
                                plot.projectName
                              )}
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex justify-between">
                                <span>Extent (SqYards)</span>
                                <span>{plot.extentSqYards}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Price / SqYard</span>
                                <span>₹{plot.pricePerSqYard}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Amount</span>
                                <span>₹{plot.totalAmount}</span>
                              </div>
                            </div>

                            <div className="border-t pt-3 text-sm space-y-2">
                              <div className="flex justify-between">
                                <span>Availability</span>
                                <span>{plot.availabilityStatus}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Approval</span>
                                <span>{plot.approval}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOpenPlot(plot);
                                }}
                              >
                                View Plot Details
                              </Button>
                              {plot.brochureUrl && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) =>
                                      handleDownload(
                                        e,
                                        plot.brochureUrl!,
                                        plot.projectName
                                      )
                                    }
                                    title="Download Brochure"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) =>
                                      handleShare(
                                        e,
                                        plot.brochureUrl!,
                                        plot.projectName
                                      )
                                    }
                                    title="Copy Share Link"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
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
          </>
        )}
      </div>

      {/* Dialogs */}
      <BuildingDialog
        open={buildingDialogOpen}
        onOpenChange={setBuildingDialogOpen}
        building={selectedBuilding || undefined}
        mode={dialogMode}
        onSuccessfulSave={handleSuccessfulSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Building"
        description="Are you sure you want to delete this building?"
      />

      {/* OpenPlot dialog (calls your existing component) */}
      <OpenPlotDialog
        open={dialogOpenPlot}
        onOpenChange={(val: boolean) => {
          setDialogOpenPlot(val);
          if (!val) setCurrentOpenPlot(undefined);
        }}
        openPlot={currentOpenPlot}
        onSubmit={handleOpenPlotSubmit}
      />
    </MainLayout>
  );
};

export default NewProperties;
