"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Download, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { OpenLand } from "@/types/OpenLand";
import { OpenLandDialog } from "@/components/properties/OpenLandDialog";
import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getAllOpenLand } from "@/utils/buildings/Projects";
import { useRBAC } from "@/config/RBAC";

const OpenLandProperties = () => {
  const queryClient = useQueryClient();
  const API_BASE =
    import.meta.env.VITE_URL ||
    "[http://localhost:3000](http://localhost:3000)";

  const [openLandDialog, setOpenLandDialog] = useState(false);
  const [openLandSubmitting, setOpenLandSubmitting] = useState(false);
  const [currentOpenLand, setCurrentOpenLand] = useState<
    OpenLand | undefined
  >();
  const [selectedOpenLand, setSelectedOpenLand] = useState<OpenLand | null>(
    null
  );

  // RBAC permissions
  const { userCanEditUser } = useRBAC({ roleSubmodule: "Properties" });
  const canEdit = userCanEditUser;

  // Fetch open lands
  const {
    data: openLandData = [],
    isLoading,
    isError,
  } = useQuery<OpenLand[]>({
    queryKey: ["openLand"],
    queryFn: getAllOpenLand,
    staleTime: 600000,
    placeholderData: keepPreviousData,
  });

  // --- Mutations ---
  const createOpenLandMutation = useMutation({
    mutationFn: async (payload: Partial<OpenLand>) => {
      const { data } = await axios.post(
        `${API_BASE}/api/openLand/saveOpenLand`,
        payload,
        {
          withCredentials: true,
        }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Open land created successfully");
      queryClient.invalidateQueries({ queryKey: ["openLand"] });
      setOpenLandDialog(false);
      setCurrentOpenLand(undefined);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create open land");
    },
  });

  const updateOpenLandMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<OpenLand>;
    }) => {
      const { data } = await axios.put(
        `${API_BASE}/api/openLand/updateOpenLand/${id}`,
        payload,
        {
          withCredentials: true,
        }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Open land updated successfully");
      queryClient.invalidateQueries({ queryKey: ["openLand"] });
      setOpenLandDialog(false);
      setCurrentOpenLand(undefined);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update open land");
    },
  });

  const deleteOpenLandMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE}/api/openLand/deleteOpenLand/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success("Open land deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["openLand"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete open land");
    },
  });

  // --- Handlers ---
  const handleAddOpenLand = () => {
    setCurrentOpenLand(undefined);
    setOpenLandDialog(true);
  };

  const handleEditOpenLand = (land: OpenLand, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentOpenLand(land);
    setOpenLandDialog(true);
  };

  const handleDeleteOpenLand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this open land?"))
      return;
    deleteOpenLandMutation.mutate(id);
  };

  const handleOpenLandSubmit = async (formData: any) => {
    try {
      setOpenLandSubmitting(true);
      if (currentOpenLand && currentOpenLand._id) {
        await updateOpenLandMutation.mutateAsync({
          id: currentOpenLand._id,
          payload: formData,
        });
      } else {
        await createOpenLandMutation.mutateAsync(formData);
      }
    } catch (err) {
      console.error("handleOpenLandSubmit error:", err);
    } finally {
      setOpenLandSubmitting(false);
    }
  };

  const handleDownload = (
    e: React.MouseEvent,
    url?: string | null,
    projectName?: string | null
  ) => {
    e.stopPropagation();
    if (!url) return toast.error("No brochure available to download.");

    const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
      url
    )}&filename=${encodeURIComponent(projectName || "brochure")}`;
    window.open(proxyUrl, "_blank");
    toast.success("Download starting...");
  };

  // --- UI States ---
  if (isLoading) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Loading open lands...
      </div>
    );
  }

  if (isError) {
    toast.error("Failed to fetch open lands");
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load open lands
      </div>
    );
  }

  // --- UI Render ---
  return (
    <div>
      {" "}
      <section>
        {" "}
        <div className="flex justify-between mb-4 items-center">
          {" "}
          <h2 className="text-2xl font-semibold">Open Lands</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            {openLandData.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">
                  No open lands found
                </h3>
                <p className="text-muted-foreground">
                  Add open lands using the button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openLandData.map((land) => {
                  const thumbnailSrc = land.thumbnailUrl
                    ? land.thumbnailUrl.startsWith("http")
                      ? land.thumbnailUrl
                      : `${API_BASE}/${land.thumbnailUrl.replace(/^\/+/, "")}`
                    : null;

                  return (
                    <Card
                      key={land._id}
                      onClick={() => setSelectedOpenLand(land)}
                      className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="relative">
                        {thumbnailSrc ? (
                          <img
                            src={thumbnailSrc}
                            alt={land.projectName}
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
                          <h3 className="font-semibold text-lg truncate">
                            {land.projectName}{" "}
                            {land.plotNo ? `— ${land.plotNo}` : ""}
                          </h3>
                          {canEdit && (
                            <div
                              className="flex gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleEditOpenLand(land, e)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) =>
                                  handleDeleteOpenLand(land._id!, e)
                                }
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {land.googleMapsLink ? (
                            <a
                              className="underline"
                              href={land.googleMapsLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View on map
                            </a>
                          ) : (
                            land.location || "No location"
                          )}
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span>Land Area</span>
                            <span>
                              {land.landArea} {land.areaUnit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Type</span>
                            <span>{land.landType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status</span>
                            <span>{land.availabilityStatus}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOpenLand(land);
                            }}
                          >
                            View Land Details
                          </Button>
                          {land.brochureUrl && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) =>
                                handleDownload(
                                  e,
                                  land.brochureUrl!,
                                  land.projectName
                                )
                              }
                              title="Download Brochure"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
      {/* Dialog */}
      <OpenLandDialog
        open={openLandDialog}
        onOpenChange={setOpenLandDialog}
        openLand={currentOpenLand}
        onSubmit={handleOpenLandSubmit}
      />
    </div>
  );
};

export default OpenLandProperties;
