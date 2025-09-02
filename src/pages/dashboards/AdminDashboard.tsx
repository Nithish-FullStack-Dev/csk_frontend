import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Settings,
  Building,
  FileText,
  MessageSquare,
  User,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    adminUsers: 0,
  });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_URL}/api/dashboard/admin`, {
        withCredentials: true,
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to fetch stats", err));
  }, []);
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-md font-vidaloka">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage system settings and user accounts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center"
                >
                  <Link to="/users">
                    <Users className="h-8 w-8 mb-2" />
                    <span>User Management</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center"
                >
                  <Link to="/properties">
                    <Building className="h-8 w-8 mb-2" />
                    <span>Properties</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center"
                >
                  <Link to="/content">
                    <FileText className="h-8 w-8 mb-2" />
                    <span>Content</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center"
                >
                  <Link to="/messaging">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <span>Communications</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center justify-center"
                >
                  <Link to="/settings">
                    <Settings className="h-8 w-8 mb-2" />
                    <span>System Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      New Users (30d)
                    </p>
                    <h3 className="text-2xl font-bold">{stats.newUsers}</h3>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admin Users</p>
                    <h3 className="text-2xl font-bold">{stats.adminUsers}</h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/users" className="group block">
                <div className="border rounded-lg p-6 transition-all hover:border-primary hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">User Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Add, edit and manage user permissions
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/properties" className="group block">
                <div className="border rounded-lg p-6 transition-all hover:border-primary hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Properties</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage property listings and details
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/settings" className="group block">
                <div className="border rounded-lg p-6 transition-all hover:border-primary hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">
                        System Configuration
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage system settings and preferences
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
