"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  WebcamIcon,
  Loader2,
} from "lucide-react";
import Webcam from "react-webcam";

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

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    getInterviewDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId as string));

    setInterviewData(result[0]);
  };

  if (!interviewData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="my-10">
      <h2 className="font-bold text-2xl">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col p-5 rounded-lg border gap-5">
            <h2 className="text-lg">
              <strong>Job Role/Job Position:</strong>
              {interviewData.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description/Tech Stack:</strong>
              {interviewData.jobDesc}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience:</strong>
              {interviewData.jobExperience}
            </h2>
          </div>
          <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-500">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-500">
              Enable Video Web Cam and Microphone to Start your AI Generated Mock
              Interview, It Has 5 question which you can answer and at the last
              you will get the report on the basis of your answer. NOTE: We never
              record your video , Web cam access you can disable at any time if you
              want
            </h2>
          </div>
        </div>
        
        {/* Right Column */}
        <div>
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              style={{ height: 300, width: "100%" }}
            />
          ) : (
            <>
              <WebcamIcon className="h-72 w-full p-20 bg-secondary rounded-lg border" />
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setWebCamEnabled(true)}
              >
                Enable Web Cam and Microphone
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-end items-end mt-5">
        <Button
          onClick={() =>
            router.push(`/dashboard/interview/${params.interviewId}/start`)
          }
        >
          Start Interview
        </Button>
      </div>
    </div>
  );
}
