import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "@/Redux/slice/userSlice";
import { motion } from "framer-motion";
import { Camera, Mail, User, MapPin, Calendar, Users, Edit2, Upload, X, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import baseApi from "../api/baseApi"; // Still used for profile picture, but voter ID uses fetch directly

export function Profile() {
  const dispatch = useDispatch();

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVoterIdDialog, setShowVoterIdDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // For profile picture
  const [voterIdImage, setVoterIdImage] = useState(null); // For voter ID preview (local selection)
  const [voterIdImageData, setVoterIdImageData] = useState(null); // For stored voter ID image (Base64 from backend)
  const [selectedVoterFile, setSelectedVoterFile] = useState(null); // Store the selected voter ID file
  const profileFileInputRef = useRef(null);
  const voterIdFileInputRef = useRef(null);

  // Fetch user data and voter ID image on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data (including profile photo)
        await dispatch(fetchUserData())
          .unwrap()
          .then((userData) => {
            if (userData.profile_photo) {
              setProfileImage(userData.profile_photo); // Set profile image from backend
            }
          })
          .catch((err) => {
            console.log("Error fetching user data:", err);
            toast.error("Failed to load user data");
          });

        // Fetch voter ID image
        const response = await fetch("public/get_voter_id.php", {
          method: "GET",
          credentials: "include", // Include cookies for session auth
        });

        if (!response.ok) {
          const text = response.data(); // Get raw response text for debugging
          console.error("Non-OK response fetching voter ID image:", text);
          throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
        }

        const result =response.data
        console.log("Voter ID image response:", result);
        if (result.success) {
          if (result.voter_id_image) {
            setVoterIdImageData(`data:image/jpeg;base64,${result.voter_id_image}`); // Set Base64 data for display
          } else {
            setVoterIdImageData(null); // No voter ID image uploaded
          }
        } else {
          toast.error(result.message || "Failed to load voter ID image");
        }
      } catch (error) {
        console.error("Error fetching voter ID image:", error.message);
        toast.error("Error loading voter ID image: " + (error.message || "Unknown error"));
      }
    };

    fetchData();
  }, [dispatch]);

  const {
    name,
    user_id,
    role,
    email,
    voter_id,
    dob,
    gender,
    location,
    isLoading,
    isError,
    profile_photo,
  } = useSelector((state) => state.user);

  // Handle profile picture upload
  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit (unchanged for profile picture)
        toast.error("File size must be less than 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("profilePhoto", file);

      setIsUploading(true);
      try {
        const response = await baseApi.post(
          "public/profile_photo.php",
          formData,
          { withCredentials: true }
        );
        const result = response.data;
        if (result.success) {
          setProfileImage(result.file_url); // Use the URL returned by the backend
          toast.success("Profile picture updated successfully!");
          dispatch(fetchUserData()); // Update Redux state
        } else {
          toast.error(result.message || "Failed to upload profile picture");
        }
      } catch (error) {
        toast.error("Error uploading profile picture");
        console.error("Upload error:", error.response?.data || error.message);
      } finally {
        setIsUploading(false);
        setShowImageDialog(false);
      }
    }
  };

  // Handle voter ID image upload (with preview, no type or size limits)
  const handleVoterIdUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Removed type and size limit checks as per request
      // if (!file.type.startsWith("image/")) {
      //   toast.error("Please upload an image file for voter ID");
      //   return;
      // }
      // if (file.size > 12 * 1024 * 1024) { // 12MB limit (matching backend)
      //   toast.error("File size must be less than 12MB");
      //   return;
      // }

      setSelectedVoterFile(file); // Store the file object

      const reader = new FileReader();
      reader.onloadend = () => {
        setVoterIdImage(reader.result); // Set preview as Base64
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit voter ID image to backend (send file directly via raw POST)
  const handleVoterIdSubmit = async () => {
    if (!selectedVoterFile) {
      console.log("No voter ID file selected");
      toast.error("Please select a voter ID image to upload");
      return;
    }

    // Verify selectedVoterFile is a File object
    if (!(selectedVoterFile instanceof File)) {
      console.error("selectedVoterFile is not a File object:", selectedVoterFile);
      toast.error("Invalid file format. Please select a valid file.");
      return;
    }

    // Log file details for debugging
    console.log("Selected voter file:", {
      name: selectedVoterFile.name,
      type: selectedVoterFile.type,
      size: selectedVoterFile.size,
    });

    setIsUploading(true);
    try {
      const arrayBuffer = await selectedVoterFile.arrayBuffer(); // Convert File to ArrayBuffer
      const response = await baseApi.post("public/upload_voter_id.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream", // Raw binary data
        },
        credentials: "include", // Include cookies for session auth
        body: arrayBuffer, // Send raw binary data
      });

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const text = await response.text(); // Get raw response text for debugging
        console.error("Non-OK response:", text);
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
      }

      const result = await response.json();
      console.log("Response:", result);
      if (result.success) {
        toast.success("Voter ID uploaded successfully. Pending admin approval.");
        setVoterIdImage(null);
        setSelectedVoterFile(null); // Clear selected file
        setShowVoterIdDialog(false);
        // Refresh voter ID image after upload
        const voterIdResponse = await fetch("public/get_voter_id.php", {
          method: "GET",
          credentials: "include",
        });
        if (!voterIdResponse.ok) {
          const voterIdText = await voterIdResponse.text();
          console.error("Non-OK response fetching voter ID image:", voterIdText);
          throw new Error(`HTTP error fetching voter ID image! status: ${voterIdResponse.status}, body: ${voterIdText}`);
        }
        const voterIdResult = await voterIdResponse.json();
        if (voterIdResult.success && voterIdResult.voter_id_image) {
          setVoterIdImageData(`data:image/jpeg;base64,${voterIdResult.voter_id_image}`);
        } else {
          setVoterIdImageData(null);
          toast.error(voterIdResult.message || "Failed to load voter ID image after upload");
        }
      } else {
        toast.error(result.message || "Failed to upload voter ID");
      }
    } catch (error) {
      console.error("Upload error:", error.message);
      toast.error("Error uploading voter ID: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  // Remove voter ID preview (before upload)
  const removeVoterIdPreview = () => {
    setVoterIdImage(null);
    setSelectedVoterFile(null); // Clear selected file
    if (voterIdFileInputRef.current) {
      voterIdFileInputRef.current.value = ""; // Clear file input
    }
  };

  // Remove profile picture
  const removeProfileImage = async () => {
    setIsUploading(true);
    try {
      const response = await baseApi.post(
        "public/update_profile.php",
        { action: "remove_profile_photo" },
        { withCredentials: true }
      );
      const result = response.data;
      if (result.success) {
        setProfileImage(null);
        toast.success("Profile picture removed");
        dispatch(fetchUserData()); // Update Redux state
      } else {
        toast.error(result.message || "Failed to remove profile picture");
      }
    } catch (error) {
      toast.error("Error removing profile picture");
      console.error("Remove error:", error.response?.data || error.message);
    } finally {
      setIsUploading(false);
      setShowImageDialog(false);
    }
  };
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await baseApi.post("public/get_voter_id.php");
        setVoters(response.data.voters || []);
      } catch (error) {
        console.error("Error fetching voters:", error);
      }
    };

    fetchVoters();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Error loading user data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {profile_photo ? (
                    <img
                      src={profile_photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load profile image");
                        e.target.src = "/default-avatar.png"; // Use a default image
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowImageDialog(true)}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-600">{role}</p>
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{dob}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>{gender}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{location}</span>
                </div>
                {voter_id && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <IdCard className="w-5 h-5" />
                    <span>Voter ID: {voter_id}</span>
                  </div>
                )}
                {/* Display voter ID image if uploaded */}
                {voterIdImageData && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800">Voter ID Image</h3>
                    <div className="w-48 h-48 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={voterIdImageData}
                        alt="Voter ID"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Failed to load voter ID image");
                          e.target.src = "/default-voter-id.png"; // Use a default image
                        }}
                      />
                    </div>
                    <Button
                      onClick={() => setShowVoterIdDialog(true)}
                      className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={isUploading}
                    >
                      Update Voter ID
                    </Button>
                  </div>
                )}
              </div>

              {/* Button to upload voter ID if no image exists */}
              {!voterIdImageData && (
                <Button
                  onClick={() => setShowVoterIdDialog(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                  disabled={isUploading}
                >
                  Upload Voter ID
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Dialog for Profile Picture */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription>
                Choose a new profile picture or remove the current one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {profile_photo && (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={profile_photo}
                    alt="Current profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <button
                    onClick={removeProfileImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={profileFileInputRef}
                onChange={handleProfileImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => profileFileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Update Picture"}
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowImageDialog(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog for Voter ID Upload with Preview */}
        <Dialog open={showVoterIdDialog} onOpenChange={setShowVoterIdDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Voter ID</DialogTitle>
              <DialogDescription>
                Upload your voter ID and preview it before submitting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {voterIdImage && (
                <div className="relative w-full max-w-xs mx-auto">
                  <img
                    src={voterIdImage}
                    alt="Voter ID Preview"
                    className="w-full h-auto rounded-lg object-contain border border-gray-300"
                  />
                  <button
                    onClick={removeVoterIdPreview}
                    className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={voterIdFileInputRef}
                onChange={handleVoterIdUpload}
                // Removed accept attribute to allow any file type
                className="hidden"
              />
              <Button
                onClick={() => voterIdFileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? "Selecting..." : "Select Voter ID"}
              </Button>
              {voterIdImage && (
                <Button
                  onClick={handleVoterIdSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Voter ID"}
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowVoterIdDialog(false);
                  setVoterIdImage(null); // Clear preview on cancel
                  setSelectedVoterFile(null); // Clear selected file on cancel
                  if (voterIdFileInputRef.current) {
                    voterIdFileInputRef.current.value = ""; // Clear file input
                  }
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}