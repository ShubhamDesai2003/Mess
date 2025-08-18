# ai/forecast_service/mess_assistant.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from meal_recommender_ai import generate_popular, compute_user_top, extract_dishes_from_order

load_dotenv(dotenv_path='../../backend/config/config.env')
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.get_database("Mess")

def get_recommendations(user_email: str = None, sample_limit: int = 2000, debug: bool = False, **kwargs):
    """
    Returns dict: { "popular": [...], "user": [...] }
    - popular: top dishes across sampled recent orders
    - user: top dishes for requested user (based on their own orders)
    Extra kwargs accepted and ignored (backwards compatibility).
    """

    # 1. load menu items (used for mapping)
    menu_items = list(db.menuitems.find({}))
    if debug:
        print(f"[mess_assistant] Menu items loaded: {len(menu_items)}")

    # 2. load recent global orders (sample)
    global_orders = list(db.orders.find({}).sort("createdAt", -1).limit(sample_limit))
    if debug:
        print(f"[mess_assistant] Global orders sample: {len(global_orders)}")

    popular = generate_popular(global_orders, menu_items, top_n=50)

    user_top = []
    if user_email:
        # look up user id
        user_doc = db.users.find_one({"email": user_email}, {"_id": 1})
        user_id = user_doc["_id"] if user_doc else None
        if debug:
            print(f"[mess_assistant] user_doc: {user_doc}")

        # fetch orders for this user (prefer user ObjectId field)
        user_orders = []
        if user_id:
            user_orders = list(db.orders.find({"user": user_id}).sort("createdAt", -1).limit(sample_limit))
        if not user_orders:
            # fallback: some orders may store email in order doc
            user_orders = list(db.orders.find({"email": user_email}).sort("createdAt", -1).limit(sample_limit))

        if debug:
            print(f"[mess_assistant] user_orders count: {len(user_orders)}")
            if len(user_orders) > 0:
                print("[mess_assistant] sample user order:", user_orders[0])

        if user_orders:
            user_top = compute_user_top(user_orders, menu_items, top_n=20)
        else:
            user_top = []

    # return both lists
    return {"popular": popular, "user": user_top}
