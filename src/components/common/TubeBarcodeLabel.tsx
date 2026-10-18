import React from 'react';
import { generateBarcodeBars } from '../../utils/barcode.ts';
import { Sample } from '../../types/index.ts';
import { Printer } from 'lucide-react';

interface TubeBarcodeLabelProps {
  sample: Sample;
  patientDob?: string;
  patientGender?: string;
  testCodes?: string[];
  labName?: string;
  onPrint?: () => void;
}

export const TubeBarcodeLabel: React.FC<TubeBarcodeLabelProps> = ({
  sample,
  patientDob,
  patientGender = 'M',
  testCodes = ['NFS', 'GLYC'],
  labName = 'EXTREMELAB NEXT',
  onPrint
}) => {
  const { bars, totalWidth } = generateBarcodeBars(sample.sampleNumber, 36);

  const handlePrintLabel = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 50x30mm thermal label container */}
      <div
        id={`tube-label-${sample.id}`}
        className="w-80 h-44 bg-white border-2 border-dashed border-slate-400 p-2.5 rounded-lg text-slate-900 font-mono shadow-md flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between text-[10px] font-sans border-b border-slate-300 pb-1">
          <span className="font-extrabold uppercase text-blue-900 tracking-tight">{labName}</span>
          <span className="text-[9px] text-slate-500">{sample.collectionDate || new Date().toISOString().split('T')[0]}</span>
        </div>

        {/* Patient Identity */}
        <div className="text-[11px] font-sans leading-tight mt-0.5">
          <div className="font-black text-slate-900 uppercase truncate">
            {sample.patientName}
          </div>
          <div className="text-[10px] text-slate-600 flex justify-between">
            <span>N° {sample.patientId || sample.orderNumber}</span>
            <span>({patientGender} / {patientDob ? patientDob.slice(0, 4) : 'Adulte'})</span>
          </div>
        </div>

        {/* Barcode Graphic */}
        <div className="flex flex-col items-center my-0.5">
          <svg
            viewBox={`0 0 ${totalWidth} 40`}
            className="w-full h-8"
            preserveAspectRatio="none"
          >
            {bars.map((bar, idx) => (
              <rect
                key={idx}
                x={bar.x}
                y={0}
                width={bar.width}
                height={40}
                fill="#000000"
              />
            ))}
          </svg>
          <span className="text-[10px] font-mono tracking-widest font-bold mt-0.5 text-slate-900">
            {sample.sampleNumber}
          </span>
        </div>

        {/* Tube container info & tests */}
        <div className="text-[9px] font-sans pt-1 border-t border-slate-200 flex items-center justify-between">
          <span className="font-bold text-blue-800 uppercase truncate max-w-[150px]">
            {sample.container || 'Tube EDTA'}
          </span>
          <span className="font-extrabold bg-slate-900 text-white px-1.5 py-0.2 rounded text-[8px] truncate">
            {testCodes.join(' • ')}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePrintLabel}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
      >
        <Printer className="h-3.5 w-3.5" />
        Imprimer Étiquette Tube (50x30mm)
      </button>
    </div>
  );
};
