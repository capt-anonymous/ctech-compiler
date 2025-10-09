import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Question {
  title: string;
  description: string;
  constraints: string[];
}

interface QuestionPanelProps {
  question: Question;
}

const QuestionPanel = ({ question }: QuestionPanelProps) => {
  return (
    <Card className="bg-exam-panel border-border overflow-hidden flex flex-col">
      <div className="border-b border-border p-4 bg-card">
        <h2 className="text-xl font-bold text-foreground">{question.title}</h2>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
              Problem Description
            </h3>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {question.description}
            </p>
          </div>

          {question.constraints.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                Constraints
              </h3>
              <ul className="space-y-2">
                {question.constraints.map((constraint, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span className="text-muted-foreground">{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default QuestionPanel;
