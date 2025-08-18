# ai/forecast_service/meal_recommender_ai.py
from collections import Counter
from typing import List, Dict, Any

def _normalize_day_key(day_name: str) -> str:
    if not isinstance(day_name, str):
        return ""
    return day_name.strip().lower()

def _split_dish_names(dish_name: str):
    if not isinstance(dish_name, str):
        return []
    if " with " in dish_name:
        return [p.strip() for p in dish_name.split(" with ") if p.strip()]
    if "," in dish_name:
        return [p.strip() for p in dish_name.split(",") if p.strip()]
    return [dish_name.strip()]

def extract_dishes_from_order(order: Dict[str, Any], menu_lookup: Dict[str, Dict[str, str]]):
    out = []
    sel = order.get("selected") or order.get("selections") or order.get("selectedMeals") or {}
    if not isinstance(sel, dict):
        return out

    for day_key, meals in sel.items():
        day = _normalize_day_key(day_key)
        if not day:
            continue
        menu_for_day = menu_lookup.get(day, {})
        if not isinstance(meals, dict):
            continue

        for meal_type, chosen in meals.items():
            if not chosen:
                continue
            meal_key = meal_type.strip().lower()
            dish_name = menu_for_day.get(meal_key)
            if not dish_name:
                continue
            out.extend(_split_dish_names(dish_name))
    return out

def generate_popular(orders: List[Dict[str, Any]], menu_items: List[Dict[str, Any]], top_n: int = 20):
    menu_lookup = {}
    for m in menu_items:
        day = _normalize_day_key(m.get("day") or "")
        if not day:
            continue
        menu_lookup[day] = {
            "breakfast": (m.get("breakfast") or "").strip(),
            "lunch":     (m.get("lunch") or "").strip(),
            "dinner":    (m.get("dinner") or "").strip()
        }

    counter = Counter()
    for o in orders:
        counter.update(extract_dishes_from_order(o, menu_lookup))

    return [{"dish": dish, "count": cnt} for dish, cnt in counter.most_common(top_n)]

def compute_user_top(user_orders: List[Dict[str, Any]], menu_items: List[Dict[str, Any]], top_n: int = 10):
    menu_lookup = {}
    for m in menu_items:
        day = _normalize_day_key(m.get("day") or "")
        if not day:
            continue
        menu_lookup[day] = {
            "breakfast": (m.get("breakfast") or "").strip(),
            "lunch":     (m.get("lunch") or "").strip(),
            "dinner":    (m.get("dinner") or "").strip()
        }

    counter = Counter()
    for o in user_orders:
        counter.update(extract_dishes_from_order(o, menu_lookup))

    return [{"dish": dish, "count": cnt} for dish, cnt in counter.most_common(top_n)]
