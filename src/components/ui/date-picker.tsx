import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  date?: Date;
  onSelect: (date?: Date) => void;
  fromDate?: Date;
  showMonthYearDropdowns?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  fromDate,
  showMonthYearDropdowns,
}: DatePickerProps) {
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={onSelect}
      fromDate={fromDate}
      captionLayout={showMonthYearDropdowns ? "dropdown" : "buttons"}
    />
  );
}
