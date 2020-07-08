.. NeuralQA documentation master file, created by
   sphinx-quickstart on Fri Jul  3 22:14:37 2020.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

NeuralQA Documentation
=========================

.. .. image:: https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/manual.jpg
..   :width: 100%
..   :alt: NeuralQA User Interface Screenshot
 

``NeuralQA`` provides an api and visual interface for Question Answering (QA), 
on large datasets. The QA process is comprised of two stages - **Passage retrieval** which is 
implemented using `ElasticSearch <https://www.elastic.co/downloads/elasticsearch>`_ 
and **Document Reading** is implemented using pretrained BERT models via the 
Huggingface `Transformers api <https://github.com/huggingface/transformers>`_ . 

 
How It Works
*************

.. image:: https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/architecture.png
  :width: 100%
  :alt: NeuralQA Architecture

NeuralQA is comprised of several high level modules:


- **Retriever**: For each search query (question), scan an index (elasticsearch), and retrieve a list of candidate matched passages.

- **Document Reader**: For each retrieved passage, a BERT based model predicts a span that contains the answer to the question. In practice, retrieved passages may be lengthy and BERT based models can process a maximum of 512 tokens at a time. NeuralQA handles this in two ways. Lengthy passages are chunked into smaller sections with an configurable stride. Secondly, NeuralQA offers the option of extracting a subset of relevant snippets (RelSnip) which a BERT reader can then scan to find answers. Relevant snippets are portions of the retrieved document that contain exact match results for the search query. 

- **User Interface**: NeuralQA provides a visual user interface for performing queries (manual queries where question and context are provided as well as queries over a search index), viewing results and also sensemaking of results  (reranking of passages based on answer scores, highlighting keyword match, model explanations).  


Why NeuralQA?
****************


 
.. toctree::
    :maxdepth: 3
    :caption: Contents:
    
    self
    usage
    configuration


.. Indices and tables
.. ==================

.. * :ref:`genindex`
.. * :ref:`modindex`
.. * :ref:`search`
