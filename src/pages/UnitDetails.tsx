import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { PropertyDetails } from "@/components/properties/PropertyDetails";
import { Property } from "@/types/property";

// Sample apartment data - in real app, fetch based on unitId
const sampleApartment: Property = {
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
  remarks: "Handover completed and all documents processed.",
  municipalPermission: true,
  googleMapsLocation: "https://maps.google.com/?q=40.7128,-74.0060",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  projectStatus: "completed",
};

const UnitDetails = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();

  const apartment = sampleApartment;

  const handleBack = () => {
    // Navigate back to the floor units page
    // In a real app, you'd track the buildingId and floorId
    navigate(-1);
  };

  return (
    <MainLayout>
      <PropertyDetails
        property={apartment}
        onEdit={() => {
          // Handle edit - in real app would open edit dialog
          console.log("Edit unit", unitId);
        }}
        onDelete={() => {
          // Handle delete - in real app would confirm and delete
          console.log("Delete unit", unitId);
        }}
        onBack={handleBack}
      />
    </MainLayout>
  );
};

export default UnitDetails;
