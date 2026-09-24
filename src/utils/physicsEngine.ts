import {
  DeviceType,
  ExperimentMode,
  LabDevice,
  PhysicsMetrics,
  PlanetGravity,
  DeviceConnection,
  TerminalPort,
} from '../types/physics';

export const GRAVITY_VALUES: Record<PlanetGravity, { value: number; nameVi: string; nameEn: string }> = {
  earth: { value: 9.81, nameVi: 'Trái Đất (9.81 m/s²)', nameEn: 'Earth (9.81 m/s²)' },
  moon: { value: 1.62, nameVi: 'Mặt Trăng (1.62 m/s²)', nameEn: 'Moon (1.62 m/s²)' },
  mars: { value: 3.72, nameVi: 'Sao Hỏa (3.72 m/s²)', nameEn: 'Mars (3.72 m/s²)' },
  zero_g: { value: 0.0, nameVi: 'Không trọng lực (0 m/s²)', nameEn: 'Zero-G (0 m/s²)' },
};

export const DEVICE_METADATA: Record<DeviceType, {
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  formula: string;
  unit: string;
  category: 'electric' | 'mechanics' | 'thermo';
}> = {
  battery: {
    nameVi: 'Nguồn điện / Pin',
    nameEn: 'DC Battery / Power',
    descVi: 'Cung cấp năng lượng điện với suất điện động và hiệu điện thế không đổi cho toàn mạch.',
    descEn: 'Provides electrical energy with constant electromotive force and terminal voltage.',
    formula: 'U = E - I·r',
    unit: 'Volt (V)',
    category: 'electric',
  },
  bulb: {
    nameVi: 'Bóng đèn sợi đốt',
    nameEn: 'Incandescent Bulb',
    descVi: 'Chuyển hóa điện năng thành quang năng và nhiệt năng theo định luật Joule-Lenz.',
    descEn: 'Converts electrical energy into light and thermal heat according to Joule-Lenz law.',
    formula: 'P = U·I = I²·R = U²/R',
    unit: 'Watt (W)',
    category: 'electric',
  },
  switch: {
    nameVi: 'Công tắc / Khóa K',
    nameEn: 'Knife Switch',
    descVi: 'Đóng/ngắt mạch điện an toàn. Nhấn vào công tắc để bật hoặc tắt dòng điện tức thời.',
    descEn: 'Safely closes or opens the circuit loop. Click to toggle current flow.',
    formula: 'I = 0 (khi mở) | I > 0 (khi đóng)',
    unit: 'Trạng thái Đóng / Mở',
    category: 'electric',
  },
  resistor: {
    nameVi: 'Điện trở cố định',
    nameEn: 'Resistor',
    descVi: 'Cản trở dòng điện trong mạch theo định luật Ôm, tỏa nhiệt khi có dòng điện chạy qua.',
    descEn: 'Limits electrical current per Ohm\'s law and dissipates thermal energy.',
    formula: 'R = ρ·(l / S)',
    unit: 'Ohm (Ω)',
    category: 'electric',
  },
  wire: {
    nameVi: 'Dây dẫn đồng bọc cách điện',
    nameEn: 'Connecting Wire',
    descVi: 'Kết nối các linh kiện tạo thành mạch điện khép kín cho electron chuyển động có hướng.',
    descEn: 'Connects electrical terminals allowing continuous ordered flow of conduction electrons.',
    formula: 'I = q / t = n·e·v·S',
    unit: 'Ampe (A)',
    category: 'electric',
  },
  spring: {
    nameVi: 'Lò xo đàn hồi',
    nameEn: 'Helical Spring',
    descVi: 'Lò xo tuân theo định luật Hooke, tích trữ thế năng đàn hồi khi bị biến dạng nén hoặc dãn.',
    descEn: 'Complies with Hooke\'s law, storing elastic potential energy upon compression or stretch.',
    formula: 'F_{đh} = -k·x | E_{đh} = 0.5·k·x²',
    unit: 'N/m, Joule (J)',
    category: 'mechanics',
  },
  weight: {
    nameVi: 'Quả cân chuẩn phòng thí nghiệm',
    nameEn: 'Precision Calibration Weight',
    descVi: 'Khối kim loại đúc chuẩn (đồng thau / thép bóng) có núm chóp tròn và quai móc, khối lượng chính xác để khảo sát trọng lực P = m·g và định luật Niu-tơn.',
    descEn: 'Precision brass/chrome calibration weight specimen with ergonomic knob and suspension hook.',
    formula: 'P = m·g | P(N) = m(kg) × g(m/s²)',
    unit: 'Kilogram (kg), Newton (N)',
    category: 'mechanics',
  },
  ramp: {
    nameVi: 'Mặt phẳng nghiêng',
    nameEn: 'Inclined Plane Track',
    descVi: 'Thiết bị nghiên cứu chuyển động biến đổi đều, phân tích lực trọng trường và ma sát trượt.',
    descEn: 'Inclined track for studying uniform accelerated motion, normal force, and friction.',
    formula: 'a = g·(sinα - μ·cosα)',
    unit: 'Góc nghiêng (°), μ',
    category: 'mechanics',
  },
  thermometer: {
    nameVi: 'Nhiệt kế thủy ngân',
    nameEn: 'Glass Thermometer',
    descVi: 'Dụng cụ đo nhiệt độ dựa trên sự nở vì nhiệt của chất lỏng trong ống mao dẫn.',
    descEn: 'Measures thermal state based on volumetric thermal expansion of liquid inside tube.',
    formula: 'ΔL = L_0·β·ΔT',
    unit: 'Độ C (°C)',
    category: 'thermo',
  },
  burner: {
    nameVi: 'Bếp nhiệt điện / Đèn cồn',
    nameEn: 'Electric Heater Burner',
    descVi: 'Cung cấp nhiệt lượng theo công suất định mức để làm nóng nước và làm thay đổi pha.',
    descEn: 'Provides controlled thermal power to heat liquids and observe boiling phase change.',
    formula: 'Q = P·t = m·c·ΔT',
    unit: 'Watt (W), Joule (J)',
    category: 'thermo',
  },
  pendulum: {
    nameVi: 'Con lắc đơn',
    nameEn: 'Simple Pendulum',
    descVi: 'Dây treo nhẹ không dãn gắn vật nặng, dao động tuần hoàn quanh vị trí cân bằng bền.',
    descEn: 'Light inextensible string with attached mass bob oscillating about equilibrium position.',
    formula: 'T ≈ 2π·√(L / g)',
    unit: 'Giây (s), Chiều dài L (m)',
    category: 'mechanics',
  },
  multimeter: {
    nameVi: 'Đồng hồ vạn năng số (V/A/Ω)',
    nameEn: 'Digital Multimeter',
    descVi: 'Thiết bị đo chính xác điện áp, cường độ dòng điện và điện trở linh kiện.',
    descEn: 'Precision instrument for measuring voltage, current intensity, and branch resistance.',
    formula: 'U = I·R',
    unit: 'V, A, Ω',
    category: 'electric',
  },
};

