
// 'use client';

// import {
//   IconTrendingDown,
//   IconTrendingUp,
// } from "@tabler/icons-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Card,
//   CardAction,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useEffect, useMemo, useCallback, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   getAllTaskList,
// } from "@/features/taskSlice";
// import {
//   fetchAllProjects,
// } from "@/features/projectSlice";
// import {
//   fetchClients,
// } from "@/features/clientSlice";
// import { fetchAllTeams } from "@/features/teamSlice";
// import { useCountUp } from "@/hooks/useCountUp"; // Make sure path is correct

// import { motion, AnimatePresence } from "framer-motion";

// // Skeleton Loader
// const CardSkeleton = () => (
//   <Card className="@container/card animate-pulse">
//     <CardHeader>
//       <CardDescription>
//         <span className="inline-block h-4 w-50 bg-muted rounded" />
//       </CardDescription>
//       <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
//         <span className="inline-block h-8 w-16 bg-muted rounded" />
//       </CardTitle>
//       <CardAction>
//         <span className="inline-block h-6 w-16 bg-muted rounded-full" />
//       </CardAction>
//     </CardHeader>
//     <CardFooter className="flex-col items-start gap-1.5 text-sm">
//       <div className="line-clamp-1 flex gap-2 font-medium">
//         <span className="inline-block h-4 w-32 bg-muted rounded" />
//       </div>
//       <div className="text-muted-foreground">
//         <span className="inline-block h-4 w-40 bg-muted rounded" />
//       </div>
//     </CardFooter>
//   </Card>
// );

// export function SectionCardCPC() {
//   const dispatch = useDispatch();

//   const { projects, status: projectStatus } = useSelector((state) => state.project);
//   const { allTaskList, status: taskStatus } = useSelector((state) => state.task);
//   const { clients, fetchClientsLoading } = useSelector((state) => state.client);
//   const { allTeams, status: teamStatus } = useSelector((state) => state.team);

//   const clientsStatus = fetchClientsLoading
//     ? "loading"
//     : clients?.length
//       ? "succeeded"
//       : "idle";

//   const counts = useMemo(() => ({
//     projects: projects?.length || 0,
//     clients: Array.isArray(clients) ? clients.length : 0,
//     tasks: allTaskList?.length || 0,
//     teams: allTeams?.length || 0,
//   }), [projects, clients, allTaskList, allTeams]);

//   const isProjectsLoading = projectStatus === "loading";
//   const isClientsLoading = fetchClientsLoading;
//   const isTasksLoading = taskStatus === "loading";
//   const isTeamsLoading = teamStatus === "loading";

//   const allLoaded = useMemo(() => {
//     return (
//       !isProjectsLoading &&
//       !isClientsLoading &&
//       !isTasksLoading &&
//       !isTeamsLoading
//     );
//   }, [isProjectsLoading, isClientsLoading, isTasksLoading, isTeamsLoading]);

//   const fetchAllData = useCallback(() => {
//     const promises = [];

//     if (clientsStatus === "idle" || !clients?.length) {
//       promises.push(dispatch(fetchClients()).unwrap().catch(() => []));
//     }
//     if (projectStatus === "idle" || !projects?.length) {
//       promises.push(dispatch(fetchAllProjects()).unwrap().catch(() => []));
//     }
//     if (taskStatus === "idle" || !allTaskList?.length) {
//       promises.push(dispatch(getAllTaskList()).unwrap().catch(() => []));
//     }
//     if (teamStatus === "idle" || !allTeams?.length) {
//       promises.push(dispatch(fetchAllTeams()).unwrap().catch(() => []));
//     }

//     Promise.allSettled(promises).catch(console.error);
//   }, [dispatch,clientsStatus,
//   projectStatus,
//   taskStatus,
//   teamStatus,
//   clients?.length,
//   projects?.length,
//   allTaskList?.length,
//   allTeams?.length]);
//   // }, [dispatch, clientsStatus, projectStatus, taskStatus, teamStatus, clients, projects, allTaskList, allTeams]);

//   useEffect(() => {
//     fetchAllData();
//   }, [fetchAllData]);

//   const animatedProjects = useCountUp(counts.projects);
//   const animatedClients = useCountUp(counts.clients);
//   const animatedTasks = useCountUp(counts.tasks);
//   const animatedTeams = useCountUp(counts.teams);

//   const cardVariants = {
//     hidden: { opacity: 0, y: 10 },
//     visible: { opacity: 1, y: 0 },
//   };

