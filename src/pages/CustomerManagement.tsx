import MainLayout from "@/components/layout/MainLayout";
import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, User } from "@/contexts/AuthContext";
import { Customer, CustomerPropertyDetail } from "@/types/property";
import {
  fetchAgents,
  fetchAllCustomer_purchased,
  fetchCustomers,
} from "@/utils/buildings/CustomerConfig";
import PropertySelect from "@/hooks/PropertySelect";

const CustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSalesManager = user && user?.role === "sales_manager";

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
  >([
    {
      property: "",
      bookingDate: "",
      finalPrice: 0,
      paymentPlan: "Down Payment",
      paymentStatus: "Pending",
      floorUnit: "",
      unit: "",
    },
  ]);

  const {
    data: customers,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    error: customersError,
  } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    staleTime: 0,
    enabled: !!user?._id,
  });

  const {
    data: availableAgents,
    isLoading: isLoadingAgents,
    isError: isErrorAgents,
    error: agentsError,
  } = useQuery<User[]>({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: availableCustomersForSelection,
    isLoading: isLoadingCustomersForSelection,
    isError: isErrorCustomersForSelection,
    error: customersForSelectionError,
  } = useQuery<User[]>({
    queryKey: ["availableCustomersForSelection"],
    queryFn: fetchAllCustomer_purchased,
    staleTime: 2 * 60 * 1000,
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomerData: {
      user: string;
      purchasedFrom: string;
      properties: (Omit<CustomerPropertyDetail, "_id" | "property"> & {
        property: string;
      })[];
    }) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/customer/addCustomer`,
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
      });
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
        `${import.meta.env.VITE_URL}/api/customer/updateCustomer/${customerId}`,
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
        floorUnit: "",
        unit: "",
      },
    ]);
  };

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerUserId(selectedCustomer.user._id);
      setPurchasedFromAgentId(selectedCustomer.purchasedFrom._id);
      setCustomerProperties(
        selectedCustomer.properties.map((prop) => ({
          ...prop,
          property:
            typeof prop.property === "string"
              ? prop.property
              : prop.property._id,
          floorUnit:
            typeof prop.floorUnit === "string"
              ? prop.floorUnit
              : prop.floorUnit._id,
          unit: typeof prop.unit === "string" ? prop.unit : prop.unit._id,
          bookingDate: new Date(prop.bookingDate).toISOString().split("T")[0],
        }))
      );
    } else {
      resetForm();
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
        floorUnit: "",
        unit: "",
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
      if (
        !prop.property ||
        !prop.bookingDate ||
        !prop.finalPrice ||
        !prop.floorUnit ||
        !prop.unit
      ) {
        toast.error(
          "All property details (Project, Floor Unit, Unit, Booking Date, Final Price) are required."
        );
        return;
      }
      if (isNaN(prop.finalPrice) || prop.finalPrice <= 0) {
        toast.error("Final Price must be a positive number.");
        return;
      }
    }

    const propertiesToSend = customerProperties.map((prop) => ({
      property:
        typeof prop.property === "string" ? prop.property : prop.property._id,
      bookingDate: prop.bookingDate,
      finalPrice: prop.finalPrice,
      paymentPlan: prop.paymentPlan,
      paymentStatus: prop.paymentStatus,
      documents: prop.documents || [],
      floorUnit:
        typeof prop.floorUnit === "string"
          ? prop.floorUnit
          : prop.floorUnit._id,
      unit: typeof prop.unit === "string" ? prop.unit : prop.unit._id,
    }));

    const customerData = {
      user: customerUserId,
      purchasedFrom: purchasedFromAgentId,
      properties: propertiesToSend,
    };

    if (selectedCustomer) {
      updateCustomerMutation.mutate({
        customerId: selectedCustomer._id,
        updatedCustomerData: customerData,
      });
    } else {
      addCustomerMutation.mutate(customerData);
    }
  };

  if (isLoadingCustomers || isLoadingAgents || isLoadingCustomersForSelection) {
    return <Loader />;
  }

  if (isErrorCustomers) {
    toast.error("Failed to load customers.");
    console.error("Customers fetch error:", customersError);
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
      <div className="space-y-6 md:p-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your customer base and their property purchase details.
            </p>
          </div>
          {isSalesManager && (
            <Button
              onClick={() => {
                setSelectedCustomer(null);
                setIsCustomerFormDialogOpen(true);
              }}
              className="mt-4 md:mt-0  text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Customer
            </Button>
          )}
        </div>

        {/* Customer Cards */}
        <div className="rounded-lg border border-gray-200 shadow-sm p-4">
          {/* Desktop Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers?.length === 0 ? (
              <p className="text-center text-gray-500 col-span-full">
                No customers found.
              </p>
            ) : (
              customers?.map((customer) => (
                <Card
                  key={customer._id}
                  className="p-6 shadow-md border border-gray-100 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {customer.user?.name || "N/A"}
                    </h3>
                    {isSalesManager && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsCustomerFormDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <span className="mr-2">📧</span>{" "}
                      {customer.user?.email || "N/A"}
                    </p>
                    <p className="flex items-center">
                      <span className="mr-2">📱</span>{" "}
                      {customer.user?.phone || "N/A"}
                    </p>
                    <p className="flex items-center">
                      <span className="mr-2">🧑‍💼</span> Agent:{" "}
                      {customer.purchasedFrom?.name || "N/A"}
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {customer.properties.map((prop, index) => (
                      <Card
                        key={prop._id || index}
                        className="p-4 bg-gray-50 border border-gray-100 rounded-lg"
                      >
                        <p className="font-medium text-sm text-gray-800 flex items-center">
                          <Building className="h-4 w-4 mr-2 text-blue-600" />
                          {typeof prop.property === "object" &&
                          typeof prop.unit === "object" &&
                          typeof prop.floorUnit === "object" &&
                          prop.property?.projectName
                            ? `${prop.property?.projectName} - ${prop.floorUnit?.floorNumber} - ${prop.unit?.plotNo}`
                            : "Property N/A"}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                          Booking:{" "}
                          {new Date(prop.bookingDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center mb-2">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                          Price: ${prop.finalPrice?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center mb-2">
                          <span className="mr-2">Plan:</span>
                          <Badge
                            variant="secondary"
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800"
                          >
                            {prop.paymentPlan}
                          </Badge>
                        </p>
                        <p className="text-xs text-gray-600 flex items-center mb-2">
                          <span className="mr-2">Status:</span>
                          <Badge
                            className={`px-2 py-1 text-xs ${
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
                      </Card>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-4">
            {customers?.length === 0 ? (
              <p className="text-center text-gray-500">No customers found.</p>
            ) : (
              customers?.map((customer) => (
                <Card
                  key={customer._id}
                  className="p-4 shadow-md border border-gray-100 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {customer.user?.name || "N/A"}
                    </h3>
                    {isSalesManager && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsCustomerFormDialogOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    📧 {customer.user?.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    📱 {customer.user?.phone || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    🧑‍💼 Agent: {customer.purchasedFrom?.name || "N/A"}
                  </p>
                  <div className="mt-4 space-y-3">
                    {customer.properties.map((prop, index) => (
                      <Card
                        key={prop._id || index}
                        className="p-3 bg-gray-50 border border-gray-100 rounded-lg"
                      >
                        <p className="font-medium text-sm text-gray-800">
                          🏠{" "}
                          {typeof prop.property === "object" &&
                          typeof prop.unit === "object" &&
                          typeof prop.floorUnit === "object" &&
                          prop.property?.projectName
                            ? `${prop.property?.projectName} - ${prop.floorUnit?.floorNumber} - ${prop.unit?.plotNo}`
                            : "Property N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          📅 {new Date(prop.bookingDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          💰 ${prop.finalPrice?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          Plan:{" "}
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {prop.paymentPlan}
                          </Badge>
                        </p>
                        <p className="text-xs text-gray-600">
                          Status:{" "}
                          <Badge
                            className={`px-2 py-1 text-xs ${
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
                      </Card>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Add/Edit Customer Dialog */}
        <Dialog
          open={isCustomerFormDialogOpen}
          onOpenChange={setIsCustomerFormDialogOpen}
        >
          <DialogContent className="md:w-[700px] w-[95vw] max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <DialogHeader className="bg-white border-b border-gray-100">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {selectedCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                {selectedCustomer
                  ? "Update customer details and their purchased properties."
                  : "Select an existing user to associate as a customer and add their property purchase details."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              {/* Customer User Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="customerUser"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <Building className="h-4 w-4 mr-2 text-blue-600" />
                  Customer <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={customerUserId}
                  onValueChange={setCustomerUserId}
                  disabled={!!selectedCustomer}
                >
                  <SelectTrigger
                    id="customerUser"
                    className="border-gray-300 focus:ring-blue-500"
                  >
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
                <Label
                  htmlFor="purchasedFromAgent"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <Building className="h-4 w-4 mr-2 text-blue-600" />
                  Purchased From (Agent){" "}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={purchasedFromAgentId}
                  onValueChange={setPurchasedFromAgentId}
                >
                  <SelectTrigger
                    id="purchasedFromAgent"
                    className="border-gray-300 focus:ring-blue-500"
                  >
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Property Details
                </h3>
                {customerProperties.map((prop, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm relative"
                  >
                    {customerProperties.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700"
                        onClick={() => handleRemovePropertyField(index)}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    )}
                    <div className="space-y-4">
                      {/* Property Selection */}
                      <PropertySelect
                        index={index}
                        selectedProject={prop.property}
                        setSelectedProject={(value) =>
                          handlePropertyChange(index, "property", value)
                        }
                        selectedFloorUnit={prop.floorUnit}
                        setSelectedFloorUnit={(value) =>
                          handlePropertyChange(index, "floorUnit", value)
                        }
                        selectedUnit={prop.unit}
                        setSelectedUnit={(value) =>
                          handlePropertyChange(index, "unit", value)
                        }
                        useAvailable={true}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2 text-blue-600" />
                            Booking Date{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
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
                            className="border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                            Final Price{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g., 5000000"
                            value={prop.finalPrice || ""}
                            onChange={(e) =>
                              handlePropertyChange(
                                index,
                                "finalPrice",
                                Math.max(0, Number(e.target.value))
                              )
                            }
                            min={0}
                            className="border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Payment Plan
                          </Label>
                          <Select
                            value={prop.paymentPlan}
                            onValueChange={(
                              value: "Down Payment" | "EMI" | "Full Payment"
                            ) =>
                              handlePropertyChange(index, "paymentPlan", value)
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:ring-blue-500">
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
                          <Label className="text-sm font-medium text-gray-700">
                            Payment Status
                          </Label>
                          <Select
                            value={prop.paymentStatus}
                            onValueChange={(
                              value: "Pending" | "In Progress" | "Completed"
                            ) =>
                              handlePropertyChange(
                                index,
                                "paymentStatus",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:ring-blue-500">
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddPropertyField}
                  className="w-full "
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Property
                </Button>
              </div>
            </div>
            <DialogFooter className=" bg-white  ">
              <Button
                variant="outline"
                onClick={() => setIsCustomerFormDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCustomer}
                disabled={
                  addCustomerMutation.isPending ||
                  updateCustomerMutation.isPending ||
                  !customerUserId
                }
                className=" text-white"
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
