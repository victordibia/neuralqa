FROM python:3-slim

COPY . . 

RUN pip3 install neuralqa
     
EXPOSE 5080

CMD ["neuralqa", "--host", "0.0.0.0", "--port", "5080"]
