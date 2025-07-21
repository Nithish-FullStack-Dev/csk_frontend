import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Assume these are props or states passed down from a parent component
// You'll need to define and manage these in your parent component.
// For example:
// const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
// const [bookingDate, setBookingDate] = useState("");
// const [finalPrice, setFinalPrice] = useState("");
// const [paymentPlan, setPaymentPlan] = useState("Down Payment");
// const [paymentStatus, setPaymentStatus] = useState("Pending");
// const [selectedProperty, setSelectedProperty] = useState(""); // This will store the property _id
// const [purchasedFromAgent, setPurchasedFromAgent] = useState(""); // This will store the agent _id

// Assume availableProperties and availableAgents are fetched or passed as props
// const availableProperties = [{ _id: "prop1", basicInfo: { projectName: "Project A", plotNumber: "101" } }];
// const availableAgents = [{ _id: "agent1", name: "Agent John Doe" }];
// const isSalesManager = true; // Replace with actual user role check

export interface CustomerPayload {
  user: string; // user ID of the customer (selectedUser)
  property: string; // property ID (selectedProperty)
  bookingDate: string; // format: YYYY-MM-DD
  finalPrice: number;
  paymentPlan: "Down Payment" | "EMI" | "Full Payment";
  paymentStatus: "Pending" | "In Progress" | "Completed";
  purchasedFrom: string; // agent ID (purchasedFromAgent)
}

export function AddCustomerDialog({
  isSalesManager,
  isAddCustomerDialogOpen,
  setIsAddCustomerDialogOpen,
  bookingDate,
  setBookingDate,
  finalPrice,
  setFinalPrice,
  paymentPlan,
  setPaymentPlan,
  paymentStatus,
  setPaymentStatus,
  selectedProperty,
  setSelectedProperty,
  purchasedFromAgent,
  setPurchasedFromAgent,
  availableProperties, // Array of properties { _id, basicInfo: { projectName, plotNumber } }
  availableAgents, // Array of agents { _id, name }
  usersPurchased,
  selectedUser,
  setSelectedUser,
  handleSaveCustomer, // Function to handle saving the customer
}) {
  return (
    <Dialog
      onOpenChange={setIsAddCustomerDialogOpen}
      open={isAddCustomerDialogOpen}
    >
      <DialogTrigger asChild>
        {isSalesManager && ( // Only show button if user is a Sales Manager
          <Button
            onClick={() => {
              // Clear form states for new customer
              setBookingDate("");
              setFinalPrice("");
              setPaymentPlan("Down Payment");
              setPaymentStatus("Pending");
              setSelectedProperty("");
              setPurchasedFromAgent("");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter the details of the new customer. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Property Interest - required */}
          <div className="space-y-2">
            <label htmlFor="propertyInterest" className="text-sm font-medium">
              Property Interest *
            </label>
            <Select
              onValueChange={setSelectedProperty}
              value={selectedProperty}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                {availableProperties?.map((prop) => (
                  <SelectItem key={prop._id} value={prop._id}>
                    {prop.basicInfo.projectName} - {prop.basicInfo.plotNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Booking Date and Final Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="bookingDate" className="text-sm font-medium">
                Booking Date *
              </label>
              <Input
                id="bookingDate"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="finalPrice" className="text-sm font-medium">
                Final Price *
              </label>
              <Input
                id="finalPrice"
                type="number"
                placeholder="e.g., 5000000"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Plan and Payment Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="paymentPlan" className="text-sm font-medium">
                Payment Plan
              </label>
              <Select onValueChange={setPaymentPlan} value={paymentPlan}>
                <SelectTrigger id="paymentPlan" className="w-full">
                  <SelectValue placeholder="Select Payment Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Down Payment">Down Payment</SelectItem>
                  <SelectItem value="EMI">EMI</SelectItem>
                  <SelectItem value="Full Payment">Full Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="paymentStatus" className="text-sm font-medium">
                Payment Status
              </label>
              <Select onValueChange={setPaymentStatus} value={paymentStatus}>
                <SelectTrigger id="paymentStatus" className="w-full">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purchased From Agent - required */}
          <div className="space-y-2">
            <label htmlFor="purchasedFrom" className="text-sm font-medium">
              Purchased From (Agent) *
            </label>
            <Select
              onValueChange={setPurchasedFromAgent}
              value={purchasedFromAgent}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Agent" />
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

          {/* Customer purchased */}
          <div className="space-y-2">
            <label htmlFor="purchasedFrom" className="text-sm font-medium">
              Purchased Customer *
            </label>
            <Select onValueChange={setSelectedUser} value={selectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Customer Purchased" />
              </SelectTrigger>
              <SelectContent>
                {usersPurchased?.map((purchased) => (
                  <SelectItem key={purchased._id} value={purchased._id}>
                    {purchased.name} {purchased.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsAddCustomerDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveCustomer}>Save Customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
