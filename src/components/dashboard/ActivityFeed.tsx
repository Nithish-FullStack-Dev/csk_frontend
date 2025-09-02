import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Clock,
  FileText,
  UserPlus,
  Building,
  DollarSign,
  Truck,
} from "lucide-react";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type:
    | "lead"
    | "document"
    | "property"
    | "payment"
    | "visit"
    | "approval"
    | "material";
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
    <div className="flex gap-3 mb-4 sm:gap-4">
      {/* Avatar */}
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
        <AvatarImage src={activity.user.avatar} />
        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex flex-col w-full">
        {/* User + Action */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-1 text-sm">
          <span className="font-medium">{activity.user.name}</span>
          <span className="text-muted-foreground">{activity.action}</span>
          <span className="font-medium break-words">{activity.target}</span>
        </div>

        {/* Timestamp + Icon */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
          <div className="p-0.5 rounded-full bg-muted flex items-center justify-center">
            {ACTIVITY_ICONS[activity.type]}
          </div>
          <span className="whitespace-nowrap">{activity.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto px-2 sm:px-4">
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
