@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            name = request.form.get('name')
            birth_date = request.form.get('birth_date')
            birth_time = request.form.get('birth_time')
            latitude = float(request.form.get('latitude'))
            longitude = float(request.form.get('longitude'))
            ayanamsa = request.form.get('ayanamsa')

            if not birth_date or not birth_time or not latitude or not longitude or not ayanamsa:
                return "Missing required fields", 400

            tf = TimezoneFinder()
            tz_name = tf.timezone_at(lat=latitude, lng=longitude)
            if not tz_name:
                tz = pytz.utc
            else:
                tz = pytz.timezone(tz_name)

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
        except Exception as e:
            return f"Error: {str(e)}", 500
    return render_template('index.html')
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
