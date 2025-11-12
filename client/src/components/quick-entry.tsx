import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuickEntry() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);

  const quickEntryMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return apiRequest("POST", "/api/entries", {
        date: today,
        mood,
        energy,
        sleepHours: 7,
        sleepQuality: 5,
        medications: [],
        siTracking: { present: false },
        diary: "Quick entry",
        tags: ["quick-entry"],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Quick Entry Saved",
        description: "Your mood and energy have been logged.",
      });
      setOpen(false);
      setMood(5);
      setEnergy(5);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save quick entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 glow-on-hover bg-gradient-to-r from-chart-4/10 to-chart-2/10 hover:from-chart-4/20 hover:to-chart-2/20"
        >
          <Zap className="h-4 w-4" />
          Quick Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Entry</DialogTitle>
          <DialogDescription>
            Log your current mood and energy level in seconds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mood</label>
              <Badge variant="secondary" className="min-w-12 justify-center">
                {mood}
              </Badge>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[mood]}
              onValueChange={(vals) => setMood(vals[0])}
              className="min-h-12"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dark/Struggling</span>
              <span>Neutral</span>
              <span>Stable/Good</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Energy</label>
              <Badge variant="secondary" className="min-w-12 justify-center">
                {energy}
              </Badge>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[energy]}
              onValueChange={(vals) => setEnergy(vals[0])}
              className="min-h-12"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={quickEntryMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => quickEntryMutation.mutate()}
            disabled={quickEntryMutation.isPending}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {quickEntryMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
