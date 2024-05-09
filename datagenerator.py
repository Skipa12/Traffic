import datetime
import random
from pymongo import MongoClient

def generate_random_timestamp(start_time, end_time):
    delta = end_time - start_time
    random_seconds = random.uniform(0, delta.total_seconds())
    return start_time + datetime.timedelta(seconds=random_seconds)

def generate_data(num_points):
    data = []
    current_time = datetime.datetime.now()
    for i in range(num_points):
        if random.choice([True, False]): 
            timestamp = generate_random_timestamp(current_time - datetime.timedelta(days=50), current_time)
        else:
            timestamp = generate_random_timestamp(current_time - datetime.timedelta(days=10), current_time)
        speed = int(random.uniform(0, 85) * 1.60934)  
        direction = random.randint(0, 360)
        data_point = {
            "timestamp": timestamp.strftime('%Y-%m-%d %H:%M:%S'), 
            "speed_kph": speed,
            "direction_degrees": direction
        }
        data.append(data_point)
    return data

if __name__ == "__main__":
  
    data = generate_data(1000)
    client = MongoClient('mongodb://localhost:27017/')
    db = client['smartcity']
    db.drop_collection('sensor_data')
    collection = db['sensor_data']

    collection.insert_many(data)

    print("Data has been inserted into MongoDB collection 'sensor_data'.")
