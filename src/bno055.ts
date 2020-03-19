import * as i2c from 'i2c-bus';
import {
  BNO055_CONFIG_MODE_WAIT,
  BNO055_ID,
  BNO055_MODE_SWITCH_WAIT,
  DeviceAddress,
  EulerUnitScale,
  OpMode,
  PowerLevel,
  Reg,
  TempUnitScale,
  SystemError,
  SystemStatus,
} from './constants';
import { CalibrationStatusMap, Offsets, SelfTestResult, SensorUnits, Versions } from './types';

const wait = (t: number) => new Promise(ok => setTimeout(ok, t));

export class BNO055 {

  static async begin(
    address: DeviceAddress,
    mode: OpMode = OpMode.FullFusion,
    busNumber = 1
  ): Promise<BNO055> {
    const bus = await i2c.openPromisified(busNumber);
    const device = new BNO055(bus, address);

    await device.verifyConnection();
    await device.resetSystem(); // why?
    await device.setMode(mode);
    await device.useExternalClock();
    await device.getUnits();

    return device;
  }

  mode: OpMode = OpMode.Config;
  units: SensorUnits = {
    accel: 'mps2',
    euler: 'deg',
    gyro: 'degps',
    temp: 'c',
  };

  private constructor(
    private readonly bus: i2c.PromisifiedBus,
    readonly address: number
  ) { }

  async verifyConnection() {
    if (await this.bus.readByte(this.address, Reg.DEVICE_ID) !== BNO055_ID) {
      throw new Error(`Device does not seem to be connected`);
    }
  }

  async resetSystem() {
    const savedMode = this.mode;
    await this.setMode(OpMode.Config);
    await this.bus.writeByte(this.address, Reg.SYS_TRIGGER, 0x20);
    await wait(2000);
    await this.setMode(savedMode);
  }

  async getPage() {
    return await this.bus.readByte(this.address, Reg.PAGE_ID) & 0x1;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return await this.bus.readByte(this.address, Reg.SYS_STAT) & 0x7;
  }

  async getSystemError(): Promise<SystemError> {
    return await this.bus.readByte(this.address, Reg.SYS_ERR) & 0xF;
  }

  async getSensorOffsets(): Promise<Offsets | undefined> {
    if (await this.isFullyCalibrated()) {
      const savedMode = this.mode;
      await this.setMode(OpMode.Config);

      const offsets: Offsets = {
        accelX: await this.readDoubleByte(Reg.ACCEL_OFFSET_X_LSB),
        accelY: await this.bus.readByte(this.address, Reg.ACCEL_OFFSET_Y_LSB),
        accelZ: await this.bus.readByte(this.address, Reg.ACCEL_OFFSET_Z_LSB),
        magX: await this.bus.readByte(this.address, Reg.MAG_OFFSET_X_LSB),
        magY: await this.bus.readByte(this.address, Reg.MAG_OFFSET_Y_LSB),
        magZ: await this.bus.readByte(this.address, Reg.MAG_OFFSET_Z_LSB),
        gyroX: await this.bus.readByte(this.address, Reg.GYRO_OFFSET_X_LSB),
        gyroY: await this.bus.readByte(this.address, Reg.GYRO_OFFSET_Y_LSB),
        gyroZ: await this.bus.readByte(this.address, Reg.GYRO_OFFSET_Z_LSB),
        accelRadius: await this.bus.readByte(this.address, Reg.ACCEL_RADIUS_LSB),
        magRadius: await this.bus.readByte(this.address, Reg.MAG_RADIUS_LSB),
      };

      await this.setMode(savedMode);

      return offsets;
    }
    else {
      return;
    }
  }

  async getUnits(): Promise<SensorUnits> {
    const unitByte = await this.bus.readByte(this.address, Reg.UNIT_SEL);

    this.units = {
      accel: unitByte & 0x1 ? 'mg' : 'mps2',
      euler: (unitByte >> 2) & 0x1 ? 'rad' : 'deg',
      gyro: (unitByte >> 1) & 0x1 ? 'radps' : 'degps',
      temp: (unitByte >> 4) & 0x1 ? 'f' : 'c',
    };

    return { ...this.units };
  }

