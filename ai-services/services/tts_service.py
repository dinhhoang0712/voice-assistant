from providers.tts_provider import (
    generate_speech
)

def text_to_speech(text):

    audio_buffer = generate_speech(text)

    return audio_buffer