"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTeams } from "@/features/teamSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  BadgeInfo, Mail, Badge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

const CpcTeamList = () => {
  const dispatch = useDispatch();
  const { allTeams, status, error } = useSelector((state) => state.team);

  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    dispatch(fetchAllTeams());
  }, [dispatch]);

  // Filter and search logic
  const filteredTeams = useMemo(() => {
    return allTeams.filter((team) => {
      const matchesSearch =
        team.teamId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        projectFilter === "all" || team.projectName === projectFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allTeams, searchTerm, projectFilter]);

  // Unique project names for filter dropdown
  const projectOptions = useMemo(() => {
    const projects = [...new Set(allTeams.map((team) => team.projectName))];
    return ["all", ...projects];
  }, [allTeams]);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "teamId",
        header: "Team ID",
        cell: ({ row }) => <span>{row.original.teamId}</span>,
      },
      {
        accessorKey: "projectName",
        header: "Project",
        cell: ({ row }) => <span>{row.original.projectName}</span>,
      },
      {
        accessorKey: "project Id",
        header: "Project Id",
        cell: ({ row }) => <span>{row.original.projectId}</span>,
      },
      {
        accessorKey: "teamLeadName",
        header: "Team Lead",
        cell: ({ row }) => <span>{row.original.teamLeadName}</span>,
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => {
          const isDeleted = row.original.isDeleted;
          const statusText = isDeleted ? "Inactive" : "Active";
          const statusColor = isDeleted
            ? "bg-red-200 text-red-800"
            : "bg-green-200 text-green-800";

          return (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {statusText}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#1447e6] text-white hover:bg-[#5c8cff] hover:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                View Members
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] bg-white rounded-xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-[#1447e6] text-xl font-semibold">
                  Team Members - {row.original.teamId}
                </DialogTitle>
              </DialogHeader>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {row.original.teamMembers.map((member) => (
                  <Card
                    key={member._id}
                    className="border border-[#c3d4ff] shadow-sm hover:shadow-lg transition-shadow duration-200 rounded-lg"
                  >
                    <CardHeader className="bg-[#e5edff] rounded-t-lg px-4 py-3">
                      <CardTitle className="text-base text-[#1447e6] font-semibold flex items-center gap-2">
                        <BadgeInfo className="h-4 w-4 text-[#1447e6]" />
                        {member.memberName}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 px-4 py-3 text-sm text-gray-700">
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#1447e6]" />
                        <span>
                          <strong className="text-[#1447e6]">Role:</strong> {member.role}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#1447e6]" />
                        <span>
                          <strong className="text-[#1447e6]">Email:</strong> {member.email}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Badge className="h-4 w-4 text-[#1447e6]" />
                        <span>
                          <strong className="text-[#1447e6]">Member ID:</strong> {member.memberId}
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </DialogContent>
          </Dialog>

        ),
      },
    ],
    []
  );

  // TanStack Table setup
  const table = useReactTable({
    data: filteredTeams,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize: 5, // 5 teams per page
      },
    },
  });

  return (
    <Card className="shadow-lg border border-gray-200 rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl px-6 py-4">
        <CardTitle className="text-2xl font-bold text-white">
          Collaborated Teams
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 px-6 py-4 h-screen">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
            <Input
              placeholder="Search by team ID or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Select
            value={projectFilter}
            onValueChange={setProjectFilter}
            className="w-full sm:w-48"
          >
            <SelectTrigger className="border-gray-300 text-blue-700 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              {projectOptions.map((project) => (
                <SelectItem key={project} value={project}>
                  {project === "all" ? "All Projects" : project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading and Error States */}
        {status === "loading" && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-blue-700">Loading...</span>
          </div>
        )}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
            {error}
          </p>
        )}
        {status === "succeeded" && filteredTeams.length === 0 && (
          <p className="text-gray-500 text-center py-6">No teams found.</p>
        )}

        {/* Teams Table */}
        {status === "succeeded" && filteredTeams.length > 0 && (
          <div className="overflow-x-auto">
            <Table className="w-full border border-blue-100 rounded-xl">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-4 py-3 font-semibold text-white text-sm"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center cursor-pointer select-none">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ "asc": " ↑", "desc": " ↓" }[header.column.getIsSorted()] ?? null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                <AnimatePresence>
                  {table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-blue-50 border-b border-blue-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 text-sm">
              <div className="text-blue-700">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="border-gray-300 text-blue-700 hover:bg-blue-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="border-gray-300 text-blue-700 hover:bg-blue-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>


  );
};

export default CpcTeamList;
