

from neuralqa.utils import ConfigParser
import time
from fastapi import APIRouter
from typing import Optional
from neuralqa.server.routemodels import Document, Answer, Explanation
import logging

logger = logging.getLogger(__name__)


class Handler:
    def __init__(self, reader_pool, retriever_pool):
        router = APIRouter()
        self.router = router

        self.reader_pool = reader_pool
        self.retriever_pool = retriever_pool

        @router.post("/answers")
        async def get_answers(params: Answer):

            """Generate an answer for the given search query.
            Performed as two stage process
            1.) Get sample passages from neighbourhood provided by matches by elastic search
            2.) Used BERT Model to identify exact answer spans

            Returns:
                [type] -- [description]
            """

            # print(params)

            # switch to the selected model and retriever
            self.reader_pool.selected_model = params.reader
            
            answer_holder = []
            response = {}
            start_time = time.time()

            # answer question based on provided context
            if (params.retriever == "manual"):
                answers = self.reader_pool.model.answer_question(
                    params.question, params.context, stride=params.tokenstride)
                for answer in answers:
                    answer["index"] = 0
                    answer_holder.append(answer)
            # answer question based on retrieved passages from elastic search
            else:
                self.retriever_pool.selected_retriever = params.retriever
                num_fragments = 5
                query_results = self.retriever_pool.retriever.run_query(params.retriever, params.question,
                                                                        max_documents=params.max_documents, fragment_size=params.fragment_size,
                                                                        relsnip=params.relsnip, num_fragments=num_fragments, highlight_tags=False)
                # print(query_results)
                if ( query_results["status"]): 
                    # if relsnip is not enabled, read the entire document ... this is super slow
                    docs = query_results["highlights"] if params.relsnip else query_results["docs"]

                    for i, doc in enumerate(docs):
                        doc = doc.replace("\n", " ")
                        answers = self.reader_pool.model.answer_question(
                            params.question, doc, stride=params.tokenstride)
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

            self.retriever_pool.selected_retriever = params.retriever
            num_fragments = 5
            query_results = self.retriever_pool.retriever.run_query(
                params.retriever, params.question, max_documents=params.max_documents, fragment_size=params.fragment_size, relsnip=params.relsnip, num_fragments=num_fragments)
            # print(query_results)
            max_doc_size = 1200
            if not params.relsnip:
                query_results["highlights"] = [doc[:max_doc_size] + " .." for doc in query_results["docs"]] 
            return query_results

        @router.post("/explain")
        async def get_explanation(params: Explanation):
            """Return  an explanation for a given model

            Returns:
                [dictionary]: [explanation , query, question, ]
            """

            # TODO: Do we need to switch readers here?

            context = params.context.replace(
                "<em>", "").replace("</em>", "")

            gradients, token_words, token_types, answer_text = self.reader_pool.model.explain_model(
                params.question, context)

            explanation_result = {"gradients": gradients,
                                  "token_words": token_words,
                                  "token_types": token_types,
                                  "answer": answer_text
                                  }
            return explanation_result
