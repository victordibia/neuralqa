from neuralqa.retriever import AWSElasticSearchRetriever
from neuralqa.utils import ConfigParser


def test_elasticserch_retriever():
    app_config = ConfigParser("config.yaml")
    rkwargs = app_config.config["retriever"]["options"][1]["connection"]
    retriever = AWSElasticSearchRetriever(**rkwargs)
    results = retriever.run_query(
        "cases", "what is the punishment for arson crime")
    assert results != None


test_elasticserch_retriever()
