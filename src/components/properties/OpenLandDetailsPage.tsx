import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import Loader from "@/components/Loader";
import OpenLandDetails from "@/components/properties/OpenLandDetails";
import { getOpenLandById } from "@/api/openLand.api";

const OpenLandDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: land, isLoading } = useQuery({
    queryKey: ["open-land", id],
    queryFn: () => getOpenLandById(id!),
    enabled: !!id,
  });

  if (isLoading || !land) return <Loader />;

  return (
    <MainLayout>
      <OpenLandDetails
        land={land}
        onBack={() => navigate("/properties")}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </MainLayout>
  );
};

export default OpenLandDetailsPage;
