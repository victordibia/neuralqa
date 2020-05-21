
import os
import zipfile
import shutil
import urllib.request
import logging


def download_data(data_url, source_name):
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
    shutil.copyfile(data_file, "data/newmexico.json.xz")
    logging.info(">> Extracted and moved jsonl file to data folder")
    shutil.rmtree(extract_dir)
    os.remove(zip_file_path)


def get_case_data():
    caselaw_data_paths = [
        ["https://api.case.law/v1/bulk/22411/download/", "newmexico"]
    ]
    for data_path in caselaw_data_paths:
        download_data(data_path[0], data_path[1])