  async getVersions(): Promise<Versions> {
    const [
      device, accel, mag, gyro,
      swLsb, swMsb,
      bootloader,
    ] = await this.readBlock(Reg.DEVICE_ID, 7);

    const software = `${swMsb >> 4}.${swMsb & 0xF}.${swLsb >> 4}.${swLsb & 0xF}`;

    return { device, accel, mag, gyro, software, bootloader };
  }

  async getMode(): Promise<OpMode> {
    return (await this.bus.readByte(this.address, Reg.OPR_MODE)) & 0xF;
  }

  async setMode(mode: OpMode) {
    await this.bus.writeByte(this.address, Reg.OPR_MODE, mode);
    await wait(mode === OpMode.Config ? BNO055_CONFIG_MODE_WAIT : BNO055_MODE_SWITCH_WAIT);
    this.mode = mode;
  }

  async setPowerLevel(level = PowerLevel.Normal) {
    const savedMode = this.mode;
    await this.setMode(OpMode.Config);
    await this.bus.writeByte(this.address, Reg.PWR_MODE, level);
    await this.bus.writeByte(this.address, Reg.PAGE_ID, 0);
    await this.setMode(savedMode);
  }

  async getTemperature() {
    const tempByte = await this.bus.readByte(this.address, Reg.TEMP);
    const temp = Buffer.of(tempByte).readInt8(0);

    return temp * (this.units.temp === 'c' ? TempUnitScale.C : TempUnitScale.F);
  }

  async getSelfTestResults(): Promise<SelfTestResult> {
    const selfTest = await this.bus.readByte(this.address, Reg.SELFTEST_RESULT);

    return {
      mcuPassed: (selfTest >> 3 & 0x1) === 1,
      magPassed: (selfTest >> 2 & 0x1) === 1,
      accelPassed: (selfTest >> 1 & 0x1) === 1,
      gyroPassed: (selfTest & 0x1) === 1,
    };
  }

  async useExternalClock() {
    const savedMode = this.mode;
    await this.setMode(OpMode.Config);
    await this.bus.writeByte(this.address, Reg.PAGE_ID, 0);
    await this.bus.writeByte(this.address, Reg.SYS_TRIGGER, 0x80);
    await this.setMode(savedMode);
  }

  async getCalibrationStatuses(): Promise<CalibrationStatusMap> {
    const calByte = await this.bus.readByte(this.address, Reg.CALIB_STAT);

    return {
      sys: (calByte >> 6) & 0x03,
      gyro: (calByte >> 4) & 0x03,
      accel: (calByte >> 2) & 0x03,
      mag: calByte & 0x03,
    };
  }

  /**
   * Checks that all relevant calibration status values are set to 3 (fully calibrated)
   */
  async isFullyCalibrated() {
    const { sys, accel, gyro, mag } = await this.getCalibrationStatuses();

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

  async getEuler() {
    const buffer = await this.readBlock(Reg.EULER_H_LSB, 6);

    const scale = this.units.euler === 'deg'
      ? 1 / EulerUnitScale.Degs
      : 1 / EulerUnitScale.Rads;

    return {
      h: scale * buffer.readInt16LE(0),
      r: scale * buffer.readInt16LE(2),
      p: scale * buffer.readInt16LE(4),
    };
  }

  async getQuat() {
    const buffer = await this.readBlock(Reg.QUATERNION_DATA_W_LSB, 8);

    const scale = (1.0 / (1 << 14));

    return {
      w: scale * buffer.readInt16LE(0),
      x: scale * buffer.readInt16LE(2),
      y: scale * buffer.readInt16LE(4),
      z: scale * buffer.readInt16LE(6),
    };
  }

  private async readDoubleByte(reg: number) {
    const [lsb, msb] = await this.readBlock(reg, 2);

    return (msb << 8) | lsb;
  }

  private async readBlock(reg: Reg, length = 1) {
    const buffer = Buffer.alloc(length);
    await this.bus.readI2cBlock(this.address, reg, length, buffer);

    return buffer;
  }
}
