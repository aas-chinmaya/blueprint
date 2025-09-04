
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserByEmail } from '@/features/shared/userSlice';

export const useLoggedinUser = (projectTeamLeadId = null) => {
  const dispatch = useDispatch();

  const { userData, employeeData, loading } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData || !employeeData) {
      dispatch(fetchUserByEmail());
    }
  }, [userData, employeeData, dispatch]);

  // Flatten only top-level primitive values
  const flattenObject = (obj) =>
    Object.fromEntries(
      Object.entries(obj || {}).filter(([_, value]) => typeof value !== 'object' || value === null)
    );

  const flattenedUser = flattenObject(userData);
  const flattenedEmployee = flattenObject(employeeData);

  const combinedData = {
    ...flattenedUser,
    ...flattenedEmployee,
  };

  const isTeamLead = projectTeamLeadId && combinedData.employeeID === projectTeamLeadId || false;
  const isEmployee = combinedData.role?.toLowerCase() === 'employee(regular)';
  const isCpc = combinedData.role?.toLowerCase() === 'cpc';
// console.log("is cps",isCpc)
  const currentUser = {
    ...combinedData,
    isTeamLead,
    isEmployee,
    isCpc,
  };
// console.log("Current User in useLoggedinUser:", currentUser);
  return {
    currentUser,
    loading,
  };
};
