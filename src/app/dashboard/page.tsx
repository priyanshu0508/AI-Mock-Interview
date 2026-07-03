import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { Sparkles, Video, Mic, BarChart4 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-primary">Dashboard</h2>
        <h2 className="mt-1 text-gray-500">
          Create and Start your AI Mockup Interview
        </h2>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 my-5">
          <AddNewInterview />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Previous Mock Interview</h2>
        <InterviewList />
      </div>

      {/* How it Works Section */}
      <section id="how" className="rounded-2xl border border-border bg-card/50 p-8 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
          How it Works
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              icon: Sparkles,
              step: "1. Add Info",
              desc: "Provide your target role, description, and years of experience.",
            },
            {
              icon: Video,
              step: "2. Setup Camera",
              desc: "Enable your webcam and microphone to prepare the simulation.",
            },
            {
              icon: Mic,
              step: "3. Speak Answer",
              desc: "Record your answers for the AI questions using speech recognition.",
            },
            {
              icon: BarChart4,
              step: "4. Get Feedback",
              desc: "Compare your answer against ideal answers with detailed AI ratings.",
            },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{item.step}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
