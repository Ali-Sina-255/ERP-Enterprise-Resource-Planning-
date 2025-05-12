// src/pages/user/ProfilePage.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { User, Mail, Key, Shield, Edit } from "lucide-react";
import Button from "../../components/common/Button";
import { showErrorToast } from "../../utils/toastNotifications";

const ProfileDetailItem = ({ label, value, icon }) => {
  const Icon = icon;
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500 flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-gray-400" />}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {value || "-"}
      </dd>
    </div>
  );
};

const ProfilePage = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // This should ideally not happen due to ProtectedRoute, but as a fallback
    return (
      <div className="p-8 text-center">Please log in to view your profile.</div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <User size={32} className="mr-3 text-accent" /> My Profile
        </h1>
        <Button
          variant="secondary"
          IconLeft={Edit}
          onClick={() =>
            showErrorToast("Edit profile functionality is not yet implemented.")
          }
        >
          Edit Profile
        </Button>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h3 className="text-lg leading-6 font-semibold text-gray-900">
            {currentUser.firstName} {currentUser.lastName}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your personal and account details.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="sm:px-6">
              {" "}
              {/* Added padding for DetailItems container */}
              <ProfileDetailItem
                label="Username"
                value={currentUser.username}
                icon={User}
              />
              <ProfileDetailItem
                label="Email Address"
                value={currentUser.email}
                icon={Mail}
              />
              <ProfileDetailItem
                label="Role"
                value={
                  currentUser.role
                    ? currentUser.role.charAt(0).toUpperCase() +
                      currentUser.role.slice(1)
                    : "-"
                }
                icon={Shield}
              />
              <ProfileDetailItem
                label="User ID"
                value={currentUser.id}
                icon={Key}
              />
              {/* Add more details as they become available in currentUser */}
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-xl rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Account Actions
        </h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() =>
              showErrorToast(
                "Change password functionality is not implemented."
              )
            }
            className="w-full sm:w-auto"
          >
            Change Password
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              showErrorToast("Manage notification settings is not implemented.")
            }
            className="w-full sm:w-auto"
          >
            Notification Settings
          </Button>
          {/* More actions can be added here */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
