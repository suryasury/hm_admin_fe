import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
const monthMapping: { [key: string]: number } = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month);
  };

  const handleMonthSelect = (month: string) => {
    console.log(month);

    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(monthMapping[month]);
    setSelectedMonth(newMonth);
  };

  const handleYearSelect = (year: string) => {
    const newYear = new Date(selectedMonth);
    newYear.setFullYear(parseInt(year));
    setSelectedMonth(newYear);
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() - 1);
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + 1);
    setSelectedMonth(newMonth);
  };

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );
   const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 + 50 },
    (_, i) => 1900 + i
  );

  const CustomCaption = () => (
    <div className="flex justify-center items-center mb-4">
      <button
        onClick={handlePrevMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 mr-2"
        )}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <Select
        value={months[selectedMonth.getMonth()]}
        onValueChange={(month: string) => handleMonthSelect(month)}
      >
        <SelectTrigger className=" border rounded-lg p-1 bg-transparent w-[94px] opacity-50 hover:opacity-100 mr-2">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent className="min-w-0">
          <SelectGroup className="max-w-fit">
            {months.map((month) => (
              <SelectItem value={String(month)} key={month}>
                {month}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={selectedMonth.getFullYear().toString()}
        onValueChange={(year: string) => handleYearSelect(year)}
      >
        <SelectTrigger className=" border rounded-lg p-1 bg-transparent w-fit opacity-50 hover:opacity-100 mr-2">
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent className="min-w-0">
          <SelectGroup className="max-w-fit">
            {years.map((year) => (
              <SelectItem value={year.toString()} key={year}>
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <button
        onClick={handleNextMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 ml-2"
        )}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={selectedMonth}
      onMonthChange={handleMonthChange}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
