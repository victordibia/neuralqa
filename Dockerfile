FROM python:3-slim

COPY . . 

RUN pip3 install neuralqa
     
EXPOSE 80

CMD ["neuralqa", "--host", "0.0.0.0", "--port", "80"]
