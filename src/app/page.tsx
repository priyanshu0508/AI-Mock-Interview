import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { BrainCircuit, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-slate-50">
      {/* Background Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-400/40 mix-blend-multiply blur-[120px] opacity-70"></div>
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-400/40 mix-blend-multiply blur-[120px] opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-pink-400/40 mix-blend-multiply blur-[120px] opacity-70"></div>
      </div>

      <header className="fixed top-0 w-full flex p-6 items-center justify-between z-50 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={32} height={32} />
          <span className="font-bold text-xl text-primary tracking-tight">Logoipsum</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="max-w-5xl p-10 md:p-16 rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/60 border border-white/80 text-primary font-semibold text-sm shadow-sm backdrop-blur-md hover:bg-white/80 transition-colors cursor-default">
            <Sparkles className="w-4 h-4" />
            <span>The Future of Interview Prep</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 drop-shadow-sm leading-tight">
            Your Personal <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-blue-600">
              AI Interview Coach
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Double your chances of landing that dream job offer with our intelligent, interactive AI-powered interview simulation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-10 py-7 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 transition-all duration-300 group">
                Get Started For Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
