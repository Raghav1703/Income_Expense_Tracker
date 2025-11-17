def generate_insights(data):
    # Safe fallback, no OpenAI/Groq usage
    if not data:
        return "No transactions yet to analyze."

    total_income = sum(float(t["amount"]) for t in data if t["type"] == "income")
    total_expense = sum(float(t["amount"]) for t in data if t["type"] == "expense")
    balance = total_income - total_expense

    return (
        f"Income: ₹{total_income}, Expenses: ₹{total_expense}, Balance: ₹{balance}. "
        "AI insights are disabled for now (no OpenAI/Groq key configured)."
    )