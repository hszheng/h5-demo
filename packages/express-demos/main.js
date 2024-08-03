const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const upload = multer();
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 上传文件分片
app.post('/upload', upload.single('chunk'), function (req, res) {
  const chunk = req.file;
  const chunkIndex = req.body.chunkIndex;
  const fileName = req.body.fileName;
  const folderPath = path.join(__dirname, fileName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  const filePath = path.join(folderPath, fileName + '-' + chunkIndex);
  fs.writeFile(filePath, chunk.buffer, function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('Error writing chunk to file');
    } else {
      res.send('Chunk uploaded');
    }
  });
});

// 合并上传的文件分片
app.post('/merge', function (req, res) {
  const fileName = req.body.fileName;
  const folderPath = path.join(__dirname, fileName);
  const filePath = path.join(__dirname, 'uploads', fileName);
  let fileStream = fs.createWriteStream(filePath);
  let i = 0;
  function writeNextChunk() {
    const chunkPath = path.join(folderPath, fileName + '-' + i);
    if (!fs.existsSync(chunkPath)) {
      fileStream.end();
      fs.rmdirSync(folderPath, { recursive: true });
      res.send('File uploaded');
      return;
    }
    let chunkStream = fs.createReadStream(chunkPath);
    chunkStream.pipe(fileStream, { end: false });
    chunkStream.on('end', function () {
      i++;
      writeNextChunk();
    });
  }
  writeNextChunk();
});

app.listen(5500, function () {
  console.log('Server running on port 5500');
});