import click
from neuralqa.server import launch_server
from neuralqa.utils import cli_args
from neuralqa.utils import import_case_data, ConfigParser
import os
from neuralqa.retriever import RetrieverPool


@click.group()
@click.version_option()
def cli():
    pass


@cli.command()
@cli_args.HOST
@cli_args.PORT
@cli_args.WORKERS
@cli_args.CONFIG_PATH
def test(host, port, workers, config_path):
    # config = ConfigParser(config_path)
    # rp = RetrieverPool(config.config["retriever"])
    # print((rp.retriever_pool))
    import_case_data()


@cli.command()
@cli_args.HOST
@cli_args.PORT
@cli_args.WORKERS
@cli_args.CONFIG_PATH
def ui(host, port, workers, config_path):
    if (config_path):
        os.environ["NEURALQA_CONFIG_PATH"] = config_path
    launch_server(host, port, workers)


if __name__ == '__main__':
    cli()
