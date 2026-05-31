"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";

interface Doctor {
  id: string;
  name: string;
  lastnames: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onSelect: (doctor: Doctor) => void;
}

export default function DoctorsSelectModal({
  open,
  onClose,
  doctors,
  onSelect,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Seleccionar médico</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-auto">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="font-medium">
                  {doctor.name} {doctor.lastnames}
                </p>
              </div>

              <Button onClick={() => onSelect(doctor)}>
                Seleccionar
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}