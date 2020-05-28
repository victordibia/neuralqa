
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin
import os
import logging
import time
from utils import elastic_utils, model_utils


# load BERT QA model and tokenizer
model, tokenizer = model_utils.load_model(model_name="bertcasedsquad2")

# Check to ensure elastic data is loaded
elastic_utils.es_setup()


# Point Flask to the ui directory
root_file_path = os.path.dirname(os.path.abspath(__file__))
# root_file_path = root_file_path.replace("backend", "frontend")
static_folder_root = os.path.join(root_file_path, "ui/build")
# print(static_folder_root)

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


@app.route('/qa',  methods=['GET', 'POST'])
def qa():
    return jsonify({})


@app.route('/answer',  methods=['GET', 'POST'])
def answer():
    """Generate an answer for the given search query. 
    Perfomed as two stage process
    1.) Get sample passages from neighbourhood provided by matches by elastic search
    2.) Used BERT Model to identify exact answer spans

    Returns:
        [type] -- [description]
    """
    query_result = []
    result_size, search_text, = 6, "what is a fourth amendment right violation? "
    highlight_span = 450
    model_name = ""
    token_stride = 50

    if request.method == "POST":
        data = request.get_json()
        result_size = data["size"]
        search_text = data["searchtext"]
        token_stride = int(data["stride"])
        highlight_span = data["highlightspan"]
        model_name = data["model"]

    included_fields = ["name"]
    search_query = {
        "_source": included_fields,
        "query": {
            "multi_match": {
                "query":    search_text,
                "fields": ["casebody.data.opinions.text", "name"]
            }
        },
        "highlight": {
            "fragment_size": highlight_span,
            "fields": {
                "casebody.data.opinions.text": {"pre_tags": [""], "post_tags": [""]},
                "name": {}
            }
        },
        "size": result_size
    }

    query_result = elastic_utils.run_query(search_query)
    answer_holder = []

    start_time = time.time()
    for hit in query_result["hits"]["hits"]:
        if ("casebody.data.opinions.text" in hit["highlight"]):
            all_highlights = " ".join(
                hit["highlight"]["casebody.data.opinions.text"])
            answer = model_utils.answer_question(
                search_text, all_highlights, model, tokenizer, stride=token_stride)
            answer_holder.append(answer)

    elapsed_time = time.time() - start_time
    response = {"answers": answer_holder, "took": elapsed_time}
    return jsonify(response)


@app.route('/passages',  methods=['GET', 'POST'])
def passages():
    """Get a list of passages and highlights that match the given search query

    Returns:
        dictionary -- contains details on elastic search results.
    """
    query_result = []
    result_size, search_text, = 5, "motion in arrest judgment"
    opinion_excerpt_length = 500
    highlight_span = 350

    if request.method == "POST":
        data = request.get_json()
        result_size = data["size"]
        search_text = data["searchtext"]
        stride = data["searchtext"]
        highlight_span = data["highlightspan"]
        model = data["model"]

    included_fields = ["name"]

    # return only included fields + script_field,
    # limit response to top result_size matches return highlights
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
            "fragment_size": highlight_span,
            "fields": {
                "casebody.data.opinions.text": {},
                "name": {}
            }
        },
        "size": result_size
    }

    query_result = elastic_utils.run_query(search_query)
    return jsonify(query_result)


if __name__ == '__main__':
    app.run(debug=True, port=3008)
