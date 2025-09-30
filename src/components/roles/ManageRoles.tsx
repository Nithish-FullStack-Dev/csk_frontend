import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Shield, Plus, Edit, Delete, User } from "lucide-react";
import clsx from "clsx";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Roles } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllRoles } from "./Permission ";
import Loader from "../Loader";
import CircleLoader from "../CircleLoader";

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-teal-500",
];

const ManageRoles = () => {
  const [roleName, setRoleName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  // const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [userCountMap, setUserCountMap] = useState({});
  const [warning, setWarning] = useState(""); // ⚠️ state for warning message

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

  useEffect(() => {
    getAllUsers();
  }, []);

  const normalizeRole = (roleName: string) =>
    roleName?.toLowerCase().replace(/_/g, " ") || "";

  useEffect(() => {
    const map = {};
    allUsers.forEach((user) => {
      const roleKey = normalizeRole(user.role);
      map[roleKey] = (map[roleKey] || 0) + 1;
    });
    setUserCountMap(map);
  }, [allUsers]);

  if (isError) {
    console.error("failed to fetch roles", error);
    toast.error("failed to fetch roles");
    return null;
  }

  if (isLoading) {
    return <CircleLoader />;
  }

  const getAllUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/user/getUsers`,
        {
          withCredentials: true,
        }
      );
      setAllUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setAllUsers([]);
    }
  };

  const getUserCount = (roleName: string) =>
    userCountMap[normalizeRole(roleName)] || 0;

  const createOrUpdateRole = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.isEditMode && payload.editingRoleId) {
        return axios.put(
          `${import.meta.env.VITE_URL}/api/role/updateRole/${
            payload.editingRoleId
          }`,
          payload.data
        );
      } else {
        return axios.post(
          `${import.meta.env.VITE_URL}/api/role/createRole`,
          payload.data
        );
      }
    },
    onSuccess: () => {
      toast.success("Role saved successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] }); // ✅ refetch roles
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || "Failed to save role";
      toast.error(message);
    },
  });

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(
        `${import.meta.env.VITE_URL}/api/role/deleteRole/${id}`
      );
    },
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] }); // ✅ refetch roles
    },
    onError: () => {
      toast.error("Failed to delete role");
    },
  });

  const handleClearRoleMeta = async (id) => {
    const confirm = window.confirm("Clear role color and description?");
    if (!confirm) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_URL}/api/role/${id}/clear-meta`
      );
      // fetchRoles();
    } catch (err) {
      console.error("Failed to clear role metadata", err);
    }
  };

  const handleCreateOrUpdate = () => {
    if (!roleName.trim()) return;

    createOrUpdateRole.mutate({
      isEditMode,
      editingRoleId,
      data: {
        name: roleName,
        description,
        color: selectedColor,
      },
    });

    // reset form
    setRoleName("");
    setDescription("");
    setSelectedColor(colors[0]);
    setIsEditMode(false);
    setEditingRoleId(null);
    setWarning(""); // clear warning after save
  };

  const handleDeleteRole = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this role?"
    );
    if (!confirmDelete) return;
    deleteRole.mutate(id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 px-4 sm:px-6">
      {/* Left: Create Role */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="w-4 h-4" /> Create / Update Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="block text-sm font-medium">Role Name</Label>
            <Input
              className="w-full mt-1 p-2 border rounded text-sm sm:text-base"
              placeholder="e.g., Project_Manager"
              value={roleName}
              onChange={(e) => {
                const value = e.target.value;
                if (/\s/.test(value)) {
                  setWarning("Spaces are not allowed. Replaced with '_'");
                  setRoleName(value.replace(/\s+/g, "_"));
                } else {
                  setWarning("");
                  setRoleName(value);
                }
              }}
            />
            {warning && <p className="text-xs text-red-500 mt-1">{warning}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              className="w-full mt-1 p-2 border rounded text-sm sm:text-base"
              placeholder="Describe the role responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Role Color</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <div
                  key={color}
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 cursor-pointer",
                    color,
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-gray-800"
                      : "border-white"
                  )}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preview</label>
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 border p-3 rounded bg-gray-50">
              <Shield className="mt-1 shrink-0" />
              <div>
                <span
                  className={`text-white px-2 py-1 rounded text-xs sm:text-sm font-semibold ${selectedColor}`}
                >
                  {roleName || "Role_Name"}
                </span>
                <p className="text-xs sm:text-sm mt-1 text-gray-700">
                  {description || "Role description will appear here..."}
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-4 text-sm sm:text-base"
            onClick={handleCreateOrUpdate}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Role"
              : "+ Create Role"}
          </Button>

          {isEditMode && (
            <Button
              variant="outline"
              className="w-full text-sm sm:text-base"
              onClick={() => {
                setIsEditMode(false);
                setEditingRoleId(null);
                setRoleName("");
                setDescription("");
                setSelectedColor(colors[0]);
                setWarning(""); // clear warning when cancel
              }}
            >
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Right: Existing Roles */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-4 h-4" /> Existing Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.length === 0 && (
            <p className="text-sm text-gray-500">No roles found.</p>
          )}
          {roles &&
            roles.map((role, index) => {
              return (
                <div
                  key={role?._id || index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center border p-3 rounded gap-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <div
                      className={`px-2 py-1 rounded text-white text-xs font-semibold md:w-auto w-[50%] ${role.color}`}
                    >
                      {role.name}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm">{role.description}</p>
                      <div className="flex items-center text-xs text-gray-600 mt-1 gap-1">
                        <User className="w-4 h-4" />
                        {getUserCount(role.name) || 0} users
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Edit
                      className="w-4 h-4 cursor-pointer text-gray-600"
                      onClick={() => {
                        setIsEditMode(true);
                        setEditingRoleId(role._id);

                        // ✅ enforce underscore rule on edit as well
                        if (/\s/.test(role.name)) {
                          setWarning(
                            "Spaces are not allowed. Replaced with '_'"
                          );
                          setRoleName(role.name.replace(/\s+/g, "_"));
                        } else {
                          setWarning("");
                          setRoleName(role.name);
                        }

                        setDescription(role.description || "");
                        setSelectedColor(role.color || colors[0]);
                      }}
                    />
                    <Delete
                      className="w-4 h-4 cursor-pointer text-red-600"
                      onClick={() => handleDeleteRole(role._id)}
                    />
                  </div>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRoles;
