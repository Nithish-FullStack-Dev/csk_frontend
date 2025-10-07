// src/pages/NewProperties.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Filter,
  Search,
  MapPin,
  Calendar,
  Check,
  Plus,
  Pencil,
  Trash2,
  Download,
  Share2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Building } from "@/types/building";
import { BuildingDialog } from "@/components/properties/BuildingDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";

const BUILDINGS_KEY = "app_buildings_v1";

const sampleInitial: Building[] = [
  {
    id: "1",
    projectName: "Skyline Towers",
    location: "Downtown, Metro City",
    propertyType: "Apartment Complex",
    totalUnits: 120,
    availableUnits: 45,
    soldUnits: 75,
    constructionStatus: "Completed",
    completionDate: "2022-06-15",
    description: "Luxury apartment complex in the heart of downtown",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    brochureUrl: "https://example.com/brochures/skyline-towers.pdf",
    googleMapsLocation: undefined,
  } as unknown as Building,
];

const NewProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [buildings, setBuildings] = useState<Building[]>(() => {
    try {
      const raw = localStorage.getItem(BUILDINGS_KEY);
      if (raw) return JSON.parse(raw) as Building[];
    } catch (e) {}
    return sampleInitial;
  });

  const [filteredBuildings, setFilteredBuildings] =
    useState<Building[]>(buildings);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialogs
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);

  const canEdit = user && ["owner", "admin"].includes(user.role);

  // persist buildings when changed
  useEffect(() => {
    try {
      localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildings));
    } catch (e) {
      console.error(e);
    }
    // update filtered list
    setFilteredBuildings(buildings);
  }, [buildings]);

  // Filtering logic
  useEffect(() => {
    let results = buildings.slice();
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(
        (b) =>
          (b.projectName || "").toLowerCase().includes(lower) ||
          (b.location || "").toLowerCase().includes(lower)
      );
    }
    if (typeFilter !== "all") {
      results = results.filter((b) => b.propertyType === typeFilter);
    }
    if (statusFilter !== "all") {
      results = results.filter((b) => b.constructionStatus === statusFilter);
    }
    setFilteredBuildings(results);
  }, [searchTerm, typeFilter, statusFilter, buildings]);

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const handleAddBuilding = () => {
    setSelectedBuilding(null);
    setDialogMode("add");
    setBuildingDialogOpen(true);
  };

  const handleEditBuilding = (building: Building, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBuilding(building);
    setDialogMode("edit");
    setBuildingDialogOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBuildingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!buildingToDelete) return;
    setBuildings((prev) => prev.filter((b) => b.id !== buildingToDelete));
    toast.success("Building deleted successfully");
    setBuildingToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleSaveBuilding = (data: Partial<Building>) => {
    if (dialogMode === "add") {
      const newBuilding: Building = {
        id: Date.now().toString(),
        projectName: data.projectName || "Untitled",
        location: data.location || "",
        propertyType: data.propertyType || "Apartment Complex",
        totalUnits: Number(data.totalUnits) || 0,
        availableUnits: Number(data.availableUnits) || 0,
        soldUnits: Number(data.soldUnits) || 0,
        constructionStatus: data.constructionStatus || "Planned",
        completionDate: data.completionDate || new Date().toISOString(),
        description: data.description || "",
        municipalPermission: !!data.municipalPermission,
        thumbnailUrl: data.thumbnailUrl || "",
        brochureUrl: data.brochureUrl || null,
        googleMapsLocation: (data as any).googleMapsLocation || undefined,
      } as Building;
      setBuildings((prev) => [...prev, newBuilding]);
      toast.success("Building added successfully");
    } else if (dialogMode === "edit" && selectedBuilding) {
      setBuildings((prev) =>
        prev.map((b) => (b.id === selectedBuilding.id ? { ...b, ...data } : b))
      );
      toast.success("Building updated successfully");
    }
    setBuildingDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-green-500",
      "Under Construction": "bg-yellow-500",
      Planned: "bg-blue-500",
    };
    return (
      <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>
        {status}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building2 className="mr-2 h-7 w-7" />
              Properties
            </h1>
            <p className="text-muted-foreground">
              Manage buildings and view details
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleAddBuilding}>
              <Plus className="mr-2 h-4 w-4" /> Add Building
            </Button>
          )}
        </div>

        {/* Filters + Grid */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or location..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Apartment Complex">
                    Apartment Complex
                  </SelectItem>
                  <SelectItem value="Villa Complex">Villa Complex</SelectItem>
                  <SelectItem value="Plot Development">
                    Plot Development
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Under Construction">
                    Under Construction
                  </SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm !== "" ||
                typeFilter !== "all" ||
                statusFilter !== "all") && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" /> Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredBuildings.map((b) => (
                <Card
                  key={b.id}
                  className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  <div className="relative">
                    {b.thumbnailUrl ? (
                      <img
                        src={b.thumbnailUrl}
                        alt={b.projectName}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <Building2 className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(b.constructionStatus)}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg">{b.projectName}</h3>
                      {canEdit && (
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => handleEditBuilding(b, e)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(b.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" /> {b.location}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span>Total Units</span>
                        <span>{b.totalUnits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available</span>
                        <span className="text-green-600">
                          {b.availableUnits}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sold</span>
                        <span className="text-blue-600">{b.soldUnits}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" /> Completion
                        </span>
                        <span>
                          {new Date(b.completionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Municipal</span>
                        {b.municipalPermission ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/properties/building/${b.id}`)}
                      >
                        View More
                      </Button>

                      {b.brochureUrl && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement("a");
                              link.href = b.brochureUrl!;
                              link.download = `${
                                b.projectName || "brochure"
                              }.pdf`;
                              link.target = "_blank";
                              link.click();
                            }}
                            title="Download Brochure"
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(
                                b.brochureUrl || ""
                              );
                              toast.success("Brochure link copied!");
                            }}
                            title="Copy Share Link"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBuildings.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No buildings found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <BuildingDialog
        open={buildingDialogOpen}
        onOpenChange={setBuildingDialogOpen}
        building={selectedBuilding || undefined}
        mode={dialogMode}
        onSave={handleSaveBuilding}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Building"
        description="Are you sure you want to delete this building?"
      />
    </MainLayout>
  );
};

export default NewProperties;
