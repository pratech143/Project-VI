import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { KeyRound, Mail } from "lucide-react";
import { Card,CardDescription,CardTitle,CardHeader,CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-slate-blue text-white ">
      <Card className="w-full mx-11 shadow-lg border-none  bg-slate-blue text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Login to vote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xl font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-10 w-6 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 w-[70%]  min-h-16 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xl font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-10 w-6 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 w-[70%] min-h-16 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
