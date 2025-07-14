
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ContractorInvoices from "@/components/dashboard/contractor/ContractorInvoices";

const ContractorInvoicesPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create, view, and manage construction invoices
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractorInvoices />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContractorInvoicesPage;
