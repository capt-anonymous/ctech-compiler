import { useEffect } from "react";
import { Clock } from "lucide-react";

interface ExamTimerProps {
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
}

const ExamTimer = ({ timeRemaining, setTimeRemaining }: ExamTimerProps) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, setTimeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeRemaining < 5 * 60) return "text-exam-danger";
    if (timeRemaining < 15 * 60) return "text-exam-warning";
    return "text-accent";
  };

  const getTimerBg = () => {
    if (timeRemaining < 5 * 60) return "bg-destructive/20";
    if (timeRemaining < 15 * 60) return "bg-warning/20";
    return "bg-accent/20";
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getTimerBg()}`}>
      <Clock className={`w-5 h-5 ${getTimerColor()}`} />
      <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default ExamTimer;
