#
# @license
# Copyright 2020 .
# Written by / Contact : https://github.com/victordibia
# NeuralQA - NeuralQA: Question Answering on Large Datasets with BERT.
# Licensed under the MIT License (the "License");
# =============================================================================
# /

import numpy as np
import tensorflow as tf


# some funtions to generate model explanation
def get_best_start_end_position(start_scores, end_scores):
    answer_start = tf.argmax(start_scores, axis=1).numpy()[0]
    answer_end = (tf.argmax(end_scores, axis=1) + 1).numpy()[0]
    return answer_start, answer_end


def get_correct_span_mask(correct_index, token_size):
    span_mask = np.zeros((1, token_size))
    span_mask[0, correct_index] = 1
    span_mask = tf.constant(span_mask, dtype='float32')
    return span_mask


def get_connectivity(question, context, model, tokenizer):
    """ adapted from the excellent notebook by andreas madsen. 

    """

    embedding_matrix = model.bert.embeddings.word_embeddings

    encoded_tokens = tokenizer.encode_plus(
        question, context, add_special_tokens=True, return_tensors="tf")
    token_ids = list(encoded_tokens["input_ids"].numpy()[0])
    vocab_size = embedding_matrix.get_shape()[0]

    # convert token ids to one hot. We cant differentiate wrt to int token ids hence the need for one hot
    token_ids_tensor = tf.constant([token_ids], dtype='int32')
    token_ids_tensor_one_hot = tf.one_hot(token_ids_tensor, vocab_size)

    with tf.GradientTape(watch_accessed_variables=False) as tape:
        tape.watch(token_ids_tensor_one_hot)

        # multiply input model embedding matrix; allows us do backprop wrt ohe input
        inputs_embeds = tf.matmul(token_ids_tensor_one_hot, embedding_matrix)
        # get prediction
        start_scores, end_scores = model(
            {"inputs_embeds": inputs_embeds, "token_type_ids": encoded_tokens["token_type_ids"], "attention_mask": encoded_tokens["attention_mask"]})
        answer_start, answer_end = get_best_start_end_position(
            start_scores, end_scores)

        start_output_mask = get_correct_span_mask(answer_start, len(token_ids))
        end_output_mask = get_correct_span_mask(answer_end, len(token_ids))

        # zero out all predictions outside of the correct span positions
        # ideally, we wan to get gradients wrt to just these positions
        predict_correct_start_token = tf.reduce_sum(
            start_scores * start_output_mask)
        predict_correct_end_token = tf.reduce_sum(end_scores * end_output_mask)

        # get gradient of input with respect to both start and end output
        connectivity_non_normalized = tf.norm(
            tape.gradient([predict_correct_start_token, predict_correct_end_token], token_ids_tensor_one_hot), axis=2)
        connectivity_tensor = (
            connectivity_non_normalized /
            tf.reduce_max(connectivity_non_normalized)
        )
        connectivity = connectivity_tensor[0].numpy().tolist()
        all_tokens = tokenizer.convert_ids_to_tokens(token_ids)
        answer_text = tokenizer.convert_tokens_to_string(
            token_ids[answer_start:answer_end])
        return connectivity, all_tokens, answer_text
