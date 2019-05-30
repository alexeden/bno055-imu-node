# BNO055 IMU + Node.js

## Install

```
npm install --save bno055-imu-node
```

## Usage

```ts
import {
  BNO055,
  // Enums:
  OpMode,
  DeviceAddress,
  PowerLevel,
} from 'bno055-imu-node';

// All BNO055 instance methods are async and return a promise
(async () => {
  // Start the sensor
  // The begin method performs basic connection verification and resets the device
  const imu = await BNO055.begin(
    DeviceAddress.A,    // Address enum: A = 0x28, B = 0x29
    OpMode.FullFusion   // Operation mode enum
  );

  // Get the sensors' calibration status
  const calibration = await imu.getCalibration();

  // Check to see if the device is fully calibrated
  const isCalibrated = await imu.isFullyCalibrated();

  // Get information about the device's operational systems
  const systemStatus = await imu.getSystemStatus();
  const systemError = await imu.getSystemError();
  const selfTestResults = await imu.getSelfTestResults();
  const versions = await imu.getVersions();

  // Get the device's orientation as a quaternion object { x, y, z, w }
  const quat = await imu.getQuat();

  // Force the device to reset
  await imu.resetSystem();

  // Set the device power level (Normal, Low, or Suspend)
  await imu.setPowerLevel(PowerLevel.Normal);

  // Force the device to use an external clock source
  await imu.useExternalClock();

  // Verify that the device is connected (will throw an error if not)
  await imu.verifyConnection();
})();
```

## Workflow

> Make sure you have [passwordless SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md) access to your Raspberry Pi.

Clone/fork your repo onto both your local machine and your Raspberry Pi.

`npm install` inside the project on both your local machine and the remote device.

Create a file called `sync.config.json` on the machine on which you'll be developing, and substitute these values with your own:

```jsonc
{
  "username": "<<<username>>>",
  "hostname": "<<<hostname or IP address of your remote device>>>",
  "directory": "<<<parent directory on remote device into which the repo was cloned>>>",
  "quiet": false // Disable most rsync logs (defaults to false)
}
```

**Locally**, you can now run `npm run sync-changes`, and any changes made to files inside `/src` or `/examples` will automatically be uploaded to your Pi.

> You can configure which excluded from uploaded by opening `sync.js` and modifying the `exclude` option passed to `Rsync.build`.

**From the remote device**, you can run `npm run build-changes`, and any changes pushed from your local machine will automatically be rebuilt. You can run additional scripts (test scripts, etc) by appending the shell commands to the `exec` property inside `nodemon.build.json`.
