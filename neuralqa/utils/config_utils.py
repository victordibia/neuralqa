import yaml
import os
import logging
import shutil


logger = logging.getLogger(__name__)


class ConfigParser:
    def __init__(self, config_path):

        module_file_path = os.path.dirname(os.path.abspath(__file__))
        self.default_config_path = os.path.join(
            module_file_path, "../config_default.yaml")
        self.current_config_path = os.path.join(os.getcwd(), "config.yaml")

        if config_path and os.path.exists(config_path):
            self.config = self.load_config(config_path)
            # else:
            #     logger.info("Supplied config file does not exist. " +
            #                  os.path.join(os.getcwd(), config_path))
            #     logger.info("Creating new config file at " +
            #                  self.current_config_path)
            #     self.config = self.load_default_config()
        else:

            if (config_path and not os.path.exists(config_path)):
                logger.info(">> Supplied config file does not exist. " +
                            os.path.join(os.getcwd(), config_path))

            if os.path.exists(self.current_config_path):
                logger.info(">> Found config.yaml file found in current directory " +
                            self.current_config_path)
                self.config = self.load_config(self.current_config_path)
            else:
                logger.info("vCreating new config file at " +
                            self.current_config_path)
                shutil.copyfile(self.default_config_path,
                                self.current_config_path)
                self.config = self.load_default_config()

    def load_default_config(self):
        with open(self.default_config_path) as f:
            default_config = yaml.safe_load(f)
        return default_config

    def load_config(self, config_path):
        """Specially load a config file path. 
        Will first load the default config file, and update its values with 
        the content of the file in config_path.

        Args:
            config_path ([type]): [description]

        Returns:
            [type]: [description]
        """
        default_config = self.load_default_config()

        with open(config_path) as f:
            config = yaml.safe_load(f)

        default_config.update(config)
        return default_config
