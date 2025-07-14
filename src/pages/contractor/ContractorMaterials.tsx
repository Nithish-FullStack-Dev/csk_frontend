
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ContractorMaterials from "@/components/dashboard/contractor/ContractorMaterials";

const ContractorMaterialsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materials Management</h1>
          <p className="text-muted-foreground">
            Track and manage construction materials across projects
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractorMaterials />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContractorMaterialsPage;
