const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
app.use(cors({ origin: ['http://172.16.0.100:3012','http://172.16.0.100:3012'] }))
app.use(bodyParser.json());
const Stream = require('node-rtsp-stream');
let stream;
const { exec } = require('child_process');
const { promises } = require('dns');

async function callStream(rtspHost) {
  stream = await new Stream({
    name: 'name',
    streamUrl: rtspHost,
    wsPort: 9996,
    ffmpegOptions: {
      '-stats': '',
      '-r': 28,
      '-b:v': '2M',
      '-s': '1280x720',
      '-preset': 'ultrafast',
      '-tune': 'zerolatency',
      '-pix_fmt': 'rgb32',
    }
  });
}

app.post('/', async (req, res) => {
  const rtspHost = req.body.rtspHost;
  const start_stop = req.body.start_stop;

  if (start_stop === 'Start') {
    try {
      if(stream){
        await stream.stop();
        callStream(rtspHost);
      }
      else{
        callStream(rtspHost);
      }
        await new Promise(resolve => setTimeout(resolve, 5000));
        if(stream.stream)
        {
          return res.status(200).json({ message: 'Connected Successfully' });
        }
        else{
          return res.status(400).json({ message: 'Error connecting to stream' });
        }

    } 
    catch (err) {
      console.log("this is the error bruh", err);
      return res.status(400).json({ message: 'Error connecting to stream' });
    }
  }
   else if (start_stop === 'Stop') {
    if (stream) {
      stream.stop();
      return res.status(200).json({ message: 'Disconnected Successfully' });
    } else {
      return res.json({ message: 'Stream is not running' });
    }
  }
});

app.listen(3013, () => {
  console.log('App is listening on port 3013')
})

