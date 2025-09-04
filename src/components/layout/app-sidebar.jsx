
"use client"

import * as React from "react"
import {
  LayoutDashboard,
  GalleryVerticalEnd,
  CalendarDays,
  PhoneCall as IconPhoneCall,
  CalendarEvent as IconCalendarEvent,
  Folder as FolderClosed,
  User as IconUser,
  Folder as IconFolder,
  Users as IconUsers,
  CheckSquare as IconChecklist,
  BugIcon,
} from 'lucide-react';

import { NavMain } from "@/components/layout/nav-main"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


export  function AppSidebar({ navMainItems,...props }) {
// console.log(navMainItems)

  return (
    <Sidebar collapsible="icon" className="bg-[#0F1D41]" {...props}>
      <SidebarHeader className="bg-[#0F1D41] border-b border-[#374151]">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="bg-[#0F1D41]">
        <NavMain items={navMainItems} />
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}





