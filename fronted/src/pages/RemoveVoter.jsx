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
import { Badge } from "@/components/ui/badge";
import { removeVoter, resetState } from "@/Redux/slice/removeVoterSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertCircle, CheckCircle2, Search } from "lucide-react";
import toast from "react-hot-toast";
import baseApi from "@/api/baseApi";

export default function RemoveVoter() {
  const [voterId, setVoterId] = useState("");
  const [voterDetails, setVoterDetails] = useState(null);
  const [searchError, setSearchError] = useState(""); // Local error for search
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.removeVoter); 

  const handleSearch = async () => {
    if (!voterId.trim()) {
      setSearchError("Please enter a voter ID");
      return;
    }

    setSearchError("");
    setVoterDetails(null);

    try {
      const response = await baseApi.post(
        "function/fetch_user_data.php",
        { voter_id: voterId },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = response.data;
      if (data.success) {
        setVoterDetails(data.data);
      } else {
        setSearchError(data.message || "Voter not found");
      }
    } catch (err) {
      setSearchError("Failed to fetch voter details. Please try again.");
      console.error(err);
    }
  };

  const handleRemoveVoter = () => {
    if (!voterDetails) return;

    dispatch(removeVoter({ voter_id: voterDetails.id }))
      .unwrap() // Unwrap to handle promise directly
      .then(() => {
        toast.success(
          `Voter ${voterDetails.name} (ID: ${voterDetails.id}) has been successfully removed.`
        );
        setVoterId("");
        setVoterDetails(null);
        dispatch(resetState()); // Reset Redux state after success
      })
      .catch((err) => {
        toast.error(err || "Failed to remove voter. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trash2 className="h-6 w-6 text-destructive" />
              Remove Voter
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Voter ID"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  className="flex-1"
                  disabled={loading} // Use Redux loading state
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading} // Use Redux loading state
                  variant="secondary"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="h-5 w-5" />
                  <p>{searchError}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>{success}</p>
                </div>
              )}

              {voterDetails && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
                    <CheckCircle2 className="h-5 w-5" />
                    <p>Voter found</p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h3 className="font-medium text-lg">Voter Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Voter ID:</div>
                      <div className="font-medium">{voterDetails.id}</div>

                      <div className="text-muted-foreground">Name:</div>
                      <div className="font-medium">{voterDetails.name}</div>

                      <div className="text-muted-foreground">District:</div>
                      <div className="font-medium">{voterDetails.district}</div>

                      <div className="text-muted-foreground">Location:</div>
                      <div className="font-medium">{voterDetails.location}</div>

                      <div className="text-muted-foreground">Ward:</div>
                      <div className="font-medium">
                        <Badge variant="outline" className="bg-primary/10">
                          Ward {voterDetails.ward}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full mt-4"
                        disabled={loading} // Use Redux loading state
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Voter
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          remove the voter
                          <span className="font-semibold">
                            {" "}
                            {voterDetails.name}{" "}
                          </span>
                          with ID{" "}
                          <span className="font-semibold">
                            {voterDetails.id}
                          </span>{" "}
                          from the system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleRemoveVoter}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={loading} // Use Redux loading state
                        >
                          {loading ? "Removing..." : "Yes, remove voter"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-muted/20 flex justify-center border-t">
            <p className="text-sm text-muted-foreground">
              Enter a voter ID to search and remove a voter from the system
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
