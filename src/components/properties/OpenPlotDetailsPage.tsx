import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import Loader from "@/components/Loader";
import { OpenPlotDetails } from "@/components/properties/OpenPlotDetails";
import { getOpenPlotById } from "@/api/openPlot.api";

const OpenPlotDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: plot, isLoading } = useQuery({
    queryKey: ["open-plot", id],
    queryFn: () => getOpenPlotById(id!),
    enabled: !!id,
  });

  if (isLoading || !plot) return <Loader />;

  return (
    <MainLayout>
      <OpenPlotDetails
        plot={plot}
        onBack={() => navigate("/properties")}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </MainLayout>
  );
};

export default OpenPlotDetailsPage;
