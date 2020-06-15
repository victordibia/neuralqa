
import lzma
import os
import json
from elasticsearch import Elasticsearch, ConnectionError
import logging
from utils import data_utils


case_index_name = "cases"
es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

# elastic search settings
# configure analyzer on index to not return stop words in english.
es_settings = {
    "settings": {
        "analysis": {
            "analyzer": {
                "stop_analyzer": {
                    "type": "standard",
                    "stopwords": "_english_"
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "casebody.data.opinions.text": {
                "type": "text",
                "analyzer": "stop_analyzer"
            },
            "name": {
                "type": "text",
                "analyzer": "stop_analyzer"
            }
        }
    }
}


def create_case_index(case_file_path, max_docs=2000):
    """Create an index from a case file (.jsonl.xz format)

    Arguments:
        case_file_path {str} -- path to case.law bulk file

    Keyword Arguments:
        max_docs {int} -- maximum size of records to use in creating index.  Small default is to enable quick testing (default: {1000})
    """

    es.indices.create(index=case_index_name, body=es_settings, ignore=400)

    i = 0
    logging.info(">> Creating index using file " + case_file_path)
    with lzma.open(case_file_path) as in_file:
        for line in in_file:
            i += 1
            case = json.loads(str(line, 'utf8'))
            index_status = es.index(index=case_index_name, id=i, body=case)
            if (i > max_docs):
                break


def run_query(search_query, index_name=case_index_name):
    """Makes a query to the elastic search server with the given search_query parameters.
    Also returns opinion_excerpt script field, which is a substring of the first opinion in the case

    Arguments:
        search_query {[dictionary]} -- [contains a dictionary that corresponds to an elastic search query on the ]

    Returns:
        [dictionary] -- [dictionary of results from elastic search.]
    """

    query_result = es.search(index=index_name, body=search_query)
    return query_result


def test_connection():
    try:
        es.cluster.health(wait_for_status='yellow')
        return True
    except ConnectionError:
        return False


def es_setup():
    """Called once when the webserver is instantiated
        - Checks if the data directory exists or is empty. If yes, downloads case law data and builds an index
    """
    # Check if jsonl data has been downloaded
    if (not os.path.exists("data") or len(os.listdir("data")) == 0):
        data_utils.get_case_data()
        case_data_files = os.listdir("data")
        for case_data_file in case_data_files:
            if ("json" in case_data_file):
                create_case_index("data/" + case_data_file)
    else:
        logging.info(">> Data files already exist")
