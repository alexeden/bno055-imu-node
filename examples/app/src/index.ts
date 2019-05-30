import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
// import * as qs from 'querystring';
// import * as url from 'url';
import * as express from 'express';
import * as net from 'net';
import * as websockets from 'ws';
import { BNO055, OpMode, DeviceAddress } from 'bno055-imu-node';

console.log('Now: ', Date.now());

const httpsOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const app = express();
const server = https.createServer(httpsOptions, app).listen(4000, () => console.log('listening on port 4000'));
const wss = new websockets.Server({ noServer: true });

app.use(express.static(path.resolve(__dirname, '../public')));

// app.get('/api/dev', (req, res, next) => {
//   fs.readdir('/dev', (err, files) => {
//     if (err) {
//       res.status(400).json({ error: err }).end();
//     }
//     else {
//       res.json({
//         devicePaths: [
//           ...files
//             .filter(f => f.includes('spi') || f.includes('null'))
//             .map(f => `/dev/${f}`),
//         ],
//       });
//       next();
//     }
//   });
// });

// Catch all other routes and return the index file
app.get('/*', (req, res) => {
  if (!res.headersSent) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  wss.handleUpgrade(request, socket, head, clientSocket => wss.emit('connection', clientSocket, request));
});

const liveClients = new Set<websockets>([]);
// let dotstar: Dotstar | null = null;
let imu: BNO055 | null = null;


wss.on('connection', async (socket, req) => {
  console.log('new connection!');
  // Extract the device config from URL query params
  // const parsed = url.parse(req.url || '');
  // Parse the config values into numbers where necessary
  // const config = Object.entries(qs.parse(parsed.query || '')).reduce(
  //   (accum, [k, v]: [string, any]) => ({
  //     ...accum,
  //     [k]: Number.isSafeInteger(parseInt(v, 10)) ? parseInt(v, 10) : v,
  //   }),
  //   { }
  // );

  console.log('new connection, client size is ', wss.clients.size);

  if (!imu) {
    // dotstar = Dotstar.create(config);
    // dotstar.setAll(0);
    // dotstar.sync();
    console.log('Starting up the imu!');
    imu = imu || await BNO055.begin(DeviceAddress.A, OpMode.FullFusion);

    const sendData = async () => {
      if (liveClients.size > 0) {
        const quat = await imu!.getQuat();
        const quatJson = JSON.stringify(quat);
        liveClients.forEach(client => {
          client.send(quatJson);
        });
      }
    };

    setInterval(sendData, 10);
    // console.log(dotstar && dotstar.printBuffer());
  }
  liveClients.add(socket);

  socket.on('pong', liveClients.add.bind(liveClients, socket));

  // socket.on('message', (data: string = '{}') => {
  //   if (typeof data === 'string' && data.length > 0 && data !== 'undefined') {
  //     const { values }: { values: Array<[number, number, number]> } = JSON.parse(data);
  //     if (dotstar && values) {
  //       values.map(([r, g, b], i) => {
  //         const value = ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
  //         dotstar && dotstar.set(value, i);
  //       });
  //       // socket.send(JSON.stringify({ values: dotstar.read(), length: dotstar.length }));
  //       dotstar.sync();
  //     }
  //   }
  // });

  socket.on('close', async (code, reason) => {
    console.log(`Socket was closed with code ${code} and reason: `, reason);
    // if (wss.clients.size < 1 && dotstar) {
    //   console.log('last client closed! turning stuff off');
    //   dotstar.setAll(0);
    //   await dotstar.sync();
    //   console.log(dotstar.printBuffer());
    //   dotstar = null;
    // }
  });
});

setInterval(
  () => wss.clients.forEach(socket => {
    if (!liveClients.has(socket)) socket.terminate();
    liveClients.delete(socket);
    socket.ping(() => { });
  }),
  1000
);
