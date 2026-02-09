import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  date?: Date;
  onSelect: (date?: Date) => void;
  fromDate?: Date;
  toDate?: Date;
  showMonthYearDropdowns?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  fromDate,
  toDate,
  showMonthYearDropdowns,
}: DatePickerProps) {
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={onSelect}
      fromDate={fromDate}
      toDate={toDate}
      disabled={(date) => {
        if (fromDate && date < fromDate) {
          return true;
        }
        if (toDate && date > toDate) {
          return true;
        }
        return false;
      }}
      captionLayout={showMonthYearDropdowns ? "dropdown" : "buttons"}
    />
  );
}
