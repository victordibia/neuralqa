"""
Definitions of click options shared by several CLI commands.
"""
import click

SEARCH_INDEX_HOST = click.option("--index_host", "-h", metavar="INDEXHOST", default="127.0.0.1",
                                 help="The network address to connect to for search index on (default: 127.0.0.1). "
                                 "Use 0.0.0.0 to bind to all addresses if you want to access the tracking "
                                 "server from other machines.")

SEARCH_INDEX_PORT = click.option("--port", "-p", default=5000,
                                 help="The port to listen on (default: 5000).")

HOST = click.option("--host", "-h", metavar="HOST", default="127.0.0.1",
                    help="The network address to listen on (default: 127.0.0.1). "
                         "Use 0.0.0.0 to bind to all addresses if you want to access the tracking "
                         "server from other machines.")

PORT = click.option("--port", "-p", default=5000,
                    help="The port to listen on (default: 5000).")

# We use None to disambiguate manually selecting "4"
WORKERS = click.option("--workers", "-w", default=None,
                       help="Number of gunicorn worker processes to handle requests (default: 4).")
