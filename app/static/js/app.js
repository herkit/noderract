$(document).ready(() => {

  const capture = document.getElementById('capture'); 
  const player = document.getElementById('player');
  const choosemethod = document.getElementById('choosemethod');
  const upload = document.getElementById('upload');
  const preview = document.getElementById('preview');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  const sendButton = document.getElementById('sendButton');
  const captureButton = document.getElementById('captureButton');
  const newButton = document.getElementById('newButton');
  const chooseCaptureMethod = document.getElementById('chooseCaptureMethod');
  const chooseUploadMethod = document.getElementById('chooseUploadMethod');

  const textview = document.getElementById('textview');

  const views = [choosemethod, capture, upload, preview, result];
  const buttons = [captureButton, sendButton, newButton];
  var startCapture = () => {};

  const constraints = {
    video: { height: 1280, aspectRatio: { max: 0.667 }, facingMode: "environment" },
    audio: false
  };

  captureButton.addEventListener('click', () => {
    context.drawImage(player, 0, 0, canvas.width, canvas.height);
    player.srcObject.getVideoTracks().forEach(track => track.stop());
    setView(preview);
  });

  chooseUploadMethod.addEventListener('click', () => {
    startCapture = () => {
      setView(upload);
    }
    startCapture();   
  });

  chooseCaptureMethod.addEventListener('click', () => {
    startCapture = startCameraCapture();
    startCapture();   
  });

  sendButton.addEventListener('click', () => {
    $.ajax({
      url: 'api/ocr',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        image: canvas.toDataURL('image/jpeg')
      }),
      dataType: 'json'
    })
    .done((response) => {
      textview.innerText = response.text;
      setView(result);
    });
  })

  newButton.addEventListener('click', () => {
    startCapture();
  });

  setView(choosemethod);

  function startCameraCapture() {
    setView(capture);
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        var firstTrack = stream.getVideoTracks()[0];
        var trackSettings = firstTrack.getSettings();
        canvas.width = trackSettings.width;
        canvas.height = trackSettings.height;
        textview.style.width = trackSettings.width;
        textview.style.height = trackSettings.height;
        for(var b in buttons) {
          buttons[b].style.left = trackSettings.width / 2 - 30;
          buttons[b].style.top = trackSettings.height - 70;
        }
        player.srcObject = stream;
        player.play();
      });
  }

  function setView(view) {
    for (var v in views) {
      views[v].style.display = ((views[v].id === view.id) ? "" : "none");
    }
  }

  function fileSelected() {
    var fileToUpload = document.getElementById('fileToUpload');
    if (fileToUpload.files.length > 0) {
      var reader = new FileReader();
      var img = new Image();
      reader.onload = function(e) {
        img.src = e.target.result;
      }
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        setView(preview);
      }
      reader.readAsDataURL(fileToUpload.files[0]);
    }
  }

  window.fileSelected = fileSelected;

});