import { useEffect, useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Search, Filter, Edit, Trash2, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCsrfToken, UserRole } from "@/contexts/AuthContext";
import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent" as UserRole,
    phone: "",
  });
  const [userAdded, setUserAdded] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showResetDeleteDialog, setshowResetDeleteDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchAllUsers = async () => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.get(
        `${import.meta.env.VITE_URL}/api/user/getUsers`,
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );
      setUsers(response.data.users);
    } catch (error) {
      console.log("error");
    }
  };

  useEffect(() => {
    fetchAllUsers();
    if (userAdded) setUserAdded(false);
  }, [userAdded]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      [user.name, user.email, user.role]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleAddUser = async () => {
    const createdUser = {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.password,
      roleName: newUser.role,
    };
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/user/addUser`,
        createdUser,
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );
      if (response.status === 201) {
        toast.success("User added successfully", {
          description: `${newUser.name} has been added as a ${newUser.role}`,
        });
        setUserAdded(true);
        setShowAddUserDialog(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "agent",
          phone: "",
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/user/deleteUser/${selectedUser._id}`
      );
      toast.success("User deleted successfully");
      setShowEditUserDialog(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(`${import.meta.env.VITE_URL}/api/user/updateUser`, {
        updatedUser: selectedUser,
      });
      toast.success("User updated successfully");
      setShowEditUserDialog(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_URL}/api/user/resetPassword`, {
        id: selectedUser?._id,
        password: newPassword,
      });
      setShowResetPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated succesfully.");
    } catch (error) {
      console.error("Reset failed:", error);
      setShowResetPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
      toast.error("Failed to update password");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      case "sales_manager":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "team_lead":
        return "bg-teal-100 text-teal-800 hover:bg-teal-100/80";
      case "agent":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "site_incharge":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
      case "contractor":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100/80";
      case "accountant":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 hover:bg-green-100/80"
      : "bg-red-100 text-red-800 hover:bg-red-100/80";
  };

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-md font-vidaloka">User Management</h1>
            <p className="text-muted-foreground font-sans">
              Manage users and their access levels
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog
              open={showAddUserDialog}
              onOpenChange={setShowAddUserDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="md:w-full w-[90vw] max-h-[80vh] rounded-xl overflow-scroll">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with role-based access.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid items-center gap-2 font-sans">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid items-center gap-2 font-sans">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="grid items-center gap-2 font-sans">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder=""
                    />
                  </div>
                  <div className="grid items-center gap-2 font-sans">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                      placeholder="+1 555-123-4567"
                    />
                  </div>
                  <div className="grid items-center gap-2 font-sans">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, role: value as UserRole })
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="sales_manager">
                          Sales Manager
                        </SelectItem>
                        <SelectItem value="team_lead">Team Lead</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="site_incharge">
                          Site Incharge
                        </SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="customer_purchased">
                          Customer_Purchased
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddUserDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={
                      !newUser.name ||
                      !newUser.email ||
                      !newUser.role ||
                      !newUser.phone
                    }
                  >
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all-users" className="w-full font-sans">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
                <CardTitle>User Directory</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-8 w-full md:w-[250px] bg-background"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" title="Filter users">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No users found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={getRoleBadgeColor(user.role)}
                              variant="outline"
                            >
                              {user.role.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(user.status)}
                              variant="outline"
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user?.lastLogin
                              ? formatDistanceToNowStrict(
                                  new Date(user.lastLogin),
                                  {
                                    addSuffix: true,
                                  }
                                )
                              : "Never logged in"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Edit user"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditUserDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Reset Password"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowResetPasswordDialog(true);
                                }}
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete user"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setshowResetDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredUsers.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No users found matching your search
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <Card key={user._id} className="p-4 shadow-sm border">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-base">
                            {user.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          className={getRoleBadgeColor(user.role)}
                          variant="outline"
                        >
                          {user.role.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <Badge
                          className={getStatusBadgeColor(user.status)}
                          variant="outline"
                        >
                          {user.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {user?.lastLogin
                            ? formatDistanceToNowStrict(
                                new Date(user.lastLogin),
                                {
                                  addSuffix: true,
                                }
                              )
                            : "Never logged in"}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditUserDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPasswordDialog(true);
                          }}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setshowResetDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </Tabs>

        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent className="md:w-full w-[90vw] max-h-[80vh] rounded-xl overflow-scroll">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid items-center gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={selectedUser.name}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid items-center gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid items-center gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={selectedUser.phone}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid items-center gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
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
                <div className="grid items-center gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditUserDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleUpdateUser();
                  setShowEditUserDialog(false);
                  await fetchAllUsers();
                }}
              >
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showResetPasswordDialog}
          onOpenChange={setShowResetPasswordDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={
                  newPassword.length < 6 || newPassword !== confirmPassword
                }
              >
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={showResetDeleteDialog}
          onOpenChange={setshowResetDeleteDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Do you want to delete user {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setshowResetDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await handleDeleteUser();
                  await fetchAllUsers();
                  setshowResetDeleteDialog(false);
                }}
              >
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
