
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ApplicationStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="font-bold">Riverside Apartments, Unit 207</h3>
                <p className="text-sm text-muted-foreground">Application #APL-2023-0042</p>
              </div>
              <Badge className="bg-estate-gold/20 text-estate-gold">In Progress</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Document Verification</span>
                <span>2 of 3 Complete</span>
              </div>
              <Progress value={66} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="font-bold">Parkview Residences, Unit 105</h3>
                <p className="text-sm text-muted-foreground">Application #APL-2023-0039</p>
              </div>
              <Badge className="bg-estate-error/20 text-estate-error">Incomplete</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Document Verification</span>
                <span>1 of 3 Complete</span>
              </div>
              <Progress value={33} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStatus;
