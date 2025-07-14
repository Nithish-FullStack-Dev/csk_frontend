import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusType = 'in_progress' | 'completed' | 'pending_review';

interface StatusSelectorProps {
  status: StatusType;
  setStatus: (status: StatusType) => void;
  progressPercent: string;
  setProgressPercent: (percent: string) => void;
}

const StatusSelector = ({
  status,
  setStatus,
  progressPercent,
  setProgressPercent,
}: StatusSelectorProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as StatusType)}
          required
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {status === "in_progress" && (
        <div className="space-y-2">
          <Label htmlFor="progress">Progress Percentage</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="progress"
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full"
              value={progressPercent}
              onChange={(e) => setProgressPercent(e.target.value)}
            />
            <span className="w-12 text-center">{progressPercent}%</span>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusSelector;
