const { BNO050 } = require('../dist');

(async () => {
  try {
    const imu = await BNO050.begin();

    console.log('created imu: ', imu);
    console.log('is calibrated: ', await imu.isFullyCalibrated());

    console.log('quat: ', await imu.getQuat());
  }
  catch (error) {
    console.log('error: ', error);
  }
})();
