import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "@/Redux/slice/userSlice";
import { motion } from "framer-motion";
import { Camera, Mail, User, MapPin, Calendar, Users, Edit2, Upload, X, IdCard } from "lucide-react"; // Added IdCard icon
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import  baseApi  from "../api/baseApi"; // Assuming you have this setup as an Axios instance

export function Profile() {
  const dispatch = useDispatch();

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVoterIdDialog, setShowVoterIdDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // For profile picture
  const [voterIdImage, setVoterIdImage] = useState(null); // For voter ID preview
  const profileFileInputRef = useRef(null);
  const voterIdFileInputRef = useRef(null);

  // Fetch user data on mount
  useEffect(() => {
    dispatch(fetchUserData())
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("profilePhoto", file);

      setIsUploading(true);
      try {
        const response = await baseApi.post(
          "public/update_profile.php",
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
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
        setShowImageDialog(false);
      }
    }
  };

  // Handle voter ID image upload (with preview)
  const handleVoterIdUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file for voter ID");
        return;
      }
      if (file.size > 12 * 1024 * 1024) { // 12MB limit (matching backend)
        toast.error("File size must be less than 12MB");
        return;
      }

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoterIdImage(reader.result); // Set preview as Base64
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit voter ID image to backend
  const handleVoterIdSubmit = async () => {
    if (!voterIdFileInputRef.current?.files[0]) {
      toast.error("Please select a voter ID image to upload");
      return;
    }

    const formData = new FormData();
    formData.append("voter_id_image", voterIdFileInputRef.current.files[0]);

    setIsUploading(true);
    try {
      const response = await baseApi.post(
        "public/profile.php",
        formData,
        { withCredentials: true }
      );
      const result = response.data;
      if (result.success) {
        toast.success("Voter ID uploaded successfully. Pending admin approval.");
        setVoterIdImage(null); // Clear preview after successful upload
        setShowVoterIdDialog(false);
        dispatch(fetchUserData()); // Optionally re-fetch user data if voter_id_image is included
      } else {
        toast.error(result.message || "Failed to upload voter ID");
      }
    } catch (error) {
      toast.error("Error uploading voter ID");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove voter ID preview (before upload)
  const removeVoterIdPreview = () => {
    setVoterIdImage(null);
    if (voterIdFileInputRef.current) {
      voterIdFileInputRef.current.value = ""; // Clear file input
    }
  };

  // Remove profile picture
  const removeProfileImage = async () => {
    setIsUploading(true);
    try {
      const response = await baseApi.post(
        "public/add_photo.php",
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
      console.error("Remove error:", error);
    } finally {
      setIsUploading(false);
      setShowImageDialog(false);
    }
  };

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
              </div>

              {/* Button to upload voter ID */}
              <Button
                onClick={() => setShowVoterIdDialog(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                disabled={isUploading}
              >
                Upload Voter ID
              </Button>
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
                {isUploading ? "Uploading..." : "Upload New Picture"}
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
                Upload your voter ID image and preview it before submitting.
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
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => voterIdFileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? "Selecting..." : "Select Voter ID Image"}
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