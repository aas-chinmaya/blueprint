'use client';
import React from 'react';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ data, groupBy, groupOrder, fields, onView }) {
  const grouped = {};
  groupOrder.forEach(key => {
    grouped[key] = [];
  });

  data.forEach(item => {
    const groupKey = item[groupBy];
    if (grouped[groupKey]) grouped[groupKey].push(item);
  });

  return (
    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto p-4">
      {groupOrder.map(group => (
        <KanbanColumn
          key={group}
          title={group}
          items={grouped[group]}
          fields={fields}
          onView={onView}
        />
      ))}
    </div>
  );
}
