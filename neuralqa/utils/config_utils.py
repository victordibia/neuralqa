import confuse


class ConfigParser:
    def __init__(self):
        self.config = confuse.Configuration('neuralqa', __name__)
        print(self.config["server"]["port"])
