import { quat } from 'gl-matrix';
import { OpMode, BNO055_ID, Reg, BNO055_ADDRESS_A, PowerLevel, BNO055_CONFIG_MODE_WAIT, BNO055_MODE_SWITCH_WAIT } from './constants';
import { I2cHelper } from './i2c-helper';
import { CalibrationStatus, Offsets, Versions } from './types';


const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

export class BNO055 {

  static async begin(
    mode: OpMode = OpMode.Full,
    useXtal = false
  ): Promise<BNO055> {
    console.log('begin BNO055');
    const bus = await I2cHelper.open(BNO055_ADDRESS_A);
    console.log('bus open');
    const device = new BNO055(bus);
    await device.verifyConnection();
    await device.setMode(OpMode.Config);
    await device.resetSystem();
    await device.setPowerLevel();

    await device.verifyConnection();
    await device.resetSystem(); // why?
    await device.setMode(mode);
    await device.useExternalCrystal(useXtal);
    await wait(1000);

    return device;
  }

  mode: OpMode = OpMode.Config;

  private constructor(
    private readonly bus: I2cHelper
  ) { }

  async verifyConnection() {
    if (await this.bus.readByte(Reg.DEVICE_ID) !== BNO055_ID) {
      throw new Error(`Device does not seem to be connected`);
    }
    else {
      console.log('device connected!');
    }
  }

  async resetSystem() {
    await this.bus.writeByte(Reg.SYS_TRIGGER, 0x20);
    await wait(2000);
    console.log('device reset');
  }

  async getPage() {
    return await this.bus.readByte(Reg.PAGE_ID) & 0x1;
  }

  async getSystemStatus() {
    return await this.bus.readByte(Reg.SYS_STAT) & 0x7;
  }

  async getSystemError() {
    return await this.bus.readByte(Reg.SYS_ERR) & 0xF;
  }

  async getSensorOffsets(): Promise<Offsets | undefined> {
    if (await this.isFullyCalibrated()) {
      const savedMode = this.mode;
      /* Switch to config mode (just in case since this is the default) */
      await this.setMode(OpMode.Config);

      const offsets: Offsets = {
        /* Accel offset range depends on the G-range:
          +/-2g  = +/- 2000 mg
          +/-4g  = +/- 4000 mg
          +/-8g  = +/- 8000 mg
          +/-1§g = +/- 16000 mg */
        accelX: (await this.bus.readByte(Reg.ACCEL_OFFSET_X_MSB) << 8)
          | (await this.bus.readByte(Reg.ACCEL_OFFSET_X_LSB)),
        accelY: (await this.bus.readByte(Reg.ACCEL_OFFSET_Y_MSB) << 8)
          | (await this.bus.readByte(Reg.ACCEL_OFFSET_Y_LSB)),
        accelZ: (await this.bus.readByte(Reg.ACCEL_OFFSET_Z_MSB) << 8)
          | (await this.bus.readByte(Reg.ACCEL_OFFSET_Z_LSB)),
        /* Magnetometer offset range = +/- 6400 LSB where 1uT = 16 LSB */
        magX: (await this.bus.readByte(Reg.MAG_OFFSET_X_MSB) << 8)
          | (await this.bus.readByte(Reg.MAG_OFFSET_X_LSB)),
        magY: (await this.bus.readByte(Reg.MAG_OFFSET_Y_MSB) << 8)
          | (await this.bus.readByte(Reg.MAG_OFFSET_Y_LSB)),
        magZ: (await this.bus.readByte(Reg.MAG_OFFSET_Z_MSB) << 8)
          | (await this.bus.readByte(Reg.MAG_OFFSET_Z_LSB)),
        /* Gyro offset range depends on the DPS range:
          2000 dps = +/- 32000 LSB
          1000 dps = +/- 16000 LSB
          500 dps = +/- 8000 LSB
          250 dps = +/- 4000 LSB
          125 dps = +/- 2000 LSB
          ... where 1 DPS = 16 LSB */
        gyroX: (await this.bus.readByte(Reg.GYRO_OFFSET_X_MSB) << 8)
          | (await this.bus.readByte(Reg.GYRO_OFFSET_X_LSB)),
        gyroY: (await this.bus.readByte(Reg.GYRO_OFFSET_Y_MSB) << 8)
          | (await this.bus.readByte(Reg.GYRO_OFFSET_Y_LSB)),
        gyroZ: (await this.bus.readByte(Reg.GYRO_OFFSET_Z_MSB) << 8)
          | (await this.bus.readByte(Reg.GYRO_OFFSET_Z_LSB)),
        /* Accelerometer radius = +/- 1000 LSB */
        accelRadius: (await this.bus.readByte(Reg.ACCEL_RADIUS_MSB) << 8)
          | (await this.bus.readByte(Reg.ACCEL_RADIUS_LSB)),
        /* Magnetometer radius = +/- 960 LSB */
        magRadius: (await this.bus.readByte(Reg.MAG_RADIUS_MSB) << 8)
          | (await this.bus.readByte(Reg.MAG_RADIUS_LSB)),
      };

      await this.setMode(savedMode);

      return offsets;
    }
    else {
      return;
    }
  }

