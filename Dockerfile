FROM continuumio/miniconda3

RUN conda install -c anaconda python=3.7
RUN conda install pip
RUN conda install pytorch==1.5.1 torchvision==0.6.1 cpuonly -c pytorch &&\
    conda install -c anaconda tensorflow==2.3.0 &&\
    python -m pip install transformers==3.5.1 &&\
    conda install -c conda-forge uvicorn aiofiles fastapi elasticsearch==7.13.1 pyyaml spacy &&\
    python -m pip install numpy==1.18.5 scipy==1.4.1 Keras-Preprocessing==1.1.1
RUN conda install -c conda-forge boto3 pandas requests scikit-learn scipy flask &&\
    python -m pip install gremlinpython requests_aws4auth

RUN python -m pip install uvicorn[standard] websockets
# RUN python -m pip install websockets

ADD Dockerfile /root/neuralqa/
ADD LICENSE /root/neuralqa/
ADD README.md /root/neuralqa/
#ADD config.yaml /root/neuralqa/
ADD docker-compose.yml /root/neuralqa/
ADD docs/ /root/neuralqa/docs
ADD neuralqa/ /root/neuralqa/neuralqa
ADD notes.md /root/neuralqa/
ADD Dockerfile /root/neuralqa/
ADD requirements.txt /root/neuralqa/
ADD setup.cfg /root/neuralqa/
ADD setup.py /root/neuralqa/
ADD tests/ /root/neuralqa/tests
WORKDIR /root/neuralqa
RUN ls && python setup.py install

COPY neuralqa/config_default.yaml /root/config_default.yaml
ENV NEURALQA_CONFIG_PATH=/root/config_default.yaml

EXPOSE 80

CMD ["neuralqa", "ui", "--host", "0.0.0.0", "--port", "80"]
