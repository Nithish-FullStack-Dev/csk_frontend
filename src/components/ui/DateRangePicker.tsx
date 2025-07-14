import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onChange?.(range)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDate(undefined)
    onChange?.(undefined)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-white hover:bg-gray-50 border-gray-200 shadow-sm",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {date?.from ? (
              date.to ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </span>
                  {date.from && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-gray-200 ml-auto"
                      onClick={handleClear}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ) : (
                <span className="text-gray-900">{format(date.from, "LLL dd, y")}</span>
              )
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white shadow-lg border border-gray-200" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="p-4 pointer-events-auto"
          />
          <div className="flex items-center justify-between p-4 pt-0 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear
            </Button>
            <div className="text-sm text-gray-500">
              {date?.from && date?.to && (
                `${Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} days selected`
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}