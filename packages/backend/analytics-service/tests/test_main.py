import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "analytics-service"}