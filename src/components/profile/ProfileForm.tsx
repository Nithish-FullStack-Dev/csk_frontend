import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Edit, Save, X, Camera, Edit2 } from "lucide-react";
import axios from "axios";

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    department: user?.department || "",
    avatar: user?.avatar || "",
    specialization: user?.specialization || "",
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Upload avatar if changed
      let avatarUrl = user?.avatar;

      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", avatarFile);
        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          formDataUpload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        avatarUrl = res.data.url;
      }
      const updatedUser = {
        ...user,
        ...formData,
        avatar: avatarUrl,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/user/updateUser`,
        {
          updatedUser,
        }
      );
      setUser(data.user);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      department: user?.department || "",
      avatar: user?.avatar || "",
      specialization: user?.specialization || "",
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      owner: "bg-purple-500",
      admin: "bg-blue-500",
      sales_manager: "bg-green-500",
      team_lead: "bg-yellow-500",
      agent: "bg-orange-500",
      site_incharge: "bg-red-500",
      contractor: "bg-gray-500",
      accountant: "bg-indigo-500",
      customer_purchased: "bg-pink-500",
      customer_prospect: "bg-cyan-500",
    };
    return colors[role as keyof typeof colors] || "bg-gray-500";
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <Button
              variant={isEditing ? "destructive" : "outline"}
              size="sm"
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              className="self-start sm:self-auto"
            >
              {isEditing ? (
                <X className="h-4 w-4 mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start gap-6 ">
            <div
              className={`relative ${
                isEditing ? "cursor-pointer hover:opacity-80" : "cursor-default"
              } border border-1 border-gray-200 rounded-full`}
              onClick={handleAvatarClick}
            >
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-lg sm:text-xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 rounded-full p-1">
                  <Edit2 className="text-white h-4 w-4" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-semibold font-sans break-words">
                  {formData.name}
                </h2>
                <Badge
                  className={`${getRoleColor(
                    user.role
                  )} text-white font-sans w-fit`}
                >
                  {user.role.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleSave}
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
