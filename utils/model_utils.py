
import tensorflow as tf
from transformers import AutoTokenizer, TFAutoModelForQuestionAnswering
import time


def get_pretrained_squad_model(model_name):
    model, tokenizer = None, None
    if model_name == "distilbertsquad1":
        tokenizer = AutoTokenizer.from_pretrained(
            "distilbert-base-cased-distilled-squad")
        model = TFAutoModelForQuestionAnswering.from_pretrained(
            "distilbert-base-cased-distilled-squad", from_pt=True)
    elif model_name == "distilbertsquad2":
        tokenizer = AutoTokenizer.from_pretrained(
            "twmkn9/distilbert-base-uncased-squad2")
        model = TFAutoModelForQuestionAnswering.from_pretrained(
            "twmkn9/distilbert-base-uncased-squad2", from_pt=True)

    return model, tokenizer

# model, tokenizer = get_pretrained_squad_model("distilbertsquad2")


def get_answer_span(question, context, model, tokenizer):
    start_time = time.time()
    inputs = tokenizer.encode_plus(question, context, return_tensors="tf")
    answer_start_scores, answer_end_scores = model(inputs)
    answer_start = tf.argmax(answer_start_scores, axis=1).numpy()[0]
    answer_end = (tf.argmax(answer_end_scores, axis=1) + 1).numpy()[0]
    elapsed_time = time.time() - start_time
    # print(answer_start_scores.numpy().reshape(-1)[68])
    answer = tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(
        inputs["input_ids"][0][answer_start:answer_end]))
    return {"answer": answer, "took": elapsed_time}
