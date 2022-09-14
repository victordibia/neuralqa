import boto3
from requests_aws4auth import AWS4Auth
import copy
from neuralqa.retriever import Retriever, ElasticSearchRetriever
from neuralqa.utils import parse_field_content
from elasticsearch import Elasticsearch, ConnectionError, NotFoundError, RequestsHttpConnection
import logging

import traceback

logger = logging.getLogger(__name__)
region = 'us-east-2'
service = 'es'


class AWSElasticSearchRetriever(ElasticSearchRetriever):
    def __init__(self, host, index_type="elasticsearch", port=443, **kwargs):
        Retriever.__init__(self, index_type)

        self.body_field = ""
        self.search_fields = []
        self.return_fields = []
        self.remove_body_field = True
        self.host = host
        self.port = port
        allowed_keys = list(self.__dict__.keys())
        self.__dict__.update((k, v) for k, v in kwargs.items() if k in allowed_keys)
        # assert self.body_field in self.return_fields
        # assert any(self.body_field in f for f in self.search_fields)

        credentials = boto3.Session().get_credentials()
        awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service,
                           session_token=credentials.token)
        self.es = Elasticsearch(
            hosts=[{"host": self.host, "port": self.port}],
            http_auth=awsauth,
            use_ssl = True,
            verify_certs = True,
            connection_class = RequestsHttpConnection,
        )
        self.isAvailable = self.es.ping()

        rejected_keys = set(kwargs.keys()) - set(allowed_keys)

        if rejected_keys:
            raise ValueError(
                "Invalid arguments in ElasticSearchRetriever constructor:{}".format(rejected_keys))

    def run_query(self, index_name, search_query, max_documents=5, fragment_size=100, relsnip=True, num_fragments=5,
                  highlight_tags=True):

        tags = {"pre_tags": [""], "post_tags": [
            ""]} if not highlight_tags else {}
        highlight_params = {
            "fragment_size": fragment_size,
            "fields": {
                self.body_field: tags
            },
            "number_of_fragments": num_fragments
        }

        search_query = {
            "_source": self.return_fields,
            "query": {
                "multi_match": {
                    "query":    search_query,
                    "fields": self.search_fields
                }
            },
            "size": max_documents
        }

        status = True
        results = {}

        if (relsnip):
            # search_query["_source"] = {"includes": [""]}
            search_query["highlight"] = highlight_params
        # else:
        #     search_query["_source"] = {"includes": [self.body_field]}

        try:
            query_result = self.es.search(
                index=index_name, body=search_query)

            # RelSnip: for each document, we concatenate all
            # fragments in each document and return as the document.
            highlights = [" ".join(hit["highlight"][self.body_field])
                          for hit in query_result["hits"]["hits"] if "highlight" in hit]
            docs = [parse_field_content(self.body_field, hit["_source"])
                    for hit in query_result["hits"]["hits"] if "_source" in hit]
            source = copy.deepcopy(query_result)
            if self.remove_body_field:
                for hit in source["hits"]["hits"]:
                    if "_source" in hit:
                        del hit['_source'][self.body_field]
            took = query_result["took"]
            results = {"took": took,  "highlights": highlights, "docs": docs, "source": source}

        except (ConnectionRefusedError, NotFoundError, Exception) as e:
            status = False
            results["errormsg"] = str(e)

        results["status"] = status
        return results
