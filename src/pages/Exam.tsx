import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "@/components/exam/CodeEditor";
import QuestionPanel from "@/components/exam/QuestionPanel";
import ExamTimer from "@/components/exam/ExamTimer";
import FullscreenLock from "@/components/exam/FullscreenLock";
import { AlertTriangle, Play, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Exam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  const [question, setQuestion] = useState<{
    title: string;
    description: string;
    constraints: string[];
  } | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

  const languageTemplates = {
    java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}`,
    python: `def twoSum(nums, target):
    # Write your code here
    pass`,
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`,
    c: `#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    
}`,
    shell: `#!/bin/bash
# Write your shell script here
`,
  };

  // Fetch AI-generated question on component mount
  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoadingQuestion(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-coding-question', {
          body: { difficulty: 'medium', topic: 'algorithms' }
        });

        if (error) throw error;
        setQuestion(data);
      } catch (error) {
        console.error('Error fetching question:', error);
        toast({
          title: "Error",
          description: "Failed to generate coding question. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingQuestion(false);
      }
    };

    fetchQuestion();
  }, [toast]);

  useEffect(() => {
    if (selectedLanguage && languageTemplates[selectedLanguage as keyof typeof languageTemplates]) {
      setCode(languageTemplates[selectedLanguage as keyof typeof languageTemplates]);
    }
  }, [selectedLanguage]);

  const handleRunCode = async () => {
    setIsRunning(true);
    // Simulate API call to compiler
    setTimeout(() => {
      setOutput("Test Case 1: Passed\nTest Case 2: Passed\nTest Case 3: Failed\n\nExpected: [0, 1]\nGot: [1, 0]");
      setIsRunning(false);
      toast({
        title: "Code Executed",
        description: "Check the output panel for results",
      });
    }, 2000);
  };

  const handleSubmitCode = () => {
    if (!code.trim()) {
      toast({
        title: "Cannot Submit",
        description: "Please write some code before submitting",
        variant: "destructive",
      });
      return;
    }
    navigate(`/viva/${testId}`);
  };

  const handleForfeit = () => {
    if (confirm("Are you sure you want to forfeit this test? This action cannot be undone.")) {
      toast({
        title: "Test Forfeited",
        description: "Returning to dashboard...",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  return (
    <>
      <FullscreenLock onForfeit={handleForfeit} />
      <div className="min-h-screen bg-background">
        <Alert className="rounded-none bg-destructive text-destructive-foreground border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            WARNING: Exiting Full-Screen Mode or navigating away will forfeit the test.
          </AlertDescription>
        </Alert>

        <header className="border-b border-border bg-exam-panel p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">CTECH Compiler</h1>
              <div className="h-6 w-px bg-border" />
              <span className="text-sm text-muted-foreground">Test ID: {testId}</span>
            </div>
            <div className="flex items-center gap-4">
              <ExamTimer timeRemaining={timeRemaining} setTimeRemaining={setTimeRemaining} />
              <Button variant="destructive" size="sm" onClick={handleForfeit}>
                Forfeit Test
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-4">
          <div className="mb-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-64 bg-card border-border">
                <SelectValue placeholder="Select Compiler/Language" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="shell">Shell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingQuestion ? (
            <div className="flex items-center justify-center h-[calc(100vh-250px)]">
              <Card className="p-8 bg-card border-border text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Generating your coding challenge...
                </h2>
                <p className="text-muted-foreground">
                  Please wait while AI creates a unique problem for you
                </p>
              </Card>
            </div>
          ) : selectedLanguage && question ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
              <QuestionPanel question={question} />
              <div className="flex flex-col gap-4">
                <Card className="flex-1 bg-exam-editor border-border overflow-hidden">
                  <CodeEditor
                    language={selectedLanguage}
                    value={code}
                    onChange={setCode}
                  />
                </Card>
                <Card className="h-48 bg-exam-panel border-border p-4 overflow-auto">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Output:</h3>
                  <pre className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
                    {output || "Run your code to see output here..."}
                  </pre>
                </Card>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning || !code.trim()}
                    className="flex-1 bg-secondary hover:bg-secondary/90"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                  <Button
                    onClick={handleSubmitCode}
                    disabled={!code.trim()}
                    className="flex-1 bg-gradient-accent hover:shadow-glow"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit & Continue to Viva
                  </Button>
                </div>
              </div>
            </div>
          ) : !isLoadingQuestion && !selectedLanguage && (
            <div className="flex items-center justify-center h-[calc(100vh-250px)]">
              <Card className="p-8 bg-card border-border text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Select a Compiler to Begin
                </h2>
                <p className="text-muted-foreground">
                  Choose your preferred programming language from the dropdown above to start coding.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Exam;
