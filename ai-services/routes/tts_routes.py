from flask import Blueprint
from flask import request
from flask import jsonify
from flask import send_file

from services.tts_service import (
    text_to_speech
)

tts_bp = Blueprint(
    "tts",
    __name__,
    url_prefix="/tts"
)

@tts_bp.route(
    "/speak",
    methods=["POST"]
)
def speak():

    data = request.get_json()

    text = data.get("text")

    if not text:

        return jsonify({
            "success": False,
            "message": "Text is required"
        }), 400


    audio_buffer = text_to_speech(text)

    return send_file(
        audio_buffer,
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name="speech.mp3"
    )

