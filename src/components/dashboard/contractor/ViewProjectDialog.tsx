import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Project, statusColors } from "@/utils/project/ProjectConfig";

interface Props {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewProjectDialog: React.FC<Props> = ({
  project,
  open,
  onOpenChange,
}) => {
  if (!project) return null;

  const projectName =
    typeof project.projectId === "object"
      ? project.projectId?.projectName
      : "N/A";

  const location =
    typeof project.projectId === "object" ? project.projectId?.location : "N/A";

  const floorNumber =
    typeof project.floorUnit === "object"
      ? project.floorUnit?.floorNumber
      : "N/A";

  const unitType =
    typeof project.floorUnit === "object" ? project.floorUnit?.unitType : "N/A";

  const plotNo =
    typeof project.unit === "object" ? project.unit?.plotNo : "N/A";

  const siteIncharge =
    typeof project.siteIncharge === "object"
      ? project.siteIncharge?.name
      : "N/A";

  const contractors = Array.isArray(project.contractors)
    ? project.contractors
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Project:</span> {projectName || "N/A"}
          </div>

          <div>
            <span className="font-medium">Location:</span> {location || "N/A"}
          </div>

          <div>
            <span className="font-medium">Client:</span>{" "}
            {project.clientName || "N/A"}
          </div>

          <div>
            <span className="font-medium">Floor:</span> {floorNumber}
          </div>

          <div>
            <span className="font-medium">Unit Type:</span> {unitType}
          </div>

          <div>
            <span className="font-medium">Plot:</span> {plotNo}
          </div>

          <div>
            <span className="font-medium">Site Incharge:</span> {siteIncharge}
          </div>

          <div>
            <span className="font-medium">Contractors:</span>

            {contractors.length === 0 ? (
              <p className="text-muted-foreground">No contractors assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-1">
                {contractors.map((c: any, i: number) => {
                  const name =
                    typeof c === "object" ? c.name || c.email || c._id : c;

                  return (
                    <Badge key={i} variant="secondary">
                      {name}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <span className="font-medium">Budget:</span> ₹
            {project?.estimatedBudget
              ? project.estimatedBudget.toLocaleString("en-IN")
              : "N/A"}
          </div>

          <div>
            <span className="font-medium">Team Size:</span>{" "}
            {project?.teamSize ?? "N/A"}
          </div>

          <div>
            <span className="font-medium">Start Date:</span>{" "}
            {project?.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : "N/A"}
          </div>

          <div>
            <span className="font-medium">End Date:</span>{" "}
            {project?.endDate
              ? new Date(project.endDate).toLocaleDateString()
              : "N/A"}
          </div>

          <div>
            <span className="font-medium">Status:</span>{" "}
            <Badge
              className={
                statusColors[
                  (project?.status || "not started").toLowerCase()
                ] || ""
              }
            >
              {project?.status || "Unknown"}
            </Badge>
          </div>

          <div>
            <span className="font-medium">Description:</span>
            <p className="text-muted-foreground">
              {project?.description || "N/A"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProjectDialog;
