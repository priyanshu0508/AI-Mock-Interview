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
          className="border shadow-sm rounded-lg p-3"
        >
          <h2 className="font-bold text-primary line-clamp-1">
            {interview.jobPosition}
          </h2>
          <h2 className="text-sm text-gray-600 line-clamp-1">
            {interview.jobExperience} Years of Experience
          </h2>
          <h2 className="text-xs text-gray-400">
            Created At: {interview.createdAt}
          </h2>
          <div className="flex justify-between mt-2 gap-5">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
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
              className="flex-1"
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
