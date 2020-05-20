

from elasticsearch import Elasticsearch
es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

case_index_name = "cases"
search_query = {

    "query": {
        "multi_match": {
            "query":    "Appellee",
            "fields": ["casebody.data.opinions.text", "name"]
        }
    },
    "size": 2000
}
query_result = es.search(index=case_index_name, body=search_query)
print(len(query_result["hits"]["hits"]), " hits ..")
