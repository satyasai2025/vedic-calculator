@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            name = request.form.get('name', '')
            birth_date = request.form.get('birth_date', '')
            birth_time = request.form.get('birth_time', '')
            latitude = request.form.get('latitude', '')
            longitude = request.form.get('longitude', '')
            ayanamsa = request.form.get('ayanamsa', '')

            # Check for missing data
            if not (birth_date and birth_time and latitude and longitude and ayanamsa):
                error_msg = "Missing required fields. Please provide all details."
                return render_template('index.html', error=error_msg), 400

            # Validate lat/lng
            try:
                latitude = float(latitude)
                longitude = float(longitude)
            except ValueError:
                error_msg = "Invalid latitude or longitude. Please select a location on the map."
                return render_template('index.html', error=error_msg), 400

            # TimezoneFinder, astrology calculations, etc.
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
        except Exception as e:
            # Print error to Render logs for debugging
            print(f"Error in form submission: {e}")
            error_msg = f"An error occurred: {str(e)}"
            return render_template('index.html', error=error_msg), 500
    return render_template('index.html')
