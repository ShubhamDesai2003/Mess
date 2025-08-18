import json # For working with JSON data
import pandas as pd # For powerful data handling (DataFrames)
from collections import Counter # To easily count frequencies of items
import os # To check if files exist
import random # IMP
# --- Step 1: Your Data (Now reading from files) ---
# We will now read the JSON data directly from the files you created.
# This is a more standard way to handle data in real projects.

# Define file paths for your data
MENU_ITEMS_FILE = "Mess.menuitems.json"
TIMES_FILE = "Mess.times.json"
STUDENT_ORDERS_FILE = "student_orders.json" # The new file you just created

def load_data_from_files():
    """
    Loads menu items, meal times, and student orders from their respective JSON files.
    This function also performs basic checks to ensure files exist.
    """
    data = {}

    # Load Menu Items
    if os.path.exists(MENU_ITEMS_FILE):
        with open(MENU_ITEMS_FILE, 'r') as f:
            menu_items_data = json.load(f)
        data['df_menu_items'] = pd.DataFrame(menu_items_data)
        data['df_menu_items'] = data['df_menu_items'].drop(columns=['_id'], errors='ignore')
        print(f"Loaded {MENU_ITEMS_FILE}")
    else:
        print(f"Error: {MENU_ITEMS_FILE} not found. Please ensure it's in the same directory.")
        return None

    # Load Meal Times
    if os.path.exists(TIMES_FILE):
        with open(TIMES_FILE, 'r') as f:
            times_data = json.load(f)
        data['df_times'] = pd.DataFrame(times_data)
        data['df_times'] = data['df_times'].drop(columns=['_id'], errors='ignore')
        print(f"Loaded {TIMES_FILE}")
    else:
        print(f"Error: {TIMES_FILE} not found. Please ensure it's in the same directory.")
        return None

    # Load Student Orders (the new data)
    if os.path.exists(STUDENT_ORDERS_FILE):
        with open(STUDENT_ORDERS_FILE, 'r') as f:
            student_orders_data = json.load(f)
        data['df_student_orders'] = pd.DataFrame(student_orders_data)
        # Convert 'date' column to datetime objects for easier filtering by month/year
        data['df_student_orders']['date'] = pd.to_datetime(data['df_student_orders']['date'])
        print(f"Loaded {STUDENT_ORDERS_FILE}")
    else:
        print(f"Error: {STUDENT_ORDERS_FILE} not found. Please ensure you created it and it's in the same directory.")
        return None

    print("\nAll data loaded successfully! Ready for analysis.")
    return data

# --- Step 2: Functions for Our "AI" Analysis and Recommendation Logic ---

def analyze_student_orders(df_student_orders, student_id, month=None, year=None):
    """
    Analyzes a specific student's order history.
    Args:
        df_student_orders (pd.DataFrame): DataFrame containing all student orders.
        student_id (str): The ID of the student to analyze.
        month (int, optional): The month to filter orders (e.g., 7 for July). Defaults to None (all months).
        year (int, optional): The year to filter orders (e.g., 2025). Defaults to None (all years).

    Returns:
        dict: A dictionary containing order history, daily patterns, and food frequencies.
    """
    student_history = df_student_orders[df_student_orders['student_id'] == student_id].copy()

    if student_history.empty:
        return None # Student ID not found

    # Filter by month and year if specified
    if month:
        student_history = student_history[student_history['date'].dt.month == month]
    if year:
        student_history = student_history[student_history['date'].dt.year == year]

    if student_history.empty:
        return {"student_id": student_id, "message": f"No orders found for {student_id} in the specified period."}

    # Sort by date for better readability
    student_history = student_history.sort_values(by='date')

    # 1. Get food items ordered daily (i.e., for each day and meal type)
    # This groups by date, day, and meal_type to show what they ate for each meal.
    daily_orders = student_history.groupby(['date', 'day', 'meal_type'])['food_item'].apply(lambda x: ', '.join(x)).reset_index()
    daily_orders_list = daily_orders.to_dict(orient='records')

    # 2. Count how many times the same food item was ordered
    all_food_items = []
    for items_str in student_history['food_item']:
        # Split complex food items like "Poha, Tea" into individual components
        # This is a simple split; for real AI, you'd use more advanced NLP
        individual_items = [item.strip() for item in items_str.split(',')]
        all_food_items.extend(individual_items)

    food_frequency = Counter(all_food_items)
    most_common_foods = food_frequency.most_common() # Get items sorted by frequency

    return {
        "student_id": student_id,
        "total_orders_in_period": len(student_history),
        "daily_orders": daily_orders_list,
        "food_frequency": most_common_foods
    }

