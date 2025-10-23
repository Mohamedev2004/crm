"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  /* CardFooter, */
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Appointment = {
  id: number
  appointment_name: string
  appointment_phone: string
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled"
  appointment_date: string
}

export default function AppointmentCalendar() {
  const today = new Date()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [month, setMonth] = useState<number>(today.getMonth())
  const [year, setYear] = useState<number>(today.getFullYear())
  const [availableYears, setAvailableYears] = useState<Record<number, number[]>>({})
  const [loading, setLoading] = useState(true)

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const { data } = await axios.get(`/admin/available-appointment-dates`)
        setAvailableYears(data)

        const years = Object.keys(data).map(Number).sort((a, b) => a - b)
        if (!years.includes(year)) {
          setYear(years[0])
          setMonth((data[years[0]][0] ?? 1) - 1)
        } else if (!data[year].includes(month + 1)) {
          setMonth((data[year][0] ?? 1) - 1)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchAvailableDates()
  }, [month, year])

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`/admin/appointment-calendar`, {
          params: { month: month + 1, year },
        })
        setAppointments(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        console.error(err)
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [month, year])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const appointmentMap: Record<number, Appointment[]> = {}
  appointments.forEach(app => {
    const date = new Date(app.appointment_date)
    if (date.getMonth() === month && date.getFullYear() === year) {
      const day = date.getDate()
      if (!appointmentMap[day]) appointmentMap[day] = []
      appointmentMap[day].push(app)
    }
  })

  /* const pendingCount = appointments.filter(app => app.status === "Pending").length
  const confirmedCount = appointments.filter(app => app.status === "Confirmed").length */

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
        <CardDescription>
          View appointments for each month and year.
        </CardDescription>
      </CardHeader>

      {/* Year & Month Selector */}
      <div className="flex flex-wrap items-center justify-end gap-4 px-4 py-2 w-full">
        <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
          <SelectTrigger className="sm:w-[120px] w-full">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(availableYears)
              .map(Number)
              .sort((a, b) => a - b)
              .map((y) => (
                <SelectItem key={`year-${y}`} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={String(month)} onValueChange={(val) => setMonth(Number(val))}>
          <SelectTrigger className="sm:w-[120px] w-full">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {availableYears[year]?.sort((a, b) => a - b).map((m) => (
              <SelectItem key={`month-${m}`} value={String(m - 1)}>
                {months[m - 1]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CardContent className="-mt-4">
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <span className="text-muted-foreground cursor-pointer text-sm animate-pulse">
              Loading appointments...
            </span>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-6">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                  <div key={`weekday-${i}`} className="font-semibold text-sm">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {Array.from({ length: (firstDay + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                  const day = dayIdx + 1
                  const dayAppointments = appointmentMap[day] || []
                  const status = dayAppointments.map(a => a.status)
                  const isDark = document.documentElement.classList.contains("dark")

                  let bg = isDark ? "bg-[#18181B]" : "bg-[#F4F4F6]"
                  if (status.includes("Pending")) bg = isDark ? "bg-[#D08700]" : "bg-[#fef08a]"
                  else if (status.includes("Confirmed")) bg = isDark ? "bg-[#0a7135]" : "bg-[#bbf7d1]"

                  return (
                    <Tooltip key={day}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-8 flex items-center shadow-md justify-center text-sm text-black cursor-pointer dark:text-white rounded-lg font-medium ${bg}`}
                        >
                          {day}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {dayAppointments.length === 0 ? "No Appointments" : (
                          <div className="flex flex-col gap-1">
                            {dayAppointments.map(app => (
                              <div key={app.id} className="flex flex-col">
                                <span className="font-semibold">{app.appointment_name}</span>
                                <span className="text-xs">{app.appointment_phone}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>

      {/* <CardFooter className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#D08700]" />
            <span className="font-semibold text-[#D08700] text-xs">Pending:</span>
            <span className="text-sm font-semibold text-[#D08700]">{pendingCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#0A5D2E] dark:bg-[#00C951]" />
            <span className="font-semibold text-[#0A5D2E] dark:text-[#00C951] text-sm">
              Confirmed:
            </span>
            <span className="text-sm text-[#0A5D2E] dark:text-[#00C951] font-semibold">
              {confirmedCount}
            </span>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  )
}
