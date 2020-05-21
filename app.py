
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


@app.route('/passages',  methods=['GET', 'POST'])
def passages():
    query_result = []
    result_size, search_text, = 2, "motion in arrest of judgment"
    opinion_excerpt_length = 800

    if request.method == "POST":
        data = request.get_json()
        result_size = data["size"]
        search_text = data["searchtext"]

    included_fields = ["name"]
    # return only included fields + script_field, limit response to top result_size matches
    search_query = {
        "_source": included_fields,
        "query": {
            "multi_match": {
                "query":    search_text,
                "fields": ["casebody.data.opinions.text", "name"]
            }
        },
        "script_fields": {
            "opinion_excerpt": {
                "script": "(params['_source']['casebody']['data']['opinions'][0]['text']).substring(0," + str(opinion_excerpt_length) + ")"
            }
        },
        "highlight": {
            "fields": {
                "casebody.data.opinions.text": {}
            }
        },
        "size": result_size
    }

    query_result = elastic_utils.run_query(search_query)
    return jsonify(query_result)


if __name__ == '__main__':
    app.run(debug=True, port=3008)
