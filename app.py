from flask import Flask, render_template, request, jsonify
from vedic_astrology import calculate_birth_chart, get_transits, get_vimshottari_dasha
import pytz
from timezonefinder import TimezoneFinder

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form.get('name')
        birth_date = request.form.get('birth_date')
        birth_time = request.form.get('birth_time')
        latitude = float(request.form.get('latitude'))
        longitude = float(request.form.get('longitude'))
        ayanamsa = request.form.get('ayanamsa')

        tf = TimezoneFinder()
        tz_name = tf.timezone_at(lat=latitude, lng=longitude)
        tz = pytz.timezone(tz_name) if tz_name else pytz.utc

        chart_data = calculate_birth_chart(
            name=name,
            birth_date=birth_date,
            birth_time=birth_time,
            latitude=latitude,
            longitude=longitude,
            ayanamsa=ayanamsa,
            timezone=tz
        )
        vimshottari = get_vimshottari_dasha(chart_data)
        transits = get_transits(chart_data)

        return render_template('chart.html', chart=chart_data, vimshottari=vimshottari, transits=transits)
    return render_template('index.html')

@app.route('/api/birth-chart', methods=['POST'])
def api_birth_chart():
    data = request.get_json()
    name = data.get('name')
    birth_date = data['birth_date']
    birth_time = data['birth_time']
    latitude = float(data['latitude'])
    longitude = float(data['longitude'])
    ayanamsa = data.get('ayanamsa', 'lahiri')

    tf = TimezoneFinder()
    tz_name = tf.timezone_at(lat=latitude, lng=longitude)
    tz = pytz.timezone(tz_name) if tz_name else pytz.utc

    chart_data = calculate_birth_chart(
        name=name,
        birth_date=birth_date,
        birth_time=birth_time,
        latitude=latitude,
        longitude=longitude,
        ayanamsa=ayanamsa,
        timezone=tz
    )
    vimshottari = get_vimshottari_dasha(chart_data)
    transits = get_transits(chart_data)

    return jsonify({
        "chart": chart_data,
        "vimshottari": vimshottari,
        "transits": transits
    })
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
