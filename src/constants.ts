export const BNO055_ID = 0xA0;
export const BNO055_CONFIG_MODE_WAIT = 20;
export const BNO055_MODE_SWITCH_WAIT = 8;

export enum CalibrationStatus {
  NotCalibrated = 0,
  FullyCalibrated = 3,
}

export enum DeviceAddress {
  A = 0x28,
  B = 0x29,
}

export enum PowerLevel {
  Normal,
  Low,
  Suspend,
}

export enum SystemError {
  None,
  PeripheralInitialization,
  SystemInitialization,
  SelfTestResultFailed,
  RegisterMapValueOutOfRange,
  RegisterMapAddressOutOfRange,
  RegisterMapWrite,
  BnoLowPowerModeNotAvailableForSelectedOperationMode,
  AccelerometerPowerModeNotAvailable,
  FusionAlgorithmConfiguration,
  SensorConfiguration,
}

export enum SystemStatus {
  Idle,
  Error,
  InitializingPeripherals,
  Initialization,
  ExecutingSelftest,
  RunningWithFusionAlgorithm,
  RunningWithoutFusionAlgorithm,
}

export enum EulerUnitScale {
  Degs = 16,
  Rads = 900,
}

export enum TempUnitScale {
  C = 1,
  F = 1 / 2,
}

/** Operation modes */
export enum OpMode {
  Config = 0X00,
  /** Non-fusion */
  AccelOnly = 0X01,
  MagOnly = 0X02,
  GyroOnly = 0X03,
  AccelMag = 0X04,
  AccelGyro = 0X05,
  MagGyro = 0X06,
  AccelMagGyro = 0X07,
  /** Fusion */
  Imu = 0X08,
  Compass = 0X09,
  ImuMagForGyro = 0X0A,
  FullFmcOff = 0X0B,
  FullFusion = 0X0C,
}

/** Page 0 Registers */
export enum Reg {
  /* Page ID register definition */
  PAGE_ID = 0X07,

  /* Components IDs */
  DEVICE_ID = 0x00,
  ACCEL_ID = 0x01,
  MAG_ID = 0x02,
  GYRO_ID = 0x03,
  SW_REV_ID_LSB = 0x04,
  SW_REV_ID_MSB = 0x05,
  BOOTLOADER_REV_ID = 0X06,

  /* Accel data */
  ACCEL_DATA_X_LSB = 0X08,
  ACCEL_DATA_X_MSB = 0X09,
  ACCEL_DATA_Y_LSB = 0X0A,
  ACCEL_DATA_Y_MSB = 0X0B,
  ACCEL_DATA_Z_LSB = 0X0C,
  ACCEL_DATA_Z_MSB = 0X0D,

  /* Magnetometer data */
  MAG_DATA_X_LSB = 0X0E,
  MAG_DATA_X_MSB = 0X0F,
  MAG_DATA_Y_LSB = 0X10,
  MAG_DATA_Y_MSB = 0X11,
  MAG_DATA_Z_LSB = 0X12,
  MAG_DATA_Z_MSB = 0X13,

  /* Gyro data */
  GYRO_DATA_X_LSB = 0X14,
  GYRO_DATA_X_MSB = 0X15,
  GYRO_DATA_Y_LSB = 0X16,
  GYRO_DATA_Y_MSB = 0X17,
  GYRO_DATA_Z_LSB = 0X18,
  GYRO_DATA_Z_MSB = 0X19,

  /* Euler data */
  EULER_H_LSB = 0X1A,
  EULER_H_MSB = 0X1B,
  EULER_R_LSB = 0X1C,
  EULER_R_MSB = 0X1D,
  EULER_P_LSB = 0X1E,
  EULER_P_MSB = 0X1F,

  /* Quaternion data */
  QUATERNION_DATA_W_LSB = 0X20,
  QUATERNION_DATA_W_MSB = 0X21,
  QUATERNION_DATA_X_LSB = 0X22,
  QUATERNION_DATA_X_MSB = 0X23,
  QUATERNION_DATA_Y_LSB = 0X24,
  QUATERNION_DATA_Y_MSB = 0X25,
  QUATERNION_DATA_Z_LSB = 0X26,
  QUATERNION_DATA_Z_MSB = 0X27,

