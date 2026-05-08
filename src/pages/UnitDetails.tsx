import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
// import PropertyDetails from "";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUnit, deleteUnit } from "@/utils/units/Methods";
import { toast } from "sonner";
import { PropertyDetails } from "@/components/properties/PropertyDetails";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { useState } from "react";

const UnitDetails = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { unitId, buildingId, floorId } = useParams<{
    unitId: string;
    buildingId: string;
    floorId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch unit
  const {
    data: apartment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["unit", unitId],
    queryFn: () => fetchUnit(unitId!),
    enabled: !!unitId,
    staleTime: 0,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      // Remove from cache
      queryClient.invalidateQueries({
        queryKey: ["units", buildingId, floorId],
      });

      queryClient.invalidateQueries({
        queryKey: ["unit"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unit", unitId],
      });

      toast.success("Unit deleted successfully");
      navigate(`/properties/building/${buildingId}/floor/${floorId}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete unit");
    },
  });

  const handleDelete = () => {
    if (!unitId) return;
    deleteMutation.mutate(unitId);
  };

  // const handleBack = () => navigate(-1);
  const handleBack = () => {
    if (buildingId && floorId) {
      navigate(`/buildings/${buildingId}/floors/${floorId}/units`);
    } else {
      navigate("/"); // fallback
    }
  };

  return (
    <MainLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading unit details...</p>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">
            Error loading unit details: {(error as Error)?.message}
          </p>
        </div>
      ) : (
        <>
          <PropertyDetails
            property={apartment}
            onBack={handleBack}
            onDelete={() => setDeleteDialogOpen(true)}
            // onEdit={() => {
            //   console.log("Edit unit", unitId);
            // }}
            buildingId={buildingId}
            floorId={floorId}
            unitId={unitId}
            isDeleting={deleteMutation.isPending}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={() => {
              handleDelete();
              setDeleteDialogOpen(false);
            }}
            title="Delete Unit"
            description="Are you sure you want to delete this unit?"
          />
        </>
      )}
    </MainLayout>
  );
};

export default UnitDetails;
