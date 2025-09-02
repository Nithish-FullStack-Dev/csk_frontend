import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Shield, Plus, Edit, Delete, User } from "lucide-react";
import clsx from "clsx";
import axios from "axios";

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
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [userCountMap, setUserCountMap] = useState({});

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/role/roles`);
      setRoles(res.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

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

  const getUserCount = (roleName) => userCountMap[roleName.toLowerCase()] || 0;

  const handleCreateOrUpdate = async () => {
    if (!roleName.trim()) return;

    try {
      setLoading(true);
      if (isEditMode) {
        // Update role
        await axios.patch(
          `${import.meta.env.VITE_URL}/api/role/${editingRoleId}`,
          {
            description,
            color: selectedColor,
          }
        );
      } else {
        // Create or set metadata
        await axios.post(
          `${import.meta.env.VITE_URL}/api/role/updateUserRole`,
          {
            name: roleName,
            description,
            color: selectedColor,
          }
        );
      }

      setRoleName("");
      setDescription("");
      setSelectedColor(colors[0]);
      fetchRoles();
    } catch (err) {
      console.error("Failed to create/update role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearRoleMeta = async (id) => {
    const confirm = window.confirm("Clear role color and description?");
    if (!confirm) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_URL}/api/role/${id}/clear-meta`
      );
      fetchRoles();
    } catch (err) {
      console.error("Failed to clear role metadata", err);
    }
  };

  useEffect(() => {
    getAllUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    const map = {};
    allUsers.forEach((user) => {
      const roleKey = user.role?.toLowerCase().replace(/_/g, " ") || "";
      map[roleKey] = (map[roleKey] || 0) + 1;
    });
    setUserCountMap(map);
  }, [allUsers]);

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
            <label className="block text-sm font-medium">Role Name</label>
            <input
              className="w-full mt-1 p-2 border rounded text-sm sm:text-base"
              placeholder="e.g., Project Manager"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="w-full mt-1 p-2 border rounded text-sm sm:text-base"
              placeholder="Describe the role responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role Color</label>
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
                  {roleName || "Role Name"}
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
          {roles.map((role, index) => (
            <div
              key={index}
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
                    setRoleName(role.name);
                    setDescription(role.description || "");
                    setSelectedColor(role.color || colors[0]);
                  }}
                />
                <Delete
                  className="w-4 h-4 cursor-pointer text-red-600"
                  onClick={() => handleClearRoleMeta(role._id)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRoles;
