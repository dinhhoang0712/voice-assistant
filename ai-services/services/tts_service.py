
from providers.tts_provider import (
    generate_speech
)
from utils.logger import get_logger

logger = get_logger('tts_service')

def text_to_speech(text):
    logger.info('Starting text to speech conversion', { textLength: len(text) })
    audio_buffer = generate_speech(text)
    logger.info('Speech generation completed')
    return audio_buffer
