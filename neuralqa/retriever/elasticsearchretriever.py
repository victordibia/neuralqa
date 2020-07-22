from neuralqa.retriever import Retriever
from elasticsearch import Elasticsearch, ConnectionError
import logging


logging.getLogger("elasticsearch").setLevel(logging.CRITICAL)
logger = logging.getLogger(__name__)


class ElasticSearchRetriever(Retriever):
    def __init__(self, index_type="elasticsearch", host="localhost", port=9200, **kwargs):
        Retriever.__init__(self, index_type)

        self.username = ""
        self.password = ""
        self.body_field = ""
        self.secondary_fields = []
        self.host = host
        self.port = port

        allowed_keys = list(self.__dict__.keys())
        self.__dict__.update((k, v)
                             for k, v in kwargs.items() if k in allowed_keys)
        self.es = Elasticsearch([{'host': self.host, 'port': self.port}])
        self.isAvailable = self.es.ping()

        rejected_keys = set(kwargs.keys()) - set(allowed_keys)

        if rejected_keys:
            raise ValueError(
                "Invalid arguments in ElasticSearchRetriever constructor:{}".format(rejected_keys))

    def run_query(self, index_name, search_query, max_documents=5, highlight_span=100, relsnip=True, num_fragments=5, highlight_tags=True):

        tags = {"pre_tags": [""], "post_tags": [
            ""]} if not highlight_tags else {}
        highlight_params = {
            "fragment_size": highlight_span,
            "fields": {
                self.body_field: tags
            },
            "number_of_fragments": num_fragments
        }

        search_query = {
            "query": {
                "multi_match": {
                    "query":    search_query,
                    "fields": [self.body_field] + self.secondary_fields
                }
            },
            "size": max_documents
        }

        status = True
        results = {}

        if (relsnip):
            search_query["_source"] = {"includes": [""]}
            search_query["highlight"] = highlight_params
        else:
            search_query["_source"] = {"includes": [self.body_field]}

        try:
            query_result = self.es.search(
                index=index_name, body=search_query)
            # RelSnip: for each document, we concatenate all
            # fragments in each document and return as the document.
            highlights = [".".join(hit["highlight"][self.body_field])
                          for hit in query_result["hits"]["hits"] if "highlight" in hit]
            docs = [((hit["_source"][self.body_field]))
                    for hit in query_result["hits"]["hits"] if hit["_source"]]
            took = query_result["took"]
            results = {"took": took,  "highlights": highlights, "docs": docs}

        except (ConnectionRefusedError, Exception) as e:
            status = False
            results["errormsg"] = str(e)

        results["status"] = status
        return results

    # def run_query(self, index_name, search_query):
    #     """Makes a query to the elastic search server with the given search_query parameters.
    #     Also returns opinion_excerpt script field, which is a substring of the first opinion in the case

    #     Arguments:
    #         search_query {[dictionary]} -- [contains a dictionary that corresponds to an elastic search query on the ]

    #     Returns:
    #         [dictionary] -- [dictionary of results from elastic search.]
    #     """
    #     query_result = None

    #     # return error as result on error.
    #     # Calling function should check status before parsing result
    #     try:
    #         query_result = {
    #             "status": True,
    #             "result": self.es.search(index=index_name, body=search_query)
    #         }
    #     except ConnectionRefusedError as e:
    #         query_result = {
    #             "status": False,
    #             "result": str(e)
    #         }
    #     except Exception as e:
    #         query_result = {
    #             "status": False,
    #             "result": str(e)
    #         }
    #     return query_result

    def test_connection(self):
        try:
            self.es.cluster.health()
            return True
        except ConnectionError:
            return False
        except Exception as e:
            print('An unknown error occured connecting to ElasticSearch: %s' % e)
            return False
