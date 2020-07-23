
from neuralqa.reader import BERTReader
import logging

logger = logging.getLogger(__name__)


class ReaderPool():
    def __init__(self, models):
        self._selected_model = models["selected"]
        self.reader_pool = {}
        for model in models["options"]:
            if (model["type"] == "bert" or model["type"] == "distilbert"):
                self.reader_pool[model["value"]] = BERTReader(
                    model["name"], model["value"])

    @property
    def model(self):
        return self.reader_pool[self.selected_model]

    @property
    def selected_model(self):
        return self._selected_model

    @selected_model.setter
    def selected_model(self, selected_model):
        if (selected_model in self.reader_pool):
            self._selected_model = selected_model
        else:
            default_model = next(iter(self.reader_pool))
            logger.info(
                ">> Model you are attempting to use %s does not exist in model pool. Using the following default model instead %s ", selected_model, default_model)
            self._selected_model = default_model
