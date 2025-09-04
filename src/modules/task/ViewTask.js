"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { fetchTaskById, updateTaskReviewStatus } from "@/features/taskSlice";
import { createBug } from "@/features/bugSlice";
import { useLoggedinUser } from "@/hooks/useLoggedinUser";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  Bug,
  Briefcase,
  Mail,
  UserCheck,
  AlertCircle,
  Flag,
  CheckCheckIcon,
  BugIcon,
} from "lucide-react";
import { FiEdit } from "react-icons/fi";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/loader/Spinner";

// Status and priority styling (black and white)
// const reviewStatusColors = {
//   Pending: "bg-gray-100 text-gray-800 border-gray-300",
//   Approved: "bg-gray-200 text-gray-800 border-gray-400",
//   Rejected: "bg-gray-300 text-gray-800 border-gray-500",
//   Resolved: "bg-gray-400 text-gray-800 border-gray-600",
// };
const reviewStatusColors = {
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Resolved: 'bg-blue-100 text-blue-800 border-blue-200',
};

const ViewTask = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const task_id = params.id;
  const task = useSelector((state) => state.task.currentTask);
  const loading = useSelector((state) => state.task.status === "loading");
  const error = useSelector((state) => state.task.error);
  const { currentUser, isTeamLead } = useLoggedinUser(task?.teamLeadId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [bugPriority, setBugPriority] = useState("Medium");
  const [bugDeadline, setBugDeadline] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [actionTrigger, setActionTrigger] = useState(0); // Track actions to trigger useEffect

  useEffect(() => {
    if (task_id) {
      dispatch(fetchTaskById(task_id));
    }
  }, [dispatch, task_id, actionTrigger]);

  useEffect(() => {
    if (task) {
      setIsVisible(true);
    }
  }, [task]);

  const closeViewModal = () => {
    setIsVisible(false);
    setTimeout(() => router.back(), 300);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBugTitle("");
    setBugDescription("");
    setBugPriority("Medium");
    setBugDeadline(null);
  };

  const handleSubmit = async () => {
    if (!bugTitle.trim() || !bugDescription.trim()) {
      toast.error("Please provide both a bug title and description.");
      return;
    }
    if (!bugDeadline) {
      toast.error("Please select a deadline for the bug.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bugDeadline < today) {
      toast.error("The deadline cannot be in the past.");
      return;
    }
    dispatch(
      createBug({
        title: bugTitle,
        description: bugDescription,
        task_id: task_id,
        priority: bugPriority,
        deadline: format(bugDeadline, "yyyy-MM-dd"),
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Bug reported successfully!");
        setActionTrigger((prev) => prev + 1); // Trigger state update
        closeModal();
      })
      .catch((err) => {
        toast.error(`Failed to report bug: ${err}`);
      });
  };

  const handleMarkAsResolved = () => {
    dispatch(
      updateTaskReviewStatus({
        task_id: task_id,
        reviewStatus: "Resolved",
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Task review status updated to Resolved!");
        setActionTrigger((prev) => prev + 1); // Trigger state update
      })
      .catch((err) => {
        toast.error(`Failed to update review status: ${err}`);
      });
  };

  const isCPC = currentUser?.role === "cpc";
  const isTeamLead2 = task?.teamLeadId === currentUser?.employeeID;
 
  const canReportBug = (isCPC || isTeamLead2) && task?.status === "Completed";

// console.log(task?.teamLeadId,currentUser?.employeeID);


if (loading) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-64px)]">
      <Spinner />
    </div>
  );
}



