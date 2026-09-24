import React from 'react';
import { LabChallenge, PhysicsMetrics, LabDevice } from '../types/physics';
import { CheckCircle2, Circle, X, Award, HelpCircle } from 'lucide-react';

interface LabChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: LabChallenge[];
  metrics: PhysicsMetrics;
  devices: LabDevice[];
  onSelectExperiment: (mode: string) => void;
  language: 'vi' | 'en';
}

export const LabChallengesModal: React.FC<LabChallengesModalProps> = ({
  isOpen,
  onClose,
  challenges,
  metrics,
  devices,
  onSelectExperiment,
  language,
}) => {
  if (!isOpen) return null;

  const completedCount = challenges.filter(c => c.isCompleted(metrics, devices)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0b1729] border border-[#263b5c] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#101e35] border-b border-[#263b5c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-semibold text-slate-100 text-sm">
                {language === 'vi' ? 'Nhiệm vụ & Thử thách thực hành' : 'Practical Lab Challenges & Goals'}
              </h2>
              <span className="text-xs text-slate-400">
                {language === 'vi'
                  ? `Đã hoàn thành ${completedCount}/${challenges.length} bài tập`
                  : `Completed ${completedCount}/${challenges.length} challenges`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1b2c45] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenges List */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {challenges.map(ch => {
            const isDone = ch.isCompleted(metrics, devices);
            return (
              <div
                key={ch.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-[#13243d] border-[#294266]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`text-sm font-medium ${isDone ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {language === 'vi' ? ch.titleVi : ch.titleEn}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {language === 'vi' ? ch.targetVi : ch.targetEn}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-300/90">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{language === 'vi' ? ch.hintVi : ch.hintEn}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectExperiment(ch.expMode);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs bg-[#1c3558] hover:bg-[#284c7d] text-sky-300 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {language === 'vi' ? 'Mở bài này' : 'Load Setup'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0d1c31] border-t border-[#263b5c] flex items-center justify-between text-xs text-slate-400">
          <span>{language === 'vi' ? 'Mô phỏng an toàn · Tiêu chuẩn Vật lí phổ thông' : 'Safe Simulation · High School Physics Standards'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b345b] hover:bg-[#254678] text-slate-200 font-medium rounded-lg transition-colors"
          >
            {language === 'vi' ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
