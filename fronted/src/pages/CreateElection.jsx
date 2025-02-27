import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format, addDays, differenceInDays } from "date-fns";
import baseApi from "../api/baseApi";
import {
  Plus,
  AlertCircle,
  Lock,
  CalendarDays,
  FileText,
  MapPin,
  Building2,
  Building,
  Users,
  ChevronRight,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { createElection, fetchLocations } from "../Redux/slice/electionSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Elections } from "./Elections";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

export function CreateElection() {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.election);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [electionData, setElectionData] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");

  const [districtData, setDistrictData] = useState({});
  const [locations, setLocations] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedWards, setSelectedWards] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      location_name: "",
      location_type: "",
      district_name: "",
      ward: "",
      start_date: "",
      end_date: "",
      status: "",
    },
    mode: "onSubmit",
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

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

  useEffect(() => {
    setValue("status", getStatus());
  }, [watch("start_date"), watch("end_date")]);

  const getStatus = () => {
    const startDate = watch("start_date");
    const endDate = watch("end_date");

    if (!startDate || !endDate) return "Upcoming";

    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Upcoming";

    if (currentDate < start) {
      return "Upcoming";
    } else if (currentDate >= start && currentDate <= end) {
      return "Ongoing";
    } else {
      return "Completed";
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const startDate = watch("start_date");
  const minEndDate = startDate || today;
  const maxEndDate = startDate ? addDays(new Date(startDate), 2).toISOString().split("T")[0] : today;

  const validateEndDate = (value) => {
    const start = new Date(watch("start_date"));
    const end = new Date(value);
    if (!startDate) return true; // Skip if start_date isn't set yet
    if (end < start) return "End date must be on or after start date";
    const diffDays = differenceInDays(end, start);
    if (diffDays > 2) return "Election duration cannot exceed 2 days";
    return true;
  };

  const handleCreateElection = async (data) => {
    setElectionData(data);
    setStep(2);
  };

  const handleConfirmCreate = async () => {
    try {
      const response = await baseApi.get("config/get_user_session.php", {
        withCredentials: true,
      });

      if (!response.data.success || response.data.role !== "admin") {
        toast.error("You must be an admin to create an election!");
        return;
      }

      const electionResponse = await dispatch(
        createElection(electionData)
      ).unwrap();
      setOpen(false);
      setStep(1);
      form.reset();
      toast.success("Election created successfully!");
    } catch (error) {
      const errorMsg = error || "Failed to create election";
      toast.error(errorMsg);
    }
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setLocations(districtData[district] || []);
    setSelectedLocation("");
    setWards([]);
    setSelectedWards("");
    setValue("district_name", district);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setSelectedWards("");
    const locationDetails = locations.find(
      (loc) => loc.location_name === location
    );
    setValue("location_name", location);
    setValue("location_type", locationDetails?.location_type || "");
    setWards(
      Array.from({ length: locationDetails?.wards || 0 }, (_, i) => i + 1)
    );
    setValue("ward", "");
  };

  const handleWardChange = (ward) => {
    setSelectedWards(ward);
    setValue("ward", ward);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                  Election Management
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                  Create and manage election events for your district
                </p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all duration-300 transform hover:scale-105 
                             text-base px-6 py-5 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create New Election
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] p-8">
                  <form onSubmit={handleSubmit(handleCreateElection)}>
                    <DialogHeader className="mb-6">
                      <DialogTitle className="flex items-center text-2xl font-bold text-gray-900">
                        <FileText className="h-6 w-6 mr-3 text-indigo-600" />
                        Create New Election
                      </DialogTitle>
                      <DialogDescription className="text-base mt-2">
                        Fill in the details below to create a new election
                        event. All fields are required.
                      </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                      {step === 1 ? (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="grid gap-8 py-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="district_name"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Building className="h-4 w-4 text-gray-500" />
                                District
                              </Label>
                              <Select
                                id="district_name"
                                value={selectedDistrict}
                                onValueChange={handleDistrictChange}
                                {...form.register("district_name", {
                                  required: "District is required",
                                })}
                              >
                                <SelectTrigger className="w-full h-11">
                                  <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(districtData).map((district) => (
                                    <SelectItem key={district} value={district}>
                                      {district}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.district_name && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.district_name.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="location_name"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4 text-gray-500" />
                                Location
                              </Label>
                              <Select
                                id="location_name"
                                value={selectedLocation}
                                onValueChange={handleLocationChange}
                                {...form.register("location_name", {
                                  required: "Location is required",
                                })}
                              >
                                <SelectTrigger className="w-full h-11">
                                  <SelectValue placeholder="Select Location" />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map((loc) => (
                                    <SelectItem
                                      key={loc.location_name}
                                      value={loc.location_name}
                                    >
                                      {loc.location_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.location_name && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.location_name.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="location_type"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Building2 className="h-4 w-4 text-gray-500" />
                                Location Type
                              </Label>
                              <Input
                                id="location_type"
                                value={watch("location_type")}
                                readOnly
                                className="bg-gray-50 h-11"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="ward"
                                className="text-sm font-medium flex items-center gap-2"
                              >
                                <Users className="h-4 w-4 text-gray-500" />
                                Ward Number
                              </Label>
                              <Select
                                id="ward"
                                value={selectedWards}
                                onValueChange={handleWardChange}
                                {...form.register("ward", {
                                  required: "Ward number is required",
                                })}
                              >
                                <SelectTrigger className="w-full h-11">
                                  <SelectValue placeholder="Select Ward" />
                                </SelectTrigger>
                                <SelectContent>
                                  {wards.map((ward) => (
                                    <SelectItem
                                      key={ward}
                                      value={ward.toString()}
                                    >
                                      {ward}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.ward && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.ward.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="name"
                              className="text-sm font-medium flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4 text-gray-500" />
                              Election Name
                            </Label>
                            <Input
                              id="name"
                              {...form.register("name", {
                                required: "Election name is required",
                              })}
                              placeholder="Enter election name"
                              className="w-full h-11"
                            />
                            {errors.name && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.name.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="description"
                              className="text-sm font-medium"
                            >
                              Description
                            </Label>
                            <Input
                              id="description"
                              {...form.register("description", {
                                required: "Description is required",
                              })}
                              placeholder="Enter election description"
                              className="w-full h-11"
                            />
                            {errors.description && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.description.message}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-gray-500" />
                                Start Date
                              </Label>
                              <div className="relative">
                                <Input
                                  id="start_date"
                                  type="date"
                                  {...form.register("start_date", {
                                    required: "Start date is required",
                                  })}
                                  min={today}
                                  className="pl-4 h-11"
                                  onChange={(e) => {
                                    setValue("start_date", e.target.value);
                                    trigger("end_date"); // Re-validate end_date when start_date changes
                                  }}
                                />
                              </div>
                              {errors.start_date && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.start_date.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-gray-500" />
                                End Date
                              </Label>
                              <div className="relative">
                                <Input
                                  id="end_date"
                                  type="date"
                                  {...form.register("end_date", {
                                    required: "End date is required",
                                    validate: validateEndDate,
                                  })}
                                  min={minEndDate}
                                  max={maxEndDate}
                                  className="pl-4 h-11"
                                />
                              </div>
                              {errors.end_date && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.end_date.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="status"
                              className="text-sm font-medium"
                            >
                              Election Status
                            </Label>
                            <Input
                              id="status"
                              readOnly
                              value={watch("status")}
                              className="bg-gray-50 h-11"
                            />
                          </div>

                          <DialogFooter>
                            <Button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-base px-6 py-5"
                              disabled={!isValid || isLoading}
                            >
                              Review Details
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </DialogFooter>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-amber-700 mb-2">
                              <AlertCircle className="h-5 w-5" />
                              <h3 className="font-semibold">
                                Please Review Election Details
                              </h3>
                            </div>
                            <p className="text-amber-600 text-sm">
                              Carefully review all details before confirming the
                              election creation.
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <span className="font-semibold text-gray-700">
                                  Name:
                                </span>
                                <p className="text-gray-600 mt-1">
                                  {electionData.name}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">
                                  Location:
                                </span>
                                <p className="text-gray-600 mt-1">
                                  {electionData.location_name}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">
                                  District:
                                </span>
                                <p className="text-gray-600 mt-1">
                                  {electionData.district_name}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">
                                  Ward:
                                </span>
                                <p className="text-gray-600 mt-1">
                                  {electionData.ward}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                Description:
                              </span>
                              <p className="text-gray-600 mt-1">
                                {electionData.description}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                Duration:
                              </span>
                              <p className="text-gray-600 mt-1">
                                {format(
                                  new Date(electionData.start_date),
                                  "PP"
                                )}{" "}
                                to{" "}
                                {format(new Date(electionData.end_date), "PP")}
                              </p>
                            </div>
                          </div>

                          

                          <DialogFooter className="flex justify-between !mt-8">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setStep(1)}
                              className="mr-2"
                            >
                              Back to Edit
                            </Button>
                            <Button
                              type="button"
                              onClick={handleConfirmCreate}
                              disabled={isLoading }
                              className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300"
                            >
                              {isLoading ? "Creating..." : "Confirm & Create"}
                            </Button>
                          </DialogFooter>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <div className="rounded-xl">
            <Elections />
          </div>
        </div>
      </div>
    </div>
  );
}
