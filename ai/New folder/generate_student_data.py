import json
import pandas as pd
import random
from datetime import date, timedelta
import os # Import os module for path handling

# --- Configuration ---
NUM_STUDENTS = 60
START_DATE = date(2025, 7, 1)
DAYS_TO_GENERATE = 30 # Generate orders for 30 days
ORDERS_PER_STUDENT_PER_DAY_RANGE = (0, 3) # Each student orders 0 to 3 meals per day
RATING_RANGE = (1, 5) # Ratings from 1 to 5

# --- Define file paths relative to the script's location ---
SCRIPT_DIR = os.path.dirname(__file__) # Get the directory where this script is located
MENU_ITEMS_FILE = os.path.join(SCRIPT_DIR, "Mess.menuitems.json")
STUDENT_ORDERS_OUTPUT_FILE = os.path.join(SCRIPT_DIR, "student_orders.json")

def generate_student_orders():
    """
    Generates mock student order data with ratings for NUM_STUDENTS.
    """
    print(f"Starting data generation for {NUM_STUDENTS} students...")

    # Load menu items to ensure consistency
    try:
        with open(MENU_ITEMS_FILE, 'r', encoding='utf-8') as f: # Specify encoding
            menu_data = json.load(f)
        df_menu = pd.DataFrame(menu_data)
        print(f"Successfully loaded menu items from: {MENU_ITEMS_FILE}")
    except FileNotFoundError:
        print(f"ERROR: Menu items file not found at: {MENU_ITEMS_FILE}. Please ensure it exists in the same directory as the script.")
        return
    except json.JSONDecodeError as e:
        print(f"ERROR: Could not decode JSON from {MENU_ITEMS_FILE}. Check file content for syntax errors. Error: {e}")
        return
    except Exception as e:
        print(f"An unexpected error occurred while loading menu items: {e}")
        return

    # Prepare a list of all possible food items from the menu
    all_menu_food_items = []
    for _, row in df_menu.iterrows():
        for meal_type in ['breakfast', 'lunch', 'dinner']:
            if pd.notna(row[meal_type]):
                # Split combined food items like "Poha, Tea" into individual components
                individual_items = [item.strip() for item in row[meal_type].split(',')]
                all_menu_food_items.extend(individual_items)
    all_menu_food_items = list(set(all_menu_food_items)) # Get unique items
    print(f"Found {len(all_menu_food_items)} unique food items in the menu.")

    mock_orders = []
    student_ids = [f"S{i:03d}" for i in range(1, NUM_STUDENTS + 1)]

    for student_id in student_ids:
        current_date = START_DATE
        for _ in range(DAYS_TO_GENERATE):
            num_orders_today = random.randint(ORDERS_PER_STUDENT_PER_DAY_RANGE[0], ORDERS_PER_STUDENT_PER_DAY_RANGE[1])
            
            day_of_week = current_date.strftime('%A').lower()
            daily_menu = df_menu[df_menu['day'] == day_of_week]

            if not daily_menu.empty:
                daily_menu_row = daily_menu.iloc[0]
                available_meals_today = []
                if pd.notna(daily_menu_row.get('breakfast')): available_meals_today.append({'type': 'breakfast', 'items': daily_menu_row['breakfast']})
                if pd.notna(daily_menu_row.get('lunch')): available_meals_today.append({'type': 'lunch', 'items': daily_menu_row['lunch']})
                if pd.notna(daily_menu_row.get('dinner')): available_meals_today.append({'type': 'dinner', 'items': daily_menu_row['dinner']})
                
                num_orders_today = min(num_orders_today, len(available_meals_today))

                if num_orders_today > 0:
                    chosen_meals = random.sample(available_meals_today, num_orders_today)

                    for meal in chosen_meals:
                        mock_orders.append({
                            "student_id": student_id,
                            "date": current_date.strftime('%Y-%m-%d'),
                            "day": day_of_week,
                            "meal_type": meal['type'],
                            "food_item": meal['items'],
                            "rating": random.randint(RATING_RANGE[0], RATING_RANGE[1])
                        })
            current_date += timedelta(days=1)

    # Save the generated data to JSON
    try:
        with open(STUDENT_ORDERS_OUTPUT_FILE, 'w', encoding='utf-8') as f: # Specify encoding
            json.dump(mock_orders, f, indent=2)
        print(f"Generated {len(mock_orders)} orders for {NUM_STUDENTS} students.")
        print(f"Data successfully saved to: {STUDENT_ORDERS_OUTPUT_FILE}")
    except Exception as e:
        print(f"ERROR: An error occurred while saving student orders data: {e}")

if __name__ == "__main__":
    generate_student_orders()
