Configuration
=============


Neuralqa provides an interface to specify properties of each module (ui, retriever, reader, expander) via a `yaml configuration <neuralqa/config_default.yaml>`_ file. When you launch the ui, you can specify the path to your config file `--config-path`. If this is not provided, NeuralQA will search for a config.yaml in the current folder or create a [default copy](neuralqa/config_default.yaml)) in the current folder. Sample configuration for the UI is shown below:

.. code-block:: yaml

    ui:
    queryview:
        intro:
        title: "NeuralQA: Question Answering on Large Datasets"
        subtitle: "Subtitle of your choice"
        views:    # select sections of the ui to hide or show
        intro: True
        advanced: True
        samples: False
        passages: True
        explanations: True
        allanswers: True
        options:  # values for advanced options
        model:  # list of models the user can select from
            title: QA models
            selected: distilbertsquad2
            options:
            - name: DistilBERT SQUAD2
                value: distilbertsquad2
            - name: BERT SQUAD2
                value: bertsquad2
        index: # search indices the user can select from
            title: Search Index
            selected: manual
            options:
            - name: Manual
                value: manual
            - name: Case Law
                value: cases 
        stride: ..
        maxpassages: ..
        highlightspan: ..

    header: # header tile for ui
        appname: NeuralQA
        appdescription: Question Answering on Large Datasets

 

