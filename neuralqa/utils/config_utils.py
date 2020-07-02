import confuse
import yaml
import os
import logging


class ConfigParser:
    def __init__(self, config_path):

        if config_path:
            if os.path.exists(config_path):
                self.load(config_path)
            else:
                logging.info("Config file does not exist. " +
                             os.path.join(os.getcwd(), config_path))
        else:
            new_config_path = os.path.join(os.getcwd(), "config.yaml")
            if os.path.exists(new_config_path):
                logging.info("config.yaml file found at " +
                             new_config_path)
                self.load(new_config_path)
            else:
                logging.info("No config path provided. Creating config file at " +
                             new_config_path)

    def load(self, config_path):
        self.config = yaml.load(config_path)
