import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Code, Brain, Star, ArrowRight } from "lucide-react";

const Results = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  // Mock results data
  const results = {
    codingScore: 85,
    codingTotal: 100,
    vivaScore: 18,
    vivaTotal: 20,
    totalScore: 103,
    totalPossible: 120,
    percentage: 85.83,
    submittedAt: new Date().toLocaleString(),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Test Results</h1>
          <p className="text-sm text-muted-foreground">Test ID: {testId}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-accent mb-4 shadow-intense animate-pulse">
            <Trophy className="w-10 h-10 text-accent-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Congratulations! Test Complete
          </h2>
          <p className="text-muted-foreground">
            Your performance has been evaluated and scored
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Coding Challenge</h3>
                <p className="text-sm text-muted-foreground">Problem-solving assessment</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{results.codingScore}</span>
              <span className="text-xl text-muted-foreground">/ {results.codingTotal}</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary"
                style={{ width: `${(results.codingScore / results.codingTotal) * 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Viva Voce</h3>
                <p className="text-sm text-muted-foreground">AI-evaluated oral exam</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{results.vivaScore}</span>
              <span className="text-xl text-muted-foreground">/ {results.vivaTotal}</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-accent"
                style={{ width: `${(results.vivaScore / results.vivaTotal) * 100}%` }}
              />
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-primary text-primary-foreground mb-8 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Score</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">{results.totalScore}</span>
                <span className="text-2xl opacity-75">/ {results.totalPossible}</span>
              </div>
              <p className="text-lg mt-2 opacity-90">
                Percentage: <strong>{results.percentage.toFixed(2)}%</strong>
              </p>
            </div>
            <Star className="w-16 h-16 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 bg-card border-border mb-8">
          <h3 className="font-semibold text-foreground mb-4">Test Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted At:</span>
              <span className="text-foreground font-medium">{results.submittedAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Test ID:</span>
              <span className="text-foreground font-medium">{testId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-accent font-medium">Completed</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gradient-primary hover:shadow-glow"
            size="lg"
          >
            Return to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
