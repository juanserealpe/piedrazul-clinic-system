"use client";

import { X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState } from "react";

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

interface ReagendarModalProps {
  appointmentId: string;
  fechaAnterior: string;
  onClose: () => void;
  onConfirm: (appointmentId: string, newDate: string) => void;
}

export default function ReagendarModal({
  appointmentId,
  fechaAnterior,
  onClose,
  onConfirm,
}: ReagendarModalProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isPast = (day: number) =>
    new Date(year, month, day) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const formatSelected = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Reagendar</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Fecha anterior */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Fecha anterior
          </label>
          <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 text-sm select-none">
            {fechaAnterior}
          </div>
        </div>

        {/* Nueva fecha */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Nueva fecha
          </label>
          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm hover:border-blue-400 transition-colors"
          >
            <span className={selectedDate ? "text-gray-800 font-medium" : "text-gray-400"}>
              {selectedDate ? formatSelected(selectedDate) : "Selecciona una fecha"}
            </span>
            <CalendarDays size={16} className="text-blue-500" />
          </button>

          {calendarOpen && (
            <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 rounded-lg hover:bg-gray-100">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold text-sm text-gray-800">
                  {MONTHS[month]} {year}
                </span>
                <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 rounded-lg hover:bg-gray-100">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center px-2 pt-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 text-center px-2 pb-3">
                {cells.map((day, idx) => (
                  <div key={idx} className="p-0.5">
                    {day === null ? <div /> : (
                      <button
                        onClick={() => {
                          if (!isPast(day)) {
                            setSelectedDate(new Date(year, month, day));
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={isPast(day)}
                        className={`
                          w-full aspect-square rounded-lg text-sm font-medium transition-colors
                          ${isPast(day)
                            ? "text-gray-300 cursor-not-allowed"
                            : isSelected(day)
                            ? "bg-blue-600 text-white"
                            : isToday(day)
                            ? "border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                            : "text-gray-700 hover:bg-blue-50"
                          }
                        `}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirmar */}
        <button
          onClick={() => selectedDate && onConfirm(appointmentId, formatSelected(selectedDate))}
          disabled={!selectedDate}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          Confirmar reagendamiento
        </button>
      </div>
    </div>
  );
}
