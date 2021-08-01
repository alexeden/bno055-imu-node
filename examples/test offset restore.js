const { AxisSign, Axis, BNO055, OpMode, DeviceAddress } = require('../dist');
const fs = require('fs');

const offsetsPath = "./offsets.json";
const wait = (t) => new Promise(ok => setTimeout(ok, t));

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

    let calibrated = false;
    while(!calibrated) {
      await wait(3333);
      console.log('calibration: ', await imu.getCalibrationStatuses());

      calibrated = await imu.isFullyCalibrated();
      console.log('is calibrated: ', calibrated);

      const offsets = await imu.getSensorOffsets();
      console.log('offsets: ', offsets);

      if(calibrated) {
        console.log("Storing offsets to disk", offsetsPath, offsets);
        const data = JSON.stringify(offsets);
        fs.writeFileSync(offsetsPath, data);
      }
    }

    while(true) {
      console.log('euler: ', await imu.getEuler());
      console.log('quat: ', await imu.getQuat());
      console.log('temp', await imu.getTemperature());
      console.log('units', await imu.getUnits());
      console.log('--------------------------------');

      await wait(3333);
    }
  }
  catch (error) {
    console.error('error: ', error);
  }
})();
