import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Image,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/types/property";
import { ApartmentDialog } from "./ApartmentDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createUnit,
  deleteUnit,
  updateUnit,
  useCustomerPurchasedUnits,
} from "@/utils/units/Methods";
import {
  Lead,
  useCompletedTaskVerfication,
  useLeadbyUnitId,
  useUnitProgress,
} from "@/utils/leads/LeadConfig";
import axios from "axios";

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
}: PropertyDetailsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyDeleteDialogOpen, setPropertyDeleteDialogOpen] =
    useState(false);

  const [apartmentDialogOpen, setApartmentDialogOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<
    Property | undefined
  >();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(
    null,
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    data: customerPurchasedUnits = [],
    isLoading: customerPurchasedUnitsLoading,
    isError: customerPurchasedUnitsError,
    error: customerPurchasedUnitsErr,
  } = useCustomerPurchasedUnits(property._id!);

  const {
    data: leads = [],
    isLoading: leadsLoading,
    isError: leadsError,
    error: leadsErr,
  } = useLeadbyUnitId(property?._id);

  const {
    data: verfiedProject,
    isLoading: verfiedProjectLoading,
    isError: verfiedProjectError,
    error: verfiedProjectErr,
  } = useCompletedTaskVerfication(buildingId, property?._id);

  const {
    data: unitProgress,
    isLoading: unitProgressLoading,
    isError: unitProgressError,
    error: unitProgressErr,
  } = useUnitProgress(buildingId, floorId, property?._id);

  // CREATE UNIT
  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (newUnit) => {
      queryClient.setQueryData(
        ["units", buildingId, floorId],
        (oldData: any[] = []) => [...oldData, newUnit],
      );
      queryClient.setQueryData(["unit", newUnit._id], newUnit);
      queryClient.invalidateQueries({ queryKey: ["unit", newUnit._id] });

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
      queryClient.setQueryData(
        ["units", buildingId, floorId],
        (oldUnits: any[] = []) =>
          oldUnits.map((u) => (u._id === updatedUnit._id ? updatedUnit : u)),
      );

      queryClient.setQueryData(["unit", updatedUnit._id], updatedUnit);
      queryClient.invalidateQueries({ queryKey: ["unit", updatedUnit._id] });

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
    onSuccess: (res) => {
      // queryClient.removeQueries({
      //   queryKey: ["unit", deletedUnitId],
      //   exact: true,
      // });

      queryClient.invalidateQueries({
        queryKey: ["units", buildingId, floorId],
      });

      queryClient.refetchQueries({
        queryKey: ["units", buildingId, floorId],
        exact: true,
      });

      toast.success(res.message || "Unit deleted successfully");

      navigate(`/properties/building/${buildingId}/floor/${floorId}`);
    },
    onError: (error: any) => {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : error.message,
      );
    },
  });

  const canEdit = user && ["owner", "admin"].includes(user.role);
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
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
    setDeleteDialogOpen(false);
    setApartmentToDelete(null);
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
                onClick={(e) => handleDeleteClick(property._id!, e)}
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
              </div>

              <div className="mt-4">
                {unitProgressLoading && <p>Loading progress...</p>}
                {unitProgressError && (
                  <p className="text-red-500">
                    {unitProgressErr?.message || "Error fetching progress"}
                  </p>
                )}
                {!unitProgressLoading && !unitProgressError && (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span>
                        Construction Progress: {unitProgress?.overallProgress}%
                      </span>
                    </div>
                    <Progress
                      value={unitProgress?.overallProgress}
                      className="h-2"
                    />
                  </>
                )}
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
              {customerPurchasedUnitsLoading && (
                <p>Loading customer details...</p>
              )}
              {customerPurchasedUnitsError && (
                <p className="text-red-500">
                  {customerPurchasedUnitsErr?.message ||
                    "Error while fetching customer details"}
                </p>
              )}
              {!customerPurchasedUnitsLoading &&
                !customerPurchasedUnitsError && (
                  <>
                    {/* Purchased Customer */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Purchased Customers
                      </p>

                      {customerPurchasedUnits &&
                      customerPurchasedUnits?.length > 0 ? (
                        <ul className="space-y-3">
                          {customerPurchasedUnits?.map((customer, idx) => (
                            <li
                              key={customer?._id || idx}
                              className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white"
                            >
                              <p className="font-semibold text-base">
                                {customer?.name}
                              </p>
                              <div className="text-sm text-muted-foreground flex items-center mt-1">
                                <Mail className="mr-2 h-4 w-4" />
                                {customer?.email}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No customers found.
                        </p>
                      )}
                    </div>
                  </>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Building className="mr-2 h-5 w-5" /> Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verfiedProjectLoading && <p>Loading project details...</p>}

              {verfiedProjectError && (
                <p className="text-red-500">
                  {verfiedProjectErr?.message ||
                    "Error fetching project details"}
                </p>
              )}
              {!verfiedProjectLoading && !verfiedProjectError && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Assigned Contractors
                    </p>
                    <p className="font-medium">
                      {verfiedProject?.projectDetails?.contractors?.map(
                        (contractor, idx) => (
                          <div
                            className="flex items-center"
                            key={contractor?._id || idx}
                          >
                            <span>{contractor?.name || "N/A"}</span>
                            <span className="mx-2">|</span>
                            <span className="text-sm text-muted-foreground">
                              {contractor?.email || "N/A"}
                            </span>
                          </div>
                        ),
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Site Incharge
                    </p>
                    <p className="font-medium">
                      <span>
                        {verfiedProject?.projectDetails?.siteIncharge?.name ||
                          "N/A"}
                      </span>
                      <span className="mx-2">|</span>
                      <span className="text-sm text-muted-foreground">
                        {verfiedProject?.projectDetails?.siteIncharge?.email ||
                          "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    {unitProgressLoading && <p>Loading progress...</p>}
                    {unitProgressError && (
                      <p className="text-red-500">
                        {unitProgressErr?.message || "Error fetching progress"}
                      </p>
                    )}

                    {!unitProgressLoading && !unitProgressError && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Work Completed
                        </p>
                        <div className="flex items-center">
                          <PercentIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {unitProgress?.overallProgress}%
                          </span>
                        </div>
                        <Progress
                          value={unitProgress?.overallProgress}
                          className="h-2 mt-2"
                        />
                      </>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Delivery Date
                    </p>
                    <p className="font-medium flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(property?.deliveryDate) || "Not specified"}
                    </p>
                  </div>
                </>
              )}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                Interested Clients for This Property{" "}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[420px] overflow-y-auto">
              <div>
                {leadsLoading && <p>Loading leads...</p>}
                {leadsError && (
                  <p className="text-red-500">{leadsErr?.message}</p>
                )}
                {!leadsLoading && !leads?.length && <p>No leads yet</p>}

                {leads?.map((lead: Lead) => (
                  <div key={lead._id} className="border p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold mb-2">{lead?.name}</h3>
                    <p className="mb-1">
                      <strong>Email:</strong> {lead?.email}
                    </p>
                    <p className="mb-1">
                      <strong>Phone:</strong> {lead?.phone}
                    </p>
                    <p className="mb-1">
                      <strong>Status:</strong>{" "}
                      {lead?.status.charAt(0).toUpperCase() +
                        lead?.status.slice(1)}
                    </p>
                    <p className="mb-1">
                      <strong>added on:</strong>{" "}
                      {new Date(lead?.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Check className="h-5 w-5" /> Tasks Progress
            </CardTitle>
          </CardHeader>

          {!verfiedProjectLoading &&
          !verfiedProjectError &&
          verfiedProject?.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-semibold">No Tasks Found</h3>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                No tasks have been assigned or completed for this unit yet.
                Tasks will appear here once they are created and verified.
              </p>
            </CardContent>
          ) : (
            <CardContent className="space-y-4 max-h-[420px] overflow-y-auto">
              {/* Loading State */}
              {verfiedProjectLoading && <p>Loading completed tasks...</p>}

              {/* Error State */}
              {verfiedProjectError && (
                <p className="text-red-500">
                  {verfiedProjectErr?.message || "Error fetching tasks"}
                </p>
              )}

              {/* No Tasks State */}
              {!verfiedProjectLoading &&
                !verfiedProjectError &&
                verfiedProject?.completedTasks?.length === 0 && (
                  <p>No completed tasks available</p>
                )}

              {/* Render Tasks */}
              {!verfiedProjectLoading && !verfiedProjectError && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {verfiedProject?.completedTasks?.map((task: any) => (
                    <div
                      key={task?._id}
                      className="border p-4 rounded-lg shadow-sm hover:shadow transition"
                    >
                      {/* Task Title */}
                      <h3 className="text-lg font-semibold mb-2">
                        {task?.title || "Untitled Task"}
                      </h3>

                      {/* Basic Info */}
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Phase:</strong>{" "}
                          {task?.constructionPhase || "Not specified"}
                        </p>
                        <p>
                          <strong>Progress:</strong>{" "}
                          {task?.progressPercentage ?? "N/A"}%
                        </p>
                        <p>
                          <strong>Deadline:</strong>{" "}
                          {task?.deadline
                            ? new Date(task.deadline).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Submitted On:</strong>{" "}
                          {task?.submittedOn
                            ? new Date(task.submittedOn).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "Not submitted"}
                        </p>
                      </div>

                      {/* Contractor Info */}
                      <div className="mt-3">
                        <p className="text-sm font-medium">
                          Assigned Contractor
                        </p>
                        {task?.contractor ? (
                          <p className="text-sm text-muted-foreground">
                            {task?.contractor?.name || "Unknown"} (
                            {task?.contractor?.email || "N/A"})
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Not assigned
                          </p>
                        )}
                      </div>

                      {/* Task Photos */}
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">
                          Uploaded Photos:
                        </p>
                        {task?.siteInchargeUploadedPhotos?.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {task.siteInchargeUploadedPhotos.map(
                              (url: string, i: number) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`task-proof-${i}`}
                                  className="h-20 w-full object-cover rounded-md shadow-sm cursor-pointer hover:opacity-80 transition"
                                  onClick={() => setPreviewImage(url)}
                                />
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No images uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Image Preview Modal */}
        <Dialog
          open={!!previewImage}
          onOpenChange={() => setPreviewImage(null)}
        >
          <DialogContent className="max-w-3xl p-0" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <img
              src={previewImage!}
              alt="Preview"
              className="w-full rounded-lg object-cover"
            />
          </DialogContent>
        </Dialog>

        {/* Gallery */}
        <Card className="rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle>
              <Image className="w-5 h-5 mr-2 inline" /> Gallery
            </CardTitle>
          </CardHeader>

          <CardContent>
            {property?.images && property.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property?.images
                  .filter((img) => img && img.trim() !== "")
                  .map((img, index) => (
                    <div
                      key={index}
                      className={`
                        relative group overflow-hidden cursor-pointer rounded-lg
                        ${
                          index === 0
                            ? "col-span-2 md:col-span-2 row-span-2"
                            : "h-40"
                        }
                      `}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img}
                        alt={`Building Image ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          View Image
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>No images available.</p>
            )}

            {/* Fullscreen Lightbox */}
            {selectedImage && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedImage(null)}
              >
                <div
                  className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-10 right-0 text-white hover:text-red-400 transition"
                  >
                    <X className="h-8 w-8" />
                  </button>

                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-auto max-w-full h-auto max-h-[80vh] rounded-lg shadow-lg object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