export function createPresetDevices(mode: ExperimentMode): LabDevice[] {
  switch (mode) {
    case 'electric':
      return [
        {
          id: 'dev_battery_1',
          type: 'battery',
          nameVi: 'Pin nguồn 9V',
          nameEn: '9V Battery',
          x: -160,
          y: -40,
          z: 0,
          batteryVoltage: 9.0,
        },
        {
          id: 'dev_switch_1',
          type: 'switch',
          nameVi: 'Công tắc K',
          nameEn: 'Knife Switch',
          x: -50,
          y: -100,
          z: 0,
          switchClosed: true,
        },
        {
          id: 'dev_resistor_1',
          type: 'resistor',
          nameVi: 'Điện trở 10Ω',
          nameEn: '10Ω Resistor',
          x: 60,
          y: -100,
          z: 0,
          resistorResistance: 10.0,
        },
        {
          id: 'dev_bulb_1',
          type: 'bulb',
          nameVi: 'Bóng đèn 12V-15W',
          nameEn: 'Lamp 12V-15W',
          x: 160,
          y: -40,
          z: 0,
          bulbResistance: 15.0,
          bulbRatedPower: 15.0,
        },
        {
          id: 'dev_multimeter_1',
          type: 'multimeter',
          nameVi: 'Vôn kế / Ampe kế',
          nameEn: 'Digital Multimeter',
          x: 0,
          y: 70,
          z: 0,
        },
      ];

    case 'spring':
      return [
        {
          id: 'dev_spring_1',
          type: 'spring',
          nameVi: 'Hệ lò xo dao động',
          nameEn: 'Spring Oscillator',
          x: 0,
          y: -20,
          z: 0,
          springK: 45.0, // N/m
          mass: 0.5, // kg
          damping: 0.12, // light damping
          springDisplacement: 0.16, // initial stretch 16cm
          springVelocity: 0.0,
        },
      ];

    case 'ramp':
      return [
        {
          id: 'dev_ramp_1',
          type: 'ramp',
          nameVi: 'Mặt phẳng nghiêng góc 30°',
          nameEn: 'Inclined Ramp 30°',
          x: 0,
          y: -10,
          z: 0,
          rampAngle: 30, // 30 degrees
          rampLength: 1.5, // meters
          rampFriction: 0.15, // mu
          mass: 0.8, // kg
          blockPos: 0.05, // near the top (0 = top, 1 = bottom)
          blockVel: 0.0,
        },
      ];

    case 'heat':
      return [
        {
          id: 'dev_burner_1',
          type: 'burner',
          nameVi: 'Bếp nhiệt điện 600W',
          nameEn: 'Electric Heater 600W',
          x: -60,
          y: -10,
          z: 0,
          burnerOn: true,
          burnerPower: 600,
        },
        {
          id: 'dev_thermometer_1',
          type: 'thermometer',
          nameVi: 'Cốc nước & Nhiệt kế',
          nameEn: 'Water Beaker & Thermometer',
          x: 80,
          y: -10,
          z: 0,
          temperature: 25.0, // initial 25 deg C
          waterVolume: 300, // 300 ml
        },
      ];

    case 'pendulum':
      return [
        {
          id: 'dev_pendulum_1',
          type: 'pendulum',
          nameVi: 'Con lắc đơn chuẩn',
          nameEn: 'Simple Pendulum',
          x: 0,
          y: -20,
          z: 0,
          pendulumLength: 0.85, // 85 cm
          mass: 0.4, // kg
          pendulumAngle: (35 * Math.PI) / 180, // 35 degrees
          pendulumVelocity: 0.0,
          damping: 0.05,
        },
      ];

    case 'custom':
    default:
      return [
        {
          id: 'dev_battery_custom',
          type: 'battery',
          nameVi: 'Nguồn Pin 12V',
          nameEn: '12V Battery',
          x: -120,
          y: -30,
          z: 0,
          batteryVoltage: 12.0,
        },
        {
          id: 'dev_bulb_custom',
          type: 'bulb',
          nameVi: 'Bóng đèn',
          nameEn: 'Light Bulb',
          x: 60,
          y: -30,
          z: 0,
          bulbResistance: 12.0,
          bulbRatedPower: 12.0,
        },
        {
          id: 'dev_switch_custom',
          type: 'switch',
          nameVi: 'Khóa K',
          nameEn: 'Knife Switch',
          x: -30,
          y: -90,
          z: 0,
          switchClosed: true,
        },
      ];
  }
}

