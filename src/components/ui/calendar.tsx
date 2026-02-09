import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",

        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",

        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-9 text-xs text-muted-foreground font-normal text-center",

        row: "flex w-full mt-2",

        // IMPORTANT: simple cell → avoids click blocking bug
        cell: "w-9 h-9 text-center text-sm relative",

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "w-9 h-9 p-0 font-normal",
        ),

        day_selected: "bg-primary text-primary-foreground hover:bg-primary",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-40",
        day_disabled: "opacity-40",

        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
