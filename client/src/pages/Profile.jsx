import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaGraduationCap,
    FaBuilding,
    FaFileAlt,
    FaCamera,
    FaTrash,
    FaCheck,
} from "react-icons/fa";
import { BsLightningChargeFill } from "react-icons/bs";
import api from "../lib/api";

const getInitials = (fullName, username) => {
    const name = fullName || username || "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
};

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form fields state
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [educationalInstitution, setEducationalInstitution] = useState("");
    const [courseOrDepartment, setCourseOrDepartment] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bio, setBio] = useState("");

    // Picture state
    const [profilePicture, setProfilePicture] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

    // Alert & status state
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Load profile on mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await api.get("/api/auth/profile");
                if (res.data && res.data.user) {
                    const u = res.data.user;
                    setFullName(u.fullName || "");
                    setUsername(u.username || "");
                    setEmail(u.email || "");
                    setEducationalInstitution(u.educationalInstitution || "");
                    setCourseOrDepartment(u.courseOrDepartment || "");
                    setPhoneNumber(u.phoneNumber || "");
                    setBio(u.bio || "");
                    setProfilePicture(u.profilePicture || "");
                    setPreviewUrl(u.profilePicture || "");
                    
                    // Update localStorage just in case it is out of sync
                    localStorage.setItem("user", JSON.stringify(u));
                }
            } catch (err) {
                console.error("Error fetching profile details:", err);
                setError("Failed to load profile details. Please try again.");
            } finally {
                setFetching(false);
            }
        };
        fetchUserProfile();
    }, []);

    // Error & Success auto-dismiss
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Handle profile picture changes
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation: Format (JPG, JPEG, PNG, WebP)
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            setError("Invalid file type. Only JPG, JPEG, PNG, and WEBP formats are accepted.");
            return;
        }

        // Validation: Size (Max 5MB)
        const maxSizeBytes = 5 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError("File too large. Maximum allowed size is 5MB.");
            return;
        }

        setSelectedFile(file);
        setIsPhotoRemoved(false);

        // Immediate frontend preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setIsPhotoRemoved(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Save changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        // Validation
        if (!fullName.trim()) {
            setError("Full Name is required.");
            return;
        }
        if (!email.trim()) {
            setError("Email is required.");
            return;
        }
        if (!username.trim()) {
            setError("Username is required.");
            return;
        }

        const emailRegex = /.+\@.+\..+/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            let finalProfilePictureUrl = profilePicture;

            // Step 1: Upload photo if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append("image", selectedFile);
                
                const uploadRes = await api.post("/api/auth/profile/upload", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                
                if (uploadRes.data && uploadRes.data.imageUrl) {
                    finalProfilePictureUrl = uploadRes.data.imageUrl;
                } else {
                    throw new Error("Failed to retrieve uploaded image path.");
                }
            } else if (isPhotoRemoved) {
                finalProfilePictureUrl = "";
            }

            // Step 2: Update Profile details
            const payload = {
                fullName: fullName.trim(),
                username: username.trim(),
                email: email.trim(),
                educationalInstitution: educationalInstitution.trim(),
                courseOrDepartment: courseOrDepartment.trim(),
                phoneNumber: phoneNumber.trim(),
                bio: bio.trim(),
                profilePicture: finalProfilePictureUrl,
            };

            const profileRes = await api.put("/api/auth/profile", payload);

            if (profileRes.data && profileRes.data.user) {
                const updatedUser = profileRes.data.user;
                
                // Update local storage and component state
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setProfilePicture(updatedUser.profilePicture || "");
                setPreviewUrl(updatedUser.profilePicture || "");
                setSelectedFile(null);
                setIsPhotoRemoved(false);
                setSuccessMessage("Changes saved successfully!");
            }
        } catch (err) {
            console.error("Save profile error:", err);
            setError(err.response?.data?.message || "Failed to update profile details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <BsLightningChargeFill className="text-white text-lg" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Profile</h1>
                </div>

                {/* Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                            {error}
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"
                        >
                            <FaCheck className="text-green-400 text-xs shrink-0" />
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Layout */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LEFT PANEL - Profile Picture Card */}
                    <div className="md:col-span-1 surface-card rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white/[0.02] backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        
                        {/* Profile Picture */}
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 bg-indigo-600 flex items-center justify-center shadow-xl mb-4 group shrink-0">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-white">
                                    {getInitials(fullName, username)}
                                </span>
                            )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="hidden"
                        />

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 w-full mb-6 relative z-10">
                            <button
                                type="button"
                                onClick={triggerFileSelect}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
                            >
                                <FaCamera className="text-xs" /> Change Photo
                            </button>
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium border border-red-500/20 transition-all"
                                >
                                    <FaTrash className="text-xs" /> Remove Photo
                                </button>
                            )}
                        </div>

                        {/* Formats and Size Help Text */}
                        <div className="text-xs text-slate-500 space-y-1">
                            <p>Accepted formats: JPG, JPEG, PNG, WebP</p>
                            <p>Maximum size: 5 MB</p>
                        </div>
                    </div>

                    {/* RIGHT PANEL - Profile Details Fields */}
                    <div className="md:col-span-2 surface-card rounded-2xl p-6 sm:p-8 border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Full Name <span className="text-indigo-400">*</span>
                                </label>
                                <div className="relative">
                                    <FaUser className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none text-sm"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Username <span className="text-indigo-400">*</span>
                                </label>
                                <div className="relative">
                                    <FaUser className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none text-sm"
                                        placeholder="johndoe123"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Email Address <span className="text-indigo-400">*</span>
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none text-sm"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <FaPhone className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none text-sm"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Educational Institution */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Educational Institution
                                </label>
                                <div className="relative">
                                    <FaGraduationCap className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={educationalInstitution}
                                        onChange={(e) => setEducationalInstitution(e.target.value)}
                                        className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none text-sm"
                                        placeholder="Stanford University"
                                    />
                                </div>
                            </div>

                            {/* Course / Department */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    Course / Department
                                </label>
                                <div className="relative">
                                    <FaBuilding className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={courseOrDepartment}
                                        onChange={(e) => setCourseOrDepartment(e.target.value)}
                                        className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none text-sm"
                                        placeholder="Computer Science"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                Bio / About Me
                            </label>
                            <div className="relative">
                                <FaFileAlt className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows="4"
                                    className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none text-sm resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        {/* Save Changes Button */}
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px]"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
