var express = require('express');
var busboy = require('connect-busboy')

var tesseract = require('node-tesseract');
var fs = require('fs');
var path = require('path');

var datafolder = process.env.NODERRACT_DATA_FOLDER || path.join(__dirname,"../data");

var app = express();
app.use(busboy());
app.use(express.json({limit: '4mb'}));

app.use(express.static(path.join(__dirname, 'static')));

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

app.post("/api/ocr", function(req, res) { 
  var image = req.body.image;
  console.log(image);

  var rexp = /data\:(\w+\/\w+);base64,([\/0-9a-zA-Z\+]+)/;
  var m = image.match(rexp);

  console.log(m);

  if (m) {
    var datatype = m[1];
    var data = m[2];
    res.send({
      datatype: datatype,
      text: "some text here?"
    });
  } else {
    res.send({ error: "No image data found" });
  }
})

app.listen(3000);