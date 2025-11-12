import { useState } from "react";
import { Plus, X, Pill } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Medication {
  id: string;
  name: string;
  isActive: number;
}

export function MedicationManager() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newMedName, setNewMedName] = useState("");

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/medications", { name, isActive: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      setNewMedName("");
      toast({
        title: "Medication Added",
        description: "The medication has been added to your list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/medications/${id}`, { isActive: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Medication Removed",
        description: "The medication has been removed from your list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove medication. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    if (newMedName.trim()) {
      addMutation.mutate(newMedName.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pill className="h-4 w-4" />
          Manage Medications
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Medications</DialogTitle>
          <DialogDescription>
            Add or remove medications from your tracking list. These will appear as checkboxes on the daily entry form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="med-name">Add New Medication</Label>
            <div className="flex gap-2">
              <Input
                id="med-name"
                placeholder="e.g., Sertraline 50mg"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdd();
                  }
                }}
              />
              <Button onClick={handleAdd} disabled={!newMedName.trim() || addMutation.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Medications</Label>
            {medications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No medications added yet.</p>
                <p className="text-xs mt-1">Add medications above to track them daily.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="font-medium">{med.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(med.id)}
                      disabled={deleteMutation.isPending}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
