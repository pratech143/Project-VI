import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fetchLocations } from "@/Redux/slice/electionSlice";
import { addCandidates, resetState } from "@/Redux/slice/addCandidateSlice";
import { useDispatch } from "react-redux";

const posts = [
  { id: 1, name: "Mayor", color: "bg-blue-500", defaultWard: "0" },
  { id: 2, name: "Deputy Mayor", color: "bg-green-500", defaultWard: "0" },
  { id: 3, name: "Ward Chairperson", color: "bg-purple-500" },
  { id: 4, name: "Ward Member", color: "bg-orange-500" },
];

export default function AddCandidates() {
  const [step, setStep] = useState(-1); // Start at -1 for location selection
  const [candidates, setCandidates] = useState({});
  const [locationInfo, setLocationInfo] = useState({
    district: "",
    location: "",
    locationType: "",
    ward: "",
  });
  const [form, setForm] = useState({
    name: "",
    party: "",
  });
  const [errors, setErrors] = useState({});
  const [districtData, setDistrictData] = useState({});
  const [locations, setLocations] = useState([]);
  const [wards, setWards] = useState([]);
  const dispatch = useDispatch();

  const currentPost = posts[step] || null;

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

  const validateLocationInfo = () => {
    const newErrors = {};
    if (!locationInfo.district) newErrors.district = "District is required";
    if (!locationInfo.location) newErrors.location = "Location is required";
    if (!locationInfo.ward) newErrors.ward = "Ward is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCandidateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.party.trim()) newErrors.party = "Party is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDistrictChange = (district) => {
    setLocations(districtData[district] || []);
    setLocationInfo({
      ...locationInfo,
      district,
      location: "",
      locationType: "",
      ward: "",
    });
  };

  const handleLocationChange = (location) => {
    const locationDetails = locations.find(
      (loc) => loc.location_name === location
    );
    setWards(
      Array.from({ length: locationDetails?.wards || 0 }, (_, i) => i + 1)
    );
    setLocationInfo({
      ...locationInfo,
      location,
      locationType: locationDetails?.location_type || "",
      ward: "",
    });
  };

  const handleLocationSubmit = () => {
    if (!validateLocationInfo()) {
      toast.error("Please fill in all location details");
      return;
    }
    setStep(0);
  };

  const addCandidate = () => {
    if (!validateCandidateForm()) {
      toast.error("Please fill in all candidate details");
      return;
    }

    const ward = posts[step].defaultWard || locationInfo.ward;

    setCandidates((prev) => ({
      ...prev,
      [currentPost.id]: [
        ...(prev[currentPost.id] || []),
        {
          ...form,
          locationId: locationInfo.location,
          location_type: locationInfo.locationType,
          ward,
        },
      ],
    }));

    setForm({ name: "", party: "" });
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
      submitCandidates();
    }
  };

  const submitCandidates = async () => {
    const formattedData = Object.keys(candidates).reduce((acc, postId) => {
      acc[postId] = candidates[postId].map((candidate) => ({
        name: candidate.name,
        party: candidate.party,
        locationId: candidate.locationId,
        location_type: candidate.location_type,
        ward: candidate.ward,
      }));
      return acc;
    }, {});

    try {
      const response = await dispatch(addCandidates(formattedData)).unwrap();
      if (response.success) {
        toast.success(response.message);
        dispatch(resetState());
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error adding candidates: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {step >= 0 && (
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
        )}

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
                  {step === -1 ? (
                    <>
                      <MapPin className="h-6 w-6" />
                      Select Location
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-6 w-6" />
                      Add Candidates for {currentPost.name}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === -1 ? (
                  <div className="space-y-4">
                    <div>
                      <select
                        value={locationInfo.district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select District</option>
                        {Object.keys(districtData).map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.district}
                        </p>
                      )}
                    </div>

                    <div>
                      <select
                        value={locationInfo.location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        className="w-full p-2 border rounded"
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
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        value={locationInfo.locationType}
                        readOnly
                        placeholder="Location Type"
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <select
                        value={locationInfo.ward}
                        onChange={(e) =>
                          setLocationInfo({
                            ...locationInfo,
                            ward: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Ward</option>
                        {wards.map((ward) => (
                          <option key={ward} value={ward}>
                            {ward}
                          </option>
                        ))}
                      </select>
                      {errors.ward && (
                        <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                      )}
                    </div>

                    <Button
                      onClick={handleLocationSubmit}
                      className="w-full mt-4"
                    >
                      Continue to Add Candidates
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-medium text-indigo-900">
                        Selected Location
                      </h3>
                      <div className="mt-2 text-sm text-indigo-700">
                        <p>District: {locationInfo.district}</p>
                        <p>Location: {locationInfo.location}</p>
                        <p>Ward: {locationInfo.ward}</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <Input
                        placeholder="Candidate Name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                      )}

                      <Input
                        placeholder="Party Name"
                        value={form.party}
                        onChange={(e) =>
                          setForm({ ...form, party: e.target.value })
                        }
                      />
                      {errors.party && (
                        <p className="text-red-500 text-sm">{errors.party}</p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={addCandidate} className="flex-1">
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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