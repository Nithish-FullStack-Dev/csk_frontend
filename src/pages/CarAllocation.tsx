import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Car, Key, Users, Settings, Fuel, Plus, Calendar } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader"; // Assuming you have this component
import { useAuth, User } from "@/contexts/AuthContext"; // Assuming your Auth context is here
import { DatePicker } from "@/components/ui/date-picker";
import { TeamMember } from "./TeamManagement";

// --- Interface Definitions (Ensure these match your backend types) ---

interface AssignedTo {
  agent: User;
  assignedUntil: Date;
}

interface UsageLog {
  agent: string; // Agent ID
  assignedBy: string; // Team Lead ID
  assignedAt: Date;
  assignedUntil: Date;
  actualReturnAt?: Date;
  notes?: string;
}

interface Vehicle {
  _id: string;
  model: string;
  licensePlate: string;
  status: "available" | "assigned" | "maintenance" | "booked";
  type: "HatchBack" | "Sedan" | "SUV" | "";
  capacity: "4 persons" | "5 persons" | "7 persons" | "";
  assignedTo: AssignedTo | null;
  fuelLevel: number;
  mileage: number;
  assignedBy?: string; // ✅ Add this
  assignedAt?: Date; // ✅ Add this
  actualReturnAt?: Date; // ✅ Add for unassignment logic
  lastService: Date;
  location: string;
  notes?: string;
  usageLogs?: UsageLog[]; // Added usageLogs to the Vehicle interface
  createdAt: Date;
  updatedAt: Date;
}

interface RecentActivity {
  id: string;
  description: string;
  timestamp: Date;
  icon: React.ElementType; // Icon component (e.g., Users, Settings, Fuel)
  colorClass: string;
}

const fetchAllVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/cars/getAllCars`,
    {
      withCredentials: true,
    }
  );
  return data;
};

const updateVehicle = async (vehicle: Vehicle): Promise<Vehicle> => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_URL}/api/cars/updateCarById/${vehicle._id}`,
    vehicle,
    { withCredentials: true }
  );
  return data;
};

