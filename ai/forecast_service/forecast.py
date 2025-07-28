from pymongo import MongoClient
import pandas as pd
from prophet import Prophet
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path='../../backend/config/config.env')
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client["Mess"]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

def build_df_for(day, meal_type):
    docs = list(db.weeklyselections.find().sort("weekStart", 1))
    data = []
    for d in docs:
        week_start = d["weekStart"]
        try:
            count = d["data"][day][meal_type]
            data.append({ "ds": week_start, "y": count })
        except:
            pass
    return pd.DataFrame(data)

def train_prophet(df):
    model = Prophet(weekly_seasonality=True, daily_seasonality=False)
    model.fit(df)
    future = model.make_future_dataframe(periods=1, freq='W')  # 1 week ahead
    forecast = model.predict(future)
    return forecast.tail(1)[["ds", "yhat"]].iloc[0]["yhat"]

def get_weekly_forecast():
    result = {}
    for day in DAYS:
        result[day] = {}
        for meal in ["breakfast", "lunch", "dinner"]:
            df = build_df_for(day, meal)
            if not df.empty:
                forecast_value = int(round(train_prophet(df)))
            else:
                forecast_value = 0
            result[day][meal] = forecast_value

    print("📅 Forecast result:", result)
    return result

if __name__ == "__main__":
    from pprint import pprint
    forecast = get_weekly_forecast()
    pprint(forecast)
