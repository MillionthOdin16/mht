import { useState } from "react";
import { format, subDays } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Calendar as CalendarIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function AISummary() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [summary, setSummary] = useState<string | null>(null);

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/ai-summary", {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
    },
    onSuccess: (data: any) => {
      setSummary(data.summary);
      toast({
        title: "Summary Generated",
        description: "AI summary has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generateSummaryMutation.mutate();
  };

  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">AI Summary</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate clinical summaries using AI analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range Selection</CardTitle>
          <CardDescription>Choose the time period for analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate(subDays(new Date(), preset.days));
                  setEndDate(new Date());
                }}
                data-testid={`button-preset-${preset.days}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-start-date">
                    <CalendarIcon className="h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-end-date">
                    <CalendarIcon className="h-4 w-4" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateSummaryMutation.isPending}
            className="w-full gap-2"
            size="lg"
            data-testid="button-generate-summary"
          >
            <Sparkles className="h-5 w-5" />
            {generateSummaryMutation.isPending ? "Generating Summary..." : "Generate AI Summary"}
          </Button>
        </CardContent>
      </Card>

      {generateSummaryMutation.isPending && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {summary && !generateSummaryMutation.isPending && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Clinical Summary
                  <Badge variant="secondary">AI Generated</Badge>
                </CardTitle>
                <CardDescription>
                  {format(startDate, "PPP")} - {format(endDate, "PPP")}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-download-summary">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground" data-testid="text-summary-content">
                {summary}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
