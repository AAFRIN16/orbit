import numpy as np
import pandas as pd
from datetime import datetime, timedelta


def simulate_orbit(scenario: str = "none", num_points: int = 200) -> pd.DataFrame:
    orbit_period = 90
    eclipse_fraction = 0.35
    eclipse_start = 0.325
    eclipse_end = eclipse_start + eclipse_fraction

    timestamps = [datetime.utcnow() + timedelta(minutes=i * (orbit_period / num_points))
                  for i in range(num_points)]

    data = []
    battery_level = 85.0
    battery_capacity = 100.0
    rng = np.random.default_rng(42)

    for i, ts in enumerate(timestamps):
        frac = i / num_points
        eclipse = 1 if eclipse_start <= frac < eclipse_end else 0

        if eclipse:
            solar_base = 0.0
        else:
            sun_frac = (frac - eclipse_end) % 1.0 / (1.0 - eclipse_fraction)
            solar_base = 180.0 * np.sin(np.pi * sun_frac) + 20.0

        if scenario == "solar_failure" and frac >= 0.6:
            solar_base *= 0.15

        solar_input = max(0.0, solar_base + rng.normal(0, 3))

        load_base = 85.0 + 10.0 * np.sin(2 * np.pi * frac) + rng.normal(0, 2)
        if scenario == "load_spike" and 0.50 <= frac <= 0.65:
            load_spike_factor = 1.0 + 0.8 * np.sin(np.pi * (frac - 0.50) / 0.15)
            load_base *= load_spike_factor
        power_load = max(40.0, load_base)

        if scenario == "battery_degradation" and frac >= 0.4:
            degradation_factor = 1.0 - 0.4 * ((frac - 0.4) / 0.6)
            battery_capacity = 100.0 * degradation_factor

        net_power = solar_input - power_load
        charge_rate = net_power / battery_capacity * 0.5
        battery_level = np.clip(battery_level + charge_rate, 0.0, battery_capacity)

        soc = battery_level / battery_capacity
        battery_voltage = 22.0 + 4.0 * soc + rng.normal(0, 0.1)

        temp_base = 20.0 + 15.0 * (1 - eclipse) + 5.0 * (1 - soc)
        if scenario == "thermal_anomaly" and frac >= 0.7:
            temp_base += 30.0 * ((frac - 0.7) / 0.3)
        temperature = temp_base + rng.normal(0, 1.5)

        data.append({
            "timestamp": ts.isoformat(),
            "battery_level": round(float(battery_level), 2),
            "solar_input": round(float(solar_input), 2),
            "power_load": round(float(power_load), 2),
            "battery_voltage": round(float(battery_voltage), 3),
            "temperature": round(float(temperature), 2),
            "eclipse": int(eclipse),
        })

    return pd.DataFrame(data)