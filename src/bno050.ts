import { OpModeRegister, BNO055_ID, Reg, BNO055_ADDRESS_A, Power } from './constants';
import { I2cHelper } from './i2c-helper';

export class BNO050 {

  static async begin(
    mode: OpModeRegister
  ): Promise<BNO050> {
    const bus = await I2cHelper.open();
    const device = new BNO050(bus);
    await device.verifyConnection();
    await device.setMode(OpModeRegister.OPERATION_MODE_CONFIG);
    await device.reset();
    await device.verifyConnection();
    await device.setNormalPowerMode();
    await device.reset(0x00); // why?
    await device.setMode(OpModeRegister.OPERATION_MODE_NDOF);

    return device;
  }

  mode: OpModeRegister = OpModeRegister.OPERATION_MODE_CONFIG;

  private constructor(
    private readonly bus: I2cHelper
  ) {
    console.log('constructed!', this.bus);
  }

  async verifyConnection() {
    const id = await this.bus.readByte(BNO055_ADDRESS_A, Reg.CHIP_ID_ADDR);
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
    await this.bus.writeByte(BNO055_ADDRESS_A, Reg.SYS_TRIGGER_ADDR, byte);
  }

  async setMode(
    mode: OpModeRegister
    ) {
    console.log('OPR_MODE_ADDR write: ', mode);
    await this.bus.writeByte(BNO055_ADDRESS_A, Reg.OPR_MODE_ADDR, mode);
    this.mode = mode;
  }

  async setNormalPowerMode() {
    console.log('PWR_MODE_ADDR write: ', Power.POWER_MODE_NORMAL);
    await this.bus.writeByte(BNO055_ADDRESS_A, Reg.PWR_MODE_ADDR, Power.POWER_MODE_NORMAL);
    console.log('PAGE_ID_ADDR write: ', 0);
    await this.bus.writeByte(BNO055_ADDRESS_A, Reg.PAGE_ID_ADDR, 0);
  }

}
