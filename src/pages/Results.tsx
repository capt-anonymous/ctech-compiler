import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Code, Brain, Star, ArrowRight, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface SubmissionData {
  coding_score: number;
  coding_total: number;
  viva_score: number;
  viva_total: number;
  submitted_at: string | null;
  status: string;
  profiles: {
    name: string;
    register_number: string | null;
  };
}

const Results = () => {
  const { testId: submissionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, []);

  const loadSubmission = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("test_submissions")
      .select(`
        *,
        profiles:student_id (name, register_number)
      `)
      .eq("id", submissionId)
      .single();

    if (error) {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } else if (data) {
      // Check if student can view results
      if (data.student_id !== session.user.id && data.status !== "released") {
        toast({
          title: "Results not released",
          description: "Your results are being evaluated by your teacher.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      setSubmission(data as any);
    }

    setLoading(false);
  };

  const handleExportToExcel = () => {
    if (!submission) return;

    const totalScore = submission.coding_score + submission.viva_score;
    const totalPossible = submission.coding_total + submission.viva_total;
    const percentage = ((totalScore / totalPossible) * 100).toFixed(2);

    const exportData = [
      {
        'Submission ID': submissionId,
        'Student Name': submission.profiles.name,
        'Register Number': submission.profiles.register_number || 'N/A',
        'Coding Score': `${submission.coding_score}/${submission.coding_total}`,
        'Viva Score': `${submission.viva_score}/${submission.viva_total}`,
        'Total Score': `${totalScore}/${totalPossible}`,
        'Percentage': `${percentage}%`,
        'Status': submission.status.charAt(0).toUpperCase() + submission.status.slice(1),
        'Submitted At': submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'N/A',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

    worksheet['!cols'] = Array(9).fill({ wch: 20 });

    XLSX.writeFile(workbook, `My_Test_Results_${new Date().getTime()}.xlsx`);
  };

  if (loading || !submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading results...</div>
      </div>
    );
  }

  const totalScore = submission.coding_score + submission.viva_score;
  const totalPossible = submission.coding_total + submission.viva_total;
  const percentage = ((totalScore / totalPossible) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Test Results</h1>
          <p className="text-sm text-muted-foreground">
            {submission.profiles.name} {submission.profiles.register_number && `(${submission.profiles.register_number})`}
          </p>
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
              <span className="text-4xl font-bold text-foreground">{submission.coding_score}</span>
              <span className="text-xl text-muted-foreground">/ {submission.coding_total}</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary"
                style={{ width: `${(submission.coding_score / submission.coding_total) * 100}%` }}
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
              <span className="text-4xl font-bold text-foreground">{submission.viva_score}</span>
              <span className="text-xl text-muted-foreground">/ {submission.viva_total}</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-accent"
                style={{ width: `${(submission.viva_score / submission.viva_total) * 100}%` }}
              />
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-primary text-primary-foreground mb-8 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Score</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">{totalScore}</span>
                <span className="text-2xl opacity-75">/ {totalPossible}</span>
              </div>
              <p className="text-lg mt-2 opacity-90">
                Percentage: <strong>{percentage}%</strong>
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
              <span className="text-foreground font-medium">
                {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submission ID:</span>
              <span className="text-foreground font-medium">{submissionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-accent font-medium">
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </span>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Export to Excel
          </Button>
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
