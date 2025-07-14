import React, { useEffect, useState } from "react";
import { Search, Edit, Trash2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

const UserRoleAssignment = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "agent" as UserRole,
    phone: "",
    status: "",
  });
  const [userAdded, setUserAdded] = useState(false);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/user/getUsers"
      );
      setUsers(response.data.users);
      setIsLoading(false);
      console.log(response.data.users);
    } catch (error) {
      console.log("error");
    }
  };

  useEffect(() => {
    fetchAllUsers();
    if (userAdded) setUserAdded(false); // reset flag after fetch
  }, [userAdded]);

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return "bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700";
      case "admin":
        return "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700";
      case "sales_manager":
        return "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700";
      case "team_lead":
        return "bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700";
      case "agent":
        return "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700";
      case "site_incharge":
        return "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700";
      case "contractor":
        return "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700";
      case "accountant":
        return "bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700";
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  // Filter users based on search query (name, email, or role)
  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async () => {
    console.log("clicked");
  };

  function handleEdit(user) {
    setNewUser(user);
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>User Directory</CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-10 w-full md:w-[300px] bg-white dark:bg-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-800">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="min-w-[180px]">Name</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-gray-500 dark:text-gray-400"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id} className="dark:border-gray-800">
                      <TableCell className="font-medium text-center text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="default"
                          className={`${getRoleBadgeColor(
                            user.role
                          )} cursor-pointer`}
                        >
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label="Edit User"
                            onClick={() => {
                              setShowAddUserDialog(true);
                              handleEdit(user);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            aria-label="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-gray-500 dark:text-gray-400"
                    >
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 md:mt-0">
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-2">
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
              <div className="grid items-center gap-2">
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
              <div className="grid items-center gap-2">
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
              <div className="grid items-center gap-2">
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
                    <SelectItem value="sales_manager">Sales Manager</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="site_incharge">Site Incharge</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newUser.status}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserRoleAssignment;
