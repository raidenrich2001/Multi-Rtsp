const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
app.use(cors({ origin: ['http://172.16.0.100:3012','http://localhost:3012'] }))
app.use(bodyParser.json());
const Stream = require('node-rtsp-stream');
let stream;


async function callStream(rtspHost, port) {

  stream = await new Stream({
    name: 'name',
    streamUrl: rtspHost,
    wsPort: port,
    ffmpegOptions: {
      '-stats': '', // Show encoding statistics
      '-r': 25, // Adjust the frame rate as needed
      '-b:v': '.1M', // Adjust the video bitrate as needed
      '-s': '1280x720', // Set the desired width and height
      '-preset': 'ultrafast', // Choose an appropriate preset for encoding speed and quality
      '-tune': 'zerolatency', // Optimize for low-latency streaming
      '-pix_fmt': 'yuv420p', // Set the pixel format to yuv420p for better compatibility
    }
  });
  await new Promise(resolve => setTimeout(resolve, 5000));
}


app.post('/', async (req, res) => {
  const rtspDetails = req.body

  for (const [index, detail] of rtspDetails.entries()) {
    if (detail.start_stop === 'Start') {
        try {
          if(stream){
            stream.stop();
            callStream(detail.rtspHost,detail.port);
          }
          else{
            console.log('This is the Start ',index, detail.rtspHost )
            callStream(detail.rtspHost,detail.port);
          }
        } 
        catch (err) {
          console.log("this is the error bruh",err);
          return res.status(400).json({ message: 'Error connecting to stream' });
        }
      }
       else if (detail.start_stop === 'Stop') {
        try{
            if (stream) {
                stream.stop();
                 return res.status(200).json({ message: 'Disconnected Successfully' });
              } else {
                return res.json({ message: 'Stream is not running' });
              }
        }
        catch(err){
            console.log('Another Error',err)
        }
     
      }
}
            await new Promise(resolve => setTimeout(resolve, 5000));

            try{
                if(stream.stream)
                {
                  return res.status(200).json({ message: 'Connected Successfully' });
                }
                else{
                  return res.status(400).json({ message: 'Error connecting to stream' });
                }
            }
            catch(err){
                console.log('useless error')
            }
});


app.listen(3013, () => {
  console.log('App is listening on port 3013')
})

