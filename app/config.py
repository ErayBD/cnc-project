class Config:
    SECRET_KEY = '5791628bb0b13ce0c676dfde280ba245'
    SESSION_TYPE = 'filesystem'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:eraybd@localhost/anomaly_graph'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
