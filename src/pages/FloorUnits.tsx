import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Home,
  User,
  PercentIcon,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Property } from "@/types/property";
import { Progress } from "@/components/ui/progress";
import { formatIndianCurrency } from "@/lib/formatCurrency";
import { useAuth } from "@/contexts/AuthContext";
import { ApartmentDialog } from "@/components/properties/ApartmentDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";
import axios from "axios";
import Loader from "@/components/Loader";
import { createUnit, updateUnit, fetchUnit } from "@/utils/units/Methods";

const fetchUnits = async (buildingId: string, floorId: string) => {
  const { data } = await axios.get(
    `${
      import.meta.env.VITE_URL
    }/api/unit/getUnitsByFloorIdAndBuildingId/${buildingId}/${floorId}`,
    { withCredentials: true }
  );
  return data.data as Property[];
};

// const createUnit = async (unitData: FormData) => {
//   const { data } = await axios.post(
//     `${import.meta.env.VITE_URL}/api/unit/createUnit`,
//     unitData,
//     {
//       withCredentials: true,
//       headers: { "Content-Type": "multipart/form-data" },
//     }
//   );
//   return data.data as Property;
// };

// const updateUnit = async (unitId: string, unitData: FormData) => {
//   const { data } = await axios.patch(
//     `${import.meta.env.VITE_URL}/api/unit/updateUnit/${unitId}`,
//     unitData,
//     {
//       withCredentials: true,
//       headers: { "Content-Type": "multipart/form-data" },
//     }
//   );
//   return data.data as Property;
// };

const deleteUnit = async (unitId: string) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_URL}/api/unit/deleteUnit/${unitId}`,
    { withCredentials: true }
  );
  return data.data;
};

const FloorUnits = () => {
  const { buildingId, floorId } = useParams<{
    buildingId: string;
    floorId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: apartments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["units", buildingId, floorId],
    queryFn: () => fetchUnits(buildingId!, floorId!),
    enabled: !!buildingId && !!floorId,
    staleTime: 2000,
  });

  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", buildingId, floorId],
      });
      toast.success("Unit created successfully");
      setApartmentDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create unit");
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({
      unitId,
      unitData,
    }: {
      unitId: string;
      unitData: FormData;
    }) => updateUnit(unitId, unitData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", buildingId, floorId],
      });
      toast.success("Unit updated successfully");
      setApartmentDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update unit");
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", buildingId, floorId],
      });
      toast.success("Unit deleted successfully");
      setDeleteDialogOpen(false);
      setApartmentToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete unit");
    },
  });

  const [apartmentDialogOpen, setApartmentDialogOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<
    Property | undefined
  >();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(
    null
  );

  const canEdit = user && ["owner", "admin"].includes(user.role);

  const handleAddApartment = () => {
    setSelectedApartment(undefined);
    setDialogMode("add");
    setApartmentDialogOpen(true);
  };

  const handleEditApartment = (apartment: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedApartment(apartment);
    setDialogMode("edit");
    setApartmentDialogOpen(true);
  };

  const handleDeleteClick = (apartmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setApartmentToDelete(apartmentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (apartmentToDelete) {
      deleteUnitMutation.mutate(apartmentToDelete);
    }
  };

  const handleSaveApartment = (data: FormData, mode: "add" | "edit") => {
    // Include buildingId and floorId in the FormData for createUnit
    if (mode === "add") {
      data.append("buildingId", buildingId!);
      data.append("floorId", floorId!);
      createUnitMutation.mutate(data);
    } else if (selectedApartment?._id) {
      updateUnitMutation.mutate({
        unitId: selectedApartment._id,
        unitData: data,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Available: "bg-green-500",
      Sold: "bg-blue-500",
      "Under Construction": "bg-yellow-500",
      Reserved: "bg-purple-500",
      Blocked: "bg-red-500",
    };
    return (
      <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
        {status}
      </Badge>
    );
  };

  if (isError) {
    console.error(error?.message);
    toast.error(error?.message || "Failed to fetch units");
  }
  if (isLoading) return <Loader />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/properties/building/${buildingId}`)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Building
          </Button>
          {canEdit && (
            <Button onClick={handleAddApartment}>
              <Plus className="mr-2 h-4 w-4" /> Add Unit
            </Button>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Individual Units</h1>
          <p className="text-muted-foreground">
            Select a unit to view complete details
          </p>
        </div>

        <div className="grid gap-4">
          {apartments.length === 0 && (
            <p className="text-muted-foreground">
              No units found for this floor.
            </p>
          )}

          {apartments.map((apartment, idx) => (
            <Card
              key={apartment._id || idx}
              className="hover:shadow-md transition-shadow"
              onClick={() =>
                navigate(
                  `/properties/building/${buildingId}/floor/${floorId}/unit/${apartment._id}`
                )
              }
            >
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    {apartment.thumbnailUrl ? (
                      <img
                        src={apartment.thumbnailUrl}
                        alt={`Unit ${apartment.plotNo}`}
                        className="h-48 md:h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    ) : (
                      <div className="h-48 md:h-full w-full bg-muted flex items-center justify-center">
                        <Home className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3 p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">
                              Unit {apartment.plotNo}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Mem. No: {apartment.memNo || "N/A"}
                            </p>
                          </div>
                          {/* <div className="flex items-center gap-2">
                              {getStatusBadge(apartment.status)}
                              {canEdit && (
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) =>
                                      handleEditApartment(apartment, e)
                                    }
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) =>
                                      handleDeleteClick(apartment._id, e)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div> */}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Extent
                            </p>
                            <p className="font-medium">
                              {apartment.extent} sq.ft
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Facing
                            </p>
                            <p className="font-medium">
                              {apartment.villaFacing || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Customer
                            </p>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1 text-muted-foreground" />
                              <p className="font-medium">
                                {(apartment.customerId as any)?.user?.name ||
                                  apartment.purchasedCustomerName ||
                                  (apartment.status === "Sold"
                                    ? "Owner"
                                    : "Available")}
                              </p>
                            </div>
                          </div>
                          {/* <div>
                            <p className="text-sm text-muted-foreground">
                              Price
                            </p>
                            <p className="font-medium">
                              {formatIndianCurrency(apartment.totalAmount)}
                            </p>
                          </div> */}
                        </div>

                        {apartment.status !== "Available" && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center">
                                <PercentIcon className="h-4 w-4 mr-1" /> Work
                                Progress
                              </span>
                              <span>{apartment.workCompleted}%</span>
                            </div>
                            <Progress
                              value={apartment.workCompleted}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() =>
                          navigate(
                            `/properties/building/${buildingId}/floor/${floorId}/unit/${apartment._id}`
                          )
                        }
                      >
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ApartmentDialog
        open={apartmentDialogOpen}
        onOpenChange={setApartmentDialogOpen}
        apartment={selectedApartment}
        mode={dialogMode}
        onSave={handleSaveApartment}
        isCreating={createUnitMutation.isPending}
        isUpdating={updateUnitMutation.isPending}
      />

      {/* <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Unit"
          description="Are you sure you want to delete this unit? This action cannot be undone."
        /> */}
    </MainLayout>
  );
};

export default FloorUnits;
