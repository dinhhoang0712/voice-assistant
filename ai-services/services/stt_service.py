import os
import uuid

from providers.whisper_provider import transcribe_audio
from utils.logger import get_logger

logger = get_logger('stt_service')


def speech_to_text(audio_file):
    logger.info('Starting speech to text conversion')
    # tạo folder temp nếu chưa có
    os.makedirs("temp", exist_ok=True)

    extension = audio_file.filename.split(".")[-1]

    file_name = f"{uuid.uuid4()}.{extension}"

    temp_path = os.path.join(
        "temp",
        file_name
    )

    audio_file.save(temp_path)
    logger.info('Audio file saved', { tempPath: temp_path })

    try:
        logger.info('Transcribing audio')
        text = transcribe_audio(temp_path)
        logger.info('Transcription completed', { text: text, textLength: len(text) })
        return text

    except Exception as e:
        logger.error('Transcription failed', { error: str(e) })
        raise
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info('Temporary file removed', { tempPath: temp_path })