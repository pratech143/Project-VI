import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CloudCog,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fetchLocations } from "@/Redux/slice/electionSlice";
import candidatesSlice from "@/Redux/slice/addCandidateSlice";
import { useDispatch, } from "react-redux";
import { addCandidates, resetState } from "@/Redux/slice/addCandidateSlice";

const posts = [
  { id: 1, name: "Mayor", color: "bg-blue-500" },
  { id: 2, name: "Deputy Mayor", color: "bg-green-500" },
  { id: 3, name:  "Ward Chairperson", color: "bg-purple-500" },
  { id: 4, name: "Ward Member" , color: "bg-orange-500" },
];

export default function AddCandidates() {
  const [step, setStep] = useState(0);
  const [candidates, setCandidates] = useState({});
  const [form, setForm] = useState({
    name: "",
    party: "",
    locationId: "",
    ward: "",
    location_type:""
  });
  const [errors, setErrors] = useState({});
  const [districtData, setDistrictData] = useState({});
  const [locations, setLocations] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedWards, setSelectedWards] = useState("");
  const dispatch = useDispatch();

  const currentPost = posts[step];

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const data = await dispatch(fetchLocations()).unwrap();
        setDistrictData(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchLocationData();
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.party.trim()) newErrors.party = "Party is required";
    if (!form.locationId.trim())
      newErrors.locationId = "District name is required";
    if (!form.locationId.trim())
      newErrors.locationId = "Location name is required";
    if (!form.ward.trim()) newErrors.ward = "Ward is required";
    if (step >= 2 && !form.ward.trim()) newErrors.ward = "Ward is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCandidate = () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCandidates((prev) => ({
      ...prev,
      [currentPost.id]: [...(prev[currentPost.id] || []), { ...form }],
    }));

    setForm({ name: "", party: "", locationId: "", ward: "" });
    toast.success("Candidate added successfully");
  };

  const nextStep = () => {
    if (!candidates[currentPost.id] || candidates[currentPost.id].length === 0) {
      toast.error("Add at least one candidate before proceeding.");
      return;
    }
  
    if (step < posts.length - 1) {
      setStep(step + 1);
    } else {
      console.log("Final Candidate List:", candidates);
      submitCandidates(); 
    }
  };
  
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setLocations(districtData[district] || []);
    setSelectedLocation("");
    setWards([]);
    setSelectedWards("");
    setForm((prev) => ({ ...prev, locationId: district }));
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setSelectedWards("");
    const locationDetails = locations.find(
      (loc) => loc.location_name === location
    );
    setForm((prev) => ({
      ...prev,
      locationId: location,
      location_type: locationDetails?.location_type || "",
    }));
    setWards(
      Array.from({ length: locationDetails?.wards || 0 }, (_, i) => i + 1)
    );
    setForm((prev) => ({ ...prev, ward: "" }));
  };

  const handleWardChange = (ward) => {
    setSelectedWards(ward);
    setForm((prev) => ({ ...prev, ward }));
  };

  const submitCandidates = async () => {
    // Structure the data in the format expected by addCandidate.php
    const formattedData = Object.keys(candidates).reduce((acc, postId) => {
      acc[postId] = candidates[postId].map(candidate => ({
        name: candidate.name,
        party: candidate.party,
        locationId: candidate.locationId,
        location_type: candidate.location_type,
        ward: candidate.ward
      }));
      return acc;
    }, {});
  
    try {
    
      const response = await dispatch(addCandidates(formattedData)).unwrap();
      console.log("Response from PHP:", response);
  
      if (response.success) {
        toast.success(response.message);
        dispatch(resetState());
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error adding candidate: ", error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className={`flex-1 ${
                  index === posts.length - 1 ? "" : "border-r"
                } text-center`}
              >
                <Badge
                  variant="outline"
                  className={`${
                    index <= step ? post.color + " text-white" : "bg-gray-200"
                  } px-3 py-1`}
                >
                  {post.name}
                </Badge>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / posts.length) * 100}%` }}
            />
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
                  {["name", "party"].map((field) => (
                    <div key={field}>
                      <Input
                        type="text"
                        placeholder={
                          field.charAt(0).toUpperCase() + field.slice(1)
                        }
                        value={form[field]}
                        onChange={(e) =>
                          setForm({ ...form, [field]: e.target.value })
                        }
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

                  {/* District Select */}
                  <div>
                    <select
                      value={form.locationId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className={`w-full p-2 border ${
                        errors.locationId ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select District</option>
                      {Object.keys(districtData).map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    {errors.locationId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.locationId}
                      </p>
                    )}
                  </div>

                  {/* Location Select */}
                  <div>
                    <select
                      value={form.locationId}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className={`w-full p-2 border ${
                        errors.locationId ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option
                          key={location.location_name}
                          value={location.location_name}
                        >
                          {location.location_name}
                        </option>
                      ))}
                    </select>
                    {errors.locationId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.locationId}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    Location Type
                    <Input
                      id="location_type"
                      value={form.location_type} // Change from watch("location_type") to form.location_type
                      readOnly
                      className="bg-gray-50 h-11"
                    />
                  </div>

                  {/* Ward Select */}
                  <div>
                    <select
                      value={form.ward}
                      onChange={(e) => handleWardChange(e.target.value)}
                      className={`w-full p-2 border ${
                        errors.ward ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Ward</option>
                      {wards.map((ward) => (
                        <option key={ward} value={ward}>
                          {ward}
                        </option>
                      ))}
                    </select>
                    {errors.ward && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.ward}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={addCandidate}
                    className="flex-1"
                    variant="default"
                  >
                    Add Candidate
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1"
                    variant="outline"
                  >
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
                    <h3 className="font-semibold mb-3">
                      Added Candidates for {currentPost.name}:
                    </h3>
                    <div className="space-y-2">
                      {candidates[currentPost.id].map((c, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium">{c.name}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{c.party}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{c.ward}</span>
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
