


// "use client"

// import * as React from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

// import { useIsMobile } from "@/hooks/use-mobile"
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   ToggleGroup,
//   ToggleGroupItem,
// } from "@/components/ui/toggle-group"
// import { Skeleton } from "@/components/ui/skeleton" 

// // Redux actions
// import { fetchProjectsByEmployeeId } from "@/features/projectSlice"
// import { fetchTeamsByEmployeeId } from "@/features/teamSlice"
// import { getAllTaskByEmployeeId } from "@/features/taskSlice"
// import { currentUser, useLoggedinUser } from "@/hooks/useLoggedinUser"

// const chartConfig = {
//   metrics: { label: "Metrics" },
//   projects: { label: "Projects", color: "#16a34a" },
//   tasks: { label: "Tasks", color: "#22c55e" },
//   teams: { label: "Teams", color: "#4ade80" },
// }

// export default function ChartAreaInteractiveEmployee() {
//   const dispatch = useDispatch()
//   const isMobile = useIsMobile()
//   const [timeRange, setTimeRange] = React.useState("90d")
//   const { currentUser, loading, isTeamLead, isEmployee, isCpc } = useLoggedinUser()
// const employeeId=currentUser.employeeID
//   // Redux states
//   const {
//     employeeProjects,
//     status: projectStatus,
//     error: projectError,
//   } = useSelector((state) => ({
//     employeeProjects: state.project.employeeProjects,
//     status: state.project.status.fetchEmployeeProjects,
//     error: state.project.error.fetchEmployeeProjects,
//   }))

//   const {
//     employeeTasks,
//     isLoading: taskLoading,
//     error: taskError,
//   } = useSelector((state) => ({
//     employeeTasks: state.task.employeeTasks,
//     isLoading: state.task.isLoading,
//     error: state.task.error,
//   }))

//   const {
//     teamsByEmployee,
//     status: teamStatus,
//     error: teamError,
//   } = useSelector((state) => ({
//     teamsByEmployee: state.team.teamsByEmployee,
//     status: state.team.status,
//     error: state.team.error,
//   }))

//   // Fetch data on mount
//   React.useEffect(() => {
//     if (employeeId) {
//       dispatch(fetchProjectsByEmployeeId(employeeId))
//       dispatch(fetchTeamsByEmployeeId(employeeId))
//       dispatch(getAllTaskByEmployeeId(employeeId))
//     }
//   }, [dispatch, employeeId])

//   const formatDate = (dateString) => {
//     const date = new Date(dateString)
//     return date.toISOString().split("T")[0]
//   }

//   const getDateRange = (range) => {
//     const endDate = new Date()
//     const startDate = new Date()
//     if (range === "7d") startDate.setDate(endDate.getDate() - 7)
//     else if (range === "30d") startDate.setDate(endDate.getDate() - 30)
//     else startDate.setDate(endDate.getDate() - 90)
//     return { startDate, endDate }
//   }

//   // Process chart data
//   const chartData = React.useMemo(() => {
//     const { startDate, endDate } = getDateRange(timeRange)
//     const dateMap = new Map()

//     if (Array.isArray(employeeTasks)) {
//       employeeTasks.forEach((task) => {
//         const createdAt = task.createdAt || task.created_at
//         if (createdAt) {
//           const date = new Date(createdAt)
//           if (date >= startDate && date <= endDate) {
//             const key = formatDate(createdAt)
//             const existing = dateMap.get(key) || { date: key, tasks: 0, projects: 0, teams: 0 }
//             dateMap.set(key, { ...existing, tasks: existing.tasks + 1 })
//           }
//         }
//       })
//     }

//     if (Array.isArray(employeeProjects)) {
//       employeeProjects.forEach((project) => {
//         const createdAt = project.createdAt || project.created_at
//         if (createdAt) {
//           const date = new Date(createdAt)
//           if (date >= startDate && date <= endDate) {
//             const key = formatDate(createdAt)
//             const existing = dateMap.get(key) || { date: key, tasks: 0, projects: 0, teams: 0 }
//             dateMap.set(key, { ...existing, projects: existing.projects + 1 })
//           }
//         }
//       })
//     }

//     if (Array.isArray(teamsByEmployee)) {
//       teamsByEmployee.forEach((team) => {
//         const createdAt = team.createdAt || team.created_at
//         if (createdAt) {
//           const date = new Date(createdAt)
//           if (date >= startDate && date <= endDate) {
//             const key = formatDate(createdAt)
//             const existing = dateMap.get(key) || { date: key, tasks: 0, projects: 0, teams: 0 }
//             dateMap.set(key, { ...existing, teams: existing.teams + 1 })
//           }
//         }
//       })
//     }

