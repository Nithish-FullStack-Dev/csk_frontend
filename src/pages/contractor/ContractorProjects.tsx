import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Project } from "@/utils/project/ProjectConfig";
import {
  useFloorUnits,
  useProjects,
  useUnits,
} from "@/utils/buildings/Projects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const projectSchema = z.object({
  project: z.string().min(3, "Project name must be at least 3 characters"),
  location: z.string().min(3, "Location is required"),
  clientName: z.string().min(3, "Client name is required"),
  floorUnit: z.string().min(3, "floor unit must be at least 3 characters"),
  unit: z.string().min(3, "unit must be at least 3 characters"),
  projectType: z.enum([
    "Residential",
    "Commercial",
    "Industrial",
    "Infrastructure",
  ]),
  startDate: z.string().min(1, "Start date is required"),
  estimatedEndDate: z.string().min(1, "Estimated end date is required"),
  estimatedBudget: z.coerce
    .number()
    .positive("Budget must be a positive number"),
  description: z.string().optional(),
  teamSize: z.coerce
    .number()
    .int()
    .positive("Team size must be a positive integer"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Sample project data
const sampleProjects = [
  {
    _id: "1",
    name: "Skyline Towers Construction",
    location: "Downtown Metro City",
    clientName: "CSK Realtors Ltd.",
    projectType: "Residential",
    startDate: "2023-06-01",
    estimatedEndDate: "2024-12-15",
    estimatedBudget: 7800000,
    description:
      "Construction of a 12-story residential tower with 48 premium apartments and amenities including gym, swimming pool, and community space.",
    status: "In Progress",
    completion: 35,
    teamSize: 48,
  },
  {
    _id: "2",
    name: "Green Valley Villas Phase 1",
    location: "East Metro City",
    clientName: "CSK Realtors Ltd.",
    projectType: "Residential",
    startDate: "2023-02-15",
    estimatedEndDate: "2023-12-30",
    estimatedBudget: 4500000,
    description:
      "Development of 24 luxury villas in a gated community with landscaped gardens and community center.",
    status: "In Progress",
    completion: 75,
    teamSize: 32,
  },
  {
    _id: "3",
    name: "Riverside Apartments Foundation",
    location: "River District",
    clientName: "CSK Realtors Ltd.",
    projectType: "Residential",
    startDate: "2023-09-01",
    estimatedEndDate: "2024-05-30",
    estimatedBudget: 2800000,
    description:
      "Foundation and structural work for the Riverside Apartments complex.",
    status: "In Progress",
    completion: 15,
    teamSize: 24,
  },
];

const ContractorProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFloorUnit, setSelectedFloorUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
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

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectType: "Residential",
      teamSize: 1,
    },
  });

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
      query.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create project");
      console.log("Failed to create project", err);
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    const newProject: Project = {
      projectId: data.project,
      clientName: data.clientName,
      startDate: data.startDate,
      endDate: data.estimatedEndDate,
      estimatedBudget: data.estimatedBudget,
      description: data.description || "",
      status: "New",
      teamSize: data.teamSize,
      floorUnit: data.floorUnit,
      unit: data.unit,
      siteIncharge: user.role === "site-incharge" ? user._id : null,
    };

    createProject.mutate(newProject);
    setProjects([...projects, newProject]);
    toast.success("Project added successfully!");
    setDialogOpen(false);
    form.reset();
  };

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

  return (
    <MainLayout>
      <div className="space-y-6 p-8">
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
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                {projects.filter((p) => p.status === "In Progress").length} in
                progress, {projects.filter((p) => p.status === "New").length}{" "}
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
            <ContractorProjectsOverview />
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold">Project List</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project._id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold">
                        {typeof project.projectId === "object" &&
                          project?.projectId?.projectName}
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
                        {/* {typeof project.clientName === "object" &&
                          project?.clientName?.name} */}
                        {project?.clientName}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>
                        {project?.startDate.toLocaleString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <ArrowRight className="mx-1 h-3 w-3" />
                      <span>
                        {project?.endDate.toLocaleString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end">
                      <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {project.estimatedBudget.toLocaleString()}
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
          ))}
        </div>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]  max-h-[80vh] w-[90vw] overflow-y-scroll rounded-xl">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Fill in the details below to add a new construction project to your
            portfolio.
          </DialogDescription>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          setSelectedProject(value);
                          field.onChange(value);
                        }}
                        disabled={projectLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                projectLoading
                                  ? "Loading projects..."
                                  : "Select project"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floorUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Unit</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          setSelectedFloorUnit(value);
                          field.onChange(value);
                        }}
                        disabled={
                          floorUnitsLoading ||
                          !floorUnits ||
                          floorUnits.length === 0
                        }
                      >
                        <FormControl>
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
                        </FormControl>
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
                              <SelectItem
                                key={floor._id || idx}
                                value={floor._id}
                              >
                                Floor {floor.floorNumber}, {floor.unitType}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedUnit(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                        disabled={
                          unitsByFloorLoading ||
                          !unitsByFloor ||
                          unitsByFloor.length === 0
                        }
                      >
                        <FormControl>
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
                        </FormControl>
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
                              <SelectItem
                                key={unit._id || idx}
                                value={unit._id}
                              >
                                Plot {unit?.plotNo}, {unit?.propertyType}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Residential">
                            Residential
                          </SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Infrastructure">
                            Infrastructure
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Budget (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder="5000000"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project details"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the project scope and
                      objectives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Project</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ContractorProjects;
