
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, ArrowRight, Clock, FileText } from "lucide-react";
import { CONSTRUCTION_PHASES, ConstructionPhase } from "@/types/construction";

const ConstructionPhaseViewer = () => {
  const [selectedPhase, setSelectedPhase] = useState<ConstructionPhase>("site_mobilization");

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Construction Phases</CardTitle>
        <CardDescription>
          View and understand the different phases of construction and their tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="site_mobilization" value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as ConstructionPhase)}>
          <div className="scrollable-tabs overflow-x-auto pb-2">
            <TabsList className="w-full md:w-auto inline-flex">
              {Object.entries(CONSTRUCTION_PHASES).map(([key, phase]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="whitespace-nowrap"
                >
                  {phase.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {Object.entries(CONSTRUCTION_PHASES).map(([key, phase]) => (
            <TabsContent key={key} value={key} className="pt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium">{phase.title}</h3>
                  <p className="text-muted-foreground mt-1">{phase.description}</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Key Tasks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {phase.tasks.map((task, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-4 flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                          <p>{task}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Phase Guidelines</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Quality Considerations</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ensure all work meets quality standards and specifications. Regular quality checks should be performed.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-4 flex items-start">
                        <Clock className="h-5 w-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Timeline Considerations</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            This phase typically takes 2-4 weeks depending on project size. Plan for potential weather delays.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Download Phase Guidelines
                  </Button>
                  
                  {key !== 'snagging_rectification' && (
                    <Button onClick={() => {
                      const phases = Object.keys(CONSTRUCTION_PHASES);
                      const currentIndex = phases.indexOf(key);
                      const nextPhase = phases[currentIndex + 1];
                      if (nextPhase) {
                        setSelectedPhase(nextPhase as ConstructionPhase);
                      }
                    }}>
                      Next Phase
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConstructionPhaseViewer;
