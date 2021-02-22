
import uvicorn
import os


def launch_server(host="0.0.0.0", port=5000, workers=1, reload=False):
    uvicorn.run("neuralqa.server.serve:app", host=host, port=port, workers=workers,
                log_level="info", reload=reload)


if __name__ == "__main__":
    launch_server()
