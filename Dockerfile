FROM 763104351884.dkr.ecr.us-east-2.amazonaws.com/pytorch-inference:1.5.1-gpu-py36-cu101-ubuntu16.04


RUN conda install -c anaconda tensorflow
RUN python -m pip install transformers==3.5.1 
RUN conda install -c conda-forge uvicorn aiofiles fastapi elasticsearch==7.13.1
RUN conda install -c conda-forge flask spacy plac==0.9.6
RUN python -m pip install numpy==1.19.2 scipy==1.4.1 Keras-Preprocessing==1.1.1
RUN conda install -c conda-forge boto3 requests pandas scikit-learn
RUN python -m pip install gremlinpython requests_aws4auth
RUN python -m pip install uvicorn[standard] websockets
RUN python -m pip install thinc[tensorflow,torch] --pre
RUN conda install -c conda-forge cudatoolkit
RUN python -m pip install tensorflow==2.3.0

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
ENV LD_LIBRARY_PATH /usr/local/cuda/extras/CUPTI/lib64:/usr/local/cuda/compat:/usr/local/cuda/lib:/usr/local/cuda/lib64
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
ENV CUDA_VISIBLE_DEVICES 0,1


EXPOSE 80

CMD ["neuralqa", "ui", "--host", "0.0.0.0", "--port", "80"]
