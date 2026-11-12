import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export interface StepperProps {
  currentStep: number; // 1 to 7
  isLoading?: boolean;
  onStepClick?: (stepNumber: number) => void;
}

export const STAGE_STEPS = [
  { step: 1, label: 'Input', desc: 'Unggah & Ekstraksi' },
  { step: 2, label: 'Analisis', desc: 'Bedah Dokumen' },
  { step: 3, label: 'Penyaringan', desc: 'Klasifikasi KIP' },
  { step: 4, label: 'Generasi', desc: '2 Produk Komunikasi' },
  { step: 5, label: 'Verifikasi', desc: 'Audit Berbasis Sumber' },
  { step: 6, label: 'Human Review', desc: 'Pemeriksaan Manual' },
  { step: 7, label: 'Output', desc: 'Siap Ekspor / Publikasi' },
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  isLoading = false,
  onStepClick,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs overflow-x-auto">
      <div className="flex items-center justify-between min-w-[620px] px-2">
        {STAGE_STEPS.map((s, idx) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          const isPending = currentStep < s.step;

          return (
            <React.Fragment key={s.step}>
              {/* Node Tahap */}
              <button
                type="button"
                disabled={!onStepClick || isPending}
                onClick={() => onStepClick && onStepClick(s.step)}
                className={`flex flex-col items-center group relative text-center focus:outline-none transition-all ${
                  isPending ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#0B1F3A] text-white ring-4 ring-[#0B1F3A]/15 shadow-sm'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isCurrent && isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D32F2F]" />
                  ) : isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </div>

                <div className="mt-2 flex flex-col items-center">
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-[#0B1F3A]'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                    {s.desc}
                  </span>
                </div>
              </button>

              {/* Penghubung Garis Antar Tahap */}
              {idx < STAGE_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