  /* Linear acceleration data */
  LINEAR_ACCEL_DATA_X_LSB = 0X28,
  LINEAR_ACCEL_DATA_X_MSB = 0X29,
  LINEAR_ACCEL_DATA_Y_LSB = 0X2A,
  LINEAR_ACCEL_DATA_Y_MSB = 0X2B,
  LINEAR_ACCEL_DATA_Z_LSB = 0X2C,
  LINEAR_ACCEL_DATA_Z_MSB = 0X2D,

  /* Gravity data */
  GRAVITY_DATA_X_LSB = 0X2E,
  GRAVITY_DATA_X_MSB = 0X2F,
  GRAVITY_DATA_Y_LSB = 0X30,
  GRAVITY_DATA_Y_MSB = 0X31,
  GRAVITY_DATA_Z_LSB = 0X32,
  GRAVITY_DATA_Z_MSB = 0X33,

  /* Temperature data */
  TEMP = 0X34,

  /* Status registers */
  CALIB_STAT = 0X35,
  SELFTEST_RESULT = 0X36,
  INTR_STAT = 0X37,

  SYS_CLK_STAT = 0X38,
  SYS_STAT = 0X39,
  SYS_ERR = 0X3A,

  /* Unit selectio */
  UNIT_SEL = 0X3B,
  DATA_SELECT = 0X3C,

  /* Modes */
  OPR_MODE = 0X3D,
  PWR_MODE = 0X3E,

  SYS_TRIGGER = 0X3F,
  TEMP_SOURCE = 0X40,

  /* Axis remap */
  AXIS_MAP_CONFIG = 0X41,
  AXIS_MAP_SIGN = 0X42,

  /* Accelerometer offset */
  ACCEL_OFFSET_X_LSB = 0X55,
  ACCEL_OFFSET_X_MSB = 0X56,
  ACCEL_OFFSET_Y_LSB = 0X57,
  ACCEL_OFFSET_Y_MSB = 0X58,
  ACCEL_OFFSET_Z_LSB = 0X59,
  ACCEL_OFFSET_Z_MSB = 0X5A,

  /* Magnetometer offsets */
  MAG_OFFSET_X_LSB = 0X5B,
  MAG_OFFSET_X_MSB = 0X5C,
  MAG_OFFSET_Y_LSB = 0X5D,
  MAG_OFFSET_Y_MSB = 0X5E,
  MAG_OFFSET_Z_LSB = 0X5F,
  MAG_OFFSET_Z_MSB = 0X60,

  /* Gyroscope offsets */
  GYRO_OFFSET_X_LSB = 0X61,
  GYRO_OFFSET_X_MSB = 0X62,
  GYRO_OFFSET_Y_LSB = 0X63,
  GYRO_OFFSET_Y_MSB = 0X64,
  GYRO_OFFSET_Z_LSB = 0X65,
  GYRO_OFFSET_Z_MSB = 0X66,

  /* Radii */
  ACCEL_RADIUS_LSB = 0X67,
  ACCEL_RADIUS_MSB = 0X68,
  MAG_RADIUS_LSB = 0X69,
  MAG_RADIUS_MSB = 0X6A,
}

/** Remap settings */
export enum RemapRegister {
  REMAP_CONFIG_P0 = 0x21,
  REMAP_CONFIG_P1 = 0x24, // default
  REMAP_CONFIG_P2 = 0x24,
  REMAP_CONFIG_P3 = 0x21,
  REMAP_CONFIG_P4 = 0x24,
  REMAP_CONFIG_P5 = 0x21,
  REMAP_CONFIG_P6 = 0x21,
  REMAP_CONFIG_P7 = 0x24,
}

/** Remap Signs */
export enum RemapSigns {
  REMAP_SIGN_P0 = 0x04,
  REMAP_SIGN_P1 = 0x00, // default
  REMAP_SIGN_P2 = 0x06,
  REMAP_SIGN_P3 = 0x02,
  REMAP_SIGN_P4 = 0x03,
  REMAP_SIGN_P5 = 0x01,
  REMAP_SIGN_P6 = 0x07,
  REMAP_SIGN_P7 = 0x05,
}
