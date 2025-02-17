import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Plus, AlertCircle, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createElection } from "../Redux/slice/electionSlice";

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

export function CreateElection() {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.election);

  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [electionData, setElectionData] = useState(null);

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
      status: "Upcoming",
    },
  });

  const { watch, setValue } = form;

  /** ✅ Function to determine election status */
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

  /** ✅ Automatically update status when dates change */
  useEffect(() => {
    setValue("status", getStatus());
  }, [watch("start_date"), watch("end_date")]);

  /** ✅ Prevent selecting past dates */
  const today = new Date().toISOString().split("T")[0];
  const startDate = watch("start_date");
  const minEndDate = startDate || today; // End Date must be on/after Start Date

  const handleCreateElection = async (data) => {
    setElectionData(data);
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    if (adminPassword !== "admin123") {
      toast.error("Invalid admin password");
      return;
    }

    try {
      await dispatch(createElection(electionData)).unwrap();
      setOpen(false);
      setShowConfirmation(false);
      setAdminPassword("");
      form.reset();
      toast.success("Election created successfully!");
    } catch (error) {
      toast.error(`Failed to create election: ${errorMessage || error}`);
    }
  };

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
                {["name", "description", "location_name", "location_type", "district_name", "ward"].map((field) => (
                  <div key={field} className="grid gap-2">
                    <Label htmlFor={field}>{field.replace("_", " ")}</Label>
                    <Input id={field} {...form.register(field)} placeholder={`Enter ${field.replace("_", " ")}`} />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  {/* ✅ Disabled past dates for Start Date */}
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      {...form.register("start_date")}
                      min={today} // Prevent past dates
                    />
                  </div>

                  {/* ✅ End Date can't be before Start Date */}
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      {...form.register("end_date")}
                      min={minEndDate} // Prevent end date before start date
                    />
                  </div>
                </div>

                {/* ✅ Fixed Status Field */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Election Status</Label>
                  <input
                    id="status"
                    readOnly
                    value={getStatus()}
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

        {/* ✅ Admin Confirmation Dialog */}
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
