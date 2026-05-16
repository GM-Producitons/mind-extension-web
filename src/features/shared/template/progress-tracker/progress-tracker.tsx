'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

export interface ProgressTrackerStep {
  /** Unique label for the step */
  label: string;
  /** Short description shown below the label */
  description?: string;
  /** Custom icon rendered when step is completed (defaults to Checkmark) */
  completedIcon?: React.ReactNode;
  /** Custom icon rendered when step is the current active step */
  activeIcon?: React.ReactNode;
  /** Custom icon rendered when step is pending */
  pendingIcon?: React.ReactNode;
  /** Called when the step indicator is clicked */
  onClick?: () => void;
  /** Optional substeps shown when the step is active or completed */
  substeps?: {
    label: string;
    completed?: boolean;
    icon?: React.ReactNode;
  }[];
}

export interface ProgressTrackerProps {
  /** Array of step definitions */
  steps: ProgressTrackerStep[];
  /**
   * Current step index (0-based).
   * Steps before this index are marked completed.
   * The step at this index is the active step.
   */
  currentStep?: number;
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'numbered';
  /** Orientation of the tracker */
  orientation?: 'vertical' | 'horizontal';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the progress bar header */
  showProgress?: boolean;
  /** Whether to show the step counter (e.g. "Step 1 of 3") */
  showStepCounter?: boolean;
  /** Additional className on the root element */
  className?: string;
}

/* ─────────────────────────────────────────────── */
/*  Sub-components                                 */
/* ─────────────────────────────────────────────── */

function ProgressBar({
  current,
  total,
  showCounter,
  className,
}: {
  current: number;
  total: number;
  showCounter: boolean;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{pct}% Complete</span>
        {showCounter && (
          <span>
            Step {Math.min(current + 1, total)} of {total}
          </span>
        )}
      </div>
    </div>
  );
}

/* ───── Default step icons ───── */

function DefaultCompletedIcon({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' }[size];
  const iconDims = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }[size];

  return (
    <div
      className={cn(
        dims,
        'flex items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0',
      )}
    >
      <Check className={iconDims} strokeWidth={3} />
    </div>
  );
}

