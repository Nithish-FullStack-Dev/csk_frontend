
import { Building, MapPin, Home, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PropertyCardProps {
  id: string;
  name: string;
  location: string;
  type: string;
  units: number;
  availableUnits: number;
  price: string;
  status: 'unlisted' | 'listed' | 'under-construction' | 'sold' | 'completed';
  thumbnailUrl: string;
}

const PropertyCard = ({
  name,
  location,
  type,
  units,
  availableUnits,
  price,
  status,
  thumbnailUrl,
}: PropertyCardProps) => {
  const statusColors = {
    'unlisted': 'bg-muted text-muted-foreground',
    'listed': 'bg-estate-teal/20 text-estate-teal',
    'under-construction': 'bg-estate-gold/20 text-estate-gold',
    'sold': 'bg-estate-success/20 text-estate-success',
    'completed': 'bg-estate-navy/20 text-estate-navy',
  };

  const statusText = status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Card className="overflow-hidden card-hover">
      <div className="aspect-video relative">
        <img
          src={thumbnailUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"}
          alt={name}
          className="w-full h-full object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${statusColors[status]}`}>
          {statusText}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{type}</span>
            </div>
            
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{availableUnits} / {units} units</span>
            </div>
          </div>

          <div className="text-lg font-bold text-estate-navy">{price}</div>
        </div>
        
        <div className="flex justify-between gap-2">
          <Button variant="outline" className="flex-1">Details</Button>
          <Button className="flex-1 bg-estate-navy hover:bg-estate-navy/90">Manage</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
