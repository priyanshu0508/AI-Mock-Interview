"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Volume2,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  WebcamIcon,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import Webcam from "react-webcam";
import { chatSession } from "@/utils/GeminiAIModal";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

interface QuestionData {
  question: string;
  answer: string;
}

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

export default function StartInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState<
    QuestionData[]
  >([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webCamEnabled, setWebCamEnabled] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    getInterviewDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).SpeechRecognition ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setUserAnswer((prev) => prev + " " + transcript);
        };
        rec.onerror = () => {
          setIsRecording(false);
        };
        setRecognition(rec);
      }
    }
  }, []);

  const getInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId as string));

    const jsonMockResp = JSON.parse(result[0].jsonMockResp);
    setMockInterviewQuestions(jsonMockResp);
    setInterviewData(result[0]);
  };

  const startStopRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setUserAnswer("");
      recognition.start();
      setIsRecording(true);
    }
  };

  const textToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    }
  };

  const updateUserAnswer = useCallback(async () => {
    if (!userAnswer || userAnswer.trim().length < 5 || !interviewData) return;

    setLoading(true);
    const feedbackPrompt = `Question: ${mockInterviewQuestions[activeQuestionIndex]?.question}, User Answer: ${userAnswer}. Based on the question and user answer, please give a rating (1-10) and feedback in 3-5 lines in JSON format with "rating" and "feedback" fields.`;

    try {
      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "")
        .trim();

      const jsonFeedbackResp = JSON.parse(mockJsonResp);

      await db.insert(UserAnswer).values({
        mockIdRef: interviewData.mockId,
        question: mockInterviewQuestions[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestions[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: jsonFeedbackResp?.feedback,
        rating: String(jsonFeedbackResp?.rating),
        userEmail: user?.primaryEmailAddress?.emailAddress || "",
        createdAt: moment().format("YYYY-MM-DD"),
      });

      setUserAnswer("");
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setLoading(false);
    }
  }, [userAnswer, interviewData, mockInterviewQuestions, activeQuestionIndex, user]);

  const handleNext = async () => {
    await updateUserAnswer();
    if (activeQuestionIndex < mockInterviewQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const handleEndInterview = async () => {
    await updateUserAnswer();
    router.push(`/dashboard/interview/${params.interviewId}/feedback`);
  };

  if (!interviewData || mockInterviewQuestions.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="flex flex-col gap-5 p-5 border rounded-lg mt-5">
          <div className="flex flex-wrap gap-5">
            {mockInterviewQuestions.map((_, index) => (
              <h2
                key={index}
                onClick={() => setActiveQuestionIndex(index)}
                className={`p-2 border rounded-full text-xs md:text-sm text-center cursor-pointer px-5
                ${activeQuestionIndex === index ? "bg-primary text-white" : ""}
                `}
              >
                Question #{index + 1}
              </h2>
            ))}
          </div>
          <h2 className="text-md md:text-lg">
            {mockInterviewQuestions[activeQuestionIndex]?.question}
          </h2>
          <Volume2
            className="cursor-pointer"
            onClick={() =>
              textToSpeech(mockInterviewQuestions[activeQuestionIndex]?.question)
            }
          />

          <div className="border rounded-lg p-5 bg-blue-100 mt-20">
            <h2 className="flex gap-2 items-center text-primary">
              <Lightbulb />
              <strong>Note:</strong>
            </h2>
            <h2 className="text-sm text-primary my-2">
              Click on Record Answer when you want to answer the question. At the end of
              interview we will give you the feedback along with correct answer for each
              of question and your answer to comapre it.
            </h2>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="flex flex-col justify-center items-center bg-black rounded-lg p-5 mt-5">
            {webCamEnabled ? (
              <Webcam
                mirrored={true}
                style={{ height: 300, width: "100%" }}
                onUserMediaError={() => setWebCamEnabled(false)}
              />
            ) : (
              <WebcamIcon className="h-72 w-full object-cover text-white" />
            )}
          </div>
          <div className="flex justify-center mt-5">
            <Button
              variant="outline"
              className="my-10"
              onClick={startStopRecording}
              disabled={loading}
            >
              {isRecording ? (
                <h2 className="text-red-600 animate-pulse flex gap-2 items-center">
                  <MicOff /> Stop Recording
                </h2>
              ) : (
                <h2 className="text-primary flex gap-2 items-center">
                  <Mic /> Record Answer
                </h2>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-6 mt-5">
        {activeQuestionIndex > 0 && (
          <Button onClick={handlePrevious}>Previous Question</Button>
        )}
        {activeQuestionIndex !== mockInterviewQuestions.length - 1 && (
          <Button onClick={handleNext}>Next Question</Button>
        )}
        {activeQuestionIndex === mockInterviewQuestions.length - 1 && (
          <Button onClick={handleEndInterview}>End Interview</Button>
        )}
      </div>
    </div>
  );
}
