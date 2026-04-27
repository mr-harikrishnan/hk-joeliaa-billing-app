'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomCalendarProps {
  selectedDate: string; // ISO string YYYY-MM-DD
  onSelect: (date: string) => void;
  maxDate?: string; // ISO string YYYY-MM-DD
}

export default function CustomCalendar({ selectedDate, onSelect, maxDate }: CustomCalendarProps) {
  const [currentViewDate, setCurrentViewDate] = useState(new Date(selectedDate || new Date()));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const viewMonth = currentViewDate.getMonth();
  const viewYear = currentViewDate.getFullYear();

  // Calendar Logic
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const days = [];
  // Fill leading empty slots
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Fill actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(viewYear, viewMonth, i));
  }

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(viewYear, viewMonth + 1, 1);
    if (maxDate && nextMonth > new Date(maxDate)) return;
    setCurrentViewDate(nextMonth);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatLocalISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSelected = (date: Date) => {
    return formatLocalISO(date) === selectedDate;
  };

  const isFuture = (date: Date) => {
    if (!maxDate) return false;
    const max = new Date(maxDate);
    max.setHours(0, 0, 0, 0);
    return date > max;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 select-none animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h4 className="text-sm font-black text-slate-800 tracking-tight">{monthNames[viewMonth]}</h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewYear}</span>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={handleNextMonth}
            disabled={!!(maxDate && new Date(viewYear, viewMonth + 1, 1) > new Date(maxDate))}
            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="h-9 w-9" />;
          
          const future = isFuture(date);
          const selected = isSelected(date);
          const localISO = formatLocalISO(date);
          const isToday = localISO === formatLocalISO(new Date());

          return (
            <button
              key={date.getTime()}
              disabled={future}
              onClick={() => onSelect(localISO)}
              className={`
                h-9 w-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative
                ${future 
                  ? 'text-slate-100 cursor-not-allowed' 
                  : selected 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-100 scale-110 z-10' 
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-600 active:scale-90'}
                ${isToday && !selected ? 'border-2 border-teal-100 text-teal-600' : ''}
              `}
            >
              {date.getDate()}
              {isToday && !selected && (
                <div className="absolute bottom-1 w-1 h-1 bg-teal-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
        <button 
            onClick={() => onSelect(formatLocalISO(new Date()))}
            className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
        >
            Today
        </button>
        <div className="flex items-center space-x-1.5 text-slate-300">
            <CalendarIcon size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{selectedDate}</span>
        </div>
      </div>
    </div>
  );
}
