 
## Question Answering on Large Datasets with BERT

In this repo, we will be exploring the end-to-end use case or question answering on a dataset of legal document (court cases from [case.law](case.law)).


The question answering workflow can be broken down into two main parts: 

- Candidate document retrieval : retrieve a list of top `n` documents based on a question/query 
- Document reading: identifying portions of each text that may contain an answer to the query.

## Candidate Document Retrieval
For this task, we will use elastic search (mostly for its clean python api, ease of use). Elasticsearch is a search engine based on the Lucene library. It provides a distributed, multitenant-capable full-text search engine with an HTTP web interface and schema-free JSON documents. Other alternatives include Solr (also based on Lucene).

Elastic search uses the `BM25` algorithm by default for implementing similarity between text fields. We will also use the elastic search python client for elastic operations (create index, search queries).

`pip install elasticsearch`

## Document Reader
 
