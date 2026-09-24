import React, { useState } from 'react';
import { LabDevice, PhysicsMetrics, ExperimentMode } from '../types/physics';
import { Printer, Download, X, FileText, CheckCircle } from 'lucide-react';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: PhysicsMetrics;
  devices: LabDevice[];
  expMode: ExperimentMode;
  language: 'vi' | 'en';
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  devices,
  expMode,
  language,
}) => {
  const [studentName, setStudentName] = useState('Học sinh thực hành (Lớp 10A1)');
  const [teacherName, setTeacherName] = useState('Giáo viên hướng dẫn bộ môn Vật lí');
  const [className, setClassName] = useState('Lớp 10A1');
  const [schoolName, setSchoolName] = useState('THPT Chuyên Khoa Học Tự Nhiên');
  const [notes, setNotes] = useState(
    'Cơ năng của hệ dao động được bảo toàn khi bỏ qua lực ma sát và lực cản của môi trường. Các số liệu đo đạc thực nghiệm phù hợp với lý thuyết định luật bảo toàn.'
  );

  if (!isOpen) return null;

  const modeNames: Record<ExperimentMode, { vi: string; en: string }> = {
    electric: { vi: 'Thí nghiệm Đo đạc Mạch điện một chiều & Định luật Ôm', en: 'DC Electric Circuit & Ohm\'s Law Study' },
    spring: { vi: 'Thí nghiệm Con lắc lò xo & Bảo toàn cơ năng', en: 'Spring Oscillator & Mechanical Energy Conservation' },
    ramp: { vi: 'Thí nghiệm Mặt phẳng nghiêng & Ma sát trượt', en: 'Inclined Plane & Kinetic Friction Experiment' },
    heat: { vi: 'Thí nghiệm Nhiệt học, Truyền nhiệt & Sự chuyển thể', en: 'Thermodynamics, Heat Transfer & Phase Change' },
    pendulum: { vi: 'Thí nghiệm Con lắc đơn & Đo gia tốc trọng trường', en: 'Simple Pendulum & Gravitational Acceleration' },
    custom: { vi: 'Thí nghiệm Vật lí Tự do Tương tác', en: 'Custom Free Physics Investigation' },
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0b1729] border border-[#263b5c] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Controls Header */}
        <div className="px-5 py-3.5 bg-[#101e35] border-b border-[#263b5c] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h2 className="font-semibold text-slate-100 text-sm">
              {language === 'vi' ? 'Báo cáo Thực hành Thí nghiệm Vật lí' : 'Student Laboratory Practicum Report'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#1e3a8a] hover:bg-[#2563eb] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'In báo cáo (Print)' : 'Print Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1b2c45] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto bg-white text-slate-900 printable-document space-y-5 text-sm">
          {/* Header of paper */}
          <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {schoolName}
            </p>
            <h1 className="text-lg font-bold uppercase text-slate-900">
              BÁO CÁO THỰC HÀNH THÍ NGHIỆM VẬT LÍ
            </h1>
            <p className="text-xs text-slate-600 italic">
              {modeNames[expMode][language === 'vi' ? 'vi' : 'en']}
            </p>
          </div>

          {/* Student Meta Inputs */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-700">Họ và tên học sinh: </span>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="font-medium text-slate-900 border-b border-dashed border-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <div>
              <span className="font-semibold text-slate-700">Lớp: </span>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="font-medium text-slate-900 border-b border-dashed border-slate-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Apparatus List */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-1.5">
              1. Dụng cụ & Thiết bị thí nghiệm đã sử dụng:
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {devices.map(d => (
                <span
                  key={d.id}
                  className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700"
                >
                  ✓ {language === 'vi' ? d.nameVi : d.nameEn}
                </span>
              ))}
            </div>
          </div>

          {/* Measurement Data Table */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-1.5">
              2. Bảng số liệu đo đạc thực nghiệm:
            </h3>
            <table className="w-full text-xs border border-slate-300 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Đại lượng vật lí</th>
                  <th className="p-2 border-r border-slate-300">Ký hiệu</th>
                  <th className="p-2 border-r border-slate-300">Giá trị đo</th>
                  <th className="p-2">Đơn vị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 border-r border-slate-200">Thời gian mô phỏng</td>
                  <td className="p-2 border-r border-slate-200 font-mono">t</td>
                  <td className="p-2 border-r border-slate-200 font-mono">{metrics.time.toFixed(2)}</td>
                  <td className="p-2">s (giây)</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Vận tốc tức thời</td>
                  <td className="p-2 border-r border-slate-200 font-mono">v</td>
                  <td className="p-2 border-r border-slate-200 font-mono">{metrics.velocity.toFixed(3)}</td>
                  <td className="p-2">m/s</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Gia tốc</td>
                  <td className="p-2 border-r border-slate-200 font-mono">a</td>
                  <td className="p-2 border-r border-slate-200 font-mono">{metrics.acceleration.toFixed(3)}</td>
                  <td className="p-2">m/s²</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Động năng</td>
                  <td className="p-2 border-r border-slate-200 font-mono">E_d (E_k)</td>
                  <td className="p-2 border-r border-slate-200 font-mono">{metrics.kineticEnergy.toFixed(3)}</td>
                  <td className="p-2">J (Joule)</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Thế năng</td>
                  <td className="p-2 border-r border-slate-200 font-mono">E_t (E_p)</td>
                  <td className="p-2 border-r border-slate-200 font-mono">{metrics.potentialEnergy.toFixed(3)}</td>
                  <td className="p-2">J (Joule)</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Điện áp mạch</td>
                  <td className="p-2 border-r border-slate-200 font-mono">U</td>
                  <td className="p-2 border-r border-slate-200 font-mono">{metrics.voltage.toFixed(1)}</td>
                  <td className="p-2">V (Volt)</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Nhiệt độ quan sát</td>
                  <td className="p-2 border-r border-slate-200 font-mono">T</td>
                  <td className="p-2 border-r border-slate-200 font-mono">{metrics.temperature.toFixed(1)}</td>
                  <td className="p-2">°C</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Student Observations & Notes */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-1">
              3. Nhận xét & Kết luận của học sinh:
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 text-slate-800"
            />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-4 text-center text-xs text-slate-700">
            <div>
              <p className="font-semibold">GIÁO VIÊN HƯỚNG DẪN</p>
              <p className="italic text-[11px] text-slate-500">{teacherName}</p>
              <div className="h-12" />
            </div>
            <div>
              <p className="font-semibold">HỌC SINH THỰC HIỆN</p>
              <p className="italic text-[11px] text-slate-500">{studentName}</p>
              <div className="h-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
