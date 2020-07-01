

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
    self.es.indices.create(
        index=index_name, body=index_settings, ignore=400)

    extension = os.path.splitext(file_path)[1]
    logging.info(">> Creating index using file " + file_path)
    i = 0
    if extension == ".xz":
        with lzma.open(file_path) as f:
            for line in f:
                i += 1
                line = json.loads(str(line, 'utf8'))
                index_status = es.index(
                    index=index_name, id=i, body=line)
                if (i > max_docs):
                    break
    elif extension == ".json":
        with open(file_path) as f:
            data = json.load(f)
            for line in data:
                index_status = es.index(
                    index=index_name, id=i, body=line)
                if (i > max_docs):
                    break
