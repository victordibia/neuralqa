


import tensorflow as tf
import numpy as np
from transformers import AutoTokenizer, TFAutoModelForQuestionAnswering
import time
import logging

class Model():
    def __init__(self, model_name, model_path, model_type, **kwargs):
        self.load_model(model_name, model_path, model_type)

    def load_model(self, model_name, model_path, model_type):
        logging.info(" >> loading model " + model_name)
        self.name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_path, use_fast=True)
        self.model = TFAutoModelForQuestionAnswering.from_pretrained(
            model_path, from_pt=True)

    def get_best_start_end_position(self, start_scores, end_scores):
        answer_start = tf.argmax(start_scores, axis=1).numpy()[0]
        answer_end = (tf.argmax(end_scores, axis=1) + 1).numpy()[0]
        return answer_start, answer_end

    def get_chunk_answer_span(self, inputs):
        start_time = time.time()
        answer_start_scores, answer_end_scores = self.model(inputs)

        answer_start, answer_end = self.get_best_start_end_position(
            answer_start_scores, answer_end_scores)

        answer_end = answer_end - \
            1 if answer_end == answer_end_scores.shape[1] else answer_end

        answer_start_softmax_probability = tf.nn.softmax(
            answer_start_scores, axis=1).numpy()[0][answer_start]
        answer_end_softmax_probability = tf.nn.softmax(
            answer_end_scores, axis=1).numpy()[0][answer_end]

        answer = self.tokenizer.convert_tokens_to_string(
            inputs["input_ids"][0][answer_start:answer_end]).replace("[CLS]", "").replace("[SEP]", "")

        # if model predict first token 0 which is in the question as part of the answer, return nothing
        if answer_start == 0:
            answer = ""

        elapsed_time = time.time() - start_time
        return {"answer": answer, "took": elapsed_time,
                "start_probability": str(answer_start_softmax_probability),
                "end_probability": str(answer_end_softmax_probability),
                "probability": str(answer_end_softmax_probability + answer_start_softmax_probability)
                }


    def token_chunker(self, question, context, max_chunk_size=512, stride=2):
        # we tokenize question and context once.
        # if question + context > max chunksize, we break it down into multiple chunks of question +
        #  subsets of context with some stride overlap

        question_tokens = self.tokenizer.encode(question)
        context_tokens = self.tokenizer.encode(context, add_special_tokens=False)

        chunk_holder = []
        chunk_size = max_chunk_size - len(question_tokens) - 1
        # -1 for the 102 end token we append later
        current_pos = 0
        while current_pos < len(context_tokens) and current_pos >= 0:
            end_point = current_pos + \
                chunk_size if (current_pos + chunk_size) < len(context_tokens) - \
                1 else len(context_tokens) - 1
            token_chunk = question_tokens + \
                context_tokens[current_pos: end_point] + [102]

            # question type is 0, context type is 1, convert to tf
            token_type_ids = [0]*len(question_tokens) + \
                [1] * (len(token_chunk) - len(question_tokens))
            token_type_ids = tf.constant(
                token_type_ids, dtype='int32', shape=(1, len(token_type_ids)))

            # attend to every token
            attention_mask = tf.ones((1, len(token_chunk)),  dtype=tf.dtypes.int32)

            # convert token chunk to tf
            token_chunk = tf.constant(
                token_chunk, dtype='int32', shape=(1, len(token_chunk)))

            chunk_holder.append(
                {"token_ids": token_chunk,
                "context": self.tokenizer.convert_tokens_to_string(context_tokens[current_pos: end_point]),
                "attention_mask":  attention_mask,
                "token_type_ids": token_type_ids
                })
            current_pos = current_pos + chunk_size - stride + 1
        return chunk_holder


    def answer_question(self, question, context, max_chunk_size=512, stride=70):

        # chunk tokens
        chunked_tokens = self.token_chunker(
            question, context, max_chunk_size, stride)
        answer_holder = []
        for chunk in chunked_tokens:
            model_input = {"input_ids": chunk["token_ids"], "attention_mask":
                        chunk["attention_mask"], "token_type_ids": chunk["token_type_ids"]}
            answer = self.get_chunk_answer_span(model_input)
            if len(answer["answer"]) > 2:
                answer["question"] = question
                answer["context"] = chunk["context"].replace("##", "").replace(
                    answer["answer"], " <em>" + answer["answer"] + "</em> ")
                answer_holder.append(answer)
        return answer_holder

        