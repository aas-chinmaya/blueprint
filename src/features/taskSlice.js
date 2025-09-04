




import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {axiosInstance} from '@/lib/axios';

// Create a new task
export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/task/assign', taskData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data.task || response.data;
    } catch (error) {
      // console.error('Create Task Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create task'
      );
    }
  }
);

// Fetch all tasks
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/task/getall', {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data || !response.data.tasks) {
        throw new Error('No tasks received from server');
      }

      const activeTasks = response.data.tasks.filter((task) => !task.isDeleted);
      return activeTasks;
    } catch (error) {
      // console.error('Fetch Tasks Error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tasks'
      );
    }
  }
);

// Fetch a single task by ID
export const fetchTaskById = createAsyncThunk(
  'task/fetchTaskById',
  async (task_id, { rejectWithValue }) => {
    try {
      // console.log('Fetching task with ID:', task_id);
      const response = await axiosInstance.get(`/task/getbyid/${task_id}`, {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data || !response.data.task) {
        throw new Error('Task not found');
      }

      // console.log('Task data received:', response.data.task);
      return response.data.task;
    } catch (error) {
      // console.error('Fetch Task By ID Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch task'
      );
    }
  }
);

// Fetch tasks by project ID
export const fetchTasksByProjectId = createAsyncThunk(
  'task/fetchTasksByProjectId',
  async (projectId, { rejectWithValue }) => {
    try {
      // console.log('Fetching tasks for project ID:', projectId);
      const response = await axiosInstance.get(`/task/project-tasks/${projectId}`, {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data) {
        throw new Error('No tasks received from server');
      }

      const tasksArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.tasks)
        ? response.data.tasks
        : response.data.data
        ? Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data]
        : [];

      const activeTasks = tasksArray.filter((task) => !task.isDeleted);
      // console.log('Tasks for project received:', activeTasks);
      return { projectId, tasks: activeTasks };
    } catch (error) {
      // console.error('Fetch Tasks By Project ID Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch tasks for project'
      );
    }
  }
);

// Update a task
export const updateTask = createAsyncThunk(
  'task/updateTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/task/update/${taskData.task_id}`, taskData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data || !response.data.task) {
        throw new Error('Failed to update task');
      }

      return response.data.task;
    } catch (error) {
      // console.error('Update Task Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update task'
      );
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ task_id, status, delayReason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/task/update/${task_id}`,
        { status,delayReason },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      if (!response.data || !response.data.task) {
        throw new Error('Failed to update task status');
      }

      return response.data.task;
    } catch (error) {
      // console.error('Update Task Status Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update task status'
      );
    }
  }
);

// Delete a task
export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (task_id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/task/delete/${task_id}`, {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data || !response.data.message.includes('successfully')) {
        throw new Error('Failed to delete task');
      }

      return task_id;
    } catch (error) {
      // console.error('Delete Task Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete task'
      );
    }
  }
);

// Get all task list (for admin view)
export const getAllTaskList = createAsyncThunk(
  'task/getAllTaskList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/task/getall', {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data || !Array.isArray(response.data.tasks)) {
        throw new Error('No task list received from server');
      }

      return response.data.tasks;
    } catch (error) {
      // console.error('Get All Task List Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to retrieve task list'
      );
    }
  }
);