function DefaultActiveIcon({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' }[size];
  const innerDims = { sm: 'h-2.5 w-2.5', md: 'h-3 w-3', lg: 'h-3.5 w-3.5' }[size];

  return (
    <div
      className={cn(
        dims,
        'flex items-center justify-center rounded-full border-2 border-primary shrink-0',
      )}
    >
      <div className={cn(innerDims, 'rounded-full bg-primary')} />
    </div>
  );
}

function DefaultPendingIcon({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' }[size];

  return (
    <div
      className={cn(
        dims,
        'flex items-center justify-center rounded-full border-2 border-muted-foreground/30 shrink-0',
      )}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
    </div>
  );
}

function NumberedIcon({
  index,
  status,
  size,
}: {
  index: number;
  status: 'completed' | 'active' | 'pending';
  size: 'sm' | 'md' | 'lg';
}) {
  const dims = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' }[size];
  const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size];

  if (status === 'completed') {
    return <DefaultCompletedIcon size={size} />;
  }

  return (
    <div
      className={cn(
        dims,
        textSize,
        'flex items-center justify-center rounded-full font-semibold shrink-0',
        status === 'active'
          ? 'border-2 border-primary text-primary'
          : 'border-2 border-muted-foreground/30 text-muted-foreground/50',
      )}
    >
      {index + 1}
    </div>
  );
}

/* ───── Connector lines ───── */

function HorizontalConnector({ status }: { status: 'completed' | 'active' | 'pending' }) {
  return (
    <div className="flex-1 flex items-center px-2">
      <div
        className={cn(
          'h-0.5 w-full rounded-full transition-colors duration-300',
          status === 'completed'
            ? 'bg-primary'
            : status === 'active'
              ? 'bg-primary/40'
              : 'bg-muted-foreground/20',
        )}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  Main component                                 */
/* ─────────────────────────────────────────────── */

export function ProgressTracker({
  steps,
  currentStep = 0,
  variant = 'default',
  orientation = 'vertical',
  size = 'md',
  showProgress = true,
  showStepCounter = true,
  className,
}: ProgressTrackerProps) {
  const completedCount = Math.min(Math.max(currentStep, 0), steps.length);

  const getStepStatus = (index: number): 'completed' | 'active' | 'pending' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const renderIcon = (step: ProgressTrackerStep, index: number) => {
    const status = getStepStatus(index);

    if (variant === 'numbered') {
      return <NumberedIcon index={index} status={status} size={size} />;
    }

    if (status === 'completed') {
      return step.completedIcon ?? <DefaultCompletedIcon size={size} />;
    }
    if (status === 'active') {
      return step.activeIcon ?? <DefaultActiveIcon size={size} />;
    }
    return step.pendingIcon ?? <DefaultPendingIcon size={size} />;
  };

  const labelSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size];
  const descSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }[size];

  /* ───── Vertical layout ───── */
  if (orientation === 'vertical') {
    return (
      <div className={cn('w-full', className)}>
        {showProgress && (
          <ProgressBar
            current={completedCount}
            total={steps.length}
            showCounter={showStepCounter}
            className="mb-6"
          />
        )}

        <div className="flex flex-col">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isLast = index === steps.length - 1;
            const showSubsteps = step.substeps && (status === 'active' || status === 'completed');

            return (
              <div key={index} className="flex gap-3">
                {/* Icon + dashed connector column */}
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    className={step.onClick ? 'cursor-pointer' : undefined}
                    onClick={step.onClick}
                    role={step.onClick ? 'button' : undefined}
                    tabIndex={step.onClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (step.onClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        step.onClick();
                      }
                    }}
                  >
                    {renderIcon(step, index)}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'mt-1 flex-1 border-l-2 border-dashed',
                        status === 'completed' ? 'border-primary/70' : 'border-border',
                      )}
                    />
                  )}
                </div>

                {/* Content column */}
                <div
                  className={cn('flex-1 pb-5', isLast && 'pb-0', step.onClick && 'cursor-pointer')}
                  onClick={step.onClick}
                  role={step.onClick ? 'button' : undefined}
                  tabIndex={step.onClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (step.onClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      step.onClick();
                    }
                  }}
                >
                  <div className="flex flex-col pt-0.5">
                    <span
                      className={cn(
                        labelSize,
                        'font-semibold leading-tight',
                        status === 'completed'
                          ? 'text-foreground'
                          : status === 'active'
                            ? 'text-foreground'
                            : 'text-muted-foreground',
                      )}
                    >
                      {step.label}
                    </span>
                    {step.description && (
                      <span
                        className={cn(
                          descSize,
                          'mt-0.5 leading-snug',
                          status === 'pending'
                            ? 'text-muted-foreground/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {step.description}
                      </span>
                    )}
                  </div>

                  {/* Substeps */}
                  {showSubsteps && (
                    <div className="mt-2 space-y-1.5">
                      {step.substeps!.map((sub, si) => (
                        <div key={si} className="flex items-center gap-2">
                          {sub.completed ? (
                            <Check className="h-3 w-3 shrink-0 text-success" strokeWidth={3} />
                          ) : (
                            <div className="h-2.5 w-2.5 shrink-0 rounded-full border border-muted-foreground/30" />
                          )}
                          <span
                            className={cn(
                              descSize,
                              sub.completed ? 'text-foreground' : 'text-muted-foreground/60',
                            )}
                          >
                            {sub.label}
                          </span>
                          {sub.icon && (
                            <span className="ml-auto text-muted-foreground">{sub.icon}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ───── Horizontal layout ───── */
  return (
    <div className={cn('w-full', className)}>
      {showProgress && (
        <ProgressBar
          current={completedCount}
          total={steps.length}
          showCounter={showStepCounter}
          className="mb-6"
        />
      )}

      <div className="flex items-start">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              <div
                className={cn(
                  'flex flex-col items-center text-center gap-1.5',
                  step.onClick && 'cursor-pointer',
                  !isLast && 'flex-1',
                )}
                onClick={step.onClick}
                role={step.onClick ? 'button' : undefined}
                tabIndex={step.onClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (step.onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    step.onClick();
                  }
                }}
              >
                {renderIcon(step, index)}
                <div className="flex flex-col">
                  <span
                    className={cn(
                      labelSize,
                      'font-semibold leading-tight',
                      status === 'completed' || status === 'active'
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        descSize,
                        'mt-0.5 leading-snug max-w-30',
                        status === 'pending' ? 'text-muted-foreground/60' : 'text-muted-foreground',
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {!isLast && <HorizontalConnector status={status} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
