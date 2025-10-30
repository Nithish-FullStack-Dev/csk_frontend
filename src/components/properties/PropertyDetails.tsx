// src/components/PropertyDetails.tsx
import { useState } from "react";
import { useNavigate, useNavigation, useParams } from "react-router-dom";
import {
  Check,
  Building,
  Map,
  Calendar,
  Edit,
  Trash,
  FileText,
  PercentIcon,
  Phone,
  User,
  MessageSquare,
  ChevronLeft,
  X,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/types/property";
import { formatIndianCurrency } from "@/lib/formatCurrency";
import { ApartmentDialog } from "./ApartmentDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { createUnit, deleteUnit, updateUnit } from "@/utils/units/Methods";

function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    "Under Construction": "bg-yellow-500",
    Reserved: "bg-purple-500",
    Blocked: "bg-red-500",
    Purchased: "bg-blue-500",
    Inquiry: "bg-yellow-500",
    Open: "bg-green-500",
    Completed: "bg-green-500",
    "In Progress": "bg-yellow-500",
    Pending: "bg-orange-500",
    "Not Started": "bg-gray-500",
  };
  return (
    <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
      {status}
    </Badge>
  );
}

interface PropertyDetailsProps {
  property: Property;
  buildingId: string;
  floorId: string;
  unitId: string;
  onDelete: () => void;
  onBack: () => void;
}

