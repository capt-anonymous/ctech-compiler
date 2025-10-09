import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FullscreenLockProps {
  onForfeit: () => void;
}

const FullscreenLock = ({ onForfeit }: FullscreenLockProps) => {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
        toast({
          title: "Fullscreen Required",
          description: "Please allow fullscreen mode to continue the test",
          variant: "destructive",
        });
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen) {
        toast({
          title: "Fullscreen Exited",
          description: "You have exited fullscreen mode. The test may be forfeited.",
          variant: "destructive",
        });
        
        // Optionally auto-forfeit after a delay
        setTimeout(() => {
          if (!document.fullscreenElement) {
            onForfeit();
          }
        }, 5000);
      }
    };

    enterFullscreen();
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [toast, onForfeit]);

  return null;
};

export default FullscreenLock;
