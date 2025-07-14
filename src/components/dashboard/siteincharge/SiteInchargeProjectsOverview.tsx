
import React from 'react';
import { useState,useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal } from "lucide-react";
import { Label } from '@radix-ui/react-dropdown-menu';

interface Project {
  id: number;
  name: string;
  progress: number;
  pendingVerifications: number;
  qualityIssues: number;
  nextInspection?: {
    task: string;
    date: string;
  };
  lastUpdated: string;
}

// const projects: Project[] = [
//   {
//     id: 1,
//     name: "Riverside Tower",
//     progress: 68,
//     pendingVerifications: 3,
//     qualityIssues: 1,
//     nextInspection: {
//       task: "Structural Framework - 5th Floor",
//       date: "2025-04-13"
//     },
//     lastUpdated: "2025-04-10"
//   },
//   {
//     id: 2,
//     name: "Valley Heights",
//     progress: 42,
//     pendingVerifications: 5,
//     qualityIssues: 3,
//     nextInspection: {
//       task: "Foundation Inspection - Block B",
//       date: "2025-04-12"
//     },
//     lastUpdated: "2025-04-09"
//   },
//   {
//     id: 3,
//     name: "Green Villa",
//     progress: 16,
//     pendingVerifications: 0,
//     qualityIssues: 1,
//     lastUpdated: "2025-04-08"
//   }
// ];

const SiteInchargeProjectsOverview = ({projects}) => {
  const [open, setOpen] = useState(false);
  const [contractors,setContractors] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [selectedProject,setSelectedProject] = useState(null);
  const navigate = useNavigate();
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUnit || !selectedContractor) return;

    try {
      const payload = {
        projectId: selectedProject._id,
        unit: selectedUnit,
        contractorId: selectedContractor,
      };

      const res = await axios.post("http://localhost:3000/api/project/assign-contractor", payload,{withCredentials:true}); // Replace with your real endpoint
      console.log("Assignment successful:", res.data);

      setOpen(false);
      setSelectedUnit("");
      setSelectedContractor("");
    } catch (error) {
      console.error("Error assigning contractor:", error);
    }
  };

  

  const fetchContractors = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user/contractors");
      setContractors(res.data.data);
    } catch (error) {
      console.error("Failed to fetch contractors:", error);
    }
  };
  useEffect(() => {
    fetchContractors();
  }, []);

  return (
        <div className="space-y-6">
      {projects && projects.map((project) => (
        <div key={project.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">{project.projectTitle}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={()=>{
                  setOpen(true);
                  setSelectedProject(project);
                }}>Assign Contractor</DropdownMenuItem>
                <DropdownMenuItem onClick={()=>{navigate("/schedule")}}>Schedule Inspection</DropdownMenuItem>
                {/* <DropdownMenuItem>Assign Contractor</DropdownMenuItem> */}
                {/* <DropdownMenuItem>Generate Progress Report</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Pending Verifications</p>
              <p className={project.pendingVerifications > 0 ? "font-medium" : ""}>
                {project.pendingVerifications} {project.pendingVerifications === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Quality Issues</p>
              <p className={project.qualityIssues > 0 ? "text-red-600 font-medium" : ""}>
                {project.qualityIssues} {project.qualityIssues === 1 ? 'issue' : 'issues'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            {project.nextInspection ? (
              <div>
                <p className="text-muted-foreground">Next Inspection</p>
                <p>{project.nextInspection.task}</p>
                <p className="text-blue-600">
                  {new Date(project.nextInspection.date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground">Next Inspection</p>
                <p>None scheduled</p>
              </div>
            )}
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Assign Contractor to Unit</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAssign} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Select Unit</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit} required>
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
              <Select value={selectedContractor} onValueChange={setSelectedContractor} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors && contractors?.map((contractor) => (
                    <SelectItem key={contractor._id} value={contractor._id}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>

    
  );
};

export default SiteInchargeProjectsOverview;
