"""
File storage service.
- Validates file type and size.
- Computes SHA-256.
- Saves file to uploads/<application_id>/<filename>.
- Returns stored relative path and hash.
"""
import hashlib
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from backend.config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024   # 10 MB

def _compute_sha256(file_path: Path) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

async def save_upload(
    file: UploadFile,
    application_id: str,
) -> dict:
    """
    Saves one uploaded file.
    Returns {"stored_path": str, "sha256": str, "file_size_bytes": int, "mime_type": str}
    Raises HTTPException on validation failure.
    """
    # MIME check
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. "
                   f"Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
        )

    # Save to temp location first so we can check size
    dest_dir = Path(settings.upload_dir) / application_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / file.filename

    size = 0
    with open(dest_path, "wb") as out:
        while chunk := await file.read(65536):
            size += len(chunk)
            if size > MAX_FILE_SIZE_BYTES:
                dest_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=400,
                    detail=f"File '{file.filename}' exceeds 10 MB limit."
                )
            out.write(chunk)

    sha = _compute_sha256(dest_path)
    stored_path = str(Path(application_id) / file.filename)  # relative

    return {
        "stored_path": stored_path,
        "sha256": sha,
        "file_size_bytes": size,
        "mime_type": file.content_type,
    }
