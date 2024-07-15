// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

mongoose.connect('mongodb://localhost:27017/videoApp').then(() => {
  console.log('Successfully connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const videoSchema = new mongoose.Schema({
  url: String,
});

const Video = mongoose.model('Video', videoSchema);

app.use(cors());
app.use(express.json());

app.post('/api/videos', async (req, res) => {
  const { url } = req.body;
  const video = new Video({ url });
  await video.save();
  res.send(video);
});

app.get('/api/videos', async (req, res) => {
  const videos = await Video.find();
  res.send(videos);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


const videoFileMapping = {
    'example-video-id': path.join(__dirname, 'videos', 'example.mp4'),
  };
  
  app.get('/api/videos/download/:id', (req, res) => {
    const videoId = req.params.id;
    const filePath = videoFileMapping[videoId];
  
    if (filePath && fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          res.status(500).send({ message: 'Error downloading the file.' });
        }
      });
    } else {
      res.status(404).send({ message: 'Video not found.' });
    }
  });