//   const cards = [
//     {
//       title: "Total Projects",
//       count: animatedProjects,
//       badge: "+12.5%",
//       trendIcon: <IconTrendingUp />,
//       footer: "Increased project participation",
//       note: "Tracks all  projects",
//       bgColor: "bg-[#7209b7] border-blue-100",
//     },
//     {
//       title: "All Clients",
//       count: animatedClients,
//       badge: "20%",
//       trendIcon: <IconTrendingDown />,
//       footer: "Client acquisition dropped",
//       note: "Consider reviewing outreach strategy",
//       bgColor: "bg-[#007200] border-blue-100",
//     },
//     {
//       title: "Active Tasks",
//       count: animatedTasks,
//       badge: "+12.5%",
//       trendIcon: <IconTrendingUp />,
//       footer: "Strong user retention",
//       note: "Task activity exceeds expectations",
//       bgColor: "bg-[#0a89e9] border-blue-100",
//     },
//     {
//       title: "All Teams",
//       count: animatedTeams,
//       badge: "+4.5%",
//       trendIcon: <IconTrendingUp />,
//       footer: "Consistent team performance",
//       note: "On track with growth metrics",
//       bgColor: "bg-[#eb5e28] border-blue-100",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 xl:grid-cols-4 lg:px-6">
//       {allLoaded ? (
//         <AnimatePresence>
//           {cards.map((card, index) => (
//             <motion.div
//               key={index}
//               initial="hidden"
//               animate="visible"
//               exit="hidden"
//               variants={cardVariants}
//               transition={{ duration: 0.4, delay: index * 0.1 }}
//             >
//               <div className={`rounded-xl border p-1 ${card.bgColor}`}>
//                 <Card className="bg-transparent shadow-none">
//                   <CardHeader>
//                     <CardDescription className="text-lg font-large text-white">{card.title}</CardDescription>
//                     <CardTitle className="text-2xl font-semibold text-white">{card.count}</CardTitle>
//                     <CardAction>
//                     </CardAction>
//                   </CardHeader>
//                   <CardFooter className="flex-col items-start gap-1.5 text-sm text-white">
//                     <div className="flex gap-2 font-medium">
//                       {card.footer} {card.trendIcon}
//                     </div>
//                     <div className="text-muted-foreground text-white">{card.note}</div>
//                   </CardFooter>
//                 </Card>
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       ) : (
//         <>
//           <CardSkeleton />
//           <CardSkeleton />
//           <CardSkeleton />
//           <CardSkeleton />
//         </>
//       )}
//     </div>
//   );
// }





'use client';

import {
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllTaskList,
} from "@/features/taskSlice";
import {
  fetchAllProjects,
} from "@/features/projectSlice";
import {
  fetchClients,
} from "@/features/clientSlice";
import { fetchAllTeams } from "@/features/teamSlice";
import { useCountUp } from "@/hooks/useCountUp";
import { motion, AnimatePresence } from "framer-motion";

// Skeleton Loader
const CardSkeleton = () => (
  <Card className="@container/card animate-pulse">
    <CardHeader>
      <CardDescription>
        <span className="inline-block h-4 w-50 bg-muted rounded" />
      </CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        <span className="inline-block h-8 w-16 bg-muted rounded" />
      </CardTitle>
      <CardAction>
        <span className="inline-block h-6 w-16 bg-muted rounded-full" />
      </CardAction>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      <div className="line-clamp-1 flex gap-2 font-medium">
        <span className="inline-block h-4 w-32 bg-muted rounded" />
      </div>
      <div className="text-muted-foreground">
        <span className="inline-block h-4 w-40 bg-muted rounded" />
      </div>
    </CardFooter>
  </Card>
);

export function SectionCardCPC() {
  const dispatch = useDispatch();

  const { projects, status: projectStatus } = useSelector((state) => state.project);
  const { allTaskList, status: taskStatus } = useSelector((state) => state.task);
  const { clients, fetchClientsLoading } = useSelector((state) => state.client);
  const { allTeams, status: teamStatus } = useSelector((state) => state.team);

  // ✅ Fetch all data ONCE on mount
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchAllProjects());
    dispatch(getAllTaskList());
    dispatch(fetchAllTeams());
  }, [dispatch]); // ✅ Empty dependency = only on initial mount

  const counts = {
    projects: projects?.length || 0,
    clients: Array.isArray(clients) ? clients.length : 0,
    tasks: allTaskList?.length || 0,
    teams: allTeams?.length || 0,
  };

  const isLoading =
    projectStatus === "loading" ||
    fetchClientsLoading ||
    taskStatus === "loading" ||
    teamStatus === "loading";

  const animatedProjects = useCountUp(counts.projects);
  const animatedClients = useCountUp(counts.clients);
  const animatedTasks = useCountUp(counts.tasks);
  const animatedTeams = useCountUp(counts.teams);

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const cards = [
    {
      title: "Total Projects",
      count: animatedProjects,
      badge: "+12.5%",
      trendIcon: <IconTrendingUp />,
      footer: "Increased project participation",
      note: "Tracks all projects",
      bgColor: "bg-[#7209b7] border-blue-100",
    },
    {
      title: "All Clients",
      count: animatedClients,
      badge: "20%",
      trendIcon: <IconTrendingDown />,
      footer: "Client acquisition dropped",
      note: "Consider reviewing outreach strategy",
      bgColor: "bg-[#007200] border-blue-100",
    },
    {
      title: "Active Tasks",
      count: animatedTasks,
      badge: "+12.5%",
      trendIcon: <IconTrendingUp />,
      footer: "Strong user retention",
      note: "Task activity exceeds expectations",
      bgColor: "bg-[#0a89e9] border-blue-100",
    },
    {
      title: "All Teams",
      count: animatedTeams,
      badge: "+4.5%",
      trendIcon: <IconTrendingUp />,
      footer: "Consistent team performance",
      note: "On track with growth metrics",
      bgColor: "bg-[#eb5e28] border-blue-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 xl:grid-cols-4 lg:px-6">
      {!isLoading ? (
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
              <div className={`rounded-xl border p-1 ${card.bgColor}`}>
                <Card className="bg-transparent shadow-none">
                  <CardHeader>
                    <CardDescription className="text-lg font-large text-white">{card.title}</CardDescription>
                    <CardTitle className="text-2xl font-semibold text-white">{card.count}</CardTitle>
                    <CardAction />
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm text-white">
                    <div className="flex gap-2 font-medium">
                      {card.footer} {card.trendIcon}
                    </div>
                    <div className="text-muted-foreground text-white">{card.note}</div>
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
