# from pymongo import MongoClient
# import os
# from dotenv import load_dotenv
# from forecast import get_weekly_forecast
# import datetime

# # Load environment and DB
# load_dotenv(dotenv_path='../../backend/config/config.env')
# MONGO_URI = os.getenv('MONGO_URI')
# client = MongoClient(MONGO_URI)
# db = client.get_database("Mess")

# # ⬇️ Utility
# def get_day_from_date(date_str):
#     return datetime.date.fromisoformat(date_str).strftime("%A").lower()

# def normalize_dish_names(dish_string):
#     # Split by 'with', '&' and commas, clean, title-case
#     parts = dish_string.replace('&', ',').replace('with', ',').split(',')
#     return [part.strip().title() for part in parts if part.strip()]

# # ⬇️ Loaders
# def get_menu():
#     return list(db.menuitems.find({}))

# def get_ingredients():
#     return list(db.ingredients.find({}))

# # ⬇️ Main function
# def forecast_ingredient_requirements():
#     menu = get_menu()
#     ingredients = get_ingredients()
#     forecast = get_weekly_forecast(weeks_ahead=4)  # 4 weeks = 1 month

#     dish_counts = {}

#     for date, counts in forecast.items():
#         weekday = get_day_from_date(date)
#         menu_for_day = next((m for m in menu if m["day"].lower() == weekday), None)
#         if not menu_for_day:
#             continue

#         for meal_type in ['breakfast', 'lunch', 'dinner']:
#             if meal_type not in counts:
#                 continue
#             people = counts[meal_type]
#             dishes = normalize_dish_names(menu_for_day[meal_type])
#             for dish in dishes:
#                 dish_counts[dish] = dish_counts.get(dish, 0) + people

#     # Map ingredients
#     ingredient_usage = {}
#     for ing in ingredients:
#         ing_dishes = [d.strip().title() for d in ing.get("dishes", [])]
#         # matched_dishes = [d for d in dish_counts if any(d.lower() == idish.lower() for idish in ing_dishes)]
#         matched_dishes = [
#             dish for dish in dish_counts
#             if any(idish.lower() in dish.lower() for idish in ing_dishes)
#         ]


#         if "all dishes" in [d.lower() for d in ing_dishes] or "most dishes" in [d.lower() for d in ing_dishes]:
#             estimated_total = sum(dish_counts.values())
#         else:
#             estimated_total = sum([dish_counts[d] for d in matched_dishes])

#         ingredient_usage[ing["name"]] = {
#             "unit": ing.get("unit", ""),
#             "estimated_quantity": estimated_total
#         }

#     return ingredient_usage

# # ⬇️ Run & print
# if __name__ == "__main__":
#     usage = forecast_ingredient_requirements()
#     print("🛒 Ingredient Forecast for Next Month:\n")
#     for name, data in usage.items():
#         print(f"{name}: {data['estimated_quantity']} {data['unit']}")






from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone


load_dotenv(dotenv_path='../../backend/config/config.env')
MONGO_URI = os.getenv('MONGO_URI')

client = MongoClient(MONGO_URI)
db = client.get_database("Mess")

def get_menu():
    return list(db.menuitems.find({}))

def get_ingredients():
    return list(db.ingredients.find({}))

def get_weekly_forecast():
    from forecast import get_weekly_forecast
    return get_weekly_forecast(weeks_ahead=4)  # 4 weeks = 1 month

def get_day_from_date(date_str):
    import datetime
    return datetime.date.fromisoformat(date_str).strftime("%A").lower()

def forecast_ingredient_requirements():
    menu = get_menu()
    ingredients = get_ingredients()
    forecast = get_weekly_forecast()

    dish_counts = {}

    for date, counts in forecast.items():
        weekday = get_day_from_date(date)
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

    ingredient_usage = {}
    for ing in ingredients:
        related_dishes = [d.lower() for d in ing.get('dishes', [])]

        if 'all dishes' in related_dishes or 'most dishes' in related_dishes:
            estimated_total = sum(dish_counts.values())
        else:
            estimated_total = sum(dish_counts.get(dish, 0) for dish in dish_counts if dish.lower() in related_dishes)

        ingredient_usage[ing["name"]] = {
            "unit": ing.get("unit", ""),
            "estimated_quantity": estimated_total  # currently based on count, not per-dish multipliers
        }

    return ingredient_usage

def save_to_db(forecast_data):
    db.ingredient_forecasts.insert_one({
        "timestamp": datetime.now(timezone.utc),
        "forecast": forecast_data
    })

if __name__ == "__main__":
    from datetime import datetime, timezone

    usage = forecast_ingredient_requirements()

    print("📅 Forecast result saved.\n🛒 Ingredient Forecast for Next Month:\n")
    for name, data in usage.items():
        print(f"{name}: {data['estimated_quantity']} {data['unit']}")

    # Save the result
    save_to_db(usage)
