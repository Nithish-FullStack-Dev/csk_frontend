
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Calendar, Building } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyListingCardProps {
  property: {
    id: number;
    title: string;
    location: string;
    type: string;
    category: string;
    price: string;
    image: string;
    features: string[];
    description: string;
  };
}

const PropertyListingCard = ({ property }: PropertyListingCardProps) => {
  const getTypeColor = (type: string) => {
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <Badge className={`absolute top-4 right-4 ${getTypeColor(property.type)} text-white`}>
          {property.type}
        </Badge>
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {property.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{property.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
        
        <div className="space-y-2 mb-4">
          {property.features.slice(0, 2).map((feature, index) => (
            <span key={index} className="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-2 mb-1">
              {feature}
            </span>
          ))}
          {property.features.length > 2 && (
            <span className="text-xs text-gray-500">
              +{property.features.length - 2} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-estate-navy">{property.price}</div>
        </div>
        
        <div className="space-y-2">
          <Button className="w-full" asChild>
            <Link to={`/public/property/${property.id}`}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="w-full">
            Schedule Site Visit
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyListingCard;
