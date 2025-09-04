

"use client"

import React from "react"
import { useEffect, useState } from 'react';

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
import { fetchTasksByDeadline } from "@/features/dashboard/dashboardSlice";
import {  fetchAllProjects} from "@/features/projectSlice";
import { fetchAllTeams } from "@/features/teamSlice";

export const description = "An interactive area chart for project statistics"

const chartConfig = {
  metrics: {
    label: "Metrics",
  },
  projects: {
    label: "Projects",
    color: "#16a34a",
  },
  tasks: {
    label: "Tasks",
    color: "#22c55e",
  },
  teams: {
    label: "Teams",
    color: "#4ade80",
  },
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const dispatch = useDispatch()

  const { data: tasksData, error: tasksError, status: tasksStatus } = useSelector(
    (state) => state.dashboard.deadlineTasks || {}
  )
  const { projects = [], status: projectStatus } = useSelector(
    (state) => state.project
  )
  const { allTeams = [], status: teamStatus } = useSelector((state) => state.team)

  useEffect(() => {
    dispatch(fetchTasksByDeadline())
    dispatch(fetchAllProjects())
    dispatch(fetchAllTeams())
  }, [dispatch])

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

  const chartData = React.useMemo(() => {
    const { startDate, endDate } = getDateRange(timeRange)
    const dateMap = new Map()

    if (Array.isArray(tasksData)) {
      tasksData.forEach((task) => {
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

    if (Array.isArray(projects)) {
      projects.forEach((project) => {
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

    if (Array.isArray(allTeams)) {
      allTeams.forEach((team) => {
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
  }, [tasksData, projects, allTeams, timeRange])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // ✅ Show skeleton if data is loading
  if (tasksStatus === "loading" || projectStatus === "loading" || teamStatus === "loading") {
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

 

  if (chartData.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Project Metrics</CardTitle>
          <CardDescription>No data available for the selected time range</CardDescription>
        </CardHeader>
      </Card>
    )
  }

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
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
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
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
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
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
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
      </CardContent>
    </Card>
  )
}




