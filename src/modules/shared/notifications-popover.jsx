




"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,TooltipProvider
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  deleteNotification,
  deleteAllNotifications,
  markAsRead,
  markAllAsRead,
} from "@/features/shared/notificationSlice";

export default function NotificationsPopover({ recipientId }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const {
    items: notifications,
    status,
    error: notificationError,
  } = useSelector((state) => state.notifications) || { items: [] };

  useEffect(() => {
    dispatch(fetchNotifications(recipientId));
  }, [dispatch, recipientId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    setOpen(false);
  };

  const handleDeleteNotification = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleDeleteAllNotifications = () => {
    dispatch(deleteAllNotifications(recipientId));
  };

  const formatTimestamp = (timestamp) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };
// console.log(notifications);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse"></span>
            </>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-medium">
            Notifications {unreadCount > 0 && (
              <span className="text-rose-500">({unreadCount} unread)</span>
            )}
          </h4>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <TooltipProvider>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleMarkAllAsRead}>
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleDeleteAllNotifications}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all</p>
              </TooltipContent>
            </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-gray-50">
          {status === "loading" ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 mb-2" />
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id || notification.id}
                  className={cn(
                    "py-3 px-1 cursor-pointer hover:bg-muted/50 transition-colors group",
                    !notification.read && "bg-muted/30"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => dispatch(markAsRead(notification._id))}
                          className="h-6 w-6"
                        >
                          <Check className="h-4 w-4 text-indigo-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="h-6 w-6"
                      >
                        <X className="h-4 w-4 text-rose-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 4 && (
          <div className="border-t pt-2 mt-2">
            <Button variant="ghost" size="sm" className="w-full">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
