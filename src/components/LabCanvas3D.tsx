import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LabDevice, LabPerson, PhysicsMetrics, DeviceConnection, TerminalPort } from '../types/physics';
import { getDeviceTerminalPort } from '../utils/physicsEngine';
import { soundFx } from '../utils/audio';
import { RotateCw, ZoomIn, ZoomOut, Eye, Grid, Box, Compass, Move, Cable, RefreshCw, Trash2 } from 'lucide-react';
import { ANIME_AVATARS, ANIME_DIALOGUES } from '../assets/characters';

interface DevicePortInfo {
  port: TerminalPort;
  labelVi: string;
  labelEn: string;
  color: string;
  relX: number;
  relY: number;
  relZ: number;
}

const getDevicePorts = (d: LabDevice): DevicePortInfo[] => {
  switch (d.type) {
    case 'battery':
      return [
        { port: 'positive', labelVi: '(+) Dương (Anode)', labelEn: '(+) Positive (Anode)', color: '#ef4444', relX: 8, relY: 0, relZ: 50 },
        { port: 'negative', labelVi: '(-) Âm (Cathode)', labelEn: '(-) Negative (Cathode)', color: '#0f172a', relX: -8, relY: 0, relZ: 50 },
      ];
    case 'bulb':
      return [
        { port: 'a', labelVi: 'Cực 1 (Đui ren)', labelEn: 'Terminal 1', color: '#38bdf8', relX: -12, relY: 0, relZ: 8 },
        { port: 'b', labelVi: 'Cực 2 (Đáy ren)', labelEn: 'Terminal 2', color: '#f59e0b', relX: 12, relY: 0, relZ: 8 },
      ];
    case 'switch':
      return [
        { port: 'in', labelVi: 'Ngõ vào (Cọc 1)', labelEn: 'Input Terminal', color: '#f59e0b', relX: -16, relY: 0, relZ: 6 },
        { port: 'out', labelVi: 'Ngõ ra (Cọc 2)', labelEn: 'Output Terminal', color: '#f59e0b', relX: 16, relY: 0, relZ: 6 },
      ];
    case 'resistor':
      return [
        { port: 'left', labelVi: 'Chân trái (A)', labelEn: 'Left Lead (A)', color: '#cbd5e1', relX: -36, relY: 0, relZ: 8 },
        { port: 'right', labelVi: 'Chân phải (B)', labelEn: 'Right Lead (B)', color: '#cbd5e1', relX: 36, relY: 0, relZ: 8 },
      ];
    case 'multimeter':
      return [
        { port: 'positive', labelVi: 'Que đỏ (+ V/Ω)', labelEn: 'Red Probe (+)', color: '#ef4444', relX: -8, relY: 14, relZ: 6 },
        { port: 'negative', labelVi: 'Que đen (- COM)', labelEn: 'Black Probe (COM)', color: '#0f172a', relX: 8, relY: 14, relZ: 6 },
      ];
    case 'burner':
      return [
        { port: 'left', labelVi: 'Cực L', labelEn: 'Terminal L', color: '#ef4444', relX: -22, relY: 0, relZ: 12 },
        { port: 'right', labelVi: 'Cực N', labelEn: 'Terminal N', color: '#0f172a', relX: 22, relY: 0, relZ: 12 },
      ];
    case 'weight':
      return [
        { port: 'a', labelVi: 'Quai móc quả cân (Hook loop)', labelEn: 'Suspension Hook', color: '#eab308', relX: 0, relY: 0, relZ: 38 },
      ];
    default:
      return [];
  }
};

interface LabCanvas3DProps {
  devices: LabDevice[];
  people: LabPerson[];
  metrics: PhysicsMetrics;
  selectedDeviceId: string | null;
  onSelectDevice: (device: LabDevice | null) => void;
  onUpdateDevice: (updated: LabDevice) => void;
  onUpdatePerson: (person: LabPerson) => void;
  isSimRunning: boolean;
  language: 'vi' | 'en';
  onOpenModelViewer?: (modelId?: string) => void;
  connections?: DeviceConnection[];
  onAddConnection?: (conn: DeviceConnection) => void;
  onRemoveConnection?: (connId: string) => void;
  onClearConnections?: () => void;
  onResetPresetConnections?: () => void;
}

