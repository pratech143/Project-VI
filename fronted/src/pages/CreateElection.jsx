import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Plus, AlertCircle, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createElection, fetchLocations } from "../Redux/slice/electionSlice";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"; // Corrected import
import { fetchLogin } from "@/Redux/slice/authSlice";

export function CreateElection() {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.election);

  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [electionData, setElectionData] = useState(null);

  // New state for dynamic data
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
  });

  const { watch, setValue } = form;

  // Fetching data on page load
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const data = await dispatch(fetchLocations()).unwrap();
        setDistrictData(data); // Storing data in state
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
    console.log(data); // Log form data for debugging
    setElectionData(data);
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      // Fetch the email from localStorage and perform login if necessary
      const email = localStorage.getItem("email");
      if (email && adminPassword) {
        data=await dispatch(fetchLogin({ email, password: adminPassword })).unwrap();
        error=data.message
      }
  
      // Now attempt to create the election
      await dispatch(createElection(electionData)).unwrap();
  
      // On success, close the dialog, reset form and show success toast
      setOpen(false);
      setShowConfirmation(false);
      setAdminPassword("");
      form.reset();
      toast.success("Election created successfully!");
    } catch (error) {
      // Handle failure: if login or election creation fails, show error
      console.error("Error:", error); // Optionally log the error for debugging
      toast.error(`Failed to create election: ${errorMessage || error.message || "invalid password"}`);
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
    setValue("ward", ""); // Reset ward when location changes
  };

  const handleWardChange = (ward) => {
    setSelectedWards(ward);
    setValue("ward", ward); // Update form state with ward selection
  };

  useEffect(() => {
    console.log(selectedWards); // Debug selected ward
  }, [selectedWards]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Elections</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Election
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={form.handleSubmit(handleCreateElection)}>
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>Fill in the details below to create a new election.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="district_name">Select District</Label>
                  <Select id="district_name" value={selectedDistrict} onValueChange={handleDistrictChange}>
                    <SelectTrigger>
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
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location_name">Select Location</Label>
                  <Select id="location_name" value={selectedLocation} onValueChange={handleLocationChange}>
                    <SelectTrigger>
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
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location_type">Location Type</Label>
                  <input
                    id="location_type"
                    type="text"
                    value={watch("location_type")}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ward">Select Ward</Label>
                  <Select id="ward" value={selectedWards} onValueChange={handleWardChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward} value={ward}>
                          {ward}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {["name", "description"].map((field) => (
                  <div key={field} className="grid gap-2">
                    <Label htmlFor={field}>{field.replace("_", " ")}</Label>
                    <Input id={field} {...form.register(field)} placeholder={`Enter ${field.replace("_", " ")}`} />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      {...form.register("start_date")}
                      min={today}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      {...form.register("end_date")}
                      min={minEndDate}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Election Status</Label>
                  <input
                    id="status"
                    readOnly
                    value={watch("status")}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Election"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-amber-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Admin Confirmation Required
              </DialogTitle>
              <DialogDescription>Please enter your admin password to confirm.</DialogDescription>
            </DialogHeader>

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
              <Button type="button" variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirmCreate} disabled={isLoading || !adminPassword}>
                {isLoading ? "Confirming..." : "Confirm & Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}