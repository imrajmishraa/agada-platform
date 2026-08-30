import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_triage_endpoint():
    """Test the triage endpoint"""
    test_data = {
        "patient_id": "test_patient",
        "symptoms": ["fever", "cough"],
        "vital_signs": {
            "temperature": 101.5,
            "heart_rate": 90
        }
    }
    response = client.post("/triage", json=test_data)
    assert response.status_code in [200, 201]
    # Add more assertions based on expected response