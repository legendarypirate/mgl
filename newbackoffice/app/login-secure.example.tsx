/**
 * Secure Login Form Example
 * 
 * Production-grade login form using secure authentication service.
 * 
 * Security features:
 * - Credentials sent over HTTPS
 * - Access token stored in memory (not localStorage)
 * - Refresh token in httpOnly cookie (automatic)
 * - Automatic token refresh
 * - CSRF protection via sameSite cookies
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth/auth.service";

export default function SecureLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "info">("info");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Input validation
    if (!username || !password) {
      setMessageType("error");
      setMessage("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      // Use secure auth service
      // This handles:
      // - Sending credentials over HTTPS
      // - Storing access token in memory
      // - Setting refresh token in httpOnly cookie (automatic)
      const result = await login(username, password);

      if (result.success) {
        setMessageType("success");
        setMessage("Login successful! Redirecting...");

        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        setMessageType("error");
        setMessage(result.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessageType("error");
      setMessage(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const messageStyles = {
    success: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    error: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  }[messageType];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Secure Login</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md border ${messageStyles}`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-gray-500">
          <p className="text-xs">
            Secure authentication with JWT tokens and httpOnly cookies
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

