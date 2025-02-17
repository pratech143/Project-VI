import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { fetchOTP } from "@/Redux/slice/authSlice"; // Import your OTP action

const OTP = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract email from navigation state
  const email = location.state?.email;

  // Get loading state and error message from Redux
  const { isLoading, errorMessage } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log(email)
      console.log(otp)
      await dispatch(fetchOTP({ email, otp })).unwrap();
      toast.success("OTP validated successfully. Email is verified!");
      navigate("/auth/login");
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
      toast.error(err.message || "OTP verification failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800">
      <Card className="w-full max-w-md p-6 shadow-md border-none bg-slate-900">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-14 w-14 text-indigo-500" />
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
                  className="pl-10 text-white w-full border border-gray-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              } text-white font-semibold py-2 rounded-md`}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTP;
