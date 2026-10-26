import os
import sys
import json
import yaml
import requests
import argparse
import logging
from datetime import datetime

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

def extract_metadata(schema_name):
    """
    Simulates extracting metadata from a local PostgreSQL database.
    In a real scenario, this uses psycopg2 to query information_schema.
    """
    logger.info(f"Connecting to PostgreSQL source (schema: {schema_name})...")
    logger.info("Extracting tables, views, and AI embedding targets...")
    
    # Generate the exact payload expected by the Hatchable ingest endpoint
    payload = {
        "source_system": "postgresql",
        "assets": [
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
        ],
        "relationships": [
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
    }
    return payload

def push_to_kairos(endpoint, token, payload):
    """Pushes the metadata graph to the Kairos control plane."""
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
            logger.info(f"Assets Upserted: {result.get('assets_upserted', 0)}")
            logger.info(f"Relationships Upserted: {result.get('relationships_upserted', 0)}")
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
    endpoint = config.get("destination", {}).get("config", {}).get("endpoint")
    token = config.get("destination", {}).get("config", {}).get("token")

    # 2. Extract
    metadata_payload = extract_metadata(schema)

    # 3. Push
    push_to_kairos(endpoint, token, metadata_payload)