"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/utils/db";
import { UserAnswer, MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  ChevronsUpDown,
  Star,
  Home,
  CheckCircle2,
  XCircle,
  MessageSquare,
  RotateCcw,
  Share2,
  Check,
} from "lucide-react";
import { chatSession } from "@/utils/GeminiAIModal";
import { v4 as uuidv4 } from "uuid";

interface FeedbackData {
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

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [retaking, setRetaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId as string))
      .orderBy(UserAnswer.id);

    setFeedbackList(result);
    setLoading(false);
  };

  // Feature 1: Retake Interview — delete all previous answers and go back to start
  const handleRetake = async () => {
    setRetaking(true);
    setErrorMessage(null);

    try {
      const interviewResult = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId as string));

      const interviewDetails = interviewResult[0];
      if (!interviewDetails) {
        throw new Error("Interview details not found.");
      }

      const inputPrompt = `Job position: ${interviewDetails.jobPosition}, Job Description: ${interviewDetails.jobDesc}, Years of Experience: ${interviewDetails.jobExperience}. Based on this information, please give me 5 interview questions with answers in JSON format. Give me the questions and answers as a JSON array with fields \"question\" and \"answer\".`;

      const result = await chatSession.sendMessage(inputPrompt);
      const mockJsonResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "")
        .trim();

      if (!mockJsonResp) {
        throw new Error("AI did not return a new question set.");
      }

      const newMockId = uuidv4();
      await db.insert(MockInterview).values({
        mockId: newMockId,
        jsonMockResp: mockJsonResp,
        jobPosition: interviewDetails.jobPosition,
        jobDesc: interviewDetails.jobDesc,
        jobExperience: interviewDetails.jobExperience,
        createdBy: interviewDetails.createdBy,
        createdAt: interviewDetails.createdAt,
      });

      router.push(`/dashboard/interview/${newMockId}/start`);
    } catch (error: any) {
      console.error("Error generating new interview attempt:", error);
      setErrorMessage(
        error?.message || "Unable to generate a new interview attempt. Please try again."
      );
      setRetaking(false);
    }
  };

  // Feature 2: Share Feedback — copy feedback URL to clipboard
  const handleShare = async () => {
    const feedbackUrl = `${window.location.origin}/dashboard/interview/${params.interviewId}/feedback`;
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers that don't support Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = feedbackUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const overallRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce(
            (sum, item) => sum + Number(item.rating),
            0
          ) / feedbackList.length
        ).toFixed(1)
      : "0";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-green-500">Congratulation!</h2>
      <h2 className="font-bold text-2xl">Here is your interview feedback</h2>
      
      {feedbackList?.length == 0 ? (
        <h2 className="text-red-500 text-lg my-3">No Interview Feedback Record Found</h2>
      ) : (
        <>
          <h2 className="text-primary text-lg my-3">
            Your overall interview rating: <strong>{overallRating}/10</strong>
          </h2>
          
          <h2 className="text-sm text-gray-500">
            Find below interview question with correct answer, Your answer and feedback for improvement
          </h2>
          
          {feedbackList.map((item, index) => (
            <Collapsible key={index} className="mt-7">
              <CollapsibleTrigger className="p-2 bg-secondary rounded-lg flex justify-between my-2 text-left gap-7 w-full">
                {item.question} <ChevronsUpDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-2">
                  <h2 className="text-red-500 p-2 border rounded-lg">
                    <strong>Rating:</strong>{item.rating}
                  </h2>
                  <h2 className="p-2 border rounded-lg bg-red-50 text-red-900 text-sm">
                    <strong>Your Answer: </strong>{item.userAns}
                  </h2>
                  <h2 className="p-2 border rounded-lg bg-green-50 text-green-900 text-sm">
                    <strong>Correct Answer: </strong>{item.correctAns}
                  </h2>
                  <h2 className="p-2 border rounded-lg bg-blue-50 text-primary text-sm">
                    <strong>Feedback: </strong>{item.feedback}
                  </h2>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </>
      )}

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex gap-4 mt-5">
        <Button onClick={() => router.push("/dashboard")}>
          Go Home
        </Button>
        <Button onClick={handleRetake} disabled={retaking || loading}>
          {retaking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating New Attempt
            </>
          ) : (
            "Retake Interview"
          )}
        </Button>
      </div>
    </div>
  );
}
