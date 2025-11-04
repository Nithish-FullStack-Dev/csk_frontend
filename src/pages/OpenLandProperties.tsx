import React, { useState } from "react";

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
import { Building2, Download, MapPin, Pencil, Trash2 } from "lucide-react";

import { OpenLand } from "@/types/OpenLand";
import { OpenLandDialog } from "@/components/properties/OpenLandDialog";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllOpenLand } from "@/utils/buildings/Projects";
import { useAuth } from "@/contexts/AuthContext";


const OpenLandProperties = () => {
    
      const { user } = useAuth();
      const [openLandDialog, setopenLandDialog] = useState(false);
const [openLandSubmitting, setOpenLandSubmitting] = useState(false);
const [currentOpenLand, setCurrentOpenLand] = useState<OpenLand | undefined>(
  undefined
);
const [selectedOpenLand, setSelectedOpenLand] = useState<OpenLand | null>(null);

const canEdit = user && ["owner", "admin"].includes(user.role);
const {
  data: openLandData,
  isLoading: openLandLoading,
  isError: openLandError,
  error: openLandErr,
} = useQuery<OpenLand[]>({
  queryKey: ["openLand"],
  queryFn: getAllOpenLand,
  staleTime: 600000,
  placeholderData: keepPreviousData,
});

 // openland handlers
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
      // react-query invalidation in mutation callbacks will refresh openLandData
    } catch (err) {
      console.error("handleOpenLandSubmit error:", err);
    } finally {
      setOpenLandSubmitting(false);
    }
  };
  const handleOpenLandDelete = async () => {
    if (!selectedOpenLand) return;
    setCurrentOpenLand(selectedOpenLand);
    if (!window.confirm("Delete this open land?")) return;
    await deleteOpenLandMutation.mutateAsync();
    setSelectedOpenLand(null); // Go back to the list view
  };
  const handleOpenLandEdit = (land: OpenLand, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentOpenLand(land);
    setopenLandDialog(true);
  };
  return (
    <div>
      {" "}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Open Lands</h2>
          <div />
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
                {openLandData.map((land) => (
                  <Card
                    key={land._id}
                    onClick={() => setSelectedOpenLand(land)}
                    className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="relative">
                      {land.thumbnailUrl ? (
                        <img
                          src={land.thumbnailUrl}
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
                        <h3 className="font-semibold text-lg">
                          {land.projectName} — {land.plotNo}
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
                            >
                              {" "}
                            </Button>
                            <Pencil className="h-4 w-4" />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) =>
                                handleDeleteOpenLand(land._id!, e)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1" />{" "}
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
                          land.projectName
                        )}
                      </div>

                      {/* <div className="space-y-2 mb-4 text-sm">
                                  <div className="flex justify-between">
                                    <span>Extent (SqYards)</span>
                                    <span>{land.extentSqYards}</span>
                                  </div>  
                                  <div className="flex justify-between">
                                    <span>Price / SqYard</span>
                                    <span>₹{land.pricePerSqYard}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Total Amount</span>
                                    <span>₹{land.totalAmount}</span>
                                  </div>
                                </div> */}

                      <div className="border-t pt-3 text-sm space-y-2">
                        {/* <div className="flex justify-between">
                                    <span>Approval</span>
                                    <span>{land.approval}</span>
                                  </div> */}
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
                          View Plot Details
                        </Button>
                        {land.brochureUrl && (
                          <div className="flex gap-2">
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default OpenLandProperties;
