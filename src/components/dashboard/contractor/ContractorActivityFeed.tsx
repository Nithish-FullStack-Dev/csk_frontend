
import React from 'react';
import { Check, Clock, AlertCircle, Upload, FileText, X } from 'lucide-react';

interface Activity {
  id: string;
  type: 'task_completed' | 'task_approved' | 'task_rejected' | 'document_uploaded' | 'invoice_created' | 'deadline_approaching';
  description: string;
  project: string;
  unit?: string;
  timestamp: string;
}

const activities: Activity[] = [
  {
    id: 'a1',
    type: 'task_approved',
    description: 'Wall plastering approved by Site In-charge',
    project: 'Green Villa',
    unit: 'Villa 2',
    timestamp: '2025-04-11T09:45:00Z'
  },
  {
    id: 'a2',
    type: 'task_completed',
    description: 'Foundation concrete pouring marked as completed',
    project: 'Riverside Tower',
    unit: 'Block A',
    timestamp: '2025-04-10T16:30:00Z'
  },
  {
    id: 'a3',
    type: 'deadline_approaching',
    description: 'Electrical conduiting deadline approaching in 2 days',
    project: 'Valley Heights',
    unit: 'Unit 3',
    timestamp: '2025-04-10T08:15:00Z'
  },
  {
    id: 'a4',
    type: 'document_uploaded',
    description: 'Inspection report uploaded',
    project: 'Riverside Tower',
    timestamp: '2025-04-09T14:20:00Z'
  },
  {
    id: 'a5',
    type: 'task_rejected',
    description: 'Roof waterproofing rejected. Rework required',
    project: 'Valley Heights',
    unit: 'Unit 4',
    timestamp: '2025-04-09T11:05:00Z'
  },
  {
    id: 'a6',
    type: 'invoice_created',
    description: 'Invoice #INV-2023-042 created for completed tasks',
    project: 'Green Villa',
    timestamp: '2025-04-08T16:45:00Z'
  }
];

const activityIcons = {
  task_completed: <Check className="h-5 w-5 text-green-500" />,
  task_approved: <Check className="h-5 w-5 text-blue-500" />,
  task_rejected: <X className="h-5 w-5 text-red-500" />,
  document_uploaded: <Upload className="h-5 w-5 text-purple-500" />,
  invoice_created: <FileText className="h-5 w-5 text-gray-500" />,
  deadline_approaching: <Clock className="h-5 w-5 text-amber-500" />
};

const ContractorActivityFeed = () => {
  // Format timestamp to relative time (e.g., "2 days ago")
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="mt-0.5">
            {activityIcons[activity.type]}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {activity.project}{activity.unit ? `, ${activity.unit}` : ''}
            </p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractorActivityFeed;
