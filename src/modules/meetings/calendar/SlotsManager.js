




'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSlots } from '@/features/master/slotMasterSlice';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Professional, vibrant shift-based color palette
const shiftColors = {
  Morning: { bg: 'bg-teal-300', border: 'border-teal-500', text: 'text-teal-900' },
  Afternoon: { bg: 'bg-indigo-300', border: 'border-indigo-500', text: 'text-indigo-900' },
  Evening: { bg: 'bg-rose-300', border: 'border-rose-500', text: 'text-rose-900' },
  Night: { bg: 'bg-amber-300', border: 'border-amber-500', text: 'text-amber-900' },
};

// Format date for display
const formatSelectedDate = (view, date) => {
  if (view === 'day') {
    return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (view === 'month') {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

// Get days for the selected view
const getDays = (view, currentDate) => {
  const days = [];
  if (view === 'month') {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDay = new Date(start);
    firstDay.setDate(1 - firstDay.getDay());
    const lastDay = new Date(end);
    lastDay.setDate(end.getDate() + (6 - end.getDay()));
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
  } else if (view === 'week') {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
  } else if (view === 'day') {
    days.push(new Date(currentDate));
  }
  return days;
};

// Get and sort slots for a specific day
const getSlotsForDay = (day, slots) => {
  return [...slots].sort((a, b) => {
    const timeA = new Date(`2000-01-01T${a.startTime}`).getTime();
    const timeB = new Date(`2000-01-01T${b.startTime}`).getTime();
    return timeA - timeB;
  });
};


const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear-3; // You can change this to any earliest year you want
  const endYear = currentYear + 1;

  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return years;
};



export default function SlotsManager() {
  const dispatch = useDispatch();
  const { slots, loading, error } = useSelector((state) => state.slots);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-25T13:11:00+05:30'));
  const [dateRange, setDateRange] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllSlots());
  }, [dispatch]);

  useEffect(() => {
    setDateRange(formatSelectedDate(currentView, currentDate));
  }, [currentView, currentDate]);

  const handleNav = (action) => {
    const newDate = new Date(currentDate);
    if (action === 'prev') {
      if (currentView === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else newDate.setDate(newDate.getDate() - (currentView === 'week' ? 7 : 1));
    } else if (action === 'next') {
      if (currentView === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else newDate.setDate(newDate.getDate() + (currentView === 'week' ? 7 : 1));
    } else if (action === 'today') {
      newDate.setTime(new Date('2025-07-25T13:11:00+05:30').getTime());
      setCurrentView('day');
    }
    setCurrentDate(newDate);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    setCurrentDate(new Date(day));
    setCurrentView('day');
  };

  const days = getDays(currentView, currentDate);
  const yearOptions = getYearOptions();

  const handleSlotClick = (slot, day) => {
    if (slot) {
      const start = new Date(day);
      const end = new Date(day);
      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
      const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
      start.setHours(startHours, startMinutes);
      end.setHours(endHours, endMinutes);
      setSelectedEvent({
        title: `Slot ${slot.slotNo} - ${slot.shift}`,
        start,
        end,
        extendedProps: { shift: slot.shift },
      });
      setIsModalOpen(true);
    }
  };

  const getDayClass = (day) => {
    const dayOfWeek = day.getDay();
    if (currentView !== 'day') {
      if (dayOfWeek === 0) return 'bg-orange-100 border-orange-300'; // Sunday
      if (dayOfWeek === 6) return 'bg-purple-100 border-purple-300'; // Saturday
    }
    return 'bg-white border-gray-300';
  };

  const isToday = (day) => day.toDateString() === new Date('2025-07-25T13:11:00+05:30').toDateString();

  return (
    <div className="min-h-screen border-2 rounded-lg flex justify-center font-inter">
      <Card className="w-full max-w-[100vw]  shadow-lg border-0 rounded-xl bg-white">
        <CardHeader className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-800 font-poppins truncate">
                  {dateRange}
                </CardTitle>
              </div>
              <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className="border border-gray-300 rounded-lg p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer w-20 sm:w-24"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-between">
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('prev')}
                  className="border-gray-300 hover:bg-blue-100 cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('today')}
                  className="border-gray-300 hover:bg-blue-100 cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('next')}
                  className="border-gray-300 hover:bg-blue-100 cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={currentView === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('day')}
                  className={cn(
                    'cursor-pointer text-xs sm:text-sm px-2 sm:px-3',
                    currentView === 'day' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-blue-100'
                  )}
                >
                  Day
                </Button>
                <Button
                  variant={currentView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('week')}
                  className={cn(
                    'cursor-pointer text-xs sm:text-sm px-2 sm:px-3',
                    currentView === 'week' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-blue-100'
                  )}
                >
                  Week
                </Button>
                <Button
                  variant={currentView === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('month')}
                  className={cn(
                    'cursor-pointer text-xs sm:text-sm px-2 sm:px-3',
                    currentView === 'month' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-blue-100'
                  )}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-center text-gray-600 text-sm sm:text-lg font-inter">Loading schedule...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-sm sm:text-lg font-inter">Error: {error}</div>
          ) : (
            <div className={cn(
              'grid gap-1 sm:gap-2',
              currentView === 'month' && 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7',
              currentView === 'week' && 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7',
              currentView === 'day' && 'grid-cols-1'
            )}>
              {currentView !== 'day' && (
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      'text-center font-semibold text-gray-700 font-inter text-xs sm:text-sm',
                      'hidden md:block' // Hide on mobile, show only on sm and larger
                    )}
                  >
                    <span className="hidden sm:inline">{day}</span>
                  </div>
                ))
              )}
              {days.map((day, index) => {
                const daySlots = getSlotsForDay(day, slots);
                const slotCount = daySlots.length;
                return (
                  <div
                    key={index}
                    className={cn(
                      'border p-2 sm:p-3 rounded-lg overflow-y-auto cursor-pointer',
                      getDayClass(day),
                      isToday(day) && currentView === 'day' && 'bg-green-100 border-green-300',
                      currentView === 'month' && 'h-32 xs:h-36 sm:h-40 md:h-44',
                      currentView === 'week' && 'h-32 xs:h-36 sm:h-40 md:h-44',
                      currentView === 'day' && 'h-auto',
                      'hover:shadow-md transition-shadow duration-200'
                    )}
                    onClick={() => currentView !== 'day' && handleDateClick(day)}
                  >
                    <div className="text-xs xs:text-sm sm:text-base font-bold text-gray-800 mb-1 sm:mb-2 font-poppins">
                      {day.getDate()} {currentView !== 'month' && day.toLocaleString('default', { weekday: 'short' })}
                    </div>
                    {currentView === 'day' ? (
                      daySlots.length > 0 ? (
                        daySlots.map((slot) => (
                          <div
                            key={slot.slotNo}
                            className={cn(
                              'mt-1 sm:mt-2 p-1 sm:p-2 rounded-lg text-xs xs:text-sm cursor-pointer shadow-sm',
                              shiftColors[slot.shift]?.bg,
                              shiftColors[slot.shift]?.border,
                              shiftColors[slot.shift]?.text,
                              'hover:bg-opacity-80 transition duration-200'
                            )}
                            onClick={() => handleSlotClick(slot, day)}
                          >
                            {`${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)} | Slot ${slot.slotNo} (${slot.shift})`}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs xs:text-sm text-gray-600 font-inter">No slots available</div>
                      )
                    ) : (
                      <div className="text-xs xs:text-sm text-gray-600 font-inter">
                        {slotCount} slot{slotCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-lg bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold font-poppins">{selectedEvent?.title}</DialogTitle>
            <DialogDescription className="space-y-2 sm:space-y-3 text-gray-600 font-inter text-sm sm:text-base">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <p>
                  <strong>Start:</strong> {selectedEvent?.start?.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <p>
                  <strong>End:</strong> {selectedEvent?.end?.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={cn('w-4 h-4 sm:w-5 sm:h-5 rounded-full', shiftColors[selectedEvent?.extendedProps?.shift]?.bg)}
                />
                <p>
                  <strong>Shift:</strong> {selectedEvent?.extendedProps?.shift}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}