from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv(dotenv_path='../../backend/config/config.env')
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.get_database("Mess")

from forecast import get_weekly_forecast as fetch_weekly_forecast

def get_menu():
    return list(db.menuitems.find({}))

def get_ingredients():
    return list(db.ingredients.find({}))

def get_forecast_data():
    return fetch_weekly_forecast()  # no args

def forecast_ingredient_requirements():
    menu = get_menu()
    ingredients = get_ingredients()
    forecast = get_forecast_data()

    dish_counts = {}
    for weekday, counts in forecast.items():
        menu_for_day = next((m for m in menu if m["day"].lower() == weekday), None)
        if not menu_for_day:
            continue

        for meal_type in ['breakfast', 'lunch', 'dinner']:
            if meal_type not in counts:
                continue
            people = counts[meal_type]
            dishes = menu_for_day[meal_type].split(" with ")
            for dish in dishes:
                dish = dish.strip()
                if dish:
                    dish_counts[dish] = dish_counts.get(dish, 0) + people

    # ingredient_usage = {}
    # for ing in ingredients:
    #     related_dishes = [d.lower() for d in ing.get('dishes', [])]
    #     if 'all dishes' in related_dishes or 'most dishes' in related_dishes:
    #         estimated_total = sum(dish_counts.values())
    #     else:
    #         estimated_total = sum(
    #             dish_counts.get(dish, 0)
    #             for dish in dish_counts
    #             if dish.lower() in related_dishes
    #         )
    #     ingredient_usage[ing["name"]] = {
    #         "unit": ing.get("unit", ""),
    #         "estimated_quantity": estimated_total
    #     }

    # return ingredient_usage

    ingredient_usage = {}
    for ing in ingredients:
        per_person_qty = ing.get("perPerson", 1)  # default 1 if not provided
        related_dishes = [d.lower() for d in ing.get('dishes', [])]
        
        if 'all dishes' in related_dishes or 'most dishes' in related_dishes:
            estimated_total = sum(dish_counts.values()) * per_person_qty
        else:
            estimated_total = sum(
                dish_counts.get(dish, 0)
                for dish in dish_counts
                if dish.lower() in related_dishes
            ) * per_person_qty
        
        ingredient_usage[ing["name"]] = {
            "unit": ing.get("unit", ""),
            "estimated_quantity": int(round(estimated_total))
        }

    return ingredient_usage

def save_to_db(forecast_data):
    db.ingredient_forecasts.insert_one({
        "timestamp": datetime.now(timezone.utc),
        "forecast": forecast_data
    })

if __name__ == "__main__":
    usage = forecast_ingredient_requirements()
    print("📅 Forecast result saved.\n🛒 Ingredient Forecast for Next Week:\n")
    for name, data in usage.items():
        print(f"{name}: {data['estimated_quantity']} {data['unit']}")
    save_to_db(usage)
