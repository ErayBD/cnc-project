from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app.config import Config
from flask_session import Session
import atexit
import os
import shutil

db = SQLAlchemy()

# starts the app
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    Session(app)

    from app.home.routes import main
    app.register_blueprint(main)

    atexit.register(cleanup_files)
    return app

# section 1, deletes temporarily created graphs and started sessions at each close
def cleanup_files():
    directories = ['app/static/graphs', 'flask_session']
    for directory in directories:
        if os.path.exists(directory):
            shutil.rmtree(directory, ignore_errors=True)
            print(f"Cleaned up directory: {directory}")
