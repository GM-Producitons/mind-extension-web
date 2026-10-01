"use client";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { useIsMobile } from "@/hooks/use-mobile";
import { loginUser } from "../apis/userActions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/features/user_management/store/userStore";

export default function Login() {
  const isMobile = useIsMobile();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  async function handleLogin() {
    if (!email.trim()) {
      setError("Please enter an email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    setError("");
    setLoading(true);
    const result = await loginUser(email, password);

    if (result.success && result.user) {
      setUser(result.user);
      router.refresh();
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  }

  const passwordField = (
    <PasswordField
      className={
        isMobile
          ? "w-full max-w-none [&_.text-xs]:sr-only"
          : "contents [&>div]:order-4 [&>svg]:order-1 [&_.text-xs]:sr-only"
      }
      value={password}
      onValueChange={setPassword}
      name={email.trim() || "guest"}
      size={128}
      label="Pass"
      disabled={loading}
      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
    />
  );

  return (
    <div className="flex h-full w-full items-center justify-center px-4 max-md:pb-24">
      <Card className="flex w-full max-w-sm flex-col items-center justify-center max-md:border-0 max-md:shadow-none">
        <CardTitle>Who are you?</CardTitle>
        <CardContent className="w-full">
          <div className="flex w-full flex-col items-center gap-2">
            {isMobile ? (
              <>
                <p className="w-full">Email/Name</p>
                <Input
                  className="w-full"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  autoComplete="email"
                  inputMode="email"
                />
                {passwordField}
              </>
            ) : (
              <>
                <p className="order-2 w-full">Email/Name</p>
                <Input
                  className="order-3 w-full"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  autoComplete="email"
                />
                {passwordField}
              </>
            )}
          </div>
          {error ? (
            <p className="text-destructive mt-2 text-sm">{error}</p>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button onClick={handleLogin} disabled={loading} className="flex-1">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