export function PropertyDetails({
  property,
  onDelete,
  buildingId,
  floorId,
  unitId,
  onBack,
}: PropertyDetailsProps) {
  // const { buildingId, floorId } = useParams<{
  //   buildingId: string;
  //   floorId: string;
  // }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentProperty, setCurrentProperty] = useState<Property | null>(
    property
  );

  // CREATE UNIT
  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (newUnit) => {
      queryClient.setQueryData(
        ["units", buildingId, floorId],
        (oldData: any[] = []) => [...oldData, newUnit]
      );

      toast.success("Unit created successfully");
      setApartmentDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create unit");
    },
  });

  // UPDATE UNIT
  const updateUnitMutation = useMutation({
    mutationFn: ({
      unitId,
      unitData,
    }: {
      unitId: string;
      unitData: FormData;
    }) => updateUnit(unitId, unitData),
    onSuccess: (updatedUnit) => {
      // ✅ Update the UI immediately
      setCurrentProperty(updatedUnit);

      // ✅ Update the React Query cache
      queryClient.setQueryData(
        ["units", buildingId, floorId],
        (old: any[] = []) =>
          old.map((unit) => (unit._id === updatedUnit._id ? updatedUnit : unit))
      );

      // ✅ Optional: refetch from backend if you want fresh data
      queryClient.invalidateQueries({
        queryKey: ["units", buildingId, floorId],
      });

      // ✅ Close the dialog & toast success
      setApartmentDialogOpen(false);
      toast.success("Unit updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update unit");
    },
  });

  // DELETE UNIT
  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      toast.success("Unit deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["units", buildingId, floorId],
      });

      navigate(`/buildings/${buildingId}`); // or navigate(-1)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete unit");
    },
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyDeleteDialogOpen, setPropertyDeleteDialogOpen] =
    useState(false);

  const [apartmentDialogOpen, setApartmentDialogOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<
    Property | undefined
  >();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(
    null
  );

  const canEdit = user && ["owner", "admin"].includes(user.role);
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const handleEditApartment = (apartment: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedApartment(apartment);
    setDialogMode("edit");
    setApartmentDialogOpen(true);
  };

  const handleDeleteClick = (apartmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setApartmentToDelete(apartmentId);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (apartmentToDelete) {
      deleteUnitMutation.mutate(apartmentToDelete);
    }
  };
  const handleSaveApartment = (data: FormData, mode: "add" | "edit") => {
    if (mode === "add") {
      data.append("buildingId", buildingId!);
      data.append("floorId", floorId!);
      createUnitMutation.mutate(data);
    } else if (selectedApartment?._id) {
      updateUnitMutation.mutate({
        unitId: selectedApartment._id,
        unitData: data,
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/properties/building/${buildingId}/floor/${floorId}`)
            }
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Building
          </Button>

          {canEdit && (
            <div className="flex md:flex-row flex-col gap-3">
              <Button
                size="sm"
                onClick={(e) => handleEditApartment(property, e)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setPropertyDeleteDialogOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          )}
        </div>

        <Card>
          <div className="flex flex-col md:flex-row">
            {property.thumbnailUrl && (
              <div className="md:w-1/3">
                <img
                  src={property.thumbnailUrl}
                  alt={property.projectName}
                  className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
            )}
            <div
              className={`${property.thumbnailUrl ? "md:w-2/3" : "w-full"} p-6`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-2xl font-bold">
                      {property.projectName}
                    </h2>
                    {getStatusBadge(property.status)}
                  </div>
                  <p className="text-muted-foreground">
                    Plot No. {property.plotNo} • Mem. No. {property.memNo}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <Map className="h-5 w-5 mr-2 text-muted-foreground" />{" "}
                  <span>Facing: {property.villaFacing}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />{" "}
                  <span>Extent: {property.extent} sq. ft</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />{" "}
                  <span>Delivery: {formatDate(property.deliveryDate)}</span>
                </div>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-muted-foreground" />{" "}
                  <span>
                    Total: {formatIndianCurrency(property.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span>Construction Progress: {property.workCompleted}%</span>
                </div>
                <Progress value={property.workCompleted} className="h-2" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="mr-2 h-5 w-5" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium">
                  {(property.customerId as any)?.user?.name ||
                    (property.status === "Sold"
                      ? property.purchasedCustomerName || "Owner"
                      : "N/A")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer Status</p>
                <div>
                  {getStatusBadge(
                    property.customerStatus ||
                      (property.status === "Sold" ? "Purchased" : "Open")
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  {property.contactNo || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <IndianRupee className="mr-2 h-5 w-5" /> Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">
                  {formatIndianCurrency(property.totalAmount)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Amount Received
                  </p>
                  <p className="font-medium text-green-600">
                    {formatIndianCurrency(property.amountReceived)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Balance Amount
                  </p>
                  <p className="font-medium text-red-600">
                    {formatIndianCurrency(property.balanceAmount)}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Rate Plan (Scheme)
                </p>
                <p className="font-medium">{property.ratePlan || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">EMI Scheme</p>
                <p className="font-medium flex items-center">
                  {property.emiScheme ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />{" "}
                      Available
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4 text-red-500" /> Not Available
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Building className="mr-2 h-5 w-5" /> Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contractor</p>
                <p className="font-medium">
                  {(property.contractor as any)?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Site Incharge</p>
                <p className="font-medium">
                  {(property.siteIncharge as any)?.name || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Work Completed</p>
                <div className="flex items-center">
                  <PercentIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{property.workCompleted}%</span>
                </div>
                <Progress value={property.workCompleted} className="h-2 mt-2" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Delivery Date</p>
                <p className="font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {formatDate(property.deliveryDate)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Legal & Other Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Registration Status
                </p>
                <div>{getStatusBadge(property.registrationStatus)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Municipal Permission
                </p>
                <p className="font-medium flex items-center">
                  {property.municipalPermission ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" /> Approved
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4 text-red-500" /> Not Approved
                    </>
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Remarks</p>
                <p className="font-medium">
                  {property.remarks ? (
                    <div className="flex items-start">
                      <MessageSquare className="mr-2 h-4 w-4 mt-1 text-muted-foreground" />
                      <span>{property.remarks}</span>
                    </div>
                  ) : (
                    "No remarks"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {property.googleMapsLocation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Map className="mr-2 h-5 w-5" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <a
                  href={property.googleMapsLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <Map className="mr-2 h-5 w-5" /> View on Google Maps
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={propertyDeleteDialogOpen}
        onOpenChange={setPropertyDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Property Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPropertyDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                setPropertyDeleteDialogOpen(false);
              }}
            >
              Delete Property
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ApartmentDialog
        open={apartmentDialogOpen}
        onOpenChange={setApartmentDialogOpen}
        apartment={selectedApartment}
        mode={dialogMode}
        onSave={handleSaveApartment}
        isCreating={createUnitMutation.isPending}
        isUpdating={updateUnitMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Unit"
        description="Are you sure you want to delete this unit? This action cannot be undone."
      />
    </>
  );
}
