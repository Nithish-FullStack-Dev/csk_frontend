
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Clock, FileText, UserPlus, Building, DollarSign, Truck } from "lucide-react";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: 'lead' | 'document' | 'property' | 'payment' | 'visit' | 'approval' | 'material';
}

const ACTIVITY_ICONS = {
  lead: <UserPlus className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  property: <Building className="h-4 w-4" />,
  payment: <DollarSign className="h-4 w-4" />,
  visit: <Clock className="h-4 w-4" />,
  approval: <CheckCircle2 className="h-4 w-4" />,
  material: <Truck className="h-4 w-4" />,
};

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityItem = ({ activity }: { activity: Activity }) => {
  return (
    <div className="flex gap-4 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={activity.user.avatar} />
        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">{activity.user.name}</span>
          <span className="text-muted-foreground">{activity.action}</span>
          <span className="font-medium">{activity.target}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="p-0.5 rounded-full bg-muted">
            {ACTIVITY_ICONS[activity.type]}
          </div>
          <span>{activity.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-auto">
        {activities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
