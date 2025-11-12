import { useState } from "react";
import { Trash2, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [showPatternAlerts, setShowPatternAlerts] = useState(() => {
    const saved = localStorage.getItem('mindtrack-show-pattern-alerts');
    return saved !== 'false';
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    const saved = localStorage.getItem('mindtrack-auto-save-enabled');
    return saved !== 'false';
  });

  const handleTogglePatternAlerts = (enabled: boolean) => {
    setShowPatternAlerts(enabled);
    localStorage.setItem('mindtrack-show-pattern-alerts', String(enabled));
    toast({
      title: "Settings Updated",
      description: `Pattern alerts ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleToggleAutoSave = (enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    localStorage.setItem('mindtrack-auto-save-enabled', String(enabled));
    toast({
      title: "Settings Updated",
      description: `Auto-save ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleClearDraft = () => {
    localStorage.removeItem('mindtrack-draft-entry');
    toast({
      title: "Draft Cleared",
      description: "Your saved draft entry has been deleted.",
    });
  };

  const handleResetDisclaimer = () => {
    localStorage.removeItem('mindtrack-disclaimer-accepted');
    toast({
      title: "Disclaimer Reset",
      description: "The disclaimer will show again on next page load.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your preferences and data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Preferences</CardTitle>
          <CardDescription>Customize your MindTrack experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pattern-alerts" className="text-base">Pattern Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications when concerning patterns are detected in your data
              </p>
            </div>
            <Switch
              id="pattern-alerts"
              checked={showPatternAlerts}
              onCheckedChange={handleTogglePatternAlerts}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save" className="text-base">Auto-Save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save draft entries to prevent data loss
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSaveEnabled}
              onCheckedChange={handleToggleAutoSave}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your stored data and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Local Storage</AlertTitle>
            <AlertDescription>
              Your data is stored locally in your browser. Clearing your browser data will also remove your entries.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleClearDraft}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Saved Draft
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleResetDisclaimer}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reset Disclaimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions - proceed with caution</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. All your entries and data will be permanently deleted.
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your mental health tracking data, including:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>All daily entries and diary notes</li>
                    <li>Analytics history</li>
                    <li>Saved drafts</li>
                    <li>All preferences and settings</li>
                  </ul>
                  <p className="mt-3 font-semibold">This action cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    localStorage.clear();
                    toast({
                      title: "All Data Deleted",
                      description: "Your data has been permanently removed.",
                      variant: "destructive",
                    });
                    window.location.reload();
                  }}
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About MindTrack</CardTitle>
          <CardDescription>Version and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build Type</span>
            <span className="font-medium">Production</span>
          </div>
          <Separator />
          <p className="text-muted-foreground text-xs">
            This tool logs data only. It is not a substitute for professional care.
            In crisis, contact emergency services (911) or the National Suicide Prevention Lifeline (988).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
