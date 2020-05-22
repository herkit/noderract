const { spawn } = require('child_process');

module.exports = function(imagedata, options) 
{
  var tesseract = spawn('tesseract', ['stdin', 'stdout']);

  tesseract.stdin.write(imagedata);
  tesseract.stdin.end();

  console.log("Stdout readable: ", tesseract.stdout.readable);

  return new Promise(function (resolve, reject) {
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
}