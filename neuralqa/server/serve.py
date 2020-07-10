

from neuralqa.reader import BERTReader, ReaderPool
from neuralqa.server.handlers import Handler
from neuralqa.searchindex import ElasticSearchIndex
from neuralqa.utils import ConfigParser

from flask import Flask, jsonify, request, render_template
import os
import logging
import time


def _run_server(host, port, index_host, index_port, config_path):

    app_config = ConfigParser(config_path)

    # Point Flask to the ui directory
    root_file_path = os.path.dirname(os.path.abspath(__file__))
    static_folder_root = os.path.join(root_file_path, "ui/build")
    # print(static_folder_root)

    app = Flask(__name__, static_url_path='',
                static_folder=static_folder_root,
                template_folder=static_folder_root)

    # serve front end ui/
    @app.route('/')
    def ui():
        return render_template('index.html')

    @app.route('/config')
    def ui_config():
        config = app_config.config["ui"]
        # show only listed models to ui
        config["queryview"]["options"]["relsnip"] = app_config.config["relsnip"]
        config["queryview"]["options"]["expander"] = app_config.config["expander"]
        config["queryview"]["options"]["reader"] = app_config.config["reader"]
        config["queryview"]["options"]["retriever"] = app_config.config["retriever"]
        return jsonify(config)

    # define the model to be used
    # model_name = "distilbert"
    # model_path = "twmkn9/distilbert-base-uncased-squad2"
    # model = BERTReader(model_name, model_path)
    # print(">> model loaded")

    # Define a Reader Pool
    reader_pool = ReaderPool(app_config.config["reader"])

    # define the search index to be used if any
    search_index = ElasticSearchIndex(
        host=index_host, port=index_port)
    # print(">> index connnection status", self._index.test_connection())

    # create a handler that responds to queries using model and search index
    handler = Handler(reader_pool, search_index)
    # add a list of supported api endpints.
    for http_path, handler, methods in handler.get_endpoints():
        app.add_url_rule(http_path, handler.__name__, handler, methods=methods)

    app.run(debug=False, port=port, host=host)
