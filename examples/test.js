const { AxisSign, Axis, BNO055, OpMode, DeviceAddress } = require('../dist');
const fs = require('fs');

const offsetsPath = "./offsets.json";

(async () => {
  try {
    const imu = await BNO055.begin(DeviceAddress.A, OpMode.FullFusion, 3);
    await imu.resetSystem();

    if(fs.existsSync(offsetsPath)) {
      console.log("Reading offsets from disk,", offsetsPath);
      const data = fs.readFileSync(offsetsPath, {encoding: 'utf8', flag: 'r'});

      const data2 = JSON.parse(data.toString());
      console.log(data2);
      
      console.log("Running setSensorOffsets....");
      await imu.setSensorOffsets(data2);
      console.log("Done?!");
    }

    const calibrate = async () => {
      console.log('calibration: ', await imu.getCalibrationStatuses());

      const calibrated = await imu.isFullyCalibrated();
      console.log('is calibrated: ', calibrated);

      const offsets = await imu.getSensorOffsets();
      console.log('offsets: ', offsets);

      if(calibrated) {
        console.log("Storing offsets to disk", offsetsPath, offsets);
        const data = JSON.stringify(offsets);
        fs.writeFileSync(offsetsPath, data);
      }
      else {
        setTimeout(calibrate, 3333);
      }
    };
    await calibrate(); 
    
    const printData = async () => {
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

      setTimeout(printData, 3333);
    };
    await printData();
  }
  catch (error) {
    console.error('error: ', error);
  }
})();