/**
 * Creates default preset wire connections for the experiment mode or current device list
 */
export function createPresetConnections(modeOrDevices: ExperimentMode | LabDevice[]): DeviceConnection[] {
  if (Array.isArray(modeOrDevices)) {
    const devices = modeOrDevices;
    const bat = devices.find(d => d.type === 'battery');
    const sw = devices.find(d => d.type === 'switch');
    const res = devices.find(d => d.type === 'resistor');
    const blb = devices.find(d => d.type === 'bulb');
    const multi = devices.find(d => d.type === 'multimeter');

    const conns: DeviceConnection[] = [];
    if (bat && sw) {
      conns.push({
        id: `wire_p_bat_sw_${Date.now()}_1`,
        fromDeviceId: bat.id,
        fromPort: 'positive',
        toDeviceId: sw.id,
        toPort: 'in',
        color: '#ef4444',
      });
    }

    if (sw && res) {
      conns.push({
        id: `wire_p_sw_res_${Date.now()}_2`,
        fromDeviceId: sw.id,
        fromPort: 'out',
        toDeviceId: res.id,
        toPort: 'left',
        color: '#eab308',
      });
    } else if (sw && blb) {
      conns.push({
        id: `wire_p_sw_blb_${Date.now()}_2`,
        fromDeviceId: sw.id,
        fromPort: 'out',
        toDeviceId: blb.id,
        toPort: 'a',
        color: '#eab308',
      });
    }

    if (res && blb) {
      conns.push({
        id: `wire_p_res_blb_${Date.now()}_3`,
        fromDeviceId: res.id,
        fromPort: 'right',
        toDeviceId: blb.id,
        toPort: 'a',
        color: '#38bdf8',
      });
    }

    if (blb && bat) {
      conns.push({
        id: `wire_p_blb_bat_${Date.now()}_4`,
        fromDeviceId: blb.id,
        fromPort: 'b',
        toDeviceId: bat.id,
        toPort: 'negative',
        color: '#1e293b',
      });
    }

    if (multi && blb) {
      conns.push(
        {
          id: `wire_p_multi_pos_${Date.now()}_5`,
          fromDeviceId: multi.id,
          fromPort: 'positive',
          toDeviceId: blb.id,
          toPort: 'a',
          color: '#f87171',
        },
        {
          id: `wire_p_multi_neg_${Date.now()}_6`,
          fromDeviceId: multi.id,
          fromPort: 'negative',
          toDeviceId: blb.id,
          toPort: 'b',
          color: '#334155',
        }
      );
    }
    return conns;
  }

  switch (modeOrDevices) {
    case 'electric':
      return [
        {
          id: 'wire_1',
          fromDeviceId: 'dev_battery_1',
          fromPort: 'positive',
          toDeviceId: 'dev_switch_1',
          toPort: 'in',
          color: '#ef4444',
        },
        {
          id: 'wire_2',
          fromDeviceId: 'dev_switch_1',
          fromPort: 'out',
          toDeviceId: 'dev_resistor_1',
          toPort: 'left',
          color: '#eab308',
        },
        {
          id: 'wire_3',
          fromDeviceId: 'dev_resistor_1',
          fromPort: 'right',
          toDeviceId: 'dev_bulb_1',
          toPort: 'a',
          color: '#38bdf8',
        },
        {
          id: 'wire_4',
          fromDeviceId: 'dev_bulb_1',
          fromPort: 'b',
          toDeviceId: 'dev_battery_1',
          toPort: 'negative',
          color: '#1e293b',
        },
        {
          id: 'wire_5',
          fromDeviceId: 'dev_multimeter_1',
          fromPort: 'positive',
          toDeviceId: 'dev_bulb_1',
          toPort: 'a',
          color: '#f87171',
        },
        {
          id: 'wire_6',
          fromDeviceId: 'dev_multimeter_1',
          fromPort: 'negative',
          toDeviceId: 'dev_bulb_1',
          toPort: 'b',
          color: '#334155',
        },
      ];
    default:
      return [];
  }
}

