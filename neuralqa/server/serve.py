

from neuralqa.reader import BERTReader, ReaderPool
from neuralqa.server.routehandlers import Handler
from neuralqa.retriever import ElasticSearchRetriever, RetrieverPool
from neuralqa.utils import ConfigParser


import os
import logging
import time
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
# from fastapi.middleware.cors import CORSMiddleware


logger = logging.getLogger(__name__)

config_path = os.environ.get("NEURALQA_CONFIG_PATH")
app_config = ConfigParser(config_path)

app = FastAPI()
api = FastAPI(root_path="/api")


# origins = [
#     "http://localhost",
#     "http://localhost:3000",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

root_file_path = os.path.dirname(os.path.abspath(__file__))
static_folder_root = os.path.join(root_file_path, "ui/build")

app.mount("/api", api)
app.mount("/", StaticFiles(directory=static_folder_root, html=True),
          name="ui")


@api.get('/config')
async def ui_config():
    config = app_config.config["ui"]
    # show only listed models to ui
    config["queryview"]["options"]["relsnip"] = app_config.config["relsnip"]
    config["queryview"]["options"]["samples"] = app_config.config["samples"]
    config["queryview"]["options"]["expander"] = app_config.config["expander"]
    config["queryview"]["options"]["reader"] = app_config.config["reader"]
    config["queryview"]["options"]["retriever"] = app_config.config["retriever"]
    return config

# # Define a Reader Pool
reader_pool = ReaderPool(app_config.config["reader"])

# # define the search index to be used if any
retriever_pool = RetrieverPool(app_config.config["retriever"])

handlers = Handler(reader_pool, retriever_pool)
# handlers = Handler(None, None)
api.include_router(handlers.router)
