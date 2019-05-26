import * as i2c from 'i2c-bus';
import { OpModeRegister } from './constants';

export class BNO050 {

  static async begin(
    mode: OpModeRegister
  ): Promise<BNO050> {
    const wire = await new Promise<i2c.I2cBus>((ok, error) => {
      const i2cBus = i2c.open(1, err => error ? error(err) : ok(i2cBus));
    });

    return new BNO050(wire);
  }

  private constructor(
    private readonly wire: i2c.I2cBus
  ) {
    console.log('constructed!', this.wire);
  }
}
