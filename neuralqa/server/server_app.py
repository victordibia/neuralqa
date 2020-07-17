
import uvicorn
import os


def launch_server(host="127.0.0.1", port=5000, workers=1):
    uvicorn.run("neuralqa.server.serve:app", host=host, port=port, workers=workers,
                log_level="info")


if __name__ == "__main__":
    launch_server()
