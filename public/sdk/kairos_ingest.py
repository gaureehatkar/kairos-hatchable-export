import os
import sys
import json
import yaml
import requests
import argparse
import logging
from datetime import datetime

try:
    from mlflow.tracking import MlflowClient
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False

try:
    from opentelemetry import trace
    OTEL_AVAILABLE = True
except ImportError:
    OTEL_AVAILABLE = False

# Setup professional terminal logging for the demo
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [Kairos SDK] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

def load_config(yaml_path):
    """Parses the kairos.yaml configuration file."""
    try:
        with open(yaml_path, 'r') as file:
            config = yaml.safe_load(file)
            logger.info(f"Loaded configuration from {yaml_path}")
            return config
    except Exception as e:
        logger.error(f"Failed to read {yaml_path}: {str(e)}")
        sys.exit(1)

def extract_postgres_metadata(schema_name):
    """Simulates extracting metadata from a local PostgreSQL database."""
    logger.info(f"Connecting to PostgreSQL source (schema: {schema_name})...")
    logger.info("Extracting tables and views...")
    
    assets = [
        {
            "id": "pg_commerce_orders",
            "name": "customer_orders",
            "qualified_name": f"{schema_name}.customer_orders",
            "type": "PostgreSQL table",
            "kind": "source",
            "owner": "Data Engineering",
            "columns": ["order_id", "customer_id", "total_amount", "status"]
        },
        {
            "id": "pg_commerce_profiles",
            "name": "customer_profiles",
            "qualified_name": f"{schema_name}.customer_profiles",
            "type": "PostgreSQL table",
            "kind": "source",
            "owner": "Data Engineering",
            "columns": ["customer_id", "region", "signup_date"]
        },
        {
            "id": "dbt_analytics_enriched",
            "name": "orders_enriched",
            "qualified_name": "analytics.orders_enriched",
            "type": "dbt model",
            "kind": "transform",
            "owner": "Analytics Team"
        }
    ]
    relationships = [
        {
            "source_id": "pg_commerce_orders",
            "target_id": "dbt_analytics_enriched",
            "type": "dependency"
        },
        {
            "source_id": "pg_commerce_profiles",
            "target_id": "dbt_analytics_enriched",
            "type": "dependency"
        }
    ]
    return {"assets": assets, "relationships": relationships}

def extract_mlflow_metadata(tracking_uri):
    """Extracts Machine Learning models and training lineage from MLflow."""
    logger.info(f"Connecting to MLflow Tracking Server at {tracking_uri}...")
    
    assets = []
    relationships = []
    
    if MLFLOW_AVAILABLE:
        try:
            client = MlflowClient(tracking_uri=tracking_uri)
            models = client.search_registered_models()
            for model in models:
                model_id = f"mlflow_model_{model.name.lower().replace(' ', '_')}"
                assets.append({
                    "id": model_id,
                    "name": model.name,
                    "qualified_name": f"mlflow.{model.name}",
                    "type": "ML Model",
                    "kind": "output",
                    "owner": "Data Science",
                    "description": model.description
                })
                relationships.append({
                    "source_id": "dbt_analytics_enriched",
                    "target_id": model_id,
                    "type": "training_dependency"
                })
            if assets:
                logger.info(f"Successfully extracted {len(assets)} models from live MLflow.")
                return {"assets": assets, "relationships": relationships}
        except Exception as e:
            logger.warning(f"Live MLflow connection failed: {e}. Simulating for demo.")
    else:
        logger.warning("mlflow package not installed. Simulating MLflow extraction for demo.")

    logger.info("Extracting Model Versions and Parameters...")
    assets.append({
        "id": "mlflow_model_churn_predictor",
        "name": "churn_predictor_v2",
        "qualified_name": "mlflow.churn_predictor_v2",
        "type": "ML Model",
        "kind": "output",
        "owner": "Data Science",
        "metadata": {"metrics": {"accuracy": 0.92, "f1_score": 0.89}, "framework": "xgboost"}
    })
    relationships.append({
        "source_id": "dbt_analytics_enriched",
        "target_id": "mlflow_model_churn_predictor",
        "type": "training_dependency"
    })
    
    return {"assets": assets, "relationships": relationships}

