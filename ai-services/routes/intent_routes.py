from flask import Blueprint
from flask import request
from flask import jsonify

from services.intent_service import (
    classify_intent
)
from utils.logger import get_logger

intent_bp = Blueprint(
    "intent",
    __name__,
    url_prefix="/intent"
)

logger = get_logger('intent_routes')

@intent_bp.route(
    "/predict",
    methods=["POST"]
)
def predict():
    logger.info('Intent prediction request received')
    data = request.get_json()

    text = data.get("text")

    if not text:
        logger.warn('No text provided for intent prediction')
        return jsonify({
            "success": False,
            "message": "Text is required"
        }), 400

    logger.info('Predicting intent', { textLength: len(text) })
    intent = classify_intent(text)
    logger.info('Intent predicted', { intent: intent })
    return jsonify({
        "success": True,
        "intent": intent
    })