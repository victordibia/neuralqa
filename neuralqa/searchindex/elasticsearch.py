from neuralqa.searchindex import SearchIndex
from elasticsearch import Elasticsearch, ConnectionError
import logging
logging.getLogger("elasticsearch").setLevel(logging.CRITICAL)


class ElasticSearchIndex(SearchIndex):
    def __init__(self, index_type="elasticsearch", host="localhost", port=9200):
        SearchIndex.__init__(self, index_type)

        self.es = Elasticsearch([{'host': host, 'port': port}])
        self.isAvailable = self.es.ping()

    def run_query(self, index_name, search_query):
        """Makes a query to the elastic search server with the given search_query parameters.
        Also returns opinion_excerpt script field, which is a substring of the first opinion in the case

        Arguments:
            search_query {[dictionary]} -- [contains a dictionary that corresponds to an elastic search query on the ]

        Returns:
            [dictionary] -- [dictionary of results from elastic search.]
        """
        query_result = None

        # TODO: return careful error that bubbles up to UI
        try:
            query_result = {
                "status": True,
                "result": self.es.search(index=index_name, body=search_query)
            }
        except ConnectionRefusedError as e:
            query_result = {
                "status": False,
                "result": str(e)
            }
        except Exception as e:
            query_result = {
                "status": False,
                "result": str(e)
            }
        return query_result

    def test_connection(self):
        try:
            self.es.cluster.health(wait_for_status='yellow')
            return True
        except ConnectionError:
            return False
        except Exception as e:
            print('An unknown error occured connecting to ElasticSearch: %s' % e)
            return False
