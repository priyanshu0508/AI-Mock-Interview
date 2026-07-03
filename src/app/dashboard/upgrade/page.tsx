"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  return (
    <div className="space-y-8 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Upgrade Your Plan
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose the right plan to accelerate your interview preparation
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Free Plan */}
        <div className="relative flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Free Plan</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Essential features to get you started
            </p>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight">$0</span>
              <span className="ml-1 text-sm text-muted-foreground">/month</span>
            </div>
          </div>

          <ul className="mb-8 space-y-3 text-sm flex-1">
            {[
              "3 Interview Credits / Month",
              "Standard AI Question Generation",
              "Standard Feedback Reports",
              "Audio Speech-to-Text Practicing",
              "Webcam Simulated Mode",
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-md transition-all hover:shadow-lg">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold">Pro Plan</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Unleash the full power of AI-driven practice
            </p>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold tracking-tight">$9.99</span>
              <span className="ml-1 text-sm text-muted-foreground">/month</span>
            </div>
          </div>

          <ul className="mb-8 space-y-3 text-sm flex-1">
            {[
              "Unlimited Interview Practice",
              "Priority Gemini 2.0 Flash Generation",
              "Advanced Performance Reports",
              "In-depth Technical Breakdown Advice",
              "Interactive Feedback & Model Answers",
              "Priority Customer Support",
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button 
            className="w-full"
            title="Upgrade Plan is coming soon! This functionality will be implemented in the future to unlock advanced features."
            onClick={() => alert("Upgrade Plan is coming soon! This functionality will be implemented in the future to unlock advanced features.")}
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}
