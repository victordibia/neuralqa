from elasticsearch import Elasticsearch
import os
import zipfile
import shutil
import urllib.request
import logging
import lzma
import json


def create_index_from_json(index_name, file_path, max_docs=None):
    """Create an index from json file formats.
    Read each file line by line, parse each line as json
        jsonl.xz
        json  : must be a json file containing a list

    Arguments:
        file_path {str} -- path to case.law bulk file
    Keyword Arguments:
        max_docs {int} -- maximum size of records to use in creating index.
        small default can be used to enable quick testing (e.g: {2000}).
        set this to None to use the entire data file.
    """

    es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

    index_settings = {
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
    es.indices.create(
        index=index_name, body=index_settings, ignore=400)

    extension = os.path.splitext(file_path)[1]
    logging.info(">> Creating index using file " + file_path)
    i = 0
    if extension == ".xz":
        with lzma.open(file_path) as f:
            for line in f:
                i += 1
                line = json.loads(str(line, 'utf8'))
                try:
                    index_status = es.index(
                        index=index_name, id=i, body=line)
                except Exception as e:
                    logging.info(
                        "An error has occurred while creating index " + str(e))
                    break
                # logging.info(index_status)
                if (i > max_docs):
                    break
    elif extension == ".json":
        with open(file_path) as f:
            data = json.load(f)
            for line in data:
                try:
                    index_status = es.index(
                        index=index_name, id=i, body=line, op_type="create")
                except Exception as e:
                    logging.info(
                        "An error has occurred while creating index " + str(e))
                    break
                if (i > max_docs):
                    break
    logging.info(">> Creating index complete ")


def download_data(data_url, source_name):
    """Download Zip datafile from case.law
    Arguments:
        data_url {str} -- url path dataset
        source_name {str} -- name for dataset
    """
    # create data directory
    os.makedirs("data", exist_ok=True)
    # download data from caselaw
    zip_file_path = source_name + ".zip"
    logging.info("Downloading data file for " + source_name)
    urllib.request.urlretrieve(data_url, zip_file_path)
    logging.info(">> Downloaded data file " + zip_file_path)

    extract_dir = "temp" + source_name
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    data_file = os.path.join(extract_dir, os.listdir(
        extract_dir)[0], "data", "data.jsonl.xz")
    final_file_path = os.path.join("data", source_name + "jsonl.xz")
    shutil.copyfile(data_file, final_file_path)
    logging.info(">> Extracted and moved jsonl file to data folder")
    shutil.rmtree(extract_dir)
    os.remove(zip_file_path)
    return final_file_path


def import_case_data(max_docs=2000):
    """Download new mexico legal case documents,
    import the first 2,000 cases.
    """
    caselaw_data_paths = [
        ["https://api.case.law/v1/bulk/22411/download/", "newmexico"]
    ]
    for data_path in caselaw_data_paths:
        file_path = download_data(data_path[0], data_path[1])
        create_index_from_json("cases", file_path, max_docs=max_docs)
