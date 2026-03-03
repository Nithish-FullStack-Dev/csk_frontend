// components/dashboard/customer/PropertyCards.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const fetchMyPurchases = async (page: number) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/customer/my-purchases?page=${page}&limit=4`,
    { withCredentials: true },
  );
  return data?.data;
};

const PropertyCards = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-purchases", page],
    queryFn: () => fetchMyPurchases(page),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (isError || !data?.purchases?.length) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No properties found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.purchases.map((item: any) => {
          const projectName = item.property?.projectName ?? "Project";
          const location = item.property?.location ?? "-";
          const unit = item.unit?.plotNo ?? "-";
          const bookingDate = item.bookingDate
            ? new Date(item.bookingDate).toLocaleDateString()
            : "-";

          const image =
            item.property?.thumbnailUrl ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

          const progress =
            typeof item.constructionStage === "string"
              ? parseInt(item.constructionStage) || 0
              : 0;

          return (
            <Card key={item._id}>
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <img
                    src={image}
                    alt={projectName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">
                    {projectName}, Unit {unit}
                  </h3>

                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Booking Date
                      </p>
                      <p className="font-medium">{bookingDate}</p>
                    </div>

                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Registration Status
                      </p>
                      <Badge>{item.registrationStatus ?? "Pending"}</Badge>
                    </div>
                  </div>

                  {progress > 0 && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Construction Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}

                  <Button
                    onClick={() => navigate("/properties")}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>

        <span className="flex items-center text-sm">
          Page {data.pagination.currentPage} of {data.pagination.totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page === data.pagination.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PropertyCards;
