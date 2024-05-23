# Anomaly Graph


## Getting Started

### Prerequisites
* Python
* Flask
* PostgreSQL

<br>

### Installation
#### 1. Clone the project
* ```git clone https://github.com/eraybd/anomaly-graph.git```

#### 2. Go to the project directory
* ```cd anomaly-graph```

#### 3. Install libraries
* ```pip install -r requirements.txt```

<br>

### Database Config
#### 1. Modify 'config.py' file
* ```SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:username@localhost/database'```

#### 2. Connect to database via terminal
* ```psql -U postgres -d database_name -h localhost```

#### 3. Create table on database via SQL Query Tool
```
CREATE TABLE anomaly_table (
    index TIMESTAMP,
    loss_mae FLOAT,
    threshold FLOAT,
    anomaly BOOLEAN,
    titresim_x FLOAT,
    titresim_y FLOAT,
    titresim_z FLOAT,
    acisal_hiz_x FLOAT,
    acisal_hiz_y FLOAT,
    acisal_hiz_z FLOAT,
    manyetik_x FLOAT,
    manyetik_y FLOAT,
    manyetik_z FLOAT,
    aci_x FLOAT,
    aci_y FLOAT,
    aci_z FLOAT,
    isi FLOAT,
    quaternion_q0 FLOAT,
    quaternion_q1 FLOAT,
    quaternion_q2 FLOAT,
    quaternion_q3 FLOAT,
    temperature_data FLOAT,
    alarm2 FLOAT,
    alm_no1 FLOAT,
    alm_no2 FLOAT,
    alm_no3 FLOAT,
    alm_no4 FLOAT,
    alm_no5 FLOAT,
    alm_no6 FLOAT,
    alm_no7 FLOAT,
    alm_no8 FLOAT,
    alm_no9 FLOAT,
    alm_no10 FLOAT,
    status_info_dummy FLOAT,
    status_info_tmmode FLOAT,
    status_info_aut FLOAT,
    status_info_run FLOAT,
    status_info_motion FLOAT,
    status_info_mstb FLOAT,
    status_info_emergency FLOAT,
    status_info_alarm FLOAT,
    status_info_edit FLOAT,
    alarm_value FLOAT,
    x_current FLOAT,
    y_current FLOAT,
    jogspeed FLOAT,
    spdspeed FLOAT,
    feedrate FLOAT,
    spindle_load_meter FLOAT,
    spindle_motor_speed FLOAT,
    spindle_speed FLOAT,
    spindle_speed_gotfrommotorspeed FLOAT,
    operation_mode FLOAT,
    spindle_avg_load_meter FLOAT,
    absolute_position_x FLOAT,
    machine_position_x FLOAT,
    relative_position_x FLOAT,
    distance_to_go_x FLOAT,
    absolute_position_z FLOAT,
    machine_position_z FLOAT,
    relative_position_z FLOAT,
    distance_to_go_z FLOAT,
    spindle_alarm_data FLOAT
);
```

#### 4. Import the .csv file in the static\data to the database
* ```\copy table_name FROM 'data.csv' DELIMITER ',' CSV HEADER;```

<br>

### Run
#### 1. Go to the project directory
* ```cd anomaly-graph```

#### 2. Run the project
* ```python run.py```
