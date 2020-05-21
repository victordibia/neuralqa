 
## Question Answering on Large Datasets with BERT

<img src="ui/public/images/screen.jpg">
This repo explores the end-to-end use case for question answering on a dataset of legal document (court cases from [case.law](case.law)).


The question answering workflow can be broken down into two main parts: 

- Candidate document retrieval : retrieve a list of top `n` documents based on a question/query 
- Document reading: identifying portions of each text that may contain an answer to the query.

## Dataset
The case law bulk dataset api is in jsonl contains properties for each case; we will be focusing on `casebody` field which has subfields such as `attorneys`, `corrections` etc. Main content is the `opinions` section which we will use for QA. Each case may have multiple `opinions` with multiple `opinion authors`.

## Candidate Document Retrieval
For this task, we will use elastic search (mostly for its clean python api, ease of use). Elasticsearch is a search engine based on the Lucene library. It provides a distributed, multitenant-capable full-text search engine with an HTTP web interface and schema-free JSON documents. Other alternatives include Solr (also based on Lucene).

Elastic search uses the `BM25` algorithm by default for implementing similarity between text fields. We will also use the elastic search python client for elastic operations (create index, search queries).

### Install Elastic Search

Follow the [instructions here](https://www.elastic.co/downloads/elasticsearch) to download, install and launch elastic search.
Also install the elastic search python client

`pip install elasticsearch`


## Document Reader
- TBD

## Web Application

Run web application ui that allows the user to ask questions and review responses from the IR + DR pipeline.

`python3 app.py`

 