// src/pages/SettingsPage.jsx
import React from "react";
import {
  Settings as SettingsIcon,
  Bell,
  UserCircle as UserPrefsIcon,
  Building,
  Palette,
} from "lucide-react";
import { Link } from "react-router-dom";

const SettingsCard = ({ title, description, icon, linkTo }) => {
  const Icon = icon;
  const content = (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
      <div className="flex items-center mb-3">
        {Icon && <Icon size={24} className="mr-3 text-accent" />}
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm flex-grow">{description}</p>
      {linkTo && (
        <span className="mt-4 text-sm text-accent font-medium hover:underline self-start">
          Go to {title} →
        </span>
      )}
    </div>
  );
  return linkTo ? <Link to={linkTo}>{content}</Link> : <div>{content}</div>;
};

const SettingsPage = () => {
  // In a real app, these might link to sub-pages or modals
  const settingsOptions = [
    {
      title: "User Preferences",
      description:
        "Manage your personal display settings, language, and theme.",
      icon: UserPrefsIcon,
      linkTo: "/profile",
    }, // Link to profile for now
    {
      title: "Notification Settings",
      description: "Configure how and when you receive notifications.",
      icon: Bell,
      linkTo: "#",
    },
    {
      title: "Company Profile",
      description: "Update your organization's details and branding.",
      icon: Building,
      linkTo: "#",
    },
    {
      title: "Appearance",
      description: "Customize the look and feel of the application.",
      icon: Palette,
      linkTo: "#",
    },
    // Add more setting categories like: Integrations, Data Management, Security, API Keys, Billing (if applicable)
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8 flex items-center">
        <SettingsIcon size={32} className="mr-3 text-accent" />
        <h1 className="text-3xl font-bold text-gray-800">
          Application Settings
        </h1>
      </div>

      <p className="text-lg text-gray-600 mb-10">
        Manage your application preferences, company details, and other
        configurations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsOptions.map((opt) => (
          <SettingsCard
            key={opt.title}
            title={opt.title}
            description={opt.description}
            icon={opt.icon}
            linkTo={opt.linkTo === "#" ? undefined : opt.linkTo} // Pass undefined if link is "#"
          />
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-md">
        <h3 className="text-lg font-semibold text-blue-700">Need Help?</h3>
        <p className="text-blue-600 mt-1">
          If you encounter any issues or need assistance with settings, please
          refer to our
          <a
            href="#"
            className="font-medium underline hover:text-blue-800 ml-1"
          >
            Documentation
          </a>{" "}
          or
          <a
            href="#"
            className="font-medium underline hover:text-blue-800 ml-1"
          >
            Contact Support
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
