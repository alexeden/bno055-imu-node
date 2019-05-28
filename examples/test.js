const { BNO055 } = require('../dist');

(async () => {
  try {
    const imu = await BNO055.begin();

    console.log('created imu: ', imu);

    await imu.setExtCrystalUse(true);
    console.log('using external crystal');

    const printQuat = async () => {
      console.log('quat: ', await imu.getQuat());
      console.log('calibration: ', await imu.getCalibration());
      console.log('is calibrated: ', await imu.isFullyCalibrated());
      // console.log('offsets: ', await imu.getSensorOffsets());
      setTimeout(printQuat, 1000);
    };

    await printQuat();

  }
  catch (error) {
    console.error('error: ', error);
  }
})();
