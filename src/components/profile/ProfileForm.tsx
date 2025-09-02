import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import axios from "axios";

const ProfileForm = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    department: user?.department || "",
    joiningDate: "",
  });

  const handleSave = async () => {
    try {
      const updatedUser = {
        ...user,
        ...formData,
      };
      console.log(updatedUser);
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/user/updateUser`,
        {
          updatedUser,
        }
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      department: user?.department || "",
      joiningDate: "",
    });
    setIsEditing(false);
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <Button
              variant={isEditing ? "destructive" : "outline"}
              size="sm"
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
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
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold font-sans">
                  {user.name}
                </h2>
                <Badge
                  className={`${getRoleColor(user.role)} text-white font-sans`}
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
                    className="bg-background font-sans"
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
                    className="bg-background font-sans"
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
                    className="bg-background font-sans"
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
                    className="bg-background font-sans"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-background font-sans"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
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
