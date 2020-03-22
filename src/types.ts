import { Axis, AxisSign, CalibrationStatus } from './constants';

export interface AxisMapping {
  X: {
    axis: Axis;
    sign: AxisSign;
  };
  Y: {
    axis: Axis;
    sign: AxisSign;
  };
  Z: {
    axis: Axis;
    sign: AxisSign;
  };
}

export interface CalibrationStatusMap {
  sys: CalibrationStatus;
  gyro: CalibrationStatus;
  accel: CalibrationStatus;
  mag: CalibrationStatus;
}

export interface Versions {
  device: number;
  accel: number;
  mag: number;
  gyro: number;
  software: string;
  bootloader: number;
}

export interface Offsets {
  accelX: number;
  accelY: number;
  accelZ: number;

  magX: number;
  magY: number;
  magZ: number;

  gyroX: number;
  gyroY: number;
  gyroZ: number;

  accelRadius: number;

  magRadius: number;
}

export interface SelfTestResult {
  mcuPassed: boolean;
  magPassed: boolean;
  accelPassed: boolean;
  gyroPassed: boolean;
}

export interface SensorUnits {
  accel: 'mps2' | 'mg';
  euler: 'deg' | 'rad';
  gyro: 'degps' | 'radps';
  temp: 'c' | 'f';
}
