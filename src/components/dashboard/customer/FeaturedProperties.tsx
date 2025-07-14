
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FeaturedProperties = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Skyline Towers",
              location: "Downtown, Metro City",
              price: "$250,000 - $450,000",
              image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              saved: true,
            },
            {
              name: "Parkview Residences",
              location: "East Side, Metro City",
              price: "$320,000 - $550,000",
              image: "https://images.unsplash.com/photo-1564013434775-f71db0030976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              saved: false,
            },
            {
              name: "Riverside Apartments",
              location: "River District, Metro City",
              price: "$400,000 - $750,000",
              image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
              saved: true,
            },
          ].map((property, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full relative">
                  <img 
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  {property.saved && (
                    <Badge className="absolute top-2 right-2 bg-estate-gold text-black">
                      Saved
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{property.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground my-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location}</span>
                  </div>
                  <p className="font-bold text-estate-navy mb-4">{property.price}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      {property.saved ? "Unsave" : "Save"}
                    </Button>
                    <Button className="flex-1 bg-estate-navy hover:bg-estate-navy/90">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedProperties;
