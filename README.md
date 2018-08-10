# Noderract
Noderract is a Express.js based web and api wrapper of Tesseract OCR. It launches a simple web that interfaces with your camera and uploads a snapshot for processing by the Tesseract engine. It will display the resulting text on the web, if successful. 

## To run
It's recommended to run using docker-compose:

```
> docker-compose build
> docker-compose run
```

Browse to http://localhost:8082/