const { BNO055, OpMode } = require('../dist');

(async () => {
  try {
    const imu = await BNO055.begin(OpMode.OPERATION_MODE_NDOF, true);

    const printQuat = async () => {
      console.log('current mode: ', await imu.getMode());
      console.log('current page: ', await imu.getPage());
      console.log('system status: ', await imu.getSystemStatus());
      console.log('system error: ', await imu.getSystemError());

      console.log('versions: ', await imu.getVersions());
      console.log('quat: ', await imu.getQuat());
      // console.log('calibration: ', await imu.getCalibration());
      // console.log('is calibrated: ', await imu.isFullyCalibrated());
      // console.log('offsets: ', await imu.getSensorOffsets());
      setTimeout(printQuat, 3333);
    };

    await printQuat();

  }
  catch (error) {
    console.trace('trace!');
    console.error('error: ', error);
  }
})();
