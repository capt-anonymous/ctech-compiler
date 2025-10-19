import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, Download, Eye, Save } from "lucide-react";
import * as XLSX from "xlsx";

interface Submission {
  id: string;
  student_id: string;
  coding_question_title: string;
  coding_question_description: string;
  coding_answer: string | null;
  coding_language: string | null;
  coding_score: number;
  coding_total: number;
  viva_question: string;
  viva_answer: string | null;
  viva_score: number;
  viva_total: number;
  started_at: string;
  submitted_at: string | null;
  status: string;
  teacher_comments: string | null;
  released_at: string | null;
  profiles: {
    name: string;
    register_number: string | null;
  };
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editedScores, setEditedScores] = useState({
    coding_score: 0,
    viva_score: 0,
    teacher_comments: "",
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const { data, error } = await supabase
      .from("test_submissions")
      .select(
        `
        *,
        profiles:student_id (name, register_number)
      `
      )
      .order("submitted_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading submissions",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setSubmissions(data as any);
    }

    setLoading(false);
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setEditedScores({
      coding_score: submission.coding_score,
      viva_score: submission.viva_score,
      teacher_comments: submission.teacher_comments || "",
    });
  };

  const handleSaveGrades = async () => {
    if (!selectedSubmission) return;

    const { error } = await supabase
      .from("test_submissions")
      .update({
        coding_score: editedScores.coding_score,
        viva_score: editedScores.viva_score,
        teacher_comments: editedScores.teacher_comments,
        status: "graded",
        graded_at: new Date().toISOString(),
      })
      .eq("id", selectedSubmission.id);

    if (error) {
      toast({
        title: "Error saving grades",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Grades saved",
        description: "Grades have been updated successfully",
      });
      setSelectedSubmission(null);
      loadSubmissions();
    }
  };

  const handleReleaseResults = async (submissionId: string) => {
    const { error } = await supabase
      .from("test_submissions")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (error) {
      toast({
        title: "Error releasing results",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Results released",
        description: "Student can now view their results",
      });
      loadSubmissions();
    }
  };

  const handleExportToExcel = () => {
    const exportData = submissions
      .filter((s) => s.submitted_at)
      .map((s, index) => ({
        "S.No": index + 1,
        Name: s.profiles.name,
        "Register Number": s.profiles.register_number || "N/A",
        "Started At": new Date(s.started_at).toLocaleString(),
        "Submitted At": s.submitted_at
          ? new Date(s.submitted_at).toLocaleString()
          : "Not submitted",
        "Coding Score": `${s.coding_score}/${s.coding_total}`,
        "Viva Score": `${s.viva_score}/${s.viva_total}`,
        "Total Score": `${s.coding_score + s.viva_score}/${
          s.coding_total + s.viva_total
        }`,
        Percentage: (
          ((s.coding_score + s.viva_score) / (s.coding_total + s.viva_total)) *
          100
        ).toFixed(2),
        Status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
        "Teacher Comments": s.teacher_comments || "",
      }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Results");

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 30 },
    ];

    XLSX.writeFile(
      workbook,
      `All_Test_Results_${new Date().getTime()}.xlsx`
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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
            <h1 className="text-2xl font-bold text-foreground">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and grade student submissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportToExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export All to Excel
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 mb-6 md:grid-cols-4">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground">Total Submissions</p>
            <p className="text-3xl font-bold text-foreground">
              {submissions.length}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-3xl font-bold text-foreground">
              {submissions.filter((s) => s.status === "submitted").length}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground">Graded</p>
            <p className="text-3xl font-bold text-foreground">
              {submissions.filter((s) => s.status === "graded").length}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground">Released</p>
            <p className="text-3xl font-bold text-foreground">
              {submissions.filter((s) => s.status === "released").length}
            </p>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Student Submissions
          </h2>
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No submissions yet
              </p>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 bg-muted rounded-lg border border-border"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {submission.profiles.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {submission.profiles.register_number || "No Reg. Number"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted:{" "}
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleString()
                          : "In Progress"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-foreground">
                          {submission.coding_score + submission.viva_score}/
                          {submission.coding_total + submission.viva_total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Status:{" "}
                          <span
                            className={
                              submission.status === "released"
                                ? "text-green-600"
                                : submission.status === "graded"
                                ? "text-blue-600"
                                : "text-orange-600"
                            }
                          >
                            {submission.status.charAt(0).toUpperCase() +
                              submission.status.slice(1)}
                          </span>
                        </p>
                      </div>
                      {submission.submitted_at && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View & Grade
                          </Button>
                          {submission.status === "graded" && (
                            <Button
                              size="sm"
                              onClick={() => handleReleaseResults(submission.id)}
                              className="bg-gradient-primary"
                            >
                              Release Results
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>

      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Submission - {selectedSubmission?.profiles.name}
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Coding Challenge
                </h3>
                <div className="p-4 bg-muted rounded">
                  <h4 className="font-medium mb-1">
                    {selectedSubmission.coding_question_title}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line mb-3">
                    {selectedSubmission.coding_question_description}
                  </p>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-1">
                      Student's Answer ({selectedSubmission.coding_language}):
                    </p>
                    <pre className="p-3 bg-background rounded text-xs overflow-x-auto">
                      {selectedSubmission.coding_answer || "No answer provided"}
                    </pre>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium">
                    Coding Score (out of {selectedSubmission.coding_total})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedSubmission.coding_total}
                    value={editedScores.coding_score}
                    onChange={(e) =>
                      setEditedScores({
                        ...editedScores,
                        coding_score: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Viva Voce</h3>
                <div className="p-4 bg-muted rounded">
                  <p className="font-medium mb-2">
                    Q: {selectedSubmission.viva_question}
                  </p>
                  <p className="text-sm">
                    A: {selectedSubmission.viva_answer || "No answer provided"}
                  </p>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium">
                    Viva Score (out of {selectedSubmission.viva_total})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedSubmission.viva_total}
                    value={editedScores.viva_score}
                    onChange={(e) =>
                      setEditedScores({
                        ...editedScores,
                        viva_score: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Teacher Comments</label>
                <Textarea
                  value={editedScores.teacher_comments}
                  onChange={(e) =>
                    setEditedScores({
                      ...editedScores,
                      teacher_comments: e.target.value,
                    })
                  }
                  placeholder="Add feedback for the student..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveGrades}
                  className="bg-gradient-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Grades
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
