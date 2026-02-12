"use client";
import MainLayout from "@/components/layout/MainLayout";
import { BadgeIndianRupee, Pen, Plus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

import { useAuth } from "@/contexts/AuthContext";
import ContractorProjectsOverview from "@/components/dashboard/contractor/ContractorProjectsOverview";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
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
import { Building, Calendar, ArrowRight, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import SiteInchargeProjectsOverview from "@/components/dashboard/siteincharge/SiteInchargeProjectsOverview";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  //   location: z.string().min(3, "Location is required"),
  labels: z.string().min(0, "Client name is required"),
  //   projectType: z.enum([
  //     "Residential",
  //     "Commercial",
  //     "Industrial",
  //     "Infrastructure",
  //   ]),
  //   startDate: z.string().min(1, "Start date is required"),
  //   estimatedEndDate: z.string().min(1, "Estimated end date is required"),
  //   estimatedBudget: z.coerce
  //     .number()
  //     .positive("Budget must be a positive number"),
  //   description: z.string().optional(),
  //   teamSize: z.coerce
  //     .number()
  //     .int()
  //     .positive("Team size must be a positive integer"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const defaultValues: Partial<ProjectFormValues> = {
  name: "",
  //   location: "",
  labels: "",
  //   projectType: undefined,
  //   startDate: "",
  //   estimatedEndDate: "",
  //   estimatedBudget: 0,
  //   teamSize: 0,
  //   description: "",
};

interface Project {
  id: string;
  name: string;
  location: string;
  clientName: string;
  projectType: string;
  startDate: string;
  estimatedEndDate: string;
  estimatedBudget: number;
  description: string;
  status: string;
  completion: number;
  teamSize: number;
}

type EmployeeType = {
  _id: string;
  name: string;
  role: string;
};

type LabelType = {
  name: string;
  types: EmployeeType[];
};

type DepartmentType = {
  id: string;
  name: string;
  labels: LabelType[];
};

const Department = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [departments, setDepartments] = useState<DepartmentType[]>([]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/departments`,
        { withCredentials: true },
      );

      // ✅ extract departments array correctly
      setDepartments(res.data.departments);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    const res = await fetch(`${import.meta.env.VITE_URL}/api/user/getUsers`, {
      credentials: "include",
    });
    const data = await res.json();
    console.log(data.users);

    setEmployees(data.users);
  };
  //   const onSubmit = async (data: ProjectFormValues) => {
  //     console.log("called");

  //     try {
  //         console.log(labels, "here u goooo");

  //       const payload = {
  //         ...data,
  //         estimatedBudget: parseInt(data.estimatedBudget),
  //         teamSize: parseInt(data.teamSize),
  //       };

  //       console.log("Submitting payload:", payload);

  //       const res = await axios.post("/api/projects", payload); // change URL as needed
  //       console.log("Response:", res.data);

  //       setDialogOpen(false);
  //       form.reset(defaultValues);
  //     } catch (error) {
  //       console.error("Error submitting project:", error);
  //     }
  //   };

  // const onSubmit = async (data: ProjectFormValues) => {
  //   console.log("called");

  //   const payload = {
  //     ...data,
  //     labels,
  //   };

  //   console.log("Submitting payload:", payload);
  // };

  // const onSubmit = async (data: ProjectFormValues) => {
  //   try {
  //     const payload = {
  //       name: data.name,
  //       labels,
  //     };

  //     const res = await axios.post(
  //       `${import.meta.env.VITE_URL}/api/departments/create`,
  //       payload,
  //       { withCredentials: true },
  //     );

  //     console.log(res.data);
  //     setDepartments((prev) => [...prev, res.data.department]);
  //     toast.success("Department created successfully");
  //     fetchDepartments();
  //     setDialogOpen(false);
  //     form.reset();
  //     setLabels([]);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to create department");
  //   }
  // };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const payload = {
        name: data.name,
        labels,
      };

      if (selectedDepartment) {
        // 🔥 UPDATE MODE
        await axios.put(
          `${import.meta.env.VITE_URL}/api/departments/update`,
          {
            id: selectedDepartment._id,
            ...payload,
          },
          { withCredentials: true },
        );

        toast.success("Department updated successfully");
      } else {
        // 🔥 CREATE MODE
        await axios.post(
          `${import.meta.env.VITE_URL}/api/departments/create`,
          payload,
          { withCredentials: true },
        );

        toast.success("Department created successfully");
      }

      await fetchDepartments(); // ✅ Always sync from backend

      setDialogOpen(false);
      setSelectedDepartment(null);
      setLabels([]);
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  useEffect(() => {
    console.log(departments, "hete");
  }, [departments]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Department</h1>
            <p className="text-muted-foreground">
              Manage and create your Departments here.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Department
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Departments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              {/* <p className="text-xs text-muted-foreground">
        Active departments in system
      </p> */}
            </CardContent>
          </Card>

          {/* Total Labels */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Labels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {departments.reduce((acc, dept) => acc + dept.labels.length, 0)}
              </div>
              {/* <p className="text-xs text-muted-foreground">
        Across all departments
      </p> */}
            </CardContent>
          </Card>

          {/* Total Members */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-2xl font-bold">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                {
                  [
                    ...new Set(
                      departments.flatMap((dept) =>
                        dept.labels.flatMap((label) =>
                          label.types.map((emp) => emp.userId),
                        ),
                      ),
                    ),
                  ].length
                }
              </div>
              {/* <p className="text-xs text-muted-foreground">
        Unique employees assigned
      </p> */}
            </CardContent>
          </Card>
        </div>

        {/* --------- main card --------- */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((department) => (
            <Card key={department._id} className="bg-muted/30 border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    {department.name}
                  </CardTitle>

                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-muted transition"
                    onClick={() => {
                      setSelectedDepartment(department);
                      form.setValue("name", department.name);
                      setLabels(department.labels);
                      setDialogOpen(true);
                    }}
                  >
                    <Pen className="h-4 w-4 text-muted-foreground hover:text-foreground transition" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {department.labels.map((label, labelIndex) => {
                  const key = `${department._id}-${label.name}-${labelIndex}`;
                  const isOpen = openLabel === key;

                  return (
                    <div key={key} className="border rounded-md bg-background">
                      <button
                        type="button"
                        onClick={() => setOpenLabel(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition"
                      >
                        <span className="font-medium">{label.name}</span>
                        <span className="text-xl">{isOpen ? "×" : "+"}</span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 border-t">
                          {label.types.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No employees assigned
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {label.types.map((emp, index) => (
                                <span key={emp.userId}>
                                  <span className="font-medium text-foreground">
                                    {emp.name}
                                  </span>{" "}
                                  — {emp.role}
                                  {index !== label.types.length - 1 && ", "}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Project Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedDepartment
                  ? "Update Department"
                  : "Add New Department"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department Name - Full Width */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Department Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter department name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Add Labels + Button */}
                  <FormField
                    control={form.control}
                    name="labels"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Add Labels</FormLabel>
                        <div className="flex gap-2">
                          <FormControl className="flex-1">
                            <Input placeholder="Enter label name" {...field} />
                          </FormControl>

                          <Button
                            type="button"
                            onClick={() => {
                              if (!field.value?.trim()) return;

                              setLabels((prev) => [
                                ...prev,
                                {
                                  name: field.value.trim(),
                                  types: [],
                                },
                              ]);

                              field.onChange(""); // clear input
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Label
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {labels.length > 0 && (
                    <div className="mt-4 space-y-4 md:col-span-2">
                      <h3 className="text-sm font-semibold">Added Labels</h3>

                      <div className="space-y-3">
                        {labels.map((label, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <span className="text-sm font-medium">
                              {label.name}
                            </span>

                            <div className="flex flex-col items-end gap-2">
                              <Select
                                value="" // always show placeholder
                                onValueChange={(value) => {
                                  const selectedEmp = employees.find(
                                    (e) => e._id === value,
                                  );
                                  if (!selectedEmp) return;

                                  setLabels((prev) =>
                                    prev.map((l, i) =>
                                      i === index
                                        ? l.types.some(
                                            (emp) => emp._id === value,
                                          )
                                          ? l
                                          : {
                                              ...l,
                                              types: [
                                                ...l.types,
                                                {
                                                  _id: selectedEmp._id,
                                                  name: selectedEmp.name,
                                                  role: selectedEmp.role,
                                                },
                                              ],
                                            }
                                        : l,
                                    ),
                                  );
                                }}
                              >
                                <SelectTrigger className="w-[220px]">
                                  <SelectValue placeholder="Select employee" />
                                </SelectTrigger>

                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                  {/* Search */}
                                  <div
                                    className="p-2"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  >
                                    <Input
                                      placeholder="Search by name or role..."
                                      value={employeeSearch}
                                      onChange={(e) =>
                                        setEmployeeSearch(e.target.value)
                                      }
                                      className="h-8"
                                    />
                                  </div>

                                  {employees
                                    .filter((emp) => emp.status === "active")
                                    .filter((emp) =>
                                      `${emp.name} ${emp.role}`
                                        .toLowerCase()
                                        .includes(employeeSearch.toLowerCase()),
                                    )
                                    .map((emp) => (
                                      <SelectItem
                                        key={emp._id}
                                        value={emp._id}
                                        className="pl-2"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {emp.name}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {emp.role}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>

                              {/* Selected Employees Display */}
                              <div className="flex flex-wrap gap-2 justify-end">
                                {label.types.map((emp, typeIndex) => (
                                  <div
                                    key={typeIndex}
                                    className="px-2 py-1 text-xs bg-secondary rounded-md flex items-center gap-1"
                                  >
                                    {emp.name} — {emp.role}
                                    <button
                                      type="button"
                                      className="text-muted-foreground hover:text-destructive"
                                      onClick={() => {
                                        setLabels((prev) =>
                                          prev.map((l, i) =>
                                            i === index
                                              ? {
                                                  ...l,
                                                  types: l.types.filter(
                                                    (employee) =>
                                                      employee._id !== emp._id,
                                                  ),
                                                }
                                              : l,
                                          ),
                                        );
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedDepartment
                      ? "Update Department"
                      : "Add Department"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Department;
