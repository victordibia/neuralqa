## NeuralQA: A Usable Library for (Extractive) Question Answering on Large Datasets with BERT

[![License: MIT](https://img.shields.io/github/license/victordibia/neuralqa?style=flat-square)](https://opensource.org/licenses/MIT)
![docs](https://github.com/victordibia/neuralqa/workflows/docs/badge.svg?style=flat-square)

> Still in **alpha**, lots of changes anticipated.

<img width="100%" src="https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/manual.jpg">

`NeuralQA` provides an easy to use api and visual interface for Extractive Question Answering (QA),
on large datasets. The QA process is comprised of two main stages - **Passage retrieval (Retriever)** is implemented using [ElasticSearch](https://www.elastic.co/downloads/elasticsearch)
and **Document Reading (Reader)** is implemented using pretrained BERT models via the
Huggingface [Transformers](https://github.com/huggingface/transformers) api.

## Usage

Create a folder you would like to use for NeuralQA. Run the following command line interface from within that folder.

```shell
pip3 install neuralqa
neuralqa ui --port 4000
```

navigate to [http://localhost:4000/#/](http://localhost:4000/#/). Learn about other command line options in the documentation [here](https://victordibia.github.io/neuralqa/usage.html#command-line-options).

> Note: To use NeuralQA with a retriever such as ElasticSearch, follow the [instructions here](https://www.elastic.co/downloads/elasticsearch) to download, install, and launch a local elasticsearch instance and add it to your config.yaml file.

### How Does it Work?

<img width="100%" src="https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/architecture.png">

NeuralQA is comprised of several high level modules:

- **Retriever**: For each search query (question), scan an index (elasticsearch), and retrieve a list of candidate matched passages.

- **Reader**: For each retrieved passage, a BERT based model predicts a span that contains the answer to the question. In practice, retrieved passages may be lengthy and BERT based models can process a maximum of 512 tokens at a time. NeuralQA handles this in two ways. Lengthy passages are chunked into smaller sections with a configurable stride. Secondly, NeuralQA offers the option of extracting a subset of relevant snippets (RelSnip) which a BERT reader can then scan to find answers. Relevant snippets are portions of the retrieved document that contain exact match results for the search query.

- **User Interface**: NeuralQA provides a visual user interface for performing queries (manual queries where question and context are provided as well as queries over a search index), viewing results and also sensemaking of results (reranking of passages based on answer scores, highlighting keyword match, model explanations).

## Configuration

Properties of modules within NeuralQA (ui, retriever, reader, expander) can be specified via a [yaml configuration](neuralqa/config_default.yaml) file. When you launch the ui, you can specify the path to your config file `--config-path`. If this is not provided, NeuralQA will search for a config.yaml in the current folder or create a [default copy](neuralqa/config_default.yaml)) in the current folder. Sample configuration shown below:

```yaml
ui:
  queryview:
    intro:
      title: "NeuralQA: Question Answering on Large Datasets"
      subtitle: "Subtitle of your choice"
    views: # select sections of the ui to hide or show
      intro: True
      advanced: True
      samples: False
      passages: True
      explanations: True
      allanswers: True
    options: # values for advanced options
      stride: ..
      maxpassages: ..
      highlightspan: ..

  header: # header tile for ui
    appname: NeuralQA
    appdescription: Question Answering on Large Datasets

reader:
  title: Reader
  selected: twmkn9/distilbert-base-uncased-squad2
  options:
    - name: DistilBERT SQUAD2
      value: twmkn9/distilbert-base-uncased-squad2
      type: distilbert
    - name: BERT SQUAD2
      value: deepset/bert-base-cased-squad2
      type: bert
```

## Documentation

An attempt is being made to better document NeuralQA here - [https://victordibia.github.io/neuralqa/](https://victordibia.github.io/neuralqa/).
 

## Citation

A paper introducing NeuralQA and its components can be [found here](docs/images/neuralqa.pdf).

```
@article{Dibia2020NeuralQA,
  title={NeuralQA: A Usable Library for Question Answering (Contextual QueryExpansion + BERT) on Large Datasets},
  author={Victor Dibia},
  year={2020},
}

```
