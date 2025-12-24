"""
Main FastAPI application for Order Form Extraction Workflow.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import settings, BASE_DIR
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="Order Form Extraction API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)


# # # Root Endpoint
# # @app.get("/")
# # async def root():
# #     """Root endpoint."""
# #     return {
# #         "message": "Order Form Extraction API",
# #         "version": settings.api_version,
# #         "docs": "/docs"
# #     }


# Path to static files directory
static_dir = BASE_DIR / "static" / "dist" / "frontend" / "browser"
Static_dir = str(static_dir)

# Mount static assets (CSS, JS, images, etc.) - but NOT at root to avoid conflicts
if os.path.exists(static_dir):
    # Mount static files for assets, but let the catch-all route handle HTML
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    # Mount other static files (JS, CSS from build)
    static_files_dir = static_dir
    for item in os.listdir(static_dir):
        item_path = os.path.join(static_dir, item)
        if os.path.isfile(item_path) and not item.endswith('.html'):
            # These will be served by the catch-all route logic below
            pass


# Serve Angular app for root and all non-API routes
@app.get("/")
async def serve_angular_app():
    """Serve Angular app for root route."""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"error": "Frontend not found. Please build the Angular app."}

# Catch-all route for Angular client-side routing (must be last)
@app.get("/{full_path:path}")
async def serve_angular_app_routes(full_path: str):
    """
    Serve Angular app for all routes that don't match API endpoints.
    This handles Angular's client-side routing.
    """
    # Don't serve Angular for API routes, docs, or static assets
    if (full_path.startswith("api") or 
        full_path.startswith("docs") or 
        full_path.startswith("openapi.json")):
        return {"error": "Not found"}
    
    # Check if it's a static file request (JS, CSS, etc.)
    file_path = os.path.join(static_dir, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Serve index.html for all other routes (Angular will handle routing)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"error": "Frontend not found. Please build the Angular app."}
