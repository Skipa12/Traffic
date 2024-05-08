import datetime
import random
import json

def generate_random_timestamp(start_time, end_time):
    delta = end_time - start_time
    random_seconds = random.uniform(0, delta.total_seconds())
    return start_time + datetime.timedelta(seconds=random_seconds)

def generate_data(num_points):
    data = []
    current_time = datetime.datetime.now()
    for i in range(num_points):
        if random.choice([True, False]):  # randomly choose whether to generate past or current timestamp
            # Generate timestamp within the last 10 days
            timestamp = generate_random_timestamp(current_time - datetime.timedelta(days=50), current_time)
        else:
            # Generate timestamp within the current time
            timestamp = generate_random_timestamp(current_time - datetime.timedelta(days=10), current_time)
        speed = int(random.uniform(0, 85) * 1.60934)  # Generating random speed between 0 and 100 mph converted to kph
        direction = random.randint(0, 360)  # Generating random direction in degrees
        data_point = {
            "timestamp": timestamp.strftime('%Y-%m-%d %H:%M:%S'),  # Using string format for timestamp
            "speed_kph": speed,
            "direction_degrees": direction
        }
        data.append(data_point)
    return data

if __name__ == "__main__":
    data = generate_data(2000)
    with open("sensor_data.json", "w") as json_file:
        json.dump(data, json_file, indent=4)
