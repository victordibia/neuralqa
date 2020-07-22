

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

            # included_fields = ["name"]
            # search_query = {
            #     "_source": included_fields,
            #     "query": {
            #         "multi_match": {
            #             "query":    params.question,
            #             "fields": ["casebody.data.opinions.text", "name"]
            #         }
            #     },
            #     "highlight": {
            #         "fragment_size": params.highlight_span,
            #         "fields": {
            #             "casebody.data.opinions.text": {"pre_tags": [""], "post_tags": [""]},
            #             "name": {}
            #         }
            #     },
            #     "size": params.max_documents
            # }

            answer_holder = []
            response = {}
            start_time = time.time()

            # answer question based on provided context
            if (params.retriever == "manual"):
                answers = self._reader_pool.model.answer_question(
                    params.question, params.context, stride=params.tokenstride)
                for answer in answers:
                    answer["index"] = 0
                    answer_holder.append(answer)
            # answer question based on retrieved passages from elastic search
            else:
                body_field = "casebody"
                secondary_fields = ["author"]
                num_fragments = 5
                query_results = self._retriever.run_query(params.retriever, params.question, body_field, secondary_fields,
                                                          max_documents=params.max_documents, highlight_span=params.highlight_span,
                                                          relsnip=params.relsnip, num_fragments=num_fragments, highlight_tags=False)

                if (not query_results["status"]):
                    return query_results
                # query_result = self._retriever.run_query(
                #     params.retriever, search_query)
                docs = query_results["highlights"] if params.relsnip else query_results["docs"]

                for i, doc in enumerate(docs):
                    doc = doc.replace("\n", " ")
                    print(doc)
                    answers = self._reader_pool.model.answer_question(
                        params.question, doc, stride=params.tokenstride)
                    for answer in answers:
                        print(answer)
                        answer["index"] = i
                        answer_holder.append(answer)

                print(answer_holder)
                # if query_result["status"]:
                #     query_result = query_result["result"]
                #     for i, hit in enumerate(query_result["hits"]["hits"]):
                #         if ("casebody.data.opinions.text" in hit["highlight"]):
                #             # context passage is a concatenation of highlights
                #             if (params.relsnip):
                #                 context = " .. ".join(
                #                     hit["highlight"]["casebody.data.opinions.text"])
                #             else:
                #                 context = str(hit["_source"])
                #                 # print(context)

                #             answers = self._reader_pool.model.answer_question(
                #                 params.question, context, stride=params.tokenstride)
                #             for answer in answers:
                #                 answer["index"] = i
                #                 answer_holder.append(answer)

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

            body_field = "casebody"
            secondary_fields = ["author"]
            num_fragments = 5
            query_results = self._retriever.run_query(params.retriever, params.question, body_field, secondary_fields,
                                                      max_documents=params.max_documents, highlight_span=params.highlight_span, relsnip=True, num_fragments=num_fragments)

            return query_results

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
