import { useState } from "react";
import { toast } from "react-hot-toast";
import { KeyRound, Mail } from "lucide-react";
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
// import { sendOtp, verifyOtp, changePassword } from "@/Redux/slice/authSlice";  // Assume you have these actions set up in your Redux slice

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);  // Step 1: Email input, Step 2: OTP input, Step 3: New password input
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", otp: "", newPassword: "", general: "" });

  const dispatch = useDispatch();

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      newErrors.email = "Please enter a valid Gmail address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!otp.trim()) {
      newErrors.otp = "OTP is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = () => {
    const newErrors = {};
    if (!newPassword.trim()) {
      newErrors.newPassword = "Password is required.";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setLoading(true);
    try {
    //   await dispatch(sendOtp({ email })).unwrap();  // Send OTP to the email
      toast.success("OTP sent to your email.");
      setStep(2);  // Move to the next step (OTP verification)
    } catch (error) {
      toast.error(error.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;
    setLoading(true);
    try {
    //   await dispatch(verifyOtp({ email, otp })).unwrap();  // Verify the OTP
      toast.success("OTP verified successfully.");
      setStep(3);  // Move to the password change step
    } catch (error) {
      toast.error(error.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validateNewPassword()) return;
    setLoading(true);
    try {
    //   await dispatch(changePassword({ email, newPassword })).unwrap();  // Change the password
      toast.success("Password changed successfully.");
      setTimeout(() => {
        window.location.href = "/login";  // Redirect to login page after successful password change
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
      <Card className="w-full max-w-md mx-auto shadow-2xl bg-white rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-center text-indigo-700">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center text-indigo-600">
            Recover your account by following the steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              {/* Email Input */}
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
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xl font-medium text-gray-700">
                  OTP
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                {errors.otp && <p className="text-red-600 text-sm">{errors.otp}</p>}
              </div>

              <Button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* New Password Input */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xl font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {errors.newPassword && <p className="text-red-600 text-sm">{errors.newPassword}</p>}
              </div>

              <Button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
