"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webCamEnabled, setWebCamEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const startRecognitionRef = useRef<() => void>(() => {});
  const recognitionActiveRef = useRef(false);
  const recognitionStartingRef = useRef(false);
  const pendingRecognitionRestartRef = useRef(false);
  const keepRecordingRef = useRef(false);
  const activeQuestionIndexRef = useRef(0);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const getInterviewDetails = useCallback(async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId as string));

    const jsonMockResp = JSON.parse(result[0].jsonMockResp);
    setMockInterviewQuestions(shuffleArray(jsonMockResp));
    setInterviewData(result[0]);
  }, [params.interviewId]);

  useEffect(() => {
    getInterviewDetails();
  }, [getInterviewDetails]);

  useEffect(() => {
    activeQuestionIndexRef.current = activeQuestionIndex;
  }, [activeQuestionIndex]);

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

        const safeStartRecognition = () => {
          if (!rec || recognitionActiveRef.current || recognitionStartingRef.current) {
            return;
          }
          try {
            recognitionStartingRef.current = true;
            rec.start();
          } catch (error) {
            recognitionStartingRef.current = false;
            console.error("Unable to start speech recognition:", error);
          }
        };

        const scheduleRestart = () => {
          if (!keepRecordingRef.current) {
            return;
          }
          if (pendingRecognitionRestartRef.current) {
            return;
          }
          pendingRecognitionRestartRef.current = true;
          setTimeout(() => {
            pendingRecognitionRestartRef.current = false;
            safeStartRecognition();
          }, 300);
        };

        rec.onstart = () => {
          recognitionActiveRef.current = true;
          recognitionStartingRef.current = false;
          setStatusMessage("Recording... Please speak clearly into your microphone.");
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i][0]?.transcript) {
              transcript += event.results[i][0].transcript;
            }
          }

          setUserAnswer((prev) => {
            const nextValue = `${prev} ${transcript}`.trim();
            setAnswersByQuestion((prevAnswers) => ({
              ...prevAnswers,
              [activeQuestionIndexRef.current]: nextValue,
            }));
            return nextValue;
          });
        };

        rec.onerror = (event: any) => {
          const errorName = event?.error || event?.type || "unknown";
          const errorMessage = event?.message || String(errorName);

          console.warn("Speech recognition error:", errorName, errorMessage, event);
          recognitionActiveRef.current = false;
          recognitionStartingRef.current = false;

          if (!keepRecordingRef.current) {
            setIsRecording(false);
            setStatusMessage("Recording stopped.");
            return;
          }

          if (errorName === "not-allowed" || errorName === "service-not-allowed") {
            setIsRecording(false);
            setStatusMessage(
              "Microphone access was denied. Please allow microphone use and try again."
            );
            return;
          }

          if (errorName === "aborted") {
            setIsRecording(false);
            setStatusMessage("Recording was aborted. Please try again.");
            return;
          }

          if (errorName === "audio-capture" || errorName === "no-speech") {
            setStatusMessage(
              "No speech detected. Please speak clearly and try again."
            );
            scheduleRestart();
            return;
          }

          setStatusMessage("Speech recognition stopped unexpectedly. Resuming recording...");
          scheduleRestart();
        };

        rec.onend = () => {
          recognitionActiveRef.current = false;
          recognitionStartingRef.current = false;
          if (keepRecordingRef.current) {
            scheduleRestart();
            return;
          }

          setIsRecording(false);
        };

        recognitionRef.current = rec;
        startRecognitionRef.current = safeStartRecognition;
      }
    }
  }, []);

  const stopRecognition = () => {
    if (recognitionRef.current && isRecording) {
      keepRecordingRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
      setIsRecording(false);
      setStatusMessage("Recording stopped. Your answer is ready for submission.");
    }
  };

  const handleQuestionChange = async (nextIndex: number) => {
    if (nextIndex === activeQuestionIndexRef.current) {
      return;
    }

    stopRecognition();
    await updateUserAnswer(activeQuestionIndexRef.current);
    setActiveQuestionIndex(nextIndex);
    activeQuestionIndexRef.current = nextIndex;
    setUserAnswer(answersByQuestion[nextIndex] || "");
    setStatusMessage(null);
  };

  const startStopRecording = () => {
    if (!recognitionRef.current) {
      setStatusMessage("Speech recognition is not available in this browser.");
      return;
    }

    if (isRecording) {
      stopRecognition();
      return;
    }

    keepRecordingRef.current = true;
    setUserAnswer("");
    setAnswersByQuestion((prev) => ({
      ...prev,
      [activeQuestionIndexRef.current]: "",
    }));
    setStatusMessage("Recording... Please speak clearly into your microphone.");
    startRecognitionRef.current();
    setIsRecording(true);
  };

  const textToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    }
  };

  const updateUserAnswer = useCallback(async (questionIndex = activeQuestionIndexRef.current) => {
    const currentAnswer = (answersByQuestion[questionIndex] || userAnswer || "").trim();

    if (!interviewData || !currentAnswer) {
      setStatusMessage("No answer was recorded for this question, so it was skipped.");
      return true;
    }

    if (answeredQuestions[questionIndex]) {
      return true;
    }

    setLoading(true);
    const feedbackPrompt = `Question: ${mockInterviewQuestions[questionIndex]?.question}, User Answer: ${currentAnswer}. Based on the question and user answer, please return only valid JSON with keys "rating" and "feedback". The rating should be an integer from 1 to 10, and feedback should be a concise summary in 3-5 sentences.`;

    try {
      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response
        .text()
        .replace("```json", "")
        .replace("```", "")
        .trim();

      const jsonFeedbackResp = JSON.parse(mockJsonResp);
      const rating = Number(jsonFeedbackResp?.rating);
      const feedback = String(jsonFeedbackResp?.feedback || "").trim();

      if (!feedback || Number.isNaN(rating) || rating < 1 || rating > 10) {
        setStatusMessage("AI response was invalid or incomplete. Please try recording your answer again.");
        return false;
      }

      await db.insert(UserAnswer).values({
        mockIdRef: interviewData.mockId,
        question: mockInterviewQuestions[questionIndex]?.question,
        correctAns: mockInterviewQuestions[questionIndex]?.answer,
        userAns: currentAnswer,
        feedback,
        rating: String(rating),
        userEmail: user?.primaryEmailAddress?.emailAddress || "",
        createdAt: moment().format("YYYY-MM-DD"),
      });

      setAnsweredQuestions((prev) => ({ ...prev, [questionIndex]: true }));
      setAnswersByQuestion((prev) => ({ ...prev, [questionIndex]: currentAnswer }));
      setStatusMessage("Answer recorded and validated successfully.");
      setUserAnswer("");
      return true;
    } catch (error) {
      console.error("Error saving answer:", error);
      setStatusMessage("Unable to validate your answer right now. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [answersByQuestion, answeredQuestions, interviewData, mockInterviewQuestions, user, userAnswer]);

  const handleNext = async () => {
    stopRecognition();
    await updateUserAnswer(activeQuestionIndexRef.current);
    if (activeQuestionIndex < mockInterviewQuestions.length - 1) {
      const nextIndex = activeQuestionIndex + 1;
      setActiveQuestionIndex(nextIndex);
      activeQuestionIndexRef.current = nextIndex;
      setUserAnswer(answersByQuestion[nextIndex] || "");
      setStatusMessage(null);
    }
  };

  const handlePrevious = async () => {
    if (activeQuestionIndex > 0) {
      stopRecognition();
      await updateUserAnswer(activeQuestionIndexRef.current);
      const previousIndex = activeQuestionIndex - 1;
      setActiveQuestionIndex(previousIndex);
      activeQuestionIndexRef.current = previousIndex;
      setUserAnswer(answersByQuestion[previousIndex] || "");
      setStatusMessage(null);
    }
  };

  const handleEndInterview = async () => {
    stopRecognition();
    await updateUserAnswer(activeQuestionIndexRef.current);
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
                onClick={() => void handleQuestionChange(index)}
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

          {statusMessage ? (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {statusMessage}
            </div>
          ) : null}

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
            <h3 className="font-semibold mb-2">Captured Answer</h3>
            <p>{userAnswer || "No answer recorded yet."}</p>
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
