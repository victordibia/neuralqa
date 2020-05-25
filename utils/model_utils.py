
import tensorflow as tf
import numpy as np
from transformers import AutoTokenizer, TFAutoModelForQuestionAnswering
import time


def get_pretrained_squad_model(model_name):
    model, tokenizer = None, None
    if model_name == "distilbertcasedsquad1":
        tokenizer = AutoTokenizer.from_pretrained(
            "distilbert-base-cased-distilled-squad", use_fast=True)
        model = TFAutoModelForQuestionAnswering.from_pretrained(
            "distilbert-base-cased-distilled-squad", from_pt=True)
    elif model_name == "distilbertcasedsquad2":
        tokenizer = AutoTokenizer.from_pretrained(
            "twmkn9/distilbert-base-uncased-squad2", use_fast=True)
        model = TFAutoModelForQuestionAnswering.from_pretrained(
            "twmkn9/distilbert-base-uncased-squad2", from_pt=True)
    elif model_name == "bertcasedsquad2":
        tokenizer = AutoTokenizer.from_pretrained(
            "deepset/bert-base-cased-squad2", use_fast=True)
        model = TFAutoModelForQuestionAnswering.from_pretrained(
            "deepset/bert-base-cased-squad2", from_pt=True)

    return model, tokenizer


def load_model(model_name="distilbertcasedsquad2"):
    return get_pretrained_squad_model(model_name)


def get_answer_span(question, context, model, tokenizer):
    start_time = time.time()
    inputs = tokenizer.encode_plus(question, context, return_tensors="tf")
    answer_start_scores, answer_end_scores = model(inputs)
    answer_start = tf.argmax(answer_start_scores, axis=1).numpy()[0]
    answer_end = (tf.argmax(answer_end_scores, axis=1) + 1).numpy()[0]
    elapsed_time = time.time() - start_time
    # print(answer_start_scores.numpy().reshape(-1)[68])
    answer = tokenizer.convert_tokens_to_string(
        inputs["input_ids"][0][answer_start:answer_end],).replace("[CLS]", "").replace("[SEP]", "")
    return {"answer": answer, "took": elapsed_time}


def token_chunker(question, context, tokenizer, max_chunk_size=512, stride=2):
    question_tokens = tokenizer.encode(question)
    context_tokens = tokenizer.encode(context, add_special_tokens=False)
    context_tokens.append(102)  # add [SEP] token

    chunk_holder = []
    chunk_size = max_chunk_size - len(question_tokens)
    current_pos = 0
    while current_pos < len(context_tokens) and current_pos >= 0:
        end_point = current_pos + \
            chunk_size if (current_pos + chunk_size) < len(context_tokens) - \
            1 else len(context_tokens) - 1
        chunk_holder.append(
            question_tokens + context_tokens[current_pos: end_point])
        # print("current chunk",len(question + context[current_pos: end_point]))
        current_pos = current_pos + chunk_size - stride
    return chunk_holder


def get_chunk_answer_span(inputs, model, tokenizer):
    start_time = time.time()
    answer_start_scores, answer_end_scores = model(inputs)
    answer_start = tf.argmax(answer_start_scores, axis=1).numpy()[0]
    answer_end = (tf.argmax(answer_end_scores, axis=1) + 1).numpy()[0]
    answer = tokenizer.convert_tokens_to_string(
        inputs["input_ids"][0][answer_start:answer_end],).replace("[CLS]", "").replace("[SEP]", "")
    elapsed_time = time.time() - start_time
    return {"answer": answer, "took": elapsed_time, "start_score": str(answer_start_scores.numpy().flatten()[answer_start]),  "end_score": str(answer_end_scores.numpy().flatten()[answer_end])}


def answer_question(question, context, model, tokenizer, max_chunk_size=512, stride=70):
    chunked_tokens = token_chunker(
        question, context, tokenizer, max_chunk_size, stride)

    answer_holder = []
    for chunk in chunked_tokens:
        input_ids = tf.convert_to_tensor(
            np.array(chunk).reshape(1, len(chunk)), dtype=tf.int32)
        model_input = {"input_ids": input_ids, "attention_mask": tf.ones(
            (1, len(chunk)),  dtype=tf.dtypes.int32)}
        answer = get_chunk_answer_span(model_input, model, tokenizer)
        if len(answer["answer"]) > 2:
            answer_holder.append(answer)
    return answer_holder