/**
 * Get 3D coordinate offset of a terminal port on a device
 */
export function getDeviceTerminalPort(device: LabDevice, port?: TerminalPort): { x: number; y: number; z: number } {
  switch (device.type) {
    case 'battery':
      if (port === 'negative') return { x: device.x - 8, y: device.y, z: 50 };
      return { x: device.x + 8, y: device.y, z: 50 }; // positive
    case 'switch':
      if (port === 'out' || port === 'right') return { x: device.x + 16, y: device.y, z: 6 };
      return { x: device.x - 16, y: device.y, z: 6 }; // in
    case 'resistor':
      if (port === 'right' || port === 'out') return { x: device.x + 36, y: device.y, z: 8 };
      return { x: device.x - 36, y: device.y, z: 8 }; // left
    case 'bulb':
      if (port === 'b' || port === 'negative') return { x: device.x + 12, y: device.y, z: 8 };
      return { x: device.x - 12, y: device.y, z: 8 }; // a
    case 'multimeter':
      if (port === 'negative' || port === 'right') return { x: device.x + 8, y: device.y + 14, z: 6 };
      return { x: device.x - 8, y: device.y + 14, z: 6 }; // positive
    case 'burner':
      if (port === 'out' || port === 'right') return { x: device.x + 22, y: device.y, z: 12 };
      return { x: device.x - 22, y: device.y, z: 12 };
    case 'weight':
      return { x: device.x, y: device.y, z: 38 };
    default:
      return { x: device.x, y: device.y, z: 10 };
  }
}

