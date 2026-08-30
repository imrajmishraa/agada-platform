from fastapi import FastAPI
import uvicorn
import os

app = FastAPI(title="Agada Analytics Service", version="1.0.0")

@app.get("/healthz")
async def health():
    return {"status": "ok", "service": "analytics-service"}

@app.get("/")
async def root():
    return {"message": "Analytics Service is running"}

# TODO: Add analytics endpoints later

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3010))
    uvicorn.run(app, host="0.0.0.0", port=port)