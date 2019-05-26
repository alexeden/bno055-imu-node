import * as i2c from 'i2c-bus';

export class I2cHelper {
  static async open(): Promise<I2cHelper> {
    const wire = await new Promise<i2c.I2cBus>((ok, error) => {
      const i2cBus = i2c.open(1, err => error ? error(err) : ok(i2cBus));
    });

    return new I2cHelper(wire);
  }


  private constructor(
    readonly bus: i2c.I2cBus
  ) {
  }

  i2cRead(
    address: number,
    length = 1
  ) {
    const buffer = Buffer.alloc(length);
    return new Promise<Buffer>((ok, err) => {
      this.bus.i2cRead(address, length, buffer, (error, length, data) => {
        if (error) err(error);
        else {
          console.log(`read ${length} bytes: `, data);
          ok(data);
        }
      });
    });
  }


}
