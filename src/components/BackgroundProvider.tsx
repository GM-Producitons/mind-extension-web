"use client";
export default function BackgroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-zinc-900 relative">
      {/* Royal Purple Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
        radial-gradient(circle at 50% 50%, 
          rgba(147, 51, 234, 0.2) 0%, 
          rgba(147, 51, 234, 0.12) 25%, 
          rgba(147, 51, 234, 0.05) 35%, 
          transparent 50%
        )
      `,
          backgroundSize: "100% 100%",
        }}
      />
      {children}
    </div>
  );
}
