import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShieldCheck, Key } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const OTP = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate OTP
    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }

    console.log(otp);

    if (otp === "1234") {
      setIsSuccess(true);
      setError("");
      toast.success("OTP verified successfully! Login to continue.");
      navigate("/auth/login");
    } else {
      setError("Invalid OTP. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-blue">
      <Card className="w-full max-w-md p-6 shadow-md border-none bg-slate-blue">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-14 w-14 text-indigo-600" />
          <CardTitle className="text-2xl font-semibold text-white">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter the OTP sent to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-md font-medium text-gray-400">
                Enter OTP:
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleChange}
                  maxLength="6"
                  placeholder="123456"
                  required
                  className="pl-10 text-white w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {isSuccess && (
                <p className="text-green-600 text-sm">OTP Verified Successfully!</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md"
            >
              Verify OTP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTP;
