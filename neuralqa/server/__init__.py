

from .handlers import Handler
from flask import Flask, jsonify, request, render_template
import os
import logging
import time


def _run_server(host, port):
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

    # add a list of supported api endpints.
    handler = Handler()
    for http_path, handler, methods in handler.get_endpoints():
        app.add_url_rule(http_path, handler.__name__, handler, methods=methods)

    app.run(debug=False, port=port, host=host)
