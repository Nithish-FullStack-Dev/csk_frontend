import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import OpenLandDetails from "@/components/properties/OpenLandDetails";
import { OpenLand } from "@/types/OpenLand";
import { useState } from "react";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { OpenLandDialog } from "@/components/properties/OpenLandDialog";
import axios from "axios";

const OpenLandDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: land,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["openLand", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/openLand/getOpenLandById/${id}`,
        {
          withCredentials: true,
        },
      );

      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !land) {
    return <Navigate to="/properties" replace />;
  }

  return (
    <>
      <OpenLandDetails
        land={land}
        onBack={() => navigate("/properties")}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onRefresh={() => {}}
      />

      <OpenLandDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        openLand={land}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ["openLand"] });
          setEditOpen(false);
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Open Land"
        description="Are you sure you want to delete this land?"
        onConfirm={async () => {
          try {
            await axios.delete(
              `${import.meta.env.VITE_URL}/api/openLand/deleteOpenLand/${land._id}`,
              { withCredentials: true },
            );

            toast.success("Open land Deleted");

            queryClient.invalidateQueries({ queryKey: ["openLand"] });

            navigate("/properties");
          } catch (err) {
            toast.error("Delete failed");
          }
        }}
      />
    </>
  );
};

export default OpenLandDetailsPage;
