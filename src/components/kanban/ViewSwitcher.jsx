'use client';

import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutList, LayoutKanban, Calendar, Image } from 'lucide-react';

const viewIcons = {
  list: <LayoutList className="w-4 h-4" />,
  kanban: <LayoutKanban className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  card: <Image className="w-4 h-4" />,
};

export default function ViewSwitcher({
  views = ['list', 'kanban'],
  defaultView = 'list',
  renderView,
}) {
  const [view, setView] = useState(defaultView);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end mb-2">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(val) => val && setView(val)}
          className="bg-muted p-1 rounded-md"
        >
          {views.map((v) => (
            <ToggleGroupItem key={v} value={v} className="px-3 py-2 capitalize">
              {viewIcons[v] || null}
              <span className="ml-1 hidden sm:inline">{v}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Render selected view */}
      {renderView(view)}
    </div>
  );
}
