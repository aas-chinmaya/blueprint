'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchBar({ data = [], placeholder = 'Search...', onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const filtered = data.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  }, [query, data]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Button variant="outline" type="button">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Render search results */}
      {results.length > 0 && (
        <ul className="border rounded-md divide-y bg-white dark:bg-muted shadow-md">
          {results.map((item, index) => (
            <li
              key={index}
              className="p-3 cursor-pointer hover:bg-muted transition-all"
              onClick={() => onSelect?.(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {query && results.length === 0 && (
        <p className="text-muted-foreground text-sm">No results found.</p>
      )}
    </div>
  );
}
