from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import pandas as pd
from collections import Counter
import os
import random
from datetime import datetime # Import datetime for current day

app = Flask(__name__)
CORS(app)

# --- Define file paths for your data ---
MENU_ITEMS_FILE = "Mess.menuitems.json"
TIMES_FILE = "Mess.times.json"
STUDENT_ORDERS_FILE = "student_orders.json"

# Global variables to store loaded data
df_menu_items = None
df_times = None
df_student_orders = None
all_available_food_items = set() # To store all unique food items from the menu

def load_all_data():
    """
    Loads all necessary data.
    This function runs only once when the Flask server starts.
    """
    print("--- load_all_data() function started ---")

    global df_menu_items, df_times, df_student_orders, all_available_food_items

    print("Loading data for Flask server...")
    data = {}

    # Load Menu Items
    if os.path.exists(MENU_ITEMS_FILE):
        with open(MENU_ITEMS_FILE, 'r', encoding='utf-8') as f:
            menu_items_data = json.load(f)
        df_menu_items = pd.DataFrame(menu_items_data)
        df_menu_items = df_menu_items.drop(columns=['_id'], errors='ignore')
        print(f"Loaded {MENU_ITEMS_FILE}")
    else:
        print(f"Error: {MENU_ITEMS_FILE} not found. Server cannot start without it.")
        exit()

    # Load Meal Times
    if os.path.exists(TIMES_FILE):
        with open(TIMES_FILE, 'r', encoding='utf-8') as f:
            times_data = json.load(f)
        df_times = pd.DataFrame(times_data)
        df_times = df_times.drop(columns=['_id'], errors='ignore')
        print(f"Loaded {TIMES_FILE}")
    else:
        print(f"Error: {TIMES_FILE} not found. Server cannot start without it.")
        exit()

    # Load Student Orders (with ratings)
    if os.path.exists(STUDENT_ORDERS_FILE):
        with open(STUDENT_ORDERS_FILE, 'r', encoding='utf-8') as f:
            student_orders_data = json.load(f)
        df_student_orders = pd.DataFrame(student_orders_data)
        df_student_orders['date'] = pd.to_datetime(df_student_orders['date'])
        print(f"Loaded {STUDENT_ORDERS_FILE}")
    else:
        print(f"Error: {STUDENT_ORDERS_FILE} not found. Server cannot start without it.")
        exit()

    print("\nAll data loaded successfully for Flask server.")

    print("Attempting to populate all_available_food_items...")
    for col in ['breakfast', 'lunch', 'dinner']:
        if col in df_menu_items.columns:
            for item_group in df_menu_items[col].dropna().tolist():
                all_available_food_items.update([item.strip() for item in item_group.split(',')])
    print(f"Found {len(all_available_food_items)} unique food items in the menu.")

# --- API Endpoint for Recommendations ---
@app.route('/recommend', methods=['POST'])
def get_recommendations():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    req_data = request.get_json()
    student_id = req_data.get('student_id')

    if not student_id:
        return jsonify({"error": "student_id is required"}), 400

    student_id = student_id.upper()

    if student_id not in df_student_orders['student_id'].unique():
        return jsonify({"error": f"Student ID '{student_id}' not found in order history."}), 404

    student_specific_orders = df_student_orders[df_student_orders['student_id'] == student_id]

    item_data = {}
    for _, row in student_specific_orders.iterrows():
        food_items_str = row['food_item']
        rating = row['rating']
        individual_items = [item.strip() for item in food_items_str.split(',')]

        for item in individual_items:
            if item not in item_data:
                item_data[item] = {'count': 0, 'total_rating': 0, 'avg_rating': 0.0}
            item_data[item]['count'] += 1
            item_data[item]['total_rating'] += rating
            item_data[item]['avg_rating'] = item_data[item]['total_rating'] / item_data[item]['count']

    recommendations_with_scores = []
    default_rating = 3.0

    for food_item in all_available_food_items:
        purchase_count = item_data.get(food_item, {}).get('count', 0)
        average_rating = item_data.get(food_item, {}).get('avg_rating', default_rating)

        score = (purchase_count * 0.6) + (average_rating * 0.4)
        recommendations_with_scores.append({"food_item": food_item, "score": score})

    recommendations_with_scores.sort(key=lambda x: x["score"], reverse=True)

    top_n_recommendations = recommendations_with_scores[:3]

    formatted_recommendations = [
        {"food_item": rec["food_item"], "predicted_rating": rec["score"]}
        for rec in top_n_recommendations
    ]

    return jsonify({"student_id": student_id, "recommendations": formatted_recommendations})

