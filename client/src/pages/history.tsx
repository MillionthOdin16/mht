import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Search, Filter, Calendar, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "mood-desc" | "mood-asc">("date-desc");
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const { data: entries = [], isLoading } = useQuery<DailyEntry[]>({
    queryKey: ["/api/entries"],
  });

  // Get all unique tags from entries
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((entry) => {
      entry.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by search query (diary content)
    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        entry.diary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedTags.some((tag) => entry.tags?.includes(tag))
      );
    }

    // Sort entries
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "mood-desc":
          return b.mood - a.mood;
        case "mood-asc":
          return a.mood - b.mood;
        default:
          return 0;
      }
    });

    return filtered;
  }, [entries, searchQuery, selectedTags, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleEntry = (entryId: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const getMoodTrend = (index: number) => {
    if (index >= filteredEntries.length - 1) return null;
    const current = filteredEntries[index].mood;
    const previous = filteredEntries[index + 1].mood;
    const diff = current - previous;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-chart-2" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return "text-destructive";
    if (mood <= 5) return "text-chart-4";
    if (mood <= 7) return "text-chart-1";
    return "text-chart-2";
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading entries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Entry History</h1>
        <p className="text-sm text-muted-foreground mt-1">View and search your mental health tracking timeline</p>
      </div>

      {/* Filters and Search */}
      <Card className="gradient-overlay border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>Find specific entries by content, tags, or date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diary entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                <SelectItem value="mood-desc">Mood (Highest First)</SelectItem>
                <SelectItem value="mood-asc">Mood (Lowest First)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by tags:</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEntries.length} of {entries.length} entries
        </p>
        {filteredEntries.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (expandedEntries.size === filteredEntries.length) {
                setExpandedEntries(new Set());
              } else {
                setExpandedEntries(new Set(filteredEntries.map((e) => e.id)));
              }
            }}
          >
            {expandedEntries.size === filteredEntries.length ? "Collapse All" : "Expand All"}
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No entries found</h3>
              <p className="text-sm text-muted-foreground text-center">
                {searchQuery || selectedTags.length > 0
                  ? "Try adjusting your filters or search terms"
                  : "Start tracking your mental health to see your history here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry, index) => {
            const isExpanded = expandedEntries.has(entry.id);
            return (
              <Collapsible
                key={entry.id}
                open={isExpanded}
                onOpenChange={() => toggleEntry(entry.id)}
              >
                <Card className="gradient-overlay border-border/50 hover:shadow-lg transition-shadow">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover-elevate">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}
                            </CardTitle>
                            {getMoodTrend(index)}
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Mood:</span>
                              <span className={cn("font-semibold", getMoodColor(entry.mood))}>
                                {entry.mood}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Energy:</span>
                              <span className="font-semibold">{entry.energy}/10</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Sleep:</span>
                              <span className="font-semibold">{entry.sleepHours}h</span>
                            </div>
                          </div>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      <Separator />
                      
                      {/* Detailed Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Sleep Quality</p>
                          <p className="font-medium">{entry.sleepQuality}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Medications</p>
                          <p className="font-medium">{entry.medications?.length || 0} taken</p>
                        </div>
                        {entry.siTracking?.present && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">SI Intensity</p>
                            <p className="font-medium text-destructive">
                              {entry.siTracking.intensity || "N/A"}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Medications List */}
                      {entry.medications && entry.medications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Medications Taken:</p>
                          <div className="flex flex-wrap gap-2">
                            {entry.medications.map((med) => (
                              <Badge key={med} variant="outline">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diary Entry */}
                      {entry.diary && (
                        <div>
                          <p className="text-sm font-medium mb-2">Diary Entry:</p>
                          <div className="bg-muted/50 rounded-md p-3">
                            <p className="text-sm whitespace-pre-wrap">{entry.diary}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}
