
## NeuralQA: Question Answering on Large Datasets with BERT
[![License: MIT](https://img.shields.io/github/license/victordibia/neuralqa?style=flat-square)](https://opensource.org/licenses/MIT)



<img height="30px" src="https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/iconlogodark.png">
<br />
 
<img width="100%" src="https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/manual.jpg">




NeuralQA provides a [visual interface](https://victordibia.github.io/neuralqa/)s for end-to-end  question answering (passage retrieval, query expansion, document reading, model explanation),  on large datasets. Passage retrieval is implemented using ElasticSearch and Document Reading is implemented using pretrained BERT models via the Huggingface [transformers api](https://github.com/huggingface/transformers). 

<!-- An example query and response using a BERT model is shown below.

```
what is the sentence for arson crime?
```

```
BERT Answer: [1.01s] 18 years ’ imprisonment, but mitigated the sentence to 12 years because “ Defendant did not have any intent to injure the victim. ” See NMSA 1978, § 31 - 18 - 15. 1 ( 1979, as amended in 1993 ) ( allowing for mitigation of up to one - third of sentence, [0.26s] shooting at or from a motor vehicle
``` -->
 
### What does NeuralQA Do?

<img width="100%" src="https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/architecture.png">

<!-- - Document Import 
    - documents into a search index (ElasticSearch)
    - Automatically segment large documents into smaller segments -->
- Passage Retrieval
    - For each search query, scan an index (elasticsearch), retrieve matched passages
- Query Enrichment
    - Optionally apply contextual query enrichment before retrieving passages
    - Optionally construct new passages from retrieved highlights (smaller passages for BERT to read)
- Explanation
    - Provide explanations for answer queries using gradients
- Launch a user interface that allows you to perform search queries.


<!-- 

## Candidate Document Retrieval
For this task, we will use elastic search (mostly for its clean python api, ease of use). Elasticsearch is a search engine based on the Lucene library. It provides a distributed, multitenant-capable full-text search engine with an HTTP web interface and schema-free JSON documents. Other alternatives include Solr (also based on Lucene).

Elastic search uses the `BM25` algorithm by default for implementing similarity between text fields. We will also use the elastic search python client for elastic operations (create index, search queries).

## Document Reader
NeuralQA document reader is based on the huggingface library implementation. It has currently been tested with `distilbert` and `bert` (base, large) models that have been trained on the QA task. -->



## Getting Started

```shell
pip3 install neuralqa
neuralqa ui --port 4000
```

navigate to `[http://127.0.0.1:4000/#/](http://127.0.0.1:4000/#/)`.

#### (Optional) Install & Launch Elastic Search

Follow the [instructions here](https://www.elastic.co/downloads/elasticsearch) to download, install, and launch elastic search. 





 