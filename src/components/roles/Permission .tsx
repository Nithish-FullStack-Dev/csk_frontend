import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CircleLoader from "../CircleLoader";

const permissions = ["read", "write", "edit", "delete", "view_only"];

const defaultModuleConfig: Record<string, string[]> = {
  "Core Modules": ["Dashboard", "Properties"],
  "Admin Modules": ["User Management", "Content Management", "System Settings"],
  "Sales Modules": [
    "Sales Pipeline",
    "Team Management",
    "Lead Management",
    "Commissions",
  ],
  "Operations Modules": [
    "Projects",
    "Task Management",
    "Quality Control",
    "Site Inspections",
    "Contractors",
    "Materials",
    "Labor Management",
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

// API functions
export const fetchAllRoles = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/role/roles`
  );
  return data || [];
};

export const fetchRolePermissions = async (roleName: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/role/getRole/${roleName}`
  );
  return data || null;
};

export default function Permission() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [accessMatrix, setAccessMatrix] = useState<Record<string, boolean>>({});
  const [moduleConfig, setModuleConfig] =
    useState<Record<string, string[]>>(defaultModuleConfig);

  const queryClient = useQueryClient();

  const {
    data: roles,
    isLoading,
    isError,
    error,
  } = useQuery<Roles[]>({
    queryKey: ["roles"],
    queryFn: fetchAllRoles,
  });

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["rolePermissions", selectedRole],
    queryFn: () => fetchRolePermissions(selectedRole),
    enabled: !!selectedRole,
  });

  useEffect(() => {
    const buildPermissions = () => {
      const matrix: Record<string, boolean> = {};
      const grouped: Record<string, string[]> = { ...defaultModuleConfig };

      Object.entries(defaultModuleConfig).forEach(([module, subs]) => {
        subs.forEach((sub) => {
          permissions.forEach((perm) => {
            const key = `${selectedRole}-${module}-${sub}-${perm}`;
            matrix[key] = false;
          });
        });
      });

      if (roleData?.permissions) {
        roleData.permissions.forEach((perm: any) => {
          const { module, submodule, actions } = perm;
          Object.entries(actions).forEach(([action, value]) => {
            const key = `${selectedRole}-${module}-${submodule}-${action}`;
            matrix[key] = !!value;
          });
        });
      }

      setAccessMatrix(matrix);
      setModuleConfig(grouped);
    };

    buildPermissions();
  }, [roleData, selectedRole]);

  if (isError) {
    console.error("Failed to fetch roles", error);
    toast.error("Failed to fetch roles");
    return null;
  }

  if (isLoading || roleLoading) {
    return <CircleLoader />;
  }

  const togglePermission = (
    module: string,
    submodule: string,
    permission: string
  ) => {
    const key = `${selectedRole}-${module}-${submodule}-${permission}`;
    setAccessMatrix((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
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

    const payload = {
      name: selectedRole,
      permissions: permissionsPayload,
    };

    try {
      await axios.post(`${import.meta.env.VITE_URL}/api/role/addRole`, payload);
      toast.success("Role saved successfully", {
        description: `${selectedRole.replace(/_/g, " ")} permissions updated.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRole],
      });
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Failed to save role");
    }
  };

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
                  {roles?.map((role) => (
                    <SelectItem key={role._id} value={role?.name}>
                      {role?.name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <Button
                className="flex items-center gap-1 w-full md:w-auto"
                onClick={handleSave}
              >
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </div>

          {Object.entries(moduleConfig).map(([module, submodules]) => (
            <div
              key={module}
              className="border p-4 rounded-md mb-6 space-y-4 overflow-x-auto"
            >
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <h5 className="text-[10px] font-medium border rounded-full px-3 py-1 shadow-sm font-sans">
                  {module.split(" ")[0]}
                </h5>
                <h3 className="font-medium text-base md:text-lg">{module}</h3>
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
                          key={`${module}-${perm}`}
                          className="capitalize text-center min-w-[90px] md:w-[100px]"
                        >
                          {perm.replace("_", " ")}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submodules.map((sub) => (
                      <TableRow key={`${module}-${sub}`}>
                        <TableCell className="text-left font-medium whitespace-nowrap">
                          {sub}
                        </TableCell>
                        {permissions.map((perm) => {
                          const key = `${selectedRole}-${module}-${sub}-${perm}`;
                          const isActive = !!accessMatrix[key];
                          return (
                            <TableCell
                              key={`${module}-${sub}-${perm}`}
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
