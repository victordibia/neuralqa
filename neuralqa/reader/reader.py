

import tensorflow as tf
import numpy as np
from transformers import AutoTokenizer, TFAutoModelForQuestionAnswering
import time
import logging


logging.getLogger("transformers.tokenization_utils").setLevel(logging.ERROR)
logging.getLogger("transformers.configuration_utils").setLevel(logging.ERROR)
logging.getLogger("transformers.file_utils").setLevel(logging.ERROR)
logging.getLogger(
    "transformers.modeling_tf_pytorch_utils").setLevel(logging.ERROR)
logging.getLogger("transformers.modeling_tf_utils").setLevel(logging.ERROR)


class Reader:
    def __init__(self, model_name, model_path, model_type, **kwargs):
        self.load_model(model_name, model_path, model_type)

    def load_model(self, model_name, model_path, model_type):
        logging.info(" >> loading model " + model_name)
        self.type = model_type
        self.name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_path, use_fast=True)
        self.model = TFAutoModelForQuestionAnswering.from_pretrained(
            model_path, from_pt=True)
