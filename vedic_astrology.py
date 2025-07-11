import swisseph as swe
import pytz
from datetime import datetime

NAKSHATRAS = [
    ("Ashwini", 0), ("Bharani", 13.333), ("Krittika", 26.666), ("Rohini", 40.0), ("Mrigashirsha", 53.333),
    ("Ardra", 66.666), ("Punarvasu", 80.0), ("Pushya", 93.333), ("Ashlesha", 106.666), ("Magha", 120.0),
    ("Purva Phalguni", 133.333), ("Uttara Phalguni", 146.666), ("Hasta", 160.0), ("Chitra", 173.333),
    ("Swati", 186.666), ("Vishakha", 200.0), ("Anuradha", 213.333), ("Jyeshtha", 226.666), ("Moola", 240.0),
    ("Purva Ashadha", 253.333), ("Uttara Ashadha", 266.666), ("Shravana", 280.0), ("Dhanishta", 293.333),
    ("Shatabhisha", 306.666), ("Purva Bhadrapada", 320.0), ("Uttara Bhadrapada", 333.333), ("Revati", 346.666)
]

PLANETS = [
    ('Sun', swe.SUN), ('Moon', swe.MOON), ('Mars', swe.MARS), ('Mercury', swe.MERCURY),
    ('Jupiter', swe.JUPITER), ('Venus', swe.VENUS), ('Saturn', swe.SATURN), ('Rahu', swe.MEAN_NODE),
    ('Ketu', swe.TRUE_NODE)
]

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

AYANAMSA_MAP = {"lahiri": swe.SIDM_LAHIRI, "krishnamurti": swe.SIDM_KRISHNAMURTI, "raman": swe.SIDM_RAMAN}

def get_ayanamsa(jd, ayanamsa):
    swe.set_sid_mode(AYANAMSA_MAP.get(ayanamsa, swe.SIDM_LAHIRI))
    return swe.get_ayanamsa(jd)

def get_nakshatra(degree):
    deg_in_sign = degree % 360
    for i, (nak, start) in enumerate(NAKSHATRAS):
        if deg_in_sign < start + 13.333:
            pada = int(((deg_in_sign - start) // 3.333) + 1)
            return nak, pada
    return "Revati", 4

def planet_status(planet, lon, chart_jd):
    status = ""
    # Retrograde
    if planet in [swe.MERCURY, swe.VENUS, swe.MARS, swe.JUPITER, swe.SATURN]:
        speed = swe.calc_ut(chart_jd, planet)[3][0]
        status += "R" if speed < 0 else "D"
    # Combustion
    if planet != swe.SUN:
        sun_lon = swe.calc_ut(chart_jd, swe.SUN)[0]
        diff = abs((lon - sun_lon + 180) % 360 - 180)
        if planet == swe.MERCURY and diff < 10:
            status += "C"
        elif planet == swe.VENUS and diff < 8:
            status += "C"
        elif planet == swe.MARS and diff < 17:
            status += "C"
        elif planet == swe.JUPITER and diff < 11:
            status += "C"
        elif planet == swe.SATURN and diff < 15:
            status += "C"
    # Eclipse flag for Sun/Moon
    if planet in [swe.SUN, swe.MOON]:
        moon_lon = swe.calc_ut(chart_jd, swe.MOON)[0]
        rahu_lon = swe.calc_ut(chart_jd, swe.MEAN_NODE)[0]
        if abs((lon - rahu_lon + 180) % 360 - 180) < 5:
            status += "E"
    return status

def calculate_birth_chart(name, birth_date, birth_time, latitude, longitude, ayanamsa, timezone):
    dt_naive = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
    dt_aware = timezone.localize(dt_naive)
    jd = swe.julday(dt_aware.year, dt_aware.month, dt_aware.day, dt_aware.hour + dt_aware.minute/60.0)
    ayanamsa_val = get_ayanamsa(jd, ayanamsa)
    chart = {
        "name": name,
        "date": birth_date,
        "time": birth_time,
        "latitude": latitude,
        "longitude": longitude,
        "ayanamsa": ayanamsa,
        "planets": [],
        "houses": []
    }
    houses = swe.houses(jd, latitude, longitude, b'A')[0]
    for i in range(12):
        sign = SIGNS[int(houses[i] // 30)]
        chart["houses"].append({"house": i+1, "degree": houses[i], "sign": sign})
    for pname, pcode in PLANETS:
        lon = swe.calc_ut(jd, pcode)[0] - ayanamsa_val
        lon = lon % 360
        sign_idx = int(lon // 30)
        sign = SIGNS[sign_idx]
        nakshatra, pada = get_nakshatra(lon)
        status = planet_status(pcode, lon, jd)
        chart["planets"].append({
            "planet": pname,
            "degree": round(lon, 2),
            "sign": sign,
            "nakshatra": nakshatra,
            "pada": pada,
            "status": status
        })
    chart['ayanamsa_val'] = round(ayanamsa_val, 4)
    return chart

def get_vimshottari_dasha(chart):
    moon = next(p for p in chart['planets'] if p['planet'] == 'Moon')
    moon_deg = moon['degree']
    lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
    idx = int(moon_deg // (120/9))
    dasha_start = lords[idx]
    periods = []
    for lord in lords[idx:] + lords[:idx]:
        periods.append({
            "dasha_lord": lord,
            "start": "2025-01-01",
            "end": "2026-01-01"
        })
    return periods

def get_transits(chart):
    now = datetime.utcnow()
    jd_now = swe.julday(now.year, now.month, now.day, now.hour + now.minute/60.0)
    ayanamsa_val = get_ayanamsa(jd_now, chart['ayanamsa'])
    transits = []
    for pname, pcode in PLANETS:
        lon = swe.calc_ut(jd_now, pcode)[0] - ayanamsa_val
        lon = lon % 360
        sign_idx = int(lon // 30)
        sign = SIGNS[sign_idx]
        nakshatra, pada = get_nakshatra(lon)
        status = planet_status(pcode, lon, jd_now)
        transits.append({
            "planet": pname,
            "degree": round(lon, 2),
            "sign": sign,
            "nakshatra": nakshatra,
            "pada": pada,
            "status": status
        })
    return transits
