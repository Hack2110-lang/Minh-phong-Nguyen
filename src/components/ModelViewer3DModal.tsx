import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DeviceType, ExperimentMode } from '../types/physics';
import { 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Box, 
  Layers, 
  Sparkles, 
  Info, 
  Check, 
  ChevronRight,
  Maximize2
} from 'lucide-react';

export type ModelId = 
  | 'battery'
  | 'bulb'
  | 'switch'
  | 'resistor'
  | 'spring'
  | 'weight'
  | 'ramp'
  | 'burner'
  | 'thermometer'
  | 'pendulum'
  | 'multimeter';

interface ModelInfo {
  id: ModelId;
  nameVi: string;
  nameEn: string;
  categoryVi: string;
  categoryEn: string;
  descriptionVi: string;
  descriptionEn: string;
  formulaVi: string;
  formulaEn: string;
  componentsVi: string[];
  componentsEn: string[];
}

export const MODEL_REGISTRY: Record<ModelId, ModelInfo> = {
  battery: {
    id: 'battery',
    nameVi: 'Nguồn điện Pin DC 9V',
    nameEn: 'DC 9V Chemical Battery',
    categoryVi: 'Điện học',
    categoryEn: 'Electricity',
    descriptionVi: 'Mô hình 3D khối pin nguồn điện hóa học cung cấp suất điện động không đổi. Bên trong xảy ra phản ứng oxy hóa khử tạo dòng electron.',
    descriptionEn: '3D volumetric model of electrochemical cell providing constant electromotive force.',
    formulaVi: 'U = E - I·r | Năng lượng: W = U·I·t',
    formulaEn: 'V = EMF - I·r | Energy: W = V·I·t',
    componentsVi: [
      'Cực dương (+) núm tán hợp kim đồng',
      'Cực âm (-) mặt đáy tráng niken',
      'Lớp vỏ thép mạ cách điện an toàn',
      'Chất điện phân hóa học giải phóng ion',
    ],
    componentsEn: [
      'Positive (+) copper alloy terminal',
      'Negative (-) nickel-plated base',
      'Insulated steel casing',
      'Chemical electrolyte core',
    ],
  },
  bulb: {
    id: 'bulb',
    nameVi: 'Bóng đèn sợi đốt Vonfram',
    nameEn: 'Tungsten Incandescent Bulb',
    categoryVi: 'Điện học & Quang học',
    categoryEn: 'Electricity & Optics',
    descriptionVi: 'Mô hình 3D bóng đèn chân không cổ điển. Dòng điện nung nóng sợi tóc Vonfram lên đến 2500°C phát ra ánh sáng khả kiến rực rỡ.',
    descriptionEn: '3D model of incandescent bulb with tungsten filament glowing at 2500°C.',
    formulaVi: 'P = U·I = I²·R = U² / R (Công suất)',
    formulaEn: 'P = V·I = I²·R = V² / R (Electric Power)',
    componentsVi: [
      'Bóng thủy tinh Borosilicate hình giọt nước',
      'Sợi đốt Vonfram xoắn kép chịu nhiệt 3422°C',
      'Thanh giá đỡ đồng và dây dẫn trong thân',
      'Đui xoáy kim loại chuẩn Edison E27',
    ],
    componentsEn: [
      'Borosilicate glass envelope',
      'Double-coiled tungsten filament',
      'Support lead wires & glass stem',
      'Edison E27 metal screw base',
    ],
  },
  switch: {
    id: 'switch',
    nameVi: 'Cầu dao / Công tắc dao gạt',
    nameEn: 'Knife-Blade Circuit Switch',
    categoryVi: 'Khí cụ đóng cắt',
    categoryEn: 'Circuit Switching',
    descriptionVi: 'Mô hình 3D công tắc dao gạt cơ học chính xác. Khi gạt xuống, lưỡi đồng cắm chặt vào hàm tiếp xúc kép khép kín mạch điện an toàn.',
    descriptionEn: '3D knife-blade switch with dual copper contact jaws and insulated lever handle.',
    formulaVi: 'R_tiếp_xúc ≈ 0Ω (Đóng) | R_hở → ∞ (Mở)',
    formulaEn: 'R_contact ≈ 0Ω (Closed) | R_open → ∞',
    componentsVi: [
      'Đế phíp phenolic cách điện cao áp',
      'Lưỡi dao dẫn điện bằng đồng thau nguyên khối',
      'Hàm kẹp lò xo đàn hồi giữ tiếp xúc tốt',
      'Tay gạt nhựa cách điện chống giật',
    ],
    componentsEn: [
      'Insulated phenolic baseplate',
      'Solid brass conductive blade',
      'Dual spring-tension contact jaws',
      'Insulated safety handle',
    ],
  },
  resistor: {
    id: 'resistor',
    nameVi: 'Điện trở gốm vạch màu chuẩn',
    nameEn: 'Color-Code Carbon Resistor',
    categoryVi: 'Linh kiện điện tử',
    categoryEn: 'Passive Components',
    descriptionVi: 'Mô hình 3D điện trở màng kim loại hình trụ với các vạch màu biểu diễn giá trị ohm và sai số theo quy chuẩn quốc tế IEC 60062.',
    descriptionEn: '3D cylindrical resistor with standardized 4-band color coding and axial leads.',
    formulaVi: 'Định luật Ôm: I = U / R | Nhiệt Jun: Q = I²·R·t',
    formulaEn: 'Ohm\'s Law: I = V / R | Joule Heat: Q = I²·R·t',
    componentsVi: [
      'Lõi gốm sứ Steatite dẫn nhiệt tốt',
      'Màng oxit kim loại điện trở suất ổn định',
      '4 vạch màu quy ước: Nâu - Đen - Đỏ - Vàng kim',
      'Chân cắm đồng mạ thiếc hàn mạch',
    ],
    componentsEn: [
      'High-grade ceramic rod',
      'Metal-oxide resistive film',
      'Color coding bands (Brown-Black-Red-Gold)',
      'Tinned axial copper wire leads',
    ],
  },
  spring: {
    id: 'spring',
    nameVi: 'Con lắc lò xo dao động',
    nameEn: 'Helical Spring Oscillator',
    categoryVi: 'Cơ học dao động',
    categoryEn: 'Harmonic Motion',
    descriptionVi: 'Mô hình 3D lò xo xoắn ốc bằng thép lò xo độ đàn hồi cao, kết hợp vật nặng gia công tinh xảo để khảo sát dao động điều hòa.',
    descriptionEn: '3D helical spring model with attached mass block for simple harmonic oscillation study.',
    formulaVi: 'F = -k·x | Chu kỳ: T = 2π√(m / k)',
    formulaEn: 'Hooke: F = -k·x | Period: T = 2π√(m / k)',
    componentsVi: [
      'Lò xo thép tôi đàn hồi chịu lực mỏi',
      'Khối quả nặng kim loại 0.5 kg có móc treo',
      'Thanh dẫn hướng trục ngang chống uốn',
      'Ngàm kẹp giá thí nghiệm vững chắc',
    ],
    componentsEn: [
      'High-tensile spring steel coils',
      'Machined metal weight block (0.5 kg)',
      'Horizontal guide rod',
      'Rigid support clamp',
    ],
  },
  weight: {
    id: 'weight',
    nameVi: 'Quả cân chuẩn phòng thí nghiệm (Class F1)',
    nameEn: 'Precision Calibration Weight Specimen',
    categoryVi: 'Cơ học & Trọng lực',
    categoryEn: 'Mechanics & Gravity',
    descriptionVi: 'Mô hình 3D quả cân chuẩn kim loại đồng thau đúc CNC nguyên khối, có núm cầm chóp tròn tiện dụng, rãnh cổ thắt eo và quai móc treo chịu tải cao.',
    descriptionEn: '3D precision CNC-turned brass calibration weight with ergonomic head knob, neck groove, and suspension loop.',
    formulaVi: 'P = m·g | Trọng lượng P (N) = Khối lượng m (kg) × Gia tốc g (m/s²)',
    formulaEn: 'P = m·g | Weight force P (N) = Mass m (kg) × Acceleration g (m/s²)',
    componentsVi: [
      'Thân trụ kim loại đồng thau vàng óng mài bóng gương',
      'Đế vát mép gia công CNC chống trầy xước và lật đổ',
      'Cổ thắt eo định vị chuẩn OIML',
      'Núm cầm hình chóp nấm tiện dụng',
      'Quai khuyên móc treo inox gắn đỉnh để móc lực kế / lò xo',
      'Dấu khắc chìm khối lượng chuẩn 500g CLASS F1',
    ],
    componentsEn: [
      'Mirror-polished solid brass cylindrical body',
      'CNC chamfered wide base for superior stability',
      'OIML standard recessed neck groove',
      'Ergonomic mushroom-shaped handling knob',
      'Top stainless steel suspension loop for dynamometer attachment',
      'Precision laser-engraved 500g CLASS F1 calibration mark',
    ],
  },
  ramp: {
    id: 'ramp',
    nameVi: 'Mặt phẳng nghiêng cơ học',
    nameEn: 'Precision Inclined Plane',
    categoryVi: 'Cơ học & Động lực học',
    categoryEn: 'Dynamics & Friction',
    descriptionVi: 'Mô hình 3D máng trượt nghiêng kèm thước đo góc chia độ và khối gỗ/kim loại để đo gia tốc rơi và hệ số ma sát trượt.',
    descriptionEn: '3D inclined ramp with angle indicator and sliding block for friction analysis.',
    formulaVi: 'a = g·(sinα - μ·cosα) | N = m·g·cosα',
    formulaEn: 'a = g·(sinα - μ·cosα) | N = m·g·cosα',
    componentsVi: [
      'Mặt trượt nhôm anod hóa phẳng mịn có thước cm',
      'Cung chia độ góc từ 0° đến 60°',
      'Chốt hãm nâng hạ độ cao linh hoạt',
      'Vật trượt khối lượng m kèm đệm ma sát',
    ],
    componentsEn: [
      'Anodized aluminum guide rail with scale',
      'Angular protractor arc (0° - 60°)',
      'Height adjustment locking pin',
      'Sliding test block with friction pad',
    ],
  },
  burner: {
    id: 'burner',
    nameVi: 'Bếp điện nhiệt & Cốc đun Becher',
    nameEn: 'Electric Heater & Glass Beaker',
    categoryVi: 'Nhiệt học & Nhiệt động lực',
    categoryEn: 'Thermodynamics',
    descriptionVi: 'Mô hình 3D mâm nhiệt đốt nóng bằng gốm sứ kết hợp kiềng sắt và cốc thủy tinh chia vạch chịu nhiệt cao chứa nước đang sôi.',
    descriptionEn: '3D electric hot plate and borosilicate beaker with boiling water simulation.',
    formulaVi: 'Q = m·c·ΔT | Nhiệt hóa hơi: Q = L·m',
    formulaEn: 'Q = m·c·ΔT | Vaporization: Q = L·m',
    componentsVi: [
      'Mâm nhiệt gốm tỏa nhiệt hồng ngoại 600W',
      'Kiềng sắt 3 chân kèm lưới amiang tản nhiệt',
      'Cốc đun thủy tinh Borosilicate chịu sốc nhiệt 500°C',
      'Dung dịch nước cất có bọt khí sôi 100°C',
    ],
    componentsEn: [
      'Ceramic heating plate (600W)',
      'Cast-iron tripod with ceramic wire gauze',
      'Graduated Borosilicate glass beaker',
      'Distilled water with boiling vapor bubble',
    ],
  },
  thermometer: {
    id: 'thermometer',
    nameVi: 'Nhiệt kế thủy tinh chia vạch',
    nameEn: 'Mercury Glass Thermometer',
    categoryVi: 'Dụng cụ đo nhiệt độ',
    categoryEn: 'Measurement Instruments',
    descriptionVi: 'Mô hình 3D nhiệt kế chất lỏng dãn nở nhiệt. Cột chất lỏng đỏ dâng lên trong ống mao dẫn tỷ lệ thuận với nhiệt độ môi trường.',
    descriptionEn: '3D precision liquid-in-glass thermometer with calibrated temperature scale.',
    formulaVi: 'ΔV = V₀·β·ΔT (Sự dãn nở nhiệt chất lỏng)',
    formulaEn: 'ΔV = V₀·β·ΔT (Thermal Liquid Expansion)',
    componentsVi: [
      'Bầu chứa chất lỏng cảm nhiệt ở đáy',
      'Ống mao dẫn chân không thủy tinh trong suốt',
      'Thang chia độ rõ nét từ -10°C đến 110°C',
      'Vòng chống lăn và lỗ treo dây thí nghiệm',
    ],
    componentsEn: [
      'Thermal reservoir glass bulb',
      'Precision vacuum capillary tube',
      'Graduated Celsius scale (-10°C to 110°C)',
      'Anti-roll ring and suspension hook',
    ],
  },
  pendulum: {
    id: 'pendulum',
    nameVi: 'Con lắc đơn chuẩn dao động',
    nameEn: 'Simple Gravity Pendulum',
    categoryVi: 'Cơ học & Trọng trường',
    categoryEn: 'Gravitational Physics',
    descriptionVi: 'Mô hình 3D con lắc đơn gồm dây treo mảnh không giãn và quả cầu kim loại nặng để xác định gia tốc trọng trường g của Trái Đất.',
    descriptionEn: '3D pendulum with suspended brass sphere for gravitational acceleration measurements.',
    formulaVi: 'Chu kỳ góc nhỏ: T = 2π√(l / g) => g = 4π²·l / T²',
    formulaEn: 'Small-angle: T = 2π√(l / g) => g = 4π²·l / T²',
    componentsVi: [
      'Chân đế gang đúc chống rung vững chãi',
      'Thanh trụ đứng và tay đòn ngang cố định',
      'Dây treo mảnh sợi tổng hợp không dãn',
      'Quả cầu kim loại đồng thau đặc đánh bóng',
    ],
    componentsEn: [
      'Heavy cast-iron stabilizing base',
      'Vertical steel rod & crossbar clamp',
      'Inextensible lightweight suspension cord',
      'Polished solid brass bob sphere',
    ],
  },
  multimeter: {
    id: 'multimeter',
    nameVi: 'Đồng hồ vạn năng hiện số (VOM)',
    nameEn: 'Digital Multimeter (VOM)',
    categoryVi: 'Thiết bị đo lường',
    categoryEn: 'Measurement Systems',
    descriptionVi: 'Mô hình 3D đồng hồ đo đa năng hiển thị số điện áp Vôn, dòng điện Ampe và điện trở Ohm với vỏ cao su bảo vệ chống va đập.',
    descriptionEn: '3D digital multimeter with rotary selector dial, LCD readout, and dual probe leads.',
    formulaVi: 'Đo U (Mắc song song) | Đo I (Mắc nối tiếp)',
    formulaEn: 'Voltage: Parallel probe | Current: Series probe',
    componentsVi: [
      'Vỏ máy nhựa ABS bọc cao su chống va đập',
      'Màn hình tinh thể lỏng LCD 4 chữ số sắc nét',
      'Núm vặn xoay chuyển mạch đa nấc đo',
      'Bộ que đo kim loại bọc nhựa đỏ (+) và đen (-)',
    ],
    componentsEn: [
      'Impact-resistant ABS casing with rubber holster',
      '4-digit high-contrast LCD display',
      'Rotary range selection dial switch',
      'Red positive & black negative test lead probes',
    ],
  },
};

