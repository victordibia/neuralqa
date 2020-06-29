# miflow server/__init__.py


from neuralqa.server import handlers

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
import os
import logging
import time
# from utils import elastic_utils, model_utils, explanation_utils


# Point Flask to the ui directory
root_file_path = os.path.dirname(os.path.abspath(__file__))
# root_file_path = root_file_path.replace("backend", "frontend")
static_folder_root = os.path.join(root_file_path, "ui/build")
# print(static_folder_root)

app = Flask(__name__, static_url_path='',
            static_folder=static_folder_root,
            template_folder=static_folder_root)

cors = CORS(app)


@app.route('/')
def ui():
    return render_template('index.html')


# add a list of handlers
for http_path, handler, methods in handlers.get_endpoints():
    app.add_url_rule(http_path, handler.__name__, handler, methods=methods)


def _run_server(host, port):
    app.run(debug=False, port=port, host=host)
