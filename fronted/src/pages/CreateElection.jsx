import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Plus, AlertCircle, Lock, CalendarDays, FileText, MapPin } from "lucide-react";
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
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { fetchLogin } from "@/Redux/slice/authSlice";

export function CreateElection() {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.election);

  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [electionData, setElectionData] = useState(null);

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
    mode: "onSubmit", // Trigger validation when submitting
  });

  const { watch, setValue, handleSubmit, formState: { errors } } = form;

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

  const handleCreateElection = async (data) => {
    setElectionData(data);
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      const email = localStorage.getItem("email");
      if (email && adminPassword) {
        await dispatch(fetchLogin({ email, password: adminPassword })).unwrap();
      }

      await dispatch(createElection(electionData)).unwrap();
      setOpen(false);
      setShowConfirmation(false);
      setAdminPassword("");
      form.reset();
      toast.success("Election created successfully!");
    } catch (error) {
      toast.error(`Failed to create election: ${errorMessage || error.message || "Invalid password"}`);
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
    const locationDetails = locations.find((loc) => loc.location_name === location);
    setValue("location_name", location);
    setValue("location_type", locationDetails?.location_type || "");
    setWards(Array.from({ length: locationDetails?.wards || 0 }, (_, i) => i + 1));
    setValue("ward", "");
  };

  const handleWardChange = (ward) => {
    setSelectedWards(ward);
    setValue("ward", ward);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Election Management</h1>
                <p className="text-gray-500 mt-1">Create and manage election events</p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all duration-200 transform hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Election
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <form onSubmit={handleSubmit(handleCreateElection)}>
                    <DialogHeader>
                      <DialogTitle className="flex items-center text-xl">
                        <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                        Create New Election
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the details below to create a new election event.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="district_name" className="text-sm font-medium">
                            District
                          </Label>
                          <Select
                            id="district_name"
                            value={selectedDistrict}
                            onValueChange={handleDistrictChange}
                            {...form.register("district_name", { required: "District is required" })}
                          >
                            <SelectTrigger className="w-full">
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
                          {errors.district_name && <p className="text-sm text-red-500">{errors.district_name.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location_name" className="text-sm font-medium">
                            Location
                          </Label>
                          <Select
                            id="location_name"
                            value={selectedLocation}
                            onValueChange={handleLocationChange}
                            {...form.register("location_name", { required: "Location is required" })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((loc) => (
                                <SelectItem key={loc.location_name} value={loc.location_name}>
                                  {loc.location_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.location_name && <p className="text-sm text-red-500">{errors.location_name.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location_type" className="text-sm font-medium">
                            Location Type
                          </Label>
                          <Input
                            id="location_type"
                            value={watch("location_type")}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ward" className="text-sm font-medium">
                            Ward Number
                          </Label>
                          <Select
                            id="ward"
                            value={selectedWards}
                            onValueChange={handleWardChange}
                            {...form.register("ward", { required: "Ward number is required" })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Ward" />
                            </SelectTrigger>
                            <SelectContent>
                              {wards.map((ward) => (
                                <SelectItem key={ward} value={ward.toString()}>
                                  {ward}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.ward && <p className="text-sm text-red-500">{errors.ward.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Election Name
                        </Label>
                        <Input
                          id="name"
                          {...form.register("name", { required: "Election name is required" })}
                          placeholder="Enter election name"
                          className="w-full"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Input
                          id="description"
                          {...form.register("description", { required: "Description is required" })}
                          placeholder="Enter election description"
                          className="w-full"
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_date" className="text-sm font-medium">
                            Start Date
                          </Label>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="start_date"
                              type="date"
                              {...form.register("start_date", { required: "Start date is required" })}
                              min={today}
                              className="pl-10"
                            />
                          </div>
                          {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end_date" className="text-sm font-medium">
                            End Date
                          </Label>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="end_date"
                              type="date"
                              {...form.register("end_date", { required: "End date is required" })}
                              min={minEndDate}
                              className="pl-10"
                            />
                          </div>
                          {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">
                          Election Status
                        </Label>
                        <Input
                          id="status"
                          readOnly
                          value={watch("status")}
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating..." : "Create Election"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className=" rounded-lg shadow-none">
            <Elections />
          </div>
        </div>

        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-amber-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Admin Confirmation Required
              </DialogTitle>
              <DialogDescription>
                Please review the election details and enter your admin password to confirm creation.
              </DialogDescription>
            </DialogHeader>

            {electionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold">Name:</span>
                    <p className="text-gray-600">{electionData.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Location:</span>
                    <p className="text-gray-600">{electionData.location_name}</p>
                  </div>
                  <div>
                    <span className="font-semibold">District:</span>
                    <p className="text-gray-600">{electionData.district_name}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Ward:</span>
                    <p className="text-gray-600">{electionData.ward}</p>
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Description:</span>
                  <p className="text-gray-600">{electionData.description}</p>
                </div>
                <div>
                  <span className="font-semibold">Duration:</span>
                  <p className="text-gray-600">
                    {format(new Date(electionData.start_date), 'PP')} to{' '}
                    {format(new Date(electionData.end_date), 'PP')}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-4 space-y-2">
              <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                Admin Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="pl-9"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setAdminPassword("");
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCreate}
                disabled={isLoading || !adminPassword}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
              >
                {isLoading ? "Creating..." : "Confirm and Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
