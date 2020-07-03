import yaml
import os
import logging
import shutil


class ConfigParser:
    def __init__(self, config_path):
        module_file_path = os.path.dirname(os.path.abspath(__file__))
        if config_path:
            if os.path.exists(config_path):
                self.load(config_path)
            else:
                logging.info("Config file does not exist. " +
                             os.path.join(os.getcwd(), config_path))
        else:
            new_config_path = os.path.join(os.getcwd(), "config.yaml")
            if os.path.exists(new_config_path):
                logging.info("Will use config.yaml file found in current directory " +
                             new_config_path)
                self.load(new_config_path)
            else:
                logging.info("No config path provided. Creating config file at " +
                             new_config_path)
                default_config_path = os.path.join(
                    module_file_path, "../config_default.yaml")

                shutil.copyfile(default_config_path, new_config_path)

    def load(self, config_path):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

        # print(" >> ", self.config["ui"]["options"]["stride"]["options"])
