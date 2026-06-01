"use client";
import { X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState } from "react";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

interface Props {
  appointmentId: string; fechaAnterior: string;
  onClose: () => void; onConfirm: (appointmentId: string, newDate: string) => void;
}

export default function ReagendarModal({ appointmentId, fechaAnterior, onClose, onConfirm }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const isPast = (day: number) => new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isSelected = (day: number) => !!selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  const formatSelected = (date: Date) => `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,"0")}-${date.getDate().toString().padStart(2,"0")}`;

  return (
    <div className="pz-overlay" onClick={onClose}>
      <div className="pz-modal" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            🔄 Reagendar Cita
          </h2>
          <button onClick={onClose} style={{ background: "var(--pz-sand)", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Fecha anterior */}
        <div style={{ marginBottom: "16px" }}>
          <label className="pz-label">Fecha anterior</label>
          <div style={{ background: "var(--pz-sand)", borderRadius: "8px", padding: "12px 16px", color: "var(--pz-text-mid)", fontSize: "0.95rem", border: "1px solid var(--pz-border)" }}>
            {fechaAnterior}
          </div>
        </div>

        {/* Nueva fecha */}
        <div style={{ marginBottom: "20px" }}>
          <label className="pz-label">Nueva fecha</label>
          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", background: "var(--pz-white)",
              border: `2px solid ${selectedDate ? "var(--pz-green)" : "var(--pz-border)"}`,
              borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem",
            }}
          >
            <span style={{ color: selectedDate ? "var(--pz-text)" : "var(--pz-text-soft)", fontWeight: selectedDate ? 600 : 400 }}>
              {selectedDate ? `${formatSelected(selectedDate)}` : "Selecciona una fecha..."}
            </span>
            <CalendarDays size={18} style={{ color: "var(--pz-green)" }} />
          </button>

          {calendarOpen && (
            <div style={{ marginTop: "8px", border: "2px solid var(--pz-border)", borderRadius: "12px", background: "var(--pz-white)", overflow: "hidden", boxShadow: "var(--pz-shadow)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--pz-border)", background: "var(--pz-green-light)" }}>
                <button onClick={() => setViewDate(new Date(year, month-1, 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px" }}>
                  <ChevronLeft size={18} style={{ color: "var(--pz-green)" }} />
                </button>
                <span style={{ fontWeight: 700, color: "var(--pz-green)", fontSize: "0.95rem" }}>{MONTHS[month]} {year}</span>
                <button onClick={() => setViewDate(new Date(year, month+1, 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px" }}>
                  <ChevronRight size={18} style={{ color: "var(--pz-green)" }} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", textAlign: "center", padding: "8px 8px 0" }}>
                {DAYS.map((d) => (
                  <div key={d} style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--pz-text-soft)", padding: "4px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", textAlign: "center", padding: "0 8px 12px" }}>
                {cells.map((day, idx) => (
                  <div key={idx} style={{ padding: "2px" }}>
                    {day === null ? <div /> : (
                      <button
                        onClick={() => { if (!isPast(day)) { setSelectedDate(new Date(year, month, day)); setCalendarOpen(false); } }}
                        disabled={isPast(day)}
                        style={{
                          width: "100%", aspectRatio: "1", borderRadius: "8px",
                          fontSize: "0.88rem", fontWeight: 600,
                          border: isToday(day) ? "2px solid var(--pz-green-mid)" : "none",
                          background: isSelected(day) ? "var(--pz-green)" : "transparent",
                          color: isPast(day) ? "#ccc" : isSelected(day) ? "white" : isToday(day) ? "var(--pz-green)" : "var(--pz-text)",
                          cursor: isPast(day) ? "not-allowed" : "pointer",
                          transition: "background 0.12s",
                        }}
                      >{day}</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => selectedDate && onConfirm(appointmentId, formatSelected(selectedDate))}
          disabled={!selectedDate}
          className="pz-btn-primary"
          style={{ width: "100%", justifyContent: "center", opacity: !selectedDate ? 0.5 : 1, fontSize: "1rem", padding: "14px" }}
        >
          ✓ Confirmar reagendamiento
        </button>
      </div>
    </div>
  );
}
