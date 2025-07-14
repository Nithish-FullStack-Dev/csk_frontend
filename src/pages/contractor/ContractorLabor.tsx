
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ContractorLabor from "@/components/dashboard/contractor/ContractorLabor";

const ContractorLaborPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Labor Management</h1>
          <p className="text-muted-foreground">
            Manage workforce allocation, attendance, and productivity
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Labor Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractorLabor />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContractorLaborPage;
