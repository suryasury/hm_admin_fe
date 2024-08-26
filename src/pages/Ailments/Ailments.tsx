import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import { deleteAilment, getAilmentList } from "@/https/admin-service";
import { Ailment } from "@/types";
import debounce from "lodash.debounce";
import { Edit, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NoDataFound from "../NoDataFound";
import AilmentForm from "./AilmentForm";

type mode = "view" | "edit" | "create" | null;

const Ailments = () => {
  const [showCreateAilment, setShowCreateAilment] = useState(false);
  const [selectedAilment, setSelectedAilment] = useState<Ailment | null>(null);
  const [formMode, setFormMode] = useState<mode>(null);
  const [ailments, setAilmentList] = useState<Ailment[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAilmentId, setDeleteAilmentId] = useState<
    string | null | undefined
  >(null);
  const [search, setSearch] = useState<string>("");

  const handleError = useErrorHandler();

  const handleViewOrEdit = (ailment: Ailment, mode: mode) => {
    setSelectedAilment(ailment);
    setFormMode(mode);
  };

  const fetchAilmentList = async () => {
    try {
      setIsFetching(true);
      const response = await getAilmentList({ search: search });
      const data = response.data.data.ailmentList;

      setAilmentList(data);
    } catch (error) {
      handleError(error, "Failed to fetch ailment list");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDelete = async () => {
    if (deleteAilmentId) {
      try {
        setIsDeleting(true);
        await deleteAilment(deleteAilmentId);
        toast.success("Ailment deleted successfully");
        fetchAilmentList();
      } catch (error) {
        handleError(error, "Failed to delete ailment");
      } finally {
        setIsDeleting(false);
        setDeleteAilmentId(null);
      }
    }
  };

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, 900);

  useEffect(() => {
    formMode === null && fetchAilmentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMode, search]);

  useEffect(() => {
    if (formMode === null) {
      setSelectedAilment(null);
    }
  }, [formMode]);

  return (
    <div className="flex flex-1 flex-col gap-4  md:gap-8">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardContent>
          <div className="flex flex-1 flex-col gap-4  md:gap-8">
            <div className="flex justify-between items-center w-full mb-2 mt-4 flex-wrap gap-2">
              <div className="relative flex flex-1 items-center">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  onChange={handleSearch}
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>
              {isFetching && (
                <div className="flex gap-1  flex-1 items-start text-muted-foreground">
                  <Spinner />
                  Looking for ailments....
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1 self-end"
                onClick={() => {
                  setFormMode("create");
                  setShowCreateAilment(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Ailment
                </span>
              </Button>
            </div>

            {ailments.length === 0 ? (
              <NoDataFound message="No Ailments found" />
            ) : (
              <div
                className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5  ${
                  isFetching ? "pointer-events-none" : ""
                }`}
              >
                {ailments.map((item: Ailment, index: number) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="text-lg font-semibold">{item.name}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewOrEdit(item, "view")}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewOrEdit(item, "edit")}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteAilmentId(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.description || "No description available"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {formMode !== null && (
        <AilmentForm
          showCreateAilment={showCreateAilment}
          selectedAilment={selectedAilment}
          mode={formMode}
          setMode={setFormMode}
        />
      )}
      <AlertDialog
        open={deleteAilmentId !== null}
        onOpenChange={() => setDeleteAilmentId(null)}
      >
                        <AlertDialogContent className="max-w-[360px] md:max-w-fit rounded-lg">
                        <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              ailment from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAilmentId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
              }}
            >
              Continue
              {isDeleting && <Spinner type="light" />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Ailments;
