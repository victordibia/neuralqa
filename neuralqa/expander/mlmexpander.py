from neuralqa.expander import Expander
import logging
from transformers import AutoTokenizer, TFBertForMaskedLM
import tensorflow as tf
import time
import spacy
logger = logging.getLogger(__name__)


class MLMExpander(Expander):
    def __init__(self, index_type="mlm", model_path="bert-base-uncased", **kwargs):
        Expander.__init__(self, index_type)

        self.candidate_pos = ["NOUN", "ADJ", "ADV"]
        self.model_path = model_path

        allowed_keys = list(self.__dict__.keys())
        self.__dict__.update((k, v)
                             for k, v in kwargs.items() if k in allowed_keys)
        rejected_keys = set(kwargs.keys()) - set(allowed_keys)
        if rejected_keys:
            raise ValueError(
                "Invalid arguments in ElasticSearchRetriever constructor:{}".format(rejected_keys))

        logger.info(
            ">> loading HF model for Query Expansion from " + model_path)
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_path, use_fast=True)
        self.model = TFBertForMaskedLM.from_pretrained(
            self.model_path, from_pt=True)
        logger.info(">> Loading Spacy NLP model ")

        try:
            self.nlp = spacy.load('en_core_web_md')
        except OSError:
            logger.info(
                "Downloading language model for the spaCy POS tagger (don't worry, this will only happen once)")
            from spacy.cli import download
            download('en_core_web_md')
            self.nlp = spacy.load('en_core_web_md')
            # self.nlp = en_core_web_md.load()
        # logger.info(">> Spacy nlp model loaded ")

    def predict_mask(self, sequence, model, tokenizer, top_n=2):
        input = tokenizer.encode(sequence, return_tensors="tf")
        mask_token_index = tf.where(input == tokenizer.mask_token_id)[0, 1]
        token_logits = model(input)[0]
        mask_token_logits = token_logits[0, mask_token_index, :]

        probabilities = tf.nn.softmax(mask_token_logits)
        topk = tf.math.top_k(probabilities, top_n)
        top_n_probs, top_n_tokens = topk.values.numpy(), topk.indices.numpy()
        results = [{"token": tokenizer.decode([top_n_tokens[i]]), "probability": float(top_n_probs[i])}
                   for i in range(len(top_n_probs))]
        # print(results)
        return results

    def expand_query(self, query, top_n=3, threshold=0):
        start_time = time.time()

        doc = self.nlp(query)
        query_tokens = [str(token) for token in doc]
        new_terms = []
        candidate_expansions = []
        # print([chunk.text for chunk in doc.noun_chunks], "\n =========")
        # print([ent.text for ent in doc.ents], "\n =========")
        # for token in doc:
        #     print(token, "=>", token.ent_type_)

        for i, token in enumerate(doc):
            # only expand if pos is not in our candidate list and it is not a named entity type
            pred_tokens = None
            if (token.pos_ in self.candidate_pos and not token.ent_type_):
                temp_doc = query_tokens.copy()
                temp_doc[i] = self.tokenizer.mask_token
                temp_doc = " ".join(temp_doc)
                pred_tokens = self.predict_mask(
                    temp_doc, self.model, self.tokenizer, top_n=top_n)
                new_terms = new_terms + pred_tokens
            candidate_expansions.append(
                {"token": str(token), "expansion": pred_tokens, "token_index": i, "pos": token.pos_, "named_entity": token.ent_type_})

        elapsed_time = time.time() - start_time

        terms_list = []
        seen_terms = []
        # remove punctuation,  low probability, words subwords, duplicates
        for token in new_terms:
            if token["token"].isalnum() and token["probability"] > threshold and "#" not in token["token"] and token["token"] not in query and token["token"] not in seen_terms:
                terms_list.append(token)
                seen_terms.append(token["token"])

        result = {
            "terms": terms_list,
            "query": query_tokens,
            "expansions": candidate_expansions,
            "took": elapsed_time
        }
        return result
