// src/pages/ContractorTimeline.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Task {
  _id: string;
  title: string;
  contractor: string;
  statusForContractor: string;
  statusForSiteIncharge: string;
  deadline: string;
  progressPercentage: number;
  constructionPhase: string;
  priority?: string;
  description?: string;
  submittedByContractorOn?: string;
}

interface Project {
  _id: string;
  projectId: {
    _id: string;
    projectName: string;
    location: string;
    isDeleted?: boolean;
  };
  floorUnit: {
    _id: string;
    floorNumber: number;
    unitType: string;
    isDeleted?: boolean;
  };
  unit: {
    _id: string;
    plotNo: string;
    propertyType: string;
    isDeleted?: boolean;
  };
  startDate: string;
  endDate: string;
  status: string;
  units: Record<string, Task[]>;
  description?: string;
}

interface TimelineItem {
  id: string;
  title: string;
  project: string;
  unit: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  description?: string;

  isBuildingDeleted?: boolean;
  isFloorDeleted?: boolean;
  isUnitDeleted?: boolean;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  "In progress": "bg-blue-100 text-blue-800",
  upcoming: "bg-purple-100 text-purple-800",
  delayed: "bg-red-100 text-red-800",
  "pending verification": "bg-yellow-100 text-yellow-800",
};

const typeIcons: Record<string, JSX.Element> = {
  milestone: <CheckCircle className="h-4 w-4 mr-1" />,
  task: <Clock className="h-4 w-4 mr-1" />,
  inspection: <Loader2 className="h-4 w-4 mr-1" />,
};

const ContractorTimeline: React.FC = () => {
  // const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  // const [loading, setLoading] = useState(true);

  const {
    data: timelineData,
    isLoading,
    isError,
    error,
  } = useQuery<TimelineItem[]>({
    queryKey: ["timeline"],
    queryFn: async () => {
      const { data } = await axios.get<Project[]>(
        `${import.meta.env.VITE_URL}/api/project/projects`,
        { withCredentials: true },
      );

      const transformed: TimelineItem[] = [];

      data.forEach((project) => {
        Object.entries(project?.units || {}).forEach(([unitId, tasks]) => {
          tasks.forEach((task) => {
            transformed.push({
              id: task._id,
              title: task.title,
              project: project.projectId?.projectName || "Unnamed Project",
              unit: project.unit?.plotNo || "N/A",
              startDate: project.startDate,
              endDate: task.deadline,
              status:
                task.statusForContractor ||
                task.statusForSiteIncharge ||
                "upcoming",
              type: "task",
              description: project?.description || "No description",

              isBuildingDeleted: project?.projectId?.isDeleted,
              isFloorDeleted: project?.floorUnit?.isDeleted,
              isUnitDeleted: project?.unit?.isDeleted,
            });
          });
        });
      });

      return transformed.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
    },

    // 🔥 important
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (isError) {
    toast.error(error.message);
    console.log("Failed to load time line projects", error);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  if (!timelineData.length) {
    return (
      <div className="text-center text-gray-500 py-10">
        No project tasks available.
      </div>
    );
  }
  const groupedByProject: Record<string, TimelineItem[]> = timelineData?.reduce(
    (groups, item) => {
      if (!groups[item.project]) {
        groups[item.project] = [];
      }
      groups[item.project].push(item);
      return groups;
    },
    {} as Record<string, TimelineItem[]>,
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "In progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "upcoming":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "delayed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pending verification":
        return <Loader2 className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedByProject).map(([project, items]) => (
        <div key={project} className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">{project}</h3>
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            {items.map((item) => {
              const isAnyDeleted =
                item.isBuildingDeleted ||
                item.isFloorDeleted ||
                item.isUnitDeleted;
              return (
                <div
                  className={`
    rounded-lg border p-4 transition
    ${isAnyDeleted ? "bg-muted/30" : "bg-white hover:shadow-md"}
  `}
                >
                  {/* Header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="break-words text-sm font-medium sm:text-base">
                          {item.title}
                        </h4>

                        <Badge
                          variant="secondary"
                          className={`w-fit whitespace-nowrap ${
                            statusColors[item.status] || "bg-gray-100"
                          }`}
                        >
                          {getStatusIcon(item.status)}

                          <span className="ml-1">
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </span>
                        </Badge>
                      </div>

                      {isAnyDeleted && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.isBuildingDeleted && (
                            <Badge variant="destructive">
                              Building De-Activated
                            </Badge>
                          )}

                          {!item.isBuildingDeleted && item.isFloorDeleted && (
                            <Badge className="bg-orange-500 text-white">
                              Floor De-Activated
                            </Badge>
                          )}

                          {!item.isBuildingDeleted &&
                            !item.isFloorDeleted &&
                            item.isUnitDeleted && (
                              <Badge variant="secondary">
                                Unit De-Activated
                              </Badge>
                            )}
                        </div>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className="w-fit capitalize whitespace-nowrap"
                    >
                      {typeIcons[item.type]}
                      {item.type}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="mt-3 break-words text-sm text-gray-600">
                    {item.description}
                  </p>

                  {/* Details */}
                  <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-gray-500 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="break-words">
                      <span className="font-medium text-gray-700">Unit:</span>{" "}
                      {item.unit}
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Start:</span>{" "}
                      {new Date(item.startDate).toLocaleDateString()}
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">End:</span>{" "}
                      {new Date(item.endDate).toLocaleDateString()}
                    </div>

                    <div className="break-words">
                      <span className="font-medium text-gray-700">
                        Project:
                      </span>{" "}
                      {item.project}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractorTimeline;
