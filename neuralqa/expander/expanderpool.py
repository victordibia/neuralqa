
from neuralqa.expander import MLMExpander
import logging

logger = logging.getLogger(__name__)


class ExpanderPool():
    def __init__(self, expanders):
        self._selected_expander = expanders["selected"]
        self.expander_pool = {}
        for expander in expanders["options"]:
            if (expander["type"] == "maskedlm"):
                self.expander_pool[expander["value"]] = MLMExpander(
                    model_path=expander["value"])

    @property
    def expander(self):
        return self.expander_pool[self.selected_expander]

    @property
    def selected_expander(self):
        return self._selected_expander

    @selected_expander.setter
    def selected_expander(self, selected_expander):
        if (selected_expander in self.expander_pool):
            self._selected_expander = selected_expander
        else:
            if (len(self.expander_pool) > 0):
                default_expander = next(iter(self.expander_pool))
                logger.info(
                    ">> Expander you are attempting to use %s does not exist in expander pool. Using the following default expander instead %s ", selected_expander, default_expander)
                self._selected_expander = default_expander
            else:
                logger.info(
                    ">> No expander has been specified in config.yaml.")
