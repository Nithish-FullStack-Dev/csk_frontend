import { useState } from "react";
import { useAuth, User } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ContractorProjectsOverview from "@/components/dashboard/contractor/ContractorProjectsOverview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Building,
  Calendar,
  ArrowRight,
  Clock,
  BadgeIndianRupee,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Project, usefetchProjects } from "@/utils/project/ProjectConfig";
import {
  useFloorUnits,
  useProjects,
  useUnits,
} from "@/utils/buildings/Projects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";

// Project form values type
interface ProjectFormValues {
  project: string;
  clientName: string;
  floorUnit: string;
  unit: string;
  startDate: string;
  estimatedEndDate: string;
  estimatedBudget: number;
  description: string;
  teamSize: number;
  siteIncharge: User | string;
  status: string;
}

// Validation function
const validateForm = (formData: ProjectFormValues) => {
  const errors: Partial<Record<keyof ProjectFormValues, string>> = {};

  if (formData.project.length < 3) {
    errors.project = "Project name must be at least 3 characters";
  }
  if (formData.clientName.length < 3) {
    errors.clientName = "Client name is required";
  }
  if (formData.floorUnit.length < 3) {
    errors.floorUnit = "Floor unit must be at least 3 characters";
  }
  if (formData.unit.length < 3) {
    errors.unit = "Unit must be at least 3 characters";
  }
  if (!formData.startDate) {
    errors.startDate = "Start date is required";
  }
  if (!formData.estimatedEndDate) {
    errors.estimatedEndDate = "Estimated end date is required";
  }
  if (formData.estimatedBudget <= 0) {
    errors.estimatedBudget = "Budget must be a positive number";
  }
  if (formData.teamSize <= 0) {
    errors.teamSize = "Team size must be a positive integer";
  }

  return errors;
};

