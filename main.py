import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


load_dotenv()

FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
CREDENTIALS_FILE = os.getenv(
    "GOOGLE_SERVICE_ACCOUNT_FILE",
    "service-account.json",
)

SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly"
]


if not FOLDER_ID:
    raise RuntimeError(
        "GOOGLE_DRIVE_FOLDER_ID is missing from the .env file."
    )

if not Path(CREDENTIALS_FILE).exists():
    raise RuntimeError(
        f"Credentials file not found: {CREDENTIALS_FILE}"
    )


credentials = service_account.Credentials.from_service_account_file(
    CREDENTIALS_FILE,
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


@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Google Drive Knowledge API is running.",
    }


@app.get("/files")
def list_drive_files():
    """
    List files directly inside the configured Google Drive folder.
    """

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
            status_code=500,
            detail=f"Google Drive API error: {error}",
        ) from error