// Get all tasks by employee ID
export const getAllTaskByEmployeeId = createAsyncThunk(
  'task/getAllTaskByEmployeeId',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/task/member/${employeeId}`, {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (!response.data) {
        throw new Error('No tasks found for the employee');
      }

      return response.data.data;
    } catch (error) {
      // console.error('Get Tasks By Employee ID Error:', error);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - Server is not responding');
      }
      if (!error.response) {
        return rejectWithValue('Network error - Unable to connect to server');
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tasks for employee'
      );
    }
  }
);
// Update Review Status (Simple)
export const updateTaskReviewStatus = createAsyncThunk(
  'task/updateTaskReviewStatus',
  async ({ task_id, reviewStatus }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/task/review-status/${task_id}`, {
        reviewStatus,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

// export const downloadTasksReport = createAsyncThunk(
//   'task/downloadTasksReport',
//   async (payload, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post('/task/report', payload, {
//         responseType: 'blob',
//         timeout: 10000,
//         validateStatus: (status) => status >= 200 && status < 500,
//       });

//       // If response is not Blob, it means backend sent error JSON/text
//       if (!(response.data instanceof Blob)) {
//         const textData = await response.data.text();
//         try {
//           const parsed = JSON.parse(textData);
//           throw new Error(parsed.message || textData);
//         } catch {
//           throw new Error(textData || 'Unknown error from server');
//         }
//       }

//       // Extract file name from header or fallback
//       let fileName = `tasks_report_${payload.projectId}_${new Date().toISOString().split('T')[0]}.xlsx`;
//       const contentDisposition = response.headers['content-disposition'];
//       if (contentDisposition) {
//         const match = contentDisposition.match(/filename="(.+)"/);
//         if (match?.[1]) {
//           fileName = match[1];
//         }
//       }

//       // Download file
//       const blob = new Blob([response.data], {
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       URL.revokeObjectURL(url);

//       return true;
//     } catch (error) {
//       // Always use backend’s error message if available
//       return rejectWithValue(error.message || 'Error from server');
//     }
//   }
// );
export const downloadTasksReport = createAsyncThunk(
  'task/downloadTasksReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/task/export-tasks', payload, {
        responseType: 'blob',
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 500, // let us handle errors manually
      });

      // If it's NOT an Excel file, treat it as an error and parse JSON
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        // Convert blob to text
        const text = await response.data.text();

        try {
          // If backend sent JSON, extract its message
          const parsed = JSON.parse(text);
          return rejectWithValue(parsed.message || text);
        } catch {
          // If backend sent plain text, just use that
          return rejectWithValue(text);
        }
      }

      // ✅ Excel file case → download
      let fileName = `tasks_report_${payload.projectId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) fileName = match[1];
      }

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Error from server');
    }
  }
);

const initialState = {
  tasks: [], // All tasks
  currentTask: null, // Single task for viewing/editing
  projectTasks: {}, // Tasks grouped by projectId
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // Error message if any
  allTaskList: [], // All tasks (including deleted/archived for admin)
  employeeTasks: [], // Tasks for a specific employee
  isLoading: false, // Added to handle loading state for employee tasks


    loading: false,
    error: null,
    successMessage: null,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.status = 'idle';
    },clearTaskMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks.push(action.payload);
        if (action.payload.projectId) {
          state.projectTasks[action.payload.projectId] = [
            ...(state.projectTasks[action.payload.projectId] || []),
            action.payload,
          ];
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch All Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
        state.projectTasks = action.payload.reduce((acc, task) => {
          if (task.projectId) {
            acc[task.projectId] = [...(acc[task.projectId] || []), task];
          }
          return acc;
        }, {});
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Task By ID
      .addCase(fetchTaskById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.currentTask = null;
      })
      // Fetch Tasks By Project ID
      .addCase(fetchTasksByProjectId.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasksByProjectId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projectTasks[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasksByProjectId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.tasks.findIndex((task) => task.task_id === action.payload.task_id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.currentTask = action.payload;
        if (action.payload.projectId) {
          const projectTasks = state.projectTasks[action.payload.projectId] || [];
          const taskIndex = projectTasks.findIndex((task) => task.task_id === action.payload.task_id);
          if (taskIndex !== -1) {
            state.projectTasks[action.payload.projectId][taskIndex] = action.payload;
          } else {
            state.projectTasks[action.payload.projectId] = [...projectTasks, action.payload];
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.tasks.findIndex((task) => task.task_id === action.payload.task_id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask.task_id === action.payload.task_id) {
          state.currentTask = action.payload;
        }
        if (action.payload.projectId) {
          const projectTasks = state.projectTasks[action.payload.projectId] || [];
          const taskIndex = projectTasks.findIndex((task) => task.task_id === action.payload.task_id);
          if (taskIndex !== -1) {
            state.projectTasks[action.payload.projectId][taskIndex] = action.payload;
          } else {
            state.projectTasks[action.payload.projectId] = [...projectTasks, action.payload];
          }
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = state.tasks.filter((task) => task.task_id !== action.payload);
        state.currentTask = null;
        Object.keys(state.projectTasks).forEach((projectId) => {
          state.projectTasks[projectId] = state.projectTasks[projectId].filter(
            (task) => task.task_id !== action.payload
          );
          if (state.projectTasks[projectId].length === 0) {
            delete state.projectTasks[projectId];
          }
        });
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get All Task List
      .addCase(getAllTaskList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAllTaskList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allTaskList = action.payload;
      })
      .addCase(getAllTaskList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get All Task By Employee ID
      .addCase(getAllTaskByEmployeeId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllTaskByEmployeeId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employeeTasks = action.payload;
      })
      .addCase(getAllTaskByEmployeeId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
       builder
      .addCase(updateTaskReviewStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTaskReviewStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        
        // No local task update — payload can be shown via toast or component
      })
      .addCase(updateTaskReviewStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      
      
      
      
      .addCase(downloadTasksReport.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(downloadTasksReport.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(downloadTasksReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to download report";
      });
  },
});

export const { clearError, resetCurrentTask } = taskSlice.actions;
export const selectTaskStatus = (state) => state.task.status;
export const selectTaskError = (state) => state.task.error;
export const selectTasksByProjectId = (state, projectId) => state.task.projectTasks[projectId] || [];
export const selectAllTasks = (state) => state.task.tasks;
export const selectCurrentTask = (state) => state.task.currentTask;
export const selectAllTaskList = (state) => state.task.allTaskList;
export const selectAllTaskListByEmployeeId = (state) => state.task.employeeTasks;

export default taskSlice.reducer;