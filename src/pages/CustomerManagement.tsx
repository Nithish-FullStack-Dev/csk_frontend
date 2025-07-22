import MainLayout from "@/components/layout/MainLayout";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Edit,
  Building,
  DollarSign,
  CalendarDays,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";
import { toast } from "sonner";
import { Property } from "./public/PropertyInterfaces"; // Assuming this path and interface
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, User } from "@/contexts/AuthContext"; // Assuming this path and User interface

// Removed PropertiesWrapper interface as it's not needed based on backend response

// Interface for a single property entry within a Customer's 'properties' array
export interface CustomerPropertyDetail {
  _id?: string; // Optional for new entries, present for existing ones
  property: string | Property; // Can be ID string or populated Property object
  bookingDate: string; // Storing as string for form input type="date"
  finalPrice: number;
  paymentPlan: "Down Payment" | "EMI" | "Full Payment";
  paymentStatus: "Pending" | "In Progress" | "Completed";
  documents?: string[]; // Array of Document IDs
}

// Main Customer interface
export interface Customer {
  _id: string;
  user: User; // The actual customer user (should be an existing user)
  purchasedFrom: User; // The agent who sold it
  properties: CustomerPropertyDetail[]; // Array of purchased properties
  createdAt: string;
  updatedAt: string;
}

// --- API Calls ---

const fetchCustomers = async (): Promise<Customer[]> => {
  const { data } = await axios.get(
    "http://localhost:3000/api/customer/getAllCustomers",
    {
      withCredentials: true,
    }
  );
  return data.data || [];
};

// Updated fetchProperties to return Property[] directly
const fetchProperties = async (): Promise<Property[]> => {
  const { data } = await axios.get(
    "http://localhost:3000/api/properties/available",
    {
      withCredentials: true,
    }
  );
  return data.data || []; // Now expects data.data to be Property[]
};

const fetchAgents = async (): Promise<User[]> => {
  const { data } = await axios.get(
    "http://localhost:3000/api/user/getAllAgents",
    {
      withCredentials: true,
    }
  );
  return data || [];
};

// New API call to fetch users who can be selected as customers
const fetchAllCustomer_purchased = async (): Promise<User[]> => {
  const { data } = await axios.get(
    "http://localhost:3000/api/user/getAllcustomer_purchased",
    {
      withCredentials: true,
    }
  );
  return data || [];
};

