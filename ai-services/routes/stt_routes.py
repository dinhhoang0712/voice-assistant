from flask import Blueprint
from flask import request
from flask import jsonify

from services.stt_service import (
    speech_to_text
)
from utils.logger import get_logger

stt_bp = Blueprint(
    "stt",
    __name__,
    url_prefix="/stt"
)

logger = get_logger('stt_routes')

@stt_bp.route(
    "/transcribe",
    methods=["POST"]
)
def transcribe():
    logger.info('Transcribe request received')

    if "audio" not in request.files:
        logger.warn('No audio file provided')
        return jsonify({
            "success": False,
            "message": "Audio file is required"
        }), 400

    audio = request.files["audio"]
    logger.info('Processing audio file', { filename: audio.filename })

    text = speech_to_text(audio)
    logger.info('Transcription completed', { text: text, textLength: len(text) })
    return jsonify({
        "success": True,
        "text": text
    })