import { OpMode, BNO055_ID, Reg, BNO055_ADDRESS_A, Power } from './constants';
import { I2cHelper } from './i2c-helper';
import { CalibrationStatus } from './types';

export class BNO050 {

  static async begin(
    mode: OpMode = OpMode.OPERATION_MODE_NDOF
  ): Promise<BNO050> {
    const bus = await I2cHelper.open(BNO055_ADDRESS_A);
    const device = new BNO050(bus);
    await device.verifyConnection();
    await device.setMode(OpMode.OPERATION_MODE_CONFIG);
    await device.reset();
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
    const id = await this.bus.readByte(Reg.CHIP_ID_ADDR);
    console.log('CHIP_ID_ADDR read: ', id);
    if (id !== BNO055_ID) {
      throw new Error(`Device does not seem to be connected`);
    }
    else {
      console.log('device connected!');
    }
  }

  async reset(byte = 0x20) {
    console.log('SYS_TRIGGER_ADDR write: ', byte);
    await this.bus.writeByte(Reg.SYS_TRIGGER_ADDR, byte);
  }

  async setMode(
    mode: OpMode
  ) {
    console.log('OPR_MODE_ADDR write: ', mode);
    await this.bus.writeByte(Reg.OPR_MODE_ADDR, mode);
    this.mode = mode;
  }

  async setNormalPowerMode() {
    console.log('PWR_MODE_ADDR write: ', Power.POWER_MODE_NORMAL);
    await this.bus.writeByte(Reg.PWR_MODE_ADDR, Power.POWER_MODE_NORMAL);
    console.log('PAGE_ID_ADDR write: ', 0);
    await this.bus.writeByte(Reg.PAGE_ID_ADDR, 0);
  }


  /**
   * Use the external 32.768KHz crystal
   */
  async setExtCrystalUse(usextal: boolean) {
    const savedMode = this.mode;
    /* Switch to config mode (just in case since this is the default) */
    await this.setMode(OpMode.OPERATION_MODE_CONFIG);
    await this.bus.writeByte(Reg.PAGE_ID_ADDR, 0);
    await this.bus.writeByte(Reg.SYS_TRIGGER_ADDR, usextal ? 0x80 : 0x00);
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
    const calData = await this.bus.readByte(Reg.CALIB_STAT_ADDR);
    console.log('calibration byte: ', calData);

    return {
      sys: (calData >> 6) & 0x03,
      gyro: (calData >> 4) & 0x03,
      accel: (calData >> 2) & 0x03,
      mag: calData & 0x03,
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

}
