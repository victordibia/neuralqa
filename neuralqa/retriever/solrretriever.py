from neuralqa.retriever import Retriever
from neuralqa.utils import parse_field_content
import requests
import logging


logger = logging.getLogger(__name__)


class SolrRetriever(Retriever):
    def __init__(self, index_type="solr", host="localhost", port=8983, protocol="http", ** kwargs):
        Retriever.__init__(self, index_type)

        self.username = ""
        self.password = ""
        self.body_field = ""
        self.host = host
        self.port = port
        self.protocol = protocol

        allowed_keys = list(self.__dict__.keys())
        self.__dict__.update((k, v)
                             for k, v in kwargs.items() if k in allowed_keys)

        self.base_solr_url = protocol + "://" + \
            host + ":" + str(port) + "/solr"

        # self.es = Elasticsearch([{'host': self.host, 'port': self.port}])
        # self.isAvailable = self.es.ping()

        rejected_keys = set(kwargs.keys()) - set(allowed_keys)

        if rejected_keys:
            raise ValueError(
                "Invalid arguments in ElasticSearchRetriever constructor:{}".format(rejected_keys))

    def run_query(self, index_name, search_query, max_documents=5, fragment_size=100, relsnip=True, num_fragments=5, highlight_tags=True):
        query_url = self.base_solr_url + "/" + index_name + "/select"

        params = {"df": self.body_field, "fl": self.body_field,
                  "wt": "json", "q": search_query, "rows": max_documents}

        hl_params = {"hl": "true", "hl.method": "unified", "hl.snippets": num_fragments,
                     "hl.fragsize": num_fragments, "hl.usePhraseHighlighter": "true"}
        if not highlight_tags:
            hl_params["hl.tags.pre"] = ""
            hl_params["hl.tags.post"] = ""

        if relsnip:
            params = {**params, **hl_params}
        else:
            params["fl"] = "null"

        response = requests.get(query_url, params=params)
        highlights = []
        docs = []
        results = {}
        status = False

        if (response.status_code == 200):
            status = True
            print(response.url, response.status_code)
            response = response.json()
            print((response.keys()))
            highlights = [" ".join(response["highlighting"][key][self.body_field])
                          for key in response["highlighting"].keys()] if "highlighting" in response else highlights
            docs = [" ".join(doc[self.body_field])
                    for doc in response["response"]["docs"]]
            results = {"took": response["responseHeader"]
                       ["QTime"],  "highlights": highlights, "docs": docs}
        else:
            print("An error has occured",
                  response.status_code, response.__dict__)
            status = False
            results["errormsg"] = str(response.status_code)
        results["status"] = status
        return results
