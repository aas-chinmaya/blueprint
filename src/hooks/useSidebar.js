"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarByRole } from "@/features/shared/sidebarSlice";

export function InitSidebarFromUser() {
  const dispatch = useDispatch();
  const { employeeData } = useSelector((state) => state.user);

  useEffect(() => {
    if (employeeData?.role) {
      const role = employeeData.role.split("(")[0].trim().toLowerCase();
      dispatch(setSidebarByRole(role));
    }
  }, [employeeData,dispatch]);

  return null; // this component just initializes sidebar
}
