import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trophy, BookOpen, LogOut, FileText } from "lucide-react";

interface Profile {
  name: string;
  register_number: string | null;
}

interface Submission {
  id: string;
  coding_score: number;
  coding_total: number;
  viva_score: number;
  viva_total: number;
  status: string;
  started_at: string;
  submitted_at: string | null;
  released_at: string | null;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, register_number")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: submissionsData } = await supabase
      .from("test_submissions")
      .select("*")
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false });

    if (submissionsData) {
      setSubmissions(submissionsData);
    }

    setLoading(false);
  };

  const startNewTest = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const testId = crypto.randomUUID();
    navigate(`/exam/${testId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const releasedSubmissions = submissions.filter(s => s.status === "released");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {profile?.name} {profile?.register_number && `(${profile.register_number})`}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6 bg-gradient-primary text-primary-foreground">
            <BookOpen className="w-12 h-12 mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Take a Test</h2>
            <p className="mb-4 opacity-90">
              Start a new coding and viva examination
            </p>
            <Button
              onClick={startNewTest}
              variant="outline"
              className="bg-white text-primary hover:bg-white/90"
            >
              Start New Test
            </Button>
          </Card>

          <Card className="p-6 bg-card border-border">
            <Trophy className="w-12 h-12 mb-4 text-accent" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Your Results</h2>
            <p className="text-muted-foreground mb-4">
              {releasedSubmissions.length} test{releasedSubmissions.length !== 1 ? "s" : ""} graded
            </p>
            <div className="text-4xl font-bold text-foreground">
              {releasedSubmissions.length > 0
                ? `${Math.round(
                    releasedSubmissions.reduce(
                      (sum, s) =>
                        sum +
                        ((s.coding_score + s.viva_score) /
                          (s.coding_total + s.viva_total)) *
                          100,
                      0
                    ) / releasedSubmissions.length
                  )}%`
                : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Average Score</p>
          </Card>
        </div>

        {releasedSubmissions.length > 0 && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Released Results
            </h3>
            <div className="space-y-4">
              {releasedSubmissions.map((submission) => {
                const totalScore = submission.coding_score + submission.viva_score;
                const totalPossible = submission.coding_total + submission.viva_total;
                const percentage = ((totalScore / totalPossible) * 100).toFixed(2);

                return (
                  <div
                    key={submission.id}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(submission.submitted_at!).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Released: {new Date(submission.released_at!).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {totalScore}/{totalPossible}
                        </p>
                        <p className="text-sm text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="p-3 bg-background rounded">
                        <p className="text-xs text-muted-foreground">Coding</p>
                        <p className="text-lg font-semibold text-foreground">
                          {submission.coding_score}/{submission.coding_total}
                        </p>
                      </div>
                      <div className="p-3 bg-background rounded">
                        <p className="text-xs text-muted-foreground">Viva</p>
                        <p className="text-lg font-semibold text-foreground">
                          {submission.viva_score}/{submission.viva_total}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
