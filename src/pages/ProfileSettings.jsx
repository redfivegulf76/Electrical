import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Upload, Save, Camera, PlayCircle, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company_name: "",
    phone: "",
    bio: "",
    profile_picture_url: "",
    is_public_profile: false, // New field
    location: "",            // New field
    specialties: []          // New field
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [showTour, setShowTour] = useState(false);
  const [onboardingRecord, setOnboardingRecord] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    const records = await base44.entities.UserOnboardingStatus.filter({ user_id: userData.email });
    if (records.length > 0) setOnboardingRecord(records[0]);
    setFormData({
      full_name: userData.full_name || "",
      email: userData.email || "",
      company_name: userData.company_name || "",
      phone: userData.phone || "",
      bio: userData.bio || "",
      profile_picture_url: userData.profile_picture_url || "",
      is_public_profile: userData.is_public_profile || false, // Initialize new field
      location: userData.location || "",                     // Initialize new field
      specialties: userData.specialties || []                // Initialize new field
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture_url: result.file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({ ...formData, specialties: [...formData.specialties, newSpecialty.trim()] });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialtyToRemove) => {
    setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== specialtyToRemove) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await base44.auth.updateMe({
        company_name: formData.company_name,
        phone: formData.phone,
        bio: formData.bio,
        profile_picture_url: formData.profile_picture_url,
        is_public_profile: formData.is_public_profile, // Send new field
        location: formData.location,                   // Send new field
        specialties: formData.specialties              // Send new field
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Profile Settings
            </h1>
            <p className="text-slate-600 mt-2">Manage your profile and personal information</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowTour(true)}
            className="border-cyan-400 text-cyan-700 hover:bg-cyan-50"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Replay Tour
          </Button>
        </div>

        {showTour && user && (
          <OnboardingModal
            user={user}
            onboardingRecord={onboardingRecord}
            onComplete={() => setShowTour(false)}
          />
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Picture Section */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center border-4 border-white shadow-lg">
                    {formData.profile_picture_url ? (
                      <img
                        src={formData.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-blue-700 transition-colors">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-semibold text-slate-900 mb-2">Upload Profile Picture</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {uploading ? "Uploading..." : "Click the camera icon to upload a new photo"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Public Profile Toggle */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle>Directory Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="public_profile"
                  checked={formData.is_public_profile}
                  onChange={(e) => setFormData({ ...formData, is_public_profile: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="public_profile" className="font-semibold text-slate-900 cursor-pointer">
                    Make my profile visible in the Electrician Directory
                  </label>
                  <p className="text-sm text-slate-600 mt-1">
                    Enable this to let other electricians, contractors, and potential customers find and connect with you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name</label>
                  <Input
                    value={formData.full_name}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Name cannot be changed here</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed here</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Company Name *</label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Your Company LLC"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Phone *</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State (e.g., Los Angeles, CA)"
                />
                <p className="text-xs text-slate-500 mt-1">Helps others find local professionals</p>
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Your Areas of Expertise
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                    placeholder="e.g., Commercial Wiring, Solar Installation..."
                  />
                  <Button type="button" onClick={addSpecialty} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, i) => (
                    <Badge key={i} variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-800 flex items-center">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-0.5 -mr-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio / Skills */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle>Professional Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Skills & Work Experience
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={8}
                  placeholder="Describe your skills, certifications, and work experience...&#10;&#10;Example:&#10;• Licensed Master Electrician with 15+ years experience&#10;• Specializing in commercial and industrial electrical systems&#10;• OSHA 30-Hour certified&#10;• Experience with solar panel installations and EV charging stations"
                  className="resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Share your expertise, certifications, and areas of specialization
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Delete Account</p>
                    <p className="text-sm text-slate-600">Permanently delete your account and all data. This cannot be undone.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-2 border-red-400 text-red-600 hover:bg-red-100 font-bold ml-4 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-red-700">
                    Type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> to confirm account deletion:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-4 py-2 border-2 border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                      className="border-2 border-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={deleteConfirmText !== "DELETE"}
                      onClick={() => alert("To fully delete your account, please contact support@aipartsfinder.com")}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Permanently Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            {saved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-600 font-medium"
              >
                <Save className="w-4 h-4" />
                Profile saved successfully!
              </motion.div>
            )}
            <Button
              type="submit"
              disabled={saving || uploading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}