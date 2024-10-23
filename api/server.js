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

// Download video
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

// Delete video by ID (from database and file system)
app.delete('/api/videos/:id', async (req, res) => {
  const videoId = req.params.id;

  // Find the video by ID in the database
  const video = await Video.findById(videoId);
  
  if (!video) {
    return res.status(404).send({ message: 'Video not found.' });
  }

  // Assuming you have a logic to get the file path based on video data (e.g., video.url or videoId)
  const filePath = videoFileMapping[videoId]; // Adjust as needed for actual file mapping

  // Remove video from the file system
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, async (err) => {
      if (err) {
        return res.status(500).send({ message: 'Error deleting the file.' });
      }

      // Remove video from the database
      await Video.findByIdAndDelete(videoId);
      res.send({ message: 'Video deleted successfully.' });
    });
  } else {
    // Remove video from the database even if file is missing
    await Video.findByIdAndDelete(videoId);
    res.status(200).send({ message: 'Video deleted from the database but file not found.' });
  }
});