import { useState } from "react";
import { format, subDays } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { Download, FileJson, FileSpreadsheet, Calendar as CalendarIcon, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";

export default function Export() {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeFields, setIncludeFields] = useState({
    mood: true,
    energy: true,
    sleepHours: true,
    sleepQuality: true,
    medications: true,
    siTracking: false,
    diary: true,
    tags: true,
    socialInteractions: true,
    activities: true,
    triggers: true,
  });
  const [filterTags, setFilterTags] = useState<string>("");

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
          format: exportFormat,
          includeFields,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindtrack-export-${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Complete",
        description: `Your data has been exported as ${exportFormat.toUpperCase()}.`,
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  const toggleField = (field: keyof typeof includeFields) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const exportOptions = [
    {
      value: "json",
      label: "JSON",
      description: "Machine-readable format for data analysis",
      icon: FileJson,
    },
    {
      value: "csv",
      label: "CSV",
      description: "Spreadsheet format compatible with Excel",
      icon: FileSpreadsheet,
    },
  ];

  const dataFields = [
    { key: "mood", label: "Mood ratings" },
    { key: "energy", label: "Energy ratings" },
    { key: "sleepHours", label: "Sleep hours" },
    { key: "sleepQuality", label: "Sleep quality ratings" },
    { key: "medications", label: "Medication logs" },
    { key: "siTracking", label: "Suicidal ideation tracking" },
    { key: "diary", label: "Diary entries" },
    { key: "tags", label: "Tags" },
    { key: "socialInteractions", label: "Social interactions" },
    { key: "activities", label: "Activities" },
    { key: "triggers", label: "Triggers" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Export Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Download your mental health tracking data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
          <CardDescription>Select your preferred data format</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={exportFormat} onValueChange={(v) => setExportFormat(v as "json" | "csv")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exportOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className="flex flex-col p-4 border border-border rounded-md cursor-pointer hover-elevate"
                  data-testid={`label-format-${option.value}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-format-${option.value}`} />
                      <option.icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-9">{option.description}</p>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Choose the time period to export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Last 7 days", days: 7 },
              { label: "Last 30 days", days: 30 },
              { label: "Last 90 days", days: 90 },
              { label: "All time", days: 365 },
            ].map((preset) => (
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
              <Label>Start Date</Label>
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
              <Label>End Date</Label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Filter by Tags
          </CardTitle>
          <CardDescription>Only export entries with specific tags (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tag-filter">Tags (comma-separated)</Label>
            <Input
              id="tag-filter"
              placeholder="e.g., anxiety, therapy, work"
              value={filterTags}
              onChange={(e) => setFilterTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to export all entries, or enter tags to filter
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Fields</CardTitle>
          <CardDescription>Select which data to include in the export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dataFields.map((field) => (
              <div key={field.key} className="flex items-center space-x-3">
                <Checkbox
                  id={field.key}
                  checked={includeFields[field.key as keyof typeof includeFields]}
                  onCheckedChange={() => toggleField(field.key as keyof typeof includeFields)}
                  data-testid={`checkbox-field-${field.key}`}
                />
                <Label htmlFor={field.key} className="text-sm font-normal cursor-pointer">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          size="lg"
          className="gap-2"
          data-testid="button-export"
        >
          <Download className="h-5 w-5" />
          {exportMutation.isPending ? "Exporting..." : `Export Data (${exportFormat.toUpperCase()})`}
        </Button>
      </div>
    </div>
  );
}
