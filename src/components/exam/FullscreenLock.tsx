import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Maximize } from "lucide-react";

interface FullscreenLockProps {
  onForfeit: () => void;
}

const FullscreenLock = ({ onForfeit }: FullscreenLockProps) => {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setHasStarted(true);
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
      toast({
        title: "Fullscreen Required",
        description: "Please allow fullscreen mode to continue the test",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && hasStarted) {
        toast({
          title: "Fullscreen Exited",
          description: "You have exited fullscreen mode. The test will be forfeited in 5 seconds.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          if (!document.fullscreenElement) {
            onForfeit();
          }
        }, 5000);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [toast, onForfeit, hasStarted]);

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <Card className="p-8 max-w-md text-center bg-card border-border">
          <Maximize className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Enter Fullscreen Mode
          </h2>
          <p className="text-muted-foreground mb-6">
            This exam requires fullscreen mode. Exiting fullscreen will forfeit your test.
          </p>
          <Button 
            onClick={enterFullscreen}
            className="w-full bg-gradient-accent hover:shadow-glow"
            size="lg"
          >
            <Maximize className="w-4 h-4 mr-2" />
            Start Exam in Fullscreen
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};

export default FullscreenLock;
