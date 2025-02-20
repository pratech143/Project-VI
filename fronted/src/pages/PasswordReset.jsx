import { useState } from "react";
import { toast } from "react-hot-toast";
import { Mail, Key } from "lucide-react";
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { requestOTP, resetPassword } from "@/Redux/slice/resetSlice";
import { useNavigate } from "react-router-dom";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP & Reset Password
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.reset);
  const navigate=useNavigate();

  const validateEmail = () => {
    if (!email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      toast.error("Please enter a valid Gmail address.");
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    const result = await dispatch(requestOTP(email));
    if (result.meta.requestStatus === "fulfilled") {
      setStep(2); // Move to OTP verification step
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("OTP is required.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const result = await dispatch(resetPassword({ email, otp, newPassword }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Password reset successfully!");
      setStep(1); // Reset form
      setEmail("");
      setOtp("");
      setNewPassword("");
      navigate("auth/login")
      
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
      <Card className="w-full max-w-md mx-auto shadow-2xl bg-white rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-center text-indigo-700">
            {step === 1 ? "Forgot Password" : "Verify OTP"}
          </CardTitle>
          <CardDescription className="text-center text-indigo-600">
            {step === 1 ? "Enter your email to receive an OTP" : "Enter OTP and set a new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            // Step 1: Request OTP
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xl font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            // Step 2: Verify OTP & Reset Password
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xl font-medium text-gray-700">
                  Enter OTP
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xl font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
