
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
import os
import logging
from utils import elastic_utils


elastic_utils.es_setup()


# Point Flask to the ui directory
root_file_path = os.path.dirname(os.path.abspath(__file__))
# root_file_path = root_file_path.replace("backend", "frontend")
static_folder_root = os.path.join(root_file_path, "ui/build")
print(static_folder_root)

app = Flask(__name__, static_url_path='',
            static_folder=static_folder_root,
            template_folder=static_folder_root)


cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/')
def hello():
    return render_template('index.html')


@app.route('/test')
def test():
    return "render_template('index.html')"


@app.route('/passages')
def passages():
    query_result = elastic_utils.run_query("")
    query_result_count = query_result["hits"]["total"]["value"]
    query_content = query_result["hits"]["hits"]
    # response = {""}
    return jsonify(query_result)


if __name__ == '__main__':
    app.run(debug=True, port=3008)
