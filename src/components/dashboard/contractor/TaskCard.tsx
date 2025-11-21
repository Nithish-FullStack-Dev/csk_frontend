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
    <div className="border rounded-lg p-4 space-y-2 shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm">{task.title}</h4>
        {task.priority && (
          <Badge
            variant="outline"
            className={`text-xs ${
              priorityColors[task.priority] || priorityColors.normal
            }`}
          >
            {task?.priority}
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Contractor:{" "}
        <span className="font-medium text-foreground">{contractorName}</span>
      </p>

      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Deadline:</span> {deadline}
      </div>

      <div className="space-y-1">
        <Progress value={progressVal} />
        <p className="text-xs text-right text-muted-foreground">
          {progressVal}%
        </p>
      </div>
    </div>
  );
};

export default memo(TaskCard);