export const LabCanvas3D: React.FC<LabCanvas3DProps> = ({
  devices,
  people,
  metrics,
  selectedDeviceId,
  onSelectDevice,
  onUpdateDevice,
  onUpdatePerson,
  isSimRunning,
  language,
  onOpenModelViewer,
  connections = [],
  onAddConnection,
  onRemoveConnection,
  onClearConnections,
  onResetPresetConnections,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera state
  const [yaw, setYaw] = useState<number>(-0.35); // rotation around Y axis
  const [pitch, setPitch] = useState<number>(0.55); // tilt angle (0 to pi/2)
  const [zoom, setZoom] = useState<number>(1.1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(10);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(false);

  // Active Tool Mode: 'move' (drag/drop apparatus) vs 'wire' (connect electrical terminals)
  const [activeTool, setActiveTool] = useState<'move' | 'wire'>('move');
  const [wireColor, setWireColor] = useState<string>('#ef4444');
  const [wiringStart, setWiringStart] = useState<{ deviceId: string; port: TerminalPort; x: number; y: number } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ deviceId: string; port: TerminalPort; screenX: number; screenY: number; labelVi: string; labelEn: string } | null>(null);
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);

  // Dragging state
  const isDraggingRef = useRef<boolean>(false);
  const dragModeRef = useRef<'orbit' | 'pan' | 'device' | 'person' | 'spring' | 'pendulum'>('orbit');
  const draggedItemIdRef = useRef<string | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialDevPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseMovedDistRef = useRef<number>(0);
  const currentMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animation frame
  const animFrameIdRef = useRef<number | null>(null);
  const electronPhaseRef = useRef<number>(0);
  const steamParticlesRef = useRef<Array<{ x: number; y: number; vy: number; alpha: number; r: number }>>([]);

  // Anime character image references
  const teacherImgRef = useRef<HTMLImageElement | null>(null);
  const studentImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const tImg = new Image();
    tImg.src = ANIME_AVATARS.teacher;
    tImg.onload = () => {
      teacherImgRef.current = tImg;
    };
    teacherImgRef.current = tImg;

    const sImg = new Image();
    sImg.src = ANIME_AVATARS.student;
    sImg.onload = () => {
      studentImgRef.current = sImg;
    };
    studentImgRef.current = sImg;
  }, []);

  // 3D to 2D perspective projection function
  const project3D = useCallback((x: number, y: number, z: number, width: number, height: number) => {
    // 1. Rotate around Y (yaw)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;

    // 2. Rotate around X (pitch)
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const y2 = y1 * cosP - z * sinP;
    const z2 = y1 * sinP + z * cosP;

    // 3. Perspective screen projection with zoom & pan
    const fov = 1100;
    const perspective = fov / (fov - z2 * 0.35);
    const scaleFactor = zoom * 1.35 * perspective;
    const screenX = width / 2 + (x1 + panX) * scaleFactor;
    const screenY = height / 2 + (y2 + panY) * scaleFactor;

    return {
      x: screenX,
      y: screenY,
      depth: z2, // for depth sorting
      scale: scaleFactor,
    };
  }, [yaw, pitch, zoom, panX, panY]);

  // Set camera presets
  const handleResetCamera = (view: 'isometric' | 'top' | 'front') => {
    if (view === 'isometric') {
      setYaw(-0.35);
      setPitch(0.55);
      setZoom(1.1);
      setPanX(0);
      setPanY(10);
    } else if (view === 'top') {
      setYaw(0);
      setPitch(1.35);
      setZoom(1.0);
      setPanX(0);
      setPanY(0);
    } else if (view === 'front') {
      setYaw(0);
      setPitch(0.12);
      setZoom(1.2);
      setPanX(0);
      setPanY(40);
    }
  };

  // Main drawing routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrameId: number;

    const render = () => {
      // Auto-orbit camera rotation
      if (isAutoOrbit && !isDraggingRef.current) {
        setYaw(y => y + 0.004);
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * window.devicePixelRatio || canvas.height !== h * window.devicePixelRatio) {
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
      }
      ctx.resetTransform();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // 1. Background Lab Room Gradient
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2 - 50, 40, w / 2, h / 2, Math.max(w, h));
      bgGrad.addColorStop(0, '#162846');
      bgGrad.addColorStop(0.5, '#0b182b');
      bgGrad.addColorStop(1, '#050c17');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Draw 3D Laboratory Table
      const tableW = 340;
      const tableL = 220;
      const tableH = 18;

      // Table Corners in 3D: Top surface
      const tTop = [
        project3D(-tableW, -tableL, 0, w, h),
        project3D(tableW, -tableL, 0, w, h),
        project3D(tableW, tableL, 0, w, h),
        project3D(-tableW, tableL, 0, w, h),
      ];

      // Table Bottom rim
      const tBot = [
        project3D(-tableW, -tableL, -tableH, w, h),
        project3D(tableW, -tableL, -tableH, w, h),
        project3D(tableW, tableL, -tableH, w, h),
        project3D(-tableW, tableL, -tableH, w, h),
      ];

      // Floor Shadow
      const shadowPts = [
        project3D(-tableW - 30, -tableL - 30, -140, w, h),
        project3D(tableW + 30, -tableL - 30, -140, w, h),
        project3D(tableW + 40, tableL + 40, -140, w, h),
        project3D(-tableW - 20, tableL + 40, -140, w, h),
      ];
      ctx.beginPath();
      ctx.moveTo(shadowPts[0].x, shadowPts[0].y);
      for (let i = 1; i < shadowPts.length; i++) ctx.lineTo(shadowPts[i].x, shadowPts[i].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.filter = 'blur(14px)';
      ctx.fill();
      ctx.filter = 'none';

      // Table Legs
      const legOffsets = [
        [-tableW + 35, -tableL + 35],
        [tableW - 35, -tableL + 35],
        [tableW - 35, tableL - 35],
        [-tableW + 35, tableL - 35],
      ];
      legOffsets.forEach(([lx, ly]) => {
        const topP = project3D(lx, ly, -tableH, w, h);
        const botP = project3D(lx, ly, -135, w, h);
        ctx.beginPath();
        ctx.moveTo(topP.x - 5 * zoom, topP.y);
        ctx.lineTo(topP.x + 5 * zoom, topP.y);
        ctx.lineTo(botP.x + 5 * zoom, botP.y);
        ctx.lineTo(botP.x - 5 * zoom, botP.y);
        ctx.closePath();
        const legGrad = ctx.createLinearGradient(topP.x - 5, topP.y, topP.x + 5, topP.y);
        legGrad.addColorStop(0, '#1e293b');
        legGrad.addColorStop(0.5, '#475569');
        legGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = legGrad;
        ctx.fill();
      });

      // Table Edges (Sides)
      // Front and side thickness panels
      const drawPanel = (p1: typeof tTop[0], p2: typeof tTop[0], p3: typeof tBot[0], p4: typeof tBot[0], color: string) => {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
      };
      drawPanel(tTop[3], tTop[2], tBot[2], tBot[3], '#293a54');
      drawPanel(tTop[2], tTop[1], tBot[1], tBot[2], '#1e2c40');

      // Table Top Surface
      ctx.beginPath();
      ctx.moveTo(tTop[0].x, tTop[0].y);
      ctx.lineTo(tTop[1].x, tTop[1].y);
      ctx.lineTo(tTop[2].x, tTop[2].y);
      ctx.lineTo(tTop[3].x, tTop[3].y);
      ctx.closePath();

      const tableGrad = ctx.createLinearGradient(tTop[0].x, tTop[0].y, tTop[2].x, tTop[2].y);
      tableGrad.addColorStop(0, '#1b2c45');
      tableGrad.addColorStop(0.4, '#243b5c');
      tableGrad.addColorStop(1, '#18273e');
      ctx.fillStyle = tableGrad;
      ctx.fill();
      ctx.strokeStyle = '#476796';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Table Grid Lines (Lab bench coordinate markings)
      if (showGrid) {
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 150, 220, 0.15)';
        ctx.lineWidth = 1;
        for (let gx = -300; gx <= 300; gx += 50) {
          const pStart = project3D(gx, -tableL + 10, 0.5, w, h);
          const pEnd = project3D(gx, tableL - 10, 0.5, w, h);
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
          ctx.stroke();
        }
        for (let gy = -180; gy <= 180; gy += 45) {
          const pStart = project3D(-tableW + 10, gy, 0.5, w, h);
          const pEnd = project3D(tableW - 10, gy, 0.5, w, h);
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Bulb Dynamic Glow Cast on Table
      const bulb = devices.find(d => d.type === 'bulb');
      const knifeSwitch = devices.find(d => d.type === 'switch');
      const isSwitchClosed = knifeSwitch ? knifeSwitch.switchClosed !== false : true;
      const isBulbLit = Boolean(bulb && isSwitchClosed && metrics.power > 0.5);

      if (isBulbLit && bulb) {
        const bulbP = project3D(bulb.x, bulb.y, 0, w, h);
        const glowRadius = Math.min(240, 50 + metrics.power * 10) * zoom;
        const glow = ctx.createRadialGradient(bulbP.x, bulbP.y, 5, bulbP.x, bulbP.y, glowRadius);
        glow.addColorStop(0, 'rgba(255, 230, 110, 0.55)');
        glow.addColorStop(0.3, 'rgba(255, 190, 50, 0.28)');
        glow.addColorStop(0.8, 'rgba(255, 140, 20, 0.08)');
        glow.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(bulbP.x, bulbP.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 1. Dragging Drop-Shadow & Coordinate Beacon on Table
      if (draggedItemIdRef.current && isDraggingRef.current && dragModeRef.current === 'device') {
        const targetDev = devices.find(d => d.id === draggedItemIdRef.current);
        if (targetDev) {
          const baseTable = project3D(targetDev.x, targetDev.y, 0.4, w, h);
          const topDev = project3D(targetDev.x, targetDev.y, 25, w, h);

          ctx.save();
          // Drop line
          ctx.beginPath();
          ctx.moveTo(topDev.x, topDev.y);
          ctx.lineTo(baseTable.x, baseTable.y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Landing target circle
          ctx.beginPath();
          ctx.ellipse(baseTable.x, baseTable.y, 35 * zoom, 18 * zoom, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Coordinate label
          const coordText = `X: ${Math.round(targetDev.x)}, Y: ${Math.round(targetDev.y)}`;
          ctx.font = `bold 11px monospace`;
          const cW = ctx.measureText(coordText).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.roundRect(baseTable.x - cW / 2 - 8, baseTable.y + 20, cW + 16, 20, 6);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'center';
          ctx.fillText(coordText, baseTable.x, baseTable.y + 34);
          ctx.restore();
        }
      }

      // 2. Electric Wires Connection Path (Dynamic flexible wires from connections)
      const hasWires = connections && connections.length > 0;
      if (hasWires) {
        ctx.save();
        connections.forEach(conn => {
          const fromDev = devices.find(d => d.id === conn.fromDeviceId);
          const toDev = devices.find(d => d.id === conn.toDeviceId);
          if (!fromDev || !toDev) return;

          const pA3D = getDeviceTerminalPort(fromDev, conn.fromPort);
          const pB3D = getDeviceTerminalPort(toDev, conn.toPort);

          const pA = project3D(pA3D.x, pA3D.y, pA3D.z, w, h);
          const pB = project3D(pB3D.x, pB3D.y, pB3D.z, w, h);

          // Catenary sag mid point in 3D
          const midX = (pA3D.x + pB3D.x) / 2;
          const midY = (pA3D.y + pB3D.y) / 2;
          const dist3D = Math.hypot(pA3D.x - pB3D.x, pA3D.y - pB3D.y);
          const midZ = Math.max(0, Math.min(pA3D.z, pB3D.z) * 0.3 - Math.min(10, dist3D * 0.05));
          const pMid = project3D(midX, midY, midZ, w, h);

          const isHovered = hoveredWireId === conn.id;

          // Wire Cast Shadow on Table
          const shadowA = project3D(pA3D.x, pA3D.y, 0.4, w, h);
          const shadowB = project3D(pB3D.x, pB3D.y, 0.4, w, h);
          const shadowMid = project3D(midX, midY, 0.4, w, h);
          ctx.beginPath();
          ctx.moveTo(shadowA.x, shadowA.y);
          ctx.quadraticCurveTo(shadowMid.x, shadowMid.y, shadowB.x, shadowB.y);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 4 * zoom;
          ctx.stroke();

          // Main Wire Body
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.quadraticCurveTo(pMid.x, pMid.y, pB.x, pB.y);
          ctx.strokeStyle = isHovered ? '#f43f5e' : (conn.color || '#38bdf8');
          ctx.lineWidth = (isHovered ? 5.5 : 3.8) * zoom;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Wire Core Highlight
          ctx.beginPath();
          ctx.moveTo(pA.x, pA.y);
          ctx.quadraticCurveTo(pMid.x, pMid.y, pB.x, pB.y);
          ctx.strokeStyle = isHovered ? '#fecdd3' : 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.2 * zoom;
          ctx.stroke();

          // Terminal Plugs at ends
          [pA, pB].forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4 * zoom, 0, Math.PI * 2);
            ctx.fillStyle = conn.color || '#e2e8f0';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          });

          // Electron animation along this wire if current flows
          if (metrics.current > 0.05 && isSimRunning) {
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 6;
            for (let t = 0.15; t < 0.95; t += 0.28) {
              const u = (t + electronPhaseRef.current) % 1;
              const ex = Math.pow(1 - u, 2) * pA.x + 2 * (1 - u) * u * pMid.x + Math.pow(u, 2) * pB.x;
              const ey = Math.pow(1 - u, 2) * pA.y + 2 * (1 - u) * u * pMid.y + Math.pow(u, 2) * pB.y;
              ctx.beginPath();
              ctx.arc(ex, ey, 2.8 * zoom, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowBlur = 0;
          }
        });
        ctx.restore();
      } else if (devices.some(d => d.type === 'battery' || d.type === 'bulb' || d.type === 'switch')) {
        // Fallback default wire loop if connections not initialized yet
        const bat = devices.find(d => d.type === 'battery');
        const sw = devices.find(d => d.type === 'switch');
        const res = devices.find(d => d.type === 'resistor');
        const blb = devices.find(d => d.type === 'bulb');

        const circuitNodes: Array<{ x: number; y: number }> = [];
        if (bat) circuitNodes.push({ x: bat.x + 25, y: bat.y });
        if (sw) circuitNodes.push({ x: sw.x, y: sw.y });
        if (res) circuitNodes.push({ x: res.x, y: res.y });
        if (blb) circuitNodes.push({ x: blb.x, y: blb.y });
        if (bat) circuitNodes.push({ x: bat.x - 25, y: bat.y });

        if (circuitNodes.length >= 2) {
          ctx.save();
          ctx.beginPath();
          const startPt = project3D(circuitNodes[0].x, circuitNodes[0].y, 5, w, h);
          ctx.moveTo(startPt.x, startPt.y);
          for (let i = 1; i < circuitNodes.length; i++) {
            const nextPt = project3D(circuitNodes[i].x, circuitNodes[i].y, 5, w, h);
            ctx.lineTo(nextPt.x, nextPt.y);
          }
          ctx.strokeStyle = isSwitchClosed && metrics.current > 0 ? '#38bdf8' : '#64748b';
          ctx.lineWidth = 3.5 * zoom;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          ctx.restore();
        }
      }

      // 3. Render Terminal Port Rings (when in wire tool mode or when hovering)
      if (activeTool === 'wire' || wiringStart !== null) {
        ctx.save();
        devices.forEach(d => {
          const ports = getDevicePorts(d);
          ports.forEach(portInfo => {
            const pt3D = { x: d.x + portInfo.relX, y: d.y + portInfo.relY, z: portInfo.relZ };
            const pt = project3D(pt3D.x, pt3D.y, pt3D.z, w, h);
            const isHovered = hoveredPort?.deviceId === d.id && hoveredPort?.port === portInfo.port;
            const isStart = wiringStart?.deviceId === d.id && wiringStart?.port === portInfo.port;

            // Halo glow
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, (isHovered || isStart ? 11 : 7.5) * zoom, 0, Math.PI * 2);
            ctx.fillStyle = isStart
              ? 'rgba(239, 68, 68, 0.45)'
              : isHovered
              ? 'rgba(56, 189, 248, 0.45)'
              : 'rgba(255, 255, 255, 0.28)';
            ctx.fill();

            // Port bead
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4.5 * zoom, 0, Math.PI * 2);
            ctx.fillStyle = portInfo.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Label tag
            if (isHovered || isStart) {
              const label = language === 'vi' ? portInfo.labelVi : portInfo.labelEn;
              ctx.font = `bold ${Math.round(10 * zoom)}px sans-serif`;
              const textW = ctx.measureText(label).width;
              ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
              ctx.roundRect(pt.x - textW / 2 - 6, pt.y - 24 * zoom, textW + 12, 18 * zoom, 4);
              ctx.fill();
              ctx.strokeStyle = portInfo.color;
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.fillStyle = '#f8fafc';
              ctx.textAlign = 'center';
              ctx.fillText(label, pt.x, pt.y - 11 * zoom);
            }
          });
        });

        // Dynamic rubber-band stretching wire to mouse
        if (wiringStart && currentMousePosRef.current) {
          const fromDev = devices.find(d => d.id === wiringStart.deviceId);
          if (fromDev) {
            const pStart3D = getDeviceTerminalPort(fromDev, wiringStart.port);
            const pStart = project3D(pStart3D.x, pStart3D.y, pStart3D.z, w, h);
            const mPos = currentMousePosRef.current;

            ctx.beginPath();
            ctx.moveTo(pStart.x, pStart.y);
            const midX = (pStart.x + mPos.x) / 2;
            const midY = (pStart.y + mPos.y) / 2 + 15 * zoom;
            ctx.quadraticCurveTo(midX, midY, mPos.x, mPos.y);
            ctx.strokeStyle = wireColor;
            ctx.lineWidth = 3.5 * zoom;
            ctx.lineCap = 'round';
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Tip bead
            ctx.beginPath();
            ctx.arc(mPos.x, mPos.y, 5 * zoom, 0, Math.PI * 2);
            ctx.fillStyle = wireColor;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Collect renderable items for depth sorting
      type RenderableItem = 
        | { kind: 'device'; data: LabDevice; depth: number }
        | { kind: 'person'; data: LabPerson; depth: number };

      const renderables: RenderableItem[] = [];

      devices.forEach(d => {
        const p = project3D(d.x, d.y, d.z, w, h);
        renderables.push({ kind: 'device', data: d, depth: p.depth });
      });

      people.forEach(person => {
        const p = project3D(person.x, person.y, 0, w, h);
        renderables.push({ kind: 'person', data: person, depth: p.depth });
      });

      // Sort by depth (farthest first)
      renderables.sort((a, b) => a.depth - b.depth);

      // Render items
      renderables.forEach(item => {
        if (item.kind === 'person') {
          drawLabPerson(ctx, item.data, w, h);
        } else {
          drawLabDevice(ctx, item.data, w, h);
        }
      });

      // Update and draw steam particles if heater is boiling
      const thermo = devices.find(d => d.type === 'thermometer');
      if (thermo && thermo.temperature && thermo.temperature >= 85 && isSimRunning) {
        if (Math.random() < 0.4) {
          steamParticlesRef.current.push({
            x: thermo.x + (Math.random() * 20 - 10),
            y: thermo.y + (Math.random() * 20 - 10),
            vy: 1.5 + Math.random() * 1.5,
            alpha: 0.65,
            r: 5 + Math.random() * 7,
          });
        }
      }

      // Draw steam particles
      ctx.save();
      steamParticlesRef.current.forEach((sp, idx) => {
        sp.y -= 0.2;
        sp.alpha -= 0.015;
        sp.r += 0.3;
        const p = project3D(sp.x, sp.y, 45 + (1 - sp.alpha) * 35, w, h);
        ctx.beginPath();
        ctx.arc(p.x, p.y, sp.r * zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${Math.max(0, sp.alpha * 0.45)})`;
        ctx.fill();
      });
      steamParticlesRef.current = steamParticlesRef.current.filter(sp => sp.alpha > 0);
      ctx.restore();

      // Draw 3D Orientation Gizmo in bottom-right corner (X-Y hướng toạ độ)
      draw3DAxisGizmo(ctx, w - 52, h - 52);

      localFrameId = requestAnimationFrame(render);
    };

    localFrameId = requestAnimationFrame(render);
    animFrameIdRef.current = localFrameId;

    return () => {
      cancelAnimationFrame(localFrameId);
    };
  }, [devices, people, metrics, yaw, pitch, zoom, panX, panY, showGrid, showVectors, isAutoOrbit, project3D, isSimRunning, selectedDeviceId, language]);

  // Helper: Draw 3D Orientation Axes Gizmo in corner (X-Red, Y-Green, Z-Blue)
  const draw3DAxisGizmo = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    const len = 22;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    const projectAxis = (ax: number, ay: number, az: number) => {
      const x1 = ax * cosY - ay * sinY;
      const y1 = ax * sinY + ay * cosY;
      const y2 = y1 * cosP - az * sinP;
      return { x: cx + x1 * len, y: cy + y2 * len };
    };

    const pX = projectAxis(1, 0, 0);
    const pY = projectAxis(0, 1, 0);
    const pZ = projectAxis(0, 0, 1);

    ctx.save();
    // Backdrop disk
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 20, 36, 0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle compass ring
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mini title / axis label
    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('X - Y', cx, cy - 20);

    // Center pivot point
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();

    // Helper to draw an axis with a dot at end
    const drawAxis = (p: { x: number; y: number }, color: string, label: string) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Text offset
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const tx = p.x + (dx / dist) * 7;
      const ty = p.y + (dy / dist) * 7 + 3;

      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      ctx.fillText(label, tx, ty);
    };

    // Draw axes
    drawAxis(pX, '#ef4444', 'X');
    drawAxis(pY, '#22c55e', 'Y');
    drawAxis(pZ, '#38bdf8', 'Z');

    ctx.restore();
  };

  // Helper: Draw Device
  const drawLabDevice = (ctx: CanvasRenderingContext2D, d: LabDevice, w: number, h: number) => {
    const isSelected = d.id === selectedDeviceId;
    const baseP = project3D(d.x, d.y, 0, w, h);

    ctx.save();

    // Selection Halo
    if (isSelected) {
      ctx.beginPath();
      ctx.ellipse(baseP.x, baseP.y, 35 * zoom, 22 * zoom, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    switch (d.type) {
      case 'battery': {
        const height = 48;
        const pTop = project3D(d.x, d.y, height, w, h);
        const pBot = baseP;
        const r = 20 * zoom;

        // Shadow
        ctx.beginPath();
        ctx.ellipse(pBot.x, pBot.y, 24 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // 3D Battery Cylinder Body with metallic lighting gradient
        ctx.beginPath();
        ctx.rect(pBot.x - r, pTop.y, r * 2, pBot.y - pTop.y);
        const batGrad = ctx.createLinearGradient(pBot.x - r, 0, pBot.x + r, 0);
        batGrad.addColorStop(0, '#0f2757');
        batGrad.addColorStop(0.2, '#1e40af');
        batGrad.addColorStop(0.5, '#60a5fa');
        batGrad.addColorStop(0.7, '#1d4ed8');
        batGrad.addColorStop(1, '#0b192e');
        ctx.fillStyle = batGrad;
        ctx.fill();
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Top Disc Cap
        ctx.beginPath();
        ctx.ellipse(pTop.x, pTop.y, r, 8 * zoom, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1e3a8a';
        ctx.fill();
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Red Positive (+) Terminal Stud
        const posP = project3D(d.x + 8, d.y, height + 9, w, h);
        ctx.beginPath();
        ctx.arc(posP.x, posP.y, 4.5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Black Negative (-) Terminal Stud
        const negP = project3D(d.x - 8, d.y, height + 6, w, h);
        ctx.beginPath();
        ctx.arc(negP.x, negP.y, 4 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Front Volumetric Voltage Readout
        ctx.font = `bold ${Math.round(11 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.batteryVoltage ?? 9}V DC`, pBot.x, pTop.y + (pBot.y - pTop.y) / 2 + 4);
        break;
      }

      case 'bulb': {
        const isSwClosed = devices.find(dev => dev.type === 'switch')?.switchClosed !== false;
        const isLit = isSwClosed && metrics.power > 0.5;

        // 3D Brass Edison Screw Base
        for (let ring = 0; ring < 3; ring++) {
          const zRing = ring * 5;
          const pRing = project3D(d.x, d.y, zRing, w, h);
          ctx.beginPath();
          ctx.ellipse(pRing.x, pRing.y, 11 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ca8a04';
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.2 * zoom;
          ctx.stroke();
        }

        // Glass Bulb Dome in 3D
        const domeH = 44;
        const pDome = project3D(d.x, d.y, domeH, w, h);
        const domeR = 21 * zoom;

        // Volumetric Incandescent Glow
        if (isLit) {
          const bulbGlow = ctx.createRadialGradient(pDome.x - 4, pDome.y - 5, 2, pDome.x, pDome.y, domeR * 1.6);
          bulbGlow.addColorStop(0, '#ffffff');
          bulbGlow.addColorStop(0.25, '#fef08a');
          bulbGlow.addColorStop(0.65, '#f59e0b');
          bulbGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = bulbGlow;
          ctx.beginPath();
          ctx.arc(pDome.x, pDome.y, domeR * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glass Sphere with Specular Reflection Arcs
        ctx.beginPath();
        ctx.arc(pDome.x, pDome.y, domeR, 0, Math.PI * 2);
        ctx.fillStyle = isLit ? 'rgba(254, 240, 138, 0.45)' : 'rgba(203, 213, 225, 0.25)';
        ctx.fill();
        ctx.strokeStyle = isLit ? '#fef08a' : '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glass Reflection Sheen
        ctx.beginPath();
        ctx.arc(pDome.x - 7 * zoom, pDome.y - 7 * zoom, 6 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // 3D Tungsten Filament Spiral
        ctx.beginPath();
        ctx.moveTo(pDome.x - 7 * zoom, pDome.y + 7 * zoom);
        ctx.lineTo(pDome.x - 3 * zoom, pDome.y - 5 * zoom);
        ctx.lineTo(pDome.x + 3 * zoom, pDome.y - 5 * zoom);
        ctx.lineTo(pDome.x + 7 * zoom, pDome.y + 7 * zoom);
        ctx.strokeStyle = isLit ? '#ffffff' : '#64748b';
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();

        // Power Tag
        if (isLit) {
          ctx.font = `bold ${Math.round(10 * zoom)}px 'JetBrains Mono', sans-serif`;
          ctx.fillStyle = '#fde047';
          ctx.textAlign = 'center';
          ctx.fillText(`${metrics.power.toFixed(1)}W`, pDome.x, pDome.y - domeR - 5);
        }
        break;
      }

      case 'switch': {
        const isClosed = d.switchClosed !== false;
        // 3D Phenolic Base Plate
        const p1 = project3D(d.x - 26, d.y - 14, 4, w, h);
        const p2 = project3D(d.x + 26, d.y - 14, 4, w, h);
        const p3 = project3D(d.x + 26, d.y + 14, 4, w, h);
        const p4 = project3D(d.x - 26, d.y + 14, 4, w, h);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brass Contact Studs
        const stud1 = project3D(d.x - 16, d.y, 6, w, h);
        const stud2 = project3D(d.x + 16, d.y, 6, w, h);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(stud1.x, stud1.y, 4.5 * zoom, 0, Math.PI * 2);
        ctx.arc(stud2.x, stud2.y, 4.5 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // 3D Knife Blade Arm
        const bladeEnd = isClosed
          ? project3D(d.x + 16, d.y, 7, w, h)
          : project3D(d.x + 8, d.y - 18, 32, w, h);

        ctx.beginPath();
        ctx.moveTo(stud1.x, stud1.y);
        ctx.lineTo(bladeEnd.x, bladeEnd.y);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4.5 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Insulated Handle at tip
        if (!isClosed) {
          ctx.beginPath();
          ctx.arc(bladeEnd.x, bladeEnd.y, 4 * zoom, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        }

        // Label
        ctx.font = `bold ${Math.round(10 * zoom)}px sans-serif`;
        ctx.fillStyle = isClosed ? '#4ade80' : '#f87171';
        ctx.textAlign = 'center';
        ctx.fillText(isClosed ? (language === 'vi' ? 'ĐÓNG (ON)' : 'CLOSED (ON)') : (language === 'vi' ? 'MỞ (OFF)' : 'OPEN (OFF)'), baseP.x, baseP.y + 24 * zoom);
        break;
      }

      case 'resistor': {
        const rP1 = project3D(d.x - 24, d.y, 8, w, h);
        const rP2 = project3D(d.x + 24, d.y, 8, w, h);
        const wLen = rP2.x - rP1.x;
        const bodyH = 14 * zoom;

        // 3D Axial Wire leads
        ctx.beginPath();
        ctx.moveTo(rP1.x - 16 * zoom, rP1.y);
        ctx.lineTo(rP2.x + 16 * zoom, rP2.y);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5 * zoom;
        ctx.stroke();

        // 3D Ceramic Resistor Body with Cylindrical Specular Gradient
        ctx.beginPath();
        ctx.roundRect(rP1.x, rP1.y - bodyH / 2, wLen, bodyH, 4 * zoom);
        const resGrad = ctx.createLinearGradient(0, rP1.y - bodyH / 2, 0, rP1.y + bodyH / 2);
        resGrad.addColorStop(0, '#78350f');
        resGrad.addColorStop(0.3, '#fde68a');
        resGrad.addColorStop(0.7, '#d97706');
        resGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = resGrad;
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 4 Color code bands with 3D wrap
        const bandColors = ['#b45309', '#000000', '#dc2626', '#fbbf24'];
        bandColors.forEach((color, idx) => {
          const bx = rP1.x + 10 * zoom + idx * 7.5 * zoom;
          ctx.beginPath();
          ctx.rect(bx, rP1.y - bodyH / 2, 3.5 * zoom, bodyH);
          ctx.fillStyle = color;
          ctx.fill();
        });

        // Value text
        ctx.font = `bold ${Math.round(10 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.resistorResistance ?? 10}Ω`, baseP.x, baseP.y + 22 * zoom);
        break;
      }

      case 'spring': {
        const k = d.springK ?? 50;
        const xDisp = d.springDisplacement ?? 0.15; // displacement in meters

        // 3D Rigid Steel Wall Bracket
        const anchorP = project3D(d.x - 120, d.y, 35, w, h);
        const anchorBaseP = project3D(d.x - 120, d.y, 0, w, h);

        ctx.beginPath();
        ctx.moveTo(anchorBaseP.x, anchorBaseP.y);
        ctx.lineTo(anchorP.x, anchorP.y);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 8 * zoom;
        ctx.stroke();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4 * zoom;
        ctx.stroke();

        // Spring Coils in 3D
        const restLen = 140; // pixel length
        const stretchPx = xDisp * 400; // scale
        const currentLen = Math.max(40, restLen + stretchPx);
        const massX = d.x - 120 + currentLen;
        const massP = project3D(massX, d.y, 35, w, h);

        ctx.save();
        const coils = 12;
        for (let i = 0; i < coils; i++) {
          const frac1 = i / coils;
          const frac2 = (i + 1) / coils;
          const cx1 = d.x - 120 + frac1 * currentLen;
          const cx2 = d.x - 120 + frac2 * currentLen;
          const cp1 = project3D(cx1, d.y - 12, 35, w, h);
          const cp2 = project3D(cx2, d.y + 12, 35, w, h);

          // Back coil half (darker)
          ctx.beginPath();
          ctx.moveTo(cp1.x, cp1.y);
          ctx.quadraticCurveTo((cp1.x + cp2.x) / 2, cp1.y - 8 * zoom, cp2.x, cp2.y);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2.5 * zoom;
          ctx.stroke();

          // Front coil half (bright metallic)
          ctx.beginPath();
          ctx.moveTo(cp1.x, cp1.y);
          ctx.quadraticCurveTo((cp1.x + cp2.x) / 2, cp1.y + 8 * zoom, cp2.x, cp2.y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5 * zoom;
          ctx.stroke();
        }
        ctx.restore();

        // 3D Machined Brass/Steel Calibration Weight on Spring
        const spMass = d.mass ?? 0.5;
        const spMassLabel = spMass >= 1 ? `${spMass.toFixed(1)}kg` : `${Math.round(spMass * 1000)}g`;
        const spScale = Math.max(0.75, Math.min(1.35, Math.cbrt(spMass / 0.5)));
        const rW = 14 * zoom * spScale;
        const hW = 24 * spScale;

        // Top suspension eyelet / hook attached to spring
        ctx.beginPath();
        ctx.arc(massP.x, massP.y - hW / 2 - 4 * zoom, 4.5 * zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5 * zoom;
        ctx.stroke();

        // Knob Head
        const rKnobW = rW * 0.75;
        ctx.beginPath();
        ctx.ellipse(massP.x, massP.y - hW / 2 + 2, rKnobW, rKnobW * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();

        // Main Cylindrical Body
        ctx.beginPath();
        ctx.roundRect(massP.x - rW, massP.y - hW / 2 + 5, rW * 2, hW, 3 * zoom);
        const massGrad = ctx.createLinearGradient(massP.x - rW, 0, massP.x + rW, 0);
        massGrad.addColorStop(0, '#451a03');
        massGrad.addColorStop(0.18, '#92400e');
        massGrad.addColorStop(0.38, '#d97706');
        massGrad.addColorStop(0.55, '#fef08a');
        massGrad.addColorStop(0.72, '#ca8a04');
        massGrad.addColorStop(0.9, '#78350f');
        massGrad.addColorStop(1, '#a16207');
        ctx.fillStyle = massGrad;
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Embossed Mass Text
        ctx.font = `bold ${Math.round(9 * zoom * spScale)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText(spMassLabel, massP.x, massP.y + 4);
        ctx.fillStyle = '#451a03';
        ctx.fillText(spMassLabel, massP.x, massP.y + 3);

        // Equilibrium line
        const eqP = project3D(d.x - 120 + restLen, d.y, 10, w, h);
        ctx.beginPath();
        ctx.moveTo(eqP.x, eqP.y - 15 * zoom);
        ctx.lineTo(eqP.x, eqP.y + 15 * zoom);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `${Math.round(9 * zoom)}px sans-serif`;
        ctx.fillStyle = '#facc15';
        ctx.fillText('x=0', eqP.x, eqP.y + 26 * zoom);

        // Velocity & Force vector arrow
        if (showVectors && Math.abs(metrics.velocity) > 0.05) {
          const vLen = (d.springVelocity ?? 0) * 40 * zoom;
          ctx.beginPath();
          ctx.moveTo(massP.x, massP.y - hW / 2 - 8);
          ctx.lineTo(massP.x + vLen, massP.y - hW / 2 - 8);
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          // Arrow head
          const headDir = vLen > 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(massP.x + vLen, massP.y - hW / 2 - 8);
          ctx.lineTo(massP.x + vLen - headDir * 6, massP.y - hW / 2 - 12);
          ctx.lineTo(massP.x + vLen - headDir * 6, massP.y - hW / 2 - 4);
          ctx.closePath();
          ctx.fillStyle = '#4ade80';
          ctx.fill();
        }
        break;
      }

      case 'weight': {
        const mass = d.mass ?? 0.5;
        const massKg = mass;
        const massLabel = massKg >= 1
          ? (massKg % 1 === 0 ? `${massKg.toFixed(0)}kg` : `${massKg.toFixed(1)}kg`)
          : `${Math.round(massKg * 1000)}g`;

        // Scale geometry proportionally with cube root of mass
        const s = Math.max(0.75, Math.min(1.45, Math.cbrt(mass / 0.5)));
        const rBase = 18 * zoom * s;
        const hBase = 28 * s;
        const hNeck = 7 * s;
        const hKnob = 9 * s;
        const totalH = hBase + hNeck + hKnob;

        const pBase = project3D(d.x, d.y, 0, w, h);
        const pBodyTop = project3D(d.x, d.y, hBase, w, h);
        const pNeckTop = project3D(d.x, d.y, hBase + hNeck, w, h);
        const pKnobTop = project3D(d.x, d.y, totalH, w, h);
        const pHookTop = project3D(d.x, d.y, totalH + 8 * s, w, h);

        const mat = d.weightMaterial ?? 'brass';

        // 1. Soft Realistic Contact Shadow on Workbench Surface
        ctx.beginPath();
        ctx.ellipse(pBase.x, pBase.y, rBase * 1.35, rBase * 0.65, 0, 0, Math.PI * 2);
        const shadowGrad = ctx.createRadialGradient(pBase.x, pBase.y, 2, pBase.x, pBase.y, rBase * 1.35);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.68)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.fill();

        // 2. Base Chamfer Rim (vát mép chống lật)
        ctx.beginPath();
        ctx.ellipse(pBase.x, pBase.y, rBase * 1.06, rBase * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = mat === 'brass' ? '#78350f' : mat === 'chrome' ? '#334155' : '#171717';
        ctx.fill();

        // 3. Main Cylinder Body
        ctx.beginPath();
        ctx.moveTo(pBase.x - rBase, pBase.y);
        ctx.lineTo(pBase.x - rBase, pBodyTop.y);
        ctx.lineTo(pBase.x + rBase, pBodyTop.y);
        ctx.lineTo(pBase.x + rBase, pBase.y);
        ctx.closePath();

        const bodyGrad = ctx.createLinearGradient(pBase.x - rBase, 0, pBase.x + rBase, 0);
        if (mat === 'brass') {
          bodyGrad.addColorStop(0, '#451a03');
          bodyGrad.addColorStop(0.15, '#92400e');
          bodyGrad.addColorStop(0.38, '#d97706');
          bodyGrad.addColorStop(0.55, '#fef08a');
          bodyGrad.addColorStop(0.72, '#ca8a04');
          bodyGrad.addColorStop(0.9, '#78350f');
          bodyGrad.addColorStop(1, '#a16207');
        } else if (mat === 'chrome') {
          bodyGrad.addColorStop(0, '#0f172a');
          bodyGrad.addColorStop(0.2, '#334155');
          bodyGrad.addColorStop(0.5, '#cbd5e1');
          bodyGrad.addColorStop(0.6, '#ffffff');
          bodyGrad.addColorStop(0.8, '#64748b');
          bodyGrad.addColorStop(1, '#334155');
        } else {
          bodyGrad.addColorStop(0, '#0a0a0a');
          bodyGrad.addColorStop(0.3, '#1e293b');
          bodyGrad.addColorStop(0.55, '#475569');
          bodyGrad.addColorStop(0.8, '#1e293b');
          bodyGrad.addColorStop(1, '#0f172a');
        }
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = mat === 'brass' ? '#b45309' : mat === 'chrome' ? '#94a3b8' : '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle lathe machined circular micro-groove
        const midY = (pBase.y + pBodyTop.y) / 2;
        ctx.beginPath();
        ctx.ellipse(pBase.x, midY - 4 * zoom, rBase * 0.98, rBase * 0.35, 0, 0, Math.PI);
        ctx.strokeStyle = mat === 'brass' ? 'rgba(254, 240, 138, 0.3)' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Top Face of Main Cylinder
        ctx.beginPath();
        ctx.ellipse(pBodyTop.x, pBodyTop.y, rBase, rBase * 0.4, 0, 0, Math.PI * 2);
        const topGrad = ctx.createRadialGradient(pBodyTop.x - 4, pBodyTop.y - 2, 1, pBodyTop.x, pBodyTop.y, rBase);
        if (mat === 'brass') {
          topGrad.addColorStop(0, '#fef08a');
          topGrad.addColorStop(0.5, '#eab308');
          topGrad.addColorStop(1, '#92400e');
        } else if (mat === 'chrome') {
          topGrad.addColorStop(0, '#ffffff');
          topGrad.addColorStop(0.6, '#94a3b8');
          topGrad.addColorStop(1, '#475569');
        } else {
          topGrad.addColorStop(0, '#475569');
          topGrad.addColorStop(1, '#0f172a');
        }
        ctx.fillStyle = topGrad;
        ctx.fill();
        ctx.strokeStyle = mat === 'brass' ? '#fef08a' : '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 4. Recessed Waist Neck
        const rNeck = rBase * 0.55;
        ctx.beginPath();
        ctx.moveTo(pBodyTop.x - rNeck, pBodyTop.y);
        ctx.lineTo(pNeckTop.x - rNeck, pNeckTop.y);
        ctx.lineTo(pNeckTop.x + rNeck, pNeckTop.y);
        ctx.lineTo(pBodyTop.x + rNeck, pBodyTop.y);
        ctx.closePath();
        const neckGrad = ctx.createLinearGradient(pBodyTop.x - rNeck, 0, pBodyTop.x + rNeck, 0);
        if (mat === 'brass') {
          neckGrad.addColorStop(0, '#291104');
          neckGrad.addColorStop(0.4, '#d97706');
          neckGrad.addColorStop(0.6, '#fef08a');
          neckGrad.addColorStop(1, '#451a03');
        } else {
          neckGrad.addColorStop(0, '#0f172a');
          neckGrad.addColorStop(0.5, '#cbd5e1');
          neckGrad.addColorStop(1, '#1e293b');
        }
        ctx.fillStyle = neckGrad;
        ctx.fill();

        // 5. Ergonomic Mushroom Head Knob
        const rKnob = rBase * 0.82;
        ctx.beginPath();
        ctx.moveTo(pNeckTop.x - rKnob, pNeckTop.y);
        ctx.lineTo(pKnobTop.x - rKnob, pKnobTop.y);
        ctx.lineTo(pKnobTop.x + rKnob, pKnobTop.y);
        ctx.lineTo(pNeckTop.x + rKnob, pNeckTop.y);
        ctx.closePath();
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Knob top dome ellipse
        ctx.beginPath();
        ctx.ellipse(pKnobTop.x, pKnobTop.y, rKnob, rKnob * 0.42, 0, 0, Math.PI * 2);
        ctx.fillStyle = topGrad;
        ctx.fill();
        ctx.strokeStyle = mat === 'brass' ? '#fef08a' : '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Specular reflection highlight on knob
        ctx.beginPath();
        ctx.arc(pKnobTop.x - rKnob * 0.25, pKnobTop.y - 2, 2.5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill();

        // 6. Stainless Suspension Eyelet / Hook Loop
        ctx.beginPath();
        ctx.arc(pHookTop.x, pHookTop.y + 2, 5 * zoom * s, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5 * zoom;
        ctx.stroke();

        // 7. Laser-engraved Stamped Mass Text on Front Body
        const textY = (pBase.y + pBodyTop.y) / 2 + 3;
        ctx.font = `bold ${Math.round(11 * zoom * s)}px 'JetBrains Mono', sans-serif`;
        ctx.textAlign = 'center';
        // Embossed bottom highlight
        ctx.fillStyle = mat === 'brass' ? 'rgba(254, 240, 138, 0.7)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(massLabel, pBase.x, textY + 1);
        // Dark engraved inner
        ctx.fillStyle = mat === 'brass' ? '#451a03' : '#0f172a';
        ctx.fillText(massLabel, pBase.x, textY);

        // Vector arrow: Gravity P = mg (when showVectors is true)
        if (showVectors) {
          const gVal = 9.8;
          const forceP = mass * gVal;
          ctx.beginPath();
          ctx.moveTo(pBase.x, pBase.y);
          ctx.lineTo(pBase.x, pBase.y + 32 * zoom);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(pBase.x, pBase.y + 32 * zoom);
          ctx.lineTo(pBase.x - 4, pBase.y + 24 * zoom);
          ctx.lineTo(pBase.x + 4, pBase.y + 24 * zoom);
          ctx.closePath();
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.font = `${Math.round(9 * zoom)}px sans-serif`;
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`P=${forceP.toFixed(1)}N`, pBase.x + 22 * zoom, pBase.y + 28 * zoom);
        }
        break;
      }

      case 'ramp': {
        const angleDeg = d.rampAngle ?? 30;
        const angleRad = (angleDeg * Math.PI) / 180;
        const rampLen = 220; // 3D units
        const rampHeight = rampLen * Math.sin(angleRad);
        const rampBaseLen = rampLen * Math.cos(angleRad);
        const rampWidth = 50;

        // 3D Wedge points
        const pTopLeft = project3D(d.x - rampBaseLen / 2, d.y - rampWidth / 2, rampHeight, w, h);
        const pTopRight = project3D(d.x - rampBaseLen / 2, d.y + rampWidth / 2, rampHeight, w, h);
        const pBotLeft = project3D(d.x + rampBaseLen / 2, d.y - rampWidth / 2, 0, w, h);
        const pBotRight = project3D(d.x + rampBaseLen / 2, d.y + rampWidth / 2, 0, w, h);
        const pFloorLeft = project3D(d.x - rampBaseLen / 2, d.y - rampWidth / 2, 0, w, h);
        const pFloorRight = project3D(d.x - rampBaseLen / 2, d.y + rampWidth / 2, 0, w, h);

        // Side triangle (left)
        ctx.beginPath();
        ctx.moveTo(pFloorLeft.x, pFloorLeft.y);
        ctx.lineTo(pTopLeft.x, pTopLeft.y);
        ctx.lineTo(pBotLeft.x, pBotLeft.y);
        ctx.closePath();
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.stroke();

        // Slope Top Face
        ctx.beginPath();
        ctx.moveTo(pTopLeft.x, pTopLeft.y);
        ctx.lineTo(pTopRight.x, pTopRight.y);
        ctx.lineTo(pBotRight.x, pBotRight.y);
        ctx.lineTo(pBotLeft.x, pBotLeft.y);
        ctx.closePath();
        const rampGrad = ctx.createLinearGradient(pTopLeft.x, pTopLeft.y, pBotLeft.x, pBotLeft.y);
        rampGrad.addColorStop(0, '#475569');
        rampGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = rampGrad;
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Angle Arc Indicator
        ctx.beginPath();
        ctx.arc(pBotLeft.x, pBotLeft.y, 25 * zoom, Math.PI, Math.PI + angleRad, false);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = `bold ${Math.round(11 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#facc15';
        ctx.fillText(`α=${angleDeg}°`, pBotLeft.x - 30 * zoom, pBotLeft.y - 12 * zoom);

        // Sliding Block on Slope
        const posFrac = d.blockPos ?? 0.1;
        const blockX3D = d.x - rampBaseLen / 2 + posFrac * rampBaseLen;
        const blockZ3D = rampHeight - posFrac * rampHeight + 8;
        const blockP = project3D(blockX3D, d.y, blockZ3D, w, h);

        const bSize = 18 * zoom;
        ctx.beginPath();
        ctx.rect(blockP.x - bSize / 2, blockP.y - bSize / 2, bSize, bSize);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.strokeStyle = '#ffedd5';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `bold ${Math.round(9 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('m', blockP.x, blockP.y + 3);

        // Force vectors: Gravity P and Normal N
        if (showVectors) {
          // Gravity vector down
          ctx.beginPath();
          ctx.moveTo(blockP.x, blockP.y);
          ctx.lineTo(blockP.x, blockP.y + 28 * zoom);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = `${Math.round(9 * zoom)}px sans-serif`;
          ctx.fillStyle = '#ef4444';
          ctx.fillText('P=mg', blockP.x + 16 * zoom, blockP.y + 24 * zoom);
        }
        break;
      }

      case 'burner': {
        const isOn = d.burnerOn !== false;
        // Burner stove base
        const bP1 = project3D(d.x - 30, d.y - 30, 0, w, h);
        const bP2 = project3D(d.x + 30, d.y - 30, 0, w, h);
        const bP3 = project3D(d.x + 30, d.y + 30, 0, w, h);
        const bP4 = project3D(d.x - 30, d.y + 30, 0, w, h);

        ctx.beginPath();
        ctx.moveTo(bP1.x, bP1.y);
        ctx.lineTo(bP2.x, bP2.y);
        ctx.lineTo(bP3.x, bP3.y);
        ctx.lineTo(bP4.x, bP4.y);
        ctx.closePath();
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Heating Coil Ring
        const coilP = project3D(d.x, d.y, 8, w, h);
        ctx.beginPath();
        ctx.ellipse(coilP.x, coilP.y, 22 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
        if (isOn) {
          ctx.strokeStyle = '#ef4444';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle = '#475569';
          ctx.shadowBlur = 0;
        }
        ctx.lineWidth = 4 * zoom;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Power rating
        ctx.font = `bold ${Math.round(9 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = isOn ? '#f87171' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(isOn ? `${d.burnerPower ?? 500}W (ON)` : 'BẾP TẮT (OFF)', coilP.x, coilP.y + 26 * zoom);
        break;
      }

      case 'thermometer': {
        const temp = d.temperature ?? 25.0;
        // Glass Beaker Container
        const beakerH = 50;
        const bBotP = project3D(d.x, d.y, 0, w, h);
        const bTopP = project3D(d.x, d.y, beakerH, w, h);
        const beakerW = 28 * zoom;

        // Beaker Shadow
        ctx.beginPath();
        ctx.ellipse(bBotP.x, bBotP.y, beakerW, 14 * zoom, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Water level inside beaker
        const waterLevelH = beakerH * 0.7;
        const waterP = project3D(d.x, d.y, waterLevelH, w, h);
        ctx.beginPath();
        ctx.rect(bBotP.x - beakerW + 2, waterP.y, (beakerW - 2) * 2, bBotP.y - waterP.y);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.fill();

        // Beaker Glass Outline
        ctx.beginPath();
        ctx.rect(bBotP.x - beakerW, bTopP.y, beakerW * 2, bBotP.y - bTopP.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Thermometer Tube
        const thermoH = 80;
        const tBot = project3D(d.x + 8, d.y, 10, w, h);
        const tTop = project3D(d.x + 8, d.y, thermoH, w, h);

        ctx.beginPath();
        ctx.moveTo(tBot.x, tBot.y);
        ctx.lineTo(tTop.x, tTop.y);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 5 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Red Mercury Column (scaled from 0°C to 100°C)
        const mercuryFrac = Math.min(1, Math.max(0, temp / 100));
        const mercY = tBot.y - (tBot.y - tTop.y) * mercuryFrac;

        ctx.beginPath();
        ctx.moveTo(tBot.x, tBot.y);
        ctx.lineTo(tTop.x, mercY);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3 * zoom;
        ctx.stroke();

        // Mercury Bulb Bulbous bottom
        ctx.beginPath();
        ctx.arc(tBot.x, tBot.y, 5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Live Temperature Text
        ctx.font = `bold ${Math.round(11 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = temp >= 99 ? '#ef4444' : '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(`${temp.toFixed(1)}°C`, tTop.x + 22 * zoom, tTop.y + 10);
        break;
      }

      case 'pendulum': {
        const length = d.pendulumLength ?? 0.8;
        const theta = d.pendulumAngle ?? 0.5;

        // Stand Arm
        const standBaseP = project3D(d.x - 70, d.y, 0, w, h);
        const standPivotP = project3D(d.x, d.y, 110, w, h);

        ctx.beginPath();
        ctx.moveTo(standBaseP.x, standBaseP.y);
        ctx.lineTo(standBaseP.x, standPivotP.y);
        ctx.lineTo(standPivotP.x, standPivotP.y);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4 * zoom;
        ctx.stroke();

        // Pendulum string & bob
        const stringPx = length * 100 * zoom;
        const bobX = standPivotP.x + Math.sin(theta) * stringPx;
        const bobY = standPivotP.y + Math.cos(theta) * stringPx;

        ctx.beginPath();
        ctx.moveTo(standPivotP.x, standPivotP.y);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, 12 * zoom, 0, Math.PI * 2);
        const bobGrad = ctx.createRadialGradient(bobX - 3, bobY - 3, 2, bobX, bobY, 12 * zoom);
        bobGrad.addColorStop(0, '#fde047');
        bobGrad.addColorStop(0.7, '#ca8a04');
        bobGrad.addColorStop(1, '#854d0e');
        ctx.fillStyle = bobGrad;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Equilibrium line
        ctx.beginPath();
        ctx.moveTo(standPivotP.x, standPivotP.y);
        ctx.lineTo(standPivotP.x, standPivotP.y + stringPx);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'multimeter': {
        // 3D Digital Multimeter yellow rugged body
        const mP1 = project3D(d.x - 26, d.y - 18, 12, w, h);
        const mP2 = project3D(d.x + 26, d.y - 18, 12, w, h);
        const mP3 = project3D(d.x + 26, d.y + 18, 0, w, h);
        const mP4 = project3D(d.x - 26, d.y + 18, 0, w, h);

        ctx.beginPath();
        ctx.moveTo(mP1.x, mP1.y);
        ctx.lineTo(mP2.x, mP2.y);
        ctx.lineTo(mP3.x, mP3.y);
        ctx.lineTo(mP4.x, mP4.y);
        ctx.closePath();
        ctx.fillStyle = '#eab308';
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3D Backlit LCD Screen
        ctx.beginPath();
        ctx.roundRect(baseP.x - 22 * zoom, baseP.y - 16 * zoom, 44 * zoom, 16 * zoom, 3 * zoom);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = `bold ${Math.round(9 * zoom)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(`${metrics.voltage.toFixed(1)}V  ${metrics.current.toFixed(2)}A`, baseP.x, baseP.y - 5 * zoom);

        // Rotary Dial Knob in 3D
        ctx.beginPath();
        ctx.arc(baseP.x, baseP.y + 6 * zoom, 6 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Test Jack Terminals (Red & Black)
        ctx.beginPath();
        ctx.arc(baseP.x - 8 * zoom, baseP.y + 14 * zoom, 2.5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(baseP.x + 8 * zoom, baseP.y + 14 * zoom, 2.5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        break;
      }
    }

    // Device Label
    ctx.font = `bold ${Math.round(11 * zoom)}px sans-serif`;
    ctx.fillStyle = isSelected ? '#38bdf8' : '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText(language === 'vi' ? d.nameVi : d.nameEn, baseP.x, baseP.y + 28 * zoom);

    if (isSelected) {
      ctx.font = `${Math.round(9 * zoom)}px sans-serif`;
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText(language === 'vi' ? '✦ Nhấn thanh công cụ để xem 3D 360°' : '✦ Use 3D toolbar to inspect 360°', baseP.x, baseP.y + 40 * zoom);
    }

    ctx.restore();
  };

  // Helper: Draw Lab People (Anime Student Girl & Anime Teacher Sensei)
  const drawLabPerson = (ctx: CanvasRenderingContext2D, p: LabPerson, w: number, h: number) => {
    const isTeacher = p.kind === 'teacher';
    const baseP = project3D(p.x, p.y, 0, w, h);
    const bodyP = project3D(p.x, p.y, 40, w, h);
    const headP = project3D(p.x, p.y, 82, w, h);

    ctx.save();

    // 1. Floor Shadow
    ctx.beginPath();
    ctx.ellipse(baseP.x, baseP.y, 22 * zoom, 9 * zoom, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Standee Body / Outfit
    if (isTeacher) {
      // Teacher: White lab coat over purple/navy blouse, red tie
      ctx.beginPath();
      ctx.moveTo(baseP.x - 14 * zoom, baseP.y - 4 * zoom);
      ctx.lineTo(bodyP.x - 11 * zoom, bodyP.y + 6 * zoom);
      ctx.lineTo(headP.x - 6 * zoom, headP.y + 20 * zoom);
      ctx.lineTo(headP.x + 6 * zoom, headP.y + 20 * zoom);
      ctx.lineTo(bodyP.x + 11 * zoom, bodyP.y + 6 * zoom);
      ctx.lineTo(baseP.x + 14 * zoom, baseP.y - 4 * zoom);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc'; // White lab coat
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Red necktie
      ctx.beginPath();
      ctx.moveTo(headP.x, headP.y + 20 * zoom);
      ctx.lineTo(bodyP.x, bodyP.y + 10 * zoom);
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2.5 * zoom;
      ctx.stroke();
    } else {
      // Student: Japanese sailor school uniform (Navy with yellow scarf ribbon)
      ctx.beginPath();
      ctx.moveTo(baseP.x - 13 * zoom, baseP.y - 4 * zoom);
      ctx.lineTo(bodyP.x - 10 * zoom, bodyP.y + 6 * zoom);
      ctx.lineTo(headP.x - 6 * zoom, headP.y + 20 * zoom);
      ctx.lineTo(headP.x + 6 * zoom, headP.y + 20 * zoom);
      ctx.lineTo(bodyP.x + 10 * zoom, bodyP.y + 6 * zoom);
      ctx.lineTo(baseP.x + 13 * zoom, baseP.y - 4 * zoom);
      ctx.closePath();
      ctx.fillStyle = '#1e3a8a';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Yellow scarf ribbon
      ctx.beginPath();
      ctx.moveTo(headP.x - 6 * zoom, headP.y + 20 * zoom);
      ctx.lineTo(bodyP.x, bodyP.y + 8 * zoom);
      ctx.lineTo(headP.x + 6 * zoom, headP.y + 20 * zoom);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3 * zoom;
      ctx.stroke();
    }

    // 3. Circular Anime Portrait Card
    const avatarR = 26 * zoom;
    const avatarImg = isTeacher ? teacherImgRef.current : studentImgRef.current;

    // Glowing Aura Ring behind avatar
    ctx.beginPath();
    ctx.arc(headP.x, headP.y, avatarR + 3 * zoom, 0, Math.PI * 2);
    ctx.fillStyle = isTeacher ? 'rgba(168, 85, 247, 0.35)' : 'rgba(56, 189, 248, 0.35)';
    ctx.fill();

    // Clip and draw Anime Portrait Image
    ctx.save();
    ctx.beginPath();
    ctx.arc(headP.x, headP.y, avatarR, 0, Math.PI * 2);
    ctx.clip();

    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      const srcW = avatarImg.naturalWidth;
      const srcH = avatarImg.naturalHeight;
      const cropH = srcH * 0.75;
      ctx.drawImage(
        avatarImg,
        0, 0, srcW, cropH,
        headP.x - avatarR, headP.y - avatarR, avatarR * 2, avatarR * 2
      );
    } else {
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(headP.x - avatarR, headP.y - avatarR, avatarR * 2, avatarR * 2);

      ctx.fillStyle = isTeacher ? '#581c87' : '#78350f';
      ctx.beginPath();
      ctx.arc(headP.x, headP.y - 6 * zoom, avatarR * 0.9, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(headP.x - 10 * zoom, headP.y + 5 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.arc(headP.x + 10 * zoom, headP.y + 5 * zoom, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Outer Anime Ring Border
    ctx.beginPath();
    ctx.arc(headP.x, headP.y, avatarR, 0, Math.PI * 2);
    ctx.strokeStyle = isTeacher ? '#c084fc' : '#38bdf8';
    ctx.lineWidth = 2.5 * zoom;
    ctx.stroke();

    // Cute icon badge on upper-right of avatar
    const badgeX = headP.x + avatarR * 0.7;
    const badgeY = headP.y - avatarR * 0.7;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 7 * zoom, 0, Math.PI * 2);
    ctx.fillStyle = isTeacher ? '#7e22ce' : '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.font = `${Math.round(8 * zoom)}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(isTeacher ? '★' : '♥', badgeX, badgeY + 2.5 * zoom);

    // 4. Role & Name Tag Badge
    const badgeText = isTeacher ? `👩‍🏫 ${p.name}` : `👧 ${p.name}`;
    ctx.font = `bold ${Math.round(10 * zoom)}px sans-serif`;
    const textMetrics = ctx.measureText(badgeText);
    const pillW = textMetrics.width + 16 * zoom;
    const pillH = 18 * zoom;
    const pillX = baseP.x - pillW / 2;
    const pillY = baseP.y + 8 * zoom;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = isTeacher ? 'rgba(88, 28, 135, 0.9)' : 'rgba(3, 105, 161, 0.9)';
    ctx.fill();
    ctx.strokeStyle = isTeacher ? '#c084fc' : '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, baseP.x, pillY + pillH * 0.7);

    // 5. Interactive Anime Speech Bubble
    if (p.speech) {
      ctx.font = `${Math.round(10 * zoom)}px sans-serif`;
      const speechWidth = Math.max(150 * zoom, ctx.measureText(p.speech).width + 20 * zoom);
      const bubbleW = Math.min(270 * zoom, speechWidth);
      const bubbleH = 34 * zoom;
      const bx = headP.x - bubbleW / 2;
      const by = headP.y - avatarR - bubbleH - 12 * zoom;

      // Bubble box
      ctx.beginPath();
      ctx.roundRect(bx, by, bubbleW, bubbleH, 10 * zoom);
      ctx.fillStyle = 'rgba(11, 23, 41, 0.94)';
      ctx.fill();
      ctx.strokeStyle = isTeacher ? '#c084fc' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bubble pointer arrow
      ctx.beginPath();
      ctx.moveTo(headP.x - 5 * zoom, by + bubbleH);
      ctx.lineTo(headP.x, by + bubbleH + 7 * zoom);
      ctx.lineTo(headP.x + 5 * zoom, by + bubbleH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(11, 23, 41, 0.94)';
      ctx.fill();
      ctx.strokeStyle = isTeacher ? '#c084fc' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Speech text
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(p.speech, headP.x, by + bubbleH / 2 + 3.5 * zoom);
    }

    ctx.restore();
  };

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    currentMousePosRef.current = { x: mx, y: my };
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Check if in 'wire' tool mode:
    if (activeTool === 'wire') {
      // 1. Check if clicked on a terminal port
      let clickedPort: { deviceId: string; port: TerminalPort } | null = null;
      for (const d of devices) {
        const ports = getDevicePorts(d);
        for (const pInfo of ports) {
          const pt3D = { x: d.x + pInfo.relX, y: d.y + pInfo.relY, z: pInfo.relZ };
          const pt = project3D(pt3D.x, pt3D.y, pt3D.z, w, h);
          const dist = Math.hypot(mx - pt.x, my - pt.y);
          if (dist < 18 * zoom) {
            clickedPort = { deviceId: d.id, port: pInfo.port };
            break;
          }
        }
        if (clickedPort) break;
      }

      if (clickedPort) {
        if (!wiringStart) {
          // Start wiring from this terminal
          setWiringStart({ deviceId: clickedPort.deviceId, port: clickedPort.port, x: mx, y: my });
          soundFx.playClick();
          return;
        } else {
          // If clicked the exact same terminal, cancel
          if (wiringStart.deviceId === clickedPort.deviceId && wiringStart.port === clickedPort.port) {
            setWiringStart(null);
            soundFx.playClick();
            return;
          }
          // Complete wire connection!
          const newConn: DeviceConnection = {
            id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            fromDeviceId: wiringStart.deviceId,
            fromPort: wiringStart.port,
            toDeviceId: clickedPort.deviceId,
            toPort: clickedPort.port,
            color: wireColor,
          };
          onAddConnection?.(newConn);
          soundFx.playWireConnect();
          setWiringStart(null);
          return;
        }
      }

      // 2. Check if clicked on an existing wire to unplug it
      if (hoveredWireId) {
        onRemoveConnection?.(hoveredWireId);
        soundFx.playWireDisconnect();
        setHoveredWireId(null);
        return;
      }

      // If clicked empty space while wiring, cancel current wire stretch
      if (wiringStart) {
        setWiringStart(null);
        return;
      }
    }

    // Normal Select / Move interaction
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    dragStartMousePosRef.current = { x: e.clientX, y: e.clientY };
    mouseMovedDistRef.current = 0;

    // Search closest device
    let clickedDevice: LabDevice | null = null;
    for (let i = devices.length - 1; i >= 0; i--) {
      const d = devices[i];
      const p = project3D(d.x, d.y, 10, w, h);
      const dist = Math.hypot(mx - p.x, my - p.y);
      if (dist < 34 * zoom) {
        clickedDevice = d;
        break;
      }
    }

    if (clickedDevice) {
      onSelectDevice(clickedDevice);
      dragModeRef.current = 'device';
      draggedItemIdRef.current = clickedDevice.id;
      initialDevPosRef.current = { x: clickedDevice.x, y: clickedDevice.y };
      return;
    }

    // Check if clicked on an anime character (Student or Teacher)
    let clickedPerson: LabPerson | null = null;
    for (let i = people.length - 1; i >= 0; i--) {
      const person = people[i];
      const p = project3D(person.x, person.y, 50, w, h);
      const dist = Math.hypot(mx - p.x, my - p.y);
      if (dist < 46 * zoom) {
        clickedPerson = person;
        break;
      }
    }

    if (clickedPerson) {
      const quotes = clickedPerson.kind === 'teacher' ? ANIME_DIALOGUES.teacher : ANIME_DIALOGUES.student;
      const currentIdx = quotes.indexOf(clickedPerson.speech || '');
      const nextSpeech = quotes[(currentIdx + 1) % quotes.length];
      onUpdatePerson({
        ...clickedPerson,
        speech: nextSpeech,
      });
      soundFx.playChime();
      dragModeRef.current = 'person';
      draggedItemIdRef.current = clickedPerson.id;
      return;
    }

    // Default to Orbit or Pan (Right click or Middle click = pan, Left click = orbit)
    onSelectDevice(null);
    dragModeRef.current = e.button === 2 || e.button === 1 ? 'pan' : 'orbit';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    currentMousePosRef.current = { x: mx, y: my };
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Detect hovered terminal port
    if (activeTool === 'wire' || wiringStart !== null) {
      let foundPort: { deviceId: string; port: TerminalPort; screenX: number; screenY: number; labelVi: string; labelEn: string } | null = null;
      for (const d of devices) {
        const ports = getDevicePorts(d);
        for (const pInfo of ports) {
          const pt3D = { x: d.x + pInfo.relX, y: d.y + pInfo.relY, z: pInfo.relZ };
          const pt = project3D(pt3D.x, pt3D.y, pt3D.z, w, h);
          const dist = Math.hypot(mx - pt.x, my - pt.y);
          if (dist < 18 * zoom) {
            foundPort = {
              deviceId: d.id,
              port: pInfo.port,
              screenX: pt.x,
              screenY: pt.y,
              labelVi: pInfo.labelVi,
              labelEn: pInfo.labelEn,
            };
            break;
          }
        }
        if (foundPort) break;
      }
      setHoveredPort(foundPort);

      // Detect hovered wire for unplugging
      let foundWireId: string | null = null;
      if (connections && connections.length > 0) {
        for (const conn of connections) {
          const fromDev = devices.find(d => d.id === conn.fromDeviceId);
          const toDev = devices.find(d => d.id === conn.toDeviceId);
          if (!fromDev || !toDev) continue;
          const pA3D = getDeviceTerminalPort(fromDev, conn.fromPort);
          const pB3D = getDeviceTerminalPort(toDev, conn.toPort);
          const pA = project3D(pA3D.x, pA3D.y, pA3D.z, w, h);
          const pB = project3D(pB3D.x, pB3D.y, pB3D.z, w, h);
          const l2 = Math.pow(pB.x - pA.x, 2) + Math.pow(pB.y - pA.y, 2);
          if (l2 === 0) continue;
          let t = ((mx - pA.x) * (pB.x - pA.x) + (my - pA.y) * (pB.y - pA.y)) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = pA.x + t * (pB.x - pA.x);
          const projY = pA.y + t * (pB.y - pA.y);
          const dist = Math.hypot(mx - projX, my - projY);
          if (dist < 10) {
            foundWireId = conn.id;
            break;
          }
        }
      }
      setHoveredWireId(foundWireId);
    }

    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    mouseMovedDistRef.current += Math.hypot(dx, dy);

    if (dragModeRef.current === 'orbit') {
      setYaw(prev => prev + dx * 0.008);
      setPitch(prev => Math.max(0.1, Math.min(1.45, prev + dy * 0.008)));
    } else if (dragModeRef.current === 'pan') {
      setPanX(prev => prev + dx / (zoom * 1.35));
      setPanY(prev => prev + dy / (zoom * 1.35));
    } else if (dragModeRef.current === 'device' && draggedItemIdRef.current) {
      const targetDev = devices.find(d => d.id === draggedItemIdRef.current);
      if (targetDev) {
        // High accuracy pitch-corrected perspective transformation to table plane
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosP = Math.max(0.18, Math.cos(pitch));

        const totalDx = (e.clientX - dragStartMousePosRef.current.x) / (zoom * 1.35);
        const totalDy = (e.clientY - dragStartMousePosRef.current.y) / (zoom * 1.35);

        const tableX1 = totalDx;
        const tableY1 = totalDy / cosP;

        const deltaTableX = tableX1 * cosY + tableY1 * sinY;
        const deltaTableY = -tableX1 * sinY + tableY1 * cosY;

        const newX = Math.round(Math.max(-270, Math.min(270, initialDevPosRef.current.x + deltaTableX)));
        const newY = Math.round(Math.max(-170, Math.min(170, initialDevPosRef.current.y + deltaTableY)));
        onUpdateDevice({ ...targetDev, x: newX, y: newY });
      }
    } else if (dragModeRef.current === 'person' && draggedItemIdRef.current) {
      const targetP = people.find(p => p.id === draggedItemIdRef.current);
      if (targetP) {
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosP = Math.max(0.18, Math.cos(pitch));
        const totalDx = (e.clientX - dragStartMousePosRef.current.x) / (zoom * 1.35);
        const totalDy = (e.clientY - dragStartMousePosRef.current.y) / (zoom * 1.35);
        const tableX1 = totalDx;
        const tableY1 = totalDy / cosP;
        const deltaTableX = tableX1 * cosY + tableY1 * sinY;
        const deltaTableY = -tableX1 * sinY + tableY1 * cosY;
        onUpdatePerson({
          ...targetP,
          x: Math.round(Math.max(-310, Math.min(310, targetP.x + deltaTableX * 0.1))),
          y: Math.round(Math.max(-200, Math.min(200, targetP.y + deltaTableY * 0.1))),
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (dragModeRef.current === 'device' && draggedItemIdRef.current) {
      const targetDev = devices.find(d => d.id === draggedItemIdRef.current);
      if (targetDev) {
        // Quick click (< 6px) toggles switches or burners
        if (mouseMovedDistRef.current < 6) {
          if (targetDev.type === 'switch') {
            const nextState = !targetDev.switchClosed;
            onUpdateDevice({ ...targetDev, switchClosed: nextState });
            soundFx.playSwitchClick(nextState);
            if (nextState) soundFx.playSpark();
          } else if (targetDev.type === 'burner') {
            const nextState = !targetDev.burnerOn;
            onUpdateDevice({ ...targetDev, burnerOn: nextState });
            soundFx.playSwitchClick(nextState);
          }
        } else {
          // Device repositioned!
          soundFx.playDrop();
        }
      }
    }
    isDraggingRef.current = false;
    draggedItemIdRef.current = null;
    mouseMovedDistRef.current = 0;
  };

  // Wheel Zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.max(0.6, Math.min(2.5, prev * zoomFactor)));
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#07111e]">
      <canvas
        ref={canvasRef}
        className={`w-full h-full block ${
          activeTool === 'wire'
            ? hoveredPort || hoveredWireId ? 'cursor-pointer' : 'cursor-crosshair'
            : isDraggingRef.current && dragModeRef.current === 'device'
            ? 'cursor-grabbing'
            : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      />

      {/* Floating Left Toolbar: Move / Reposition vs Connect Wires */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <div className="flex items-center gap-1 p-1 bg-[#101e35]/90 backdrop-blur-md border border-[#33496e] rounded-xl shadow-xl">
          <button
            onClick={() => {
              setActiveTool('move');
              setWiringStart(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'move'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#1a2d48]'
            }`}
            title={language === 'vi' ? 'Kéo thả trực tiếp thiết bị trên bàn 3D' : 'Drag & drop apparatus to reposition on 3D table'}
          >
            <Move className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Kéo thả vị trí' : 'Move'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTool('wire');
              soundFx.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'wire'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#1a2d48]'
            }`}
            title={language === 'vi' ? 'Bật chế độ nối dây giữa các cực thiết bị' : 'Wire connection tool between apparatus terminals'}
          >
            <Cable className="w-3.5 h-3.5 text-amber-200" />
            <span>{language === 'vi' ? 'Nối dây' : 'Wire Tool'}</span>
            {connections && connections.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-amber-200 font-mono font-bold">
                {connections.length}
              </span>
            )}
          </button>
        </div>

        {/* Wire Tool Palette & Quick Actions */}
        {activeTool === 'wire' && (
          <div className="flex items-center gap-1.5 p-1.5 bg-[#101e35]/92 backdrop-blur-md border border-amber-500/40 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-[11px] text-slate-300 font-medium pl-1">
              {language === 'vi' ? 'Màu:' : 'Color:'}
            </span>
            {[
              { col: '#ef4444', name: 'Đỏ (+)' },
              { col: '#1e293b', name: 'Đen (-)' },
              { col: '#38bdf8', name: 'Xanh dương' },
              { col: '#eab308', name: 'Vàng' },
            ].map(c => (
              <button
                key={c.col}
                onClick={() => setWireColor(c.col)}
                title={c.name}
                className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                  wireColor === c.col ? 'scale-125 border-white shadow-md' : 'border-slate-500/60 hover:scale-110'
                }`}
                style={{ backgroundColor: c.col }}
              />
            ))}

            <div className="w-[1px] h-4 bg-[#33496e] mx-0.5" />

            {onResetPresetConnections && (
              <button
                onClick={() => {
                  onResetPresetConnections();
                  soundFx.playWireConnect();
                }}
                className="px-2 py-1 text-[11px] text-sky-300 hover:text-white hover:bg-sky-600/30 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title={language === 'vi' ? 'Nối lại mạch tiêu chuẩn' : 'Reset preset wiring'}
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">{language === 'vi' ? 'Mạch chuẩn' : 'Reset'}</span>
              </button>
            )}

            {onClearConnections && connections && connections.length > 0 && (
              <button
                onClick={() => {
                  onClearConnections();
                  soundFx.playWireDisconnect();
                }}
                className="px-2 py-1 text-[11px] text-rose-300 hover:text-white hover:bg-rose-600/30 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title={language === 'vi' ? 'Tháo gỡ toàn bộ dây nối' : 'Clear all wires'}
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">{language === 'vi' ? 'Xóa hết' : 'Clear'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Canvas Camera & View Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 bg-[#101e35]/85 backdrop-blur-md border border-[#33496e] rounded-xl shadow-xl">
        {/* Open 3D Model Explorer */}
        {onOpenModelViewer && (
          <button
            onClick={() => onOpenModelViewer(selectedDeviceId ? devices.find(d => d.id === selectedDeviceId)?.type : undefined)}
            className="px-2.5 py-1.5 text-xs bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            title={language === 'vi' ? 'Xem chi tiết Mô hình 3D 360°' : 'Open 3D Model Explorer 360°'}
          >
            <Box className="w-4 h-4 text-sky-200" />
            <span className="hidden sm:inline">{language === 'vi' ? 'Mô hình 3D' : '3D Models'}</span>
          </button>
        )}

        {/* Auto Orbit Toggle */}
        <button
          onClick={() => setIsAutoOrbit(o => !o)}
          title={isAutoOrbit 
            ? (language === 'vi' ? 'Dừng tự xoay 360°' : 'Stop 360° Auto-Orbit') 
            : (language === 'vi' ? 'Bật tự xoay 360° bàn thí nghiệm' : 'Start 360° Auto-Orbit')}
          className={`p-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
            isAutoOrbit 
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm' 
              : 'text-slate-300 hover:text-white hover:bg-[#1f3659]'
          }`}
        >
          <Compass className={`w-4 h-4 ${isAutoOrbit ? 'animate-spin' : ''}`} />
          <span className="text-[11px] hidden md:inline">{isAutoOrbit ? '360° ON' : '360°'}</span>
        </button>

        <div className="w-[1px] h-4 bg-[#33496e]" />

        <button
          onClick={() => handleResetCamera('isometric')}
          title={language === 'vi' ? 'Góc nhìn 3D Isometric' : 'Isometric 3D View'}
          className="p-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#1f3659] rounded-lg transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleResetCamera('top')}
          title={language === 'vi' ? 'Góc nhìn từ trên xuống' : 'Top View'}
          className="p-1.5 text-xs text-slate-300 hover:text-white hover:bg-[#1f3659] rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#33496e]" />
        <button
          onClick={() => setZoom(z => Math.min(2.5, z * 1.15))}
          title={language === 'vi' ? 'Phóng to (+)' : 'Zoom In (+)'}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#1f3659] rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.6, z * 0.85))}
          title={language === 'vi' ? 'Thu nhỏ (-)' : 'Zoom Out (-)'}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#1f3659] rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#33496e]" />
        <button
          onClick={() => setShowGrid(g => !g)}
          title={language === 'vi' ? 'Bật/tắt lưới tọa độ bàn' : 'Toggle Grid'}
          className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'bg-[#1e3a8a] text-sky-300' : 'text-slate-400 hover:bg-[#1f3659]'}`}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Item 3D Inspector Quick Pill */}
      {selectedDeviceId && onOpenModelViewer && (
        <div className="absolute top-16 right-4 z-10 animate-fade-in">
          <button
            onClick={() => {
              const dev = devices.find(d => d.id === selectedDeviceId);
              if (dev) onOpenModelViewer(dev.type);
            }}
            className="px-3 py-1.5 bg-[#0f1f38]/90 hover:bg-[#172c4f] border border-sky-500/50 hover:border-sky-400 text-sky-200 text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Box className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'vi' ? '🔍 Xem mô hình 3D thiết bị này' : '🔍 Inspect this 3D model'}</span>
          </button>
        </div>
      )}

      {/* Interactive Helper Banner */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#101e35]/92 backdrop-blur-md border border-[#33496e] rounded-xl text-xs text-slate-200 pointer-events-none shadow-xl flex items-center gap-3">
        {activeTool === 'wire' ? (
          wiringStart ? (
            <span className="text-amber-300 font-medium animate-pulse">
              🔗 {language === 'vi' ? 'Đang kéo dây: Nhấp vào cọc cực thiết bị khác để hoàn tất nối!' : 'Stretching wire: Click another apparatus terminal to finish!'}
            </span>
          ) : (
            <span>
              ⚡ <b>{language === 'vi' ? 'Chế độ nối dây:' : 'Wire Mode:'}</b> {language === 'vi' ? 'Nhấp vào cọc cực thiết bị (vòng sáng) để nối dây. Nhấp vào dây để gỡ bỏ.' : 'Click terminal rings to stretch wires. Click wires to unplug.'}
            </span>
          )
        ) : (
          <>
            <span>🖐️ <b>{language === 'vi' ? 'Kéo thả thiết bị' : 'Drag apparatus'}</b> {language === 'vi' ? 'để chỉnh vị trí trên bàn' : 'to reposition on bench'}</span>
            <span className="text-slate-500">·</span>
            <span>🖱 <b>{language === 'vi' ? 'Kéo nền' : 'Drag background'}</b> {language === 'vi' ? 'để xoay 3D' : 'to orbit'}</span>
            <span className="text-slate-500">·</span>
            <span>⚡ <b>{language === 'vi' ? 'Nhấp công tắc' : 'Click switch'}</b> {language === 'vi' ? 'để đóng/ngắt mạch' : 'to toggle'}</span>
          </>
        )}
      </div>
    </div>
  );
};
