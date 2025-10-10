import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { PropertyDetails } from "@/components/properties/PropertyDetails";
import { Property } from "@/types/property";
import { useQuery } from "@tanstack/react-query";
import { fetchUnit } from "@/components/properties/ApartmentDialog";
import { toast } from "sonner";

const UnitDetails = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();

  const {
    data: apartment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["unit", unitId],
    queryFn: () => fetchUnit(unitId!),
    enabled: !!unitId,
  });

  if (isError) {
    toast.error(`Failed to fetch unit: ${error.message}`);
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <MainLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading unit details...</p>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading unit details</p>
        </div>
      ) : (
        <PropertyDetails
          property={apartment}
          onEdit={() => {
            console.log("Edit unit", unitId);
            // In a real app, navigate to an edit dialog or route
            // e.g., navigate(`/units/${unitId}/edit`);
          }}
          onDelete={() => {
            console.log("Delete unit", unitId);
            // In a real app, confirm and call delete API
          }}
          onBack={handleBack}
        />
      )}
    </MainLayout>
  );
};

export default UnitDetails;
