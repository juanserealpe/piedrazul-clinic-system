"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Doctor { id: string; name: string; lastnames: string; }
interface Props {
  open: boolean; onClose: () => void;
  doctors: Doctor[]; onSelect: (doctor: Doctor) => void;
}

export default function DoctorsSelectModal({ open, onClose, doctors, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl" style={{ borderRadius: "16px", padding: "28px" }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: "1.2rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            👨‍⚕️ Seleccionar Médico
          </DialogTitle>
        </DialogHeader>
        <div style={{ maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          {doctors.map((doctor) => (
            <div key={doctor.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "2px solid var(--pz-border)", borderRadius: "10px",
              padding: "14px 18px", background: "var(--pz-cream)",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--pz-green-mid)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--pz-border)")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "42px", height: "42px",
                  background: "var(--pz-green-light)",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem"
                }}>👨‍⚕️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>Dr. {doctor.name} {doctor.lastnames}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--pz-text-soft)", fontFamily: "monospace" }}>{doctor.id}</div>
                </div>
              </div>
              <button onClick={() => onSelect(doctor)} className="pz-btn-primary" style={{ padding: "9px 18px", fontSize: "0.88rem" }}>
                Seleccionar →
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
