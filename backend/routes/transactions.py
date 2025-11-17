from flask import Blueprint, jsonify, request
from extension import db
from models import Transaction
from ai.categorizer import predict_category
from ai.anomalies import detect_anomaly
from ai.semantic_search import semantic_search
from ai.insights import generate_insights

transaction_routes = Blueprint('transaction_routes', __name__)

@transaction_routes.route('/', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([t.to_dict() for t in transactions])

@transaction_routes.route('/', methods=['POST'])
def add_transaction():
    data = request.json

    # Keep original values (default behavior preserved)
    user_type = data.get('type', 'expense')
    user_category = data.get('category')  # can be None if not sent
    amount = float(data.get('amount', 0))
    date = data.get('date', '')
    description = data.get('description', '')

    # --- AI CATEGORIZATION ---
    # If user did NOT provide a category → use AI
    if user_category is None or user_category.strip() == "":
        predicted_category = predict_category(description)
        final_category = predicted_category
    else:
        final_category = user_category   # respect user input

    # --- ANOMALY DETECTION ---
    # Get previous amounts
    previous_amounts = [t.amount for t in Transaction.query.all()]
    previous_amounts.append(amount)
    anomaly_flag = detect_anomaly(previous_amounts)

    # --- Create Transaction ---
    new_transaction = Transaction(
        type=user_type,
        category=final_category,
        amount=amount,
        date=date,
        description=description
    )

    db.session.add(new_transaction)
    db.session.commit()

    # --- Response ---
    response = new_transaction.to_dict()

    # Add AI metadata (non-breaking additions)
    response["ai_category"] = final_category if user_category is None else None
    response["anomaly"] = bool(anomaly_flag)

    return jsonify(response), 201

@transaction_routes.route('/<int:id>', methods=['DELETE'])
@transaction_routes.route('/<int:id>/', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get(id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    db.session.delete(transaction)
    db.session.commit()
    return jsonify({"message": "Transaction deleted successfully"}), 200

@transaction_routes.route('/ai/insights', methods=['GET'])
def ai_insights():
    tx = Transaction.query.all()
    data = [t.to_dict() for t in tx]
    summary = generate_insights(data)
    return jsonify({"summary": summary})

@transaction_routes.route('/ai/search', methods=['POST'])
def ai_search():
    query = request.json.get("query", "")
    tx = Transaction.query.all()
    matches = semantic_search(query, tx)
    return jsonify([t.to_dict() for t in matches])