def generate_recommendations(analysis_results, df_menu_items):
    """
    Generates simple food recommendations based on the student's analysis.
    For this basic model, we recommend their most frequent items,
    or other items available on the menu if their frequent items are limited.
    """
    if not analysis_results or "food_frequency" not in analysis_results:
        return "No sufficient data to generate recommendations."

    most_frequent = analysis_results['food_frequency']
    recommendations = []

    if most_frequent:
        print("\nBased on your frequent orders, you might enjoy:")
        # Recommend the top 3 most frequent items
        for food, count in most_frequent[:3]:
            recommendations.append(f"- {food} (ordered {count} times)")

        # Simple additional recommendation: suggest other items from the general menu
        # This is a very basic recommendation. Real systems use item similarity.
        all_menu_items = []
        for col in ['breakfast', 'lunch', 'dinner']:
            # Ensure the column exists before trying to access it
            if col in df_menu_items.columns:
                all_menu_items.extend(df_menu_items[col].dropna().tolist())

        # Remove items already frequently ordered by the student from general recommendations
        frequent_food_names = [item[0] for item in most_frequent]
        potential_new_recommendations = [
            item for item in all_menu_items
            if item not in frequent_food_names and item not in recommendations # Avoid duplicates
        ]

        # Add a couple of random new suggestions if available
        if potential_new_recommendations:
            random.shuffle(potential_new_recommendations)
            for item in potential_new_recommendations[:2]: # Suggest up to 2 new items
                recommendations.append(f"- You might also like to try something new: {item}")

    else:
        recommendations.append("No specific food preferences found. Here are some general menu items:")
        # If no frequent items, suggest some random items from the general menu
        all_menu_items = []
        for col in ['breakfast', 'lunch', 'dinner']:
            if col in df_menu_items.columns:
                all_menu_items.extend(df_menu_items[col].dropna().tolist())
        random.shuffle(all_menu_items)
        for item in all_menu_items[:3]:
            recommendations.append(f"- {item}")

    return "\n".join(recommendations)

# --- Step 3: Main Program Loop (How the "AI" interacts with you) ---

def run_recommender_assistant():
    """
    This function runs the interactive Student Meal Analyzer & Recommender AI.
    It loads data and then enters a loop to take user commands.
    """
    data = load_data_from_files()
    if data is None:
        print("Failed to load all necessary data. Please check file paths and content.")
        return

    df_menu_items = data['df_menu_items']
    df_times = data['df_times']
    df_student_orders = data['df_student_orders']

    print("\n--- Welcome to your Student Meal Analyzer & Recommender AI! ---")
    print("I can analyze student meal orders and provide recommendations.")
    print("Available Student IDs in mock data: S001, S002")
    print("You can ask me things like:")
    print(" - 'Analyze S001'")
    print(" - 'Analyze S002 for July 2025'")
    print(" - Type 'quit' or 'exit' to stop.")

    while True:
        user_input = input("\nEnter your command: ").strip().lower()

        if user_input in ['quit', 'exit']:
            print("Goodbye! Hope the analysis was helpful.")
            break

        elif user_input.startswith("analyze"):
            parts = user_input.split()
            student_id = None
            month = None
            year = None

            # Parse student ID
            if len(parts) > 1:
                student_id = parts[1].upper() # Convert to uppercase to match S001, S002

            # Parse month and year (e.g., "for July 2025")
            for i, part in enumerate(parts):
                if part == "for" and i + 1 < len(parts):
                    month_str = parts[i+1]
                    # Simple mapping for months
                    month_map = {
                        "january": 1, "february": 2, "march": 3, "april": 4,
                        "may": 5, "june": 6, "july": 7, "august": 8,
                        "september": 9, "october": 10, "november": 11, "december": 12
                    }
                    month = month_map.get(month_str)
                    if i + 2 < len(parts) and parts[i+2].isdigit():
                        year = int(parts[i+2])
                    break

            if student_id:
                print(f"\nAnalyzing orders for Student ID: {student_id}...")
                analysis_results = analyze_student_orders(df_student_orders, student_id, month, year)

                if analysis_results is None:
                    print(f"Error: Student ID '{student_id}' not found in the order history.")
                elif "message" in analysis_results:
                    print(analysis_results["message"])
                else:
                    print(f"\n--- Order History for {analysis_results['student_id']} (Total Orders: {analysis_results['total_orders_in_period']}) ---")
                    for order in analysis_results['daily_orders']:
                        print(f"  {order['date'].strftime('%Y-%m-%d')} ({order['day'].capitalize()} {order['meal_type'].capitalize()}): {order['food_item']}")

                    print("\n--- Food Item Frequencies ---")
                    if analysis_results['food_frequency']:
                        for food, count in analysis_results['food_frequency']:
                            print(f"  '{food}': Ordered {count} times")
                    else:
                        print("  No specific food items found in this period.")

                    print("\n--- Recommendations ---")
                    recommendations = generate_recommendations(analysis_results, df_menu_items)
                    print(recommendations)
            else:
                print("Please specify a student ID, e.g., 'analyze S001'.")
        else:
            print("I don't understand that command. Please use 'analyze [student_id]' or 'quit'.")

# This ensures that `run_recommender_assistant()` is called only when the script is run directly
if __name__ == "__main__":
    run_recommender_assistant()