/**
 * Check if electric circuit forms a closed conducting loop
 */
export function checkCircuitConnectivity(
  devices: LabDevice[],
  connections: DeviceConnection[]
): { isClosed: boolean; activeDevices: Set<string>; totalR: number } {
  const battery = devices.find(d => d.type === 'battery');
  if (!battery || connections.length === 0) {
    return { isClosed: false, activeDevices: new Set(), totalR: 15 };
  }

  // Any open switch breaks conductivity
  const blockedIds = new Set<string>();
  for (const d of devices) {
    if (d.type === 'switch' && d.switchClosed === false) {
      blockedIds.add(d.id);
    }
  }

  // Build undirected adjacency graph
  const adj = new Map<string, string[]>();
  for (const d of devices) {
    adj.set(d.id, []);
  }

  for (const conn of connections) {
    // Exclude multimeter probe loops from main circuit power check
    const fromDev = devices.find(d => d.id === conn.fromDeviceId);
    const toDev = devices.find(d => d.id === conn.toDeviceId);
    if (!fromDev || !toDev) continue;
    if (fromDev.type === 'multimeter' || toDev.type === 'multimeter') continue;

    adj.get(conn.fromDeviceId)?.push(conn.toDeviceId);
    adj.get(conn.toDeviceId)?.push(conn.fromDeviceId);
  }

  const batteryNeighbors = adj.get(battery.id) || [];
  if (batteryNeighbors.length < 2) {
    return { isClosed: false, activeDevices: new Set(), totalR: 15 };
  }

  // Detect cycle passing through battery without passing through blocked switches
  let hasLoop = false;
  const parent = new Map<string, string>();
  const q: string[] = [batteryNeighbors[0]];
  const seen = new Set<string>([battery.id, batteryNeighbors[0]]);
  parent.set(batteryNeighbors[0], battery.id);

  while (q.length > 0) {
    const curr = q.shift()!;
    if (blockedIds.has(curr)) continue;

    for (const neighbor of adj.get(curr) || []) {
      if (blockedIds.has(neighbor)) continue;

      if (neighbor === battery.id && curr !== batteryNeighbors[0]) {
        hasLoop = true;
        break;
      }
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        parent.set(neighbor, curr);
        q.push(neighbor);
      }
    }
    if (hasLoop) break;
  }

  // Calculate circuit resistance
  let totalR = 0;
  const activeDevices = new Set<string>();
  if (hasLoop) {
    for (const d of devices) {
      if (seen.has(d.id) && !blockedIds.has(d.id)) {
        activeDevices.add(d.id);
        if (d.type === 'bulb') totalR += (d.bulbResistance ?? 15);
        if (d.type === 'resistor') totalR += (d.resistorResistance ?? 10);
      }
    }
  }

  totalR = Math.max(0.5, totalR);
  return { isClosed: hasLoop, activeDevices, totalR };
}

