const { AxisSign, Axis, BNO055, OpMode, DeviceAddress } = require('../dist');

(async () => {
  try {
    const imu = await BNO055.begin(DeviceAddress.A, OpMode.FullFusion, 1);
    await imu.resetSystem();
    // await imu.setAxisMapping({
    //   X: {
    //     axis: Axis.X,
    //     sign: AxisSign.Positive,
    //   },
    //   Y: {
    //     axis: Axis.Z,
    //     sign: AxisSign.Negative,
    //   },
    //   Z: {
    //     axis: Axis.Y,
    //     sign: AxisSign.Positive,
    //   },
    // });

    const printEverything = async () => {

      console.log('current mode: ', await imu.getMode());
      console.log('current page: ', await imu.getPage());
      console.log('system status: ', await imu.getSystemStatus());
      console.log('system error: ', await imu.getSystemError());
      console.log('temp: ', await imu.getTemperature());
      console.log('self-test results: ', await imu.getSelfTestResults());

      console.log('axis mapping: ', await imu.getAxisMapping());
      console.log('versions: ', await imu.getVersions());
      console.log('units: ', await imu.getUnits());
      console.log('euler: ', await imu.getEuler());
      console.log('quat: ', await imu.getQuat());
      console.log('calibration: ', await imu.getCalibrationStatuses());
      console.log('is calibrated: ', await imu.isFullyCalibrated());
      console.log('offsets: ', await imu.getSensorOffsets());
      setTimeout(printEverything, 3333);
    };

    await printEverything();

  }
  catch (error) {
    console.error('error: ', error);
  }
})();
