import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DeviceType,
  ExperimentMode,
  LabDevice,
  LabPerson,
  PhysicsMetrics,
  PlanetGravity,
  HistoryPoint,
  DeviceConnection,
} from './types/physics';
import {
  createPresetDevices,
  createPresetConnections,
  stepPhysicsSimulation,
  GRAVITY_VALUES,
} from './utils/physicsEngine';
import { LAB_CHALLENGES } from './utils/challenges';
import { soundFx } from './utils/audio';
import { LabCanvas3D } from './components/LabCanvas3D';
import { DeviceInspector } from './components/DeviceInspector';
import { OscilloscopeModal } from './components/OscilloscopeModal';
import { LabChallengesModal } from './components/LabChallengesModal';
import { LabReportModal } from './components/LabReportModal';
import { ModelViewer3DModal, ModelId } from './components/ModelViewer3DModal';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  Activity,
  Globe2,
  Volume2,
  VolumeX,
  FileText,
  Award,
  TrendingUp,
  ShieldCheck,
  Compass,
  Sparkles,
  Box,
} from 'lucide-react';

const INITIAL_METRICS: PhysicsMetrics = {
  time: 0.0,
  electricEnergy: 0.0,
  kineticEnergy: 0.0,
  potentialEnergy: 0.0,
  heatEnergy: 0.0,
  totalEnergy: 0.0,
  velocity: 0.0,
  acceleration: 0.0,
  temperature: 25.0,
  voltage: 0.0,
  current: 0.0,
  power: 0.0,
};