if (!task) {
  return (
    <div className="w-full h-[calc(100vh-64px)] px-4">
      {/* Back Button: Top Left */}
      <div className="pt-4">
        <Button
          variant="outline"
          onClick={closeViewModal}
          className="inline-flex items-center gap-2 border-gray-300 text-gray-800 hover:bg-gray-100"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Centered "Task not found" Message */}
      <div className="flex flex-col items-center justify-center h-full -mt-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-800" />
        </div>
        <p className="text-gray-800 font-medium text-base">
          Task not found
        </p>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="">
        
     

<Card
  className={`w-full min-h-screen bg-white border border-gray-200 shadow-md transition-all duration-500 ${
    isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
  }`}
>
  <CardHeader>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <Button
        variant="outline"
        onClick={closeViewModal}
        className="inline-flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 text-primary" />
        Back
      </Button>

      <div className="flex gap-2">
        {canReportBug && task?.reviewStatus !== "Resolved" && (
          <Button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <BugIcon className="h-4 w-4" />
            Report Bug
          </Button>
        )}
        {canReportBug &&
          task?.reviewStatus !== "Resolved" &&
          task?.status === "Completed" && (
            <Button
              onClick={handleMarkAsResolved}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCheckIcon className="h-4 w-4" />
              Mark as Resolved
            </Button>
          )}
      </div>
    </div>

    <CardTitle className="mt-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
      <FileText className="h-6 w-6 text-blue-600" />
      {task.title}
    </CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Task ID: <span className="text-gray-700">{task.task_id}</span>
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      {/* Left: Task Details */}
      <div className="md:col-span-2 space-y-6">
        <section>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Task Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Project ID", value: task.projectId, Icon: Briefcase },
              { label: "Project Name", value: task.projectName, Icon: FileText },
              { label: "Assigned To", value: task?.assignedToDetails?.memberName || "N/A", Icon: Mail },
              { label: "Assigned By", value: task.assignedBy, Icon: UserCheck },
              { label: "Task Priority", value: task.priority, Icon: Flag },
              {
                label: "Deadline",
                value: new Date(task.deadline).toLocaleDateString("en-IN"),
                Icon: Calendar,
              },
              { label: "Status", value: task.status, Icon: Clock },
              {
                label: "Review Status",
                value: (
                  <span
                    className={`inline-block px-2 py-1 rounded-full border text-xs font-semibold ${
                      reviewStatusColors[task.reviewStatus?.toUpperCase()] ||
                      "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  >
                    {task.reviewStatus || "N/A"}
                  </span>
                ),
                Icon: AlertCircle,
              },
              {
                label: "Created At",
                value: new Date(task.createdAt).toLocaleDateString("en-IN"),
                Icon: Calendar,
              },
            ].map(({ label, value, Icon }, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-md">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="space-y-2">
          <h3 className="text-lg font-semibold text-blue-700">Description</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 min-h-[100px]">
            {task.description ? (
              task.description
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No description available</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right: Review History */}
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-base font-semibold text-blue-700">Review History</h3>

        {task.taskHistory && task.taskHistory.length > 0 ? (
          <ul className="space-y-2">
           
            {task.taskHistory.map((entry, index) => (
              <li
                key={index}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all"
              >
          
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-800 truncate max-w-[150px]">
                    {entry.bugTitle || "Untitled"}
                    
                  </span>
                  
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {entry.timestamp
                      ? new Date(entry.timestamp).toLocaleDateString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-gray-600 italic">{entry.bugStatus || "Unknown"}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border 
                      ${reviewStatusColors[entry.reviewStatus?.toUpperCase()] || 
                        "bg-gray-100 text-gray-800 border-gray-300"}`}
                  >
                    {entry.reviewStatus || "N/A"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-[100px] text-gray-600 border border-dashed rounded-lg">
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No review history available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>

        {/* Bug Report Modal */}
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-full sm:max-w-2xl w-full bg-white border border-gray-200 shadow-md rounded-md overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-800 text-lg font-semibold">
                  <Bug className="h-5 w-5 text-gray-800" />
                  Report Bug
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bug Title
                  </label>
                  <Input
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    placeholder="Enter bug title..."
                    className="border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bug Description
                  </label>
                  <Textarea
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="Describe the bug..."
                    className="min-h-[100px] border-gray-300 focus:ring-[#1447e6] text-gray-800 placeholder:text-gray-400"
                  />
                </div>
             
                <div className="flex flex-col sm:flex-row gap-4">
  {/* Bug Priority */}
  <div className="w-full sm:w-1/2">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Bug Priority
    </label>
    <Select value={bugPriority} onValueChange={setBugPriority}>
      <SelectTrigger className="border-gray-300 focus:ring-[#1447e6] text-gray-800 w-full">
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        {["Low", "Medium", "High"].map((priority) => (
          <SelectItem key={priority} value={priority}>
            {priority}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Bug Deadline */}
  <div className="w-full sm:w-1/2">
    <label className="block text-sm font-medium text-gray-600 mb-1">
      Bug Deadline
    </label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal border-gray-300 text-gray-800 hover:bg-gray-100 ${
            !bugDeadline && "text-gray-400"
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {bugDeadline ? format(bugDeadline, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white">
        <CalendarComponent
          mode="single"
          selected={bugDeadline}
          onSelect={setBugDeadline}
          initialFocus
          disabled={(date) => date < new Date()}
        />
      </PopoverContent>
    </Popover>
  </div>
</div>

              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="border-gray-300 text-gray-800 hover:bg-gray-100"
                  aria-label="Cancel bug report"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-[#1447e6] hover:bg-[#0f3cb5] text-white"
                  disabled={!bugTitle.trim() || !bugDescription.trim() || !bugDeadline}
                  aria-label="Submit bug report"
                >
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ViewTask;
