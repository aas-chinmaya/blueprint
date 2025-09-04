



'use client';

import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MeetingCalendar from './MeetingCalendar';
import SlotsManager from './SlotsManager';

export default function CalendarContainer() {
  const [isSlotsView, setIsSlotsView] = useState(false);

  const currentLabel = isSlotsView ? 'Slot' : 'Calendar';

  const tooltipText = `Switch to ${isSlotsView ? 'Calendar' : 'Slot'}`;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{currentLabel}</h2>

        {/* Toggle with Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="relative inline-flex items-center cursor-pointer w-16 h-8">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isSlotsView}
                  onChange={() => setIsSlotsView(!isSlotsView)}
                />
                {/* Background track */}
                <div
                  className={`w-full h-full rounded-full transition-colors duration-300 ${
                    isSlotsView ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                ></div>

                {/* Thumb */}
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center
                    text-[10px] font-medium transition-all duration-300
                    ${isSlotsView ? 'translate-x-[32px] text-blue-600' : 'text-gray-600'}
                  `}
                  style={{ lineHeight: '1rem' }}
                >
             
                </div>
              </label>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Content View */}
      <>
        {isSlotsView ? <SlotsManager /> : <MeetingCalendar />}
      </>
    </div>
  );
}
