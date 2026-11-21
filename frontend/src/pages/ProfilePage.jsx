import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Briefcase, Building2, Camera, Check, Edit2, Mail, ShieldCheck, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [role, setRole] = useState(authUser?.role || "Workspace Member");
  const [department, setDepartment] = useState(authUser?.department || "Dev");

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    await updateProfile({
      fullName: fullName.trim(),
      role: role.trim(),
      department: department.trim(),
      labels: [department.trim()],
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-2xl p-6 space-y-8 border border-base-300 shadow-xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Workspace Profile</h1>
            <p className="mt-1 text-sm text-base-content/60">
              Colleagues see your name, role, and department label—your personal phone number is
              never needed.
            </p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.svg"}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.src = "/avatar.svg";
                }}
                className="size-32 rounded-full object-cover border-4 border-primary/30 shadow-lg"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-primary text-primary-content hover:scale-105
                  p-2.5 rounded-full cursor-pointer shadow-md
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-xs text-base-content/50">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/60">
                Colleague Identity
              </h3>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setFullName(authUser?.fullName || "");
                    setRole(authUser?.role || "Workspace Member");
                    setDepartment(authUser?.department || "Dev");
                    setIsEditingProfile(true);
                  }}
                  className="btn btn-xs btn-ghost gap-1 text-primary"
                >
                  <Edit2 className="size-3.5" />
                  Edit Details
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSave} className="space-y-4 bg-base-200 p-4 rounded-xl">
                <div>
                  <label className="text-xs text-base-content/60 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-base-content/60 mb-1 block">
                      Job Title / Role
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="input input-bordered input-sm w-full"
                      placeholder="e.g. Senior Frontend Dev"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-base-content/60 mb-1 block">
                      Primary Department Label
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="input input-bordered input-sm w-full"
                      placeholder="e.g. Dev, Marketing, Testing"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn btn-sm btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn btn-sm btn-primary gap-1"
                  >
                    <Check className="size-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Full Name
                  </div>
                  <p className="px-4 py-2.5 bg-base-200 rounded-xl border border-base-300 text-sm font-medium">
                    {authUser?.fullName}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Role Title
                  </div>
                  <p className="px-4 py-2.5 bg-base-200 rounded-xl border border-base-300 text-sm font-medium">
                    {authUser?.role || "Workspace Member"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Department Label
                  </div>
                  <p className="px-4 py-2.5 bg-base-200 rounded-xl border border-base-300 text-sm font-medium">
                    #{authUser?.department || "Dev"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Workspace Email
                  </div>
                  <p className="px-4 py-2.5 bg-base-200 rounded-xl border border-base-300 text-sm truncate">
                    {authUser?.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-base-200/70 rounded-xl p-5 border border-base-300">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              Account & Privacy Status
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-base-300">
                <span className="text-base-content/60">Member Since</span>
                <span className="font-medium">{authUser.createdAt?.split("T")[0] || "Active"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-base-300">
                <span className="text-base-content/60">Personal Phone Number</span>
                <span className="text-emerald-400 font-medium">Hidden / Not Required</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-base-content/60">Workspace Status</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;