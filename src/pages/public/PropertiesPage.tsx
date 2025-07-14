
import PublicLayout from "@/components/layout/PublicLayout";
import PropertyListingCard from "@/components/public/PropertyListingCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const PropertiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  const properties = [
    {
      id: 1,
      title: "Green Valley Residences",
      location: "Sector 45, Gurgaon",
      type: "Completed",
      category: "Villa",
      price: "₹85 Lakhs onwards",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["3-4 BHK", "Swimming Pool", "Clubhouse", "24/7 Security"],
      description: "Luxury villa project with modern amenities and beautiful landscaping."
    },
    {
      id: 2,
      title: "Sunrise Heights",
      location: "New Town, Kolkata", 
      type: "Ongoing",
      category: "Apartment",
      price: "₹65 Lakhs onwards",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["2-3 BHK", "Gym", "Garden", "Parking"],
      description: "Modern apartment complex with excellent connectivity and amenities."
    },
    {
      id: 3,
      title: "Premium Plots - Phase 2",
      location: "Electronic City, Bangalore",
      type: "Open Plots",
      category: "Plot",
      price: "₹45 Lakhs onwards",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["1200-2400 sq ft", "Gated Community", "All Amenities", "Ready to Build"],
      description: "Prime residential plots in a well-planned gated community."
    }
  ];

  const filteredProperties = properties.filter(property => {
    return (
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedType === "" || property.type === selectedType) &&
      (selectedLocation === "" || property.location.includes(selectedLocation)) &&
      (selectedBudget === "" || true) // Budget filtering logic can be added
    );
  });

  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="bg-estate-navy text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4">All Properties</h1>
            <p className="text-xl">Discover your perfect home from our curated collection</p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Open Plots">Open Plots</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setSelectedBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Budgets</SelectItem>
                  <SelectItem value="below-50">Below ₹50L</SelectItem>
                  <SelectItem value="50-75">₹50L - ₹75L</SelectItem>
                  <SelectItem value="75-100">₹75L - ₹1Cr</SelectItem>
                  <SelectItem value="above-100">Above ₹1Cr</SelectItem>
                </SelectContent>
              </Select>

              <Button>
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <PropertyListingCard key={property.id} property={property} />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold mb-4">No properties found</h3>
                <p className="text-gray-600 mb-8">Try adjusting your search criteria</p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setSelectedType("");
                  setSelectedLocation("");
                  setSelectedBudget("");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default PropertiesPage;
