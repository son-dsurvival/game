import json
import os
import secrets
from fastapi import (
    Depends,
    FastAPI,
    Header,
    HTTPException,
)
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
GOOGLE_SERVICE_ACCOUNT_JSON = os.getenv(
    "GOOGLE_SERVICE_ACCOUNT_JSON"
)
ACTION_API_KEY = os.getenv("ACTION_API_KEY")

SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly"
]


if not FOLDER_ID:
    raise RuntimeError(
        "GOOGLE_DRIVE_FOLDER_ID environment variable is missing."
    )

if not GOOGLE_SERVICE_ACCOUNT_JSON:
    raise RuntimeError(
        "GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing."
    )

if not ACTION_API_KEY:
    raise RuntimeError(
        "ACTION_API_KEY environment variable is missing."
    )


try:
    service_account_info = json.loads(
        GOOGLE_SERVICE_ACCOUNT_JSON
    )
except json.JSONDecodeError as error:
    raise RuntimeError(
        "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON."
    ) from error


credentials = service_account.Credentials.from_service_account_info(
    service_account_info,
    scopes=SCOPES,
)

drive_service = build(
    "drive",
    "v3",
    credentials=credentials,
    cache_discovery=False,
)


app = FastAPI(
    title="Google Drive Knowledge API",
    version="1.0.0",
)


def verify_api_key(
    authorization: str | None = Header(default=None),
) -> None:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is missing.",
        )

    scheme, _, supplied_key = authorization.partition(" ")

    if (
        scheme.lower() != "bearer"
        or not supplied_key
        or not secrets.compare_digest(supplied_key, ACTION_API_KEY)
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid API key.",
        )

@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Google Drive Knowledge API is running.",
    }


@app.get("/files")
def list_drive_files(
    _: None = Depends(verify_api_key),
):
    try:
        query = f"'{FOLDER_ID}' in parents and trashed = false"

        response = (
            drive_service.files()
            .list(
                q=query,
                spaces="drive",
                pageSize=100,
                fields=(
                    "files("
                    "id,"
                    "name,"
                    "mimeType,"
                    "modifiedTime,"
                    "webViewLink"
                    ")"
                ),
            )
            .execute()
        )

        files = response.get("files", [])

        return {
            "folder_id": FOLDER_ID,
            "count": len(files),
            "files": files,
        }

    except HttpError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Google Drive API error: {error}",
        ) from error
