"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Loader2 } from "lucide-react";

interface QuestionData {
  id: number;
  mockIdRef: string;
  question: string;
  correctAns: string;
  userAns: string;
  feedback: string;
  rating: string;
  userEmail: string;
  createdAt: string;
}

export default function QuestionsPage() {
  const { user } = useUser();
  const [questionList, setQuestionList] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getQuestions();
    }
  }, [user]);

  const getQuestions = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.userEmail, user?.primaryEmailAddress?.emailAddress || ""))
        .orderBy(desc(UserAnswer.id));
      
      setQuestionList(result);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl">Questions</h2>
      <p className="text-gray-500 mt-2">
        {questionList.length === 0
          ? "Previous interview questions will appear here. Start a mock interview to get questions!"
          : "Review all the questions you have answered across your mock interviews."}
      </p>

      {questionList.length > 0 && (
        <div className="mt-8 space-y-4">
          {questionList.map((item, index) => (
            <Collapsible key={index} className="border shadow-sm rounded-lg p-4 bg-card">
              <CollapsibleTrigger className="flex justify-between w-full text-left font-medium text-lg">
                <span className="pr-4">{item.question}</span>
                <ChevronsUpDown className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 flex flex-col gap-3">
                <div className="flex justify-between">
                  <h2 className="text-sm text-gray-500">
                    Interview ID: {item.mockIdRef.substring(0, 8)}...
                  </h2>
                  <h2 className="text-sm text-gray-500">
                    Date: {item.createdAt}
                  </h2>
                </div>
                <div className="p-3 border rounded-lg bg-red-50 text-red-900 text-sm">
                  <strong>Your Answer: </strong>{item.userAns}
                </div>
                <div className="p-3 border rounded-lg bg-green-50 text-green-900 text-sm">
                  <strong>Correct Answer: </strong>{item.correctAns}
                </div>
                <div className="p-3 border rounded-lg bg-blue-50 text-primary text-sm flex items-start gap-2">
                  <div>
                    <strong>AI Feedback (Rating: {item.rating}/10): </strong>
                    <br />
                    {item.feedback}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
