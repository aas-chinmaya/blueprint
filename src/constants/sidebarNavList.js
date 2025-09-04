










// src/constants/sidebarNavList.js
import {
  LayoutDashboard,
  PhoneCall,
  CalendarDays,
  User,
  Folder,
  Users,
  ListChecks,
  Bug,
  FolderClosed,
  FileText,
} from "lucide-react";

export const iconMap = {
  LayoutDashboard,
  PhoneCall,
  CalendarDays,
  User,
  Folder,
  Users,
  ListChecks,
  Bug,
  FolderClosed,
  FileText,
};

export const fullNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["cpc", "employee(regular)"],
  },
  {
    title: "Client",
    url: "/client",
    icon: "User",
    roles: ["cpc"],
  },
  {
    title: "Project",
    url: "/project",
    icon: "Folder",
    roles: ["cpc", "employee(regular)"],
  },
  {
    title: "Team",
    url: "/team",
    icon: "Users",
    roles: ["cpc", "employee(regular)"],
  },
  {
    title: "Task",
    url: "/task",
    icon: "ListChecks",
    roles: ["cpc", "employee(regular)"],
  },
  {
    title: "Bug",
    url: "/bug",
    icon: "Bug",
    roles: ["cpc"],
  },
  {
    title: "Bug",
    url: "/bug/assigned-bugs",
    icon: "Bug",
    roles: ["employee(regular)"],
  },
  {
    title: "Contact",
    url: "/contact",
    icon: "PhoneCall",
    roles: ["cpc"],
  },
  {
    title: "Meeting",
    url: "#",
    icon: "CalendarDays",
    roles: ["cpc"],
    items: [
      { title: "Client Meeting", url: "/meetings/all", roles: ["cpc"] },
      { title: "Meeting Calendar", url: "/meetings/calendar", roles: ["cpc"] },
      { title: "MOM Dashboard", url: "/meetings/mom", roles: ["cpc"] },
      { title: "Cause Dashboard", url: "/meetings/cause", roles: ["cpc"] },
    ],
  },
  {
    title: "Quotation",
    url: "/quotation",
    icon: "FileText",
    roles: ["cpc"],
  },
  {
    title: "Master",
    url: "#",
    icon: "FolderClosed",
    roles: ["cpc"],
    items: [
      { title: "Service", url: "/master/services", roles: ["cpc"] },
      { title: "Industry", url: "/master/industry", roles: ["cpc"] },
      { title: "Meeting Slots", url: "/master/slots", roles: ["cpc"] },
    ],
  },
];

// console.log("fullNav",fullNav)