const ContractorProjects = () => {
  const { user } = useAuth();
  // const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFloorUnit, setSelectedFloorUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [formData, setFormData] = useState<ProjectFormValues>({
    project: "",
    clientName: "",
    floorUnit: "",
    unit: "",
    startDate: "",
    estimatedEndDate: "",
    estimatedBudget: 0,
    description: "",
    teamSize: 1,
    siteIncharge: "",
    status: "",
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ProjectFormValues, string>>
  >({});
  const query = useQueryClient();

  const {
    data: projectsDropDown = [],
    isLoading: projectLoading,
    error: dropdownError,
    isError: dropdownIsError,
  } = useProjects();

  const {
    data: floorUnits = [],
    isLoading: floorUnitsLoading,
    isError: floorUnitsError,
    error: floorUnitsErrorMessage,
  } = useFloorUnits(selectedProject);

  const {
    data: unitsByFloor = [],
    isLoading: unitsByFloorLoading,
    isError: unitsByFloorError,
    error: unitsByFloorErrorMessage,
  } = useUnits(selectedProject, selectedFloorUnit);

  const {
    data: projects,
    isError: projectError,
    error: projectErr,
    isLoading: projectLoad,
  } = usefetchProjects();

  const createProject = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/project/create-project`,
        payload,
        {
          withCredentials: true,
        }
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Project created successfully");
      query.invalidateQueries({ queryKey: ["fetchProjects"] });
      setDialogOpen(false);
      setFormData({
        project: "",
        clientName: "",
        floorUnit: "",
        unit: "",
        startDate: "",
        estimatedEndDate: "",
        estimatedBudget: 0,
        description: "",
        teamSize: 1,
        siteIncharge: "",
        status: "",
      });
      setFormErrors({});
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create project");
      console.log("Failed to create project", err);
    },
  });

  if (floorUnitsError) {
    console.log("Failed to load floor units. Please try again.");
    toast.error(floorUnitsErrorMessage.message);
    return null;
  }

  if (unitsByFloorError) {
    console.log("Failed to load units. Please try again.");
    toast.error(unitsByFloorErrorMessage.message);
    return null;
  }

  if (dropdownIsError) {
    console.log("Failed to load dropdown data. Please try again.");
    toast.error(dropdownError.message);
    return null;
  }

  if (projectError) {
    console.log("Failed to load projects. Please try again.");
    toast.error(
      projectErr.message || "Failed to load projects. Please try again."
    );
    return null;
  }

  if (projectLoad) return <Loader />;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: keyof ProjectFormValues
  ) => {
    const value = typeof e === "string" ? e : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "estimatedBudget" || field === "teamSize"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      const newProject: Project = {
        projectId: formData.project,
        clientName: formData.clientName,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.estimatedEndDate),
        estimatedBudget: formData.estimatedBudget,
        description: formData.description,
        teamSize: formData.teamSize,
        floorUnit: formData.floorUnit,
        unit: formData.unit,
        siteIncharge: user.role === "site_incharge" ? user._id : null,
        status: formData.status,
      };

      createProject.mutate(newProject);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 md:p-8 p-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground">
              Manage and track your construction projects
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length}</div>
              <p className="text-xs text-muted-foreground">
                {projects?.filter((p) => p.status === "In Progress").length} in
                progress, {projects?.filter((p) => p.status === "New").length}{" "}
                new
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-2xl font-bold">
                <BadgeIndianRupee className="mr-1 h-4 w-4 text-muted-foreground" />
                {projects
                  .reduce((acc, curr) => acc + curr.estimatedBudget, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {projects.length} projects
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-2xl font-bold">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                {projects
                  .reduce((acc, curr) => acc + curr.teamSize, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Working across all projects
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractorProjectsOverview
              projects={projects}
              isLoading={projectLoad}
              isError={projectError}
              error={projectErr}
            />
          </CardContent>
        </Card>

        {/* <h2 className="text-2xl font-semibold">Project List</h2>
        <div className="space-y-4">
          {projects.map((project) => {
            return (
              <Card key={project._id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold">
                          {typeof project.projectId === "object" &&
                            project?.projectId?.projectName +
                              " " +
                              (typeof project.floorUnit === "object" &&
                                " - \nFloor " +
                                  project?.floorUnit?.floorNumber +
                                  ", " +
                                  project?.floorUnit?.unitType) +
                              (typeof project.unit === "object" &&
                                " - Plot " + project?.unit?.plotNo)}
                        </h3>
                        <Badge
                          variant={
                            project.status === "In Progress"
                              ? "default"
                              : "outline"
                          }
                        >
                          {project?.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Building className="mr-1 h-4 w-4" />
                        <span>
                          {typeof project.projectId === "object" &&
                            project?.projectId?.location}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>
                          {new Date(project?.startDate)?.toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <ArrowRight className="mx-1 h-3 w-3" />
                        <span>
                          {new Date(project?.endDate)?.toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {project?.estimatedBudget?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-end text-sm text-muted-foreground mt-1">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>
                          {typeof project.floorUnit === "object" &&
                            project?.floorUnit?.floorNumber}
                          % completed
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="text-sm text-muted-foreground">
                    {project.description}
                  </div>

                  <div className="flex justify-end mt-4 space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/contractor/timeline/${project._id}`}>
                        View Timeline
                      </a>
                    </Button>
                    <Button size="sm" asChild>
                      <a href={`/contractor/tasks/${project._id}`}>
                        Manage Tasks
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div> */}
      </div>

      {/* Add Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] w-[90vw] overflow-y-scroll rounded-xl">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Fill in the details below to add a new construction project to your
            portfolio.
          </DialogDescription>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Building</label>
                <Select
                  value={formData.project}
                  onValueChange={(value) => {
                    setSelectedProject(value);
                    handleInputChange(value, "project");
                  }}
                  disabled={projectLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        projectLoading
                          ? "Loading projects..."
                          : "Select project"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {projectLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      projectsDropDown &&
                      projectsDropDown.map((project, idx) => (
                        <SelectItem
                          key={project._id || idx}
                          value={project._id}
                        >
                          {project.projectName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.project && (
                  <p className="text-sm text-red-500">{formErrors.project}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Floor Unit</label>
                <Select
                  value={formData.floorUnit}
                  onValueChange={(value) => {
                    setSelectedFloorUnit(value);
                    handleInputChange(value, "floorUnit");
                  }}
                  disabled={
                    floorUnitsLoading || !floorUnits || floorUnits.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        floorUnitsLoading
                          ? "Loading Floor Units..."
                          : !floorUnits || floorUnits.length === 0
                          ? "No floor units available"
                          : "Select Floor Unit"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {floorUnitsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : !floorUnits || floorUnits.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No floor units available
                      </SelectItem>
                    ) : (
                      floorUnits &&
                      floorUnits.map((floor, idx) => (
                        <SelectItem key={floor._id || idx} value={floor._id}>
                          Floor {floor.floorNumber}, {floor.unitType}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.floorUnit && (
                  <p className="text-sm text-red-500">{formErrors.floorUnit}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Unit</label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => {
                    setSelectedUnit(value);
                    handleInputChange(value, "unit");
                  }}
                  disabled={
                    unitsByFloorLoading ||
                    !unitsByFloor ||
                    unitsByFloor.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        unitsByFloorLoading
                          ? "Loading Units..."
                          : !unitsByFloor || unitsByFloor.length === 0
                          ? "No units available"
                          : "Select Unit"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsByFloorLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : !unitsByFloor || unitsByFloor.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No units available
                      </SelectItem>
                    ) : (
                      unitsByFloor &&
                      unitsByFloor.map((unit, idx) => (
                        <SelectItem key={unit._id || idx} value={unit._id}>
                          Plot {unit?.plotNo}, {unit?.propertyType}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.unit && (
                  <p className="text-sm text-red-500">{formErrors.unit}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => handleInputChange(e, "clientName")}
                  placeholder="Enter client name"
                />
                {formErrors.clientName && (
                  <p className="text-sm text-red-500">
                    {formErrors.clientName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Project Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange(value, "status")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                    <SelectItem value="Under Inspection">
                      Under Inspection
                    </SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {formErrors.status && (
                  <p className="text-sm text-red-500">{formErrors.status}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange(e, "startDate")}
                />
                {formErrors.startDate && (
                  <p className="text-sm text-red-500">{formErrors.startDate}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">
                  Estimated End Date
                </label>
                <Input
                  type="date"
                  value={formData.estimatedEndDate}
                  onChange={(e) => handleInputChange(e, "estimatedEndDate")}
                />
                {formErrors.estimatedEndDate && (
                  <p className="text-sm text-red-500">
                    {formErrors.estimatedEndDate}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">
                  Estimated Budget (₹)
                </label>
                <div className="relative">
                  <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => handleInputChange(e, "estimatedBudget")}
                    placeholder="5000000"
                  />
                </div>
                {formErrors.estimatedBudget && (
                  <p className="text-sm text-red-500">
                    {formErrors.estimatedBudget}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Team Size</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange(e, "teamSize")}
                  placeholder="10"
                />
                {formErrors.teamSize && (
                  <p className="text-sm text-red-500">{formErrors.teamSize}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Project Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange(e, "description")}
                placeholder="Enter project details"
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Provide a brief description of the project scope and objectives
              </p>
              {formErrors.description && (
                <p className="text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setFormData({
                    project: "",
                    clientName: "",
                    floorUnit: "",
                    unit: "",
                    startDate: "",
                    estimatedEndDate: "",
                    estimatedBudget: 0,
                    description: "",
                    teamSize: 1,
                    siteIncharge: "",
                    status: "",
                  });
                  setFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Project</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ContractorProjects;
