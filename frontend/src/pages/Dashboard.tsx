import { useState, useEffect } from "react";
import { Users, TrendingUp, Mail, MessageCircle, Loader2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import KPICard from "@/components/KPICard";
import { monthlyGrowth, leadSources, campaignPerformance } from "@/data/sampleData";
import { useCityContext } from "@/contexts/CityContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { selectedCity } = useCityContext();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api("/leads/stats");
      setStats(data);
    } catch (err: any) {
      console.error(err);
      if (err.message === "Token is not valid" || err.message === "No token, authorization denied") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(err.message || "Failed to load dashboard statistics");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Could not retrieve dashboard data. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your lead generation overview
          {selectedCity !== "All Cities" && <span className="ml-1">— {selectedCity}</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Leads" value={stats.totalLeads.toLocaleString()} change={stats.totalLeadsChange} icon={Users} iconColor="bg-primary/10" />
        <KPICard title="Conversion Rate" value={`${stats.conversionRate}%`} change={stats.conversionChange} icon={TrendingUp} iconColor="bg-accent/10" />
        <KPICard title="Emails Sent" value={stats.emailsSent.toLocaleString()} change={stats.emailsChange} icon={Mail} iconColor="bg-chart-3/10" />
        <KPICard title="WhatsApp Sent" value={stats.whatsappSent.toLocaleString()} change={stats.whatsappChange} icon={MessageCircle} iconColor="bg-chart-4/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Monthly Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyGrowth} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="conversions" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={leadSources} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {leadSources.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold mb-4">Campaign Performance</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={campaignPerformance} layout="vertical" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }} />
            <Bar dataKey="sent" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Sent" />
            <Bar dataKey="opened" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Opened" />
            <Bar dataKey="clicked" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} name="Clicked" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
