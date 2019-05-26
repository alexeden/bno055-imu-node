import * as i2c from 'i2c-bus';

export class I2cHelper {
  static async open(address: number): Promise<I2cHelper> {
    const wire = await new Promise<i2c.I2cBus>((ok, error) => {
      const i2cBus = i2c.open(1, err => error ? error(err) : ok(i2cBus));
    });

    return new I2cHelper(wire, address);
  }

  private constructor(
    readonly bus: i2c.I2cBus,
    readonly address: number
  ) { }

  read(
    length = 1
  ) {
    const buffer = Buffer.alloc(length);

    return new Promise<Buffer>((ok, err) => {
      this.bus.i2cRead(this.address, length, buffer, (error, len, data) => {
        if (error) err(error);
        else {
          console.log(`read ${len} bytes: `, data);
          ok(data);
        }
      });
    });
  }

  readBlock(
    reg: number,
    length = 1
  ) {
    const buffer = Buffer.alloc(length);

    return new Promise<Buffer>((ok, err) => {
      this.bus.readI2cBlock(this.address, reg, length, buffer, (error, len, data) => {
        if (error) err(error);
        else {
          console.log(`read ${len} bytes: `, data);
          ok(data);
        }
      });
    });
  }

  readByte(reg: number) {
    return new Promise<number>((ok, err) => {
      this.bus.readByte(this.address, reg, (error, byte) => error ? err(error) : ok(byte));
    });
  }

  writeByte(reg: number, byte: number) {
    return new Promise((ok, err) => {
      this.bus.writeByte(this.address, reg, byte, error => error ? err(error) : ok());
    });
  }
}
