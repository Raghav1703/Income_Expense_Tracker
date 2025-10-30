from flask import Flask
from flask_cors import CORS
from extension import db
from routes.transactions import transaction_routes

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budgetwise.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

app.register_blueprint(transaction_routes, url_prefix='/api/transactions')

@app.route('/')
def home():
    return "BudgetWise AI backend is running"

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
