
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { toast } from "sonner";
import { CONSTRUCTION_PHASES } from "@/types/construction";

interface AddConstructionTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

const AddConstructionTaskDialog = ({ 
  open, 
  onOpenChange,
  projectId 
}: AddConstructionTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title || !description || !phase || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // In a real app, this would save to backend
    toast.success("Construction task created successfully", {
      description: `${title} has been added to the project`,
    });
    
    // Reset form and close dialog
    setTitle("");
    setDescription("");
    setPhase("");
    setStartDate(new Date());
    setEndDate(new Date());
    setAssignedTo("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Construction Task</DialogTitle>
          <DialogDescription>
            Create a new construction task for the project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the construction task"
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phase">Construction Phase</Label>
            <Select value={phase} onValueChange={setPhase} required>
              <SelectTrigger id="phase">
                <SelectValue placeholder="Select construction phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Construction Phases</SelectLabel>
                  {Object.entries(CONSTRUCTION_PHASES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="border rounded-md p-2">
                <DatePicker 
                  date={startDate} 
                  setDate={setStartDate} 
                  showMonthYearDropdowns
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="border rounded-md p-2">
                <DatePicker 
                  date={endDate} 
                  setDate={setEndDate}
                  showMonthYearDropdowns 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assigned">Assigned To</Label>
            <Input 
              id="assigned" 
              value={assignedTo} 
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Enter names or team assignments"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddConstructionTaskDialog;