const addVehicle = async (
  newVehicleData: Omit<Vehicle, "_id" | "createdAt" | "updatedAt">
): Promise<Vehicle> => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/cars/saveCar`,
    newVehicleData,
    { withCredentials: true }
  );
  return data;
};

export const useVehicles = () =>
  useQuery<Vehicle[]>({
    queryKey: ["cars"],
    queryFn: fetchAllVehicles,
    staleTime: 0,
  });

const CarAllocation = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [mileage, setMileage] = useState<number | "">("");
  const [fuelLevel, setFuelLevel] = useState<number | "">("");
  const [type, setType] = useState<Vehicle["type"]>("");
  const [capacity, setCapacity] = useState<Vehicle["capacity"]>("");
  const [status, setStatus] = useState<Vehicle["status"]>("available");
  const [lastService, setLastService] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignedUntil, setAssignedUntil] = useState("");
  const [assignedTo, setAssignedTo] = useState(""); // Stores agent _id
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>({
    _id: "",
    model: "",
    licensePlate: "",
    status: "available",
    type: "" as Vehicle["type"],
    capacity: "" as Vehicle["capacity"],
    assignedTo: null,
    fuelLevel: 0,
    mileage: 0,
    lastService: new Date(),
    location: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );

  const fetchMyTeam = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/team/getAllTeam/${user._id}`,
      { withCredentials: true }
    );
    return data;
  };

  useEffect(() => {
    if (selectedVehicle) {
      setModel(selectedVehicle.model || "");
      setType(selectedVehicle.type || ("" as Vehicle["type"]));
      setCapacity(selectedVehicle.capacity || ("" as Vehicle["capacity"]));
      setLicensePlate(selectedVehicle.licensePlate || "");
      setMileage(selectedVehicle.mileage || 0);
      setFuelLevel(selectedVehicle.fuelLevel || 0);
      setStatus(selectedVehicle.status || "available");
      setLastService(
        selectedVehicle.lastService
          ? new Date(selectedVehicle.lastService)
          : undefined
      );
      setLocation(selectedVehicle.location || "");
      // Reset assignedTo and assignedUntil when editing a different vehicle
      setAssignedTo("");
      setAssignedUntil("");
    }
  }, [selectedVehicle]);

  // Fetches all the cars
  const { data: vehicles, isError, isLoading, error } = useVehicles();

  // Fetch Agents for the current Team Lead
  const {
    data: teamMembers,
    isLoading: teamLoading,
    isError: teamError,
    error: teamErr,
  } = useQuery<Array<TeamMember>>({
    queryKey: ["agents", user?._id],
    queryFn: fetchMyTeam,
    staleTime: 0,
    enabled: !!user?._id,
  });

  // Filter team members who are not currently assigned to any vehicle
  const unassignedTeamMembers = teamMembers?.filter((member) => {
    return !vehicles?.some(
      (vehicle) =>
        vehicle.assignedTo && vehicle.assignedTo.agent._id === member._id
    );
  });

  // Update car by id
  const queryClient = useQueryClient();

  const { mutate: updateCarById, isPending } = useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      setDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["cars"],
        refetchType: "active",
      });
      // Clear assignment states after successful update
      setAssignedTo("");
      setAssignedUntil("");
    },
    onError: (error: any) => {
      toast.error("Failed to update vehicle");
      console.error("Update error:", error);
    },
  });

  // Saving car
  const { mutate: createVehicle, isPending: isCreating } = useMutation({
    mutationFn: addVehicle,
    onSuccess: () => {
      toast.success("Vehicle Saved successfully");
      setAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      // Reset form fields after successful addition
      setModel("");
      setLicensePlate("");
      setMileage("");
      setFuelLevel("");
      setType("" as Vehicle["type"]);
      setCapacity("" as Vehicle["capacity"]);
      setStatus("available");
      setLastService(undefined);
      setLocation("");
    },
    onError: (error: any) => {
      toast.error("Failed to save vehicle");
      console.error("save error:", error);
    },
  });

  // Effect to generate recent activities whenever vehicles data changes
  useEffect(() => {
    if (vehicles) {
      const activities: RecentActivity[] = [];

      vehicles.forEach((vehicle) => {
        const updatedAt = new Date(vehicle?.updatedAt);

        // Assigned vehicle activity
        if (vehicle.status === "assigned" && vehicle.assignedTo?.agent) {
          activities.push({
            id: `${vehicle._id}-assigned`,
            description: `${vehicle.model} (${vehicle.licensePlate}) assigned to ${vehicle.assignedTo.agent.name}`,
            timestamp: updatedAt,
            icon: Users,
            colorClass: "text-blue-600",
          });
        }

        // Maintenance activity
        if (vehicle.status === "maintenance") {
          activities.push({
            id: `${vehicle._id}-maintenance`,
            description: `${vehicle.model} (${vehicle.licensePlate}) is under maintenance`,
            timestamp: updatedAt,
            icon: Settings,
            colorClass: "text-red-600",
          });
        }

        // Low fuel activity
        if (vehicle.fuelLevel <= 25) {
          activities.push({
            id: `${vehicle._id}-fuel-low`,
            description: `${vehicle.model} (${vehicle.licensePlate}) fuel level low - ${vehicle.fuelLevel}%`,
            timestamp: updatedAt,
            icon: Fuel,
            colorClass: "text-yellow-600",
          });
        }
      });

      // Sort by updatedAt
      const sortedActivities = activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 3);

      setRecentActivities(sortedActivities);
    }
  }, [vehicles]);

  if (isLoading || teamLoading) {
    return <Loader />;
  }
  if (isError) {
    toast.error("Failed to fetch Cars Allocation");
    console.error("Error fetching cars", error);
  }
  if (teamError) {
    toast.error("Failed to fetch Team members");
    console.error("Error fetching team", teamErr);
  }

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      assigned: "bg-blue-100 text-blue-800",
      maintenance: "bg-red-100 text-red-800",
      booked: "bg-purple-100 text-purple-800", // Added color for booked status
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getFuelColor = (level: number) => {
    if (level > 50) return "text-green-600";
    if (level > 25) return "text-yellow-600";
    return "text-red-600";
  };

  const availableVehicles = (vehicles || []).filter(
    (v) => v.status === "available"
  ).length;
  const assignedVehicles = (vehicles || []).filter(
    (v) => v.status === "assigned"
  ).length;
  const maintenanceVehicles = (vehicles || []).filter(
    (v) => v.status === "maintenance"
  ).length;

  const handleAddVehicle = () => {
    if (
      !model ||
      !licensePlate ||
      mileage === "" ||
      fuelLevel === "" ||
      !type ||
      !capacity ||
      !status ||
      !lastService ||
      !location
    ) {
      toast.error("Please fill all required fields to add a vehicle.");
      return;
    }
    const payload = {
      model,
      status,
      licensePlate,
      mileage: Number(mileage),
      fuelLevel: Number(fuelLevel),
      type,
      capacity,
      lastService,
      assignedTo: null, // New vehicles are available by default
      location,
      usageLogs: [], // Initialize usageLogs as empty for a new vehicle
    };
    createVehicle(payload);
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle) return;
    if (
      !model ||
      !licensePlate ||
      mileage === "" ||
      fuelLevel === "" ||
      !type ||
      !capacity ||
      !status ||
      !lastService ||
      !location
    ) {
      toast.error("Please fill all required fields to update a vehicle.");
      return;
    }
    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      model,
      licensePlate,
      status: status as Vehicle["status"],
      type: type as Vehicle["type"],
      capacity: capacity as Vehicle["capacity"],
      fuelLevel: Number(fuelLevel),
      mileage: Number(mileage),
      lastService: lastService || new Date(), // Ensure lastService is a Date
      location,
    };
    console.log(updatedVehicle);
    updateCarById(updatedVehicle);
  };

  const handleAssign = (vehicle: Vehicle) => {
    if (!assignedUntil || !assignedTo) {
      toast.error("Please select a team member and assignment end date.");
      return;
    }

    // Find the full team member object for assignedTo.agent
    const selectedTeamMember = unassignedTeamMembers?.find(
      (member) => member._id === assignedTo
    );

    if (!selectedTeamMember) {
      toast.error("Selected team member not found or already assigned.");
      return;
    }

    const assignmentDate = new Date(); // Current date for assignment

    const newUsageLog: UsageLog = {
      agent: selectedTeamMember._id,
      assignedBy: user._id, // The logged-in Team Lead
      assignedAt: assignmentDate,
      assignedUntil: new Date(assignedUntil),
    };

    const updatedVehicle: Vehicle = {
      ...vehicle,
      assignedTo: {
        agent: {
          _id: selectedTeamMember.agentId._id,
          name: selectedTeamMember.agentId.name,
          avatar: selectedTeamMember.agentId.avatar,
          role: selectedTeamMember.agentId.role,
        },
        assignedUntil: new Date(assignedUntil),
      },
      status: "assigned",

      assignedBy: user._id, // Store who assigned it
      assignedAt: assignmentDate, // Store when it was assigned
      usageLogs: [...(vehicle.usageLogs || []), newUsageLog], // Add new log
    };

    console.log("🚗 Assigning Vehicle Update:", updatedVehicle);
    updateCarById(updatedVehicle);
  };

  const handleUnassign = (vehicle: Vehicle) => {
    const updatedVehicle: Vehicle = {
      ...vehicle,
      assignedTo: null,
      status: "available",
      assignedBy: null, // Clear assignedBy
      assignedAt: undefined, // Clear assignedAt
      actualReturnAt: new Date(), // Set actual return time
      // The backend should handle updating the last usage log's actualReturnAt
      // We don't modify usageLogs here directly as the backend usually handles that atomically
    };
    updateCarById(updatedVehicle);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Car Allocation</h1>
            <p className="text-muted-foreground">
              Manage vehicle assignments and availability
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] max-h-[80vh] rounded-xl overflow-scroll">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Vehicle Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Toyota Camry"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Vehicle Type</Label>
                    <Select
                      value={type}
                      onValueChange={(value) => {
                        setType(value as Vehicle["type"]);
                      }}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HatchBack">HatchBack</SelectItem>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Vehicle Capacity</Label>
                    <Select
                      value={capacity}
                      onValueChange={(value) => {
                        setCapacity(value as Vehicle["capacity"]);
                      }}
                    >
                      <SelectTrigger id="capacity">
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4 persons">4 persons</SelectItem>
                        <SelectItem value="5 persons">5 persons</SelectItem>
                        <SelectItem value="7 persons">7 persons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">License Plate</Label>
                    <Input
                      id="license"
                      placeholder="e.g., ABC-123"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Current Mileage</Label>
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="e.g., 45000"
                      value={mileage}
                      onChange={(e) => setMileage(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelLevel">Current Fuel Level</Label>
                    <Input
                      id="fuelLevel"
                      type="number"
                      placeholder="e.g., 50%"
                      value={fuelLevel}
                      onChange={(e) => setFuelLevel(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Current Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as Vehicle["status"])
                      }
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastService">Last Service</Label>
                    <DatePicker date={lastService} setDate={setLastService} />
                  </div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Service Center"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleAddVehicle}
                    disabled={isCreating}
                  >
                    {isCreating ? "Adding..." : "Add Vehicle"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex space-x-2 ">
          <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
            <DialogContent className="max-w-[90vw] max-h-[80vh] rounded-xl overflow-scroll">
              <DialogHeader>
                <DialogTitle>Edit Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Toyota Camry"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value as Vehicle["type"]);
                    }}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HatchBack">HatchBack</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Vehicle Capacity</Label>
                  <Select
                    value={capacity}
                    onValueChange={(value) => {
                      setCapacity(value as Vehicle["capacity"]);
                    }}
                  >
                    <SelectTrigger id="capacity">
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4 persons">4 persons</SelectItem>
                      <SelectItem value="5 persons">5 persons</SelectItem>
                      <SelectItem value="7 persons">7 persons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Plate</Label>
                  <Input
                    id="license"
                    placeholder="e.g., ABC-123"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Current Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="e.g., 45000"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelLevel">Current Fuel Level</Label>
                  <Input
                    id="fuelLevel"
                    type="number"
                    placeholder="e.g., 50%"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Current Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as Vehicle["status"])
                    }
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastService">Last Service</Label>
                  <DatePicker date={lastService} setDate={setLastService} />
                </div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Service Center"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleEditVehicle}
                  disabled={isPending}
                >
                  {isPending ? "Updating..." : "Update Vehicle"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {vehicles?.length || 0}
                </span>
                <Car className="h-6 w-6 text-estate-navy" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{availableVehicles}</span>
                <Key className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{assignedVehicles}</span>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {maintenanceVehicles}
                </span>
                <Settings className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles
            ?.filter(
              (vehicle) =>
                filterStatus === "all" || vehicle.status === filterStatus
            )
            .map((vehicle) => (
              <Card key={vehicle._id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-estate-navy/10 flex items-center justify-center">
                        <Car className="h-6 w-6 text-estate-navy" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vehicle.model}</h3>
                        <p className="text-sm text-muted-foreground my-1">
                          {vehicle.licensePlate}
                        </p>
                        <p className="text-sm text-muted-foreground my-1">
                          {vehicle?.type}
                        </p>
                        <Badge className={getStatusColor(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDialogOpen(true);
                        setSelectedVehicle(vehicle);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vehicle.assignedTo && (
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={vehicle?.assignedTo?.agent?.avatar} />
                        <AvatarFallback>
                          {vehicle?.assignedTo?.agent?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {vehicle.assignedTo?.agent?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Until:{" "}
                          {vehicle?.assignedTo?.assignedUntil
                            ? new Date(
                                vehicle.assignedTo.assignedUntil
                              ).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Fuel Level</p>
                      <p
                        className={`font-semibold ${getFuelColor(
                          vehicle.fuelLevel
                        )}`}
                      >
                        {vehicle.fuelLevel}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mileage</p>
                      <p className="font-semibold">
                        {vehicle.mileage.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Service</p>
                      <p className="font-semibold">
                        {vehicle?.lastService
                          ? new Date(vehicle?.lastService).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-semibold text-xs">
                        {vehicle.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {vehicle.status === "available" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1">
                            <Users className="mr-2 h-3 w-3" />
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[90vw] max-h-[80vh] rounded-xl overflow-scroll">
                          <DialogHeader>
                            <DialogTitle>Assign Vehicle</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Select Team Member</Label>
                              <Select
                                value={assignedTo}
                                onValueChange={setAssignedTo}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose team member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unassignedTeamMembers &&
                                  unassignedTeamMembers.length > 0 ? (
                                    unassignedTeamMembers.map((member) => (
                                      <SelectItem
                                        key={member._id}
                                        value={member._id}
                                      >
                                        {member.agentId.name} -{" "}
                                        {member.agentId.role}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="" disabled>
                                      No unassigned team members available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="assignment-date">
                                Assignment End Date
                              </Label>
                              <Input
                                id="assignment-date"
                                type="date"
                                value={assignedUntil}
                                onChange={(e) =>
                                  setAssignedUntil(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => {
                                handleAssign(vehicle);
                              }}
                            >
                              Assign Vehicle
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {vehicle.status === "assigned" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleUnassign(vehicle)}
                      >
                        <Key className="mr-2 h-3 w-3" />
                        Unassign
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-estate-navy" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <activity.icon
                        className={`h-4 w-4 ${activity.colorClass}`}
                      />
                      <span className="text-sm">{activity.description}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">
                  No recent activities to display.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CarAllocation;

// Helper function to format time ago (you might have a dedicated utility for this)
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};
