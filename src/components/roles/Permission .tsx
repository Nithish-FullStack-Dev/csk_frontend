import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { Roles, UserRole } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRoles } from "@/pages/UserManagement";
import CircleLoader from "../CircleLoader";

const moduleConfig: Record<string, string[]> = {
  "Core Modules": ["Dashboard", "Properties"],
  "Admin Modules": ["User Management", "Content Management", "System Settings"],
  "Sales Modules": [
    "Team Management",
    "Lead Management",
    "Commissions",
    "Customer Management",
    "Enquiry",
  ],
  "Team Lead": [
    "My Team",
    "Site Visits",
    "Car Allocation",
    "Approvals",
    "My Schedule",
  ],
  "Site Incharge": [
    "Projects Overview",
    "Construction Timeline",
    "Site Inspections",
    "Inspection Schedule",
  ],
  Contractor: ["Project Tasks"],
  "Operations Modules": [
    "Projects",
    "Task Management",
    "Quality Control",
    "Site Inspections",
    "Contractors",
    "Materials",
    "Labor Management",
    "Photo Evidence",
  ],
  "Finance Modules": [
    "Invoices",
    "Payments",
    "Budget Tracking",
    "Tax Documents",
    "Reports",
  ],
  "Communication Modules": ["Communications"],
};

const permissions = ["read", "write", "edit", "delete", "view_only"];

export default function Permission() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("owner");
  const [accessMatrix, setAccessMatrix] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const {
    data: roles,
    isLoading,
    isError,
    error,
  } = useQuery<Roles[]>({
    queryKey: ["roles"],
    queryFn: fetchAllRoles,
  });

  // Fetch saved permissions when role changes
  useEffect(() => {
    if (!selectedRole) return;

    const fetchRolePermissions = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_URL}/api/role/getRole/${selectedRole}`,
          { withCredentials: true }
        );

        if (data && data.permissions) {
          const newMatrix: Record<string, boolean> = {};
          data.permissions.forEach((p: any) => {
            Object.entries(p.actions).forEach(
              ([action, value]: [string, boolean]) => {
                const key = `${selectedRole}-${p.module}-${p.submodule}-${action}`;
                newMatrix[key] = value;
              }
            );
          });
          setAccessMatrix(newMatrix);
        } else {
          setAccessMatrix({});
        }
      } catch (err) {
        console.error("Error fetching role permissions:", err);
        setAccessMatrix({});
      }
    };

    fetchRolePermissions();
  }, [selectedRole]);

  if (isError) {
    console.error("Failed to fetch roles", error);
    toast.error("Failed to fetch roles");
    return null;
  }

  if (isLoading || !roles) return <CircleLoader />;

  const togglePermission = (
    module: string,
    submodule: string,
    permission: string
  ) => {
    const key = `${selectedRole}-${module}-${submodule}-${permission}`;
    setAccessMatrix((prev) => {
      const newState = { ...prev };

      if (permission === "view_only") {
        const readKey = `${selectedRole}-${module}-${submodule}-read`;
        const writeKey = `${selectedRole}-${module}-${submodule}-write`;
        const editKey = `${selectedRole}-${module}-${submodule}-edit`;
        const deleteKey = `${selectedRole}-${module}-${submodule}-delete`;

        const newValue = !prev[key];
        newState[key] = newValue;
        newState[readKey] = true; // always ON with view_only
        newState[writeKey] = false;
        newState[editKey] = false;
        newState[deleteKey] = false;
        return newState;
      }

      newState[key] = !prev[key];
      return newState;
    });
  };

  const toggleModule = (module: string, value: boolean) => {
    setAccessMatrix((prev) => {
      const newState = { ...prev };
      const subs = moduleConfig[module];
      subs.forEach((sub) => {
        permissions.forEach((perm) => {
          const key = `${selectedRole}-${module}-${sub}-${perm}`;
          if (perm === "view_only") newState[key] = false;
          else newState[key] = value;
        });
      });
      return newState;
    });
  };

  const handleSave = async () => {
    setSaving(true); // disable button while saving
    const permissionsPayload = Object.entries(moduleConfig).flatMap(
      ([module, subs]) =>
        subs.map((sub) => {
          const actions: Record<string, boolean> = {};
          permissions.forEach((perm) => {
            const key = `${selectedRole}-${module}-${sub}-${perm}`;
            actions[perm] = !!accessMatrix[key];
          });
          return { module, submodule: sub, actions };
        })
    );

    const payload = { name: selectedRole, permissions: permissionsPayload };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/role/addRole`,
        payload,
        { withCredentials: true }
      );
      toast.success("Role saved successfully", {
        description: `${selectedRole.replace(/_/g, " ")} permissions updated.`,
      });
    } catch (err) {
      console.error("Error saving role:", err);
      toast.error("Failed to save role");
    } finally {
      setSaving(false); // re-enable button after saving
    }
  };

  const handleReset = () => setAccessMatrix({});

  return (
    <div className="p-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="md:space-y-6 space-y-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div className="flex flex-col gap-2 w-full md:w-[50%]">
              <Label className="text-sm md:text-base">Select Role</Label>
              <Select
                onValueChange={(val: UserRole) => setSelectedRole(val)}
                value={selectedRole}
              >
                <SelectTrigger className="w-full md:w-[60%]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    // ?.filter((role) => role.name !== "admin")
                    .map((role) => (
                      <SelectItem key={role._id} value={role.name}>
                        {role.name
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <Button
                variant="outline"
                className="flex items-center gap-1 w-full md:w-auto"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              <Button
                className="flex items-center gap-1 w-full md:w-auto"
                onClick={handleSave}
                disabled={saving} // disable during save
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}{" "}
              </Button>
            </div>
          </div>

          {Object.entries(moduleConfig).map(([module, submodules]) => (
            <div
              key={module}
              className="border p-4 rounded-md mb-6 space-y-4 overflow-x-auto"
            >
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <h5 className="text-[10px] font-medium text-black-600 border rounded-full px-3 py-1 shadow-sm font-sans">
                  {module.split(" ")[0]}
                </h5>
                <h3 className="font-medium text-base md:text-lg">{module}</h3>
                <Switch
                  checked={submodules.every((sub) =>
                    permissions.some(
                      (perm) =>
                        accessMatrix[`${selectedRole}-${module}-${sub}-${perm}`]
                    )
                  )}
                  onCheckedChange={(val) => toggleModule(module, val)}
                />
              </div>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px] md:w-[200px] text-left font-semibold">
                        Module
                      </TableHead>
                      {permissions.map((perm) => (
                        <TableHead
                          key={perm}
                          className="capitalize text-center min-w-[90px] md:w-[100px]"
                        >
                          {perm.replace("_", " ")}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submodules.map((sub) => (
                      <TableRow key={sub}>
                        <TableCell className="text-left font-medium whitespace-nowrap">
                          {sub}
                        </TableCell>
                        {permissions.map((perm) => {
                          const key = `${selectedRole}-${module}-${sub}-${perm}`;
                          const isActive = !!accessMatrix[key];
                          return (
                            <TableCell
                              key={perm}
                              className="text-center min-w-[90px]"
                            >
                              <Switch
                                checked={isActive}
                                onCheckedChange={() =>
                                  togglePermission(module, sub, perm)
                                }
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
