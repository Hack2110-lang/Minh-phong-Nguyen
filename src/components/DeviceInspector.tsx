import React from 'react';
import { LabDevice } from '../types/physics';
import { DEVICE_METADATA } from '../utils/physicsEngine';
import { Sliders, BookOpen, Trash2, RotateCcw } from 'lucide-react';

interface DeviceInspectorProps {
  device: LabDevice | null;
  onUpdateDevice: (updated: LabDevice) => void;
  onDeleteDevice: (id: string) => void;
  language: 'vi' | 'en';
}

export const DeviceInspector: React.FC<DeviceInspectorProps> = ({
  device,
  onUpdateDevice,
  onDeleteDevice,
  language,
}) => {
  if (!device) {
    return (
      <div className="p-4 bg-[#13243d] border border-[#365174] rounded-xl text-center">
        <Sliders className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-medium text-slate-300">
          {language === 'vi' ? 'Chưa chọn thiết bị' : 'No Device Selected'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'vi'
            ? 'Nhấp chuột vào thiết bị trên bàn thí nghiệm để tùy chỉnh thông số vật lí.'
            : 'Click on any apparatus on the workbench to calibrate physical parameters.'}
        </p>
      </div>
    );
  }

  const meta = DEVICE_METADATA[device.type];

  return (
    <div className="p-4 bg-[#13243d] border border-[#365174] rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">
            {language === 'vi' ? device.nameVi : device.nameEn}
          </h3>
          <span className="text-xs text-sky-400">{meta?.unit ?? ''}</span>
        </div>
        <button
          onClick={() => onDeleteDevice(device.id)}
          title={language === 'vi' ? 'Xóa thiết bị khỏi bàn' : 'Remove apparatus'}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#1a2d4b] rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-300 leading-relaxed bg-[#0e1b2f] p-2.5 rounded-lg border border-[#233857]">
        {language === 'vi' ? meta?.descVi : meta?.descEn}
      </div>

      {/* Parameters Adjustments */}
      <div className="space-y-3 pt-1">
        {/* Battery Voltage */}
        {device.type === 'battery' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{language === 'vi' ? 'Hiệu điện thế (U)' : 'Voltage (U)'}</span>
              <span className="font-mono text-amber-400">{device.batteryVoltage?.toFixed(1) ?? '9.0'} V</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="24.0"
              step="0.5"
              value={device.batteryVoltage ?? 9.0}
              onChange={e => onUpdateDevice({ ...device, batteryVoltage: parseFloat(e.target.value) })}
              className="w-full accent-sky-400"
            />
          </div>
        )}

        {/* Bulb Resistance & Power */}
        {device.type === 'bulb' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{language === 'vi' ? 'Điện trở đèn (R)' : 'Resistance (R)'}</span>
              <span className="font-mono text-sky-400">{device.bulbResistance?.toFixed(1) ?? '15.0'} Ω</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="50.0"
              step="1.0"
              value={device.bulbResistance ?? 15.0}
              onChange={e => onUpdateDevice({ ...device, bulbResistance: parseFloat(e.target.value) })}
              className="w-full accent-sky-400"
            />
          </div>
        )}

        {/* Switch State */}
        {device.type === 'switch' && (
          <button
            onClick={() => onUpdateDevice({ ...device, switchClosed: !device.switchClosed })}
            className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
              device.switchClosed !== false
                ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40'
                : 'bg-rose-600/30 border-rose-500/50 text-rose-300 hover:bg-rose-600/40'
            }`}
          >
            {device.switchClosed !== false
              ? (language === 'vi' ? '● MẠCH ĐANG ĐÓNG (CLICK ĐỂ NGẮT)' : '● CIRCUIT CLOSED (CLICK TO OPEN)')
              : (language === 'vi' ? '○ MẠCH ĐANG MỞ (CLICK ĐỂ ĐÓNG)' : '○ CIRCUIT OPEN (CLICK TO CLOSE)')}
          </button>
        )}

        {/* Resistor Resistance */}
        {device.type === 'resistor' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{language === 'vi' ? 'Điện trở (R)' : 'Resistance (R)'}</span>
              <span className="font-mono text-amber-400">{device.resistorResistance?.toFixed(1) ?? '10.0'} Ω</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="100.0"
              step="1.0"
              value={device.resistorResistance ?? 10.0}
              onChange={e => onUpdateDevice({ ...device, resistorResistance: parseFloat(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>
        )}

        {/* Spring Parameters */}
        {device.type === 'spring' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Độ cứng lò xo (k)' : 'Spring Stiffness (k)'}</span>
                <span className="font-mono text-sky-400">{device.springK?.toFixed(0) ?? '50'} N/m</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={device.springK ?? 50}
                onChange={e => onUpdateDevice({ ...device, springK: parseFloat(e.target.value) })}
                className="w-full accent-sky-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Khối lượng vật (m)' : 'Mass (m)'}</span>
                <span className="font-mono text-emerald-400">{device.mass?.toFixed(2) ?? '0.50'} kg</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={device.mass ?? 0.5}
                onChange={e => onUpdateDevice({ ...device, mass: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>
            <button
              onClick={() => onUpdateDevice({ ...device, springDisplacement: 0.18, springVelocity: 0 })}
              className="w-full py-1.5 px-3 bg-[#1e3250] hover:bg-[#28446c] text-xs text-sky-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Kéo dãn lò xo 18cm' : 'Displace Spring 18cm'}</span>
            </button>
          </div>
        )}

        {/* Calibration Weight Parameters */}
        {device.type === 'weight' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Khối lượng (m)' : 'Mass (m)'}</span>
                <span className="font-mono text-amber-400 font-bold">
                  {(device.mass ?? 0.5) >= 1
                    ? `${(device.mass ?? 0.5).toFixed(2)} kg`
                    : `${Math.round((device.mass ?? 0.5) * 1000)} g`}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="5.0"
                step="0.05"
                value={device.mass ?? 0.5}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  const nameVi = val >= 1 ? `Quả cân ${val.toFixed(1)}kg` : `Quả cân ${Math.round(val * 1000)}g`;
                  const nameEn = val >= 1 ? `Weight ${val.toFixed(1)}kg` : `Weight ${Math.round(val * 1000)}g`;
                  onUpdateDevice({ ...device, mass: val, nameVi, nameEn });
                }}
                className="w-full accent-amber-400"
              />
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {[0.1, 0.2, 0.5, 1.0].map(presetM => (
                  <button
                    key={presetM}
                    onClick={() => {
                      const nameVi = presetM >= 1 ? `Quả cân ${presetM}kg` : `Quả cân ${Math.round(presetM * 1000)}g`;
                      const nameEn = presetM >= 1 ? `Weight ${presetM}kg` : `Weight ${Math.round(presetM * 1000)}g`;
                      onUpdateDevice({ ...device, mass: presetM, nameVi, nameEn });
                    }}
                    className={`py-0.5 text-[10px] rounded border transition-colors ${
                      Math.abs((device.mass ?? 0.5) - presetM) < 0.01
                        ? 'bg-amber-500/30 text-amber-200 border-amber-400'
                        : 'bg-[#182942] text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {presetM >= 1 ? `${presetM}kg` : `${presetM * 1000}g`}
                  </button>
                ))}
              </div>
            </div>

            {/* Material finish */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {language === 'vi' ? 'Chất liệu kim loại' : 'Material Finish'}
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'brass', vi: 'Đồng thau', en: 'Brass', color: '#eab308' },
                  { id: 'chrome', vi: 'Thép mạ', en: 'Chrome', color: '#cbd5e1' },
                  { id: 'iron', vi: 'Gang đúc', en: 'Cast Iron', color: '#64748b' },
                ].map(mat => (
                  <button
                    key={mat.id}
                    onClick={() => onUpdateDevice({ ...device, weightMaterial: mat.id as any })}
                    className={`py-1 text-[11px] rounded border transition-colors flex items-center justify-center gap-1 ${
                      (device.weightMaterial ?? 'brass') === mat.id
                        ? 'bg-sky-950 border-sky-400 text-sky-200 font-medium'
                        : 'bg-[#182942] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: mat.color }} />
                    <span>{language === 'vi' ? mat.vi : mat.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Force Info */}
            <div className="p-2 rounded-lg bg-[#0e1b2f] border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>{language === 'vi' ? 'Trọng lượng P = m·g' : 'Weight Force (P=m·g)'}:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {((device.mass ?? 0.5) * 9.80665).toFixed(2)} N
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>{language === 'vi' ? 'Gia tốc trọng trường chuẩn g' : 'Standard Gravity g'}:</span>
                <span className="font-mono">9.81 m/s²</span>
              </div>
            </div>
          </div>
        )}

        {/* Ramp Parameters */}
        {device.type === 'ramp' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Góc nghiêng (α)' : 'Incline Angle (α)'}</span>
                <span className="font-mono text-amber-400 font-bold">{device.rampAngle ?? 30}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={device.rampAngle ?? 30}
                onChange={e => onUpdateDevice({ ...device, rampAngle: parseInt(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Hệ số ma sát (μ)' : 'Friction (μ)'}</span>
                <span className="font-mono text-rose-400">{device.rampFriction?.toFixed(2) ?? '0.15'}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.02"
                value={device.rampFriction ?? 0.15}
                onChange={e => onUpdateDevice({ ...device, rampFriction: parseFloat(e.target.value) })}
                className="w-full accent-rose-400"
              />
            </div>
            <button
              onClick={() => onUpdateDevice({ ...device, blockPos: 0.05, blockVel: 0 })}
              className="w-full py-1.5 px-3 bg-[#1e3250] hover:bg-[#28446c] text-xs text-sky-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Đặt vật lại đỉnh dốc' : 'Reset Block to Top'}</span>
            </button>
          </div>
        )}

        {/* Burner Parameters */}
        {device.type === 'burner' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Công suất nhiệt (P)' : 'Thermal Power (P)'}</span>
                <span className="font-mono text-rose-400">{device.burnerPower ?? 500} W</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="50"
                value={device.burnerPower ?? 500}
                onChange={e => onUpdateDevice({ ...device, burnerPower: parseInt(e.target.value) })}
                className="w-full accent-rose-400"
              />
            </div>
            <button
              onClick={() => onUpdateDevice({ ...device, burnerOn: !device.burnerOn })}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                device.burnerOn !== false
                  ? 'bg-rose-600/30 border-rose-500/50 text-rose-300 hover:bg-rose-600/40'
                  : 'bg-slate-700/40 border-slate-600 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              {device.burnerOn !== false
                ? (language === 'vi' ? '🔥 BẾP ĐANG ĐUN (BẬT)' : '🔥 HEATER ACTIVE (ON)')
                : (language === 'vi' ? '❄ BẾP ĐÃ TẮT (OFF)' : '❄ HEATER INACTIVE (OFF)')}
            </button>
          </div>
        )}

        {/* Thermometer */}
        {device.type === 'thermometer' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{language === 'vi' ? 'Nhiệt độ hiện tại' : 'Current Temp'}</span>
              <span className="font-mono text-rose-400 font-bold">{device.temperature?.toFixed(1) ?? '25.0'} °C</span>
            </div>
            <button
              onClick={() => onUpdateDevice({ ...device, temperature: 25.0 })}
              className="w-full py-1.5 px-3 bg-[#1e3250] hover:bg-[#28446c] text-xs text-sky-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Làm nguội về 25°C' : 'Cool down to 25°C'}</span>
            </button>
          </div>
        )}

        {/* Pendulum */}
        {device.type === 'pendulum' && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Chiều dài dây (L)' : 'String Length (L)'}</span>
                <span className="font-mono text-sky-400">{device.pendulumLength?.toFixed(2) ?? '0.80'} m</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.05"
                value={device.pendulumLength ?? 0.8}
                onChange={e => onUpdateDevice({ ...device, pendulumLength: parseFloat(e.target.value) })}
                className="w-full accent-sky-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Khối lượng quả nặng (m)' : 'Bob Mass (m)'}</span>
                <span className="font-mono text-amber-400">{device.mass?.toFixed(2) ?? '0.40'} kg</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={device.mass ?? 0.4}
                onChange={e => onUpdateDevice({ ...device, mass: parseFloat(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>
            <button
              onClick={() => onUpdateDevice({ ...device, pendulumAngle: (40 * Math.PI) / 180, pendulumVelocity: 0 })}
              className="w-full py-1.5 px-3 bg-[#1e3250] hover:bg-[#28446c] text-xs text-sky-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Kéo lệch góc 40° và thả' : 'Displace 40° & Release'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Physics Formula Footer */}
      {meta?.formula && (
        <div className="pt-2 border-t border-[#233857] flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Công thức:' : 'Formula:'}</span>
          </span>
          <span className="font-mono text-sky-300 bg-[#0d1c31] px-2 py-0.5 rounded border border-[#1e2f47]">
            {meta.formula}
          </span>
        </div>
      )}
    </div>
  );
};
