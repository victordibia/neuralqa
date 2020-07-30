import click
from neuralqa.server import launch_server
from neuralqa.utils import cli_args
from neuralqa.utils import import_sample_data, ConfigParser
import os
from neuralqa.retriever import RetrieverPool
import logging


@click.group()
@click.version_option()
def cli():
    pass


# @cli.command()
# @cli_args.HOST
# @cli_args.PORT
# @cli_args.WORKERS
# @cli_args.CONFIG_PATH
# def test(host, port, workers, config_path):
#     import_sample_data()


@cli.command()
@cli_args.MAX_DOCS
def load(max_docs):
    """This command loads sample data into a local elastic search index."""

    logging.basicConfig()
    logging.getLogger().setLevel(logging.INFO)
    logging.getLogger(__name__).setLevel(logging.INFO)
    import_sample_data(max_docs=max_docs)


@cli.command()
@cli_args.HOST
@cli_args.PORT
@cli_args.WORKERS
@cli_args.CONFIG_PATH
def ui(host, port, workers, config_path):
    """This command launches the web interface for NeuralQA."""
    logging.basicConfig()
    logging.getLogger().setLevel(logging.INFO)
    logging.getLogger(__name__).setLevel(logging.INFO)
    if (config_path):
        os.environ["NEURALQA_CONFIG_PATH"] = config_path
    launch_server(host, port, workers)


if __name__ == '__main__':
    cli()
