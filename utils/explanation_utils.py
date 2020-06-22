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


def clean_tokens(gradients, tokens, token_types):
    """
    Clean the tokens and gradients gradients
    Remove "[CLS]","[CLR]", "[SEP]" tokens
    Reduce (mean) gradients values for tokens that are split ##
    """
    token_holder = []
    token_type_holder = []
    gradient_holder = []
    i = 0
    while i < len(tokens):
        if (tokens[i] not in ["[CLS]", "[CLR]", "[SEP]"]):
            token = tokens[i]
            conn = gradients[i]
            token_type = token_types[i]
            if i < len(tokens)-1:
                if tokens[i+1][0:2] == "##":
                    token = tokens[i]
                    conn = gradients[i]
                    j = 1
                    while i < len(tokens)-1 and tokens[i+1][0:2] == "##":
                        i += 1
                        token += tokens[i][2:]
                        conn += gradients[i]
                        j += 1
                    conn = conn / j
            token_holder.append(token)
            token_type_holder.append(token_type)
            gradient_holder.append(conn)
        i += 1
    return gradient_holder, token_holder, token_type_holder


def get_best_start_end_position(start_scores, end_scores):
    answer_start = tf.argmax(start_scores, axis=1).numpy()[0]
    answer_end = (tf.argmax(end_scores, axis=1) + 1).numpy()[0]
    return answer_start, answer_end


def get_correct_span_mask(correct_index, token_size):
    span_mask = np.zeros((1, token_size))
    span_mask[0, correct_index] = 1
    span_mask = tf.constant(span_mask, dtype='float32')
    return span_mask


def get_embedding_matrix(model):

    if "DistilBert" in type(model).__name__:
        return model.distilbert.embeddings.word_embeddings
    else:
        return model.bert.embeddings.word_embeddings


def get_gradient(question, context, model, tokenizer):
    """ get gradients 

    """

    embedding_matrix = get_embedding_matrix(model)

    encoded_tokens = tokenizer.encode_plus(
        question, context, add_special_tokens=True, return_token_type_ids=True, return_tensors="tf")
    token_ids = list(encoded_tokens["input_ids"].numpy()[0])
    vocab_size = embedding_matrix.get_shape()[0]

    # convert token ids to one hot. We can't differentiate wrt to int token ids hence the need for one hot representation
    token_ids_tensor = tf.constant([token_ids], dtype='int32')
    token_ids_tensor_one_hot = tf.one_hot(token_ids_tensor, vocab_size)

    with tf.GradientTape(watch_accessed_variables=False) as tape:
        # (i) watch input variable
        tape.watch(token_ids_tensor_one_hot)

        # multiply input model embedding matrix; allows us do backprop wrt one hot input
        inputs_embeds = tf.matmul(token_ids_tensor_one_hot, embedding_matrix)

        # (ii) get prediction
        start_scores, end_scores = model(
            {"inputs_embeds": inputs_embeds, "token_type_ids": encoded_tokens["token_type_ids"], "attention_mask": encoded_tokens["attention_mask"]})
        answer_start, answer_end = get_best_start_end_position(
            start_scores, end_scores)

        start_output_mask = get_correct_span_mask(answer_start, len(token_ids))
        end_output_mask = get_correct_span_mask(answer_end, len(token_ids))

        # zero out all predictions outside of the correct span positions; we want to get gradients wrt to just these positions
        predict_correct_start_token = tf.reduce_sum(
            start_scores * start_output_mask)
        predict_correct_end_token = tf.reduce_sum(end_scores * end_output_mask)

        # (iii) get gradient of input with respect to both start and end output
        gradient_non_normalized = tf.norm(
            tape.gradient([predict_correct_start_token, predict_correct_end_token], token_ids_tensor_one_hot), axis=2)

        # (iv) normalize gradient scores and return them as "explanations"
        gradient_tensor = (
            gradient_non_normalized /
            tf.reduce_max(gradient_non_normalized)
        )
        gradients = gradient_tensor[0].numpy().tolist()

        token_words = tokenizer.convert_ids_to_tokens(token_ids)
        token_types = list(
            encoded_tokens["token_type_ids"].numpy()[0].tolist())
        answer_text = tokenizer.convert_tokens_to_string(
            token_ids[answer_start:answer_end])

        # clean up gradients and words
        gradients, token_words, token_types = clean_tokens(
            gradients, token_words, token_types)
        return gradients, token_words, token_types, answer_text


def explain_model(question, context, model, tokenizer, explain_method="gradient"):
    if explain_method == "gradient":
        return get_gradient(question, context, model, tokenizer)
