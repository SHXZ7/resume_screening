"""
Entrypoint for Vercel and ASGI servers.
Exposes the FastAPI instance from server.py.
"""
from server import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

