"""
Definitions of click options shared by several CLI commands.
"""
import click


HOST = click.option("--host", "-h", default="127.0.0.1",
                    help="The network address to listen on (default: 127.0.0.1). "
                         "Use 0.0.0.0 to bind to all addresses if you want to access the tracking "
                         "server from other machines.")

PORT = click.option("--port", "-p", default=5000,
                    help="The port to listen on (default: 5000).")


WORKERS = click.option("--workers", "-w", default=1,
                       help="Number of uviicorn worker processes to handle requests (default: 1).")

MAX_DOCS = click.option("--max-docs", "-md", default=2000,
                       help="Maximum number of sample documents to import when loading sample data into local index")                       

CONFIG_PATH = click.option("--config-path", "-cp", default=None,
                           help="Path to a yaml file containing config for neuralqa. "
                           "If none is provided, the default config.yaml is copied to the current directory.")
