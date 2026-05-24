"use client";

import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  disabled?: boolean;
  fromDate?: Date;
}

export function DatePicker({ value, onChange, disabled, fromDate }: DatePickerProps) {
  const min = fromDate ? fromDate.toISOString().slice(0, 10) : undefined;

  return (
    <input
      type="date"
      value={value ?? ""}
      min={min}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[color-scheme:dark]"
      )}
    />
  );
}
