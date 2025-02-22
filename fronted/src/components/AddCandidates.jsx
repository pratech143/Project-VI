import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ChevronRight, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const posts = [
  { id: 1, name: "Mayor", color: "bg-blue-500" },
  { id: 2, name: "Deputy Mayor", color: "bg-green-500" },
  { id: 3, name: "Ward Member", color: "bg-purple-500" },
  { id: 4, name: "Ward Chairperson", color: "bg-orange-500" },
];

export default function AddCandidates() {
  const [step, setStep] = useState(0);
  const [candidates, setCandidates] = useState({});
  const [form, setForm] = useState({ name: "", party: "", locationId: "", ward: "" });
  const [errors, setErrors] = useState({});


  const currentPost = posts[step];

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.party.trim()) newErrors.party = "Party is required";
    if (!form.locationId.trim()) newErrors.locationId = "Location ID is required";
    if (!form.ward.trim()) newErrors.ward = "Ward is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCandidate = () => {
    if (!validateForm()) {
      toast.error( "Please fill in all required fields");
      return;
    }

    setCandidates((prev) => ({
      ...prev,
      [currentPost.id]: [...(prev[currentPost.id] || []), { ...form }],
    }));

    setForm({ name: "", party: "", locationId: "", ward: "" });
    toast.success( "Candidate added successfully");
  };

  const nextStep = () => {
    if (!candidates[currentPost.id] || candidates[currentPost.id].length === 0) {
      toast.error( "Add at least one candidate before proceeding.");
      return;
    }

    if (step < posts.length - 1) {
      setStep(step + 1);
    } else {
      console.log("Final Candidate List:", candidates);
      toast.success( "All candidates have been registered successfully" );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {posts.map((post, index) => (
              <div key={post.id} className={`flex-1 ${index === posts.length - 1 ? "" : "border-r"} text-center`}>
                <Badge
                  variant="outline"
                  className={`${index <= step ? post.color + " text-white" : "bg-gray-200"} px-3 py-1`}
                >
                  {post.name}
                </Badge>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / posts.length) * 100}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <UserPlus className="h-6 w-6" />
                  Add Candidates for {currentPost.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {["name", "party", "locationId", "ward"].map((field) => (
                    <div key={field}>
                      <Input
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        className={errors[field] ? "border-red-500" : ""}
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button onClick={addCandidate} className="flex-1" variant="default">
                    Add Candidate
                  </Button>
                  <Button onClick={nextStep} className="flex-1" variant="outline">
                    {step < posts.length - 1 ? (
                      <>
                        Next Post <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Finish"
                    )}
                  </Button>
                </div>

                {candidates[currentPost.id]?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Added Candidates for {currentPost.name}:</h3>
                    <div className="space-y-2">
                      {candidates[currentPost.id].map((c, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium">{c.name}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{c.party}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">Ward {c.ward}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}