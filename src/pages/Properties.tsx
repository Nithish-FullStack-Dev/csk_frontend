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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Filter,
  Search,
  Plus,
  MapPin,
  User,
  PanelLeft,
  LayoutGrid,
  CalendarClock,
  Banknote,
  CalendarCheck2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PropertyCardDetailed } from "@/components/properties/PropertyCardDetailed";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { PropertyDetails } from "@/components/properties/PropertyDetails";
import { getCsrfToken, useAuth } from "@/contexts/AuthContext";
import { Property } from "@/types/property";
import axios from "axios";
import { OpenPlotDialog } from "@/components/properties/OpenPlotsDialog";
import { OpenPlot } from "@/types/OpenPlots";
import { OpenPlotCardDetailed } from "@/components/properties/OpenCardDetailed";
import { OpenPlotDetails } from "@/components/properties/OpenPlotDetails";

const sampleProperties: Property[] = [];
const sampleOpenPlots: OpenPlot[] = [];

const Properties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // State for properties and UI controls
  const [properties, setProperties] = useState<Property[]>(sampleProperties);
  const [openPlots, setOpenPlots] = useState<OpenPlot[]>(sampleOpenPlots);
  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(sampleProperties);
  const [filteredOpenPlots, setFilteredOpenPlots] =
    useState<OpenPlot[]>(sampleOpenPlots);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const [statusTab, setStatusTab] = useState("all");

  // State for property editing/creating
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenPlot, setDialogOpenPlot] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | undefined>(
    undefined
  );
  const [currentOpenPolt, setCurrentOpenPlot] = useState<OpenPlot | undefined>(
    undefined
  );
  const [selectedProperty, setSelectedProperty] = useState<
    Property | undefined
  >(undefined);
  const [selectedOpenPlot, setSelectedOpenPlot] = useState<
    // New state for selected open plot
    OpenPlot | undefined
  >(undefined);

  // Derived state for unique values in dropdown filters
  const uniqueProjects = Array.from(
    new Set(properties.map((p) => p.projectName))
  );

  const canEdit = user && ["owner", "admin"].includes(user.role);
  const isCustomer = user && ["customer_purchased"].includes(user.role);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      let data = [];

      if (isCustomer) {
        const { data: customer } = await axios.get(
          `${import.meta.env.VITE_URL}/api/customer/getCustomerByUser`,
          { withCredentials: true }
        );
        data = customer.properties.map((p: any) => p.property);
      } else {
        const { data: properties } = await axios.get(
          `${import.meta.env.VITE_URL}/api/properties/getProperties`,
          { withCredentials: true }
        );
        data = properties;
      }

      const sampleProperties: Property[] = data.map((item: any) => {
        const basic = item.basicInfo || {};
        const customer = item.customerInfo || {};
        const construction = item.constructionDetails || {};
        const finance = item.financialDetails || {};
        const location = item.locationInfo || {};
        return {
          id: item._id,
          memNo: basic.membershipNumber || "",
          projectName: basic.projectName || "Unknown Project",
          plotNo: basic.plotNumber || "-",
          villaFacing: basic.facingDirection || "-",
          extent: basic.Extent || 0,
          propertyType: basic.propertyType || "Apartment",
          projectStatus: basic.projectStatus,
          preBooking: basic.preBooking,
          customerId: customer.customerId || null,
          customerStatus: customer.customerStatus || "-",
          status: customer.propertyStatus || "-",
          contractor: construction.contractor?.name || null,
          siteIncharge: construction.siteIncharge?.name || null,
          totalAmount: finance.totalAmount || 0,
          workCompleted: construction.workCompleted || 0,
          deliveryDate: construction.deliveryDate?.slice(0, 10) || "",
          emiScheme: finance.eMIScheme || false,
          contactNo: customer.contactNumber?.toString() || "-",
          agentId: customer.agentId || null,
          registrationStatus: finance.registrationStatus || "-",
          ratePlan: finance.ratePlan || "-",
          amountReceived: finance.amountReceived || 0,
          balanceAmount: finance.balanceAmount || 0,
          remarks: location.remarks || "-",
          municipalPermission: construction.municipalPermission || false,
          googleMapsLocation: location.googleMapsLocation || "",
          thumbnailUrl:
            location.mainPropertyImage ||
            "https://images.unsplash.com/photo-1564013434775-f71db0030976?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        };
      });

      setProperties(sampleProperties);
      setFilteredProperties(sampleProperties);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      toast.error("Failed to load properties.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllOpenPlots = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/openPlot/getAllOpenPlot`,
        { withCredentials: true }
      );
      setOpenPlots(data.plots);
      setFilteredOpenPlots(data.plots);
    } catch (error) {
      console.error("Failed to fetch open plots:", error);
      toast.error("Failed to load open plots.");
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchAllOpenPlots();
  }, []);

  // Apply filters whenever filter criteria changes
  useEffect(() => {
    let results = properties;
    let openPlotResults = openPlots;

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      results = results.filter(
        (property) =>
          property.plotNo.toLowerCase().includes(lowercaseSearch) ||
          property.projectName.toLowerCase().includes(lowercaseSearch) ||
          property.memNo.toLowerCase().includes(lowercaseSearch) ||
          (property.customerId?.user?.name &&
            property.customerId?.user?.name
              .toLowerCase()
              .includes(lowercaseSearch))
      );
      openPlotResults = openPlotResults.filter(
        (plot) =>
          plot.plotNo.toLowerCase().includes(lowercaseSearch) ||
          plot.projectName.toLowerCase().includes(lowercaseSearch) ||
          plot.memNo.toLowerCase().includes(lowercaseSearch) ||
          (plot.customerId?.user?.name &&
            plot.customerId?.user?.name.toLowerCase().includes(lowercaseSearch))
      );
    }

    // Apply project filter
    if (projectFilter !== "all") {
      results = results.filter(
        (property) => property.projectName === projectFilter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter((property) => property.status === statusFilter);
    }

    // Apply customer status filter
    if (customerFilter !== "all") {
      results = results.filter(
        (property) => property.customerStatus === customerFilter
      );
    }

    setFilteredProperties(results);
    setFilteredOpenPlots(openPlotResults);
  }, [
    searchTerm,
    projectFilter,
    statusFilter,
    customerFilter,
    openPlots,
    properties,
  ]);

  // Handler for adding/editing properties
  const handlePropertySubmit = (data: any) => {
    if (currentProperty) {
      // Edit existing property
      const updatedProperties = properties.map((property) =>
        property.id === currentProperty.id
          ? { ...property, ...data, id: property.id }
          : property
      );
      setProperties(updatedProperties);

      toast.success("Property updated successfully");
    } else {
      // Add new property
      const newProperty = {
        ...data,
      };
      setProperties([...properties, newProperty]);
      toast.success("Property added successfully");
    }
    fetchProperties();
    setDialogOpen(false);
    setCurrentProperty(undefined);
  };

  const handleOpenPlotSubmit = (data: any) => {
    if (currentOpenPolt) {
      // Edit existing open plot
      const updatedOpenPlots = openPlots.map((plot) =>
        plot._id === currentOpenPolt._id
          ? { ...plot, ...data, id: plot._id }
          : plot
      );
      setOpenPlots(updatedOpenPlots);
      fetchAllOpenPlots();
      toast.success("Open plot updated successfully");
    } else {
      // Add new open plot
      const newOpenPlot = {
        ...data,
      };
      setOpenPlots([...openPlots, newOpenPlot]);
      toast.success("Open plot added successfully");
    }
    setDialogOpen(false);
    setCurrentOpenPlot(undefined);
  };

  // Handler for deleting a property
  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    try {
      const csrfToken = await getCsrfToken();

      await axios.delete(
        `${import.meta.env.VITE_URL}/api/properties/deleteProperty/${
          selectedProperty.id
        }`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      const updatedProperties = properties.filter(
        (property) => property.id !== selectedProperty.id
      );
      setProperties(updatedProperties);
      setSelectedProperty(undefined);
      toast.success("Property deleted successfully");
    } catch (error) {
      console.error("Failed to delete property:", error);
      toast.error("Failed to delete property.");
    }
  };

  const handleDeleteOpenPlot = async () => {
    if (!selectedOpenPlot) return;
    try {
      const csrfToken = await getCsrfToken();

      await axios.delete(
        `${import.meta.env.VITE_URL}/api/openPlot/deleteOpenPlot/${
          selectedOpenPlot._id
        }`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      const updatedOpenPlots = openPlots.filter(
        (plot) => plot._id !== selectedOpenPlot._id
      );
      setOpenPlots(updatedOpenPlots);
      setSelectedOpenPlot(undefined);
      toast.success("Open plot deleted successfully");
    } catch (error) {
      console.error("Failed to delete open plot:", error);
      toast.error("Failed to delete open plot.");
    }
  };

  // Helper function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setProjectFilter("all");
    setStatusFilter("all");
    setCustomerFilter("all");
  };

  // Helper function to determine if any filters are active
  const hasActiveFilters = () => {
    return (
      searchTerm !== "" ||
      projectFilter !== "all" ||
      statusFilter !== "all" ||
      customerFilter !== "all"
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* If a property is selected, show its details */}
        {selectedProperty ? (
          <PropertyDetails
            property={selectedProperty}
            onEdit={() => {
              setCurrentProperty(selectedProperty);
              setDialogOpen(true);
            }}
            onDelete={handleDeleteProperty}
            onBack={() => setSelectedProperty(undefined)}
          />
        ) : selectedOpenPlot ? (
          <OpenPlotDetails
            plot={selectedOpenPlot}
            onEdit={() => {
              setCurrentOpenPlot(selectedOpenPlot);
              setDialogOpenPlot(true);
            }}
            onDelete={handleDeleteOpenPlot}
            onBack={() => setSelectedOpenPlot(undefined)}
          />
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-md flex items-center font-vidaloka">
                  <Building className="mr-2 h-7 w-7 font-sans" />
                  Properties
                </h1>
                <p className="text-muted-foreground font-sans">
                  Manage and track your real estate portfolio
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-3 md:flex-row flex-col ">
                  <Button
                    className="bg-estate-navy hover:bg-estate-navy/90"
                    onClick={() => {
                      setCurrentProperty(undefined);
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add New Property
                  </Button>
                  <Button
                    className="bg-estate-tomato hover:bg-estate-tomato/90"
                    onClick={() => {
                      setCurrentOpenPlot(undefined);
                      setDialogOpenPlot(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Open Plots
                  </Button>
                </div>
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
                        placeholder="Search properties by plot no, project, mem. no..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={projectFilter}
                        onValueChange={setProjectFilter}
                      >
                        <SelectTrigger className="w-[200px]">
                          <Building className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {uniqueProjects.map((project) => (
                            <SelectItem key={project} value={project}>
                              {project}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[200px] font-sans">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Sold">Sold</SelectItem>
                          <SelectItem value="Under Construction">
                            Under Construction
                          </SelectItem>
                          <SelectItem value="Reserved">Reserved</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        className="w-[50px] flex-shrink-0"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>

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

                  {/* Additional filters section */}
                  {showFilters && (
                    <Card className="bg-muted/50 font-sans">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Customer Status
                            </p>
                            <Select
                              value={customerFilter}
                              onValueChange={setCustomerFilter}
                            >
                              <SelectTrigger>
                                <User className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Customer Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Customers
                                </SelectItem>
                                <SelectItem value="Purchased">
                                  Purchased
                                </SelectItem>
                                <SelectItem value="Inquiry">Inquiry</SelectItem>
                                <SelectItem value="Blocked">Blocked</SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Additional filter options could be added here */}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* View mode toggle */}
                  <div className="flex justify-between items-center md:flex-row flex-col gap-5">
                    <div className="text-sm text-muted-foreground">
                      {filteredProperties.length}{" "}
                      {filteredProperties.length === 1
                        ? "property"
                        : "properties"}{" "}
                      found
                    </div>
                    <Tabs
                      value={viewMode}
                      onValueChange={setViewMode}
                      className="w-auto"
                    >
                      <TabsList>
                        <TabsTrigger value="list" className="flex items-center">
                          <PanelLeft className="mr-2 h-4 w-4" />
                          List
                        </TabsTrigger>
                        <TabsTrigger
                          value="detail"
                          className="flex items-center"
                        >
                          <LayoutGrid className="mr-2 h-4 w-4" />
                          Details
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Properties listing */}
            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 border border-t-0 rounded-b-lg space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Building className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium">No properties found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find properties.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs
                  value={statusTab}
                  onValueChange={setStatusTab}
                  className="w-full"
                >
                  <TabsList className="hidden md:flex gap-2 overflow-x-auto whitespace-nowrap mb-4">
                    <TabsTrigger value="all">All Properties</TabsTrigger>
                    <TabsTrigger
                      value="available"
                      className="flex items-center"
                    >
                      <Building className="mr-2 h-4 w-4" /> Available
                    </TabsTrigger>
                    <TabsTrigger
                      value="construction"
                      className="flex items-center"
                    >
                      <CalendarClock className="mr-2 h-4 w-4" /> Under
                      Construction
                    </TabsTrigger>
                    {!isCustomer && (
                      <TabsTrigger value="sold" className="flex items-center">
                        <Banknote className="mr-2 h-4 w-4" /> Sold
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="upcoming" className="flex items-center">
                      <CalendarCheck2 className="mr-2 h-4 w-4" /> Upcoming
                    </TabsTrigger>
                    {!isCustomer && (
                      <TabsTrigger
                        value="openPlots"
                        className="flex items-center"
                      >
                        <MapPin className="mr-2 h-4 w-4" /> Open Plots
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <div className="block md:hidden mb-4">
                    <Select value={statusTab} onValueChange={setStatusTab}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="construction">
                          Under Construction
                        </SelectItem>
                        {!isCustomer && (
                          <SelectItem value="sold">Sold</SelectItem>
                        )}
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        {!isCustomer && (
                          <SelectItem value="openPlots">Open Plots</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <TabsContent value="all">
                    <div className="space-y-4">
                      {viewMode === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProperties.map((property) => (
                            <div
                              key={property.id}
                              className="cursor-pointer"
                              onClick={() => setSelectedProperty(property)}
                            >
                              <div className="relative group">
                                {/* Thumbnail */}
                                <div className="relative h-48 overflow-hidden rounded-t-lg">
                                  {property.thumbnailUrl ? (
                                    <img
                                      src={property.thumbnailUrl}
                                      alt={property.projectName}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <Building className="h-12 w-12 text-muted-foreground/20" />
                                    </div>
                                  )}

                                  {/* Status indicator */}
                                  <div className="absolute top-3 right-3">
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        property.status === "Available"
                                          ? "bg-green-500"
                                          : property.status === "Sold"
                                          ? "bg-blue-500"
                                          : property.status ===
                                            "Under Construction"
                                          ? "bg-yellow-500"
                                          : property.status === "Reserved"
                                          ? "bg-purple-500"
                                          : "bg-red-500"
                                      } text-white`}
                                    >
                                      {property.status}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Info section */}
                                <div className="p-4 border border-t-0 rounded-b-lg">
                                  <h3 className="font-medium text-lg">
                                    {property.projectName}
                                  </h3>
                                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    <span>Plot {property.plotNo}</span>
                                  </div>
                                  <div className="mt-3 flex justify-between items-center">
                                    <div className="font-medium">
                                      ₹{property.totalAmount.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Mem. {property.memNo}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredProperties.map((property) => (
                            <PropertyCardDetailed
                              key={property.id}
                              property={property}
                              onView={() => setSelectedProperty(property)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="available">
                    <div className="space-y-4">
                      {viewMode === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProperties
                            .filter(
                              (property) => property.status === "Available"
                            )
                            .map((property) => (
                              <div
                                key={property.id}
                                className="cursor-pointer"
                                onClick={() => setSelectedProperty(property)}
                              >
                                <div className="relative group">
                                  {/* Thumbnail */}
                                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                                    {property.thumbnailUrl ? (
                                      <img
                                        src={property.thumbnailUrl}
                                        alt={property.projectName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Building className="h-12 w-12 text-muted-foreground/20" />
                                      </div>
                                    )}

                                    {/* Status indicator */}
                                    <div className="absolute top-3 right-3">
                                      <Badge
                                        variant="outline"
                                        className={`${
                                          property.status === "Available"
                                            ? "bg-green-500"
                                            : property.status === "Sold"
                                            ? "bg-blue-500"
                                            : property.status ===
                                              "Under Construction"
                                            ? "bg-yellow-500"
                                            : property.status === "Reserved"
                                            ? "bg-purple-500"
                                            : "bg-red-500"
                                        } text-white`}
                                      >
                                        {property.status}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Info section */}
                                  <div className="p-4 border border-t-0 rounded-b-lg">
                                    <h3 className="font-medium text-lg">
                                      {property.projectName}
                                    </h3>
                                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                                      <MapPin className="h-3.5 w-3.5 mr-1" />
                                      <span>Plot {property.plotNo}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                      <div className="font-medium">
                                        ₹{property.totalAmount.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Mem. {property.memNo}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredProperties
                            .filter(
                              (property) => property.status === "Available"
                            )
                            .map((property) => (
                              <PropertyCardDetailed
                                key={property.id}
                                property={property}
                                onView={() => setSelectedProperty(property)}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="construction">
                    <div className="space-y-4">
                      {viewMode === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProperties
                            .filter(
                              (property) =>
                                property.status === "Under Construction"
                            )
                            .map((property) => (
                              <div
                                key={property.id}
                                className="cursor-pointer"
                                onClick={() => setSelectedProperty(property)}
                              >
                                <div className="relative group">
                                  {/* Thumbnail */}
                                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                                    {property.thumbnailUrl ? (
                                      <img
                                        src={property.thumbnailUrl}
                                        alt={property.projectName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Building className="h-12 w-12 text-muted-foreground/20" />
                                      </div>
                                    )}

                                    {/* Status indicator */}
                                    <div className="absolute top-3 right-3">
                                      <Badge
                                        variant="outline"
                                        className={`${
                                          property.status === "Available"
                                            ? "bg-green-500"
                                            : property.status === "Sold"
                                            ? "bg-blue-500"
                                            : property.status ===
                                              "Under Construction"
                                            ? "bg-yellow-500"
                                            : property.status === "Reserved"
                                            ? "bg-purple-500"
                                            : "bg-red-500"
                                        } text-white`}
                                      >
                                        {property.status}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Info section */}
                                  <div className="p-4 border border-t-0 rounded-b-lg">
                                    <h3 className="font-medium text-lg">
                                      {property.projectName}
                                    </h3>
                                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                                      <MapPin className="h-3.5 w-3.5 mr-1" />
                                      <span>Plot {property.plotNo}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                      <div className="font-medium">
                                        ₹{property.totalAmount.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Mem. {property.memNo}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredProperties
                            .filter(
                              (property) =>
                                property.status === "Under Construction"
                            )
                            .map((property) => (
                              <PropertyCardDetailed
                                key={property.id}
                                property={property}
                                onView={() => setSelectedProperty(property)}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="sold">
                    <div className="space-y-4">
                      {viewMode === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProperties
                            .filter((property) => property.status === "Sold")
                            .map((property) => (
                              <div
                                key={property.id}
                                className="cursor-pointer"
                                onClick={() => setSelectedProperty(property)}
                              >
                                <div className="relative group">
                                  {/* Thumbnail */}
                                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                                    {property.thumbnailUrl ? (
                                      <img
                                        src={property.thumbnailUrl}
                                        alt={property.projectName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Building className="h-12 w-12 text-muted-foreground/20" />
                                      </div>
                                    )}

                                    {/* Status indicator */}
                                    <div className="absolute top-3 right-3">
                                      <Badge
                                        variant="outline"
                                        className={`${
                                          property.status === "Available"
                                            ? "bg-green-500"
                                            : property.status === "Sold"
                                            ? "bg-blue-500"
                                            : property.status ===
                                              "Under Construction"
                                            ? "bg-yellow-500"
                                            : property.status === "Reserved"
                                            ? "bg-purple-500"
                                            : "bg-red-500"
                                        } text-white`}
                                      >
                                        {property.status}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Info section */}
                                  <div className="p-4 border border-t-0 rounded-b-lg">
                                    <h3 className="font-medium text-lg">
                                      {property.projectName}
                                    </h3>
                                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                                      <MapPin className="h-3.5 w-3.5 mr-1" />
                                      <span>Plot {property.plotNo}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                      <div className="font-medium">
                                        ₹{property.totalAmount.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Mem. {property.memNo}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredProperties
                            .filter((property) => property.status === "Sold")
                            .map((property) => (
                              <PropertyCardDetailed
                                key={property.id}
                                property={property}
                                onView={() => setSelectedProperty(property)}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      {viewMode === "list" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProperties
                            .filter((property) => {
                              property.status === "Reserved" ||
                                property.status === "Blocked";
                            })
                            .map((property) => (
                              <div
                                key={property.id}
                                className="cursor-pointer"
                                onClick={() => setSelectedProperty(property)}
                              >
                                <div className="relative group">
                                  {/* Thumbnail */}
                                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                                    {property.thumbnailUrl ? (
                                      <img
                                        src={property.thumbnailUrl}
                                        alt={property.projectName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Building className="h-12 w-12 text-muted-foreground/20" />
                                      </div>
                                    )}

                                    {/* Status indicator */}
                                    <div className="absolute top-3 right-3">
                                      <Badge
                                        variant="outline"
                                        className={`${
                                          property.status === "Available"
                                            ? "bg-green-500"
                                            : property.status === "Sold"
                                            ? "bg-blue-500"
                                            : property.status ===
                                              "Under Construction"
                                            ? "bg-yellow-500"
                                            : property.status === "Reserved"
                                            ? "bg-purple-500"
                                            : "bg-red-500"
                                        } text-white`}
                                      >
                                        {property.status}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Info section */}
                                  <div className="p-4 border border-t-0 rounded-b-lg">
                                    <h3 className="font-medium text-lg">
                                      {property.projectName}
                                    </h3>
                                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                                      <MapPin className="h-3.5 w-3.5 mr-1" />
                                      <span>Plot {property.plotNo}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                      <div className="font-medium">
                                        ₹{property.totalAmount.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Mem. {property.memNo}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredProperties
                            .filter((property) => {
                              property.status === "Reserved" ||
                                property.status === "Blocked";
                            })
                            .map((property) => (
                              <PropertyCardDetailed
                                key={property._id}
                                property={property}
                                onView={() => setSelectedProperty(property)}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="openPlots">
                    {filteredOpenPlots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <MapPin className="h-16 w-16 text-muted-foreground/30 mb-4" />

                        <h3 className="text-xl font-medium">
                          No open plots found
                        </h3>

                        <p className="text-muted-foreground">
                          Try adjusting your search or filters to find open
                          plots.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {viewMode === "list" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredOpenPlots.map((plot) => (
                              <div
                                key={plot._id}
                                className="cursor-pointer"
                                onClick={() => setSelectedOpenPlot(plot)}
                              >
                                <div className="relative group">
                                  {/* Thumbnail */}

                                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                                    {plot.thumbnailUrl ? (
                                      <img
                                        src={plot.thumbnailUrl}
                                        alt={plot.projectName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <MapPin className="h-12 w-12 text-muted-foreground/20" />
                                      </div>
                                    )}

                                    {/* Status indicator (using availabilityStatus from OpenPlot) */}

                                    <div className="absolute top-3 right-3">
                                      <Badge
                                        variant="outline"
                                        className={`${
                                          plot.availabilityStatus ===
                                          "Available"
                                            ? "bg-green-500"
                                            : plot.availabilityStatus === "Sold"
                                            ? "bg-blue-500"
                                            : plot.availabilityStatus ===
                                              "Reserved"
                                            ? "bg-purple-500"
                                            : "bg-red-500"
                                        } text-white`}
                                      >
                                        {plot.availabilityStatus}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Info section */}

                                  <div className="p-4 border border-t-0 rounded-b-lg">
                                    <h3 className="font-medium text-lg">
                                      {plot.projectName}
                                    </h3>

                                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                                      <MapPin className="h-3.5 w-3.5 mr-1" />

                                      <span>Plot {plot.plotNo}</span>
                                    </div>

                                    <div className="mt-3 flex justify-between items-center">
                                      <div className="font-medium">
                                        ₹{plot.totalAmount.toLocaleString()}
                                      </div>

                                      <div className="text-sm text-muted-foreground">
                                        Mem. {plot.memNo}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {filteredOpenPlots.map((plot) => (
                              <OpenPlotCardDetailed
                                key={plot._id}
                                openPlot={plot}
                                onView={() => setSelectedOpenPlot(plot)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}

        {/* Dialog for creating/editing properties */}
        <PropertyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          property={currentProperty}
          onSubmit={handlePropertySubmit}
        />
        <OpenPlotDialog
          open={dialogOpenPlot}
          onOpenChange={setDialogOpenPlot}
          openPlot={currentOpenPolt}
          onSubmit={handleOpenPlotSubmit}
        />
      </div>
    </MainLayout>
  );
};

export default Properties;
