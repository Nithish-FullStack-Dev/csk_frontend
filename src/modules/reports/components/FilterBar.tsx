import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Search } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { ReportFilters, ReportGroupBy } from "../types";

interface FilterBarProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  showSearch?: boolean;
}

export function FilterBar({ filters, onFiltersChange, showSearch = true }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickFilter = (preset: string) => {
    const today = new Date();
    let dateFrom: Date;
    let dateTo = today;

    switch (preset) {
      case "today":
        dateFrom = today;
        break;
      case "week":
        dateFrom = startOfWeek(today);
        break;
      case "month":
        dateFrom = startOfMonth(today);
        break;
      case "quarter":
        dateFrom = startOfQuarter(today);
        break;
      case "year":
        dateFrom = startOfYear(today);
        break;
      case "30days":
        dateFrom = subDays(today, 30);
        break;
      default:
        return;
    }

    onFiltersChange({ ...filters, dateFrom, dateTo });
  };

  const handleGroupByChange = (groupBy: ReportGroupBy) => {
    onFiltersChange({ ...filters, groupBy });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("today")}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("week")}
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("month")}
          >
            This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("quarter")}
          >
            This Quarter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("year")}
          >
            YTD
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter("30days")}
          >
            Last 30 Days
          </Button>
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(filters.dateFrom, "MMM dd, yyyy")} - {format(filters.dateTo, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: filters.dateFrom, to: filters.dateTo }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onFiltersChange({ ...filters, dateFrom: range.from, dateTo: range.to });
                  setIsOpen(false);
                }
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Group by:</span>
          <Select value={filters.groupBy} onValueChange={handleGroupByChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>
    </div>
  );
}
