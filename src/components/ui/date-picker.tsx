import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useState,
} from "react";

const DatePicker = ({
  date,
  setDate,
  placeholder = "Pick a date",
  disabled,
}: {
  date: Date | undefined;
  placeholder?: string | null | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
}) => {
  const [showCalender, setShowCalender] = useState(false);

  const handleReset = (e: SyntheticEvent) => {
    e.stopPropagation();
    setDate(undefined);
  };
  return (
    <Popover open={showCalender} onOpenChange={setShowCalender}>
      <PopoverTrigger asChild className="w-full min-w-[250px]">
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-between text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>{placeholder}</span>}
            </div>
            {date ? (
              <X
                onClick={handleReset}
                className="h-4 w-4 hover:scale-125 ml-4"
              />
            ) : null}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(e) => {
            setDate(e);
            setShowCalender(false);
          }}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
