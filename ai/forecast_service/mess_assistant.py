# ai/forecast_service/mess_assistant.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from meal_recommender_ai import generate_popular, compute_user_top

load_dotenv(dotenv_path='../../backend/config/config.env')
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.get_database("Mess")

def get_recommendations(user_email: str = None, sample_limit: int = 2000, debug: bool = False, **kwargs):
    menu_items = list(db.menuitems.find({}))
    global_orders = list(db.orders.find({}).sort("createdAt", -1).limit(sample_limit))

    popular = generate_popular(global_orders, menu_items, top_n=50)
    user_top = []

    if user_email:
        user_doc = db.users.find_one({"email": user_email}, {"_id": 1})
        user_id = user_doc["_id"] if user_doc else None

        user_orders = []
        if user_id:
            user_orders = list(db.orders.find({"user": user_id}).sort("createdAt", -1).limit(sample_limit))
        if not user_orders:
            user_orders = list(db.orders.find({"email": user_email}).sort("createdAt", -1).limit(sample_limit))

        if user_orders:
            user_top = compute_user_top(user_orders, menu_items, top_n=20)

    return {"popular": popular, "user": user_top}
