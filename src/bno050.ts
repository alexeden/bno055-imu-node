import { OpModeRegister, BNO055_ID, DataRegister } from './constants';
import { I2cHelper } from './i2c-helper';

export class BNO050 {

  static async begin(
    mode: OpModeRegister
  ): Promise<BNO050> {
    const bus = await I2cHelper.open();
    const device = new BNO050(bus);
    await device.verifyConnection()
    return device;
  }

  private constructor(
    private readonly bus: I2cHelper
  ) {
    console.log('constructed!', this.bus);
  }

  async verifyConnection() {
    const idBuffer = await this.bus.i2cRead(DataRegister.CHIP_ID_ADDR);
    if (idBuffer[0] !== BNO055_ID) {
      throw new Error(`Device does not seem to be connected`);
    }
    else {
      console.log('device connected!');
    }

  }

}
