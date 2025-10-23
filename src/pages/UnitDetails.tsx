import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
// import PropertyDetails from "";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUnit, deleteUnit } from "@/utils/units/Methods";
import { toast } from "sonner";
import { PropertyDetails } from "@/components/properties/PropertyDetails";

const UnitDetails = () => {
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
      queryClient.setQueryData(
        ["units", buildingId, floorId],
        (oldData: any[] = []) => oldData.filter((u) => u._id !== unitId)
      );
      toast.success("Unit deleted successfully");
      navigate(-1); // Back to floor units page
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
        <PropertyDetails
          property={apartment}
          onBack={handleBack}
          onDelete={handleDelete}
          onEdit={() => {
            console.log("Edit unit", unitId);
          }}
        />
      )}
    </MainLayout>
  );
};

export default UnitDetails;
