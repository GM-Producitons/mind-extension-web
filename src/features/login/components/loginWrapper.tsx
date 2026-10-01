"use client";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { loginUser } from "../apis/userActions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/features/user_management/store/userStore";

export default function Login() {
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

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="flex w-fit flex-col items-center justify-center">
        <CardTitle>Who are you?</CardTitle>
        <CardContent>
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <p className="order-2 w-full">Email/Name</p>
            <Input
              className="order-3 w-full"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              autoComplete="email"
            />
            <PasswordField
              className="contents [&>div]:order-4 [&>svg]:order-1 [&_.text-xs]:sr-only"
              value={password}
              onValueChange={setPassword}
              name={email.trim() || "guest"}
              size={128}
              label="Pass"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
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
