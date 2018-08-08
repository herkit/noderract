FROM tesseractshadow/tesseract4re
RUN apt-get update && apt-get install -y nodejs npm
COPY /app/*.js* /app/
RUN cd /app && npm install && mkdir /data && mkdir /data/in && mkdir /data/out
ENV NODERRACT_DATA_FOLDER=/data
WORKDIR /app
EXPOSE 3000/tcp
ENTRYPOINT ["npm", "start"]