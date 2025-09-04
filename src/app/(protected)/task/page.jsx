'use client';

import { useState } from 'react';
import CpcTaskList from '@/modules/TaskModules/CpcTaskList';
import EmployeeTaskList from '@/modules/TaskModules/EmployeeTaskList';
import { useDispatch, useSelector } from "react-redux";
import { useLoggedinUser } from '@/hooks/useLoggedinUser';





export default function AllTaskListByRole() {
  const { currentUser, loading, isCpc } = useLoggedinUser();


  return (
    <div className="">
      {currentUser?.role==="cpc"? (
        <CpcTaskList  currentUser={currentUser} />
      ) : (
        <EmployeeTaskList  currentUser={currentUser} />
      )}
    </div>
  );
}