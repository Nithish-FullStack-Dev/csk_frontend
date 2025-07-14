
import { useState } from "react";
import { 
  DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface CreateInvoiceDialogProps {
  onOpenChange: (open: boolean) => void;
}

interface CompletedTask {
  id: string;
  title: string;
  project: string;
  unit: string;
  completedDate: string;
  amount: number;
}

// Sample completed tasks (in a real app, this would come from an API)
const sampleCompletedTasks: CompletedTask[] = [
  {
    id: "t1",
    title: "Foundation concrete pouring",
    project: "Riverside Tower / Block A",
    unit: "Block A",
    completedDate: "2025-04-10",
    amount: 12500
  },
  {
    id: "t2",
    title: "Wall plastering",
    project: "Green Villa / Villa 2",
    unit: "Villa 2",
    completedDate: "2025-04-08",
    amount: 8750
  },
  {
    id: "t3",
    title: "Roof waterproofing",
    project: "Valley Heights / Unit 4",
    unit: "Unit 4",
    completedDate: "2025-04-03",
    amount: 9300
  }
];

const CreateInvoiceDialog = ({ onOpenChange }: CreateInvoiceDialogProps) => {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(Math.random() * 10000)}`);
  const [projectFilter, setProjectFilter] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // Calculate total based on selected tasks
  const total = sampleCompletedTasks
    .filter(task => selectedTasks.includes(task.id))
    .reduce((sum, task) => sum + task.amount, 0);
  
  const filteredTasks = projectFilter
    ? sampleCompletedTasks.filter(task => task.project.includes(projectFilter))
    : sampleCompletedTasks;

  const handleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (selectedTasks.length === 0) {
      toast.error("Please select at least one task");
      return;
    }
    
    // Create invoice object (in a real app, this would be sent to an API)
    const invoice = {
      id: invoiceNumber,
      taskIds: selectedTasks,
      total,
      createdAt: new Date().toISOString()
    };
    
    // Show success message and close dialog
    toast.success("Invoice created successfully", {
      description: `Invoice #${invoiceNumber} for $${total.toFixed(2)} has been created`
    });
    
    // Reset form and close dialog
    setSelectedTasks([]);
    setInvoiceNumber(`INV-${Math.floor(Math.random() * 10000)}`);
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogDescription>
          Generate an invoice for completed tasks. Select the tasks you want to include.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input 
              id="invoiceNumber" 
              value={invoiceNumber} 
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectFilter">Filter by Project</Label>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger id="projectFilter">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-projects">All Projects</SelectItem>
                <SelectItem value="Riverside Tower">Riverside Tower</SelectItem>
                <SelectItem value="Valley Heights">Valley Heights</SelectItem>
                <SelectItem value="Green Villa">Green Villa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Project/Unit</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No completed tasks available</TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleTaskSelection(task.id)}
                      />
                    </TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.project}</TableCell>
                    <TableCell>{new Date(task.completedDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">${task.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-between items-center px-4">
          <span>Selected Tasks: {selectedTasks.length}</span>
          <div className="text-xl font-bold">
            Total: ${total.toFixed(2)}
          </div>
        </div>
        
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={selectedTasks.length === 0}>
            Generate Invoice
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default CreateInvoiceDialog;