//     return Array.from(dateMap.values()).sort(
//       (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//     )
//   }, [employeeTasks, employeeProjects, teamsByEmployee, timeRange])

//   React.useEffect(() => {
//     if (isMobile) {
//       setTimeRange("7d")
//     }
//   }, [isMobile])

//   const isLoading = taskLoading || projectStatus === "loading" || teamStatus === "loading"
//   const hasError = taskError || projectStatus === "failed" || teamStatus === "failed"

//   if (isLoading) {
//     return (
//       <Card className="@container/card">
//         <CardHeader>
//           <CardTitle>Project Metrics</CardTitle>
//           <CardDescription>Loading statistics...</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4 px-6 pb-6">
//           <Skeleton className="h-6 w-1/3" />
//           <Skeleton className="h-[250px] w-full rounded-xl" />
//         </CardContent>
//       </Card>
//     )
//   }

  

//   if (chartData.length === 0) {
//     return (
//       <Card className="@container/card">
//         <CardHeader>
//           <CardTitle>Project Metrics</CardTitle>
//           <CardDescription>No data available for the selected time range</CardDescription>
//         </CardHeader>
//       </Card>
//     )
//   }

//   return (
//     <Card className="@container/card">
//       <CardHeader>
//         <CardTitle>Project Metrics</CardTitle>
//         <CardDescription>
//           <span className="hidden @[540px]/card:block">
//             Project, task, and team activity for the last 3 months
//           </span>
//           <span className="@[540px]/card:hidden">Last 3 months</span>
//         </CardDescription>
//         <CardAction>
//           <ToggleGroup
//             type="single"
//             value={timeRange}
//             onValueChange={setTimeRange}
//             variant="outline"
//             className="hidden @[767px]/card:flex"
//           >
//             <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
//             <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
//             <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
//           </ToggleGroup>
//           <Select value={timeRange} onValueChange={setTimeRange}>
//             <SelectTrigger className="w-40 @[767px]/card:hidden" size="sm">
//               <SelectValue placeholder="Select time range" />
//             </SelectTrigger>
//             <SelectContent className="rounded-xl">
//               <SelectItem value="90d">Last 3 months</SelectItem>
//               <SelectItem value="30d">Last 30 days</SelectItem>
//               <SelectItem value="7d">Last 7 days</SelectItem>
//             </SelectContent>
//           </Select>
//         </CardAction>
//       </CardHeader>
//       <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
//         <ChartContainer config={chartConfig} className="h-[250px] w-full">
//           <AreaChart data={chartData}>
//             <defs>
//               <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#2356ecff" stopOpacity={1.0} />
//                 <stop offset="95%" stopColor="#2356ecff" stopOpacity={0.1} />
//               </linearGradient>
//               <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#3c6af3ff" stopOpacity={0.8} />
//                 <stop offset="95%" stopColor="#3c6af3ff" stopOpacity={0.1} />
//               </linearGradient>
//               <linearGradient id="fillTeams" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#6689f5ff" stopOpacity={0.6} />
//                 <stop offset="95%" stopColor="#6689f5ff" stopOpacity={0.1} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="date"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               minTickGap={32}
//               tickFormatter={(value) =>
//                 new Date(value).toLocaleDateString("en-US", {
//                   month: "short",
//                   day: "numeric",
//                 })
//               }
//             />
//             <ChartTooltip
//               cursor={false}
//               defaultIndex={isMobile ? -1 : 10}
//               content={
//                 <ChartTooltipContent
//                   labelFormatter={(value) =>
//                     new Date(value).toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                     })
//                   }
//                   indicator="dot"
//                 />
//               }
//             />
//             <Area dataKey="teams" type="natural" fill="url(#fillTeams)" stroke="#6689f5ff" stackId="a" />
//             <Area dataKey="tasks" type="natural" fill="url(#fillTasks)" stroke="#3c6af3ff" stackId="a" />
//             <Area dataKey="projects" type="natural" fill="url(#fillProjects)" stroke="#2356ecff" stackId="a" />
//           </AreaChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   )
// }



"use client"

import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton" 

// Redux actions
import { fetchProjectsByEmployeeId } from "@/features/projectSlice"
import { fetchTeamsByEmployeeId } from "@/features/teamSlice"
import { getAllTaskByEmployeeId } from "@/features/taskSlice"
import { useLoggedinUser } from "@/hooks/useLoggedinUser"

const chartConfig = {
  metrics: { label: "Metrics" },
  projects: { label: "Projects", color: "#16a34a" },
  tasks: { label: "Tasks", color: "#22c55e" },
  teams: { label: "Teams", color: "#4ade80" },
}

