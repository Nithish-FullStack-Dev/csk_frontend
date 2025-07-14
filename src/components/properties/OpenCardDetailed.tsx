import {
  Building,
  MapPin,
  User,
  DollarSign,
  Calendar,
  PercentIcon,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress"; // Not used for OpenPlot
import { formatCurrency } from "@/lib/utils";
import { OpenPlot } from "@/types/OpenPlots"; // Ensure this path is correct

interface OpenPlotCardDetailedProps {
  openPlot: OpenPlot;
  onView: (id: string) => void;
}

// Helper to determine status badge colors for PlotStatus
function getAvailabilityStatusBadge(status: OpenPlot["availabilityStatus"]) {
  const statusColors: Record<OpenPlot["availabilityStatus"], string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    Reserved: "bg-purple-500",
    Blocked: "bg-red-500",
    "Under Dispute": "bg-orange-500", // Added color for 'Under Dispute'
  };

  return (
    <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>
      {status}
    </Badge>
  );
}

export function OpenPlotCardDetailed({
  openPlot,
  onView,
}: OpenPlotCardDetailedProps) {
  // Calculate percentage of amount received
  const percentageReceived =
    openPlot.totalAmount > 0
      ? Math.round((openPlot.amountReceived / openPlot.totalAmount) * 100)
      : 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1">
          {openPlot.thumbnailUrl ? (
            <img
              src={openPlot.thumbnailUrl}
              alt={openPlot.projectName}
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
                    <h3 className="font-semibold text-lg">
                      {openPlot.projectName}
                    </h3>
                    {getAvailabilityStatusBadge(openPlot.availabilityStatus)}
                  </div>
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Plot {openPlot.plotNo}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">
                    {formatCurrency(openPlot.totalAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mem. No: {openPlot.memNo}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{openPlot.customerName || "Not assigned"}</span>
                  </div>
                </div>
                {/* Extent */}
                <div>
                  <div className="text-sm text-muted-foreground">Extent</div>
                  <div>{openPlot.extentSqYards} sq. yards</div>
                </div>
                {/* Plot Facing */}
                <div>
                  <div className="text-sm text-muted-foreground">
                    Plot Facing
                  </div>
                  <div>{openPlot.facing}</div>
                </div>
                {/* Listed Date */}
                <div>
                  <div className="text-sm text-muted-foreground">
                    Listed Date
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {/* Ensure listedDate is a Date object or convert it */}
                    <span>
                      {new Date(openPlot.listedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {/* Available From Date */}
                <div>
                  <div className="text-sm text-muted-foreground">
                    Available From
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {/* Ensure availableFrom is a Date object or convert it */}
                    <span>
                      {openPlot.availableFrom
                        ? new Date(openPlot.availableFrom).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
                {/* Plot Type */}
                <div>
                  <div className="text-sm text-muted-foreground">Plot Type</div>
                  <div>{openPlot.plotType}</div>
                </div>
                {/* Approval */}
                <div>
                  <div className="text-sm text-muted-foreground">Approval</div>
                  <div>{openPlot.approval}</div>
                </div>
                {/* Corner Plot & Gated Community */}
                <div className="col-span-2 flex gap-4">
                  {openPlot.isCornerPlot && (
                    <Badge variant="secondary">Corner Plot</Badge>
                  )}
                  {openPlot.isGatedCommunity && (
                    <Badge variant="secondary">Gated Community</Badge>
                  )}
                  {openPlot.emiScheme && (
                    <Badge variant="secondary">EMI Available</Badge>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">
                      Amount Received: {percentageReceived}%
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(openPlot.amountReceived)}
                    </span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span>{formatCurrency(openPlot.totalAmount)}</span>
                  </div>
                </div>
                {/* You might use Progress here if you want to visualize amount received */}
                {/* <Progress value={percentageReceived} className="h-2 mt-1" /> */}
              </div>

              <Button className="w-full" onClick={() => onView(openPlot.id)}>
                View Plot Details
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
