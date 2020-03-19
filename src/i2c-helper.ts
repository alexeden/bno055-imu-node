import * as i2c from 'i2c-bus';

export class I2cHelper {
  static async open(address: number): Promise<I2cHelper> {
    const wire = await new Promise<i2c.I2CBus>((ok, error) => {
      const i2cBus = i2c.open(1, err => err === null ? ok(i2cBus) : error(err));
    });

    return new I2cHelper(wire, address);
  }

  private constructor(
    readonly bus: i2c.I2CBus,
    readonly address: number
  ) { }

  read(length = 1) {
    const buffer = Buffer.alloc(length);

    return new Promise<Buffer>((ok, err) => {
      this.bus.i2cRead(this.address, length, buffer, (error, len, data) => {
        if (error) err(error);
        else ok(data);
      });
    });
  }

  readBlock(reg: number, length = 1) {
    const buffer = Buffer.alloc(length);

    return new Promise<Buffer>((ok, err) => {
      this.bus.readI2cBlock(this.address, reg, length, buffer, (error, len, data) => {
        if (error) err(error);
        else ok(data);
      });
    });
  }

  readByte(reg: number) {
    return new Promise<number>((ok, err) => {
      this.bus.readByte(this.address, reg, (error, byte) => error ? err(error) : ok(0xFF & byte));
    });
  }

  async readDoubleByte(reg: number) {
    const [lsb, msb] = await this.readBlock(reg, 2);

    return (msb << 8) | lsb;
  }

  writeByte(reg: number, byte: number) {
    return new Promise((ok, err) => {
      this.bus.writeByte(this.address, reg, byte, error => error ? err(error) : ok());
    });
  }
}
