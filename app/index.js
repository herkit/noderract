var express = require('express');
var busboy = require('connect-busboy');
var uuidV4 = require('uuid/v4');

var tesseract = require('node-tesseract');
var fs = require('fs');
var path = require('path');
var morgan = require('morgan');

var datafolder = process.env.NODERRACT_DATA_FOLDER || path.join(__dirname,"../data");

var app = express();
app.use(busboy());
app.use(express.json({limit: '4mb'}));
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, 'static')));

app.post("/ocr", function(req, res) {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
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

  var rexp = /data\:(\w+\/\w+);base64,([\/0-9a-zA-Z\+]+)/;
  var m = image.match(rexp);

  if (m) {
    var datatype = m[1];
    var data = m[2];

    var filename = uuidV4() + getExtensionFromContentType(datatype);

    var filePath = path.join(datafolder, 'in', filename);

    var imagedata = new Buffer(m[2], 'base64');
    var wstream = fs.createWriteStream(filePath);
    wstream.write(imagedata);
    wstream.end();

    tesseract.process(filePath, function(err, text) {
      if (err) {
        res.send({ error: err });
      } else {
        res.send({
          datatype: datatype,
          filename: filename,
          text: text
        });
      }
    })
  } else {
    res.send({ error: "No image data found" });
  }
})

function getExtensionFromContentType(type) {
  switch (type) {
    case 'image/png': return '.png';
    case 'image/jpeg': return '.jpg';
    case 'image/tiff': return '.tif';
    default: return '.dat'
  }
}

app.listen(3000, function(err) {
  if (err)
    console.log(err);
  else
    console.log("Listening on port 3000");
});