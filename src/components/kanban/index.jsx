'use client';

import KanbanBoard from './KanbanBoard';

export default function KanbanView({ data, config, onView }) {
  const { groupBy, groupOrder, fields } = config;

  return (
    <KanbanBoard
      data={data}
      groupBy={groupBy}
      groupOrder={groupOrder}
      fields={fields}
      onView={onView}
    />
  );
}
