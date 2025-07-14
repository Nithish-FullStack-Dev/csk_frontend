import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Save,
  Plus,
  Trash2,
  Eye,
  Upload,
  Building,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const PropertiesCMS = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [properties, setProperties] = useState([
    // {
    //   id: 1,
    //   title: "Green Valley Residences",
    //   location: "Sector 45, Gurgaon",
    //   type: "Completed",
    //   category: "Villa",
    //   price: "₹85 Lakhs onwards",
    //   image:
    //     "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    //   features: ["3-4 BHK", "Swimming Pool", "Clubhouse", "24/7 Security"],
    //   description:
    //     "Luxury villa project with modern amenities and beautiful landscaping.",
    //   status: "active",
    // },
    // {
    //   id: 2,
    //   title: "Sunrise Heights",
    //   location: "New Town, Kolkata",
    //   type: "Ongoing",
    //   category: "Apartment",
    //   price: "₹65 Lakhs onwards",
    //   image:
    //     "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    //   features: ["2-3 BHK", "Gym", "Garden", "Parking"],
    //   description:
    //     "Modern apartment complex with excellent connectivity and amenities.",
    //   status: "active",
    // },
    // {
    //   id: 3,
    //   title: "Premium Plots - Phase 2",
    //   location: "Electronic City, Bangalore",
    //   type: "Open Plots",
    //   category: "Plot",
    //   price: "₹45 Lakhs onwards",
    //   image:
    //     "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    //   features: [
    //     "1200-2400 sq ft",
    //     "Gated Community",
    //     "All Amenities",
    //     "Ready to Build",
    //   ],
    //   description: "Prime residential plots in a well-planned gated community.",
    //   status: "active",
    // },
  ]);

  const [editingProperty, setEditingProperty] = useState(null);

  const fetchSlides = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/cms/cmsProperty/getAllCms"
      );
      // console.log(res.data);
      setProperties(res.data.cmsProperties);
    } catch (error) {
      console.log("Fetch error", error);
    }
  };

  const saveSlides = async () => {
    try {
      await axios.post("http://localhost:3000/api/cms/cmsProperty/addAllCms", {
        properties,
      });
      console.log("Slides saved");
    } catch (error) {
      console.log("Save error", error);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    setEditingProperty(null);
    await saveSlides();
  };

  const addNewProperty = async () => {
    const newProperty = {
      id: Date.now(),
      title: "New Property",
      location: "City, State",
      type: "Upcoming",
      category: "Apartment",
      price: "₹XX Lakhs onwards",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["Feature 1", "Feature 2"],
      description: "Property description goes here.",
      status: "active",
    };
    try {
      const response = await axios.post(
        "http://localhost:3000/api/cms/cmsProperty/addPropCms",
        newProperty
      );
      const savedSlide = response.data.property;
      setProperties([...properties, newProperty]);
    } catch (error) {
      console.log("Save error", error);
    }
  };

  const removeProperty = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/cms/cmsProperty/deletePropCms/${id}`
      );
      setProperties(properties.filter((property) => property._id !== id));
      toast.success("Property deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete property");
    }
  };

  const updateProperty = (id, field, value) => {
    setProperties(
      properties.map((property) =>
        property.id === id ? { ...property, [field]: value } : property
      )
    );
  };

  const updatePropertyFeatures = (id, features) => {
    setProperties(
      properties.map((property) =>
        property.id === id
          ? { ...property, features: features.split(",").map((f) => f.trim()) }
          : property
      )
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Completed":
        return "bg-green-500";
      case "Ongoing":
        return "bg-yellow-500";
      case "Upcoming":
        return "bg-blue-500";
      case "Open Plots":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Properties Management</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Manage all property listings across different categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={addNewProperty} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
          {isEditing ? (
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Properties ({properties.length})
          </h3>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {properties.filter((p) => p.type === "Completed").length}{" "}
              Completed
            </Badge>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              {properties.filter((p) => p.type === "Ongoing").length} Ongoing
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {properties.filter((p) => p.type === "Upcoming").length} Upcoming
            </Badge>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800"
            >
              {properties.filter((p) => p.type === "Open Plots").length} Open
              Plots
            </Badge>
          </div>
        </div>

        <div className="grid gap-4">
          {properties.map((property) => (
            <Card key={property._id} className="p-4">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge
                        className={`${getTypeColor(property.type)} text-white`}
                      >
                        {property.type}
                      </Badge>
                      <Badge variant="outline">{property.category}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProperty(property._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${property.id}`}>Title</Label>
                        <Input
                          id={`title-${property.id}`}
                          value={property.title}
                          onChange={(e) =>
                            updateProperty(property.id, "title", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${property.id}`}>Price</Label>
                        <Input
                          id={`price-${property.id}`}
                          value={property.price}
                          onChange={(e) =>
                            updateProperty(property.id, "price", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${property.id}`}>
                          Location
                        </Label>
                        <Input
                          id={`location-${property.id}`}
                          value={property.location}
                          onChange={(e) =>
                            updateProperty(
                              property.id,
                              "location",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`type-${property.id}`}>Type</Label>
                        <Select
                          value={property.type}
                          onValueChange={(value) =>
                            updateProperty(property.id, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                            <SelectItem value="Open Plots">
                              Open Plots
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`description-${property.id}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`description-${property.id}`}
                          value={property.description}
                          onChange={(e) =>
                            updateProperty(
                              property.id,
                              "description",
                              e.target.value
                            )
                          }
                          rows={2}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`features-${property.id}`}>
                          Features (comma separated)
                        </Label>
                        <Input
                          id={`features-${property.id}`}
                          value={property.features.join(", ")}
                          onChange={(e) =>
                            updatePropertyFeatures(property.id, e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`image-${property.id}`}>
                          Image URL
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`image-${property.id}`}
                            value={property.image}
                            onChange={(e) =>
                              updateProperty(
                                property.id,
                                "image",
                                e.target.value
                              )
                            }
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold">{property.title}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {property.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {property.features.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <div className="font-semibold text-estate-navy">
                        {property.price}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertiesCMS;
