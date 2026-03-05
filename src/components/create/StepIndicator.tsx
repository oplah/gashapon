"use client";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex items-center justify-center font-pixel"
                style={{
                  width: 32,
                  height: 32,
                  border: "3px solid #3d1a35",
                  boxShadow: active ? "3px 3px 0 0 #3d1a35" : "2px 2px 0 0 #3d1a35",
                  background: done ? "#6fcf97" : active ? "#f0b4ca" : "#d0d4ee",
                  fontSize: "0.45rem",
                  color: "#3d1a35",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className="font-pixel"
                style={{
                  fontSize: "0.36rem",
                  letterSpacing: "0.06em",
                  color: active ? "#3d1a35" : "#3d1a3580",
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 36,
                  height: 3,
                  marginBottom: 18,
                  background: done ? "#6fcf97" : "#3d1a3540",
                  border: "none",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
