## Getting Started

Follow the steps below to set up and run the project on your local machine.

### 1. Prerequisites
- Python 3.8 or later
- PostgreSQL
- pip (Python package installer)

<br>

### 2. Installation
#### Clone the project
- ```git clone https://github.com/eraybd/cnc-project.git```

#### Install the required Python packages
- ```cd cnc-project```
- ```pip install -r requirements.txt```

<br>

### 3. Configuration
#### Create database
- Create database named as "anomaly_graph" (if a change is made, it must also be changed in the code as well)

#### Modify config.py
- Change the relevant part in the “config.py” according to your PostgreSQL setup <br>
- ```SQLALCHEMY_DATABASE_URI = 'postgresql://username:password@localhost/anomaly_graph'```

<br>

### 4. Running the Application
#### Run the project
* ```python run.py```

<br>

### 5. Using the Application
#### Graph Generation
- On the home page, select the data source type and configure the number of rows and columns for displaying graphs.
- Choose the X and Y axes from the dropdown menus.
- Select the type of graph you want to generate (scatter, bar, line, or histogram).
- Click "Grafiği Göster" (Show the Graph) to generate the graph.
- Use the "Sıfırla" (Reset) button to clear the generated graphs.
  
#### Anomaly Detection
- The "Anomaly Tablosu" (Anomaly Table) section displays data from the database where anomalies are detected.
- The table can be sorted by clicking on the column headers.

#### Feature Comparison
- In the "Feature Seçimi" (Feature Selection) section, select the features you want to compare between train and test datasets.
- The graphs are updated dynamically based on the selected features and month.

#### Prediction vs Actual Comparison
- In the "Actual ve Prediction Değerleri" (Actual and Prediction Values) section, select features, model, and month to compare the actual vs. predicted data.
- The graphs update automatically based on your selections.

<br>

### 6. Project Screenshots
![all_new](https://github.com/user-attachments/assets/0964975b-ca5f-4a8e-a54a-678bbdf14a1a)


