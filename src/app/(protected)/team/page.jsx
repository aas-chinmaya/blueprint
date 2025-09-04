'use client';

import { useState } from 'react';
import CpcTeamList from '@/modules/team/CpcTeamList';
import TeamListByEmployeeId from '@/modules/team/TeamListByEmployeeId';
import { useDispatch, useSelector } from "react-redux";
import { useLoggedinUser } from '@/hooks/useLoggedinUser';

export default function AllTeamByRole() {
      const { userData, employeeData, loading: userLoading } = useSelector(state => state.user) || {};

const {currentUser}=useLoggedinUser()
// const currentUser = {
//   // role: "employee", // Change to 'employee' or 'team_lead' for testing
//   role: employeeData?.designation, // Change to 'employee' or 'team_lead' for testing
//   name: employeeData?.name,
//   employeeId: employeeData?.employeeID
// };

  return (
    <div className="">
      {currentUser.role === "cpc" ? (
        <CpcTeamList   />
      ) : (
        <TeamListByEmployeeId  employeeId={currentUser.employeeID} />
      )}



    
    </div>
  );
}