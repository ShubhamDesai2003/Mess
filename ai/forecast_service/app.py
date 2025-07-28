from flask import Flask, jsonify
from flask_cors import CORS
from ingredient_forecast import forecast_ingredient_requirements, save_to_db

app = Flask(__name__)
CORS(app)

@app.route('/forecast/weekly')
def forecast_weekly():
    from forecast import get_weekly_forecast
    return jsonify(get_weekly_forecast())

@app.route('/forecast/ingredients')
def forecast_ingredients():
    usage = forecast_ingredient_requirements()
    save_to_db(usage)
    return jsonify(usage)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