export default function App() {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [expMode, setExpMode] = useState<ExperimentMode>('electric');
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [planet, setPlanet] = useState<PlanetGravity>('earth');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Simulation State
  const [devices, setDevices] = useState<LabDevice[]>(() => createPresetDevices('electric'));
  const [people, setPeople] = useState<LabPerson[]>([]);
  const [metrics, setMetrics] = useState<PhysicsMetrics>(INITIAL_METRICS);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Electrical Wire Connections State
  const [connections, setConnections] = useState<DeviceConnection[]>(() =>
    createPresetConnections(createPresetDevices('electric'))
  );

  // History for oscilloscope
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // Modals
  const [showOscilloscope, setShowOscilloscope] = useState<boolean>(false);
  const [showChallenges, setShowChallenges] = useState<boolean>(false);
  const [showLabReport, setShowLabReport] = useState<boolean>(false);
  const [showModelViewer, setShowModelViewer] = useState<boolean>(false);
  const [initialModelId, setInitialModelId] = useState<ModelId | undefined>(undefined);

  const handleOpenModelViewer = useCallback((modelId?: string) => {
    setInitialModelId(modelId as ModelId | undefined);
    setShowModelViewer(true);
    soundFx.playClick();
  }, []);

  // Wire Connection Handlers
  const handleAddConnection = useCallback((conn: DeviceConnection) => {
    setConnections(prev => {
      const exists = prev.some(
        c =>
          (c.fromDeviceId === conn.fromDeviceId &&
            c.fromPort === conn.fromPort &&
            c.toDeviceId === conn.toDeviceId &&
            c.toPort === conn.toPort) ||
          (c.fromDeviceId === conn.toDeviceId &&
            c.fromPort === conn.toPort &&
            c.toDeviceId === conn.fromDeviceId &&
            c.toPort === conn.fromPort)
      );
      if (exists) return prev;
      return [...prev, conn];
    });
  }, []);

  const handleRemoveConnection = useCallback((connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  }, []);

  const handleClearConnections = useCallback(() => {
    setConnections([]);
  }, []);

  const handleResetPresetConnections = useCallback(() => {
    setConnections(createPresetConnections(devicesRef.current));
  }, []);

  // References for high-frequency physics simulation loop
  const devicesRef = useRef(devices);
  const metricsRef = useRef(metrics);
  const isRunningRef = useRef(isSimRunning);
  const simSpeedRef = useRef(simSpeed);
  const planetRef = useRef(planet);
  const expModeRef = useRef(expMode);
  const connectionsRef = useRef(connections);

  devicesRef.current = devices;
  metricsRef.current = metrics;
  isRunningRef.current = isSimRunning;
  simSpeedRef.current = simSpeed;
  planetRef.current = planet;
  expModeRef.current = expMode;
  connectionsRef.current = connections;

  // Sound toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Change Experiment Mode
  const handleSwitchExperiment = (mode: ExperimentMode) => {
    setExpMode(mode);
    const newDevs = createPresetDevices(mode);
    setDevices(newDevs);
    setConnections(createPresetConnections(newDevs));
    setSelectedDeviceId(newDevs[0]?.id ?? null);
    setMetrics({ ...INITIAL_METRICS, time: 0 });
    setHistory([]);
    setIsSimRunning(true);
  };

  // Reset experiment
  const handleReset = () => {
    const newDevs = createPresetDevices(expMode);
    setDevices(newDevs);
    setConnections(createPresetConnections(newDevs));
    setMetrics({ ...INITIAL_METRICS, time: 0 });
    setHistory([]);
    setIsSimRunning(true);
  };

  // Add Device
  const handleAddDevice = (type: DeviceType) => {
    const id = `dev_${type}_${Date.now()}`;
    const count = devices.length;
    const offsetX = (count % 4 - 1.5) * 85;
    const offsetY = Math.floor(count / 4) * 60 - 40;

    let newDev: LabDevice = {
      id,
      type,
      nameVi: type,
      nameEn: type,
      x: offsetX,
      y: offsetY,
      z: 0,
    };

    if (type === 'battery') {
      newDev = { ...newDev, nameVi: 'Pin 9V', nameEn: '9V Battery', batteryVoltage: 9.0 };
    } else if (type === 'bulb') {
      newDev = { ...newDev, nameVi: 'Bóng đèn', nameEn: 'Bulb', bulbResistance: 15.0, bulbRatedPower: 15.0 };
    } else if (type === 'switch') {
      newDev = { ...newDev, nameVi: 'Công tắc', nameEn: 'Switch', switchClosed: true };
    } else if (type === 'resistor') {
      newDev = { ...newDev, nameVi: 'Điện trở 10Ω', nameEn: '10Ω Resistor', resistorResistance: 10.0 };
    } else if (type === 'spring') {
      newDev = { ...newDev, nameVi: 'Lò xo dao động', nameEn: 'Spring', springK: 50, mass: 0.5, springDisplacement: 0.15, springVelocity: 0 };
    } else if (type === 'weight') {
      newDev = { ...newDev, nameVi: 'Quả cân chuẩn 0.5kg', nameEn: 'Calibration Weight 0.5kg', mass: 0.5, weightMaterial: 'brass' };
    } else if (type === 'ramp') {
      newDev = { ...newDev, nameVi: 'Mặt phẳng nghiêng', nameEn: 'Ramp', rampAngle: 30, rampFriction: 0.15, mass: 0.8, blockPos: 0.05, blockVel: 0 };
    } else if (type === 'burner') {
      newDev = { ...newDev, nameVi: 'Bếp điện 600W', nameEn: 'Heater 600W', burnerOn: true, burnerPower: 600 };
    } else if (type === 'thermometer') {
      newDev = { ...newDev, nameVi: 'Nhiệt kế', nameEn: 'Thermometer', temperature: 25.0, waterVolume: 250 };
    } else if (type === 'pendulum') {
      newDev = { ...newDev, nameVi: 'Con lắc đơn', nameEn: 'Pendulum', pendulumLength: 0.8, mass: 0.4, pendulumAngle: 0.5, pendulumVelocity: 0 };
    } else if (type === 'multimeter') {
      newDev = { ...newDev, nameVi: 'Vôn kế / Ampe kế', nameEn: 'Multimeter' };
    }

    setDevices(prev => [...prev, newDev]);
    setSelectedDeviceId(newDev.id);
  };

  // Delete Device
  const handleDeleteDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setConnections(prev => prev.filter(c => c.fromDeviceId !== id && c.toDeviceId !== id));
    if (selectedDeviceId === id) setSelectedDeviceId(null);
  };

  // Update Device
  const handleUpdateDevice = useCallback((updated: LabDevice) => {
    setDevices(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  }, []);

  // Update Person
  const handleUpdatePerson = useCallback((updated: LabPerson) => {
    setPeople(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  }, []);

  // Main Simulation Physics Loop (60 FPS)
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();
    let historyCounter = 0;

    const loop = (timestamp: number) => {
      const elapsedSec = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      if (isRunningRef.current) {
        const dt = elapsedSec * simSpeedRef.current;
        const { updatedDevices, updatedMetrics } = stepPhysicsSimulation(
          devicesRef.current,
          metricsRef.current,
          dt,
          planetRef.current,
          expModeRef.current,
          connectionsRef.current
        );

        setDevices(updatedDevices);
        setMetrics(updatedMetrics);

        // Record history at ~15Hz for oscilloscope
        historyCounter++;
        if (historyCounter % 4 === 0) {
          setHistory(prev => {
            const nextPoint: HistoryPoint = {
              t: updatedMetrics.time,
              kinetic: updatedMetrics.kineticEnergy,
              potential: updatedMetrics.potentialEnergy,
              electric: updatedMetrics.electricEnergy,
              heat: updatedMetrics.heatEnergy,
              val: updatedMetrics.velocity,
            };
            if (prev.length > 300) {
              return [...prev.slice(1), nextPoint];
            }
            return [...prev, nextPoint];
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Selected device reference
  const selectedDevice = devices.find(d => d.id === selectedDeviceId) ?? null;

  // Max energy reference for progress bars
  const maxEnergyScale = Math.max(
    10,
    metrics.electricEnergy,
    metrics.kineticEnergy,
    metrics.potentialEnergy,
    metrics.heatEnergy,
    metrics.totalEnergy
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07111e] text-[#f4f7ff] overflow-hidden font-sans">
      {/* 3-ZONE TOP BAR CONTRACT */}
      <header className="h-14 px-5 bg-[#0b1729] border-b border-[#263b5c] flex items-center justify-between shrink-0 select-none z-20">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-tight text-[#9ed4ff] flex items-center gap-2">
            <span>🔬 PHYSICS LAB 3D</span>
          </span>
          <span className="hidden lg:inline text-xs text-slate-400">
            {language === 'vi' ? 'Phòng thí nghiệm Vật lí tương tác' : 'Interactive Physics Laboratory'}
          </span>
        </div>

        {/* Zone 2: Experiment Presets Nav Links (Functional Buttons) */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#101e35] rounded-xl border border-[#263b5c]">
          <button
            onClick={() => handleSwitchExperiment('electric')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              expMode === 'electric' ? 'bg-[#1e3a8a] text-sky-200 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'vi' ? 'Mạch điện' : 'Circuit'}</span>
          </button>
          <button
            onClick={() => handleSwitchExperiment('spring')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              expMode === 'spring' ? 'bg-[#1e3a8a] text-sky-200 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'vi' ? 'Lò xo & Cơ năng' : 'Spring'}</span>
          </button>
          <button
            onClick={() => handleSwitchExperiment('ramp')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              expMode === 'ramp' ? 'bg-[#1e3a8a] text-sky-200 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'vi' ? 'Mặt phẳng nghiêng' : 'Ramp'}</span>
          </button>
          <button
            onClick={() => handleSwitchExperiment('heat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              expMode === 'heat' ? 'bg-[#1e3a8a] text-sky-200 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'vi' ? 'Nhiệt học' : 'Heat'}</span>
          </button>
          <button
            onClick={() => handleSwitchExperiment('pendulum')}
            className={`hidden md:flex px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap items-center gap-1.5 ${
              expMode === 'pendulum' ? 'bg-[#1e3a8a] text-sky-200 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>{language === 'vi' ? 'Con lắc đơn' : 'Pendulum'}</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Tools */}
        <div className="flex items-center gap-2">
          {/* 3D Model Explorer Button */}
          <button
            onClick={() => handleOpenModelViewer()}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-sky-900/30 border border-sky-400/40 cursor-pointer"
            title={language === 'vi' ? 'Xem kho mô hình 3D tương tác 360°' : 'Interactive 360° 3D Models'}
          >
            <Box className="w-3.5 h-3.5 text-sky-200" />
            <span className="hidden sm:inline">{language === 'vi' ? 'Mô hình 3D' : '3D Models'}</span>
          </button>

          {/* Oscilloscope button */}
          <button
            onClick={() => setShowOscilloscope(true)}
            title={language === 'vi' ? 'Máy hiện sóng & Biểu đồ cơ năng' : 'Digital Oscilloscope'}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#162744] rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </button>

          {/* Challenges button */}
          <button
            onClick={() => setShowChallenges(true)}
            className="px-2.5 py-1.5 bg-[#162a4a] hover:bg-[#1f3b68] text-amber-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-amber-500/30"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'vi' ? 'Thử thách' : 'Tasks'}</span>
          </button>

          {/* Lab Report Export button */}
          <button
            onClick={() => setShowLabReport(true)}
            className="px-2.5 py-1.5 bg-[#1e3a8a] hover:bg-[#2563eb] text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'vi' ? 'Báo cáo' : 'Report'}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#162744] rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLanguage(l => (l === 'vi' ? 'en' : 'vi'))}
            className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white bg-[#101e35] border border-[#263b5c] rounded-md transition-colors"
          >
            {language.toUpperCase()}
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN WORKBENCH LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Equipment Library, Characters & Controls */}
        <aside className="w-72 bg-[#0b1729] border-r border-[#263b5c] flex flex-col shrink-0 overflow-y-auto p-3.5 space-y-3.5 select-none">
          {/* 1. Equipment Toolbox */}
          <div className="bg-[#13243d] border border-[#365174] rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>{language === 'vi' ? '🧰 Thiết bị thí nghiệm' : '🧰 Apparatus Toolbox'}</span>
              <span className="text-[10px] text-slate-400 lowercase">{language === 'vi' ? 'nhấp để thêm' : 'click to add'}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAddDevice('battery')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>🔋</span>
                <span className="truncate">{language === 'vi' ? 'Pin nguồn' : 'Battery'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('bulb')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>💡</span>
                <span className="truncate">{language === 'vi' ? 'Bóng đèn' : 'Lamp'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('switch')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>🔘</span>
                <span className="truncate">{language === 'vi' ? 'Công tắc K' : 'Switch'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('resistor')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>🟫</span>
                <span className="truncate">{language === 'vi' ? 'Điện trở' : 'Resistor'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('spring')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>🌀</span>
                <span className="truncate">{language === 'vi' ? 'Lò xo' : 'Spring'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('weight')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
                title={language === 'vi' ? 'Quả cân chuẩn có quai móc' : 'Calibration Weight'}
              >
                <span>⚖️</span>
                <span className="truncate">{language === 'vi' ? 'Quả cân' : 'Weight'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('ramp')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>📐</span>
                <span className="truncate">{language === 'vi' ? 'Mặt nghiêng' : 'Ramp'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('thermometer')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>🌡️</span>
                <span className="truncate">{language === 'vi' ? 'Nhiệt kế' : 'Thermo'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('burner')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>🔥</span>
                <span className="truncate">{language === 'vi' ? 'Bếp nhiệt' : 'Heater'}</span>
              </button>
              <button
                onClick={() => handleAddDevice('pendulum')}
                className="p-2 bg-[#1c3558] hover:bg-[#2c507f] text-slate-200 text-xs rounded-lg text-left transition-colors flex items-center gap-1.5"
              >
                <span>⏳</span>
                <span className="truncate">{language === 'vi' ? 'Con lắc đơn' : 'Pendulum'}</span>
              </button>
            </div>
          </div>

          {/* 2. Simulation Playback Controls */}
          <div className="bg-[#13243d] border border-[#365174] rounded-xl p-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {language === 'vi' ? '⚙ Điều khiển mô phỏng' : '⚙ Simulation Controls'}
            </div>

            {/* Run / Pause / Reset Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsSimRunning(r => !r)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  isSimRunning
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/40'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                }`}
              >
                {isSimRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Tạm dừng' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Chạy' : 'Run'}</span>
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="py-2 px-3 bg-[#1e3250] hover:bg-[#28446c] text-xs font-semibold text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#375276]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Làm lại' : 'Reset'}</span>
              </button>
            </div>

            {/* Simulation Speed */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{language === 'vi' ? 'Tốc độ thời gian' : 'Time Scale'}</span>
                <span className="font-mono text-sky-400">{simSpeed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#0e1b2f] rounded-lg border border-[#233857]">
                {[0.25, 0.5, 1.0, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => setSimSpeed(s)}
                    className={`py-1 text-[11px] font-mono rounded transition-colors ${
                      simSpeed === s ? 'bg-[#1e3a8a] text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Planet Gravity Environment */}
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'vi' ? 'Trọng lực môi trường (g)' : 'Gravity (g)'}</span>
              </div>
              <select
                value={planet}
                onChange={e => setPlanet(e.target.value as PlanetGravity)}
                className="w-full p-2 bg-[#0e1b2f] border border-[#233857] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {Object.entries(GRAVITY_VALUES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {language === 'vi' ? info.nameVi : info.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* CENTER STAGE: 3D Physics Laboratory Canvas */}
        <main className="flex-1 relative overflow-hidden bg-[#07111e]">
          <LabCanvas3D
            devices={devices}
            people={people}
            metrics={metrics}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={d => setSelectedDeviceId(d?.id ?? null)}
            onUpdateDevice={handleUpdateDevice}
            onUpdatePerson={handleUpdatePerson}
            isSimRunning={isSimRunning}
            language={language}
            onOpenModelViewer={handleOpenModelViewer}
            connections={connections}
            onAddConnection={handleAddConnection}
            onRemoveConnection={handleRemoveConnection}
            onClearConnections={handleClearConnections}
            onResetPresetConnections={handleResetPresetConnections}
          />
        </main>

        {/* RIGHT SIDEBAR: Energy Breakdown, Device Inspector, Sensor Readouts & Safety */}
        <aside className="w-80 bg-[#0b1729] border-l border-[#263b5c] flex flex-col shrink-0 overflow-y-auto p-3.5 space-y-3.5 select-none">
          {/* 1. Energy Breakdown Panel */}
          <div className="bg-[#13243d] border border-[#365174] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {language === 'vi' ? '📊 Bảng phân bố năng lượng' : '📊 Energy Breakdown'}
              </span>
              <span className="font-mono text-xs text-sky-400 font-bold">
                Σ={metrics.totalEnergy.toFixed(1)} J
              </span>
            </div>

            {/* Electric Energy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Điện năng tiêu thụ' : 'Electric Energy'}</span>
                <span className="font-mono text-emerald-400">{metrics.electricEnergy.toFixed(2)} J</span>
              </div>
              <div className="h-2 bg-[#0e1b2f] rounded-full overflow-hidden border border-[#233857]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (metrics.electricEnergy / maxEnergyScale) * 100)}%` }}
                />
              </div>
            </div>

            {/* Kinetic Energy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Động năng (E_k)' : 'Kinetic Energy (E_k)'}</span>
                <span className="font-mono text-sky-400">{metrics.kineticEnergy.toFixed(2)} J</span>
              </div>
              <div className="h-2 bg-[#0e1b2f] rounded-full overflow-hidden border border-[#233857]">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (metrics.kineticEnergy / maxEnergyScale) * 100)}%` }}
                />
              </div>
            </div>

            {/* Potential Energy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Thế năng (E_p)' : 'Potential Energy (E_p)'}</span>
                <span className="font-mono text-amber-400">{metrics.potentialEnergy.toFixed(2)} J</span>
              </div>
              <div className="h-2 bg-[#0e1b2f] rounded-full overflow-hidden border border-[#233857]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (metrics.potentialEnergy / maxEnergyScale) * 100)}%` }}
                />
              </div>
            </div>

            {/* Dissipated Heat Energy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{language === 'vi' ? 'Nhiệt lượng tỏa ra (Q)' : 'Heat Loss (Q)'}</span>
                <span className="font-mono text-rose-400">{metrics.heatEnergy.toFixed(2)} J</span>
              </div>
              <div className="h-2 bg-[#0e1b2f] rounded-full overflow-hidden border border-[#233857]">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (metrics.heatEnergy / maxEnergyScale) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Device Inspector */}
          <DeviceInspector
            device={selectedDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
            language={language}
          />

          {/* 3. Sensor Digital Readout */}
          <div className="bg-[#13243d] border border-[#365174] rounded-xl p-3.5 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {language === 'vi' ? '📏 Số liệu cảm biến đo đạc' : '📏 Precision Sensor Readout'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#0e1b2f] rounded-lg border border-[#233857]">
                <div className="text-[11px] text-slate-400">{language === 'vi' ? 'Thời gian (t)' : 'Time (t)'}</div>
                <div className="font-mono text-slate-100 font-semibold mt-0.5">{metrics.time.toFixed(2)} s</div>
              </div>
              <div className="p-2 bg-[#0e1b2f] rounded-lg border border-[#233857]">
                <div className="text-[11px] text-slate-400">{language === 'vi' ? 'Vận tốc (v)' : 'Velocity (v)'}</div>
                <div className="font-mono text-sky-400 font-semibold mt-0.5">{metrics.velocity.toFixed(3)} m/s</div>
              </div>
              <div className="p-2 bg-[#0e1b2f] rounded-lg border border-[#233857]">
                <div className="text-[11px] text-slate-400">{language === 'vi' ? 'Gia tốc (a)' : 'Accel (a)'}</div>
                <div className="font-mono text-amber-400 font-semibold mt-0.5">{metrics.acceleration.toFixed(3)} m/s²</div>
              </div>
              <div className="p-2 bg-[#0e1b2f] rounded-lg border border-[#233857]">
                <div className="text-[11px] text-slate-400">{language === 'vi' ? 'Nhiệt độ (T)' : 'Temp (T)'}</div>
                <div className="font-mono text-rose-400 font-semibold mt-0.5">{metrics.temperature.toFixed(1)} °C</div>
              </div>
              <div className="p-2 bg-[#0e1b2f] rounded-lg border border-[#233857]">
                <div className="text-[11px] text-slate-400">{language === 'vi' ? 'Hiệu điện thế (U)' : 'Voltage (U)'}</div>
                <div className="font-mono text-emerald-400 font-semibold mt-0.5">{metrics.voltage.toFixed(1)} V</div>
              </div>
              <div className="p-2 bg-[#0e1b2f] rounded-lg border border-[#233857]">
                <div className="text-[11px] text-slate-400">{language === 'vi' ? 'Dòng điện (I)' : 'Current (I)'}</div>
                <div className="font-mono text-sky-400 font-semibold mt-0.5">{metrics.current.toFixed(3)} A</div>
              </div>
            </div>
          </div>

          {/* 4. Safety Guarantee */}
          <div className="p-3 bg-[#0d1c31] border border-[#22395b] rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">
                {language === 'vi' ? 'Mô phỏng an toàn 100%' : '100% Safe Simulation'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {language === 'vi'
                  ? 'Tích hợp tự động ngắt khi quá tải điện áp và cảnh báo nhiệt độ sôi theo tiêu chuẩn giáo dục.'
                  : 'Equipped with automatic circuit overload tripping and safe phase change tracking.'}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* MODALS */}
      {/* 1. Oscilloscope Modal */}
      <OscilloscopeModal
        isOpen={showOscilloscope}
        onClose={() => setShowOscilloscope(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        isSimRunning={isSimRunning}
        onToggleSim={() => setIsSimRunning(r => !r)}
        language={language}
      />

      {/* 2. Challenges Modal */}
      <LabChallengesModal
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        challenges={LAB_CHALLENGES}
        metrics={metrics}
        devices={devices}
        onSelectExperiment={mode => handleSwitchExperiment(mode as ExperimentMode)}
        language={language}
      />

      {/* 3. Lab Report Modal */}
      <LabReportModal
        isOpen={showLabReport}
        onClose={() => setShowLabReport(false)}
        metrics={metrics}
        devices={devices}
        expMode={expMode}
        language={language}
      />

      {/* 4. 3D Model Explorer Modal */}
      <ModelViewer3DModal
        isOpen={showModelViewer}
        onClose={() => setShowModelViewer(false)}
        initialModelId={initialModelId}
        language={language}
      />
    </div>
  );
}
