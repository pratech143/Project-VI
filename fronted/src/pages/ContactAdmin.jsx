import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  MailIcon,
  SendIcon,
  InfoIcon,
  CheckCircle,
} from "lucide-react";
import { contactAdmin, resetState } from "../Redux/slice/contactAdminSlice";
import toast from "react-hot-toast";

export default function ContactAdmin() {
  const [formData, setFormData] = useState({
    email: "",
    voter_id: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector(
    (state) => state.contactAdmin
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.voter_id.trim()) {
      newErrors.voter_id = "Voter ID is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message should be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    dispatch(contactAdmin(formData))
      .unwrap()
      .then(() => {
        toast.success(
          "Your request has been sent to the admin. We’ll get back to you soon."
        );
        setSubmitted(true);
        setFormData({
          email: "",
          voter_id: "",
          message: "",
        });
        dispatch(resetState());
      })
      .catch((err) => {
        toast.error(
          err || "Failed to send your request. Please try again later."
        );
      });
  };

  const resetForm = () => {
    setSubmitted(false);
    dispatch(resetState());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12"></div>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold relative z-10">
              <div className="bg-primary text-primary-foreground p-2 rounded-full">
                <MailIcon className="h-6 w-6" />
              </div>
              <span>Contact Admin</span>
            </CardTitle>
            <p className="text-muted-foreground mt-2 relative z-10">
              Need help with your voter registration? We're here to assist you.
            </p>
          </CardHeader>

          {submitted ? (
            <CardContent className="pt-8 pb-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-700">
                  Request Submitted!
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Thank you for reaching out. Our admin team will review your
                  request and get back to you shortly.
                </p>
                <Button onClick={resetForm} variant="outline" className="mt-4">
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    Your Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 ${
                        errors.email ? "border-destructive" : ""
                      }`}
                      disabled={loading}
                    />
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p>{errors.email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="voter_id"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    Voter ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="voter_id"
                    name="voter_id"
                    placeholder="Enter your voter ID"
                    value={formData.voter_id}
                    onChange={handleChange}
                    className={errors.voter_id ? "border-destructive" : ""}
                    disabled={loading}
                  />
                  {errors.voter_id && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p>{errors.voter_id}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Describe your issue in detail"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? "border-destructive" : ""}
                    disabled={loading}
                  />
                  {errors.message && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p>{errors.message}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
                    <CheckCircle className="h-5 w-5" />
                    <p>{success}</p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 flex items-center gap-2">
                    <InfoIcon className="h-4 w-4 flex-shrink-0" />
                    Important Note
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your request will be sent to the admin team. Please provide
                    accurate information to help us resolve your issue quickly.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 border-t pt-6 pb-6 bg-muted/10">
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Sending Request...
                    </div>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  We'll respond to your inquiry as soon as possible
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
