from app import db, login_manager
from flask.ext import login 
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from blinker import signal

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

@login.user_logged_in.connect
def update_login(app, user):
    user.time_last_login = datetime.datetime.utcnow()
    db.session.commit()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(200))
    facebook = db.relationship("Facebook", uselist=False, backref="user")

    time_signup = db.Column(db.DateTime)
    time_last_login = db.Column(db.DateTime)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def json(self):
		result =  {
		    'username': self.username,
		    'email': self.email,
		    'time_signup': self.time_signup.isoformat()
		}
		try:
		    result['facebook'] = self.facebook.json()
		except Exception, e:
			result['facebook'] = False
		result['password'] = True if self.password_hash else False
		return result

    def __init__(self, username, email):
        self.username = username
        self.email = email
        self.time_signup = datetime.datetime.utcnow()

    def __repr__(self):
        return '<User %r>' % self.username

    # Flask-Login integration
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id

class Facebook(db.Model):
    __tablename__ = 'facebook'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    username = db.Column(db.String(40))
    id_fb = db.Column(db.Integer)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    gender = db.Column(db.String(8))
    locale = db.Column(db.String(6))
    location = db.Column(db.String(50))
    timezone = db.Column(db.Integer)

    def __init__(self, user_id, id_fb):
        self.user_id = user_id
        self.id_fb = id_fb

    def json(self):
        return {
            'id_fb': self.id_fb,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'gender': self.gender,
            'locale': self.locale,
            'location': self.location,
            'timezone': self.timezone
        }

def validate(email = None, password = None, username = None):
    errors = {}
    if email and '@' not in email:
        errors['email'] = True
    if password and len(password) < 4:
        errors['password'] = True
    if username and (len(username) < 3 or len(username) > 15):
        errors['username'] = True 
    return errors

