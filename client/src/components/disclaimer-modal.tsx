import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

const DISCLAIMER_KEY = "mindtrack-disclaimer-accepted";

export function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY);
    if (!accepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl">Important Disclaimer</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 text-base leading-relaxed">
            <p className="font-semibold text-foreground">
              This tool logs data only. It is not a substitute for professional care.
            </p>
            
            <div className="space-y-3">
              <p>
                <strong>MindTrack</strong> is designed to help you track mental health metrics for personal
                awareness and to facilitate discussions with healthcare providers. This application:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Does NOT provide medical advice, diagnosis, or treatment</li>
                <li>Does NOT replace therapy or professional mental health care</li>
                <li>Is NOT monitored by healthcare professionals</li>
                <li>Should NOT be used as your only mental health resource</li>
              </ul>
              
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="font-semibold text-destructive mb-2">
                  ⚠️ In Crisis or Emergency:
                </p>
                <p className="text-sm">
                  If you are experiencing a mental health crisis or having thoughts of self-harm or suicide,
                  please contact emergency services (911) or call the National Suicide Prevention Lifeline
                  at <strong className="text-foreground">988</strong> immediately.
                </p>
              </div>
              
              <p>
                By continuing, you acknowledge that you understand this disclaimer and agree to use
                this tool as a personal tracking aid only.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAccept} className="w-full sm:w-auto">
            I Understand and Agree
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
