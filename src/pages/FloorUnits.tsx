import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Home,
  User,
  DollarSign,
  PercentIcon,
  Calendar,
} from "lucide-react";
import { Property } from "@/types/property";
import { Progress } from "@/components/ui/progress";
import { formatIndianCurrency } from "@/lib/formatCurrency";

// Sample apartment data
const sampleApartments: Property[] = [
  {
    id: "apt1",
    memNo: "MEM001",
    projectName: "Skyline Towers",
    plotNo: "101",
    villaFacing: "North-East",
    extent: 1250,
    propertyType: "Apartment",
    customerId: null,
    customerStatus: "Purchased",
    status: "Sold",
    contractor: null,
    siteIncharge: null,
    totalAmount: 4200000,
    workCompleted: 100,
    deliveryDate: "2023-10-15",
    emiScheme: true,
    contactNo: "+91 98765 43210",
    agentId: null,
    registrationStatus: "Completed",
    ratePlan: "Premium Plan",
    amountReceived: 4200000,
    balanceAmount: 0,
    remarks: "Handover completed",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    projectStatus: "upcoming",
  },
  {
    id: "apt2",
    memNo: "MEM002",
    projectName: "Skyline Towers",
    plotNo: "102",
    villaFacing: "North",
    extent: 1200,
    propertyType: "Apartment",
    customerId: null,
    customerStatus: "Purchased",
    status: "Sold",
    contractor: null,
    siteIncharge: null,
    totalAmount: 3900000,
    workCompleted: 100,
    deliveryDate: "2023-10-15",
    emiScheme: true,
    contactNo: "+91 98765 43211",
    agentId: null,
    registrationStatus: "Completed",
    ratePlan: "Standard Plan",
    amountReceived: 3900000,
    balanceAmount: 0,
    remarks: "Completed",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    projectStatus: "upcoming",
  },
  {
    id: "apt3",
    memNo: "MEM003",
    projectName: "Skyline Towers",
    plotNo: "103",
    villaFacing: "East",
    extent: 1300,
    propertyType: "Apartment",
    customerId: null,
    customerStatus: "Open",
    status: "Available",
    contractor: null,
    siteIncharge: null,
    totalAmount: 4000000,
    workCompleted: 100,
    deliveryDate: "2023-10-15",
    emiScheme: true,
    contactNo: "",
    agentId: null,
    registrationStatus: "Not Started",
    ratePlan: "Standard Plan",
    amountReceived: 0,
    balanceAmount: 4000000,
    remarks: "Ready for sale",
    municipalPermission: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    projectStatus: "completed",
  },
];

const FloorUnits = () => {
  const { buildingId, floorId } = useParams<{
    buildingId: string;
    floorId: string;
  }>();
  const navigate = useNavigate();

  const apartments = sampleApartments;

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Available: "bg-green-500",
      Sold: "bg-blue-500",
      "Under Construction": "bg-yellow-500",
      Reserved: "bg-purple-500",
      Blocked: "bg-red-500",
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
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/properties/building/${buildingId}`)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Building
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Individual Units</h1>
          <p className="text-muted-foreground">
            Select a unit to view complete details
          </p>
        </div>

        <div className="grid gap-4">
          {apartments.map((apartment) => (
            <Card
              key={apartment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Image */}
                  <div className="md:col-span-1">
                    {apartment.thumbnailUrl ? (
                      <img
                        src={apartment.thumbnailUrl}
                        alt={`Unit ${apartment.plotNo}`}
                        className="h-48 md:h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      />
                    ) : (
                      <div className="h-48 md:h-full w-full bg-muted flex items-center justify-center">
                        <Home className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-3 p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">
                              Unit {apartment.plotNo}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Mem. No: {apartment.memNo}
                            </p>
                          </div>
                          {getStatusBadge(apartment.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Extent
                            </p>
                            <p className="font-medium">
                              {apartment.extent} sq.ft
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Facing
                            </p>
                            <p className="font-medium">
                              {apartment.villaFacing}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Customer
                            </p>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1 text-muted-foreground" />
                              <p className="font-medium">
                                {apartment.customerId?.user?.name ||
                                  "Available"}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Price
                            </p>
                            <p className="font-medium">
                              {formatIndianCurrency(apartment.totalAmount)}
                            </p>
                          </div>
                        </div>

                        {apartment.status !== "Available" && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center">
                                <PercentIcon className="h-4 w-4 mr-1" />
                                Work Progress
                              </span>
                              <span>{apartment.workCompleted}%</span>
                            </div>
                            <Progress
                              value={apartment.workCompleted}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() =>
                          navigate(`/properties/unit/${apartment.id}`)
                        }
                      >
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default FloorUnits;
