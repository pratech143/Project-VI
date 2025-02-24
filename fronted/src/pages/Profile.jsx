import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "@/Redux/slice/userSlice";
import { motion } from "framer-motion";
import { Camera, Mail, User, MapPin, Calendar, Users, Edit2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export function Profile() {
  const dispatch = useDispatch();

  // State for local profile image (temporary until backend update)
  const [profileImage, setProfileImage] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const fileInputRef = useRef(null);

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

  // Get user data from Redux store
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
    profile_photo, // Ensure this is fetched from the backend
  } = useSelector((state) => state.user);

  // Handle image upload to backend
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file
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

      try {
        const response = await fetch("http://yourdomain.com/api/update_profile.php", { // Replace with actual URL
          method: "POST",
          body: formData,
          credentials: "include", // Include cookies for session auth
        });

        const result = await response.json();
        if (result.success) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfileImage(reader.result); // Update local state with Base64
            toast.success("Profile picture updated successfully!");
          };
          reader.readAsDataURL(file);

          // Re-fetch user data to update Redux state with new profile_photo
          dispatch(fetchUserData());
        } else {
          toast.error(result.message || "Failed to upload profile picture");
        }
      } catch (error) {
        toast.error("Error uploading profile picture");
        console.error("Upload error:", error);
      }
    }
  };

  // Remove profile image (reset to default or null in backend)
  const removeProfileImage = async () => {
    try {
      const response = await fetch("http://yourdomain.com/api/update_profile.php", { // Replace with actual URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action: "remove_profile_photo" }),
      });

      const result = await response.json();
      if (result.success) {
        setProfileImage(null); // Clear local state
        toast.success("Profile picture removed");
        dispatch(fetchUserData()); // Re-fetch to update Redux state
      } else {
        toast.error(result.message || "Failed to remove profile picture");
      }
    } catch (error) {
      toast.error("Error removing profile picture");
      console.error("Remove error:", error);
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
                  {profileImage || (profile_photo && (
                    <img
                      src={profileImage || profile_photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = ""; // Fallback if image fails to load
                        setProfileImage(null);
                      }}
                    />
                  )) || (
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
              </div>
            </div>
          </div>
        </motion.div>

        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription>
                Choose a new profile picture or remove the current one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {(profileImage || profile_photo) && (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={profileImage || profile_photo}
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
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload New Picture"}
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowImageDialog(false)}
                disabled={isLoading}
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