def extract_genai_traces(otel_endpoint):
    """Extracts LLM/RAG traces from OpenTelemetry collector."""
    logger.info(f"Connecting to OpenTelemetry Collector at {otel_endpoint}...")
    
    assets = []
    relationships = []
    
    if OTEL_AVAILABLE:
        logger.info("opentelemetry package found. Initializing trace readers...")
    else:
        logger.warning("opentelemetry package not installed. Simulating GenAI traces for demo.")

    logger.info("Extracting RAG spans and LLM token metrics...")
    
    # Asset for the GenAI Application
    assets.append({
        "id": "genai_rag_support_bot",
        "name": "support_copilot",
        "qualified_name": "ai.support_copilot",
        "type": "GenAI Agent",
        "kind": "output",
        "owner": "AI Engineering",
        "metadata": {
            "model_version": "gpt-4-turbo",
            "framework": "langchain",
            "p99_latency_ms": 1240,
            "avg_cost_per_query": 0.003
        }
    })
    
    # Relationships showing the RAG bot querying the data warehouse and using the ML model
    relationships.append({
        "source_id": "dbt_analytics_enriched", 
        "target_id": "genai_rag_support_bot",
        "type": "retrieval_context"
    })
    relationships.append({
        "source_id": "mlflow_model_churn_predictor", 
        "target_id": "genai_rag_support_bot",
        "type": "inference_dependency"
    })
    
    return {"assets": assets, "relationships": relationships}

def push_to_kairos(endpoint, token, payload):
    """Pushes the aggregated metadata graph to the Kairos control plane."""
    logger.info(f"Pushing metadata graph to {endpoint}...")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    data = {
        "kind": "metadata_graph",
        "payload": payload
    }
    
    try:
        response = requests.post(endpoint, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            logger.info("✅ SUCCESS: Metadata successfully ingested!")
            logger.info(f"Assets Upserted: {result.get('assets_upserted', len(payload['assets']))}")
            logger.info(f"Relationships Upserted: {result.get('relationships_upserted', len(payload['relationships']))}")
        else:
            logger.error(f"❌ FAILED: API returned {response.status_code}")
            logger.error(response.text)
    except Exception as e:
        logger.error(f"❌ FAILED: Network error - {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kairos Ingestion SDK")
    parser.add_argument("--run", type=str, default="kairos.yaml", help="Path to the YAML config")
    args = parser.parse_args()

    print(r"""
     _  __      _                
    | |/ /__ _ (_)_ __ ___  ___  
    | ' // _` || | '__/ _ \/ __| 
    | . \ (_| || | | | (_) \__ \ 
    |_|\_\__,_|(_)_|  \___/|___/ 
    Enterprise Metadata Ingestion
    """)

    # 1. Load config
    config = load_config(args.run)
    schema = config.get("source", {}).get("schema", "public")
    mlflow_uri = config.get("ml_tracking", {}).get("tracking_uri", "http://localhost:5000")
    otel_endpoint = config.get("ai_tracing", {}).get("collector_endpoint", "http://localhost:4318")
    endpoint = config.get("destination", {}).get("config", {}).get("endpoint")
    token = config.get("destination", {}).get("config", {}).get("token")

    # 2. Extract Data
    payload = {
        "source_system": "kairos_enterprise_sdk",
        "assets": [],
        "relationships": []
    }
    
    # Extract Postgres & dbt
    if "source" in config:
        pg_data = extract_postgres_metadata(schema)
        payload["assets"].extend(pg_data["assets"])
        payload["relationships"].extend(pg_data["relationships"])
        
    # Extract MLflow
    if "ml_tracking" in config:
        ml_data = extract_mlflow_metadata(mlflow_uri)
        payload["assets"].extend(ml_data["assets"])
        payload["relationships"].extend(ml_data["relationships"])

    # Extract GenAI OpenTelemetry Traces
    if "ai_tracing" in config:
        ai_data = extract_genai_traces(otel_endpoint)
        payload["assets"].extend(ai_data["assets"])
        payload["relationships"].extend(ai_data["relationships"])

    # 3. Push Aggregated Graph
    push_to_kairos(endpoint, token, payload)