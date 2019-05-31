import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as net from 'net';
import * as websockets from 'ws';
import { BNO055, OpMode, DeviceAddress } from 'bno055-imu-node';

const httpsOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const app = express();
const server = https.createServer(httpsOptions, app).listen(4000, () => console.log('listening on port 4000'));
const wss = new websockets.Server({ noServer: true });

app.use(express.static(path.resolve(__dirname, '../public')));

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

let imu: BNO055 | null = null;

wss.on('connection', async socket => {
  socket.on('pong', liveClients.add.bind(liveClients, socket));
  liveClients.add(socket);

  if (!imu) {
    console.log('Starting up the imu!');
    try {
      imu = await BNO055.begin(DeviceAddress.A, OpMode.FullFusion);

      const sendData = async () => {
        if (liveClients.size > 0) {
          const quat = await imu!.getQuat();
          const quatJson = JSON.stringify(quat);
          liveClients.forEach(client => {
            client.send(quatJson);
          });
        }
      };

      console.log('imu started, starting data broadcast interval');
      console.log(`there are ${liveClients.size} live clients in the set`);
      setInterval(sendData, 1000 / 60);

      setInterval(
        () => wss.clients.forEach(client => {
          if (!liveClients.has(client)) client.terminate();
          liveClients.delete(client);
          client.ping(() => { });
        }),
        1000
      );
    }
    catch (error) {
      console.error(error);
    }
  }

  socket.on('close', async (code, reason) => {
    console.log(`Socket was closed with code ${code} and reason: `, reason);
  });
});
