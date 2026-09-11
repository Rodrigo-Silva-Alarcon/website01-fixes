"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return format(date, "dd/MM/yyyy")
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(formatDate(value))

  // Actualizar input cuando cambie el valor externo
  React.useEffect(() => {
    setInputValue(formatDate(value))
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)
    
    // Intentar parsear la fecha desde el input
    if (inputVal) {
      // Intentar diferentes formatos de fecha
      const formats = [
        /^\d{2}\/\d{2}\/\d{4}$/, // dd/MM/yyyy
        /^\d{4}-\d{2}-\d{2}$/,   // yyyy-MM-dd
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // d/M/yyyy
      ]
      
      let parsedDate: Date | undefined
      
      if (formats[0].test(inputVal)) {
        // dd/MM/yyyy
        const [day, month, year] = inputVal.split('/')
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else if (formats[1].test(inputVal)) {
        // yyyy-MM-dd
        const [year, month, day] = inputVal.split('-')
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else if (formats[2].test(inputVal)) {
        // d/M/yyyy
        const [day, month, year] = inputVal.split('/')
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      
      if (parsedDate && isValidDate(parsedDate)) {
        onChange?.(parsedDate)
      }
    } else {
      onChange?.(undefined)
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange?.(date)
    setInputValue(formatDate(date))
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn("pr-10", className)}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Seleccionar fecha</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            captionLayout="dropdown"
            showOutsideDays={true}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
