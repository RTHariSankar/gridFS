// Import the necessary modules
const express = require('express');
const util = require('util');
const hello = express.Router();
const { MongoClient, GridStore } = require('mongodb');
const { ObjectId } = require('mongodb');

const  GridFsStorage  = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const Grid = require('gridfs-stream');

// Set up the MongoDB connection using Mongoose
const HELLO = process.env.HELLO; // Make sure this environment variable is set with your MongoDB connection URL
hello.use(express.json());
hello.use(express.urlencoded({ extended: true }));

// Enable debugging for Mongoose
mongoose.set('debug', true);
let gfs;
mongoose
  .connect(HELLO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('HELLO connection successful');
    // Initialize GridFS stream
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
  })
  .catch((err) => {
    console.log('HELLO Error!!!', err);
  });
// Middleware
hello.use(bodyParser.json());
hello.use(methodOverride('_method'));

// Create storage engine
const storage = GridFsStorage({
  url: HELLO,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const fileInfo = {
          filename: file.originalname,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// @route POST /api/upload
// @desc Uploads file to DB
hello.post('/upload', upload.single('file'), (req, res) => {
  res.status(200).json({ message: 'File uploaded successfully' });
});
// const files = [];
// @route GET /api/files
// @desc Get all files from DB
hello.get('/files', async (req, res) => {
  try {
    console.log('Fetching files...');
    const files = await gfs.files.find().toArray();
   

    if (!files || files.length === 0) {
      console.log('No files found.');
      return res.status(404).json({ message: 'No files found' });
    }

    console.log('Files fetched successfully:', files);
    console.log(files._id)
    return res.status(200).json(files);

  } catch (err) {
    console.error('Error fetching files:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// console.log(files)

// @route GET /files/:filename
// @desc Display single file object
// hello.get('/files/:_id', async (req, res) => {
//   try {
//     console.log('Fetching files...');
//     const files = await gfs.files.findOne({_id:req.params._id},(err,file)=>{
//       if (!file || file.length === 0 ) {
//         return res.json(404).json
// ({err: 'No file exist'}
// )      }return res.json(file)
//     });
//    console.log(files)

//   } catch (err) {
//     console.error('Error fetching files:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// hello.get('/files/:_id',  (req, res) => {
//   try {
//     console.log('Fetching files...');
//     const file =  gfs.files.findOne({ _id: req.params._id });

// if (!file || file.length === 0) {
//   // console.log(file.length)
//   return res.status(404).json({ err: 'No file exists' });
// }

// return res.json(file);

//    console.log(file)

//   } catch (err) {
//     console.error('Error fetching files:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

hello.get('/files/:_id',  (req, res) => {
  try {
    console.log('Fetching files...');
    const file =  gfs.files.findOne({ _id: req.params._id });

if (!file || file.length === 0) {
  // console.log(file.length)
  return res.status(404).json({ err: 'No file exists' });
}

return res.json(file);

   console.log(file)

  } catch (err) {
    console.error('Error fetching files:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});



// @route DELETE /api/files/:id
// @desc  Delete file by ID
hello.delete('/files/:id', async (req, res) => {
  const files =  gfs.find().toArray();
  console.log(files)

  const fileId = req.params.id;

  try {
    const client = await MongoClient.connect(HELLO, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db();

    const file = await db.collection('fs.files').findOne({ _id:new ObjectId(fileId) });

    if (!file) {
      console.log('File not found');
      client.close();
      return res.status(404).json({ err: 'File not found' });
    }

    // Delete the file from GridFS using the deleteFileById function
    await deleteFileById(fileId, db);

    console.log('File deleted successfully');
    client.close();
    res.redirect('/'); // Redirect to the main page or any other appropriate location
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ err: 'Server error' });
  }
});

// Function to delete a file by its ID from GridFS
async function deleteFileById(fileId, db) {
  // Delete the chunks and metadata information of the file from GridFS
  await GridStore.unlink(db, fileId);
}

module.exports = hello;

// [
//   {
//     "_id": "64c5494dbb2be110395ef190",
//     "length": 22548,
//     "chunkSize": 261120,
//     "uploadDate": "2023-07-29T17:15:58.521Z",
//     "filename": "FACULTY FLOW CHART.jpg",
//     "contentType": "image/jpeg"
//   },
//   {
//     "_id": "64c55297e0ddacc98b896eaa",
//     "length": 12198455,
//     "chunkSize": 261120,
//     "uploadDate": "2023-07-29T17:55:40.174Z",
//     "filename": "file.pdf",
//     "contentType": "application/pdf"
//   },
//   {
//     "_id": "64c5565d85e9f612e8133ca7",
//     "length": 12198455,
//     "chunkSize": 261120,
//     "uploadDate": "2023-07-29T18:11:58.799Z",
//     "filename": "file.pdf",
//     "contentType": "application/pdf"
//   },
//   {
//     "_id": "64c5570485e9f612e8133cd7",
//     "length": 12198455,
//     "chunkSize": 261120,
//     "uploadDate": "2023-07-29T18:14:47.576Z",
//     "filename": "file.pdf",
//     "contentType": "application/pdf"
//   }
// ]