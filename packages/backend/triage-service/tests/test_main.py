import sys
from pathlib import Path

# Add the parent directory (where the src folder is) to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "triage-service"}  # adjust service name