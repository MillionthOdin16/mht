import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, Brain, AlertTriangle, TrendingUp, BookOpen, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DailyEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleepHours: number;
  sleepQuality: number;
  medications: string[];
  diary: string;
  tags: string[];
  siTracking: {
    present: boolean;
    intensity?: number;
  };
}

interface AIInsight {
  type: "pattern" | "trigger" | "prediction" | "question" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  tags?: string[];
}

export function AIInsights() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patterns");

  const { data: entries = [] } = useQuery<DailyEntry[]>({
    queryKey: ["/api/entries"],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, entries }),
      });
      if (!response.ok) throw new Error("Failed to generate insights");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Insights generated",
        description: "AI analysis complete",
      });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "Try again or check your API key",
        variant: "destructive",
      });
    },
  });

  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, entries }),
      });
      if (!response.ok) throw new Error("Failed to get answer");
      return response.json();
    },
  });

  const [insights, setInsights] = useState<AIInsight[]>([
    {
      type: "pattern",
      title: "Sleep-Mood Connection Detected",
      description: "Your mood improves by an average of 2.3 points when you get 7+ hours of sleep. Consider prioritizing sleep on challenging days.",
      confidence: 0.87,
      actionable: true,
      tags: ["sleep", "mood"],
    },
    {
      type: "trigger",
      title: "Monday Pattern",
      description: "Your mood tends to drop on Mondays (avg 4.2 vs 6.1 other days). Entries tagged 'work' often appear on these days.",
      confidence: 0.76,
      actionable: true,
      tags: ["work", "weekly"],
    },
    {
      type: "prediction",
      title: "Energy Forecast",
      description: "Based on your recent sleep debt, energy levels may dip in the next 2-3 days. Consider lighter commitments.",
      confidence: 0.65,
      actionable: true,
      tags: ["energy", "forecast"],
    },
    {
      type: "question",
      title: "Therapy Effectiveness",
      description: "On days tagged 'therapy', your mood averages 5.8 vs 5.2 on other days. Would you like to explore this pattern further?",
      confidence: 0.82,
      actionable: true,
      tags: ["therapy"],
    },
  ]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <Brain className="h-5 w-5" />;
      case "trigger":
        return <AlertTriangle className="h-5 w-5" />;
      case "prediction":
        return <TrendingUp className="h-5 w-5" />;
      case "question":
        return <Lightbulb className="h-5 w-5" />;
      case "recommendation":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-chart-2";
    if (confidence >= 0.6) return "text-chart-1";
    return "text-chart-4";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          AI Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Intelligent pattern recognition and predictive analysis of your mental health data
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="ask">Ask AI</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        {/* Pattern Detection */}
        <TabsContent value="patterns" className="space-y-4">
          <Card className="gradient-overlay border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Detected Patterns
              </CardTitle>
              <CardDescription>
                AI-identified correlations and recurring trends in your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => generateInsightsMutation.mutate("patterns")}
                disabled={generateInsightsMutation.isPending}
                className="w-full"
              >
                {generateInsightsMutation.isPending ? "Analyzing..." : "Refresh Patterns"}
              </Button>

              <div className="space-y-3">
                {insights
                  .filter((i) => i.type === "pattern" || i.type === "trigger")
                  .map((insight, idx) => (
                    <Card key={idx} className="bg-muted/30">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {getInsightIcon(insight.type)}
                            <h4 className="font-medium">{insight.title}</h4>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getConfidenceColor(insight.confidence))}
                          >
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.tags && (
                          <div className="flex flex-wrap gap-1">
                            {insight.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Analysis */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="gradient-overlay border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Predictive Analysis
              </CardTitle>
              <CardDescription>
                Forecasts and early warning signals based on your historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => generateInsightsMutation.mutate("predictions")}
                disabled={generateInsightsMutation.isPending}
                className="w-full"
              >
                {generateInsightsMutation.isPending ? "Analyzing..." : "Generate Predictions"}
              </Button>

              <div className="space-y-3">
                {insights
                  .filter((i) => i.type === "prediction" || i.type === "recommendation")
                  .map((insight, idx) => (
                    <Card key={idx} className="bg-muted/30">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {getInsightIcon(insight.type)}
                            <h4 className="font-medium">{insight.title}</h4>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getConfidenceColor(insight.confidence))}
                          >
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.tags && (
                          <div className="flex flex-wrap gap-1">
                            {insight.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ask AI */}
        <TabsContent value="ask" className="space-y-4">
          <Card className="gradient-overlay border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Ask About Your Data
              </CardTitle>
              <CardDescription>
                Natural language queries about your mental health patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Question:</label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border bg-background"
                  placeholder="Examples:&#10;- What activities correlate with better mood?&#10;- When do I typically experience low energy?&#10;- How does medication timing affect my sleep?&#10;- What patterns emerge before SI episodes?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <Button
                onClick={() => {
                  askQuestionMutation.mutate(question);
                  setAnswer("Analyzing your data...");
                }}
                disabled={!question || askQuestionMutation.isPending}
                className="w-full"
              >
                {askQuestionMutation.isPending ? "Thinking..." : "Ask AI"}
              </Button>

              {answer && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap">{answer}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Suggested Questions:</p>
                <div className="grid gap-2">
                  {[
                    "What's my average mood on days I exercise?",
                    "How does sleep quality correlate with next-day energy?",
                    "What tags appear most on low mood days?",
                    "Are there weekly patterns in my data?",
                  ].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => setQuestion(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Period Comparison */}
        <TabsContent value="compare" className="space-y-4">
          <Card className="gradient-overlay border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Intelligent Comparisons
              </CardTitle>
              <CardDescription>
                AI-powered analysis comparing different time periods or conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  onClick={() => generateInsightsMutation.mutate("compare-medication")}
                  disabled={generateInsightsMutation.isPending}
                >
                  Compare Days With/Without Medications
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateInsightsMutation.mutate("compare-therapy")}
                  disabled={generateInsightsMutation.isPending}
                >
                  Therapy Days vs Non-Therapy Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateInsightsMutation.mutate("compare-weekday")}
                  disabled={generateInsightsMutation.isPending}
                >
                  Weekdays vs Weekends
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateInsightsMutation.mutate("compare-periods")}
                  disabled={generateInsightsMutation.isPending}
                >
                  This Month vs Last Month
                </Button>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="pt-4 space-y-2">
                  <h4 className="font-medium">Medication Impact Analysis</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">With Medications</p>
                      <p className="text-lg font-semibold">Mood: 6.2/10</p>
                      <p className="text-sm text-muted-foreground">Energy: 6.8/10</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Without Medications</p>
                      <p className="text-lg font-semibold">Mood: 4.7/10</p>
                      <p className="text-sm text-muted-foreground">Energy: 5.1/10</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">
                    Medication adherence shows a +1.5 mood improvement and +1.7 energy boost on average.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
