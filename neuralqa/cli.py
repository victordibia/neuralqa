
import click
from neuralqa.server import _run_server
from neuralqa.utils import cli_args
from neuralqa.utils import *


@click.group()
@click.version_option()
def cli():
    pass


# @cli.command()
# @cli_args.HOST
# @cli_args.PORT
# def ui(host, port):
#     _run_server(host, port)

@cli.command()
def test():
    # config = ConfigParser()
    down


@cli.command()
@cli_args.HOST
@cli_args.PORT
@cli_args.INDEX_HOST
@cli_args.INDEX_PORT
def ui(host, port, index_host, index_port):
    _run_server(host, port, index_host, index_port)


if __name__ == '__main__':
    cli()
