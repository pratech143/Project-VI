import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "@/Redux/slice/userSlice";
import { motion } from "framer-motion";
import {
  Camera,
  Mail,
  User,
  MapPin,
  Calendar,
  Users,
  Edit2,
  Upload,
  X,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import baseApi from "../api/baseApi";
import { uploadVoterId } from "@/Redux/slice/voterSlice";

export function Profile() {
  const dispatch = useDispatch();

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVoterIdDialog, setShowVoterIdDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [voterIdImage, setVoterIdImage] = useState(null);
  const [voterIdImageData, setVoterIdImageData] = useState(null);
  const [selectedVoterFile, setSelectedVoterFile] = useState(null);
  const profileFileInputRef = useRef(null);
  const voterIdFileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUserData())
          .unwrap()
          .catch((err) => {
            console.log("Error fetching user data:", err);
            toast.error("Failed to load user data");
          });

        const profileResponse = await baseApi.get("function/fetch_photo.php", {
          withCredentials: true,
        });

        if (profileResponse.data.success && profileResponse.data.profile_photo) {
          setProfileImagePreview(
            `data:image/jpeg;base64,${profileResponse.data.profile_photo}`
          );
        } else {
          setProfileImagePreview(null);
          if (
            profileResponse.data.message &&
            profileResponse.data.message !== "User not found"
          ) {
            toast.error(
              profileResponse.data.message || "Failed to load profile photo"
            );
          }
        }

        const voterIdResponse = await baseApi.get("public/get_voter_id.php", {
          withCredentials: true,
        });

        if (voterIdResponse.data.success && voterIdResponse.data.voter_id_image) {
          setVoterIdImageData(
            `data:image/jpeg;base64,${voterIdResponse.data.voter_id_image}`
          );
        } else {
          setVoterIdImageData(null);
          if (
            voterIdResponse.data.message &&
            voterIdResponse.data.message !== "No voter ID image found"
          ) {
            toast.error(
              voterIdResponse.data.message || "Failed to load voter ID image"
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          "Error loading data: " + (error.message || "Unknown error")
        );
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
  } = useSelector((state) => state.user);

  const handleProfileImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      console.log("Selected file:", file); // Debug: Check file object
    }
  };

  const handleProfileImageSubmit = async () => {
    if (!profileImageFile) {
      toast.error("Please select a profile photo to upload");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profile_photo", profileImageFile);

      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await baseApi.post(
        "public/profile_photo.php",
        formData,
        {
          withCredentials: true,
          // Do not manually set Content-Type; let browser handle it
        }
      );

      const result = response.data;

      console.log("Upload response:", result); // Debug: Check server response
      if (result.success) {
        toast.success("Profile photo uploaded successfully!");
        setProfileImagePreview(null);
        setProfileImageFile(null);

        const profileResponse = await baseApi.get("public/profile_photo.php", {
          withCredentials: true,
        });

        if (profileResponse.data.success && profileResponse.data.profile_photo) {
          setProfileImagePreview(
            `data:image/jpeg;base64,${profileResponse.data.profile_photo}`
          );

        } else {
          setProfileImagePreview(null);
        }

        setShowImageDialog(false);
      } else {
        toast.error(result.message || "Failed to upload profile photo");
      }
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      toast.error(
        "Error uploading profile photo: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoterIdUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedVoterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoterIdImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoterIdSubmit = async () => {
    if (!selectedVoterFile) {
      toast.error("Please select a voter ID image to upload");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("voter_id_image", selectedVoterFile);

      const response = await baseApi.post(
        "public/upload_voter_id.php",
        formData,
        {
          withCredentials: true,
        }
      );

      const result = response.data;
      if (result.success) {
        toast.success(
          "Voter ID uploaded successfully. Pending admin approval."
        );
        setVoterIdImage(null);
        setSelectedVoterFile(null);
        setShowVoterIdDialog(false);

        const voterIdResponse = await baseApi.get("public/get_voter_id.php", {
          withCredentials: true,
        });

        if (
          voterIdResponse.data.success &&
          voterIdResponse.data.voter_id_image
        ) {
          setVoterIdImageData(
            `data:image/jpeg;base64,${voterIdResponse.data.voter_id_image}`
          );
        } else {
          setVoterIdImageData(null);
        }
      } else {
        toast.error(result.message || "Failed to upload voter ID");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        "Error uploading voter ID: " + (error.message || "Unknown error")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfileImagePreview = () => {
    setProfileImagePreview(null);
    setProfileImageFile(null);
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = "";
    }
  };

  const removeVoterIdPreview = () => {
    setVoterIdImage(null);
    setSelectedVoterFile(null);
    if (voterIdFileInputRef.current) {
      voterIdFileInputRef.current.value = "";
    }
  };

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
        setProfileImagePreview(null);
        toast.success("Profile picture removed");
        dispatch(fetchUserData());
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
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load profile image");
                        e.target.src = "/default-avatar.png";
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
                {voterIdImageData && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Voter ID Image
                    </h3>
                    <div className="w-48 h-48 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={voterIdImageData}
                        alt="Voter ID"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Failed to load voter ID image");
                          e.target.src = "/default-voter-id.png";
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

        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription>
                Upload a new profile picture or remove the current one.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {profileImagePreview && (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={profileImagePreview}
                    alt="Profile Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                  {profileImageFile && (
                    <button
                      onClick={removeProfileImagePreview}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {!profileImageFile && (
                    <button
                      onClick={removeProfileImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={profileFileInputRef}
                onChange={handleProfileImageSelect}
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
              />
              <Button
                onClick={() => profileFileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? "Selecting..." : "Select Profile Photo"}
              </Button>
              {profileImageFile && (
                <Button
                  onClick={handleProfileImageSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Profile Photo"}
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageDialog(false);
                  baseApi
                    .get("public/get_profile_photo.php", { withCredentials: true })
                    .then((response) => {
                      if (response.data.success && response.data.profile_photo) {
                        setProfileImagePreview(
                          `data:image/jpeg;base64,${response.data.profile_photo}`
                        );
                      } else {
                        setProfileImagePreview(null);
                      }
                    });
                  setProfileImageFile(null);
                  if (profileFileInputRef.current) {
                    profileFileInputRef.current.value = "";
                  }
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                accept="image/*"
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
                  setVoterIdImage(null);
                  setSelectedVoterFile(null);
                  if (voterIdFileInputRef.current) {
                    voterIdFileInputRef.current.value = "";
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