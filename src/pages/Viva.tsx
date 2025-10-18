import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Brain, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Viva = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateVivaQuestion = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-viva-question', {
        body: { topic: 'computer science' }
      });

      if (error) throw error;
      setQuestion(data.question);
      toast({
        title: "Viva Question Generated",
        description: "AI has generated your personalized question",
      });
    } catch (error) {
      console.error('Error generating viva question:', error);
      toast({
        title: "Error",
        description: "Failed to generate viva question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        title: "No Answer Provided",
        description: "Please provide an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate AI grading
    setTimeout(() => {
      navigate(`/results/${testId}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI-Powered Viva Voce</h1>
              <p className="text-sm text-muted-foreground">Oral Examination • Test ID: {testId}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 bg-card border-border mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4 shadow-glow">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Complete Your Viva Voce
            </h2>
            <p className="text-muted-foreground">
              Answer the AI-generated question about your coding solution
            </p>
          </div>

          {!question && (
            <div className="text-center">
              <Button
                onClick={generateVivaQuestion}
                disabled={isGenerating}
                className="bg-gradient-primary hover:shadow-intense"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Question...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Generate Viva Question
                  </>
                )}
              </Button>
            </div>
          )}

          {question && (
            <div className="space-y-6">
              <div className="bg-exam-panel p-6 rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                  Viva Question
                </h3>
                <p className="text-foreground leading-relaxed">{question}</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Your Answer:</label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your detailed answer here..."
                  className="min-h-[200px] bg-input border-border text-foreground resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a comprehensive answer explaining your understanding and approach.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !answer.trim()}
                className="w-full bg-gradient-accent hover:shadow-glow"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting & Grading...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Viva Answer
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>

        <div className="bg-exam-panel p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Note:</strong> Your answer will be evaluated by AI.
            Each student receives a unique question based on their coding solution.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Viva;
