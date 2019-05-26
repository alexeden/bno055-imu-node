import { BNO050 } from '../src';

(async () => {
  const imu = await BNO050.begin();

  console.log('created imu: ', imu);

  console.log('quat: ', await imu.getQuat());
})();
