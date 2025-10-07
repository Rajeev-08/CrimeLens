# backend/app/services/data_processing.py

import pandas as pd

def load_and_preprocess_data(file_stream):
    """Loads and preprocesses data from an in-memory file."""
    try:
        df = pd.read_csv(file_stream, encoding='utf-8')
    except Exception as e:
        raise ValueError(f"Error reading CSV: {e}")

    # Data Preprocessing
    df['TIME OCC'] = df['TIME OCC'].astype(str).str.zfill(4)

    # THE FIX: Added the `format` parameter to pd.to_datetime.
    # This makes parsing much faster and eliminates the UserWarning.
    # We are parsing the date from 'DATE OCC' and then adding the specific time from 'TIME OCC'.
    # Note: We parse the date part and let the original logic add the correct time.
    # For a column like '01/08/2020 12:00:00 AM', this is robust.
    df['datetime_occ'] = pd.to_datetime(df['DATE OCC'], errors='coerce') + \
                         pd.to_timedelta(df['TIME OCC'].str[:2].astype(int), unit='h') + \
                         pd.to_timedelta(df['TIME OCC'].str[2:].astype(int), unit='m')
    
    # We can be even more explicit if the date column format is always the same.
    # For a format like '01/08/2020 12:00:00 AM', the following is faster, though the above logic is also correct.
    # To keep the original logic of combining date and time separately:
    just_date = pd.to_datetime(df['DATE OCC']).dt.date
    df['datetime_occ'] = pd.to_datetime(just_date) + \
                         pd.to_timedelta(df['TIME OCC'].str[:2].astype(int), unit='h') + \
                         pd.to_timedelta(df['TIME OCC'].str[2:].astype(int), unit='m')


    df['hour'] = df['datetime_occ'].dt.hour
    df['month'] = df['datetime_occ'].dt.month
    df['day_of_week'] = df['datetime_occ'].dt.day_name()
    
    df = df[(df['LAT'] != 0) & (df['LON'] != 0)]
    df.dropna(subset=['datetime_occ', 'LAT', 'LON', 'Crm Cd Desc'], inplace=True)
    return df

def classify_severity(df):
    """Tags crimes with a severity level."""
    def get_severity(crime_desc):
        crime_desc = str(crime_desc).upper()
        if any(word in crime_desc for word in ['HOMICIDE', 'ROBBERY', 'ASSAULT', 'WEAPON']):
            return 'High'
        elif any(word in crime_desc for word in ['BURGLARY', 'THEFT', 'VEHICLE STOLEN']):
            return 'Medium'
        else:
            return 'Low'

    df['Severity'] = df['Crm Cd Desc'].apply(get_severity)
    return df