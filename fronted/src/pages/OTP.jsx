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
import { fetchLoginOTP, fetchOTP } from "@/Redux/slice/authSlice";
import baseApi from "@/api/baseApi"; // assuming your axios instance is imported here

const OTP = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const type = location.state?.type || "register";

  const { isLoading, errorMessage } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const fetchSession = async () => {
    try {
      const response = await baseApi.get("/config/get_user_session.php");
      console.log(response);
      if (response.data.voter_id) {
        localStorage.setItem("voterId", response.data.voter_id);
      }

      if (response.data.role) {
        localStorage.setItem("role", response.data.role);
      }

      if (response.data.email) {
        localStorage.setItem("email", response.data.email);
      }

      // Assuming you might also want to set the session for voted state or other details
      if (response.data.voted) {
        localStorage.setItem("voted", response.data.voted);
      }

      // Optionally, set other data in localStorage if needed
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };
  console.log(type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (type === "login") {
        await dispatch(fetchLoginOTP({ email, otp })).unwrap();
        toast.success("Login OTP verified successfully!");
        await fetchSession();
        localStorage.setItem("email", email);

        navigate("/");
      } else {
        await dispatch(fetchOTP({ email, otp })).unwrap();
        toast.success("Registration OTP verified! Email is now verified.");

        // Fetch the session data and store it in localStorage
        await fetchSession();

        navigate("/auth/login"); // Redirect to the login page
      }
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
            {type === "login" ? "Verify Your Login" : "Verify Your Email"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {type === "login"
              ? "Enter the OTP sent to your email for login verification."
              : "Enter the OTP sent to your email for registration verification."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-md font-medium text-gray-400"
              >
                Enter OTP:
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleChange}
                  maxLength="8"
                  placeholder="123456"
                  required
                  className="pl-10 text-white w-full border border-gray-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
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