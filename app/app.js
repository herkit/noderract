var express = require('express');
var busboy = require('connect-busboy')

var tesseract = require('node-tesseract');
var fs = require('fs');
var path = require('path');

var datafolder = process.env.NODERRACT_DATA_FOLDER || path.join(__dirname,"../data");

var app = express();
app.use(busboy());
app.use(express.json());

app.post("/ocr", function(req, res) {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
  console.log("Uploading: " + filename);

  //Path where image will be uploaded
  var filePath = path.join(datafolder, 'in', filename);
  fstream = fs.createWriteStream(filePath);
  file.pipe(fstream);
  fstream.on('close', 
    function () {    
      console.log("Upload Finished of " + filename);
      tesseract.process(filePath, function(err, text) {
        if (err) {
          console.error(err);
          res.send(err);
        } else {
          res.send(text);
        }
      })
    });
  });
})

app.listen(3000);