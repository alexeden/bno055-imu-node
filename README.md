# BNO-series IMU

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
