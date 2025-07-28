from flask import Flask, jsonify, request
from ingredient_forecast import forecast_ingredient_requirements, save_to_db

app = Flask(__name__)

@app.route('/forecast/weekly')
def forecast_weekly():
    from forecast import get_weekly_forecast
    weeks = 4
    data = get_weekly_forecast(weeks_ahead=weeks)
    return jsonify(data)

@app.route('/forecast/ingredients')
def forecast_ingredients():
    usage = forecast_ingredient_requirements()
    save_to_db(usage)  # optional: save the result to DB each time
    return jsonify(usage)


if __name__ == '__main__':
    app.run(port=5000, debug=True)
