"""
Definitions of click options shared by several CLI commands.
"""
import click

INDEX_HOST = click.option("--index-host", "-ih", metavar="INDEXHOST", default="127.0.0.1",
                          help="The network address to connect to for search index on (default: 127.0.0.1). "
                          "Use 0.0.0.0 to bind to all addresses if you want to access the tracking "
                          "server from other machines.")

INDEX_PORT = click.option("--index-port", "-ip", default=9200,
                          help="The port to listen on for search index (default: 9200).")

HOST = click.option("--host", "-h", metavar="HOST", default="127.0.0.1",
                    help="The network address to listen on (default: 127.0.0.1). "
                         "Use 0.0.0.0 to bind to all addresses if you want to access the tracking "
                         "server from other machines.")

PORT = click.option("--port", "-p", default=5000,
                    help="The port to listen on (default: 5000).")

# We use None to disambiguate manually selecting "4"
WORKERS = click.option("--workers", "-w", default=None,
                       help="Number of gunicorn worker processes to handle requests (default: 4).")

SERVE_UI = click.option("--serve-ui", is_flag=True, default=True,
                        help="If specified as false, neuralqa will not serve a ui, just a set of api end points. ")

CONFIG_PATH = click.option("--config-path", "-c", metavar="CONFIGPATH", default=None,
                           help="Path to a yaml file containing config for neuralqa. "
                           "If none is provided, the default config.yaml is copied to the current directory.")
