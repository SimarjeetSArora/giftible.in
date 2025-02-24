from database import engine, Base
import models  # Ensure models are imported!

print("🚀 Dropping existing tables (if any)...")
Base.metadata.drop_all(bind=engine)

print("✅ Creating new tables...")
Base.metadata.create_all(bind=engine)

# Debugging: Print registered tables
print("📜 Registered tables:", Base.metadata.tables.keys())

if not Base.metadata.tables:
    print("❌ No tables detected! Check if models are defined properly.")
