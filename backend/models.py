from extension import db

class Transaction(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    type=db.Column(db.String(10))
    category=db.Column(db.String(50))
    amount=db.Column(db.Float)
    date=db.Column(db.String(20))
    description=db.Column(db.String(200))

    def to_dict(self):
        return {
            "id":self.id,
            "type":self.type,
            "category":self.category,
            "amount":self.amount,
            "date":self.date,
            "description":self.description
        }