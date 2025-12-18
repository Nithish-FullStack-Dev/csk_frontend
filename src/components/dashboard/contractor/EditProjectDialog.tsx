import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project } from "@/utils/project/ProjectConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { memo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const EditProjectDialog = ({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clientName: project.clientName || "",
    estimatedBudget: project.estimatedBudget || 0,
    estimatedEndDate: project.endDate
      ? new Date(project.endDate).toISOString().split("T")[0]
      : "",
    status: project.status || "",
  });

  const updateProject = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_URL}/api/project/updateProject/${project._id}`,
        updates,
        { withCredentials: true }
      );
      return data;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["fetchProjects"] });

      const previousProjects = queryClient.getQueryData<Project[]>([
        "fetchProjects",
      ]);

      queryClient.setQueryData<Project[]>(["fetchProjects"], (old = []) =>
        old.map((p) => (p._id === project._id ? { ...p, ...updates } : p))
      );

      return { previousProjects };
    },
    onError: (err, updates, context) => {
      queryClient.setQueryData(["fetchProjects"], context?.previousProjects);
      toast.error("Failed to update project");
    },
    onSuccess: () => {
      toast.success("Project updated successfully");
      onOpenChange(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchProjects"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject.mutate({
      clientName: formData.clientName,
      estimatedBudget: Number(formData.estimatedBudget),
      endDate: new Date(formData.estimatedEndDate),
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
          <DialogDescription>
            Update client name, budget, or estimated completion date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) =>
                setFormData((s) => ({ ...s, clientName: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="budget">Estimated Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="1000"
              value={formData.estimatedBudget}
              onChange={(e) =>
                setFormData((s) => ({
                  ...s,
                  estimatedBudget: Number(e.target.value),
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="endDate">Estimated End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.estimatedEndDate}
              onChange={(e) =>
                setFormData((s) => ({ ...s, estimatedEndDate: e.target.value }))
              }
            />
          </div>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((s) => ({ ...s, status: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Under Inspection">Under Inspection</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(EditProjectDialog);
