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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import TimePicker from "@/components/ui/timepicker";
import useErrorHandler from "@/hooks/useError";
import { createSLot, deleteSlot, getSlotList } from "@/https/admin-service";
import { Slots } from "@/types";
import { isEndTimeSmallerThanStart } from "@/utils";
import { Info, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NoDataFound from "../NoDataFound";

type mode = "view" | "edit" | "create" | null;

const Slot = () => {
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slots | null>(null);
  const [formMode, setFormMode] = useState<mode>(null);
  const [slotList, setSlotList] = useState<Slots[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null | undefined>(
    null
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleError = useErrorHandler();

  const fetchSlotList = async () => {
    try {
      setIsFetching(true);
      const response = await getSlotList();
      const data = response.data.data.slotList;
      setSlotList(data);
    } catch (error) {
      handleError(error, "Failed to fetch slot list");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDelete = async () => {
    if (deleteSlotId) {
      try {
        setIsDeleting(true);
        await deleteSlot(deleteSlotId);
        toast.success("Slot deleted successfully");
        fetchSlotList();
      } catch (error) {
        handleError(error, "Failed to delete slot");
      } finally {
        setIsDeleting(false);
        setDeleteSlotId(null);
      }
    }
  };

  const handleCreateSlot = async () => {
    try {
      setSubmitting(true);
      await createSLot(selectedSlot!);
      toast.success("Slot created successfully");
      setShowCreateSlot(false);
      setSelectedSlot(null);
      fetchSlotList();
    } catch (error) {
      handleError(error, "Failed to create slot");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    formMode === null && fetchSlotList();
  }, [formMode]);

  useEffect(() => {
    if (formMode === null) {
      setSelectedSlot(null);
    }
  }, [formMode]);

  const isvalidSlotTime = () => {
    if (selectedSlot?.startTime && selectedSlot.endTime) {
      if (selectedSlot.startTime === selectedSlot.endTime) {
        return {
          message: "Start time and end time should not be same",
          error: true,
        };
      }
      if (
        isEndTimeSmallerThanStart(selectedSlot.startTime, selectedSlot.endTime)
      ) {
        return {
          message: "End time should be greater than start time",
          error: true,
        };
      }
    }
    return {
      message: "",
      error: false,
    };
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardContent>
          <div className="flex flex-1 flex-col gap-4  md:gap-8">
            <div className="flex justify-between items-center w-full mb-2 mt-4 flex-wrap">
              <div className="relative flex flex-1 justify-center items-center">
                {isFetching && (
                  <div className="flex gap-1  items-start text-muted-foreground">
                    <Spinner />
                    Looking for slots....
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => {
                  setFormMode("create");
                  setShowCreateSlot(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Slot
                </span>
              </Button>
            </div>

            {slotList.length === 0 ? (
              <NoDataFound message="No Slots Found" />
            ) : (
              <div
                className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5  ${
                  isFetching ? "pointer-events-none" : ""
                }`}
              >
                {slotList.map((item: Slots, index: number) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <h4 className="text-m">
                          {item.startTime} - {item.endTime}
                        </h4>
                        <Button
                          onClick={() => setDeleteSlotId(item.id)}
                          size="icon"
                          variant={"outline"}
                          className="hover:border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AlertDialog
        open={deleteSlotId !== null}
        onOpenChange={() => setDeleteSlotId(null)}
      >
        <AlertDialogContent className="max-w-[360px] md:max-w-[500px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              slot from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSlotId(null)}>
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
      <Dialog
        open={showCreateSlot}
        onOpenChange={(open) => {
          setShowCreateSlot(open);
          setSelectedSlot(null);
        }}
      >
        <DialogContent
          className="max-w-[360px] md:max-w-[500px] rounded-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add Slot</DialogTitle>
            <DialogDescription>Add New Slot</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <Label>Start Time<span className="text-red-500 ml-1">*</span></Label>
              <TimePicker
                onTimeChange={(time) =>
                  setSelectedSlot((prev: Slots | null) => ({
                    ...prev,
                    endTime: prev?.endTime || null,
                    startTime: time,
                  }))
                }
              />
            </div>
            <div>
              <Label>End Time<span className="text-red-500 ml-1">*</span></Label>
              <TimePicker
                onTimeChange={(time) =>
                  setSelectedSlot((prev: Slots | null) => ({
                    ...prev,
                    endTime: time,
                    startTime: prev?.startTime || null,
                  }))
                }
              />
            </div>
          </div>
          {isvalidSlotTime().error && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              {isvalidSlotTime().message}
            </p>
          )}
          <DialogFooter>
            <Button
              disabled={
                isvalidSlotTime().error ||
                !selectedSlot?.endTime ||
                !selectedSlot?.startTime ||
                submitting
              }
              onClick={() => handleCreateSlot()}
            >
              Save
              {submitting && <Spinner type="light" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Slot;
