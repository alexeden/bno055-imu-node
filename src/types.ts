export interface CalibrationStatus {
  sys: number;
  gyro: number;
  accel: number;
  mag: number;
}

export interface Versions {
  device: number;
  accel: number;
  mag: number;
  gyro: number;
  software: number;
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
