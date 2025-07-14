
import React from 'react';
import { AlertTriangle, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface QualityIssue {
  id: string;
  title: string;
  project: string;
  unit: string;
  phase: string;
  contractor: string;
  severity: 'critical' | 'major' | 'minor';
  reportedDate: string;
  status: 'open' | 'in_progress' | 'resolved';
  description: string;
}

// const qualityIssues: QualityIssue[] = [
//   {
//     id: 'qi1',
//     title: 'Concrete honeycombing in foundation',
//     project: 'Valley Heights',
//     unit: 'Block B',
//     phase: 'Groundwork and Foundation',
//     contractor: 'ABC Contractors',
//     severity: 'major',
//     reportedDate: '2025-04-08',
//     status: 'in_progress',
//     description: 'Significant honeycombing observed in the foundation concrete of the east side wall. Requires assessment and potential repair.'
//   },
//   {
//     id: 'qi2',
//     title: 'Roof waterproofing defects',
//     project: 'Valley Heights',
//     unit: 'Unit 4',
//     phase: 'Roofing',
//     contractor: 'ABC Contractors',
//     severity: 'critical',
//     reportedDate: '2025-04-07',
//     status: 'open',
//     description: 'Multiple areas of inadequate overlap in waterproofing membrane. Water ponding test failed with leakage observed in two locations.'
//   },
//   {
//     id: 'qi3',
//     title: 'Improper electrical conduit bending',
//     project: 'Riverside Tower',
//     unit: 'Block A',
//     phase: 'Electrical Works',
//     contractor: 'ElectraPro Services',
//     severity: 'minor',
//     reportedDate: '2025-04-06',
//     status: 'open',
//     description: 'Several electrical conduits improperly bent beyond the recommended angle, potentially damaging the internal wiring.'
//   },
//   {
//     id: 'qi4',
//     title: 'Plaster cracks on interior walls',
//     project: 'Green Villa',
//     unit: 'Villa 2',
//     phase: 'Masonry Work',
//     contractor: 'BuildRight Construction',
//     severity: 'minor',
//     reportedDate: '2025-04-05',
//     status: 'resolved',
//     description: 'Hairline cracks observed in the plaster of the living room wall. Contractor has already initiated remedial work.'
//   }
// ];

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  major: 'bg-amber-100 text-amber-800',
  minor: 'bg-blue-100 text-blue-800'
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800'
};

const SiteInchargeQualityIssues = ({qualityIssues}) => {
  // Filter out resolved issues and sort by severity
   
  const navigate = useNavigate();




  const activeIssues = qualityIssues
    .filter(issue => issue.status !== 'resolved')
    .sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  
  return (
    <div className="space-y-4">
      {activeIssues.map((issue) => (
        <div key={issue._id} className="border rounded-md p-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${issue.severity === 'critical' ? 'text-red-500' : issue.severity === 'major' ? 'text-amber-500' : 'text-blue-500'}`} />
              <div>
                <p className="font-medium">{issue.title}</p>
                {/* <p className="text-sm text-muted-foreground">{issue.project.projectId.basicInfo.projectName || "N/A"}, {issue.unit}</p> */}
              </div>
            </div>
            <Badge variant="outline" className={severityColors[issue.severity]}>
              {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
            </Badge>
          </div>
          
          <p className="text-sm">{issue.description}</p>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">
                Contractor: {issue.contractor.name}
              </span>
              <Badge variant="outline" className={statusColors[issue.status]}>
                {issue.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              Reported: {new Date(issue.reported_date).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex space-x-2 pt-1">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate(`/schedule`)}>
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Schedule Inspection
            </Button>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate(`/messaging`)}>
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Contact Contractor
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SiteInchargeQualityIssues;
