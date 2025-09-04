

'use client';

import React from 'react';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ title, items, fields, onView }) {
  return (
    <div className="flex-1 min-w-[260px] max-w-sm border border-border rounded-lg bg-card text-card-foreground p-3 shadow-sm">
      <h2 className="text-sm font-semibold mb-3">
        {title} <span className="text-muted-foreground">({items.length})</span>
      </h2>
      
      <div className="space-y-3 max-h-[75vh] overflow-y-auto scrollbar-thin pr-1">
        {items.map(item => (
          <KanbanCard
            key={item.id || item.task_id}
            data={item}
            fields={fields}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
}
