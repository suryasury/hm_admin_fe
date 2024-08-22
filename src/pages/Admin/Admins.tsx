import { Plus, Search } from "lucide-react";

import { APP_ROUTES } from "@/appRoutes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import Spinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useErrorHandler from "@/hooks/useError";
import { getAdminList } from "@/https/admin-service";
import { ICreateUser } from "@/types";
import { format } from "date-fns";
import debounce from "lodash.debounce";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NoDataFound from "../NoDataFound";

const Admins = () => {
  const [noOfPages, setNoOfPages] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [adminList, setAdminList] = useState<ICreateUser[]>([]);
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = adminList.length + startIndex - 1;

  const navigate = useNavigate();
  const handleError = useErrorHandler();

  const fetchMedicineList = async () => {
    try {
      setIsFetching(true);
      const response = await getAdminList({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        search,
      });
      const data = response.data.data.userList;
      const totalRecords = response.data.data.meta.totalMatchingRecords;
      setTotalRecords(totalRecords);
      setNoOfPages(Math.ceil(totalRecords / rowsPerPage));
      setAdminList(data);
    } catch (error) {
      handleError(error, "Failed to fetch medicine list");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }, 900);

  useEffect(() => {
    fetchMedicineList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, search]);

  if (!isFetching && search === "" && adminList.length === 0) {
    return <NoDataFound message="No admins found" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardContent>
          <div className="table-header flex justify-between w-full mb-2 mt-4">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  onChange={handleSearch}
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>

              {isFetching && (
                <div className="flex gap-1 ml-40 items-start text-muted-foreground">
                  <Spinner />
                  Looking for admins....
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1"
                onClick={() => navigate(APP_ROUTES.CREATE_ADMIN)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Admin
                </span>
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">
                  Created At
                </TableHead>
              </TableRow>
            </TableHeader>
            {adminList.length === 0 ? (
              <TableBody>
                <TableCell
                  colSpan={8}
                  className="font-medium text-muted-foreground mt-4 text-center "
                >
                  No Admins found...
                </TableCell>
              </TableBody>
            ) : (
              <TableBody>
                {adminList.map((item: ICreateUser) => (
                  <TableRow
                    key={item.id}
                    onClick={() =>
                      navigate(APP_ROUTES.UPDATE_ADMIN + `/${item.id}`)
                    }
                    className="cursor-pointer"
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.phoneNumber}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.createdAt && format(item.createdAt, "PP")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
          <CardFooter className="flex-wrap gap-4 mt-8">
            <Pagination className="w-fit">
              <PaginationContent className="flex-wrap gap-2 items-center">
                <PaginationItem className="flex gap-2">
                  <p className="text-sm">Rows per page:</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 gap-1">
                        {rowsPerPage}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setRowsPerPage(5)}>
                        5
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRowsPerPage(10)}>
                        10
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRowsPerPage(25)}>
                        25
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRowsPerPage(50)}>
                        50
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRowsPerPage(100)}>
                        100
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </PaginationItem>
                <PaginationItem className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1))
                    }
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <div className="flex gap-4 items-center">
                    <Input
                      value={currentPage}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      className="w-8 text-center px-1 h-7"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (isNaN(value) || value < 1 || value > noOfPages) {
                          setCurrentPage(1);
                        } else {
                          setCurrentPage(value);
                        }
                      }}
                    />
                    <p>of {noOfPages} pages</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        prev === noOfPages ? noOfPages : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="w-3 h-3" />{" "}
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-xs text-muted-foreground">
              {
                <div className="text-xs text-muted-foreground">
                  Showing{" "}
                  <strong>
                    {startIndex}-{endIndex}
                  </strong>{" "}
                  of <strong>{totalRecords}</strong> admins
                </div>
              }
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admins;
