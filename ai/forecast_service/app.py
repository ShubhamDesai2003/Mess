from flask import Flask, jsonify, request
from flask_cors import CORS
from ingredient_forecast import forecast_ingredient_requirements, save_to_db
from mess_assistant import get_recommendations

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


# @app.route('/forecast/recommendations')
# def forecast_recommendations():
#     email = request.args.get("email")
#     print(email)
#     weeks = request.args.get("weeks")  # optional lookback
#     recs = get_recommendations(user_email=email, lookback_weeks=weeks)
#     return jsonify(recs)

@app.route('/forecast/recommendations')
def forecast_recommendations():
    email = request.args.get("email")   # will now receive the actual string
    print("Email from request:", email)
    weeks = request.args.get("weeks")
    recs = get_recommendations(user_email=email, lookback_weeks=weeks)
    return jsonify(recs)


if __name__ == '__main__':
    app.run(port=5000, debug=True)
