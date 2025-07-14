
import { Building, MapPin, User, DollarSign, Calendar, PercentIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Property } from "@/types/property";
import { formatCurrency } from "@/lib/utils";

interface PropertyCardDetailedProps {
  property: Property;
  onView: (id: string) => void;
}

// Helper to determine status badge colors
function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    'Available': 'bg-green-500',
    'Sold': 'bg-blue-500',
    'Under Construction': 'bg-yellow-500',
    'Reserved': 'bg-purple-500',
    'Blocked': 'bg-red-500',
  };

  return (
    <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
      {status}
    </Badge>
  );
}

export function PropertyCardDetailed({ property, onView }: PropertyCardDetailedProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1">
          {property.thumbnailUrl ? (
            <img
              src={property.thumbnailUrl}
              alt={property.projectName}
              className="h-full w-full object-cover md:h-56"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center md:h-56">
              <Building className="h-12 w-12 opacity-20" />
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">{property.projectName}</h3>
                    {getStatusBadge(property.status)}
                  </div>
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Plot {property.plotNo}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(property.totalAmount)}</div>
                  <div className="text-sm text-muted-foreground">Mem. No: {property.memNo}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{property.customerName || 'Not assigned'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Extent</div>
                  <div>{property.extent} sq. ft</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Villa Facing</div>
                  <div>{property.villaFacing}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{new Date(property.deliveryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <PercentIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">Work Completed: {property.workCompleted}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600">{formatCurrency(property.amountReceived)}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span>{formatCurrency(property.totalAmount)}</span>
                  </div>
                </div>
                <Progress value={property.workCompleted} className="h-2 mt-1" />
              </div>
              
              <Button className="w-full" onClick={() => onView(property.id)}>
                View Property Details
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
