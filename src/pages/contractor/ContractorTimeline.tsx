
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ContractorTimeline from "@/components/dashboard/contractor/ContractorTimeline";

const ContractorTimelinePage = () => {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Construction Timeline</h1>
          <p className="text-muted-foreground">
            View and manage project milestones, tasks, and deadlines
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractorTimeline />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContractorTimelinePage;
