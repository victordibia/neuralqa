
import click
from neuralqa.server import _run_server
from neuralqa.utils import cli_args

# _run_server()


@click.group()
@click.version_option()
def cli():
    pass


@cli.command()
@cli_args.HOST
@cli_args.PORT
def ui(host, port):
    _run_server(host, port)


@cli.command()
@cli_args.HOST
@cli_args.PORT
def run(host, port):
    _run_server(host, port)


if __name__ == '__main__':
    cli()
