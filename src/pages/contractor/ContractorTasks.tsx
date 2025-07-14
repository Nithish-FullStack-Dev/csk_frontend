
import MainLayout from "@/components/layout/MainLayout";
import ContractorTaskList from "@/components/dashboard/contractor/ContractorTaskList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ContractorTasks = () => {
  return (
    <MainLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Manage and track construction tasks across all projects
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractorTaskList />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContractorTasks;
