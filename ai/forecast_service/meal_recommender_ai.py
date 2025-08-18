# ai/forecast_service/meal_recommender_ai.py
from collections import Counter
from typing import List, Dict, Any

def _normalize_day_key(day_name: str) -> str:
    if not isinstance(day_name, str):
        return ""
    return day_name.strip().lower()

def _split_dish_names(dish_name: str):
    # Accept "A with B", "A, B", or single name
    if not isinstance(dish_name, str):
        return []
    if " with " in dish_name:
        parts = [p.strip() for p in dish_name.split(" with ") if p.strip()]
        return parts
    if "," in dish_name:
        parts = [p.strip() for p in dish_name.split(",") if p.strip()]
        return parts
    return [dish_name.strip()]

def extract_dishes_from_order(order: Dict[str, Any], menu_lookup: Dict[str, Dict[str, str]]):
    """
    Public helper: Extract dish names from an order doc given a menu lookup.
    Supports order.selected OR order.selections OR order.selectedMeals and different day/meal casings.
    Returns a list of dish strings (may be repeated across days/meals).
    """
    out = []
    sel = order.get("selected") or order.get("selections") or order.get("selectedMeals") or {}
    if not isinstance(sel, dict):
        return out

    for day_key, meals in sel.items():
        day = _normalize_day_key(day_key)
        if not day:
            continue

        menu_for_day = menu_lookup.get(day, {})  # may be {}
        if not isinstance(meals, dict):
            continue

        for meal_type, chosen in meals.items():
            # chosen may be boolean or numeric; treat truthy as selected
            if not chosen:
                continue
            meal_key = meal_type.strip().lower()
            dish_name = menu_for_day.get(meal_key)
            if not dish_name:
                # fallback: maybe menu_for_day stores arrays or missing field -> skip
                continue
            parts = _split_dish_names(dish_name)
            out.extend(parts)
    return out

def generate_popular(orders: List[Dict[str, Any]], menu_items: List[Dict[str, Any]], top_n: int = 20):
    """
    Compute global popular dishes from a list of orders and menu items.
    Returns list of dicts: [{dish, count}, ...]
    """
    # build menu lookup: day -> { breakfast: dish, lunch: dish, dinner: dish }
    menu_lookup = {}
    for m in menu_items:
        day_raw = m.get("day") or ""
        day = _normalize_day_key(day_raw)
        if not day:
            continue
        menu_lookup[day] = {
            "breakfast": (m.get("breakfast") or "").strip(),
            "lunch":     (m.get("lunch") or "").strip(),
            "dinner":    (m.get("dinner") or "").strip()
        }

    counter = Counter()
    for o in orders:
        dishes = extract_dishes_from_order(o, menu_lookup)
        if dishes:
            counter.update(dishes)

    popular = [{"dish": dish, "count": cnt} for dish, cnt in counter.most_common(top_n)]
    return popular

def compute_user_top(user_orders: List[Dict[str, Any]], menu_items: List[Dict[str, Any]], top_n: int = 10):
    """
    Compute per-user top dishes from that user's order list.
    Returns list of dicts: [{dish, count}, ...]
    """
    # re-use the same menu lookup
    menu_lookup = {}
    for m in menu_items:
        day_raw = m.get("day") or ""
        day = _normalize_day_key(day_raw)
        if not day:
            continue
        menu_lookup[day] = {
            "breakfast": (m.get("breakfast") or "").strip(),
            "lunch":     (m.get("lunch") or "").strip(),
            "dinner":    (m.get("dinner") or "").strip()
        }

    counter = Counter()
    for o in user_orders:
        dishes = extract_dishes_from_order(o, menu_lookup)
        if dishes:
            counter.update(dishes)

    user_top = [{"dish": dish, "count": cnt} for dish, cnt in counter.most_common(top_n)]
    return user_top
