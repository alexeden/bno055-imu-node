import { OpModeRegister } from './constants';
import { I2cHelper } from './i2c-helper';

export class BNO050 {

  static async begin(
    mode: OpModeRegister
  ): Promise<BNO050> {
    const bus = await I2cHelper.open();
    return new BNO050(bus);
  }

  private constructor(
    private readonly bus: I2cHelper
  ) {
    console.log('constructed!', this.bus);
  }
}
