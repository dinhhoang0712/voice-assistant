from providers.intent_provider import (
    predict_intent
)
from utils.logger import get_logger

logger = get_logger('intent_service')

def classify_intent(text):
    logger.info('Classifying intent', { textLength: len(text) })
    intent = predict_intent(text)
    logger.info('Intent classified', { intent: intent })
    return intent