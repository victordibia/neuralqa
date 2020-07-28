

import tensorflow as tf
import numpy as np
from transformers import AutoTokenizer, TFAutoModelForQuestionAnswering
import time
import logging


logger = logging.getLogger(__name__)


class Reader:
    def __init__(self, model_name, model_path, model_type, **kwargs):
        self.load_model(model_name, model_path, model_type)

    def load_model(self, model_name, model_path, model_type):
        logger.info(">> Loading HF model " +
                    model_name + " from " + model_path)
        self.type = model_type
        self.name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_path, use_fast=True)
        self.model = TFAutoModelForQuestionAnswering.from_pretrained(
            model_path, from_pt=True)
