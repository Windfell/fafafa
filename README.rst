FaFaFa
======
Flask // Angular // Foundation // Alembic // Facebook // Ansible
------------------------
Check out the demo at [fafafa.co](http://www.fafafa.co)

### First, let's set up the environment locally
1.  Clone this environment locally to /var/www/[project_name] in a virtualenv (I recommend virtualenvwrapper)
2.  Install the required python packages into the virtualenv

        pip install -r requirements.txt

3.  Set up sqlite
         
        alembic upgrade head
4.  Replace the appID and channelURL domain in app/static/js/app.js
         
        FB.init({
            appId      : '512587888752895', // App ID
            channelUrl : '//www.fafafa.co/static/vendor/channel.html', // Channel File
            status     : true, // check login status
            cookie     : true, // enable cookies to allow the server to access the session
            xfbml      : true  // parse XFBML
        });
5.  Change the following line in app/\__init\__.py
    
        app.secret_key = 'CHANGE_THIS'
6.  Test your application by running the following and going to [localhost:5555](http://localhost:5555)

        python runserver.py

### Now, let's set up deployment
1.  Spin up your droplet on DigitalOcean (I used Ubuntu 13.10 x64)
2.  Set up passwordless root login to the remote host. On a Linux machine, this can be done using
    
        ssh-keygen
        ssh-copy-id [ip address of remote host]

3.  Replace the link in ansible/hosts with your remote host ip
4.  Generate a sudo password for the non-root user (to be created) with
    
        openssl passwd -salt [salt] -1 [plaintext]
5.  Replace the password in ansible/vars.yml with your newly generated password
6.  In the ansible directory, let's set up the machine
    
        ansible-playbook initial.yml -i hosts
7.  Set up the environment
    
        ansible-playbook provision.yml -i hosts --ask-sudo-pass
8.  And deploy
    
        ansible-playbook deploy.yml -i hosts --ask-sudo-pass

Now, visit the ip address of your remote host, and the application should be running. 

### Model migrations
1.  Change either the User or Facebook models in app/user/models.py
2.  Generate the revision
        
        alembic revision --autogenerate -m "[Comment]"
3.  Run the revision
        
        alembic upgrade head
4.  Check in changes to your github repository
5.  On your next deploy, alembic will sync the changes made to your models