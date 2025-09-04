'use client'

import { useSelector } from "react-redux";

export const useCurrentUser = (projectTeamLeadId = null) => {
  
  const { userData, employeeData, loading } = useSelector((state) => state.user);

  const currentUser = {
    id: employeeData?.employeeID || userData?.id || null,
    name: employeeData?.name || userData?.fullName ,
    email: employeeData?.email || userData?.email || "",
    role: employeeData?.role?.toLowerCase() ,
    profilePicture: userData?.profilePicture || null,
    designation: employeeData?.designation || "",
  };
const isTeamLead =
    projectTeamLeadId &&
    currentUser.id === projectTeamLeadId;
  return {
    currentUser,
    loading,
    isTeamLead: isTeamLead,
    isEmployee: currentUser.role === "employee",
    isCpc: currentUser.role === "cpc",  // ✅ fixed here
  };
};
