import { AlertTriangle, MessageSquare, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  major: "bg-amber-100 text-amber-800",
  minor: "bg-blue-100 text-blue-800",
};

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
};

const SiteInchargeQualityIssues = ({
  qualityIssues,
  isLoading,
  isError,
  error,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading quality issues...</div>;
  }

  if (isError) {
    return <div>Error loading quality issues: {error.message}</div>;
  }

  // Filter out resolved issues and sort by severity
  const activeIssues = qualityIssues
    ?.filter((issue) => issue.status !== "resolved")
    ?.sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  return (
    <div className="space-y-4">
      {activeIssues.map((issue) => {
        const isBuildingDeleted =
          typeof issue?.project?.projectId === "object" &&
          issue?.project?.projectId?.isDeleted === true;

        const isFloorDeleted =
          typeof issue?.project?.floorUnit === "object" &&
          issue?.project?.floorUnit?.isDeleted === true;

        const isUnitDeleted =
          typeof issue?.project?.unit === "object" &&
          issue?.project?.unit?.isDeleted === true;

        const isUserDeleted = issue?.contractor?.isDeleted === true;

        const isAnyDeleted =
          isBuildingDeleted || isFloorDeleted || isUnitDeleted || isUserDeleted;
        return (
          <div
            key={issue._id}
            className={`transition-colors ${
              isAnyDeleted ? "opacity-60 bg-muted/30" : "hover:bg-muted/30"
            }`}
          >
            {/* Header: Title + Severity */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 ${
                    issue.severity === "critical"
                      ? "text-red-500"
                      : issue.severity === "major"
                        ? "text-amber-500"
                        : "text-blue-500"
                  }`}
                />
                <div>
                  <p className="font-medium break-words">
                    <span
                      className={
                        isAnyDeleted ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {issue?.title || "N/A"}
                    </span>

                    {isBuildingDeleted && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                        Building De-Activated
                      </span>
                    )}

                    {!isBuildingDeleted && isFloorDeleted && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                        Floor De-Activated
                      </span>
                    )}

                    {!isBuildingDeleted && !isFloorDeleted && isUnitDeleted && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                        Unit De-Activated
                      </span>
                    )}

                    {!isBuildingDeleted &&
                      !isFloorDeleted &&
                      !isUnitDeleted &&
                      isUserDeleted && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          Contractor Deleted
                        </span>
                      )}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${
                  severityColors[issue.severity]
                } self-start md:self-center`}
              >
                {issue.severity.charAt(0).toUpperCase() +
                  issue.severity.slice(1)}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm break-words">{issue.description}</p>

            {/* Contractor + Status + Reported */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1">
                <span className="text-muted-foreground">
                  Contractor: {issue.contractor.name}
                </span>
                <Badge variant="outline" className={statusColors[issue.status]}>
                  {issue.status
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </div>
              <span className="text-muted-foreground">
                Reported: {new Date(issue.reported_date).toLocaleDateString()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:space-x-2 gap-2 pt-1">
              {!isAnyDeleted && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs w-full sm:w-auto"
                  onClick={() => navigate(`/schedule`)}
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Schedule Inspection
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-xs w-full sm:w-auto"
                onClick={() => navigate(`/messaging`)}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Contact Contractor
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SiteInchargeQualityIssues;
