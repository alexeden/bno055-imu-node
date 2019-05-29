import { quat } from 'gl-matrix';
import { OpMode, BNO055_ID, Reg, BNO055_ADDRESS_A, Power, BNO055_CONFIG_MODE_WAIT, BNO055_MODE_SWITCH_WAIT } from './constants';
import { I2cHelper } from './i2c-helper';
import { CalibrationStatus, Offsets } from './types';


const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

export class BNO055 {

  static async begin(
    mode: OpMode = OpMode.OPERATION_MODE_NDOF
  ): Promise<BNO055> {
    console.log('begin BNO055');
    const bus = await I2cHelper.open(BNO055_ADDRESS_A);
    console.log('bus open');
    const device = new BNO055(bus);
    await device.verifyConnection();
    await device.setMode(OpMode.OPERATION_MODE_CONFIG);
    await wait(1000);
    await device.reset();
    await wait(1000);
    await device.verifyConnection();
    await device.setNormalPowerMode();
    await device.reset(0x00); // why?
    await device.setMode(OpMode.OPERATION_MODE_NDOF);

    return device;
  }

  mode: OpMode = OpMode.OPERATION_MODE_CONFIG;

  private constructor(
    private readonly bus: I2cHelper
  ) {
    console.log('constructed!', this.bus);
  }

  async verifyConnection() {
    const id = await this.bus.readByte(Reg.CHIP_ID);
    console.log('CHIP_ID_ADDR read this ID: ', id);
    if (id !== BNO055_ID) {
      throw new Error(`Device does not seem to be connected`);
    }
    else {
      console.log('device connected!');
    }
  }

  async reset(byte = 0x20) {
    await this.bus.writeByte(Reg.SYS_TRIGGER, byte);
    console.log('device reset');
  }

  /**
   *  @brief  Reads the sensor's offset registers into an offset struct
   *  @param  offsets_type
   *          type of offsets
   *  @return true if read is successful
   */
  async getSensorOffsets(): Promise<Offsets | undefined> {
    if (await this.isFullyCalibrated()) {
      const savedMode = this.mode;
      /* Switch to config mode (just in case since this is the default) */
      await this.setMode(OpMode.OPERATION_MODE_CONFIG);

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

  async setMode(
    mode: OpMode
  ) {
    await this.bus.writeByte(Reg.OPR_MODE, mode);
    await wait(mode === OpMode.OPERATION_MODE_CONFIG ? BNO055_CONFIG_MODE_WAIT : BNO055_MODE_SWITCH_WAIT);
    this.mode = mode;
    console.log('mode set: ', mode);
  }

  async setNormalPowerMode() {
    await this.bus.writeByte(Reg.PWR_MODE, Power.POWER_MODE_NORMAL);
    await this.bus.writeByte(Reg.PAGE_ID, 0);
    console.log('power mode set to ', Power.POWER_MODE_NORMAL);
  }


  /**
   * Use the external 32.768KHz crystal
   */
  async setExtCrystalUse(usextal: boolean) {
    const savedMode = this.mode;
    /* Switch to config mode (just in case since this is the default) */
    await this.setMode(OpMode.OPERATION_MODE_CONFIG);
    await this.bus.writeByte(Reg.PAGE_ID, 0);
    await this.bus.writeByte(Reg.SYS_TRIGGER, usextal ? 0x80 : 0x00);
    /* Set the requested operating mode (see section 3.3) */
    await this.setMode(savedMode);
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
      case OpMode.OPERATION_MODE_ACCONLY:
        return accel === 3;
      case OpMode.OPERATION_MODE_MAGONLY:
        return mag === 3;
      case OpMode.OPERATION_MODE_GYRONLY:
      case OpMode.OPERATION_MODE_M4G:
        return gyro === 3;
      case OpMode.OPERATION_MODE_ACCMAG:
      case OpMode.OPERATION_MODE_COMPASS:
        return accel === 3 && mag === 3;
      case OpMode.OPERATION_MODE_ACCGYRO:
      case OpMode.OPERATION_MODE_IMUPLUS:
        return accel === 3 && gyro === 3;
      case OpMode.OPERATION_MODE_MAGGYRO:
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
