from flask import Blueprint, jsonify, request
from extension import db
from models import Transaction

transaction_routes = Blueprint('transaction_routes', __name__)

@transaction_routes.route('/', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([t.to_dict() for t in transactions])

@transaction_routes.route('/', methods=['POST'])
def add_transaction():
    data = request.json
    new_transaction = Transaction(
        type=data.get('type', 'expense'),
        category=data.get('category', 'Uncategorized'),
        amount=float(data.get('amount', 0)),
        date=data.get('date', ''),
        description=data.get('description', '')
    )
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify(new_transaction.to_dict()), 201

@transaction_routes.route('/<int:id>', methods=['DELETE'])
@transaction_routes.route('/<int:id>/', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get(id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    db.session.delete(transaction)
    db.session.commit()
    return jsonify({"message": "Transaction deleted successfully"}), 200
