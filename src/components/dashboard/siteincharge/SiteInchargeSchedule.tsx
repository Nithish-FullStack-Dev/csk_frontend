
import React from 'react';
import { Calendar, ClipboardCheck, Users, MapPin, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Inspection {
  id: string;
  title: string;
  project: string;
  unit: string;
  phase: string;
  date: string;
  time: string;
  type: 'routine' | 'milestone' | 'quality_issue';
  contractor: string;
  location: string;
  status: 'scheduled' | 'completed' | 'rescheduled';
}

const inspections: Inspection[] = [
  {
    id: 'i1',
    title: 'Foundation Inspection',
    project: 'Valley Heights',
    unit: 'Block B',
    phase: 'Groundwork and Foundation',
    date: '2025-04-12',
    time: '10:00 AM',
    type: 'milestone',
    contractor: 'ABC Contractors',
    location: 'Northeast corner of site',
    status: 'scheduled'
  },
  {
    id: 'i2',
    title: 'Structural Framework Inspection',
    project: 'Riverside Tower',
    unit: 'Floor 5',
    phase: 'Structural Framework',
    date: '2025-04-13',
    time: '2:00 PM',
    type: 'routine',
    contractor: 'BuildRight Construction',
    location: 'Main structure - 5th floor',
    status: 'scheduled'
  },
  {
    id: 'i3',
    title: 'Roof Waterproofing Verification',
    project: 'Valley Heights',
    unit: 'Unit 4',
    phase: 'Roofing',
    date: '2025-04-14',
    time: '9:30 AM',
    type: 'quality_issue',
    contractor: 'ABC Contractors',
    location: 'Roof level - Building D',
    status: 'scheduled'
  },
  {
    id: 'i4',
    title: 'Electrical Conduiting Check',
    project: 'Riverside Tower',
    unit: 'Floor 3',
    phase: 'Electrical Works',
    date: '2025-04-15',
    time: '11:00 AM',
    type: 'routine',
    contractor: 'ElectraPro Services',
    location: '3rd floor - West wing',
    status: 'scheduled'
  },
  {
    id: 'i5',
    title: 'Plumbing Pressure Test',
    project: 'Green Villa',
    unit: 'Villa 3',
    phase: 'Plumbing Works',
    date: '2025-04-09',
    time: '3:00 PM',
    type: 'milestone',
    contractor: 'BuildRight Construction',
    location: 'Villa 3',
    status: 'completed'
  }
];

const typeColors: Record<string, string> = {
  routine: 'bg-blue-100 text-blue-800',
  milestone: 'bg-purple-100 text-purple-800',
  quality_issue: 'bg-red-100 text-red-800'
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  rescheduled: 'bg-gray-100 text-gray-800'
};

const SiteInchargeSchedule = (inspections: any) => {
  // Sort inspections by date and filter out past inspections
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ensure inspections is an array
  // if (!Array.isArray(inspections)) {
  //   inspections = [];
  // }

  let upcomingInspections = [];
  if(Array.isArray(inspections)){
    upcomingInspections =  inspections
    .filter(inspection => new Date(inspection.date) >= today || inspection.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  
  return (
    <div className="space-y-4">
      {upcomingInspections.map((inspection) => (
        <div key={inspection.id} className="border rounded-md p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{inspection.title}</h3>
              <p className="text-sm text-muted-foreground">{inspection.project}, {inspection.unit}</p>
            </div>
            <Badge variant="outline" className={typeColors[inspection.type]}>
              {inspection.type === 'quality_issue' ? 'Quality Issue' : 
               inspection.type.charAt(0).toUpperCase() + inspection.type.slice(1)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(inspection.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{inspection.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{inspection.contractor}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{inspection.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={statusColors[inspection.status]}>
              {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
            </Badge>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">Reschedule</Button>
              <Button size="sm">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Begin Inspection
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SiteInchargeSchedule;