const CustomerManagement: React.FC = () => {
  const { user } = useAuth(); // Get current user from auth context
  const queryClient = useQueryClient();

  const isSalesManager = user && user?.role === "sales_manager";

  // --- State for Dialog and Form ---
  const [isCustomerFormDialogOpen, setIsCustomerFormDialogOpen] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Form states for customer details
  const [customerUserId, setCustomerUserId] = useState<string>("");
  const [purchasedFromAgentId, setPurchasedFromAgentId] = useState<string>("");
  const [customerProperties, setCustomerProperties] = useState<
    CustomerPropertyDetail[]
  >([]); // Array to hold multiple property details

  // --- React Query Hooks ---

  const {
    data: customers,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    error: customersError,
  } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    staleTime: 0,
    enabled: !!user?._id, // Only fetch if user is logged in
  });

  // Updated useQuery to expect Property[] directly
  const {
    data: availableProperties,
    isLoading: isLoadingProperties,
    isError: isErrorProperties,
    error: propertiesError,
  } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    staleTime: 0,
  });

  const {
    data: availableAgents,
    isLoading: isLoadingAgents,
    isError: isErrorAgents,
    error: agentsError,
  } = useQuery<User[]>({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: 0,
  });

  const {
    data: availableCustomersForSelection,
    isLoading: isLoadingCustomersForSelection,
    isError: isErrorCustomersForSelection,
    error: customersForSelectionError,
  } = useQuery<User[]>({
    queryKey: ["availableCustomersForSelection"],
    queryFn: fetchAllCustomer_purchased,
    staleTime: 0,
  });

  // --- Mutations ---

  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomerData: {
      user: string; // User ID
      purchasedFrom: string; // Agent ID
      properties: (Omit<CustomerPropertyDetail, "_id" | "property"> & {
        property: string;
      })[]; // Array of property details
    }) => {
      const { data } = await axios.post(
        "http://localhost:3000/api/customer/addCustomer",
        newCustomerData,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Customer added successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({
        queryKey: ["availableCustomersForSelection"],
      }); // Invalidate if a new user becomes a customer
      setIsCustomerFormDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to add customer.";
      toast.error(errorMessage);
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({
      customerId,
      updatedCustomerData,
    }: {
      customerId: string;
      updatedCustomerData: {
        user?: string;
        purchasedFrom?: string;
        properties?: (Omit<CustomerPropertyDetail, "_id" | "property"> & {
          property: string;
        })[];
      };
    }) => {
      const { data } = await axios.put(
        // Changed from patch to put as per your schema update
        `http://localhost:3000/api/customer/updateCustomer/${customerId}`,
        updatedCustomerData,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsCustomerFormDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Failed to update customer.";
      toast.error(errorMessage);
    },
  });

  // --- Form Logic ---

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerUserId("");
    setPurchasedFromAgentId("");
    setCustomerProperties([
      {
        property: "",
        bookingDate: "",
        finalPrice: 0,
        paymentPlan: "Down Payment",
        paymentStatus: "Pending",
      },
    ]); // Always start with one empty property field for new entry
  };

  // Effect to populate form when editing an existing customer
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerUserId(selectedCustomer.user._id);
      setPurchasedFromAgentId(selectedCustomer.purchasedFrom._id);
      // Map existing properties for editing
      setCustomerProperties(
        selectedCustomer.properties.map((prop) => ({
          ...prop,
          property:
            typeof prop.property === "string"
              ? prop.property
              : prop.property._id, // Ensure it's an ID
          bookingDate: new Date(prop.bookingDate).toISOString().split("T")[0], // Format for input type="date"
        }))
      );
    } else {
      resetForm(); // Reset form when dialog opens for adding new customer
    }
  }, [selectedCustomer]);

  const handleAddPropertyField = () => {
    setCustomerProperties([
      ...customerProperties,
      {
        property: "",
        bookingDate: "",
        finalPrice: 0,
        paymentPlan: "Down Payment",
        paymentStatus: "Pending",
      },
    ]);
  };

  const handleRemovePropertyField = (index: number) => {
    const updatedProperties = customerProperties.filter((_, i) => i !== index);
    setCustomerProperties(updatedProperties);
  };

  const handlePropertyChange = (
    index: number,
    field: keyof CustomerPropertyDetail,
    value: any
  ) => {
    const updatedProperties = [...customerProperties];
    if (field === "finalPrice") {
      updatedProperties[index][field] = parseFloat(value);
    } else {
      updatedProperties[index][field] = value;
    }
    setCustomerProperties(updatedProperties);
  };

  const handleSaveCustomer = async () => {
    // Validation
    if (!customerUserId) {
      toast.error("Please select an existing customer.");
      return;
    }
    if (!purchasedFromAgentId) {
      toast.error("Please select an agent for 'Purchased From'.");
      return;
    }
    if (customerProperties.length === 0) {
      toast.error("At least one property detail is required.");
      return;
    }

    for (const prop of customerProperties) {
      if (!prop.property || !prop.bookingDate || !prop.finalPrice) {
        toast.error(
          "All property details (Property, Booking Date, Final Price) are required."
        );
        return;
      }
      if (isNaN(prop.finalPrice) || prop.finalPrice <= 0) {
        toast.error("Final Price must be a positive number.");
        return;
      }
    }

    // Prepare data for API
    const propertiesToSend = customerProperties.map((prop) => ({
      property:
        typeof prop.property === "string" ? prop.property : prop.property._id, // Ensure it's an ID
      bookingDate: prop.bookingDate,
      finalPrice: prop.finalPrice,
      paymentPlan: prop.paymentPlan,
      paymentStatus: prop.paymentStatus,
      documents: prop.documents || [],
    }));

    const customerData = {
      user: customerUserId, // This will always be an existing user's ID
      purchasedFrom: purchasedFromAgentId,
      properties: propertiesToSend,
    };

    if (selectedCustomer) {
      // Update existing customer
      updateCustomerMutation.mutate({
        customerId: selectedCustomer._id,
        updatedCustomerData: customerData,
      });
    } else {
      // Add new customer
      addCustomerMutation.mutate(customerData);
    }
  };

  if (
    isLoadingCustomers ||
    isLoadingProperties ||
    isLoadingAgents ||
    isLoadingCustomersForSelection
  ) {
    return <Loader />;
  }

  if (isErrorCustomers) {
    toast.error("Failed to load customers.");
    console.error("Customers fetch error:", customersError);
  }
  if (isErrorProperties) {
    toast.error("Failed to load properties.");
    console.error("Properties fetch error:", propertiesError);
  }
  if (isErrorAgents) {
    toast.error("Failed to load agents.");
    console.error("Agents fetch error:", agentsError);
  }
  if (isErrorCustomersForSelection) {
    toast.error("Failed to load available customers for selection.");
    console.error(
      "Customers for selection fetch error:",
      customersForSelectionError
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">
              Manage your customer base and their property purchase details.
            </p>
          </div>
          {isSalesManager && (
            <Button
              onClick={() => {
                setSelectedCustomer(null); // Clear selected customer for add mode
                setIsCustomerFormDialogOpen(true);
              }}
              className="mt-4 md:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Customer
            </Button>
          )}
        </div>

        {/* Customer Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Customer Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Purchased From (Agent)</TableHead>
                <TableHead className="min-w-[250px]">Properties</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers?.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">
                      {customer.user?.name || "N/A"}
                    </TableCell>
                    <TableCell>{customer.user?.email || "N/A"}</TableCell>
                    <TableCell>{customer.user?.phone || "N/A"}</TableCell>
                    <TableCell>
                      {customer.purchasedFrom?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {customer.properties.map((prop, index) => (
                          <Card
                            key={prop._id || index}
                            className="p-3 shadow-sm bg-gray-50"
                          >
                            <CardHeader className="p-0 pb-1">
                              <CardTitle className="text-sm font-semibold flex items-center">
                                <Building className="h-3 w-3 mr-1 text-blue-600" />
                                {/* Access prop.property directly as it's a Property object */}
                                {typeof prop.property === "object" &&
                                prop.property?.basicInfo?.projectName
                                  ? `${prop.property.basicInfo.projectName} - ${prop.property.basicInfo.plotNumber}`
                                  : "Property N/A"}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 text-xs text-muted-foreground">
                              <p className="flex items-center">
                                <CalendarDays className="h-3 w-3 mr-1" />{" "}
                                Booking:{" "}
                                {new Date(
                                  prop.bookingDate
                                ).toLocaleDateString()}
                              </p>
                              <p className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" /> Price: $
                                {prop.finalPrice?.toLocaleString()}
                              </p>
                              <p className="flex items-center">
                                <span className="mr-1">Plan:</span>{" "}
                                <Badge
                                  variant="secondary"
                                  className="px-1 py-0.5 text-xs"
                                >
                                  {prop.paymentPlan}
                                </Badge>
                              </p>
                              <p className="flex items-center">
                                <span className="mr-1">Status:</span>{" "}
                                <Badge
                                  className={`px-1 py-0.5 text-xs ${
                                    prop.paymentStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : prop.paymentStatus === "In Progress"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {prop.paymentStatus}
                                </Badge>
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isSalesManager && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsCustomerFormDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Customer Dialog */}
        <Dialog
          open={isCustomerFormDialogOpen}
          onOpenChange={setIsCustomerFormDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription>
                {selectedCustomer
                  ? "Update customer details and their purchased properties."
                  : "Select an existing user to associate as a customer and add their property purchase details."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Customer User Selection */}
              <div className="space-y-2">
                <Label htmlFor="customerUser">Customer *</Label>
                <Select
                  value={customerUserId}
                  onValueChange={setCustomerUserId}
                  disabled={!!selectedCustomer}
                >
                  <SelectTrigger id="customerUser">
                    <SelectValue placeholder="Select an existing customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCustomersForSelection?.length === 0 ? (
                      <SelectItem value="no-customers" disabled>
                        No customers available
                      </SelectItem>
                    ) : (
                      availableCustomersForSelection?.map((custUser) => (
                        <SelectItem key={custUser._id} value={custUser._id}>
                          {custUser.name} ({custUser.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Purchased From Agent */}
              <div className="space-y-2">
                <Label htmlFor="purchasedFromAgent">
                  Purchased From (Agent) *
                </Label>
                <Select
                  value={purchasedFromAgentId}
                  onValueChange={setPurchasedFromAgentId}
                >
                  <SelectTrigger id="purchasedFromAgent">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents?.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Property Details */}
              <h3 className="text-lg font-semibold mt-4">Property Details</h3>
              {customerProperties.map((prop, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-md relative space-y-3"
                >
                  {customerProperties.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRemovePropertyField(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="space-y-2">
                    <Label>Property *</Label>
                    <Select
                      value={
                        typeof prop.property === "string"
                          ? prop.property
                          : prop.property?._id || ""
                      }
                      onValueChange={(value) =>
                        handlePropertyChange(index, "property", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Property" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Filter out properties where 'property' or 'property._id' is missing before mapping */}
                        {availableProperties?.filter(
                          (p) =>
                            p._id &&
                            p.basicInfo?.projectName &&
                            p.basicInfo?.plotNumber
                        ).length === 0 ? (
                          <SelectItem
                            value="no-properties-placeholder"
                            disabled
                          >
                            No properties available
                          </SelectItem>
                        ) : (
                          availableProperties
                            ?.filter(
                              (p) =>
                                p._id &&
                                p.basicInfo?.projectName &&
                                p.basicInfo?.plotNumber
                            )
                            .map((p) => (
                              <SelectItem key={p._id} value={p._id}>
                                {`${p.basicInfo.projectName} - ${p.basicInfo.plotNumber}`}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Booking Date *</Label>
                      <Input
                        type="date"
                        value={prop.bookingDate}
                        onChange={(e) =>
                          handlePropertyChange(
                            index,
                            "bookingDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Final Price *</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 5000000"
                        value={prop.finalPrice || ""}
                        onChange={(e) =>
                          handlePropertyChange(
                            index,
                            "finalPrice",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Payment Plan</Label>
                      <Select
                        value={prop.paymentPlan}
                        onValueChange={(
                          value: "Down Payment" | "EMI" | "Full Payment"
                        ) => handlePropertyChange(index, "paymentPlan", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Down Payment">
                            Down Payment
                          </SelectItem>
                          <SelectItem value="EMI">EMI</SelectItem>
                          <SelectItem value="Full Payment">
                            Full Payment
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Status</Label>
                      <Select
                        value={prop.paymentStatus}
                        onValueChange={(
                          value: "Pending" | "In Progress" | "Completed"
                        ) =>
                          handlePropertyChange(index, "paymentStatus", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddPropertyField}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Another Property
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCustomerFormDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCustomer}
                disabled={
                  addCustomerMutation.isPending ||
                  updateCustomerMutation.isPending ||
                  !customerUserId // Disable if no customer is selected
                }
              >
                {selectedCustomer
                  ? updateCustomerMutation.isPending
                    ? "Updating..."
                    : "Update Customer"
                  : addCustomerMutation.isPending
                  ? "Adding..."
                  : "Add Customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CustomerManagement;
