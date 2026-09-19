"""Fresh PostgreSQL database migration validation.

Tests initializing METRIX from scratch (revision 0 -> head) in an isolated schema,
proving that all migrations succeed on a clean PostgreSQL database without relying
on pre-existing tables or manual DDL.
"""
from pathlib import Path
import sys
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from app.core.config import settings

_BACKEND_DIR = Path(__file__).resolve().parents[2]


def run_fresh_migration_validation() -> bool:
    print("=== METRIX FRESH DATABASE MIGRATION VALIDATION ===")
    print("Connecting to target PostgreSQL engine...")

    engine = create_engine(settings.DATABASE_URL)
    test_schema = "fresh_migration_val"

    with engine.connect() as conn:
        print(f"1. Preparing clean, isolated schema '{test_schema}'...")
        conn.execute(text(f"DROP SCHEMA IF EXISTS {test_schema} CASCADE;"))
        conn.execute(text(f"CREATE SCHEMA {test_schema};"))
        conn.commit()

    try:
        print(f"2. Running 'alembic upgrade head' targeting clean schema '{test_schema}'...")
        alembic_cfg = Config(str(_BACKEND_DIR / "alembic.ini"))
        alembic_cfg.set_main_option("script_location", str(_BACKEND_DIR / "alembic"))

        with engine.connect() as conn:
            conn.execute(text(f"SET search_path TO {test_schema};"))
            conn.commit()

            alembic_cfg.attributes["connection"] = conn
            alembic_cfg.attributes["version_table_schema"] = test_schema
            command.upgrade(alembic_cfg, "head")

        print("3. Validating created tables in fresh schema...")
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                f"WHERE table_schema = '{test_schema}' ORDER BY table_name;"
            ))
            tables = [row[0] for row in result]
            print(f"Found {len(tables)} tables: {tables}")

            expected_tables = {
                "alembic_version",
                "users",
                "stakeholder_profiles",
                "instruments",
                "verification_applications",
                "application_status_histories",
                "inspections",
                "inspection_observations",
                "certificates",
                "notifications",
            }
            missing = expected_tables - set(tables)
            if missing:
                print(f"FAILED: Missing expected tables: {missing}")
                return False

            ver_res = conn.execute(text(f"SELECT version_num FROM {test_schema}.alembic_version;"))
            current_rev = ver_res.scalar()
            print(f"Fresh database version_num: {current_rev}")
            if current_rev != "0004_notifications":
                print(f"FAILED: Expected revision '0004_notifications', got '{current_rev}'")
                return False

        print("SUCCESS: Fresh PostgreSQL migration initialized all tables and types from zero state cleanly!")
        return True

    finally:
        print(f"4. Cleaning up test schema '{test_schema}'...")
        with engine.connect() as conn:
            conn.execute(text(f"DROP SCHEMA IF EXISTS {test_schema} CASCADE;"))
            conn.commit()
        print("Cleanup complete.")


if __name__ == "__main__":
    success = run_fresh_migration_validation()
    sys.exit(0 if success else 1)
