
"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchClients } from "@/features/clientSlice";
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  X,
  ArrowUp,
  ArrowDown,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Loader from "@/components/ui/loader";

export default function AllClientList() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { clients, fetchClientsLoading } =
    useSelector((state) => state.client) || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [sortField, setSortField] = useState("clientName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 10
  );

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 5 : 10);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clientStats = Array.isArray(clients)
    ? {
        total: clients.length,
        industries: [...new Set(clients.map((c) => c.industryType))].reduce(
          (acc, industry) => {
            acc[industry] = clients.filter(
              (c) => c.industryType === industry
            ).length;
            return acc;
          },
          {}
        ),
      }
    : { total: 0, industries: {} };

  const filteredAndSortedClients = () => {
    if (!Array.isArray(clients)) return [];
    let filtered = clients;
    if (selectedIndustry !== "all") {
      filtered = filtered.filter(
        (client) => client.industryType === selectedIndustry
      );
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.clientName?.toLowerCase().includes(term) ||
          client.clientId?.toString().includes(term) ||
          client.industryType?.toLowerCase().includes(term)
      );
    }
    return [...filtered].sort((a, b) => {
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";
      return sortDirection === "asc"
        ? fieldA < fieldB
          ? -1
          : fieldA > fieldB
          ? 1
          : 0
        : fieldA > fieldB
        ? -1
        : fieldA < fieldB
        ? 1
        : 0;
    });
  };

  const sortedClients = filteredAndSortedClients();
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const handleEdit = (client) => router.push(`/client/edit/${client.clientId}`);
  const handleView = (client) => router.push(`/client/${client.clientId}`);

  if (fetchClientsLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Client Directory</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..."
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600" onClick={() => router.push("/client/onboarding")}> 
            <Plus className="h-4 w-4 mr-2" /> Onboard Client
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <TableRow>
                <TableHead className="text-center  text-white  w-20">S.No</TableHead>
                <TableHead className="text-center text-white ">ID</TableHead>
                <TableHead className="text-left  text-white min-w-[150px]">Client Name</TableHead>
                <TableHead className="text-left  text-white min-w-[100px]">Industry</TableHead>
                <TableHead className="text-center text-white  min-w-[90px]">Date</TableHead>
                <TableHead className="text-center text-white  w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground h-[75vh]">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client, index) => (
                  <TableRow key={client.clientId}>
                    <TableCell className="text-center">
                      {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {client.clientId}
                    </TableCell>
                    <TableCell className="font-semibold">{client.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{client.industryType}</TableCell>
                    <TableCell className="text-center">
                      {client.onboardingDate
                        ? new Date(client.onboardingDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "2-digit",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost" className="text-green-500 hover:text-green-700"
                          size="icon"
                          onClick={() => handleEdit(client)}
                          title="Edit Client"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" className="text-blue-500 hover:text-blue-700"
                          size="icon"
                          onClick={() => handleView(client)}
                          title="View Client"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {sortedClients.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedClients.length} of {sortedClients.length} clients
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(page)}
                      className={cn("w-8 h-8 text-sm", currentPage === page && "bg-primary text-white")}
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}