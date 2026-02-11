"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LineChart, DollarSign, Users, Target } from "lucide-react";

/* ================= TYPES ================= */

interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface IPerformance {
  sales: number;
  target: number;
  deals: number;
  leads: number;
  conversionRate: number;
  lastActivity: string;
}

interface ITeamLeadMapping {
  _id: string;
  salesId: IUser;
  teamLeadId: IUser;
  performance: IPerformance;
  status: "active" | "training" | "on-leave";
  createdAt: string;
  updatedAt: string;
}

/* ================= COMPONENT ================= */

const SalesManagerDashboard = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<ITeamLeadMapping[]>([]);

  /* ===== FETCH TEAM (COOKIE AUTH) ===== */

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);

        // salesId automatically comes from cookie session user
        const res = await axios.get(
          `${import.meta.env.VITE_URL}/api/teamLead/getAllSalesTeam`,
          {
            withCredentials: true,
          },
        );

        setTeam(res.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          return;
        }

        setError(err?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  /* ===== STATS ===== */

  const stats = useMemo(() => {
    const totalSales = team.reduce(
      (acc, cur) => acc + (cur.performance?.sales || 0),
      0,
    );

    const totalDeals = team.reduce(
      (acc, cur) => acc + (cur.performance?.deals || 0),
      0,
    );

    const totalLeads = team.reduce(
      (acc, cur) => acc + (cur.performance?.leads || 0),
      0,
    );

    const avgConversion =
      team.length > 0
        ? team.reduce(
            (acc, cur) => acc + (cur.performance?.conversionRate || 0),
            0,
          ) / team.length
        : 0;

    return { totalSales, totalDeals, totalLeads, avgConversion };
  }, [team]);

  const teamPerformance = useMemo(() => {
    return team.map((item) => ({
      id: item._id,
      name: item.teamLeadId?.name,
      avatar: item.teamLeadId?.avatar,
      sales: item.performance?.sales || 0,
      target: item.performance?.target || 0,
      deals: item.performance?.deals || 0,
    }));
  }, [team]);

  /* ===== STATES ===== */

  if (loading) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-10 text-center text-red-500">{error}</div>
      </MainLayout>
    );
  }

  /* ===== UI ===== */

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Sales Dashboard</h1>
            <p className="text-muted-foreground">
              Track your sales team performance
            </p>
          </div>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px] mt-4 md:mt-0">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sales"
            value={`₹ ${stats.totalSales / 100000}L`}
            trend={{ value: 0, isPositive: true }}
            icon={<DollarSign className="h-6 w-6" />}
          />

          <StatCard
            title="Deals Closed"
            value={stats.totalDeals.toString()}
            trend={{ value: 0, isPositive: true }}
            icon={<Target className="h-6 w-6" />}
          />

          <StatCard
            title="Active Leads"
            value={stats.totalLeads.toString()}
            trend={{ value: 0, isPositive: true }}
            icon={<Users className="h-6 w-6" />}
          />

          <StatCard
            title="Conversion Rate"
            value={`${stats.avgConversion.toFixed(2)}%`}
            trend={{ value: 0, isPositive: true }}
            icon={<LineChart className="h-6 w-6" />}
          />
        </div>

        {/* TEAM PERFORMANCE */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {teamPerformance.map((member) => (
                <div key={member.id} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          member.avatar ||
                          "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                        }
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Team Lead
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">₹ {member.sales / 100000}L</p>
                      <p className="text-sm text-muted-foreground">
                        {member.target
                          ? ((member.sales / member.target) * 100).toFixed(0)
                          : 0}
                        % of target
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={
                      member.target ? (member.sales / member.target) * 100 : 0
                    }
                  />

                  <p className="text-xs text-muted-foreground text-right">
                    {member.deals} deals closed
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesManagerDashboard;
