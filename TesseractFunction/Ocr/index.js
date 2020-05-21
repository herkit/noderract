const { spawn } = require('child_process');

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  var image = req.body ? req.body.image : req.query.image;

  var rexp = /data\:(\w+\/\w+);base64,([\/0-9a-zA-Z\+]+)/;
  var m = image.match(rexp);

  if (m) {
    var imagedata = Buffer.from(m[2], 'base64');

    console.log("Imagedata:", imagedata);

    var tesseract = spawn('tesseract', ['stdin', 'stdout']);

    console.log("Tesseract PID", tesseract.pid);

    console.log("Stdin writable:", tesseract.stdin.writable);

    tesseract.stdin.write(imagedata);
    tesseract.stdin.end();

    console.log("Stdout readable: ", tesseract.stdout.readable);

    var end = new Promise(function (resolve, reject) {
      var result = "";
      tesseract.stdout.on('data', (chunk) => {
        result += chunk.toString('utf8');
        console.log(`Received ${chunk.length} bytes of data.`, chunk.toString('utf8'));
      });

      tesseract.stdout.on('end', () => {
        console.log("Stdout readable at end: ", tesseract.stdout.readable);
        resolve(result);
      });

      tesseract.on('close', (code) => {
        var err = tesseract.stderr.read();
        console.log(`child process close all stdio with code ${code}, ${err}`);
        if (code != 0)
          reject(err);
      });

      tesseract.on('exit', (code) => {
        var err = tesseract.stderr.read();
        console.log(`child process exited with code ${code}, ${err}`);
        if (code != 0)
          reject(err);
      });

    });

    try {
      let result = await end;
      console.log("Result:", result);
      context.res = {
        body: {
          text: result
        }
      };    
    } catch (err) {
      console.log("Error:", err);
      context.res = {
        code: 500,
        body: {
          error: err
        }
      };    
    }
  } else {
    context.res = {
      status: 400,
      body: "Please pass a valid image url"
    };
  }
};