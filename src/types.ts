export interface CalibrationStatus {
  sys: number;
  gyro: number;
  accel: number;
  mag: number;
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