  async getVersions(): Promise<Versions> {
    return {
      device: await this.bus.readByte(Reg.DEVICE_ID),
      accel: await this.bus.readByte(Reg.ACCEL_ID),
      mag: await this.bus.readByte(Reg.MAG_ID),
      gyro: await this.bus.readByte(Reg.GYRO_ID),
      software: await this.bus.readDoubleByte(Reg.SW_REV_ID_LSB),
      bootloader: await this.bus.readByte(Reg.BOOTLOADER_REV_ID),
    };
  }

  async getMode() {
    return (await this.bus.readByte(Reg.OPR_MODE)) & 0xF;
  }

  async setMode(
    mode: OpMode
  ) {
    await this.bus.writeByte(Reg.OPR_MODE, mode);
    await wait(mode === OpMode.Config ? BNO055_CONFIG_MODE_WAIT : BNO055_MODE_SWITCH_WAIT);
    this.mode = mode;
    console.log('mode set: ', mode);
  }

  async setPowerLevel(level = PowerLevel.Normal) {
    await this.bus.writeByte(Reg.PWR_MODE, level);
    await this.bus.writeByte(Reg.PAGE_ID, 0);
    console.log('power mode set to ', level);
  }


  /**
   * Use the external 32.768KHz crystal
   */
  async useExternalCrystal(usextal: boolean) {
    const savedMode = this.mode;
    /* Switch to config mode (just in case since this is the default) */
    await this.setMode(OpMode.Config);
    await this.bus.writeByte(Reg.PAGE_ID, 0);
    await this.bus.writeByte(Reg.SYS_TRIGGER, usextal ? 0x80 : 0x00);
    /* Set the requested operating mode (see section 3.3) */
    await this.setMode(savedMode);
  }

  get inConfigMode() {
    return this.mode === OpMode.Config;
  }

  /**
   *  sys   Current system calibration status, depends on status of all sensors, read-only
   *  gyro  Current calibration status of Gyroscope, read-only
   *  accel Current calibration status of Accelerometer, read-only
   *  mag   Current calibration status of Magnetometer, read-only
   */
  async getCalibration(): Promise<CalibrationStatus> {
    const calByte = await this.bus.readByte(Reg.CALIB_STAT);

    return {
      sys: (calByte >> 6) & 0x03,
      gyro: (calByte >> 4) & 0x03,
      accel: (calByte >> 2) & 0x03,
      mag: calByte & 0x03,
    };
  }

  /**
   * Checks that all calibration status values are set to 3 (fully calibrated)
   */
  async isFullyCalibrated() {
    const { sys, accel, gyro, mag } = await this.getCalibration();

    switch (this.mode) {
      case OpMode.AccelOnly:
        return accel === 3;
      case OpMode.MagOnly:
        return mag === 3;
      case OpMode.GyroOnly:
      case OpMode.ImuMagForGyro:
        return gyro === 3;
      case OpMode.AccelMag:
      case OpMode.Compass:
        return accel === 3 && mag === 3;
      case OpMode.AccelGyro:
      case OpMode.Imu:
        return accel === 3 && gyro === 3;
      case OpMode.MagGyro:
        return mag === 3 && gyro === 3;
      default:
        return sys === 3 && gyro === 3 && accel === 3 && mag === 3;
    }
  }

  /**
   *  Gets a quaternion reading from the specified source
   */
  async getQuat() {
    const buffer = await this.bus.readBlock(Reg.QUATERNION_DATA_W_LSB, 8);
    const w = ((buffer[1]) << 8) | (buffer[0]);
    const x = ((buffer[3]) << 8) | (buffer[2]);
    const y = ((buffer[5]) << 8) | (buffer[4]);
    const z = ((buffer[7]) << 8) | (buffer[6]);

    const scale = (1.0 / (1 << 14));

    return quat.fromValues(scale * w, scale * x, scale * y, scale * z);
  }

}
