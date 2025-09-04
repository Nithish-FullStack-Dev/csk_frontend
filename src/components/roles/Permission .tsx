import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Save, RotateCcw, Badge } from "lucide-react";
import { UserRole } from "@/contexts/AuthContext";
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

const roles: UserRole[] = [
  "owner",
  "admin",
  "sales_manager",
  "team_lead",
  "agent",
  "site_incharge",
  "contractor",
  "accountant",
  "customer_purchased",
  "customer_prospect",
  "public_user",
];

const moduleConfig: Record<string, string[]> = {
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

const permissions = ["read", "write", "edit", "delete", "view_only"];

export default function Permission() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [accessMatrix, setAccessMatrix] = useState<Record<string, boolean>>({});

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
          return {
            module,
            submodule: sub,
            actions,
          };
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
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Failed to save role");
    }
  };

  const handleReset = () => {
    setAccessMatrix({});
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
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role
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
                <h5 className="text-[10px] font-medium text-black-600 border rounded-full px-3 py-1 shadow-sm font-sans">
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