interface ModelViewer3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModelId?: ModelId;
  language: 'vi' | 'en';
}

export const ModelViewer3DModal: React.FC<ModelViewer3DModalProps> = ({
  isOpen,
  onClose,
  initialModelId = 'battery',
  language,
}) => {
  const [selectedId, setSelectedId] = useState<ModelId>(initialModelId);
  const [rotX, setRotX] = useState<number>(0.35); // pitch
  const [rotY, setRotY] = useState<number>(-0.65); // yaw
  const [zoom, setZoom] = useState<number>(1.25);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'shaded' | 'wireframe' | 'xray'>('shaded');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update selected if initialModelId changes
  useEffect(() => {
    if (initialModelId) setSelectedId(initialModelId);
  }, [initialModelId]);

  // 3D Projection math inside viewer
  const projectModelPoint = useCallback((x: number, y: number, z: number, w: number, h: number) => {
    // Rotate Y (yaw)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - y * sinY;
    const y1 = x * sinY + y * cosY;

    // Rotate X (pitch)
    const cosP = Math.cos(rotX);
    const sinP = Math.sin(rotX);
    const y2 = y1 * cosP - z * sinP;
    const z2 = y1 * sinP + z * cosP;

    // Perspective projection
    const fov = 450;
    const scale = (fov / (fov - z2 * 0.4)) * zoom * 1.6;
    const screenX = w / 2 + x1 * scale;
    const screenY = h / 2 + y2 * scale;

    return { x: screenX, y: screenY, depth: z2 };
  }, [rotX, rotY, zoom]);

  // Main 3D render loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Auto rotate
      if (isAutoRotate && !isDraggingRef.current) {
        setRotY(y => y + 0.008);
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * window.devicePixelRatio || canvas.height !== h * window.devicePixelRatio) {
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
      }
      ctx.resetTransform();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // 1. Studio Lighting Background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2 - 20, 20, w / 2, h / 2, Math.max(w, h));
      bgGrad.addColorStop(0, '#1a2e4c');
      bgGrad.addColorStop(0.6, '#0b1626');
      bgGrad.addColorStop(1, '#050b14');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. 3D Pedestal Platform
      const pedR = 85;
      const pedH = 14;

      // Pedestal base shadow
      const pShadow = projectModelPoint(0, 0, -pedH - 10, w, h);
      ctx.beginPath();
      ctx.ellipse(pShadow.x, pShadow.y, 110 * zoom, 50 * zoom, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.filter = 'blur(10px)';
      ctx.fill();
      ctx.filter = 'none';

      // Pedestal Cylinder
      const pedSegments = 24;
      const topPts: Array<{ x: number; y: number; depth: number }> = [];
      const botPts: Array<{ x: number; y: number; depth: number }> = [];

      for (let i = 0; i <= pedSegments; i++) {
        const ang = (i / pedSegments) * Math.PI * 2;
        const px = Math.cos(ang) * pedR;
        const py = Math.sin(ang) * pedR;
        topPts.push(projectModelPoint(px, py, 0, w, h));
        botPts.push(projectModelPoint(px, py, -pedH, w, h));
      }

      // Draw Pedestal Side
      for (let i = 0; i < pedSegments; i++) {
        const p1 = topPts[i];
        const p2 = topPts[i + 1];
        const p3 = botPts[i + 1];
        const p4 = botPts[i];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        const faceNorm = Math.cos((i / pedSegments) * Math.PI * 2 + rotY);
        const colVal = Math.round(25 + faceNorm * 18);
        ctx.fillStyle = `rgb(${colVal}, ${colVal + 15}, ${colVal + 35})`;
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw Pedestal Top Disc
      ctx.beginPath();
      ctx.moveTo(topPts[0].x, topPts[0].y);
      for (let i = 1; i <= pedSegments; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
      ctx.closePath();
      const pedGrad = ctx.createLinearGradient(topPts[0].x, topPts[0].y, topPts[12].x, topPts[12].y);
      pedGrad.addColorStop(0, '#243b5c');
      pedGrad.addColorStop(0.5, '#1e334f');
      pedGrad.addColorStop(1, '#162840');
      ctx.fillStyle = pedGrad;
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pedestal Glowing Neon Ring
      ctx.beginPath();
      ctx.moveTo(topPts[0].x, topPts[0].y);
      for (let i = 1; i <= pedSegments; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 3. Render Selected 3D Model
      ctx.save();
      render3DObject(ctx, selectedId, w, h);
      ctx.restore();

      // 4. Draw 3D Coordinate Axis Indicator in corner (bottom-right)
      drawAxisGizmo(ctx, w - 45, h - 45);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedId, rotX, rotY, zoom, isAutoRotate, renderMode, projectModelPoint]);

  // Draw 3D axis gizmo in corner
  const drawAxisGizmo = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    const axisLen = 22;
    // Project unit axes
    const projectAxis = (x: number, y: number, z: number) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - y * sinY;
      const y1 = x * sinY + y * cosY;
      const cosP = Math.cos(rotX);
      const sinP = Math.sin(rotX);
      const y2 = y1 * cosP - z * sinP;
      return { x: cx + x1 * axisLen, y: cy + y2 * axisLen };
    };

    const pO = { x: cx, y: cy };
    const pX = projectAxis(1, 0, 0);
    const pY = projectAxis(0, 1, 0);
    const pZ = projectAxis(0, 0, 1);

    // X - Red
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pX.x, pX.y);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('X', pX.x + 3, pX.y + 3);

    // Y - Green
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pY.x, pY.y);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Y', pY.x + 3, pY.y + 3);

    // Z - Blue
    ctx.beginPath();
    ctx.moveTo(pO.x, pO.y);
    ctx.lineTo(pZ.x, pZ.y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Z', pZ.x + 3, pZ.y + 3);
  };

  // Specific 3D Model Renderers
  const render3DObject = (ctx: CanvasRenderingContext2D, modelId: ModelId, w: number, h: number) => {
    switch (modelId) {
      case 'battery': {
        // True 3D Cylinder Battery with Terminals & Label
        const radius = 32;
        const height = 75;
        const segments = 24;

        // Bottom ellipse
        const botPts: Array<{ x: number; y: number }> = [];
        const topPts: Array<{ x: number; y: number }> = [];
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const px = Math.cos(a) * radius;
          const py = Math.sin(a) * radius;
          botPts.push(projectModelPoint(px, py, 0, w, h));
          topPts.push(projectModelPoint(px, py, height, w, h));
        }

        // Cylinder Body
        for (let i = 0; i < segments; i++) {
          ctx.beginPath();
          ctx.moveTo(botPts[i].x, botPts[i].y);
          ctx.lineTo(botPts[i + 1].x, botPts[i + 1].y);
          ctx.lineTo(topPts[i + 1].x, topPts[i + 1].y);
          ctx.lineTo(topPts[i].x, topPts[i].y);
          ctx.closePath();

          const norm = Math.cos((i / segments) * Math.PI * 2 + rotY);
          const colR = Math.round(30 + norm * 20);
          const colG = Math.round(90 + norm * 60);
          const colB = Math.round(180 + norm * 70);
          ctx.fillStyle = renderMode === 'wireframe' ? 'transparent' : `rgb(${colR}, ${colG}, ${colB})`;
          ctx.fill();
          ctx.strokeStyle = renderMode === 'wireframe' ? '#38bdf8' : '#1e40af';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Top Disc
        ctx.beginPath();
        ctx.moveTo(topPts[0].x, topPts[0].y);
        for (let i = 1; i <= segments; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
        ctx.closePath();
        ctx.fillStyle = renderMode === 'wireframe' ? 'transparent' : '#1e3a8a';
        ctx.fill();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3D Terminal Posts (+ and -)
        const postH = 16;
        const pPos1 = projectModelPoint(12, 0, height, w, h);
        const pPos2 = projectModelPoint(12, 0, height + postH, w, h);
        ctx.beginPath();
        ctx.moveTo(pPos1.x, pPos1.y);
        ctx.lineTo(pPos2.x, pPos2.y);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 8 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        const pNeg1 = projectModelPoint(-12, 0, height, w, h);
        const pNeg2 = projectModelPoint(-12, 0, height + postH * 0.7, w, h);
        ctx.beginPath();
        ctx.moveTo(pNeg1.x, pNeg1.y);
        ctx.lineTo(pNeg2.x, pNeg2.y);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 8 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Center Brand Text
        const centerP = projectModelPoint(0, 0, height / 2, w, h);
        ctx.font = `bold ${Math.round(16 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('9V DC POWER', centerP.x, centerP.y);
        break;
      }

      case 'bulb': {
        // True 3D Light Bulb with Brass Screw Base, Glass Bulb, & Tungsten Filament
        const baseH = 26;
        const bulbH = 65;
        const bulbR = 36;

        // 1. Brass Base Screw Ridges
        for (let rIdx = 0; rIdx < 4; rIdx++) {
          const zLevel = rIdx * 7;
          const pBase = projectModelPoint(0, 0, zLevel, w, h);
          ctx.beginPath();
          ctx.ellipse(pBase.x, pBase.y, 18 * zoom, 9 * zoom, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#b45309';
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2 * zoom;
          ctx.stroke();
        }

        // 2. Glass Bulb Sphere with 3D Rings
        const domeCenter = projectModelPoint(0, 0, baseH + bulbR * 0.8, w, h);

        // Radial incandescent glow
        const glow = ctx.createRadialGradient(domeCenter.x - 5, domeCenter.y - 8, 4, domeCenter.x, domeCenter.y, bulbR * 1.5 * zoom);
        glow.addColorStop(0, '#ffffff');
        glow.addColorStop(0.3, '#fef08a');
        glow.addColorStop(0.7, '#f59e0b');
        glow.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(domeCenter.x, domeCenter.y, bulbR * 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Glass sphere outline
        ctx.beginPath();
        ctx.arc(domeCenter.x, domeCenter.y, bulbR * zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 3. 3D Tungsten Filament Spiral
        const filCenter = projectModelPoint(0, 0, baseH + bulbR * 0.85, w, h);
        ctx.beginPath();
        ctx.moveTo(filCenter.x - 12 * zoom, filCenter.y + 10 * zoom);
        for (let i = -10; i <= 10; i += 2) {
          const fx = filCenter.x + i * zoom;
          const fy = filCenter.y - Math.cos(i * 0.8) * 12 * zoom;
          ctx.lineTo(fx, fy);
        }
        ctx.lineTo(filCenter.x + 12 * zoom, filCenter.y + 10 * zoom);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5 * zoom;
        ctx.stroke();
        break;
      }

      case 'switch': {
        // True 3D Knife Switch Base & Pivoted Arm
        const wX = 55;
        const wY = 24;
        const baseH = 8;

        // Base Cuboid
        const b1 = projectModelPoint(-wX, -wY, 0, w, h);
        const b2 = projectModelPoint(wX, -wY, 0, w, h);
        const b3 = projectModelPoint(wX, wY, 0, w, h);
        const b4 = projectModelPoint(-wX, wY, 0, w, h);

        const t1 = projectModelPoint(-wX, -wY, baseH, w, h);
        const t2 = projectModelPoint(wX, -wY, baseH, w, h);
        const t3 = projectModelPoint(wX, wY, baseH, w, h);
        const t4 = projectModelPoint(-wX, wY, baseH, w, h);

        // Draw top face
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Contact Jaws
        const s1 = projectModelPoint(-30, 0, baseH + 12, w, h);
        const s2 = projectModelPoint(30, 0, baseH + 12, w, h);
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, 6 * zoom, 0, Math.PI * 2);
        ctx.arc(s2.x, s2.y, 6 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Knife Blade Arm (Angled in 3D)
        const bladePivot = projectModelPoint(-30, 0, baseH + 6, w, h);
        const bladeTip = projectModelPoint(18, -15, baseH + 42, w, h);

        ctx.beginPath();
        ctx.moveTo(bladePivot.x, bladePivot.y);
        ctx.lineTo(bladeTip.x, bladeTip.y);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 6 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Insulated Handle at tip
        const handleTip = projectModelPoint(24, -20, baseH + 54, w, h);
        ctx.beginPath();
        ctx.moveTo(bladeTip.x, bladeTip.y);
        ctx.lineTo(handleTip.x, handleTip.y);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 9 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();
        break;
      }

      case 'resistor': {
        // True 3D Cylinder Resistor with Colored Bands
        const rLen = 65;
        const rRadius = 16;
        const pL = projectModelPoint(-rLen / 2, 0, 20, w, h);
        const pR = projectModelPoint(rLen / 2, 0, 20, w, h);

        // Axial Wire leads
        const pLeadL = projectModelPoint(-rLen, 0, 20, w, h);
        const pLeadR = projectModelPoint(rLen, 0, 20, w, h);
        ctx.beginPath();
        ctx.moveTo(pLeadL.x, pLeadL.y);
        ctx.lineTo(pLeadR.x, pLeadR.y);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3.5 * zoom;
        ctx.stroke();

        // Ceramic Cylindrical Body
        ctx.beginPath();
        ctx.moveTo(pL.x, pL.y - rRadius * zoom);
        ctx.lineTo(pR.x, pR.y - rRadius * zoom);
        ctx.lineTo(pR.x, pR.y + rRadius * zoom);
        ctx.lineTo(pL.x, pL.y + rRadius * zoom);
        ctx.closePath();
        const rGrad = ctx.createLinearGradient(pL.x, pL.y - rRadius * zoom, pL.x, pL.y + rRadius * zoom);
        rGrad.addColorStop(0, '#fef3c7');
        rGrad.addColorStop(0.5, '#d97706');
        rGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = rGrad;
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 4 Color Bands
        const bands = ['#b45309', '#000000', '#dc2626', '#fbbf24'];
        bands.forEach((color, idx) => {
          const frac = -0.35 + idx * 0.22;
          const bandP = projectModelPoint(frac * rLen, 0, 20, w, h);
          ctx.beginPath();
          ctx.rect(bandP.x - 3 * zoom, bandP.y - rRadius * zoom, 6 * zoom, rRadius * 2 * zoom);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
        break;
      }

      case 'spring': {
        // True 3D Helical Spring Coil & Heavy Weight Mass
        const coils = 12;
        const coilR = 20;
        const springLen = 95;

        // Anchor block
        const pAnchor = projectModelPoint(0, 0, 110, w, h);
        ctx.beginPath();
        ctx.arc(pAnchor.x, pAnchor.y, 8 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#64748b';
        ctx.fill();

        // Helical 3D Coils
        ctx.beginPath();
        ctx.moveTo(pAnchor.x, pAnchor.y);
        for (let i = 0; i <= coils * 16; i++) {
          const theta = (i / 16) * Math.PI * 2;
          const z = 110 - (i / (coils * 16)) * springLen;
          const px = Math.cos(theta) * coilR;
          const py = Math.sin(theta) * coilR;
          const p = projectModelPoint(px, py, z, w, h);
          ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5 * zoom;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Mass Block at bottom
        const massZ = 110 - springLen;
        const massP = projectModelPoint(0, 0, massZ - 18, w, h);
        const mSize = 34 * zoom;
        ctx.beginPath();
        ctx.rect(massP.x - mSize / 2, massP.y - mSize / 2, mSize, mSize);
        const mGrad = ctx.createLinearGradient(massP.x - mSize / 2, 0, massP.x + mSize / 2, 0);
        mGrad.addColorStop(0, '#334155');
        mGrad.addColorStop(0.5, '#cbd5e1');
        mGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = mGrad;
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `bold ${Math.round(11 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText('0.5kg', massP.x, massP.y + 4);
        break;
      }

      case 'weight': {
        // True 3D Precision Lathed Brass Calibration Weight
        const rBase = 32 * zoom;
        const hBase = 46;
        const hNeck = 12;
        const hKnob = 18;

        const pBaseCenter = projectModelPoint(0, 0, 0, w, h);
        const pBodyTop = projectModelPoint(0, 0, hBase, w, h);
        const pNeckTop = projectModelPoint(0, 0, hBase + hNeck, w, h);
        const pKnobTop = projectModelPoint(0, 0, hBase + hNeck + hKnob, w, h);
        const pHookTop = projectModelPoint(0, 0, hBase + hNeck + hKnob + 16, w, h);

        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(pBaseCenter.x, pBaseCenter.y, rBase * 1.25, rBase * 0.6, 0, 0, Math.PI * 2);
        const gShad = ctx.createRadialGradient(pBaseCenter.x, pBaseCenter.y, 2, pBaseCenter.x, pBaseCenter.y, rBase * 1.25);
        gShad.addColorStop(0, 'rgba(0,0,0,0.65)');
        gShad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gShad;
        ctx.fill();

        // 1. Base chamfer ring
        ctx.beginPath();
        ctx.ellipse(pBaseCenter.x, pBaseCenter.y, rBase * 1.05, rBase * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#78350f';
        ctx.fill();

        // 2. Main Cylinder Body
        ctx.beginPath();
        ctx.moveTo(pBaseCenter.x - rBase, pBaseCenter.y);
        ctx.lineTo(pBaseCenter.x - rBase, pBodyTop.y);
        ctx.lineTo(pBaseCenter.x + rBase, pBodyTop.y);
        ctx.lineTo(pBaseCenter.x + rBase, pBaseCenter.y);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(pBaseCenter.x - rBase, 0, pBaseCenter.x + rBase, 0);
        bodyGrad.addColorStop(0, '#451a03');
        bodyGrad.addColorStop(0.15, '#92400e');
        bodyGrad.addColorStop(0.38, '#d97706');
        bodyGrad.addColorStop(0.55, '#fef08a');
        bodyGrad.addColorStop(0.72, '#ca8a04');
        bodyGrad.addColorStop(0.9, '#78350f');
        bodyGrad.addColorStop(1, '#a16207');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Machining lathe micro-grooves
        for (let gIdx = 1; gIdx <= 3; gIdx++) {
          const gy = pBaseCenter.y + (pBodyTop.y - pBaseCenter.y) * (gIdx * 0.25);
          ctx.beginPath();
          ctx.ellipse(pBaseCenter.x, gy, rBase * 0.98, rBase * 0.35, 0, 0, Math.PI);
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Body Top Face Ellipse
        ctx.beginPath();
        ctx.ellipse(pBodyTop.x, pBodyTop.y, rBase, rBase * 0.4, 0, 0, Math.PI * 2);
        const topGrad = ctx.createRadialGradient(pBodyTop.x - 8, pBodyTop.y - 4, 3, pBodyTop.x, pBodyTop.y, rBase);
        topGrad.addColorStop(0, '#fef08a');
        topGrad.addColorStop(0.5, '#eab308');
        topGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = topGrad;
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Recessed Neck
        const rNeck = rBase * 0.55;
        ctx.beginPath();
        ctx.moveTo(pBodyTop.x - rNeck, pBodyTop.y);
        ctx.lineTo(pNeckTop.x - rNeck, pNeckTop.y);
        ctx.lineTo(pNeckTop.x + rNeck, pNeckTop.y);
        ctx.lineTo(pBodyTop.x + rNeck, pBodyTop.y);
        ctx.closePath();
        const neckGrad = ctx.createLinearGradient(pBodyTop.x - rNeck, 0, pBodyTop.x + rNeck, 0);
        neckGrad.addColorStop(0, '#291104');
        neckGrad.addColorStop(0.4, '#d97706');
        neckGrad.addColorStop(0.6, '#fef08a');
        neckGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = neckGrad;
        ctx.fill();

        // 4. Ergonomic Head Knob
        const rKnob = rBase * 0.8;
        ctx.beginPath();
        ctx.moveTo(pNeckTop.x - rKnob, pNeckTop.y);
        ctx.lineTo(pKnobTop.x - rKnob, pKnobTop.y);
        ctx.lineTo(pKnobTop.x + rKnob, pKnobTop.y);
        ctx.lineTo(pNeckTop.x + rKnob, pNeckTop.y);
        ctx.closePath();
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Knob dome top
        ctx.beginPath();
        ctx.ellipse(pKnobTop.x, pKnobTop.y, rKnob, rKnob * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = topGrad;
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Specular dot on knob
        ctx.beginPath();
        ctx.arc(pKnobTop.x - rKnob * 0.25, pKnobTop.y - 3, 4 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();

        // 5. Stainless suspension eyelet / hook
        ctx.beginPath();
        ctx.arc(pHookTop.x, pHookTop.y + 4, 9 * zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3.5 * zoom;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pHookTop.x, pHookTop.y + 4, 5 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // 6. Laser Stamped Calibration Text
        const textY = (pBaseCenter.y + pBodyTop.y) / 2 + 2;
        ctx.font = `bold ${Math.round(15 * zoom)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        // 3D engraved highlight offset
        ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.fillText('500g', pBaseCenter.x, textY + 1);
        ctx.fillStyle = '#451a03';
        ctx.fillText('500g', pBaseCenter.x, textY);

        ctx.font = `bold ${Math.round(8 * zoom)}px sans-serif`;
        ctx.fillStyle = '#78350f';
        ctx.fillText('CLASS F1 • OIML R111', pBaseCenter.x, textY + 14 * zoom);

        // Gravity Vector
        const pVecStart = pBaseCenter;
        ctx.beginPath();
        ctx.moveTo(pVecStart.x, pVecStart.y);
        ctx.lineTo(pVecStart.x, pVecStart.y + 45 * zoom);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(pVecStart.x, pVecStart.y + 45 * zoom);
        ctx.lineTo(pVecStart.x - 5, pVecStart.y + 36 * zoom);
        ctx.lineTo(pVecStart.x + 5, pVecStart.y + 36 * zoom);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.font = `bold ${Math.round(10 * zoom)}px sans-serif`;
        ctx.fillStyle = '#ef4444';
        ctx.fillText('P = 4.90 N (m·g)', pVecStart.x + 48 * zoom, pVecStart.y + 42 * zoom);
        break;
      }

      case 'ramp': {
        // True 3D Wedge Prism Ramp & Sliding Cube
        const rL = 100;
        const rW = 40;
        const rH = 55;

        const p1 = projectModelPoint(-rL / 2, -rW / 2, rH, w, h);
        const p2 = projectModelPoint(-rL / 2, rW / 2, rH, w, h);
        const p3 = projectModelPoint(rL / 2, rW / 2, 0, w, h);
        const p4 = projectModelPoint(rL / 2, -rW / 2, 0, w, h);
        const pFloor1 = projectModelPoint(-rL / 2, -rW / 2, 0, w, h);

        // Side triangle
        ctx.beginPath();
        ctx.moveTo(pFloor1.x, pFloor1.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.stroke();

        // Top Incline Face
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        const rampGrad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
        rampGrad.addColorStop(0, '#64748b');
        rampGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = rampGrad;
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sliding Block on Slope
        const blockP = projectModelPoint(0, 0, rH / 2 + 10, w, h);
        const bSize = 22 * zoom;
        ctx.beginPath();
        ctx.rect(blockP.x - bSize / 2, blockP.y - bSize / 2, bSize, bSize);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = `bold ${Math.round(10 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('m', blockP.x, blockP.y + 4);
        break;
      }

      case 'burner': {
        // True 3D Hotplate with Tripod, Wire Gauze, and Boiling Beaker
        const tripodH = 40;
        const bkrH = 45;
        const bkrR = 24;

        // Burner Base
        const pBase = projectModelPoint(0, 0, 6, w, h);
        ctx.beginPath();
        ctx.ellipse(pBase.x, pBase.y, 35 * zoom, 18 * zoom, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Beaker on Tripod
        const pBkrBot = projectModelPoint(0, 0, tripodH, w, h);
        const pBkrTop = projectModelPoint(0, 0, tripodH + bkrH, w, h);

        // Water Fluid
        ctx.beginPath();
        ctx.rect(pBkrBot.x - bkrR * zoom, pBkrBot.y - bkrH * 0.7 * zoom, bkrR * 2 * zoom, bkrH * 0.7 * zoom);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.fill();

        // Beaker Glass
        ctx.beginPath();
        ctx.rect(pBkrBot.x - bkrR * zoom, pBkrTop.y, bkrR * 2 * zoom, pBkrBot.y - pBkrTop.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();

        // Steam Plumes
        const pSteam = projectModelPoint(0, 0, tripodH + bkrH + 18, w, h);
        ctx.beginPath();
        ctx.arc(pSteam.x, pSteam.y, 14 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.fill();
        break;
      }

      case 'thermometer': {
        // True 3D Thermometer with Mercury Bulb and Expansion Column
        const tBot = projectModelPoint(0, 0, 10, w, h);
        const tTop = projectModelPoint(0, 0, 95, w, h);

        // Glass Tube
        ctx.beginPath();
        ctx.moveTo(tBot.x, tBot.y);
        ctx.lineTo(tTop.x, tTop.y);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 8 * zoom;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Mercury Core Column
        const tMid = projectModelPoint(0, 0, 68, w, h);
        ctx.beginPath();
        ctx.moveTo(tBot.x, tBot.y);
        ctx.lineTo(tMid.x, tMid.y);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4 * zoom;
        ctx.stroke();

        // Red Bulb Reservoir
        ctx.beginPath();
        ctx.arc(tBot.x, tBot.y, 8 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        break;
      }

      case 'pendulum': {
        // True 3D Retort Laboratory Stand & Brass Bob
        const pStandBase = projectModelPoint(-45, 0, 0, w, h);
        const pStandTop = projectModelPoint(-45, 0, 110, w, h);
        const pPivot = projectModelPoint(0, 0, 110, w, h);

        // Stand rod
        ctx.beginPath();
        ctx.moveTo(pStandBase.x, pStandBase.y);
        ctx.lineTo(pStandTop.x, pStandTop.y);
        ctx.lineTo(pPivot.x, pPivot.y);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 5 * zoom;
        ctx.stroke();

        // Cord and Bob
        const pBob = projectModelPoint(24, 0, 35, w, h);
        ctx.beginPath();
        ctx.moveTo(pPivot.x, pPivot.y);
        ctx.lineTo(pBob.x, pBob.y);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Polished Brass Sphere
        ctx.beginPath();
        ctx.arc(pBob.x, pBob.y, 16 * zoom, 0, Math.PI * 2);
        const bobGrad = ctx.createRadialGradient(pBob.x - 4, pBob.y - 5, 2, pBob.x, pBob.y, 16 * zoom);
        bobGrad.addColorStop(0, '#fef08a');
        bobGrad.addColorStop(0.6, '#eab308');
        bobGrad.addColorStop(1, '#713f12');
        ctx.fillStyle = bobGrad;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }

      case 'multimeter': {
        // True 3D Handheld Digital Multimeter with Rotary Dial & LCD
        const mX = 35;
        const mY = 22;
        const mH = 65;

        const pTop = projectModelPoint(0, 0, mH, w, h);
        const pBot = projectModelPoint(0, 0, 5, w, h);

        // Main Casing
        ctx.beginPath();
        ctx.rect(pTop.x - mX * zoom, pTop.y, mX * 2 * zoom, pBot.y - pTop.y);
        ctx.fillStyle = '#eab308'; // Fluke-style Yellow
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2 * zoom;
        ctx.stroke();

        // LCD Display Screen
        const pScreen = projectModelPoint(0, 0, mH - 14, w, h);
        ctx.beginPath();
        ctx.rect(pScreen.x - 26 * zoom, pScreen.y - 12 * zoom, 52 * zoom, 24 * zoom);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = `bold ${Math.round(13 * zoom)}px 'JetBrains Mono', sans-serif`;
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('9.02 V', pScreen.x, pScreen.y + 4);

        // Rotary Switch Dial
        const pDial = projectModelPoint(0, 0, mH - 38, w, h);
        ctx.beginPath();
        ctx.arc(pDial.x, pDial.y, 12 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }
    }
  };

  // Mouse drag handlers for 360 viewer
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setIsAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY(y => y + dx * 0.015);
    setRotX(x => Math.max(-1.2, Math.min(1.2, x + dy * 0.015)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  if (!isOpen) return null;

  const currentInfo = MODEL_REGISTRY[selectedId] || MODEL_REGISTRY.battery;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-[#0b1729] border border-[#2a436a] rounded-2xl w-full max-w-5xl h-[88vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#0f213b] border-b border-[#263b5c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{language === 'vi' ? 'Khám phá Mô hình 3D Vật lí' : '3D Physics Model Explorer'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                  360° Studio
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'vi'
                  ? 'Xoay 360°, quan sát chi tiết giải phẫu cấu tạo và thông số vật lí của thiết bị'
                  : 'Orbit 360°, inspect anatomical components, and study physical properties'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1a2d4b] hover:bg-[#253f68] text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left 3D Viewport + Right Specifications */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: 3D Canvas Viewport */}
          <div className="flex-1 relative bg-[#07111e] flex flex-col">
            
            {/* Viewport Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0e1d33]/85 backdrop-blur border border-[#2a436a] rounded-xl p-1.5 shadow-lg">
              <button
                onClick={() => setIsAutoRotate(r => !r)}
                className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
                  isAutoRotate ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-[#1a2f52]'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
                <span>{language === 'vi' ? 'Tự xoay 360°' : 'Auto Orbit'}</span>
              </button>
              <div className="w-px h-4 bg-slate-700" />
              <button
                onClick={() => setZoom(z => Math.min(2.5, z * 1.15))}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1a2f52]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(0.6, z * 0.85))}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1a2f52]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-slate-700" />
              <button
                onClick={() => setRenderMode(m => m === 'shaded' ? 'wireframe' : 'shaded')}
                className={`px-2 py-1 text-xs rounded-lg flex items-center gap-1 transition-colors ${
                  renderMode === 'wireframe' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#1a2f52]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{renderMode === 'wireframe' ? 'Wireframe' : 'Solid 3D'}</span>
              </button>
            </div>

            {/* Instruction tooltip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-[#0b1729]/80 border border-[#263b5c] text-[11px] text-slate-300 pointer-events-none">
              {language === 'vi' ? '🖱️ Kéo chuột để xoay mô hình 3D tự do' : '🖱️ Drag mouse to orbit 3D model freely'}
            </div>

            {/* Main Interactive 3D Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex-1 w-full h-full cursor-grab active:cursor-grabbing block"
            />
          </div>

          {/* RIGHT: Model Selector & Deep Technical Breakdown */}
          <div className="w-96 bg-[#0c192e] border-l border-[#263b5c] flex flex-col overflow-y-auto p-5 space-y-4">
            
            {/* Model Selector Carousel */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {language === 'vi' ? 'Chọn mô hình 3D khảo sát' : 'Select 3D Model'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {Object.values(MODEL_REGISTRY).map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedId(m.id);
                      setRotX(0.35);
                      setRotY(-0.65);
                    }}
                    className={`p-2 rounded-lg text-left text-xs transition-all border flex items-center justify-between ${
                      selectedId === m.id
                        ? 'bg-sky-600/30 border-sky-400 text-white font-semibold shadow-md'
                        : 'bg-[#13243d] border-[#293e5f] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="truncate">{language === 'vi' ? m.nameVi : m.nameEn}</span>
                    {selectedId === m.id && <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Card Header */}
            <div className="p-4 bg-[#11233e] rounded-xl border border-[#2b446a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-sky-400 uppercase tracking-wide">
                  {language === 'vi' ? currentInfo.categoryVi : currentInfo.categoryEn}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {language === 'vi' ? 'Mô hình chuẩn 3D' : 'Valid 3D Mesh'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100">
                {language === 'vi' ? currentInfo.nameVi : currentInfo.nameEn}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'vi' ? currentInfo.descriptionVi : currentInfo.descriptionEn}
              </p>
            </div>

            {/* Physics Principle & Formula */}
            <div className="p-3.5 bg-[#102038] rounded-xl border border-[#233857] space-y-1.5">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'vi' ? 'Nguyên lí & Công thức Vật lí' : 'Physics Law & Formula'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#081220] border border-amber-500/30 text-xs font-mono text-amber-200">
                {language === 'vi' ? currentInfo.formulaVi : currentInfo.formulaEn}
              </div>
            </div>

            {/* Anatomical Components Breakdown */}
            <div className="p-3.5 bg-[#102038] rounded-xl border border-[#233857] space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'vi' ? 'Cấu tạo giải phẫu mô hình 3D' : '3D Structural Components'}</span>
              </div>
              <ul className="space-y-1.5">
                {(language === 'vi' ? currentInfo.componentsVi : currentInfo.componentsEn).map((comp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-sky-400 font-bold mt-0.5">•</span>
                    <span>{comp}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
