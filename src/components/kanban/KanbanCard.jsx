
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FiEye } from 'react-icons/fi';

export default function KanbanCard({ data, fields, onView }) {
  return (
    <div className="rounded-md border border-border bg-background text-foreground px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="text-sm font-medium truncate">{data[fields.title] || 'Untitled Task'}</div>
      
      {fields.description && (
        <p className="text-xs text-muted-foreground truncate mt-1">
          {data[fields.description] || 'No description'}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-2">
        {fields.badge && (
          <Badge
            variant="outline"
            className="text-xs font-medium border-muted-foreground text-muted-foreground"
          >
            {data[fields.badge]}
          </Badge>
        )}

        <button
          onClick={() => onView(data)}
          className="text-info hover:text-info-foreground transition-colors"
          title="View Task"
        >
          <FiEye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
