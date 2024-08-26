import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import useErrorHandler from "@/hooks/useError";
import useWindowSize from "@/hooks/useWindowSize";
import { createAilment, updateAilment } from "@/https/admin-service";
import { Ailment } from "@/types";
import { dirtyValues } from "@/utils";
import { toast } from "sonner";
import { ailmentSchema } from "./schema";

const AilmentForm = ({
  setMode,
  selectedAilment,
  mode,
}: {
  showCreateAilment: boolean;
  setMode: Dispatch<SetStateAction<"view" | "create" | "edit" | null>>;
  selectedAilment: Ailment | null;
  mode: "view" | "edit" | "create";
}) => {
  const size = useWindowSize();
  const side = size.width && size.width <= 768 ? "bottom" : "right";
  const [isEditMode, setIsEditMode] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  const handleError = useErrorHandler();

  const form = useForm<Ailment>({
    resolver: zodResolver(ailmentSchema),
    defaultValues: selectedAilment || {},
  });

  const onSubmit: SubmitHandler<Ailment> = async (data: Ailment) => {
    try {
      setSubmitting(true);
      if (isEditMode) {
        await onEdit();
        toast.success("Successfully updated ailment");
      } else {
        await createAilment(data);
        toast.success("Successfully created ailment");
      }
      handleCloseForm(false);
    } catch (error) {
      handleError(error, "Failed to create/update ailment");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = async () => {
    const payload: Ailment = dirtyValues(
      form.formState.dirtyFields,
      form.getValues()
    ) as Ailment;
    return await updateAilment(payload, selectedAilment?.id as string);
  };

  const handleCloseForm = (isOpen: boolean) => {
    if (!isOpen) {
      setMode(null);
      form.reset();
      setIsEditMode(false);
    }
  };

  return (
    <Sheet open={mode !== null} onOpenChange={handleCloseForm}>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Add Ailment"
              : mode === "edit" || isEditMode
              ? "Edit Ailment"
              : "View Ailment"}
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="grid gap-4 p-0">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ailment Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ailment Name"
                          {...field}
                          disabled={mode === "view" && !isEditMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description<span className="text-muted-foreground ml-1">(optional)</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Description"
                          {...field}
                          disabled={mode === "view" && !isEditMode}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <SheetFooter>
                {mode === "view" && !isEditMode ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditMode(true);
                    }}
                  >
                    Edit
                    {submitting && <Spinner type="light" />}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      (mode === "edit" || isEditMode) && !form.formState.isDirty
                    }
                  >
                    {mode === "edit" || isEditMode ? "Update" : "Submit"}
                    {submitting && <Spinner type="light" />}
                  </Button>
                )}
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AilmentForm;
