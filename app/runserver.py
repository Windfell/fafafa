from flask import render_template, make_response, abort
from app import app, db, db_filename
import os, string, random
from app.user.routes import *

app.register_blueprint(user, url_prefix='/user')

@app.route('/')
def index():
	token = ''.join(random.choice(string.ascii_letters + string.digits) for x in range(10))
	if login.current_user.is_anonymous():
	    user = None
	else:
	    user = login.current_user.json()
	response = make_response(render_template('index.html', user=user, token=token))
	response.set_cookie('token', token)
	return response

@app.before_request
def csrf_protect():
    if request.method == "POST":
    	try:
    	 	request.headers['Token']
    	except Exception, e:
    		abort(403)
    	try:
    		if request.headers['Token'] != request.cookies.get('token'):
    			abort(403)
    	except Exception, e:
    		pass

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8888, threaded=True)