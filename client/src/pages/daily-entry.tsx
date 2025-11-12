import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Save, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { insertDailyEntrySchema, type InsertDailyEntry } from "@shared/schema";
import { cn } from "@/lib/utils";

const formSchema = insertDailyEntrySchema.extend({
  date: z.date(),
});

export default function DailyEntry() {
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [siOpen, setSiOpen] = useState(false);
  const [socialInteractions, setSocialInteractions] = useState<Array<{ type: string; quality: number; notes: string }>>([]);
  const [activities, setActivities] = useState<Array<{ name: string; duration: number; enjoyment: number; notes: string }>>([]);
  const [triggers, setTriggers] = useState<Array<{ name: string; severity: number; notes: string }>>([]);

  const { data: medications = [] } = useQuery<Array<{ id: string; name: string; isActive: number }>>({
    queryKey: ["/api/medications"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      mood: 5,
      energy: 5,
      sleep: 5,
      medications: [],
      siTracking: {
        present: false,
      },
      diary: "",
    },
  });

  const diary = form.watch("diary");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastSaved(new Date());
    }, 1000);
    return () => clearTimeout(timer);
  }, [diary]);

  const createEntryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/entries", {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      setLastSaved(new Date());
      toast({
        title: "Entry Saved",
        description: "Your daily entry has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createEntryMutation.mutate(values);
  };

  const addSocialInteraction = () => {
    setSocialInteractions([...socialInteractions, { type: "", quality: 5, notes: "" }]);
  };

  const addActivity = () => {
    setActivities([...activities, { name: "", duration: 0, enjoyment: 5, notes: "" }]);
  };

  const addTrigger = () => {
    setTriggers([...triggers, { name: "", severity: 5, notes: "" }]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Daily Entry</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your mental health data</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" data-testid="button-date-picker" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{format(form.watch("date"), "PPP")}</span>
              <span className="sm:hidden">{format(form.watch("date"), "PP")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.watch("date")}
              onSelect={(date) => date && form.setValue("date", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Metrics</CardTitle>
              <CardDescription>Rate your mood, energy, and sleep quality (1-10)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium">Mood</FormLabel>
                      <Badge variant="secondary" className="min-w-12 justify-center" data-testid="text-mood-value">
                        {field.value}
                      </Badge>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="min-h-12"
                        data-testid="slider-mood"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="energy"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium">Energy</FormLabel>
                      <Badge variant="secondary" className="min-w-12 justify-center" data-testid="text-energy-value">
                        {field.value}
                      </Badge>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="min-h-12"
                        data-testid="slider-energy"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleep"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium">Sleep Quality</FormLabel>
                      <Badge variant="secondary" className="min-w-12 justify-center" data-testid="text-sleep-value">
                        {field.value}
                      </Badge>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="min-h-12"
                        data-testid="slider-sleep"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>Select medications taken today</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="medications"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {medications.map((medication) => (
                        <FormField
                          key={medication.id}
                          control={form.control}
                          name="medications"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={medication.id}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(medication.name)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value || [], medication.name])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== medication.name
                                            )
                                          )
                                    }}
                                    data-testid={`checkbox-medication-${medication.name.toLowerCase().replace(/\s+/g, '-')}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {medication.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Collapsible open={siOpen} onOpenChange={setSiOpen}>
            <Card className="border-destructive/50">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate" data-testid="button-si-toggle">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-destructive">Suicidal Ideation Tracking</CardTitle>
                      <CardDescription>Optional - Expand to track SI-related thoughts</CardDescription>
                    </div>
                    <Badge variant="destructive" className="no-default-hover-elevate">
                      {siOpen ? "Expanded" : "Collapsed"}
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="siTracking.present"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-si-present"
                          />
                        </FormControl>
                        <FormLabel className="text-base font-medium cursor-pointer">
                          Suicidal thoughts present today
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {form.watch("siTracking.present") && (
                    <>
                      <FormField
                        control={form.control}
                        name="siTracking.intensity"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-medium">Intensity</FormLabel>
                              <Badge variant="destructive" className="min-w-12 justify-center" data-testid="text-si-intensity">
                                {(field.value as number | undefined) || 1}
                              </Badge>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[(field.value as number | undefined) || 1]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                                className="min-h-12"
                                data-testid="slider-si-intensity"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Mild</span>
                              <span>Severe</span>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="siTracking.thoughts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the thoughts or context..."
                                className="min-h-24"
                                {...field}
                                value={(field.value as string | undefined) || ""}
                                data-testid="textarea-si-thoughts"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Diary Entry</CardTitle>
                  <CardDescription>Free-form journaling</CardDescription>
                </div>
                {lastSaved && (
                  <Badge variant="outline" className="text-xs" data-testid="text-autosave-indicator">
                    Saved {format(lastSaved, "p")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="diary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="How was your day? What happened? How are you feeling?"
                        className="min-h-32"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-diary"
                      />
                    </FormControl>
                    <div className="flex justify-end">
                      <p className="text-xs text-muted-foreground" data-testid="text-character-count">
                        {field.value?.length || 0} characters
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Social Interactions</CardTitle>
                  <CardDescription>Track social contacts and their quality</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addSocialInteraction} data-testid="button-add-social">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            {socialInteractions.length > 0 && (
              <CardContent className="space-y-4">
                {socialInteractions.map((_, index) => (
                  <div key={index} className="p-4 border border-border rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Type (e.g., friend, family)"
                        className="flex-1 mr-2"
                        data-testid={`input-social-type-${index}`}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setSocialInteractions(socialInteractions.filter((_, i) => i !== index))}
                        data-testid={`button-remove-social-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Quality</label>
                        <Badge variant="secondary" className="min-w-12 justify-center">5</Badge>
                      </div>
                      <Slider min={1} max={10} step={1} defaultValue={[5]} className="min-h-12" />
                    </div>
                    <Input placeholder="Notes (optional)" data-testid={`input-social-notes-${index}`} />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activities</CardTitle>
                  <CardDescription>Log activities and enjoyment levels</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addActivity} data-testid="button-add-activity">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            {activities.length > 0 && (
              <CardContent className="space-y-4">
                {activities.map((_, index) => (
                  <div key={index} className="p-4 border border-border rounded-md space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        placeholder="Activity name"
                        className="flex-1"
                        data-testid={`input-activity-name-${index}`}
                      />
                      <Input
                        type="number"
                        placeholder="Duration (min)"
                        className="w-32"
                        data-testid={`input-activity-duration-${index}`}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setActivities(activities.filter((_, i) => i !== index))}
                        data-testid={`button-remove-activity-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Enjoyment</label>
                        <Badge variant="secondary" className="min-w-12 justify-center">5</Badge>
                      </div>
                      <Slider min={1} max={10} step={1} defaultValue={[5]} className="min-h-12" />
                    </div>
                    <Input placeholder="Notes (optional)" data-testid={`input-activity-notes-${index}`} />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Triggers</CardTitle>
                  <CardDescription>Document triggers and their severity</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addTrigger} data-testid="button-add-trigger">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            {triggers.length > 0 && (
              <CardContent className="space-y-4">
                {triggers.map((_, index) => (
                  <div key={index} className="p-4 border border-border rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Trigger name"
                        className="flex-1 mr-2"
                        data-testid={`input-trigger-name-${index}`}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setTriggers(triggers.filter((_, i) => i !== index))}
                        data-testid={`button-remove-trigger-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Severity</label>
                        <Badge variant="destructive" className="min-w-12 justify-center">5</Badge>
                      </div>
                      <Slider min={1} max={10} step={1} defaultValue={[5]} className="min-h-12" />
                    </div>
                    <Input placeholder="Notes (optional)" data-testid={`input-trigger-notes-${index}`} />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          <div className="flex justify-end gap-4 sticky bottom-4">
            <Button
              type="submit"
              size="lg"
              className="gap-2 shadow-lg"
              disabled={createEntryMutation.isPending}
              data-testid="button-save-entry"
            >
              <Save className="h-5 w-5" />
              {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
