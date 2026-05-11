import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { priorityColors } from "@/utils/contractor/ContractorConfig";
import { Calendar } from "lucide-react";
import { memo } from "react";

const TaskCard = ({ task, contractors }: any) => {
  const contractorName =
    contractors?.find((c: any) => c._id === task.contractor)?.name ||
    "Unknown Contractor";

  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

  const progressVal = task.progressPercentage || 0;

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="break-words text-sm font-semibold leading-5">
          {task.title}
        </h4>

        {task.priority && (
          <Badge
            variant="outline"
            className={`w-fit whitespace-nowrap text-xs ${
              priorityColors[task.priority] || priorityColors.normal
            }`}
          >
            {task?.priority}
          </Badge>
        )}
      </div>

      {/* Contractor */}
      <p className="break-words text-sm text-muted-foreground">
        Contractor:{" "}
        <span className="font-medium text-foreground">{contractorName}</span>
      </p>

      {/* Deadline */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 shrink-0" />

        <span className="font-medium text-foreground">Deadline:</span>

        <span className="break-words">{deadline}</span>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Progress</span>

          <span className="text-xs font-medium text-muted-foreground">
            {progressVal}%
          </span>
        </div>

        <Progress value={progressVal} />
      </div>
    </div>
  );
};

export default memo(TaskCard);