# --- API Endpoint for Analysis ---
@app.route('/analyze/<student_id>', methods=['GET'])
def analyze_student_api(student_id):
    student_id = student_id.upper()
    month_param = request.args.get('month')
    year_param = request.args.get('year')

    print(f"DEBUG: Analyze request for student_id: {student_id}, month: {month_param}, year: {year_param}")

    student_history = df_student_orders[df_student_orders['student_id'] == student_id].copy()
    print(f"DEBUG: Initial student_history count for {student_id}: {len(student_history)}")

    if student_history.empty:
        return jsonify({"error": f"Student ID '{student_id}' not found in the order history."}), 404

    if month_param:
        try:
            month_num = int(month_param)
            student_history = student_history[student_history['date'].dt.month == month_num]
            print(f"DEBUG: After month filter ({month_num}), student_history count: {len(student_history)}")
        except ValueError:
            return jsonify({"error": "Invalid month parameter. Must be a number."}), 400
    if year_param:
        try:
            year_num = int(year_param)
            student_history = student_history[student_history['date'].dt.year == year_num]
            print(f"DEBUG: After year filter ({year_num}), student_history count: {len(student_history)}")
        except ValueError:
            return jsonify({"error": "Invalid year parameter. Must be a number."}), 400

    if student_history.empty:
        return jsonify({"student_id": student_id, "message": f"No orders found for {student_id} in the specified period."}), 200

    student_history = student_history.sort_values(by='date')

    daily_orders = student_history.groupby(['date', 'day', 'meal_type'])['food_item'].apply(lambda x: ', '.join(x)).reset_index()
    daily_orders_list = daily_orders.to_dict(orient='records')

    all_food_items_ordered = []
    for items_str in student_history['food_item']:
        individual_items = [item.strip() for item in items_str.split(',')]
        all_food_items_ordered.extend(individual_items)
    food_frequency = Counter(all_food_items_ordered)
    most_common_foods = food_frequency.most_common()

    for order in daily_orders_list:
        order['date'] = order['date'].strftime('%Y-%m-%d')

    return jsonify({
        "student_id": student_id,
        "total_orders_in_period": len(student_history),
        "daily_orders": daily_orders_list,
        "food_frequency": most_common_foods
    }), 200

# --- NEW API Endpoint for Favorite Meal Availability ---
@app.route('/check_favorite_meal_availability/<student_id>', methods=['GET'])
def check_favorite_meal_availability(student_id):
    student_id = student_id.upper()
    
    # Get day from query parameter, or default to current day
    day_param = request.args.get('day', datetime.now().strftime('%A').lower())

    if student_id not in df_student_orders['student_id'].unique():
        return jsonify({"error": f"Student ID '{student_id}' not found."}), 404

    # 1. Determine student's favorite meals (top 3 highest-rated from their history)
    student_specific_orders = df_student_orders[df_student_orders['student_id'] == student_id].copy()
    
    # If no orders, no favorites
    if student_specific_orders.empty:
        return jsonify({"student_id": student_id, "message": "No order history to determine favorites."}), 200

    item_data = {}
    for _, row in student_specific_orders.iterrows():
        food_items_str = row['food_item']
        rating = row['rating']
        individual_items = [item.strip() for item in food_items_str.split(',')]

        for item in individual_items:
            if item not in item_data:
                item_data[item] = {'count': 0, 'total_rating': 0, 'avg_rating': 0.0}
            item_data[item]['count'] += 1
            item_data[item]['total_rating'] += rating
            item_data[item]['avg_rating'] = item_data[item]['total_rating'] / item_data[item]['count']

    favorite_candidates = []
    for item, data in item_data.items():
        # Use a simplified score for favorites: prioritize high rating and then count
        # This is slightly different from the recommendation score, focusing on past enjoyment
        favorite_score = data['avg_rating'] * 0.7 + data['count'] * 0.3 # Higher weight on rating for 'favorite'
        favorite_candidates.append({"food_item": item, "score": favorite_score})
    
    favorite_candidates.sort(key=lambda x: x["score"], reverse=True)
    top_favorite_items = [item['food_item'] for item in favorite_candidates[:3]] # Top 3 favorites

    # 2. Get today's menu
    today_menu_row = df_menu_items[df_menu_items['day'] == day_param].iloc[0] if not df_menu_items[df_menu_items['day'] == day_param].empty else None

    if today_menu_row is None:
        return jsonify({"student_id": student_id, "message": f"No menu found for {day_param}."}), 200

    today_menu_items = set()
    for meal_type in ['breakfast', 'lunch', 'dinner']:
        if pd.notna(today_menu_row.get(meal_type)):
            today_menu_items.update([item.strip() for item in today_menu_row[meal_type].split(',')])

    # 3. Check for overlap
    available_favorites = [item for item in top_favorite_items if item in today_menu_items]

    if available_favorites:
        message = f"🎉 Great news for {student_id}! Your favorite meal(s) "
        message += ", ".join(available_favorites)
        message += f" { 'is' if len(available_favorites) == 1 else 'are' } available on {day_param.capitalize()}!"
        return jsonify({"student_id": student_id, "status": "available", "favorite_meals": available_favorites, "message": message}), 200
    else:
        return jsonify({"student_id": student_id, "status": "not_available", "message": f"No favorite meals for {student_id} are on the menu for {day_param.capitalize()}."}), 200


# --- Run the Flask Server ---
if __name__ == '__main__':
    load_all_data()
    app.run(debug=True, host='0.0.0.0', port=5000)
