import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Building2,
  MapPin,
  Home,
  Layers,
  CalendarClock,
  Check,
  X,
  Map,
  Plus,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { FloorUnit } from "@/types/building";
import { useAuth } from "@/contexts/AuthContext";
import { BuildingDialog } from "@/components/properties/BuildingDialog";
import { FloorDialog } from "@/components/properties/FloorDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";

// Sample data - this would come from a database
const sampleFloorUnits: FloorUnit[] = [
  {
    id: "f1",
    buildingId: "1",
    floorNumber: 1,
    unitType: "2 BHK",
    totalSubUnits: 8,
    availableSubUnits: 3,
  },
  {
    id: "f2",
    buildingId: "1",
    floorNumber: 2,
    unitType: "2 BHK",
    totalSubUnits: 8,
    availableSubUnits: 5,
  },
  {
    id: "f3",
    buildingId: "1",
    floorNumber: 3,
    unitType: "3 BHK",
    totalSubUnits: 6,
    availableSubUnits: 2,
  },
  {
    id: "f4",
    buildingId: "1",
    floorNumber: 4,
    unitType: "Penthouse",
    totalSubUnits: 2,
    availableSubUnits: 0,
  },
];

// Sample building data
const sampleBuildings = [
  {
    id: "1",
    projectName: "Skyline Towers",
    location: "Downtown, Metro City",
    propertyType: "Apartment Complex" as const,
    totalUnits: 120,
    availableUnits: 45,
    soldUnits: 75,
    constructionStatus: "Completed" as const,
    completionDate: "2022-06-15",
    description:
      "Luxury apartment complex in the heart of downtown with stunning city views, modern amenities, and premium finishes.",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    googleMapsLocation: "https://maps.google.com/?q=40.7128,-74.0060",
    brochureUrl: null,
  },
];

const BuildingDetails = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const building = sampleBuildings.find((b) => b.id === buildingId);
  const floorUnits = sampleFloorUnits.filter(
    (f) => f.buildingId === buildingId
  );

  // Dialog states
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [floorDialogOpen, setFloorDialogOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<FloorUnit | undefined>();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "building" | "floor";
    id: string;
  } | null>(null);

  const canEdit = user && ["owner", "admin"].includes(user.role);

  const handleEditBuilding = () => {
    setBuildingDialogOpen(true);
  };

  const handleDeleteBuilding = () => {
    setDeleteTarget({ type: "building", id: buildingId! });
    setDeleteDialogOpen(true);
  };

  const handleAddFloor = () => {
    setSelectedFloor(undefined);
    setDialogMode("add");
    setFloorDialogOpen(true);
  };

  const handleEditFloor = (floor: FloorUnit, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFloor(floor);
    setDialogMode("edit");
    setFloorDialogOpen(true);
  };

  const handleDeleteFloor = (floorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ type: "floor", id: floorId });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget?.type === "building") {
      toast.success("Building deleted successfully");
      navigate("/properties");
    } else {
      toast.success("Floor/Unit deleted successfully");
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  if (!building) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Building not found</h2>
          <Button onClick={() => navigate("/properties")} className="mt-4">
            Back to Properties
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/properties")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Buildings
          </Button>
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEditBuilding}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Building
              </Button>
              <Button variant="destructive" onClick={handleDeleteBuilding}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Building
              </Button>
            </div>
          )}
        </div>

        {/* Building Header */}
        <Card>
          <div className="flex flex-col md:flex-row">
            {building.thumbnailUrl && (
              <div className="md:w-1/3">
                <img
                  src={building.thumbnailUrl}
                  alt={building.projectName}
                  className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
            )}
            <div
              className={`${building.thumbnailUrl ? "md:w-2/3" : "w-full"} p-6`}
            >
              <h1 className="text-3xl font-bold mb-2">
                {building.projectName}
              </h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {building.location}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="text-xl font-semibold">{building.totalUnits}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-xl font-semibold text-green-600">
                    {building.availableUnits}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="text-xl font-semibold text-blue-600">
                    {building.soldUnits}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-green-500 text-white">
                    {building.constructionStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{building.propertyType}</span>
                </div>
                <div className="flex items-center">
                  <CalendarClock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>
                    Completed:{" "}
                    {new Date(building.completionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  {building.municipalPermission ? (
                    <>
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                      <span>Municipal Permission</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 mr-2 text-red-500" />
                      <span>Awaiting Permission</span>
                    </>
                  )}
                </div>
              </div>

              {building.description && (
                <p className="mt-4 text-muted-foreground">
                  {building.description}
                </p>
              )}

              {building.brochureUrl && (
                <Button variant="outline" asChild className="mt-4">
                  <a
                    href={building.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download Project Brochure
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Floors/Units List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Layers className="mr-2 h-5 w-5" />
                Floors & Units
              </CardTitle>
              {canEdit && (
                <Button onClick={handleAddFloor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Floor/Unit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {floorUnits.map((floor) => (
                <Card
                  key={floor.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Home className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">
                              Floor {floor.floorNumber} - {floor.unitType}
                            </h3>
                          </div>
                          {canEdit && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleEditFloor(floor, e)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => handleDeleteFloor(floor.id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Total Units:{" "}
                            </span>
                            <span className="font-medium">
                              {floor.totalSubUnits}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Available:{" "}
                            </span>
                            <span className="font-medium text-green-600">
                              {floor.availableSubUnits}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Sold:{" "}
                            </span>
                            <span className="font-medium text-blue-600">
                              {floor.totalSubUnits - floor.availableSubUnits}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          navigate(
                            `/properties/building/${buildingId}/floor/${floor.id}`
                          )
                        }
                      >
                        View Units
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        {building.googleMapsLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <a
                  href={building.googleMapsLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <Map className="mr-2 h-5 w-5" />
                  View on Google Maps
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {building && (
        <>
          <BuildingDialog
            open={buildingDialogOpen}
            onOpenChange={setBuildingDialogOpen}
            building={building}
            mode="edit"
          />

          <FloorDialog
            open={floorDialogOpen}
            onOpenChange={setFloorDialogOpen}
            floor={selectedFloor}
            buildingId={buildingId!}
            mode={dialogMode}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            title={
              deleteTarget?.type === "building"
                ? "Delete Building"
                : "Delete Floor/Unit"
            }
            description={
              deleteTarget?.type === "building"
                ? "Are you sure you want to delete this building? This action cannot be undone and will also delete all associated floors and units."
                : "Are you sure you want to delete this floor/unit? This action cannot be undone and will also delete all associated apartments."
            }
          />
        </>
      )}
    </MainLayout>
  );
};

export default BuildingDetails;
