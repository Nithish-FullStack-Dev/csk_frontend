
import { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Building,
  Edit,
  MapPin,
  Phone,
  User,
  Banknote,
  Home,
  Users,
  ShowerHead,
  BedDouble,
  SquareStack,
  Check,
  Clock,
  CalendarClock,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample property data
const propertyData = {
  id: "1",
  name: "Skyline Towers",
  type: "Apartment Complex",
  location: "Downtown, Metro City",
  status: "Listed",
  price: "$250,000 - $450,000",
  totalUnits: 120,
  availableUnits: 45,
  constructionStatus: "Completed",
  completionDate: "2022-06-15",
  description: "Luxury apartment complex in the heart of downtown with stunning city views, modern amenities, and premium finishes.",
  features: [
    "24/7 Security",
    "Swimming Pool",
    "Fitness Center",
    "Rooftop Garden",
    "Underground Parking",
    "Children's Play Area",
    "Community Hall",
    "High-speed Internet",
  ],
  mainImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  images: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1564013434775-f71db0030976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
  ],
  contactPerson: "Michael Brown",
  contactPhone: "+1 (555) 123-4567",
  contactEmail: "michael.brown@csk-realmanager.com",
  units: [
    {
      id: "101",
      number: "101",
      type: "1 BHK",
      floor: 1,
      area: 650,
      bedrooms: 1,
      bathrooms: 1,
      price: 250000,
      status: "available",
    },
    {
      id: "102",
      number: "102",
      type: "2 BHK",
      floor: 1,
      area: 950,
      bedrooms: 2,
      bathrooms: 2,
      price: 350000,
      status: "reserved",
    },
    {
      id: "201",
      number: "201",
      type: "3 BHK",
      floor: 2,
      area: 1200,
      bedrooms: 3,
      bathrooms: 2,
      price: 450000,
      status: "sold",
    },
    {
      id: "202",
      number: "202",
      type: "2 BHK",
      floor: 2,
      area: 950,
      bedrooms: 2,
      bathrooms: 2,
      price: 350000,
      status: "available",
    },
  ],
};

const PropertyDetails = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // In a real app, we would fetch property data based on propertyId
  const property = propertyData;
  
  const getUnitStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-estate-success">Available</Badge>;
      case "reserved":
        return <Badge className="bg-estate-gold">Reserved</Badge>;
      case "sold":
        return <Badge className="bg-estate-error">Sold</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {property.location}
            </div>
          </div>
          <Button variant="default">
            <Edit className="mr-2 h-4 w-4" />
            Edit Property
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={property.mainImage}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="units">Units</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="space-y-4 pt-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{property.description}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Features & Amenities</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
                        {property.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-estate-teal" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <Building className="h-6 w-6 text-estate-navy mb-2" />
                        <span className="text-sm text-muted-foreground">Property Type</span>
                        <span className="font-medium">{property.type}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <Users className="h-6 w-6 text-estate-navy mb-2" />
                        <span className="text-sm text-muted-foreground">Total Units</span>
                        <span className="font-medium">{property.totalUnits}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <Home className="h-6 w-6 text-estate-navy mb-2" />
                        <span className="text-sm text-muted-foreground">Available Units</span>
                        <span className="font-medium">{property.availableUnits}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <Banknote className="h-6 w-6 text-estate-navy mb-2" />
                        <span className="text-sm text-muted-foreground">Price Range</span>
                        <span className="font-medium">{property.price}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <Layers className="h-6 w-6 text-estate-navy mb-2" />
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="font-medium">{property.status}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                        <CalendarClock className="h-6 w-6 text-estate-navy mb-2" />
                        <span className="text-sm text-muted-foreground">Completion</span>
                        <span className="font-medium">{property.constructionStatus}</span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="units" className="pt-4">
                    <h3 className="text-lg font-semibold mb-4">Property Units</h3>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Floor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Area (sq ft)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Beds</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Baths</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {property.units.map((unit) => (
                            <tr key={unit.id}>
                              <td className="px-4 py-4 whitespace-nowrap">{unit.number}</td>
                              <td className="px-4 py-4 whitespace-nowrap">{unit.type}</td>
                              <td className="px-4 py-4 whitespace-nowrap">{unit.floor}</td>
                              <td className="px-4 py-4 whitespace-nowrap">{unit.area}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <BedDouble className="h-4 w-4 mr-1" />
                                  {unit.bedrooms}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <ShowerHead className="h-4 w-4 mr-1" />
                                  {unit.bathrooms}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">${unit.price.toLocaleString()}</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {getUnitStatusBadge(unit.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  <TabsContent value="documents" className="pt-4">
                    <div className="flex items-center justify-center h-40 bg-muted/50 rounded-md">
                      <div className="text-center">
                        <SquareStack className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">Property documents will be displayed here</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-estate-navy mt-0.5" />
                  <div>
                    <p className="font-medium">{property.contactPerson}</p>
                    <p className="text-sm text-muted-foreground">Property Manager</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-estate-navy" />
                  <p>{property.contactPhone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-estate-navy" />
                  <p className="text-sm">{property.contactEmail}</p>
                </div>
                <Button className="w-full">Contact Now</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {property.images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-md">
                      <img
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Listed on</p>
                    <p className="font-medium">Jan 15, 2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="mt-1 bg-estate-teal">Active</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <p>10 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PropertyDetails;
