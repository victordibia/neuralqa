import confuse


class ConfigParser:
    def __init__(self):
        self.config = confuse.Configuration('neuralqa', __name__)
        print((config["server"]["port"]))
