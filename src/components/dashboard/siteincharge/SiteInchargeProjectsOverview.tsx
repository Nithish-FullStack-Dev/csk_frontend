import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignContractor,
  useContractors,
} from "@/utils/contractor/ContractorConfig";
import { statusColors } from "@/utils/project/ProjectConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "../contractor/TaskList";
import { Badge } from "@/components/ui/badge";

const SiteInchargeProjectsOverview = ({
  projects,
  isLoading,
  isError,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: contractors = [],
    isLoading: contractorsLoading,
    isError: contractorsError,
  } = useContractors();

  const mutation = useMutation({
    mutationFn: assignContractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setSelectedUnit("");
      setSelectedContractor("");
    },
  });

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedUnit || !selectedContractor) return;
    mutation.mutate({
      projectId: selectedProject._id,
      unit: selectedUnit,
      contractorId: selectedContractor,
    });
  };

  return (
    <div className="space-y-6">
      {isLoading && <p>Loading projects...</p>}
      {isError && <p>Error loading projects: {error.message}</p>}
      {projects?.map((project) => {
        const unitsMap = project.units || {};
        const allTasks = Object.values(unitsMap).flat();

        const pendingTasks = allTasks.filter(
          (t: any) => t.statusForContractor?.toLowerCase() === "pending"
        );
        const inProgressTasks = allTasks.filter(
          (t: any) => t.statusForContractor?.toLowerCase() === "in progress"
        );
        const completedTasks = allTasks.filter(
          (t: any) => t.statusForContractor?.toLowerCase() === "completed"
        );
        const approvedTasks = allTasks.filter(
          (t: any) => t.isApprovedBySiteManager === true
        );
        const rejectedTasks = allTasks.filter(
          (t: any) =>
            t.statusForSiteIncharge?.toLowerCase() === "rejected" ||
            t.verificationDecision?.toLowerCase() === "rejected"
        );

        const progress =
          allTasks.length > 0
            ? Math.round((completedTasks.length / allTasks.length) * 100)
            : 0;

        return (
          <div
            key={project._id}
            className="border rounded-xl p-6 bg-card shadow-sm relative"
          >
            {/* Project Header */}
            <div className="flex items-center justify-between pr-10">
              <h2 className="text-xl font-semibold">
                {typeof project.projectId === "object"
                  ? project.projectId.projectName
                  : "Untitled Project"}
              </h2>

              <Badge
                variant="outline"
                className={`text-sm ${
                  statusColors[
                    (project.status || "not started").toLowerCase()
                  ] || statusColors["not started"]
                }`}
              >
                {project?.status || "Status Unknown"}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {typeof project.projectId === "object" &&
                project.projectId?.location}
            </p>

            <p className="text-sm text-muted-foreground">
              {project.floorUnit &&
                `Floor ${
                  typeof project.floorUnit === "object" &&
                  project.floorUnit.floorNumber
                }, ${
                  typeof project.floorUnit === "object" &&
                  project.floorUnit.unitType
                }`}
              {project.unit &&
                ` • Plot ${
                  typeof project.unit === "object" && project.unit.plotNo
                }`}
            </p>

            <div>
              <p className="text-sm text-muted-foreground mt-2">
                Client: {project.clientName || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimated Budget: ₹
                {project.estimatedBudget
                  ? project.estimatedBudget.toLocaleString("en-IN")
                  : "N/A"}
              </p>
            </div>

            {/* Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="text-muted-foreground">
                  {completedTasks.length} of {allTasks.length} tasks
                </span>
              </div>
              <Progress value={progress} />
              <p className="text-right text-xs text-muted-foreground">
                {progress}% Complete
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="mt-6">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <TaskList tasks={allTasks} contractors={project.contractors} />
              </TabsContent>
              <TabsContent value="pending">
                <TaskList
                  tasks={pendingTasks}
                  contractors={project.contractors}
                />
              </TabsContent>
              <TabsContent value="in_progress">
                <TaskList
                  tasks={inProgressTasks}
                  contractors={project.contractors}
                />
              </TabsContent>
              <TabsContent value="completed">
                <TaskList
                  tasks={completedTasks}
                  contractors={project.contractors}
                />
              </TabsContent>
              <TabsContent value="approved">
                <TaskList
                  tasks={approvedTasks}
                  contractors={project.contractors}
                />
              </TabsContent>
              <TabsContent value="rejected">
                <TaskList
                  tasks={rejectedTasks}
                  contractors={project.contractors}
                />
              </TabsContent>
            </Tabs>
          </div>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
          <DialogHeader>
            <DialogTitle>Assign Contractor to Unit</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssign} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select Unit</Label>
              <Select
                value={selectedUnit}
                onValueChange={setSelectedUnit}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProject?.unitNames?.map((unitName) => (
                    <SelectItem key={unitName} value={unitName}>
                      {unitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Contractor</Label>
              <Select
                value={selectedContractor}
                onValueChange={setSelectedContractor}
                required
                disabled={contractorsLoading || contractorsError}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors &&
                    contractors?.map((contractor) => (
                      <SelectItem key={contractor?._id} value={contractor?._id}>
                        {contractor?.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteInchargeProjectsOverview;
