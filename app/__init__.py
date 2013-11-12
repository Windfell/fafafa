from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext import login
import env, os, ast

app = Flask(__name__)
app.debug = ast.literal_eval(os.environ['DEBUG'])
app.secret_key = os.environ['SECRET_KEY']
db_filename = 'db.db'
protocol_prefix = 'sqlite:///'
app.config['SQLALCHEMY_DATABASE_URI'] = protocol_prefix + db_filename
db = SQLAlchemy(app)

# Flask-Login
login_manager = login.LoginManager()
login_manager.setup_app(app)