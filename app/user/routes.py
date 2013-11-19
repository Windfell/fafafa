import json
from flask.ext import login 
from flask import Blueprint, request, jsonify
from app import db
from app.user.models import Facebook, User, validate

user = Blueprint('user', __name__)

@user.route('/fb', methods=['POST'])
def fb():
    data = json.loads(request.data)
    fb_user = data['user']
    
    new_facebook = False
    try:
        facebook = Facebook.query.filter(Facebook.id_fb == fb_user['id'])[0]
    except Exception, e:
        new_facebook = True

    # Logged out user -> log them in
    # Logged in user -> make sure fb account isn't linked elsewhere, otherwise link it
    if login.current_user.is_anonymous():
        if new_facebook:
            try:
                # Check if username exists, create a unique one if so
                existing_user = User.query.filter(User.username == fb_user['username'])[0]
                new_username = fb_user['username'] + fb_user['id']
            except Exception, e:
                new_username = fb_user['username']
            user = User(new_username, fb_user['email'])
            db.session.add(user)
            try:
                db.session.commit()
            except Exception, e:
                print e
                return jsonify(result='error', error='email')
            facebook = Facebook(user.id, fb_user['id'])
        else:
            user = User.query.filter(User.facebook == facebook)[0]
    else:
        user = login.current_user
        if new_facebook:
            facebook = Facebook(user.id, fb_user['id'])
        else:
            try:
                facebook = user.facebook
            except Exception, e:
                # User is logged in and the facebook account exists, but is not linked to
                # the current account
                return jsonify(result='error', error='linked')

    # Update FB information
    facebook.first_name = fb_user['first_name']
    facebook.last_name = fb_user['last_name']
    facebook.gender = fb_user['gender']
    facebook.locale = fb_user['locale']
    facebook.location = fb_user['location']['name']
    facebook.timezone = fb_user['timezone']
    facebook.username = fb_user['username']

    if new_facebook:
        db.session.add(facebook)
    db.session.commit()
    
    if login.current_user.is_anonymous():
        login.login_user(user)
    return jsonify(result='success', user= user.json())

@user.route('/fb/unlink', methods=['POST'])
def fb_unlink():
    # Only remove account if they have a password to fall back on
    if login.current_user.password_hash:
        user = login.current_user
        facebook = user.facebook
        db.session.delete(facebook)
        db.session.commit()
        return jsonify(result = 'success', user = user.json())
    else:
        return jsonify(result = 'error', error = 'no_password')

@user.route('/change', methods=['POST'])
def user_change_info():
    data = json.loads(request.data)        
    user = login.current_user
    errors = validate(email = data['user']['email'], username = data['user']['username'])
    if len(errors) == 0:
        user.email = data['user']['email']
        user.username = data['user']['username']
        try:
            db.session.commit()
        except Exception, e:
            return jsonify(result = 'error', exists = True)
        return jsonify(result='success', user= user.json())
    else:
        return jsonify(result = 'error', errors= errors)

@user.route('/password', methods=['POST'])
def user_change_password():
    data = json.loads(request.data) 
    if data['password1'] == data['password2']:
        user = login.current_user
        errors = validate(password = data['password1'])
        if len(errors) == 0:
            user.set_password(data['password1'])
            db.session.commit()
            return jsonify(result = 'success', user = user.json())
    return jsonify(result = 'error', error = 'password')

@user.route('/logout', methods=['POST'])
def user_logout():
    login.logout_user()
    return jsonify(result = 'success')     

@user.route('/login', methods=['POST'])
def user_login():
    data = json.loads(request.data)        
    try:
        user = User.query.filter(User.email==data['email'])[0]
    except:
        return jsonify(result = 'error', error = 'not_found')
    if user.password_hash is None:
        return jsonify(result =  'error', error = 'fb')
    if user.check_password(data['password']):
        login.login_user(user)
        return jsonify(result = 'success', user = user.json())
    else:
        return jsonify(result = 'error', error = 'password')

@user.route('/register', methods=['POST'])
def user_register():
    data = json.loads(request.data)        
    errors = validate(username = data['username'], email = data['email'], password = data['password'])
    if len(errors) == 0:
        user = User(data['username'], data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        try:
            db.session.commit()
        except Exception, e:
            return jsonify(result = 'error', exists = True)
        login.login_user(user)
        return jsonify(result = 'success', user = user.json())
    else:
        errors['result'] = 'error'
        return json.dumps(errors)



