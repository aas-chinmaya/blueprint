
"use client";
import * as React from "react"

import { AppSidebar } from "@/components/layout/app-sidebar";
import NotificationsPopover from "@/modules/shared/notifications-popover";
import ProfileSheet from "@/modules/shared/ProfileSheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserByEmail } from "@/features/shared/userSlice";
import { setSidebarByRole } from "@/features/shared/sidebarSlice";
import { useLoggedinUser } from "@/hooks/useLoggedinUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ProtectedAppShell({ children }) {
  const [showProfile, setShowProfile] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

const { user, email } = useSelector((state) => state.auth) || {};
// Fetch user data on component mount
useEffect(() => {
  dispatch(fetchUserByEmail());
}, [dispatch]);

const {currentUser}=useCurrentUser()
// console.log("currentUser in app shell4444",currentUser?.role)
// console.log("currentUser role", currentUser?.role)
const recipientId = currentUser?.id; // Fallback to a default ID if employeeData is not available
const navMainItems = useSelector((state) => state.sidebar.navItems);
// console.log("app shell",currentUser,recipientId)

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split("/")[1];
    if (!path) return "Home";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

useEffect(() => {
  if (currentUser?.role) {
    dispatch(setSidebarByRole(currentUser?.role.toLowerCase()));
  }
}, [currentUser?.role, dispatch]);

  return (
    
        <SidebarProvider>
          <AppSidebar navMainItems={navMainItems}/>
          <SidebarInset className=" overflow-x-hidden">
            <header className=" sticky top-0 z-30 flex h-13 shrink-0 items-center px-4  w-full gap-2 bg-white  transition-[width,height] ease-linear shadow-sm group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              {/* className=" flex h-13 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"> */}
              <div className="flex items-center gap-2  w-full">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                {/* <Separator orientation="vertical" className="h-4" /> */}
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">{getPageTitle()}</BreadcrumbLink>
                    </BreadcrumbItem>
                    
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              {/* RIGHT SECTION: Notification + Profile */}
              <div className="flex items-center gap-4 ml-auto ">
                <NotificationsPopover recipientId={recipientId} />
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0"
                  onClick={() => setShowProfile(true)}
                >
           
                  <Avatar>
                    <AvatarImage
                      src={
                        typeof user?.image === "string"
                          ? user.image
                          : "/images/Avatar.png"
                      }
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>{currentUser.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </div>
              <ProfileSheet
                open={showProfile}
                onClose={() => setShowProfile(false)}
              />
            </header>
    
            <div className=" flex flex-1 flex-col gap-4  pt-0">
              <div className=" min-h-[100vh] flex-1  md:min-h-min m-2 overflow-auto">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
    
  );
}