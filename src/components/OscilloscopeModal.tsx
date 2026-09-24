import React, { useRef, useEffect } from 'react';
import { HistoryPoint } from '../types/physics';
import { X, Play, Pause, Trash2 } from 'lucide-react';

interface OscilloscopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryPoint[];
  onClearHistory: () => void;
  isSimRunning: boolean;
  onToggleSim: () => void;
  language: 'vi' | 'en';
}

export const OscilloscopeModal: React.FC<OscilloscopeModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  isSimRunning,
  onToggleSim,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.resetTransform();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Background
    ctx.fillStyle = '#07111e';
    ctx.fillRect(0, 0, w, h);

    // Oscilloscope Grid Lines
    ctx.strokeStyle = '#1e2d42';
    ctx.lineWidth = 1;
    const stepX = 50;
    const stepY = 40;

    for (let x = 40; x < w; x += stepX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h - 25);
      ctx.stroke();
    }
    for (let y = 10; y < h - 25; y += stepY) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#476796';
    ctx.lineWidth = 2;
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, h - 25);
    ctx.lineTo(w - 10, h - 25);
    ctx.stroke();

    // Axis Labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Năng lượng (J) / Đại lượng', 8, 15);
    ctx.fillText('Thời gian t (s)', w - 100, h - 8);

    if (history.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        language === 'vi' ? 'Đang ghi dữ liệu theo thời gian thực...' : 'Recording real-time data stream...',
        w / 2,
        h / 2
      );
      return;
    }

    // Determine scale bounds
    const maxPoints = 250;
    const displayData = history.slice(-maxPoints);
    const maxVal = Math.max(1, ...displayData.map(d => Math.max(d.kinetic, d.potential, d.electric, d.heat)));

    const plotWidth = w - 60;
    const plotHeight = h - 50;

    const drawCurve = (color: string, key: 'kinetic' | 'potential' | 'electric' | 'heat') => {
      ctx.beginPath();
      displayData.forEach((pt, i) => {
        const x = 40 + (i / (maxPoints - 1)) * plotWidth;
        const y = (h - 25) - (pt[key] / maxVal) * plotHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawCurve('#38bdf8', 'kinetic');    // Blue: Kinetic
    drawCurve('#facc15', 'potential');  // Yellow: Potential
    drawCurve('#4ade80', 'electric');   // Green: Electric
    drawCurve('#f87171', 'heat');       // Red: Thermal Heat

  }, [isOpen, history, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0b1729] border border-[#263b5c] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#101e35] border-b border-[#263b5c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 text-sm">
              {language === 'vi' ? '📈 Máy hiện sóng & Biểu đồ cơ năng' : '📈 Digital Oscilloscope & Energy Curves'}
            </span>
            <span className="text-xs text-slate-400">· {language === 'vi' ? 'Thời gian thực' : 'Real-time'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1b2c45] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="p-4 bg-[#07111e]">
          <canvas
            ref={canvasRef}
            className="w-full h-72 block rounded-xl border border-[#1e2d42]"
          />
        </div>

        {/* Legend & Controls */}
        <div className="px-5 py-3 bg-[#0d1c31] border-t border-[#263b5c] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Legend Items */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#38bdf8]" />
              <span className="text-slate-300">{language === 'vi' ? 'Động năng (E_k)' : 'Kinetic (E_k)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#facc15]" />
              <span className="text-slate-300">{language === 'vi' ? 'Thế năng (E_p)' : 'Potential (E_p)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
              <span className="text-slate-300">{language === 'vi' ? 'Điện năng (A)' : 'Electric'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#f87171]" />
              <span className="text-slate-300">{language === 'vi' ? 'Nhiệt năng (Q)' : 'Heat (Q)'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSim}
              className="px-3 py-1.5 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {isSimRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'vi' ? 'Tạm dừng' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'vi' ? 'Tiếp tục' : 'Resume'}</span>
                </>
              )}
            </button>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Xóa sóng' : 'Clear'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
