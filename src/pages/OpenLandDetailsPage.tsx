import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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

  // 🔥 read already fetched lands from React Query cache
  const lands = queryClient.getQueryData<OpenLand[]>(["openLand"]);

  if (!lands) return <Loader />;

  const land = lands.find((l) => l._id === id);

  if (!land) {
    toast.error("Open land not found");
    navigate("/properties");
    return null;
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
        onSubmit={(updated) => {
          queryClient.setQueryData(["openLand"], (old: any[]) =>
            old.map((l) => (l._id === updated._id ? updated : l)),
          );
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
