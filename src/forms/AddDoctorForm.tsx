import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dispatch, SetStateAction } from "react";

const AddDoctorForm = ({
  showAddDoctorForm,
  setShowAddDoctorForm,
}: {
  showAddDoctorForm: boolean;
  setShowAddDoctorForm: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Sheet open={showAddDoctorForm} onOpenChange={setShowAddDoctorForm}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Doctor</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={() => setShowAddDoctorForm(false)}>
              Save changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddDoctorForm;
