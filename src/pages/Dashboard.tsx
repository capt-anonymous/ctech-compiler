import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, CheckCircle, XCircle } from "lucide-react";

interface Test {
  id: string;
  name: string;
  status: "ready" | "expired" | "completed";
  startTime: Date;
  endTime: Date;
  weekNumber: number;
}

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock test data
  const tests: Test[] = [
    {
      id: "1",
      name: "Introduction to Java",
      status: "ready",
      startTime: new Date(Date.now() - 1000 * 60 * 60),
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
      weekNumber: 1,
    },
    {
      id: "2",
      name: "Data Structures in Python",
      status: "expired",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      weekNumber: 2,
    },
    {
      id: "3",
      name: "Advanced C++ Concepts",
      status: "completed",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      weekNumber: 3,
    },
  ];

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Test["status"]) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-accent text-accent-foreground">Ready</Badge>;
      case "expired":
        return <Badge className="bg-warning text-warning-foreground">Time Expired</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
    }
  };

  const getStatusIcon = (status: Test["status"]) => {
    switch (status) {
      case "ready":
        return <Clock className="w-5 h-5 text-accent" />;
      case "expired":
        return <XCircle className="w-5 h-5 text-warning" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">CTECH Compiler</h1>
              <p className="text-muted-foreground mt-1">Student Dashboard</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-border"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Your Assigned Tests</h2>
          <p className="text-muted-foreground">
            Select a test to begin. Tests are only available during their allotted time window.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <Card key={test.id} className="p-6 bg-card border-border hover:border-primary transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <span className="text-sm font-medium text-muted-foreground">
                    Week {test.weekNumber}
                  </span>
                </div>
                {getStatusBadge(test.status)}
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-4">{test.name}</h3>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Start: {formatDateTime(test.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>End: {formatDateTime(test.endTime)}</span>
                </div>
              </div>

              <Button
                className={`w-full ${
                  test.status === "ready"
                    ? "bg-gradient-primary hover:shadow-glow"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                disabled={test.status !== "ready"}
                onClick={() => navigate(`/exam/${test.id}`)}
              >
                {test.status === "ready" && (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Start Test
                  </>
                )}
                {test.status === "expired" && "Time Expired"}
                {test.status === "completed" && "Completed"}
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
