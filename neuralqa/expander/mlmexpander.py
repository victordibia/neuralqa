from neuralqa.expander import Expander
import logging
import spacy
import transformers
import en_core_web_md

logger = logging.getLogger(__name__)

class MLMExpander(Expander):
    def __init__(self, index_type="mlm", model_path="bert-base-uncased" **kwargs):
        Expander.__init__(self, index_type)

        self.candidate_pos = ["NOUN","ADJ","ADV"] 
        self.model_path = model_path 

        allowed_keys = list(self.__dict__.keys())
        self.__dict__.update((k, v)
                             for k, v in kwargs.items() if k in allowed_keys)

        if rejected_keys:
            raise ValueError(
                "Invalid arguments in ElasticSearchRetriever constructor:{}".format(rejected_keys))

        logger.info(">> loading HF model from " + model_path) 
        self.tokenizer = AutoTokenizer.from_pretrained(
           self.model_path, use_fast=True)
        self.model = TFAutoModelForQuestionAnswering.from_pretrained(
            self.model_path, from_pt=True)
        self.nlp = en_core_web_md.load()

    def predict_mask(sequence, model, tokenizer, top_n=2):
        input = tokenizer.encode(sequence, return_tensors="tf")
        mask_token_index = tf.where(input == tokenizer.mask_token_id)[0, 1]
        token_logits = model(input)[0]
        mask_token_logits = token_logits[0, mask_token_index, :]  
        
        probabilities = tf.nn.softmax(mask_token_logits)
        topk = tf.math.top_k(probabilities, top_n)
        top_n_probs, top_n_tokens = topk.values.numpy(), topk.indices.numpy()  
        results =  [{tokenizer.decode([top_n_tokens[i]]): top_n_probs[i]} for i in range(len(top_n_probs))]
        # print(results)
        return results 

    def expand_query(self, query, top_n=3, threshold=0.1):
        doc = self.nlp(query)
        tokens = [str(token) for token in doc]
        new_tokens = [] 
        for i,token in enumerate(doc):  
            if (token.pos_ in self.candidate_pos):
                temp_doc = tokens.copy()
                temp_doc[i] = tokenizer.mask_token  
                temp_doc =   " ".join(temp_doc)
                pred_tokens = self.predict_mask(temp_doc, self.model, self.tokenizer, top_n=top_n)
                print(token,"=>", pred_tokens)
                new_tokens = new_tokens + pred_tokens
        return new_tokens



