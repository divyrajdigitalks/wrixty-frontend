"use client";

import React, { useState, useMemo, useRef, useEffect, useId } from "react";
import { Loader } from "./Loader";
import { KeyboardArrowDown, Search, Close } from "@mui/icons-material";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string | number;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  error?: string;
  helperText?: string;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  isLoading = false,
  className = "",
  disabled,
  placeholder = "Select option",
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();

  const isDisabled = disabled || isLoading;

  // Find the currently selected option to display its label
  const selectedOption = useMemo(() => 
    options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange({ target: { value: optionValue, name } });
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!isDisabled) setIsOpen(!isOpen);
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 text-left ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={isDisabled}
          className={`
            w-full flex items-center justify-between px-4 py-2.5 text-sm bg-white
            border border-border-ui text-text-primary rounded-lg transition-all duration-200
            outline-none text-left
            ${isOpen ? "border-primary-teal ring-1 ring-primary-teal/30" : "hover:border-primary-teal/50"}
            ${error ? "border-error focus:ring-error/20" : ""}
            ${isDisabled ? "bg-background text-text-secondary cursor-not-allowed opacity-70" : "cursor-pointer"}
          `}
        >
          <span className={`truncate ${!selectedOption ? "text-text-secondary/60" : ""}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader size="sm" className="text-primary-teal" />
            ) : (
              <KeyboardArrowDown 
                className={`text-text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                style={{ fontSize: 20 }}
              />
            )}
          </div>
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-border-ui rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search Input */}
            <div className="p-2 border-b border-border-ui/50 flex items-center gap-2 bg-zinc-50/50">
              <Search className="text-text-secondary w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-secondary/50 py-1"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Close style={{ fontSize: 14 }} />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto py-1 scrollbar-thin">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full text-left px-4 py-2.5 text-xs transition-colors
                      ${String(opt.value) === String(value) 
                        ? "bg-primary-teal/10 text-primary-teal font-bold" 
                        : "text-text-primary hover:bg-zinc-50"}
                    `}
                  >
                    {opt.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-xs text-text-secondary italic">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-error">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-text-secondary">{helperText}</span>
      )}
    </div>
  );
};
