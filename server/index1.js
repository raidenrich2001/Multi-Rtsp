const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
app.use(cors({ origin: ['http://172.16.0.100:3012','http://localhost:3012'] }))
app.use(bodyParser.json());
const { VideoStream } = require("rtsp-multi-stream");
const fs = require('fs');
const filePath = './savedRSTP.json';
// const arp = require('@network-utils/arp-lookup');

// async function getArp(){
//     const table = await arp.getTable();
//     console.log(table)
// }
// getArp();

const streamer = new VideoStream({
    debug: true,
    wsPort: 9999,
    ffmpegPath: 'ffmpeg',
    ffmpegArgs: {
        '-stats': '', 
        '-r': '20',
        '-an': '',
        '-b:v': '1M',
        '-crf': '28',
        '-s': '640x360',
        '-preset': 'fast',
        '-tune': 'zerolatency',
        '-pix_fmt': 'rgb32',
    },
});


streamer.start();


app.post('/SaveRTSP', (req, res) => {
    const savertsp = req.body;

    // Convert the object to JSON format
    const jsonData = JSON.stringify(savertsp, null, 2); // null and 2 for pretty formatting

    // Write the JSON data to the file
    fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
            res.status(500).json({ error: 'Error writing JSON file' });
            return;
        }

        console.log('JSON file saved successfully.');
        res.json({ message: 'JSON file saved successfully' });
    });
});

app.get('/getSavedRTSP',(req,res) => {
    fs.readFile(filePath,'utf8', (err, data) => {
        if (err){
            res.status(500).json({ error: 'Error Reading JSON file' });
            return;
        }
        else {
            const jsonData = JSON.parse(data);
             res.json(jsonData);
        }
      });
})

// app.get('/error', (req,res) => {
// })

setTimeout(() => {
    console.info([...streamer.liveMuxers.keys()]);
}, 9999);


app.listen(3013, () => {
    console.log('App is listening on port 3013')
  })
  