import { LabChallenge } from '../types/physics';

export const LAB_CHALLENGES: LabChallenge[] = [
  {
    id: 'ch_electric_1',
    titleVi: 'Thắp sáng bóng đèn mạch kín',
    titleEn: 'Close the Circuit to Light the Bulb',
    targetVi: 'Lắp ráp mạch kín và đóng khóa K để bóng đèn phát sáng với công suất P ≥ 4.0 W.',
    targetEn: 'Assemble a closed circuit and engage switch K so lamp radiates power P ≥ 4.0 W.',
    hintVi: 'Kiểm tra xem khóa K đã đóng chưa và hiệu điện thế của Pin có đủ lớn không.',
    hintEn: 'Check that knife switch is closed and battery voltage provides adequate current.',
    expMode: 'electric',
    isCompleted: (metrics, devices) => {
      const bulb = devices.find(d => d.type === 'bulb');
      const sw = devices.find(d => d.type === 'switch');
      return Boolean(bulb && sw?.switchClosed && metrics.power >= 4.0);
    },
  },
  {
    id: 'ch_spring_1',
    titleVi: 'Bảo toàn cơ năng con lắc lò xo',
    titleEn: 'Oscillating Spring Conservation of Energy',
    targetVi: 'Tạo dao động điều hòa để động năng cực đại E_k đạt tối thiểu 0.20 J.',
    targetEn: 'Induce harmonic oscillation so maximum kinetic energy E_k reaches at least 0.20 J.',
    hintVi: 'Kéo dãn lò xo ra xa vị trí cân bằng (hoặc tăng độ cứng k) rồi thả tự do.',
    hintEn: 'Displace spring further from equilibrium (or increase stiffness k) and release.',
    expMode: 'spring',
    isCompleted: (metrics, devices) => {
      const spring = devices.find(d => d.type === 'spring');
      return Boolean(spring && metrics.kineticEnergy >= 0.20);
    },
  },
  {
    id: 'ch_weight_1',
    titleVi: 'Trọng lượng quả cân chuẩn & Trọng lực',
    titleEn: 'Standard Weight Specimen & Gravitational Force',
    targetVi: 'Thêm quả cân hoặc điều chỉnh khối lượng m ≥ 1.0 kg để đạt trọng lượng P ≥ 9.8 N.',
    targetEn: 'Add weight or adjust mass m ≥ 1.0 kg to achieve weight force P ≥ 9.8 N.',
    hintVi: 'Chọn quả cân trên bàn thí nghiệm và kéo thanh trượt khối lượng lên 1.0kg trở lên.',
    hintEn: 'Select the weight on the workbench and adjust its mass slider to 1.0kg or higher.',
    expMode: 'custom',
    isCompleted: (_metrics, devices) => {
      const weight = devices.find(d => d.type === 'weight');
      return Boolean(weight && (weight.mass ?? 0.5) >= 1.0);
    },
  },
  {
    id: 'ch_ramp_1',
    titleVi: 'Gia tốc trên mặt phẳng nghiêng',
    titleEn: 'Acceleration on Inclined Plane',
    targetVi: 'Điều chỉnh góc nghiêng và độ ma sát để vật trượt đạt vận tốc v ≥ 1.5 m/s.',
    targetEn: 'Adjust incline angle and friction so sliding block attains velocity v ≥ 1.5 m/s.',
    hintVi: 'Tăng góc nghiêng α lên trên 30° hoặc giảm hệ số ma sát μ để gia tốc lớn hơn.',
    hintEn: 'Increase incline angle α above 30° or reduce surface friction coefficient μ.',
    expMode: 'ramp',
    isCompleted: (metrics, devices) => {
      const ramp = devices.find(d => d.type === 'ramp');
      return Boolean(ramp && metrics.velocity >= 1.5);
    },
  },
  {
    id: 'ch_heat_1',
    titleVi: 'Đun sôi nước đến 100°C',
    titleEn: 'Boil Water to 100°C Phase Transition',
    targetVi: 'Bật bếp điện để gia nhiệt nước trong cốc đạt đến nhiệt độ sôi 99.5°C - 100°C.',
    targetEn: 'Turn on the electric heater to bring water beaker to boiling temperature (≥ 99.5°C).',
    hintVi: 'Đảm bảo bếp nhiệt đang ở trạng thái BẬT và kiên nhẫn quan sát cột thủy ngân dâng lên.',
    hintEn: 'Ensure heater is turned ON and observe the mercury column climb steadily.',
    expMode: 'heat',
    isCompleted: (metrics) => {
      return metrics.temperature >= 99.5;
    },
  },
  {
    id: 'ch_pendulum_1',
    titleVi: 'Khảo sát dao động con lắc đơn',
    titleEn: 'Simple Pendulum Period Study',
    targetVi: 'Kích thích con lắc đơn dao động với vận tốc góc đạt v ≥ 0.6 m/s.',
    targetEn: 'Excite simple pendulum oscillation so linear velocity v reaches at least 0.6 m/s.',
    hintVi: 'Kéo con lắc lệch góc lớn hơn (khoảng 30° - 45°) rồi thả không vận tốc ban đầu.',
    hintEn: 'Pull pendulum to a larger initial angle (30° - 45°) and release without initial speed.',
    expMode: 'pendulum',
    isCompleted: (metrics, devices) => {
      const pend = devices.find(d => d.type === 'pendulum');
      return Boolean(pend && metrics.velocity >= 0.6);
    },
  },
];
