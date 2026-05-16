from flask import Blueprint
from flask import request
from flask import jsonify
from flask import send_file

from services.tts_service import (
    text_to_speech
)
from utils.logger import get_logger

tts_bp = Blueprint(
    "tts",
    __name__,
    url_prefix="/tts"
)

logger = get_logger('tts_routes')

@tts_bp.route(
    "/speak",
    methods=["POST"]
)
def speak():
    logger.info('TTS request received')
    data = request.get_json()

    text = data.get("text")

    if not text:
        logger.warn('No text provided for TTS')
        return jsonify({
            "success": False,
            "message": "Text is required"
        }), 400

    logger.info('Generating speech', { textLength: len(text) })
    audio_buffer = text_to_speech(text)
    logger.info('Speech generated successfully', { audioSize: len(audio_buffer.getvalue()) if hasattr(audio_buffer, 'getvalue') else 'unknown' })

    return send_file(
        audio_buffer,
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name="speech.mp3"
    )

