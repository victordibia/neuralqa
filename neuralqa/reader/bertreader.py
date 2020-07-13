from neuralqa.reader import Reader


import tensorflow as tf
import numpy as np
import time
import logging


class BERTReader(Reader):
    def __init__(self, model_name, model_path, model_type="bert", **kwargs):
        Reader.__init__(self, model_name, model_path, model_type)
        # self.load_model(model_name, model_path, model_type)

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

        answer = self.tokenizer.decode(
            inputs["input_ids"][0][answer_start:answer_end], skip_special_tokens=True)

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
        # subsets of context with some stride overlap

        question_tokens = self.tokenizer.encode(question)
        context_tokens = self.tokenizer.encode(
            context, add_special_tokens=False)

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
            attention_mask = tf.ones(
                (1, len(token_chunk)),  dtype=tf.dtypes.int32)

            # convert token chunk to tf
            token_chunk = tf.constant(
                token_chunk, dtype='int32', shape=(1, len(token_chunk)))

            chunk_holder.append(
                {"token_ids": token_chunk,
                 "context": self.tokenizer.decode(context_tokens[current_pos: end_point], skip_special_tokens=True),
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

    def get_correct_span_mask(self, correct_index, token_size):
        span_mask = np.zeros((1, token_size))
        span_mask[0, correct_index] = 1
        span_mask = tf.constant(span_mask, dtype='float32')
        return span_mask

    def get_embedding_matrix(self):
        if "DistilBert" in type(self.model).__name__:
            return self.model.distilbert.embeddings.word_embeddings
        else:
            return self.model.bert.embeddings.word_embeddings

    # move this to some utils file
    def clean_tokens(self, gradients, tokens, token_types):
        """
        Clean the tokens and  gradients
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

    def get_gradient(self, question, context):
        """Return gradient of input (question) wrt to model output span prediction

        Args:
            question (str): text of input question
            context (str): text of question context/passage
            model (QA model): Hugging Face BERT model for QA transformers.modeling_tf_distilbert.TFDistilBertForQuestionAnswering, transformers.modeling_tf_bert.TFBertForQuestionAnswering
            tokenizer (tokenizer): transformers.tokenization_bert.BertTokenizerFast 

        Returns:
            (tuple): (gradients, token_words, token_types, answer_text)
        """

        embedding_matrix = self.get_embedding_matrix()

        encoded_tokens = self.tokenizer.encode_plus(
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
            inputs_embeds = tf.matmul(
                token_ids_tensor_one_hot, embedding_matrix)

            # (ii) get prediction
            start_scores, end_scores = self.model(
                {"inputs_embeds": inputs_embeds, "token_type_ids": encoded_tokens["token_type_ids"], "attention_mask": encoded_tokens["attention_mask"]})
            answer_start, answer_end = self.get_best_start_end_position(
                start_scores, end_scores)

            start_output_mask = self.get_correct_span_mask(
                answer_start, len(token_ids))
            end_output_mask = self.get_correct_span_mask(
                answer_end, len(token_ids))

            # zero out all predictions outside of the correct span positions; we want to get gradients wrt to just these positions
            predict_correct_start_token = tf.reduce_sum(
                start_scores * start_output_mask)
            predict_correct_end_token = tf.reduce_sum(
                end_scores * end_output_mask)

            # (iii) get gradient of input with respect to both start and end output
            gradient_non_normalized = tf.norm(
                tape.gradient([predict_correct_start_token, predict_correct_end_token], token_ids_tensor_one_hot), axis=2)

            # (iv) normalize gradient scores and return them as "explanations"
            gradient_tensor = (
                gradient_non_normalized /
                tf.reduce_max(gradient_non_normalized)
            )
            gradients = gradient_tensor[0].numpy().tolist()

            token_words = self.tokenizer.convert_ids_to_tokens(token_ids)
            token_types = list(
                encoded_tokens["token_type_ids"].numpy()[0].tolist())
            answer_text = self.tokenizer.decode(
                token_ids[answer_start:answer_end],  skip_special_tokens=True)

            # clean up gradients and words
            gradients, token_words, token_types = self.clean_tokens(
                gradients, token_words, token_types)
            return gradients, token_words, token_types, answer_text

    def explain_model(self, question, context, explain_method="gradient"):
        if explain_method == "gradient":
            return self.get_gradient(question, context)
