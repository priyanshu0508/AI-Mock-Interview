"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Clock,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterviewData {
  id: number;
  mockId: string;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdAt: string;
  createdBy: string;
  jsonMockResp: string;
}

export default function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState<InterviewData[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getInterviewList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getInterviewList = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(
        eq(
          MockInterview.createdBy,
          user?.primaryEmailAddress?.emailAddress || ""
        )
      )
      .orderBy(desc(MockInterview.id));

    setInterviewList(result);
  };

  // Feature 3: Delete Interview — removes all user answers + the interview record
  const handleDelete = async (mockId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card navigation
    setDeletingId(mockId);
    try {
      // First delete all associated user answers
      await db
        .delete(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, mockId));
      // Then delete the interview itself
      await db
        .delete(MockInterview)
        .where(eq(MockInterview.mockId, mockId));
      // Refresh the list
      setInterviewList((prev) =>
        prev.filter((interview) => interview.mockId !== mockId)
      );
    } catch (error) {
      console.error("Error deleting interview:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (interviewList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No previous interviews found. Create one above!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-3">
      {interviewList.map((interview) => (
        <div
          key={interview.id}
          className="relative border shadow-sm rounded-lg p-4 overflow-hidden"
        >
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 text-red-600 hover:bg-red-100"
            onClick={(e) => handleDelete(interview.mockId, e)}
            disabled={deletingId === interview.mockId}
          >
            {deletingId === interview.mockId ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>

          <div className="space-y-2 pr-10">
            <h2 className="font-bold text-primary text-lg line-clamp-1">
              {interview.jobPosition}
            </h2>
            <h2 className="text-sm text-gray-600 line-clamp-1">
              {interview.jobExperience} Years of Experience
            </h2>
            <p className="text-xs text-gray-400">
              Created At: {interview.createdAt}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              className="min-w-0"
              onClick={() =>
                router.push(
                  `/dashboard/interview/${interview.mockId}/feedback`
                )
              }
            >
              Feedback
            </Button>
            <Button
              size="sm"
              className="min-w-0"
              onClick={() =>
                router.push(`/dashboard/interview/${interview.mockId}`)
              }
            >
              Start
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
