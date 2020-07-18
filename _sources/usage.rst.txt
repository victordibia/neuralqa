Usage
=============

Installation
*******************

``NeuralQA``  can be installed via `pip` using the following command:

.. code-block:: shell

    pip3 install neuralqa


Viewing the UI
**************************************************
 
.. code-block:: shell

    neuralqa ui --port 5000 --workers 1


.. note::
  ``NeuralQA`` uses the `uvicorn <https://www.uvicorn.org/deployment/>`_ asgi webserver with support for multiple workers (use the worker flag to set the number of worker processes). Note that model weights used by ``NeuralQA`` are loaded into memory on status *for each thread*.

.. image:: https://raw.githubusercontent.com/victordibia/neuralqa/master/docs/images/manual.jpg
  :width: 100%
  :alt: NeuralQA User Interface Screenshot 



Command Line Options
*********************************

The primary command for ``NeuralQA``  is the `neuralqa ui` .  Use the following command to view the available options.

.. code-block:: shell

    neuralqa ui --help

.. code-block:: shell

    Options:
    -h, --host TEXT          The network address to listen on (default:
                            127.0.0.1). Use 0.0.0.0 to bind to all addresses if
                            you want to access the tracking server from other
                            machines.
    -p, --port INTEGER       The port to listen on (default: 5000).
    -w, --workers INTEGER    Number of uviicorn worker processes to handle
                            requests (default: 1).
    -cp, --config-path TEXT  Path to a yaml file containing config for neuralqa.
                            If none is provided, the default config.yaml is
                            copied to the current directory.
    --help                   Show this message and exit.

    


Rest API Docs
**************************************************

The rest api for ``NeuralQA`` is implemented using `FastAPI <https://fastapi.tiangolo.com/>`_. This means you do get excellent documentation for free. In your browser, type the following:


.. code-block:: shell

    localhost:port/api/docs


 
