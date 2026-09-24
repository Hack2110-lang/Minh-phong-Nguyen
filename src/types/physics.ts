export type DeviceType = 
  | 'battery' 
  | 'bulb' 
  | 'switch' 
  | 'resistor' 
  | 'wire' 
  | 'spring' 
  | 'weight' 
  | 'ramp' 
  | 'thermometer' 
  | 'burner' 
  | 'pendulum' 
  | 'multimeter';

export type ExperimentMode = 
  | 'electric' 
  | 'spring' 
  | 'ramp' 
  | 'heat' 
  | 'pendulum' 
  | 'custom';

export type PlanetGravity = 'earth' | 'moon' | 'mars' | 'zero_g';

export type TerminalPort = 'positive' | 'negative' | 'left' | 'right' | 'in' | 'out' | 'a' | 'b';

export interface DeviceConnection {
  id: string;
  fromDeviceId: string;
  fromPort?: TerminalPort;
  toDeviceId: string;
  toPort?: TerminalPort;
  color?: string; // wire color
}

export interface LabPerson {
  id: string;
  kind: 'student' | 'teacher';
  name: string;
  x: number;
  y: number;
  speech?: string;
  avatarSeed?: number;
  avatarUrl?: string;
  roleVi?: string;
  roleEn?: string;
}

export interface LabDevice {
  id: string;
  type: DeviceType;
  x: number; // 3D lab table coordinate X (-300 to 300)
  y: number; // 3D lab table coordinate Y (depth: -200 to 200)
  z: number; // height from table surface
  nameVi: string;
  nameEn: string;
  // Specific device states
  batteryVoltage?: number; // e.g. 9V
  bulbResistance?: number; // e.g. 10 ohm
  bulbRatedPower?: number; // e.g. 15W
  switchClosed?: boolean;
  resistorResistance?: number; // e.g. 20 ohm
  
  // Spring & Weight
  springK?: number; // N/m (e.g. 50)
  mass?: number; // kg (e.g. 0.5)
  weightMaterial?: 'brass' | 'chrome' | 'iron'; // material finish for weight
  damping?: number; // damping factor
  springDisplacement?: number; // meters from equilibrium
  springVelocity?: number; // m/s
  
  // Ramp
  rampAngle?: number; // degrees (e.g. 30)
  rampLength?: number; // meters (e.g. 1.2)
  rampFriction?: number; // mu (e.g. 0.15)
  blockPos?: number; // 0 to 1 along ramp
  blockVel?: number; // m/s
  
  // Heat & Thermometer
  temperature?: number; // deg C
  burnerOn?: boolean;
  burnerPower?: number; // Watts (e.g. 500W)
  waterVolume?: number; // ml (e.g. 250)
  
  // Pendulum
  pendulumLength?: number; // meters (e.g. 0.8)
  pendulumAngle?: number; // radians
  pendulumVelocity?: number; // rad/s
}

export interface PhysicsMetrics {
  time: number;
  electricEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
  heatEnergy: number;
  totalEnergy: number;
  velocity: number;
  acceleration: number;
  temperature: number;
  voltage: number;
  current: number;
  power: number;
}

export interface LabChallenge {
  id: string;
  titleVi: string;
  titleEn: string;
  targetVi: string;
  targetEn: string;
  hintVi: string;
  hintEn: string;
  expMode: ExperimentMode;
  isCompleted: (metrics: PhysicsMetrics, devices: LabDevice[]) => boolean;
}

export interface HistoryPoint {
  t: number;
  kinetic: number;
  potential: number;
  electric: number;
  heat: number;
  val: number; // main observed value (velocity, temperature, displacement, current)
}
