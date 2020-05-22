const tesseract = require('../lib/tesseract');

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  var image = req.body ? req.body.image : req.query.image;

  var rexp = /data\:(\w+\/\w+);base64,([\/0-9a-zA-Z\+]+)/;
  var m = image.match(rexp);

  if (m) {
    var imagedata = Buffer.from(m[2], 'base64');

    try {
      let result = await tesseract(imagedata);
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