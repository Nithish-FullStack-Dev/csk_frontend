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
  Home,
  SlidersHorizontal,
  X,
  Calendar,
  Check,
  Plus,
  Pencil,
  Trash2,
  Download,
  Share2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Building } from "@/types/building";
import { formatIndianCurrency } from "@/lib/formatCurrency";
import { BuildingDialog } from "@/components/properties/BuildingDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";

// Sample buildings data
const sampleBuildings: Building[] = [
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
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    brochureUrl: "https://example.com/brochures/skyline-towers.pdf",
  },
  {
    id: "2",
    projectName: "Parkview Residences",
    location: "North Hills, Metro City",
    propertyType: "Apartment Complex",
    totalUnits: 96,
    availableUnits: 32,
    soldUnits: 64,
    constructionStatus: "Under Construction",
    completionDate: "2024-06-30",
    description: "Modern apartments with park views",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1564013434775-f71db0030976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    brochureUrl: "https://example.com/brochures/parkview-residences.pdf",
  },
  {
    id: "3",
    projectName: "Riverside Apartments",
    location: "River District, Metro City",
    propertyType: "Apartment Complex",
    totalUnits: 80,
    availableUnits: 25,
    soldUnits: 55,
    constructionStatus: "Completed",
    completionDate: "2023-12-15",
    description: "Peaceful riverside living",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    brochureUrl: null,
  },
  {
    id: "4",
    projectName: "Golden Heights Phase 2",
    location: "West End, Metro City",
    propertyType: "Villa Complex",
    totalUnits: 45,
    availableUnits: 12,
    soldUnits: 33,
    constructionStatus: "Under Construction",
    completionDate: "2025-03-20",
    description: "Premium villa complex with modern amenities",
    municipalPermission: false,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    brochureUrl: null,
  },
  {
    id: "5",
    projectName: "Evergreen Villas",
    location: "Green Valley, Metro City",
    propertyType: "Villa Complex",
    totalUnits: 30,
    availableUnits: 8,
    soldUnits: 22,
    constructionStatus: "Under Construction",
    completionDate: "2025-01-10",
    description: "Luxury villas with custom interiors",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    brochureUrl: null,
  },
  {
    id: "6",
    projectName: "Central Park Residences",
    location: "City Center, Metro City",
    propertyType: "Apartment Complex",
    totalUnits: 150,
    availableUnits: 55,
    soldUnits: 95,
    constructionStatus: "Completed",
    completionDate: "2023-09-30",
    description: "Urban living at its finest",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    brochureUrl: null,
  },
];

const NewProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for buildings and UI controls
  const [buildings] = useState<Building[]>(sampleBuildings);
  const [filteredBuildings, setFilteredBuildings] =
    useState<Building[]>(sampleBuildings);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<
    Building | undefined
  >();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);

  const canEdit = user && ["owner", "admin"].includes(user.role);

  // Apply filters whenever filter criteria changes
  useEffect(() => {
    let results = buildings;

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      results = results.filter(
        (building) =>
          building.projectName.toLowerCase().includes(lowercaseSearch) ||
          building.location.toLowerCase().includes(lowercaseSearch)
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      results = results.filter(
        (building) => building.propertyType === typeFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(
        (building) => building.constructionStatus === statusFilter
      );
    }

    setFilteredBuildings(results);
  }, [searchTerm, typeFilter, statusFilter, buildings]);

  // Helper function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  // Helper function to determine if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== "" || typeFilter !== "all" || statusFilter !== "all";
  };

  const handleAddBuilding = () => {
    setSelectedBuilding(undefined);
    setDialogMode("add");
    setBuildingDialogOpen(true);
  };

  const handleEditBuilding = (building: Building, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBuilding(building);
    setDialogMode("edit");
    setBuildingDialogOpen(true);
  };

  const handleDeleteClick = (buildingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBuildingToDelete(buildingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // In a real app, this would delete from the database
    toast.success("Building deleted successfully");
    setDeleteDialogOpen(false);
    setBuildingToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Completed: "bg-green-500",
      "Under Construction": "bg-yellow-500",
      Planned: "bg-blue-500",
    };

    return (
      <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
        {status}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building2 className="mr-2 h-7 w-7" />
              Properties
            </h1>
            <p className="text-muted-foreground">
              Manage buildings and view individual units
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleAddBuilding}>
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search and main filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search buildings by name or location..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[200px]">
                      <Building2 className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Apartment Complex">
                        Apartment Complex
                      </SelectItem>
                      <SelectItem value="Villa Complex">
                        Villa Complex
                      </SelectItem>
                      <SelectItem value="Plot Development">
                        Plot Development
                      </SelectItem>
                      <SelectItem value="Land Parcel">Land Parcel</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <Filter className="mr-2 h-4 w-4" />
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

                  {hasActiveFilters() && (
                    <Button
                      variant="ghost"
                      className="flex-shrink-0"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Buildings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredBuildings.map((building) => (
                  <Card
                    key={building.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() =>
                      navigate(`/properties/building/${building.id}`)
                    }
                  >
                    <div className="relative">
                      {building.thumbnailUrl ? (
                        <img
                          src={building.thumbnailUrl}
                          alt={building.projectName}
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="h-48 w-full bg-muted flex items-center justify-center">
                          <Building2 className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(building.constructionStatus)}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-lg">
                          {building.projectName}
                        </h3>
                        {canEdit && (
                          <div
                            className="flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => handleEditBuilding(building, e)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => handleDeleteClick(building.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{building.location}</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Total Units
                          </span>
                          <span className="font-medium">
                            {building.totalUnits}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Available
                          </span>
                          <span className="font-medium text-green-600">
                            {building.availableUnits}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sold</span>
                          <span className="font-medium text-blue-600">
                            {building.soldUnits}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Completion
                          </span>
                          <span className="font-medium">
                            {new Date(
                              building.completionDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Municipal
                          </span>
                          {building.municipalPermission ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1"
                          onClick={() =>
                            navigate(`/properties/building/${building.id}`)
                          }
                        >
                          View Details
                        </Button>
                        {building.brochureUrl && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                href={building.brochureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (navigator.share && building.brochureUrl) {
                                  navigator
                                    .share({
                                      title: `${building.projectName} Brochure`,
                                      text: `Check out the brochure for ${building.projectName}`,
                                      url: building.brochureUrl,
                                    })
                                    .catch(() => {
                                      navigator.clipboard.writeText(
                                        building.brochureUrl
                                      );
                                      toast.success(
                                        "Brochure link copied to clipboard"
                                      );
                                    });
                                } else if (building.brochureUrl) {
                                  navigator.clipboard.writeText(
                                    building.brochureUrl
                                  );
                                  toast.success(
                                    "Brochure link copied to clipboard"
                                  );
                                }
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </>
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
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BuildingDialog
        open={buildingDialogOpen}
        onOpenChange={setBuildingDialogOpen}
        building={selectedBuilding}
        mode={dialogMode}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Building"
        description="Are you sure you want to delete this building? This action cannot be undone and will also delete all associated floors and units."
      />
    </MainLayout>
  );
};

export default NewProperties;
