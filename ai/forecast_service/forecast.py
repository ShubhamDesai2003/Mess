from pymongo import MongoClient
import pandas as pd
from prophet import Prophet
import os
from dotenv import load_dotenv


load_dotenv(dotenv_path='../../backend/config/config.env')

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client["Mess"]  # ⬅️ Fix: access database explicitly


def load_weekly_data():
    docs = list(db.weeklyselections.find().sort("weekStart", 1))

    df_bf = pd.DataFrame({
        "ds": [d["weekStart"] for d in docs],
        "y":  [sum(d["data"][day]["breakfast"] for day in d["data"]) for d in docs]
    })

    df_l = pd.DataFrame({
        "ds": [d["weekStart"] for d in docs],
        "y":  [sum(d["data"][day]["lunch"] for day in d["data"]) for d in docs]
    })

    df_d = pd.DataFrame({
        "ds": [d["weekStart"] for d in docs],
        "y":  [sum(d["data"][day]["dinner"] for day in d["data"]) for d in docs]
    })

    return df_bf, df_l, df_d



def train_and_forecast(df, periods=7):
    m = Prophet(weekly_seasonality=True, daily_seasonality=False)
    m.fit(df)
    future = m.make_future_dataframe(periods=periods, freq="W")  # weekly
    forecast = m.predict(future)
    # Return only the forecast rows beyond history
    return forecast.tail(periods)[["ds", "yhat"]]


def get_weekly_forecast(weeks_ahead=1):
    df_bf, df_l, df_d = load_weekly_data()
    fb = train_and_forecast(df_bf, periods=weeks_ahead).reset_index(drop=True)
    fl = train_and_forecast(df_l,   periods=weeks_ahead).reset_index(drop=True)
    fd = train_and_forecast(df_d,   periods=weeks_ahead).reset_index(drop=True)

    result = {}
    for idx, row in fb.iterrows():
        date = row["ds"].date().isoformat()
        result[date] = {
            "breakfast": int(round(row["yhat"])),
            "lunch":     int(round(fl.iloc[idx]["yhat"])),
            "dinner":    int(round(fd.iloc[idx]["yhat"]))
        }

    print("📅 Forecast result:", result)

    return result


if __name__ == "__main__":
    from pprint import pprint
    result = get_weekly_forecast(weeks_ahead=4)
    pprint(result)
