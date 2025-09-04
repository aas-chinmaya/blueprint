"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  Users,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  List,
  IdCardIcon,
} from "lucide-react";
import {
  fetchClientById,
  fetchProjectsByClientId,
} from "@/features/clientSlice";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Typography from "@/components/ui/typography";
import Spinner from "@/components/loader/Spinner";

const statusConfig = {
  Planned: {
    color: "bg-warning text-warning-foreground",
    icon: <Clock className="w-4 h-4" />,
  },
  "In Progress": {
    color: "bg-info text-info-foreground",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  Completed: {
    color: "bg-success text-success-foreground",
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

export default function ClientDetails() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id: clientId } = useParams();

  const {
    formData = {},
    fetchClientLoading: loading,
    fetchClientError: error,
    projects = [],
    fetchProjectsLoading: projectsLoading,
  } = useSelector((state) => state.client || {});

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(clientId));
      dispatch(fetchProjectsByClientId(clientId));
    }
  }, [clientId, dispatch]);

  const handleProjectClick = (projectId) => {
    router.push(`/project/${projectId}`);
  };

  const clientFields = [
    { key: "clientName", label: "Client Name", icon: User },
    { key: "clientId", label: "Client Id", icon: IdCardIcon },
    { key: "industryType", label: "Industry", icon: Briefcase },
    { key: "contactEmail", label: "Email", icon: Mail },
    { key: "contactNo", label: "Phone", icon: Phone },
    { key: "contactPersonName", label: "Contact Person", icon: Users },
    { key: "onboardingDate", label: "Onboarding Date", icon: Calendar },
    { key: "address", label: "Address", icon: MapPin },
    { key: "website", label: "Website", icon: Globe },
  ];

  if (loading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-card rounded-xl border-l-4 border-danger shadow space-y-3 text-center">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <Typography variant="h3" className="text-destructive">
            Error loading client
          </Typography>
          <Typography variant="p">{error}</Typography>
          <Button
            onClick={() => dispatch(fetchClientById(clientId))}
            className="mt-2"
          >
            <Info className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4">
        {/* <Button
          onClick={() => router.back()}
          className="rounded-full bg-blue-800 hover:bg-blue-800  px-3 py-1 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button> */}
        <button
  onClick={() => router.back()}
  className="inline-flex cursor-pointer items-center gap-2 bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-full shadow-md hover:bg-blue-800 hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
  Back
</button>
      </div>

      {/* Main Split Layout */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Client Info */}
        <div className="p-4 border  shadow-lg rounded-xl bg-white">
          <div className="pb-2">
            <h3 className="text-xl font-bold text-blue-700">
              Client Information
            </h3>
          </div>
          <div className="space-y-4">
            {clientFields.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800">{label}</p>
                  <p className="text-sm text-gray-700">
                    {key === "website" && formData[key] ? (
                      <a
                        href={formData[key]}
                        className="text-blue-500 hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {formData[key]}
                      </a>
                    ) : (
                      formData[key] || "Not provided"
                    )}
                  </p>
                </div>
              </div>
            ))}
            {/* Attached Files */}
            {formData.fileDownloadLinks?.length > 0 && (
              <div className="pt-6">
                <h4 className="text-lg font-bold text-blue-700 mb-3">
                  Attached Files ({formData.fileDownloadLinks.length})
                </h4>
                <div className="space-y-3">
                  {formData.fileDownloadLinks.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg border border-blue-200"
                    >
                      <p className="text-sm text-gray-700 truncate">
                        {file.name}
                      </p>

                      <Button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = file.url;
                          link.download = file.name || "download"; // optional: rename downloaded file
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition text-sm font-medium"
                      >
                        <svg
                          className="w-4 h-4 text-blue-200 font-bold"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Projects */}
        <div className="p-4 border  shadow-lg rounded-xl bg-white">
          <div className="pb-2">
            <h3 className="text-xl font-bold text-blue-700">
              Recent Projects ({projects.length})
            </h3>
          </div>
          <div>
            {projects?.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => {
                  const status =
                    statusConfig[project.status] || statusConfig.Planned;
                  return (
                    <div
                      key={project.projectId}
                      onClick={() => handleProjectClick(project.projectId)}
                      className="cursor-pointer p-4 rounded-lg hover:bg-blue-50 transition flex justify-between items-start border border-blue-200"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-blue-800">
                          {project.projectName}
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>ID: {project.projectId}</div>
                          <div>
                            {project.startDate} → {project.endDate}
                          </div>
                          <div>Lead: {project.teamLeadName}</div>
                        </div>
                      </div>
                      <span
                        className={`${status.color} text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1`}
                      >
                        {status.icon}
                        {project.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-10 h-10 mx-auto text-blue-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h4 className="text-lg font-bold text-blue-700">
                  No Projects Found
                </h4>
                <p className="text-sm text-gray-600">
                  This client has no associated projects yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
