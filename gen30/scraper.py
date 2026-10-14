import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    json_array = []

    try:
        with open(csv_file_path, mode='r') as csv_file:
            csv_reader = csv.reader(csv_file)
            next(csv_reader)  # Skip the header row
            for row in csv_reader:
                if row:  # Ensure the row is not empty
                    try:
                        json_object = {
                            "position": {
                                "lat": float(row[2]),
                                "lng": float(row[3])
                            }
                        }
                        json_array.append(json_object)
                    except ValueError as ve:
                        print(f"Skipping row {row} due to conversion error: {ve}")

        with open(json_file_path, mode='w') as json_file:
            json.dump(json_array, json_file, indent=4)
        print(f"Data successfully written to {json_file_path}")
    except Exception as e:
        print(f"Error: {e}")

csv_file_path = 'chipotle.csv'  # Path to your CSV file
json_file_path = 'chipotle.json'  # Path to your desired JSON file

csv_to_json(csv_file_path, json_file_path)
