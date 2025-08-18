import json # Used for working with JSON data
import pandas as pd # Used for easily handling data in tables (DataFrames)
import random # Used to pick a random meal for suggestions

# --- Step 1: Your Data (Copied from your JSON files) ---
# We are embedding your JSON data directly into the Python code for simplicity.
# In a larger project, you would load these from separate files.

# Data from Mess.menuitems.json
MESS_MENU_ITEMS_JSON = """
[
  {
    "_id": {
      "$oid": "67c0d41c507d65a82cc0df99"
    },
    "day": "monday",
    "breakfast": "Poha, Tea",
    "lunch": "Rice, Dal, Sabzi, Salad",
    "dinner": "Roti, Paneer, Rice"
  },
  {
    "_id": {
      "$oid": "67c0d41c507d65a82cc0df9a"
    },
    "day": "tuesday",
    "breakfast": "Upma, Coffee",
    "lunch": "Jeera Rice, Rajma, Salad",
    "dinner": "Paratha, Curd, Rice"
  },
  {
    "_id": {
      "$oid": "67c0d41c507d65a82cc0df9b"
    },
    "day": "wednesday",
    "breakfast": "Idli, Sambar",
    "lunch": "Biryani, Raita",
    "dinner": "Noodles, Manchurian"
  }
]
"""

# Data from Mess.times.json
MESS_TIMES_JSON = """
[
  {
    "_id": {
      "$oid": "67c0d39e507d65a82cc0df8c"
    },
    "meal": "breakfast",
    "time": "08:00 AM",
    "cost": 50
  },
  {
    "_id": {
      "$oid": "67c0d39e507d65a82cc0df8d"
    },
    "meal": "lunch",
    "time": "01:00 PM",
    "cost": 80
  },
  {
    "_id": {
      "$oid": "67c0d39e507d65a82cc0df8e"
    },
    "meal": "dinner",
    "time": "08:00 PM",
    "cost": 70
  }
]
"""

# --- Step 2: Functions to Load and Process Data ---

def load_data():
    """
    Loads the menu items and meal times/costs into pandas DataFrames.
    This makes it easy to search and work with the data.
    """
    # Convert JSON strings into Python lists of dictionaries, then into DataFrames
    menu_items_data = json.loads(MESS_MENU_ITEMS_JSON)
    df_menu_items = pd.DataFrame(menu_items_data)
    # Remove the '_id' column as it's not needed for our queries
    df_menu_items = df_menu_items.drop(columns=['_id'], errors='ignore')

    times_data = json.loads(MESS_TIMES_JSON)
    df_times = pd.DataFrame(times_data)
    # Remove the '_id' column
    df_times = df_times.drop(columns=['_id'], errors='ignore')

    print("Data loaded successfully! Ready to answer your questions.")
    return df_menu_items, df_times

# --- Step 3: Functions for Our "AI" Logic ---

def get_meal_info(df_menu_items, df_times, day_input, meal_type_input):
    """
    Retrieves the meal information (menu, time, and cost) for a given day and meal type.
    This is the core "intelligence" for answering specific queries.
    """
    # Convert inputs to lowercase to match our data (e.g., "Monday" becomes "monday")
    day = day_input.lower()
    meal_type = meal_type_input.lower()

    # Find the menu item for the specified day and meal type
    # .loc[] is used to select rows and columns by their labels
    # .iloc[0] gets the first (and only) matching row
    menu_row = df_menu_items[df_menu_items['day'] == day]
    menu_item = None
    if not menu_row.empty and meal_type in menu_row.columns:
        menu_item = menu_row.iloc[0][meal_type]

    # Find the time and cost for the specified meal type
    time_cost_row = df_times[df_times['meal'] == meal_type]
    meal_time = None
    meal_cost = None
    if not time_cost_row.empty:
        meal_time = time_cost_row.iloc[0]['time']
        meal_cost = time_cost_row.iloc[0]['cost']

    # Prepare the result
    if menu_item and meal_time and meal_cost is not None:
        return {
            "day": day_input.capitalize(), # Capitalize for nice display
            "meal_type": meal_type_input.capitalize(),
            "menu": menu_item,
            "time": meal_time,
            "cost": meal_cost
        }
    else:
        return None # Return None if information is not found

def suggest_random_meal(df_menu_items, df_times):
    """
    Suggests a random meal from the available menu.
    This adds a simple "suggestion" capability to our AI.
    """
    # Get all available days and meal types
    available_days = df_menu_items['day'].tolist()
    available_meal_types = ['breakfast', 'lunch', 'dinner']

    # Pick a random day and meal type
    random_day = random.choice(available_days)
    random_meal_type = random.choice(available_meal_types)

    # Get the info for the randomly chosen meal
    suggested_info = get_meal_info(df_menu_items, df_times, random_day, random_meal_type)
    return suggested_info

# --- Step 4: Main Program Loop (How the "AI" interacts with you) ---

def run_assistant():
    """
    This function runs the interactive Mess Menu Assistant.
    It loads data and then enters a loop to take user commands.
    """
    df_menu_items, df_times = load_data()

    print("\n--- Welcome to your Mess Menu Assistant AI! ---")
    print("I can tell you about daily menus, times, and costs.")
    print("You can ask me things like:")
    print(" - 'What's for lunch on Monday?'")
    print(" - 'Tell me about Tuesday dinner.'")
    print(" - 'Suggest a meal.'")
    print(" - Type 'quit' or 'exit' to stop.")

    while True: # This loop keeps the assistant running until you quit
        user_input = input("\nHow can I help you? ").strip().lower()

        if user_input in ['quit', 'exit']:
            print("Goodbye! Hope you enjoyed the meal info.")
            break # Exit the loop and stop the program

        elif "suggest a meal" in user_input:
            suggestion = suggest_random_meal(df_menu_items, df_times)
            if suggestion:
                print(f"How about {suggestion['meal_type']} on {suggestion['day']}? It's '{suggestion['menu']}' at {suggestion['time']} (Cost: ${suggestion['cost']}).")
            else:
                print("Sorry, I couldn't suggest a meal right now.")

        else:
            # Try to parse the user's input for day and meal type
            found_day = None
            found_meal_type = None

            # Check for day
            for day_name in df_menu_items['day'].unique():
                if day_name in user_input:
                    found_day = day_name
                    break

            # Check for meal type
            for meal_name in df_times['meal'].unique():
                if meal_name in user_input:
                    found_meal_type = meal_name
                    break

            if found_day and found_meal_type:
                info = get_meal_info(df_menu_items, df_times, found_day, found_meal_type)
                if info:
                    print(f"On {info['day']}, {info['meal_type']} is '{info['menu']}' at {info['time']} (Cost: ${info['cost']}).")
                else:
                    print("Sorry, I couldn't find information for that specific meal. Please check the day and meal type.")
            elif found_meal_type and not found_day:
                # If only meal type is found, give general info about it
                time_cost_row = df_times[df_times['meal'] == found_meal_type]
                if not time_cost_row.empty:
                    meal_time = time_cost_row.iloc[0]['time']
                    meal_cost = time_cost_row.iloc[0]['cost']
                    print(f"{found_meal_type.capitalize()} is served at {meal_time} and costs ${meal_cost}.")
                else:
                    print("Sorry, I couldn't find information for that meal type.")
            else:
                print("I'm not sure what you're asking. Please specify a day (Monday, Tuesday, Wednesday) and a meal type (Breakfast, Lunch, Dinner), or ask me to 'suggest a meal'.")

# This ensures that `run_assistant()` is called only when the script is run directly
if __name__ == "__main__":
    run_assistant()
