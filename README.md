# CNC Project

## Getting Started

### Prerequisites
* Python
* PostgreSQL

<br>

### Installation
#### 1. Clone the project
* ```git clone https://github.com/eraybd/cnc_project.git```

#### 2. Go to the project directory
* ```cd ../cnc_project```

#### 3. Install libraries
* ```pip install -r requirements.txt```

<br>

### Database Setup
#### 1. Create database
* Create database named as "anomaly_graph"

#### 2. Restore database
* Right click on the “anomaly_graph” database and select “Restore”
* For the “Filename” section, point to the “db.sql” file found in the project files
* Click on the “Restore” button

### 3. Modify config.py
* Change the relevant part in the “config.py” according to your PostgreSQL setup <br>
```SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:username@localhost/database'```

<br>

### Run
#### 1. Go to the project directory
* ```cd cnc_project```

#### 2. Run the project
* ```python run.py```
