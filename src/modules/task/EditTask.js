



// 'use client';

// import { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useParams, useRouter } from 'next/navigation';
// import { fetchTaskById, updateTask } from '@/features/taskSlice';
// import { ArrowLeft, FileText, User, Flag, Calendar, CheckCircle, Edit } from 'lucide-react';
// import { toast } from "sonner";

// const EditTask = () => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const task_id = params.id;
//   const task = useSelector((state) => state.task.currentTask);
//   const loading = useSelector((state) => state.task.status === 'loading');
//   const error = useSelector((state) => state.task.error);

//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     assignedTo: '',
//     assignedBy: '',
//     priority: 'Low',
//     deadline: '',
//     status: 'Pending',
//   });

//   useEffect(() => {
//     if (task_id) {
//       dispatch(fetchTaskById(task_id));
//     }
//   }, [dispatch, task_id]);

//   useEffect(() => {
//     if (task) {
//       const formattedDeadline = task.deadline
//         ? new Date(task.deadline).toISOString().split('T')[0]
//         : '';
//       setFormData({
//         title: task.title || '',
//         description: task.description || '',
//         assignedTo: task.assignedTo || '',
//         assignedBy: task.assignedBy || '',
//         priority: task.priority || 'Low',
//         deadline: formattedDeadline,
//         status: task.status || 'Pending',
//       });
//     }
//   }, [task]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!task_id) {
//         toast.info('No task_id found');
//         return;
//       }

//       const updatedTask = {
//         ...formData,
//         task_id: task_id,
//       };

//       console.log('Updating task:', updatedTask);
//       await dispatch(updateTask(updatedTask)).unwrap();
//       toast.success('Task updated successfully');
//       router.back();
//     } catch (error) {
//       toast.error('Error  while updating task');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
//           <div className="flex justify-center items-center h-40">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
//           <div className="text-center text-red-600">
//             <p className="text-lg font-semibold">Error: {error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!task) {
//     return (
//       <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
//           <div className="text-center text-gray-600">
//             <p className="text-lg font-semibold">Task not found</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
//       <div className=" mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div className="flex items-center gap-3 flex-wrap">
//               <button
//                 onClick={() => router.back()}
//                 className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-full font-medium text-sm transition-all hover:bg-blue-100"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//                 <span className="hidden sm:inline">Back to Task</span>
//               </button>
//               <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
//                 Edit Task: {task.title}
//               </h1>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-xs font-medium text-gray-500">Task ID:</span>
//               <span className="text-sm font-semibold text-gray-700">{task.task_id}</span>
//             </div>
//           </div>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
//           <h2 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
//             <Edit className="h-5 w-5" /> Update Task Details
//           </h2>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
//                   <FileText className="h-4 w-4" /> Task Title
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
//                   <User className="h-4 w-4" /> Assigned To
//                 </label>
//                 <input
//                   type="text"
//                   name="assignedTo"
//                   value={formData.assignedTo}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
//                   <User className="h-4 w-4" /> Assigned By
//                 </label>
//                 <input
//                   type="text"
//                   name="assignedBy"
//                   value={formData.assignedBy}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
//                   <Flag className="h-4 w-4" /> Priority
//                 </label>
//                 <select
//                   name="priority"
//                   value={formData.priority}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
//                 >
//                   <option value="Low">Low</option>
//                   <option value="Medium">Medium</option>
//                   <option value="High">High</option>
//                 </select>
//               </div>
//               <div className="sm:col-span-2">
//                 <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
//                   <FileText className="h-4 w-4" /> Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows="4"
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
//                   required
//                 ></textarea>
//               </div>
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
//                   <Calendar className="h-4 w-4" /> Deadline
//                 </label>
//                 <input
//                   type="date"
//                   name="deadline"
//                   value={formData.deadline}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
//                   <CheckCircle className="h-4 w-4" /> Status
//                 </label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all"
//                 >
//                   <option value="Pending">Pending</option>
              
//                   <option value="In Progress">In Progress</option>
//                   <option value="Completed">Completed</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="px-6 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
//               >
//                 Update Task
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditTask;



"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

import { ArrowLeft, FileText, User, Flag, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { fetchTaskById, updateTask } from "@/features/taskSlice";

export default function EditTask() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const task_id = params.id;
  const task = useSelector((state) => state.task.currentTask);
  const loading = useSelector((state) => state.task.status === "loading");
  const error = useSelector((state) => state.task.error);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedBy: "",
    priority: "Low",
    deadline: null,
    status: "Pending",
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task_id) {
      dispatch(fetchTaskById(task_id));
    }
  }, [dispatch, task_id]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignedTo: task.assignedTo || "",
        assignedBy: task.assignedBy || "",
        priority: task.priority || "Low",
        deadline: task.deadline ? new Date(task.deadline) : null,
        status: task.status || "Pending",
      });
    }
  }, [task]);

  const validate = (name, value) => {
    const err = {
      title: value.length < 2 && "Too short",
      description: value.length < 5 && "Too short",
      assignedTo: value.length < 2 && "Too short",
      assignedBy: value.length < 2 && "Too short",
    };
    return err[name] || "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMap = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (k !== "deadline" && k !== "priority" && k !== "status") {
        errMap[k] = validate(k, v);
      }
    });
    if (!formData.deadline) errMap.deadline = "Required";
    const hasErrors = Object.values(errMap).some(Boolean);
    setErrors(errMap);
    if (hasErrors) return;

    try {
      const payload = {
        ...formData,
        task_id,
        deadline: formData.deadline.toISOString(),
      };
      await dispatch(updateTask(payload)).unwrap();
      toast.success("Task updated successfully");
      router.back();
    } catch {
      toast.error("Error while updating task");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="text-center text-red-600 pt-6">
            <p className="text-lg font-semibold">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="text-center text-gray-600 pt-6">
            <p className="text-lg font-semibold">Task not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border border-gray-200 bg-white shadow-xl mx-auto max-w-4xl">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between w-full">
          <Button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-full shadow-md hover:bg-blue-800 hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <CardTitle className="text-sm sm:text-xl font-semibold text-gray-800 flex-1 text-center">
            Edit Task: {task.title}
          </CardTitle>
          <div className="text-sm font-semibold text-gray-700">Task ID: {task.task_id}</div>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Task Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1"
              required
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="assignedTo" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Assigned To
            </Label>
            <Input
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="mt-1"
              required
            />
            {errors.assignedTo && <p className="text-sm text-red-500 mt-1">{errors.assignedTo}</p>}
          </div>

          <div>
            <Label htmlFor="assignedBy" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Assigned By
            </Label>
            <Input
              id="assignedBy"
              name="assignedBy"
              value={formData.assignedBy}
              onChange={handleChange}
              className="mt-1"
              required
            />
            {errors.assignedBy && <p className="text-sm text-red-500 mt-1">{errors.assignedBy}</p>}
          </div>

          <div>
            <Label htmlFor="priority" className="flex items-center gap-2">
              <Flag className="h-4 w-4" /> Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1"
              rows="4"
              required
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Deadline
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal mt-1 w-full">
                  {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => {
                    setFormData((prev) => ({ ...prev, deadline: date }));
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && <p className="text-sm text-red-500 mt-1">{errors.deadline}</p>}
          </div>

          <div>
            <Label htmlFor="status" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}