"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Building } from "@/types/building";
import MainLayout from "@/components/layout/MainLayout";
import Loader from "@/components/Loader";

export default function TrashBuildingsPage() {
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"restore" | "delete" | null>(
    null,
  );

  /* ---------------- FETCH TRASH ---------------- */
  const { data, isLoading } = useQuery({
    queryKey: ["trash-buildings"],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/building/trash`,
        { withCredentials: true },
      );
      return res.data.data as Building[];
    },
  });

  /* ---------------- RESTORE ---------------- */
  const restoreMutation = useMutation({
    mutationFn: async (id: string) =>
      axios.patch(
        `${import.meta.env.VITE_URL}/api/building/restore/${id}`,
        {},
        { withCredentials: true },
      ),
    onSuccess: () => {
      toast.success("Building restored");
      queryClient.invalidateQueries({ queryKey: ["trash-buildings"] });
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      closeDialog();
    },
  });

  /* ---------------- DELETE PERMANENT ---------------- */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      axios.delete(
        `${import.meta.env.VITE_URL}/api/building/delete-permanent/${id}`,
        { withCredentials: true },
      ),
    onSuccess: () => {
      toast.success("Building permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["trash-buildings"] });
      closeDialog();
    },
  });

  const closeDialog = () => {
    setSelectedId(null);
    setActionType(null);
  };

  const handleConfirm = () => {
    if (!selectedId || !actionType) return;
    actionType === "restore"
      ? restoreMutation.mutate(selectedId)
      : deleteMutation.mutate(selectedId);
  };

  if (isLoading) return <Loader />;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Trash – Buildings</h1>

        {data?.length === 0 && (
          <p className="text-muted-foreground">Trash is empty</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((building) => (
            <Card key={building._id}>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold">{building.projectName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {building.location} • {building.propertyType}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedId(building._id);
                      setActionType("restore");
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restore
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedId(building._id);
                      setActionType("delete");
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ---------------- CONFIRMATION DIALOG ---------------- */}
        <AlertDialog open={!!selectedId} onOpenChange={closeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "restore"
                  ? "Restore building?"
                  : "Delete permanently?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === "restore"
                  ? "This building will be restored and visible again."
                  : "This action is irreversible. All related data will be deleted."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
