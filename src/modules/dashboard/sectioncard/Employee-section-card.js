
'use client';

import {
  IconTrendingUp,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllTaskByEmployeeId,
  selectAllTaskListByEmployeeId,
} from "@/features/taskSlice";
import {
  fetchProjectsByEmployeeId,
} from "@/features/projectSlice";
import { fetchTeamsByEmployeeId } from "@/features/teamSlice";
import { fetchBugByEmployeeId } from "@/features/bugSlice";
import { useCountUp } from "@/hooks/useCountUp";
import { motion, AnimatePresence } from "framer-motion";

const CardSkeleton = () => (
  <Card className="@container/card animate-pulse">
    <CardHeader>
      <CardDescription><span className="inline-block h-4 w-50 bg-muted rounded" /></CardDescription>
      <CardTitle className="text-2xl font-semibold"><span className="inline-block h-8 w-16 bg-muted rounded" /></CardTitle>
      <CardAction><span className="inline-block h-6 w-16 bg-muted rounded-full" /></CardAction>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      <div className="line-clamp-1 flex gap-2 font-medium"><span className="inline-block h-4 w-32 bg-muted rounded" /></div>
      <div className="text-muted-foreground"><span className="inline-block h-4 w-40 bg-muted rounded" /></div>
    </CardFooter>
  </Card>
);

export function SectionCardEmployee({ employeeId }) {
  const dispatch = useDispatch();

  const { teamsByEmployee, status: teamStatus } = useSelector((state) => state.team);
  const { employeeProjects } = useSelector((state) => state.project);
  const { bugsByEmployeeId, loading: bugLoading } = useSelector((state) => state.bugs);
  const tasks = useSelector(selectAllTaskListByEmployeeId);

  const isProjectsLoading = teamStatus.fetchEmployeeProjects === "loading";
  const isTasksLoading = teamStatus.fetchAllTaskByEmployeeId === "loading";
  const isBugLoading = bugLoading?.bugsByEmployeeId === "loading";
  const isTeamsLoading = teamStatus.fetchTeamsByEmployeeId === "loading";

  const allLoaded = useMemo(() =>
    !isProjectsLoading && !isTasksLoading && !isBugLoading && !isTeamsLoading,
    [isProjectsLoading, isTasksLoading, isBugLoading, isTeamsLoading]
  );

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchProjectsByEmployeeId(employeeId));
      dispatch(getAllTaskByEmployeeId(employeeId));
      dispatch(fetchBugByEmployeeId(employeeId));
      dispatch(fetchTeamsByEmployeeId(employeeId));
    }
  }, [dispatch, employeeId]);

  const animatedProjects = useCountUp(employeeProjects?.length || 0);
  const animatedTasks = useCountUp(tasks?.length || 0);
  const animatedBugs = useCountUp(bugsByEmployeeId?.length || 0);
  const animatedTeams = useCountUp(teamsByEmployee?.length || 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const cards = [
    {
      title: "Total Projects",
      count: animatedProjects,
      badge: "+12.5%",
      footer: "Increased project participation",
      note: "Tracks all assigned or collaborated projects",
      bgColor: "bg-[#7209b7] border-blue-100",
    },
    {
      title: "My Tasks",
      count: animatedTasks,
      badge: "+12.5%",
      footer: "Strong user retention",
      note: "Task activity exceeds expectations",
      bgColor: "bg-[#007200] border-blue-100",
    },
    {
      title: "Bug Found",
      count: animatedBugs,
      badge: "+12.5%",
      footer: "Increased QA visibility",
      note: "Helps improve overall system stability",
      bgColor: "bg-[#0a89e9] border-blue-100",
    },
    {
      title: "Teams I’ve Collaborated With",
      count: animatedTeams,
      badge: "+4.5%",
      footer: "Consistent team performance",
      note: "On track with growth metrics",
      bgColor: "bg-[#eb5e28] border-blue-100",
    },
  ];


  return (
  <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 xl:grid-cols-4 lg:px-6">
    {allLoaded ? (
      <AnimatePresence>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={cardVariants}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {/* Outer div for background, text, and border color */}
            <div className={`rounded-xl border p-1 ${card.bgColor}`}>
              <Card className="bg-transparent shadow-none">
                <CardHeader>
                  <CardDescription className="text-lg font-large text-white">
                    {card.title}
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-white">{card.count}</CardTitle>
                  <CardAction>
                    {/* Optionally show badge here */}
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm text-white">
                  <div className="flex gap-2 font-medium items-center">
                    {card.footer} <IconTrendingUp className="size-4" />
                  </div>
                  <div className="opacity-80">{card.note}</div>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    ) : (
      <>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </>
    )}
  </div>
);



}
