

from elasticsearch import Elasticsearch
es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

case_index_name = "cases"
search_query = {
    "_source": ["name"],
    "query": {
        "multi_match": {
            "query":    "imprisonment",
            "fields": ["casebody.data.opinions.text", "name"]
        }
    },
    "size": 3
}
query_result = es.search(index=case_index_name, body=search_query)
query_result_count = query_result["hits"]["total"]["value"]
query_content = query_result["hits"]["hits"]
# print(len(query_result["hits"]["hits"]), " hits ..")
print((query_result), " hits ..")
