
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PropertyCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video w-full">
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
              alt="Riverside Apartments" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Riverside Apartments, Unit 305</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>River District, Metro City</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">June 15, 2023</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-estate-success/20 text-estate-success">Ready</Badge>
              </div>
            </div>
            <Button className="w-full bg-estate-navy hover:bg-estate-navy/90">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video w-full">
            <img 
              src="https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
              alt="Golden Heights" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Golden Heights, Villa 12</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>North Hills, Metro City</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span>Construction Progress</span>
                <span>75%</span>
              </div>
              <Progress value={75} />
              <p className="text-xs text-right text-muted-foreground">
                Expected Completion: October 2025
              </p>
            </div>
            <Button className="w-full bg-estate-navy hover:bg-estate-navy/90">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyCards;