export default function ChartAreaInteractiveEmployee() {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const { currentUser } = useLoggedinUser()
  const employeeId = currentUser?.employeeID

  // Redux states
  const {
    employeeProjects,
    status: projectStatus,
    error: projectError,
  } = useSelector((state) => ({
    employeeProjects: state.project.employeeProjects,
    status: state.project.status.fetchEmployeeProjects,
    error: state.project.error.fetchEmployeeProjects,
  }))

  const {
    employeeTasks,
    isLoading: taskLoading,
    error: taskError,
  } = useSelector((state) => ({
    employeeTasks: state.task.employeeTasks,
    isLoading: state.task.isLoading,
    error: state.task.error,
  }))

  const {
    teamsByEmployee,
    status: teamStatus,
    error: teamError,
  } = useSelector((state) => ({
    teamsByEmployee: state.team.teamsByEmployee,
    status: state.team.status,
    error: state.team.error,
  }))

  // Fetch data on mount
  React.useEffect(() => {
    if (employeeId) {
      dispatch(fetchProjectsByEmployeeId(employeeId))
      dispatch(fetchTeamsByEmployeeId(employeeId))
      dispatch(getAllTaskByEmployeeId(employeeId))
    }
  }, [dispatch, employeeId])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const getDateRange = (range) => {
    const endDate = new Date()
    const startDate = new Date()
    if (range === "7d") startDate.setDate(endDate.getDate() - 7)
    else if (range === "30d") startDate.setDate(endDate.getDate() - 30)
    else startDate.setDate(endDate.getDate() - 90)
    return { startDate, endDate }
  }

  // Process chart data
  const chartData = React.useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRange)
    const dateMap = new Map()

    if (Array.isArray(employeeTasks)) {
      employeeTasks.forEach((task) => {
        const createdAt = task.createdAt || task.created_at
        if (createdAt) {
          const date = new Date(createdAt)
          if (date >= startDate && date <= endDate) {
            const key = formatDate(createdAt)
            const existing = dateMap.get(key) || { date: key, tasks: 0, projects: 0, teams: 0 }
            dateMap.set(key, { ...existing, tasks: existing.tasks + 1 })
          }
        }
      })
    }

    if (Array.isArray(employeeProjects)) {
      employeeProjects.forEach((project) => {
        const createdAt = project.createdAt || project.created_at
        if (createdAt) {
          const date = new Date(createdAt)
          if (date >= startDate && date <= endDate) {
            const key = formatDate(createdAt)
            const existing = dateMap.get(key) || { date: key, tasks: 0, projects: 0, teams: 0 }
            dateMap.set(key, { ...existing, projects: existing.projects + 1 })
          }
        }
      })
    }

    if (Array.isArray(teamsByEmployee)) {
      teamsByEmployee.forEach((team) => {
        const createdAt = team.createdAt || team.created_at
        if (createdAt) {
          const date = new Date(createdAt)
          if (date >= startDate && date <= endDate) {
            const key = formatDate(createdAt)
            const existing = dateMap.get(key) || { date: key, tasks: 0, projects: 0, teams: 0 }
            dateMap.set(key, { ...existing, teams: existing.teams + 1 })
          }
        }
      })
    }

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [employeeTasks, employeeProjects, teamsByEmployee, timeRange])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const isLoading = taskLoading || projectStatus === "loading" || teamStatus === "loading"
  const hasError = taskError || projectStatus === "failed" || teamStatus === "failed"

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Project Metrics</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  // always provide at least one data point so chart renders
  const safeChartData =
    chartData.length > 0
      ? chartData
      : [{ date: new Date().toISOString().split("T")[0], tasks: 0, projects: 0, teams: 0 }]

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Project Metrics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Project, task, and team activity for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={safeChartData}>
            <defs>
              <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2356ecff" stopOpacity={1.0} />
                <stop offset="95%" stopColor="#2356ecff" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3c6af3ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3c6af3ff" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillTeams" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6689f5ff" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6689f5ff" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area dataKey="teams" type="natural" fill="url(#fillTeams)" stroke="#6689f5ff" stackId="a" />
            <Area dataKey="tasks" type="natural" fill="url(#fillTasks)" stroke="#3c6af3ff" stackId="a" />
            <Area dataKey="projects" type="natural" fill="url(#fillProjects)" stroke="#2356ecff" stackId="a" />
          </AreaChart>
        </ChartContainer>

        {chartData.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            No data available for the selected time range
          </p>
        )}
      </CardContent>
    </Card>
  )
}


