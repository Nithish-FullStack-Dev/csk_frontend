
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const UpcomingSiteVisits = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Site Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">Golden Heights Phase 2</h3>
              <p className="text-sm text-muted-foreground">North Hills, Metro City</p>
            </div>
            <Badge className="bg-estate-success/20 text-estate-success">
              Confirmed
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">April 15, 2025</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">10:00 AM</p>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-md mb-4">
            <p className="text-sm text-muted-foreground">Sales Agent</p>
            <p className="font-medium">Robert Wilson</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1">Reschedule</Button>
            <Button variant="outline" className="flex-1 text-estate-error">Cancel</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingSiteVisits;
