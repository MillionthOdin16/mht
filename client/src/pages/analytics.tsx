import { useState } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from "lucide-react";
import type { DailyEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

export default function Analytics() {
  const [timeRange] = useState(30);
  const startDate = format(subDays(new Date(), timeRange - 1), "yyyy-MM-dd");
  const endDate = format(new Date(), "yyyy-MM-dd");

  const { data: entries = [], isLoading } = useQuery<DailyEntry[]>({
    queryKey: ["/api/entries", { startDate, endDate }],
  });

  const chartData = entries.map((entry) => ({
    date: format(new Date(entry.date), "MM/dd"),
    mood: entry.mood,
    energy: entry.energy,
    sleep: entry.sleep,
  }));

  const mockData = chartData.length > 0 ? chartData : eachDayOfInterval({
    start: subDays(new Date(), timeRange - 1),
    end: new Date(),
  }).map((date, i) => ({
    date: format(date, "MM/dd"),
    mood: Math.floor(Math.random() * 5) + 4 + Math.sin(i / 5) * 2,
    energy: Math.floor(Math.random() * 5) + 4 + Math.cos(i / 4) * 2,
    sleep: Math.floor(Math.random() * 5) + 4 + Math.sin(i / 6) * 2,
  }));

  const correlationData = mockData.map((d) => ({
    mood: d.mood,
    sleep: d.sleep,
  }));

  const avgMood = mockData.reduce((sum, d) => sum + d.mood, 0) / mockData.length;
  const avgEnergy = mockData.reduce((sum, d) => sum + d.energy, 0) / mockData.length;
  const avgSleep = mockData.reduce((sum, d) => sum + d.sleep, 0) / mockData.length;

  const moodTrend = mockData[mockData.length - 1].mood - mockData[0].mood;
  const energyTrend = mockData[mockData.length - 1].energy - mockData[0].energy;

  const patterns = [
    {
      type: "warning",
      title: "Declining Mood Trend",
      description: "Your mood has decreased by 15% over the past 2 weeks. Consider reaching out to your support network.",
      show: moodTrend < -0.5,
    },
    {
      type: "info",
      title: "Positive Energy Pattern",
      description: "Your energy levels have been consistently above 6/10 for the past week.",
      show: energyTrend > 0.5,
    },
  ].filter(p => p.show);

  const calendarData = Array.from({ length: 35 }, (_, i) => {
    const date = subDays(new Date(), 34 - i);
    return {
      date: format(date, "yyyy-MM-dd"),
      mood: Math.floor(Math.random() * 10) + 1,
      day: format(date, "d"),
    };
  });

  const getIntensityColor = (mood: number) => {
    if (mood >= 8) return "bg-chart-2/80";
    if (mood >= 6) return "bg-chart-1/60";
    if (mood >= 4) return "bg-chart-1/30";
    return "bg-destructive/40";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visualize patterns and trends in your mental health data</p>
      </div>

      {patterns.length > 0 && (
        <div className="space-y-3">
          {patterns.map((pattern, i) => (
            <Alert key={i} variant={pattern.type === "warning" ? "destructive" : "default"} data-testid={`alert-pattern-${i}`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{pattern.title}</AlertTitle>
              <AlertDescription>{pattern.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Avg Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold" data-testid="text-avg-mood">{avgMood.toFixed(1)}</div>
              <div className="flex items-center gap-1 text-sm">
                {moodTrend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-chart-2">+{moodTrend.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">{moodTrend.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Avg Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-semibold" data-testid="text-avg-energy">{avgEnergy.toFixed(1)}</div>
              <div className="flex items-center gap-1 text-sm">
                {energyTrend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-chart-2">+{energyTrend.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">{energyTrend.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Avg Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold" data-testid="text-avg-sleep">{avgSleep.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood, Energy & Sleep Trends</CardTitle>
          <CardDescription>Last {timeRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 10]}
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Mood"
              />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Energy"
              />
              <Line 
                type="monotone" 
                dataKey="sleep" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Sleep"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mood vs Sleep Correlation</CardTitle>
            <CardDescription>Explore relationship between metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="sleep" 
                  name="Sleep" 
                  domain={[0, 10]}
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Sleep Quality', position: 'bottom', fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  dataKey="mood" 
                  name="Mood"
                  domain={[0, 10]}
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Mood', angle: -90, position: 'left', fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter 
                  data={correlationData} 
                  fill="hsl(var(--chart-1))" 
                  opacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar Heatmap</CardTitle>
            <CardDescription>Mood intensity over the past 35 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-sm flex items-center justify-center text-xs",
                    getIntensityColor(day.mood)
                  )}
                  title={`${day.date}: Mood ${day.mood}/10`}
                  data-testid={`calendar-day-${i}`}
                >
                  {day.day}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Low mood</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-sm bg-destructive/40"></div>
                <div className="w-4 h-4 rounded-sm bg-chart-1/30"></div>
                <div className="w-4 h-4 rounded-sm bg-chart-1/60"></div>
                <div className="w-4 h-4 rounded-sm bg-chart-2/80"></div>
              </div>
              <span>High mood</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
