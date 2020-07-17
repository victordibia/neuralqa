

from neuralqa.utils import ConfigParser
import time
from fastapi import APIRouter
from typing import Optional
from neuralqa.server.routemodels import Document, Answer, Explanation


class Handler:
    def __init__(self, reader_pool, retriever):
        router = APIRouter()
        self.router = router

        self._reader_pool = reader_pool
        self._retriever = retriever

        @router.post("/answers")
        async def get_answers(params: Answer):

            """Generate an answer for the given search query.
            Performed as two stage process
            1.) Get sample passages from neighbourhood provided by matches by elastic search
            2.) Used BERT Model to identify exact answer spans

            Returns:
                [type] -- [description]
            """

            # switch to the selected model
            self._reader_pool.selected_model = params.reader

            included_fields = ["name"]
            search_query = {
                "_source": included_fields,
                "query": {
                    "multi_match": {
                        "query":    params.question,
                        "fields": ["casebody.data.opinions.text", "name"]
                    }
                },
                "highlight": {
                    "fragment_size": params.highlight_span,
                    "fields": {
                        "casebody.data.opinions.text": {"pre_tags": [""], "post_tags": [""]},
                        "name": {}
                    }
                },
                "size": params.result_size
            }

            answer_holder = []
            response = {}
            start_time = time.time()

            # answer question based on provided context
            if (params.retriever == "manual"):
                answers = self._reader_pool.model.answer_question(
                    params.question, params.context, stride=params.token_stride)
                for answer in answers:
                    answer["index"] = 0
                    answer_holder.append(answer)
            # answer question based on retrieved passages from elastic search
            else:
                query_result = self._retriever.run_query(
                    params.retriever, search_query)
                if query_result["status"]:
                    query_result = query_result["result"]
                    for i, hit in enumerate(query_result["hits"]["hits"]):
                        if ("casebody.data.opinions.text" in hit["highlight"]):
                            # context passage is a concatenation of highlights
                            if (params.relsnip):
                                context = " .. ".join(
                                    hit["highlight"]["casebody.data.opinions.text"])
                            else:
                                context = hit["_source"]
                                print(hit["_source"])

                            answers = self._reader_pool.model.answer_question(
                                params.question, context, stride=params.token_stride)
                            for answer in answers:
                                answer["index"] = i
                                answer_holder.append(answer)

            # sort answers by probability
            answer_holder = sorted(
                answer_holder, key=lambda k: k['probability'], reverse=True)
            elapsed_time = time.time() - start_time
            response = {"answers": answer_holder, "took": elapsed_time}
            return response

        @router.post("/documents")
        async def get_documents(params: Document):
            """Get a list of documents and highlights that match the given search query

            Returns:
                dictionary -- contains details on elastic search results.
            """

            included_fields = ["name"]
            opinion_excerpt_length = 500

            # return only included fields + script_field,
            # limit response to top result_size matches return highlights
            search_query = {
                "_source": included_fields,
                "query": {
                    "multi_match": {
                        "query":    params.question,
                        "fields": ["casebody.data.opinions.text", "name"]
                    }
                },
                "script_fields": {
                    "opinion_excerpt": {
                        "script": "(params['_source']['casebody']['data']['opinions'][0]['text']).substring(0," + str(opinion_excerpt_length) + ")"
                    }
                },
                "highlight": {
                    "fragment_size": params.highlight_span,
                    "fields": {
                        "casebody.data.opinions.text": {},
                        "name": {}
                    }
                },
                "size": params.result_size
            }

            query_result = self._retriever.run_query(
                params.retriever, search_query)
            return query_result

        @router.post("/explain")
        async def get_explanation(params: Explanation):
            """Return  an explanation for a given model

            Returns:
                [dictionary]: [explanation , query, question, ]
            """

            context = params.context.replace(
                "<em>", "").replace("</em>", "")

            gradients, token_words, token_types, answer_text = self._reader_pool.model.explain_model(
                params.question, context)

            explanation_result = {"gradients": gradients,
                                  "token_words": token_words,
                                  "token_types": token_types,
                                  "answer": answer_text
                                  }
            return explanation_result
