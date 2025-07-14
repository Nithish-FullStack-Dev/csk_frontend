
import React from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TimelineItem {
  id: string;
  title: string;
  project: string;
  unit: string;
  date: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'delayed';
  type: 'milestone' | 'task' | 'inspection';
  dependency?: string;
  description: string;
}

// Sample timeline data
const timelineData: TimelineItem[] = [
  {
    id: 't1',
    title: 'Foundation Completion',
    project: 'Riverside Tower',
    unit: 'Block A',
    date: '2025-04-10',
    startDate: '2025-03-20',
    endDate: '2025-04-10',
    status: 'completed',
    type: 'milestone',
    description: 'Complete foundation work including concrete curing'
  },
  {
    id: 't2',
    title: 'Structural Framework Begin',
    project: 'Riverside Tower',
    unit: 'Block A',
    date: '2025-04-12',
    startDate: '2025-04-12',
    endDate: '2025-05-15',
    status: 'in_progress',
    type: 'task',
    dependency: 't1',
    description: 'Begin structural column formwork and reinforcement'
  },
  {
    id: 't3',
    title: 'Quality Inspection',
    project: 'Riverside Tower',
    unit: 'Block A',
    date: '2025-04-20',
    startDate: '2025-04-20',
    endDate: '2025-04-20',
    status: 'upcoming',
    type: 'inspection',
    dependency: 't2',
    description: 'First floor column and beam inspection'
  },
  {
    id: 't4',
    title: 'Concrete Pouring - First Floor',
    project: 'Riverside Tower',
    unit: 'Block A',
    date: '2025-04-25',
    startDate: '2025-04-25',
    endDate: '2025-04-27',
    status: 'upcoming',
    type: 'task',
    dependency: 't3',
    description: 'Pour concrete for first floor columns and beams'
  },
  {
    id: 't5',
    title: 'Foundation Work',
    project: 'Valley Heights',
    unit: 'Unit 4',
    date: '2025-04-05',
    startDate: '2025-03-25',
    endDate: '2025-04-05',
    status: 'delayed',
    type: 'task',
    description: 'Foundation work delayed due to unexpected soil condition'
  },
  {
    id: 't6',
    title: 'Masonry Work Begin',
    project: 'Green Villa',
    unit: 'Villa 2',
    date: '2025-04-15',
    startDate: '2025-04-15',
    endDate: '2025-04-30',
    status: 'upcoming',
    type: 'task',
    description: 'Start brickwork for ground floor walls'
  }
];

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  upcoming: 'bg-purple-100 text-purple-800',
  delayed: 'bg-red-100 text-red-800'
};

const typeIcons = {
  milestone: <CheckCircle className="h-4 w-4 mr-1" />,
  task: <Clock className="h-4 w-4 mr-1" />,
  inspection: <Loader2 className="h-4 w-4 mr-1" />
};

const ContractorTimeline = () => {
  const sortedTimeline = [...timelineData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group timeline items by project
  const groupedByProject: Record<string, TimelineItem[]> = sortedTimeline.reduce((groups, item) => {
    if (!groups[item.project]) {
      groups[item.project] = [];
    }
    groups[item.project].push(item);
    return groups;
  }, {} as Record<string, TimelineItem[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedByProject).map(([project, items]) => (
        <div key={project} className="space-y-3">
          <h3 className="font-semibold text-lg">{project}</h3>
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute w-3 h-3 rounded-full bg-estate-blue -left-[1.65rem] top-2"></div>
                <div className="p-4 border rounded-lg">
                  <div className="flex flex-wrap justify-between mb-2">
                    <div className="flex items-center">
                      <h4 className="font-medium text-md mr-2">{item.title}</h4>
                      <Badge variant="secondary" className={`${statusColors[item.status]}`}>
                        {getStatusIcon(item.status)}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {typeIcons[item.type]}
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Unit:</span> {item.unit}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span> {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start:</span> {new Date(item.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">End:</span> {new Date(item.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractorTimeline;
