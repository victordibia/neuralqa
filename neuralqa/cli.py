import click
from neuralqa.server import _run_server
from neuralqa.utils import cli_args
from neuralqa.utils import import_case_data, ConfigParser


@click.group()
@click.version_option()
def cli():
    pass


@cli.command()
@cli_args.HOST
@cli_args.PORT
@cli_args.INDEX_HOST
@cli_args.INDEX_PORT
@cli_args.CONFIG_PATH
def test(host, port, index_host, index_port, config_path):
    config = ConfigParser(config_path)
    # import_case_data()


@cli.command()
@cli_args.HOST
@cli_args.PORT
@cli_args.INDEX_HOST
@cli_args.INDEX_PORT
@cli_args.CONFIG_PATH
def ui(host, port, index_host, index_port, config_path):
    _run_server(host, port, index_host, index_port, config_path)


if __name__ == '__main__':
    cli()
