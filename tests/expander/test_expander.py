from neuralqa.expander import MLMExpander


def test_mlm_expander():
    expander_kwargs = {
        # "model_path": "distilbert-base-uncased"
    }
    test_string = "Steve jobs created the apple computer in which year"
    expander = MLMExpander(**expander_kwargs)
    expansion = expander.expand_query(test_string)
    assert len(expansion["terms"]) > 0
    print(expansion)


test_mlm_expander()
