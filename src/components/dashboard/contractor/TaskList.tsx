import { memo } from "react";
import TaskCard from "./TaskCard";

const TaskList = ({
  tasks,
  contractors,
  emptyMessage = "No tasks found.",
}: any) => {
  if (!tasks || tasks.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4 pt-3">
      {tasks.map((t: any) => (
        <TaskCard key={t._id} task={t} contractors={contractors} />
      ))}
    </div>
  );
};

export default memo(TaskList);
