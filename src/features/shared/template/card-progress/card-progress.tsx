"use client";

import * as React from "react";
import { CircleCheckBig, CircleDot, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

export interface CardProgressStep {
  /** Unique numeric id for the step */
  id: number;
  /** Title shown next to the step indicator */
  title: string;
  /** Optional description shown below the title */
  description?: string;
}

export interface CardProgressProps {
  /** Array of step definitions */
  steps: CardProgressStep[];
  /** The id of the currently active step */
  currentStep: number;
  /** Set of step ids that are completed */
  completedSteps: Set<number>;
  /** Icon rendered for completed steps */
  completedIcon?: React.ReactNode;
  /** Icon rendered for the current step */
  currentIcon?: React.ReactNode;
  /** Icon rendered for upcoming steps */
  upcomingIcon?: React.ReactNode;
  /** Additional className on the root Card */
  className?: string;
}

/* ─────────────────────────────────────────────── */
/*  Component                                      */
/* ─────────────────────────────────────────────── */

export function CardProgress({
  steps,
  currentStep,
  completedSteps,
  completedIcon,
  currentIcon,
  upcomingIcon,
  className,
}: CardProgressProps) {
  const progressPercent = Math.round(
    (completedSteps.size / steps.length) * 100,
  );

  return (
    <Card className={cn("p-6", className)}>
      {/* Progress bar header */}
      <div className="mb-6">
        <Progress value={progressPercent} className="h-3" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{progressPercent}% Complete</span>
          <span>
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = currentStep === step.id;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={step.id} className="relative flex items-start space-x-4">
              {/* Icon column + connector */}
              <div className="flex flex-col items-center">
                <div className="z-10 flex items-center justify-center">
                  {isCompleted
                    ? (completedIcon ?? (
                        <CircleCheckBig className="h-6 w-6 text-primary" />
                      ))
                    : isCurrent
                      ? (currentIcon ?? (
                          <CircleDot className="h-6 w-6 text-primary" />
                        ))
                      : (upcomingIcon ?? (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        ))}
                </div>

                {/* Dashed connector (except last step) */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mt-2 h-8 w-px border-l-2 border-dashed transition-colors duration-200",
                      {
                        "border-primary": isCompleted,
                        "border-primary/40": isCurrent,
                        "border-border": isUpcoming,
                      },
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="min-h-12 flex-1 pb-8 pl-2">
                <div
                  className={cn(
                    "mb-1 text-base font-semibold leading-tight transition-colors",
                    {
                      "text-primary": isCompleted || isCurrent,
                      "text-muted-foreground": isUpcoming,
                    },
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div
                    className={cn(
                      "text-sm leading-relaxed transition-colors",
                      {
                        "text-muted-foreground": isCompleted,
                        "text-foreground": isCurrent,
                        "text-muted-foreground/70": isUpcoming,
                      },
                    )}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