/**
 * Step simulation forward by dt seconds with high numerical stability
 */
export function stepPhysicsSimulation(
  devices: LabDevice[],
  prevMetrics: PhysicsMetrics,
  dt: number,
  planet: PlanetGravity,
  expMode: ExperimentMode,
  connections?: DeviceConnection[]
): { updatedDevices: LabDevice[]; updatedMetrics: PhysicsMetrics } {
  const g = GRAVITY_VALUES[planet].value;
  const newDevices = devices.map(d => ({ ...d }));

  let electricEnergy = prevMetrics.electricEnergy;
  let kineticEnergy = 0;
  let potentialEnergy = 0;
  let heatEnergy = prevMetrics.heatEnergy;
  let currentVelocity = 0;
  let currentAccel = 0;
  let currentVoltage = 0;
  let currentAmps = 0;
  let currentPower = 0;
  let currentTemp = prevMetrics.temperature;

  // 1. Electric Circuit
  const battery = newDevices.find(d => d.type === 'battery');
  const bulb = newDevices.find(d => d.type === 'bulb');
  const knifeSwitch = newDevices.find(d => d.type === 'switch');
  const resistor = newDevices.find(d => d.type === 'resistor');

  if (battery) {
    let isCircuitClosed = false;
    let totalR = 15;

    if (connections && connections.length > 0) {
      const connResult = checkCircuitConnectivity(newDevices, connections);
      isCircuitClosed = connResult.isClosed;
      totalR = connResult.totalR;
    } else {
      isCircuitClosed = knifeSwitch ? knifeSwitch.switchClosed !== false : true;
      const bulbR = bulb?.bulbResistance ?? 15.0;
      const resistorR = resistor?.resistorResistance ?? 0.0;
      totalR = Math.max(0.5, bulbR + resistorR);
    }

    const voltage = battery.batteryVoltage ?? 9.0;

    if (isCircuitClosed) {
      currentVoltage = voltage;
      currentAmps = voltage / totalR;
      currentPower = currentVoltage * currentAmps;
      const energyIncrement = currentPower * dt;
      electricEnergy += energyIncrement;
      // Bulb emits heat and light
      heatEnergy += energyIncrement * 0.4;
    } else {
      currentVoltage = 0;
      currentAmps = 0;
      currentPower = 0;
    }
  }

  // 2. Spring Mechanics
  const spring = newDevices.find(d => d.type === 'spring');
  if (spring) {
    const k = spring.springK ?? 50.0;
    const m = spring.mass ?? 0.5;
    const b = spring.damping ?? 0.1;
    let x = spring.springDisplacement ?? 0.15;
    let v = spring.springVelocity ?? 0.0;

    // Harmonic equation: m*a = -k*x - b*v
    // Semi-implicit Euler
    const a = (-k * x - b * v) / m;
    v += a * dt;
    x += v * dt;

    spring.springDisplacement = x;
    spring.springVelocity = v;

    kineticEnergy = 0.5 * m * v * v;
    potentialEnergy = 0.5 * k * x * x;
    currentVelocity = Math.abs(v);
    currentAccel = Math.abs(a);

    // Damping heat dissipation
    heatEnergy += b * v * v * dt;
  }

  // 3. Precision Calibration Weight
  const weight = newDevices.find(d => d.type === 'weight');
  if (weight) {
    const m = weight.mass ?? 0.5;
    const currentHeight = ((weight.z ?? 0) / 100);
    potentialEnergy = m * g * currentHeight;
    const hasPendulum = newDevices.some(d => d.type === 'pendulum');
    if (!spring && !hasPendulum) {
      currentAccel = g;
    }
  }

  // 3b. Inclined Ramp
  const ramp = newDevices.find(d => d.type === 'ramp');
  if (ramp) {
    const angleRad = ((ramp.rampAngle ?? 30) * Math.PI) / 180;
    const mu = ramp.rampFriction ?? 0.15;
    const m = ramp.mass ?? 0.8;
    const length = ramp.rampLength ?? 1.5;
    let pos = ramp.blockPos ?? 0.0; // 0 to 1
    let vel = ramp.blockVel ?? 0.0; // m/s

    // Acceleration down slope
    const sinTheta = Math.sin(angleRad);
    const cosTheta = Math.cos(angleRad);
    const netForceFactor = sinTheta - mu * cosTheta;

    let a = 0;
    if (netForceFactor > 0.001) {
      a = g * netForceFactor;
    }

    if (pos < 0.98) {
      vel += a * dt;
      pos += (vel * dt) / length;
      if (pos > 0.98) {
        pos = 0.98;
        vel = 0; // hit stopper
      }
    } else {
      vel = 0;
      a = 0;
    }

    ramp.blockPos = pos;
    ramp.blockVel = vel;

    currentVelocity = vel;
    currentAccel = a;
    kineticEnergy = 0.5 * m * vel * vel;
    const currentHeight = (1 - pos) * length * sinTheta;
    potentialEnergy = m * g * currentHeight;
    heatEnergy += mu * m * g * cosTheta * vel * dt;
  }

  // 4. Thermodynamics & Heat
  const burner = newDevices.find(d => d.type === 'burner');
  const thermo = newDevices.find(d => d.type === 'thermometer');
  if (thermo) {
    let T = thermo.temperature ?? 25.0;
    const waterVol = thermo.waterVolume ?? 250; // ml => 0.25 kg
    const mWater = waterVol / 1000;
    const specificHeat = 4184; // J/(kg*C)

    if (burner && burner.burnerOn) {
      const power = burner.burnerPower ?? 500;
      const heatIn = power * dt;
      heatEnergy += heatIn;

      // Rate of temp increase dT = Q / (m * c)
      if (T < 100.0) {
        const dT = heatIn / (mWater * specificHeat);
        T = Math.min(100.0, T + dT);
      } else {
        // At 100C, liquid boils and converts to steam
        T = 100.0 + (Math.random() * 0.4 - 0.2);
      }
    } else {
      // Passive cooling towards room temperature (25°C)
      if (T > 25.0) {
        T -= 0.08 * (T - 25.0) * dt;
      }
    }

    thermo.temperature = T;
    currentTemp = T;
  }

  // 5. Pendulum
  const pend = newDevices.find(d => d.type === 'pendulum');
  if (pend) {
    const L = pend.pendulumLength ?? 0.8;
    const m = pend.mass ?? 0.4;
    const b = pend.damping ?? 0.05;
    let theta = pend.pendulumAngle ?? 0.5;
    let omega = pend.pendulumVelocity ?? 0.0;

    // alpha = - (g / L) * sin(theta) - (b / m) * omega
    const alpha = -(g / L) * Math.sin(theta) - (b / m) * omega;
    omega += alpha * dt;
    theta += omega * dt;

    pend.pendulumAngle = theta;
    pend.pendulumVelocity = omega;

    const linearVel = Math.abs(omega * L);
    currentVelocity = linearVel;
    currentAccel = Math.abs(alpha * L);
    kineticEnergy = 0.5 * m * linearVel * linearVel;
    // h = L * (1 - cos(theta))
    const h = L * (1 - Math.cos(theta));
    potentialEnergy = m * g * h;
    heatEnergy += b * linearVel * linearVel * dt;
  }

  const totalEnergy = electricEnergy + kineticEnergy + potentialEnergy;

  return {
    updatedDevices: newDevices,
    updatedMetrics: {
      time: prevMetrics.time + dt,
      electricEnergy,
      kineticEnergy,
      potentialEnergy,
      heatEnergy,
      totalEnergy,
      velocity: currentVelocity,
      acceleration: currentAccel,
      temperature: currentTemp,
      voltage: currentVoltage,
      current: currentAmps,
      power: currentPower,
    },
  };
}
