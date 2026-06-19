"use client";

import { useState, useEffect, useRef } from "react";

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface SearchBarProps {
  onSelect: (lat: number, lng: number, name: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
        { headers: { "User-Agent": "Wanderlog/1.0" } }
      );
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    setQuery(result.display_name.split(",")[0]);
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search places..."
          className="w-full rounded-lg border bg-white px-4 py-2 pl-10 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
            >
              <p className="font-medium">{result.display_name.split(",")[0]}</p>
              <p className="text-xs text-gray-500">{result.display_name.split(",").slice(1, 3).join(",")}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
