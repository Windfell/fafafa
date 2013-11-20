FaFaFa
======
Flask // AngularJS // Foundation // Alembic // Facebook // Ansible
------------------------
Check out the demo at [fafafa.co](http://www.fafafa.co)

FaFaFa is meant to get you up and going as soon as possible with user authentication, Facebook integration, database migrations, and deployment

FaFaFa is a boilerplate application combining the following:
* [Flask](http://flask.pocoo.org/) - Python microframework
* [AngularJS](http://angularjs.org/) - Javascript framework
* [Foundation](http://foundation.zurb.com/) - Responsive front-end framework
* [Alembic](https://pypi.python.org/pypi/alembic) - Database migrations tool
* Facebook login integration
* [Ansible](http://www.ansibleworks.com/docs/) - Provisioning and deployment automation

It also includes a few extras:
* CSRF protection (slightly modified from [here](http://flask.pocoo.org/snippets/3/))
* Loading bar at the bottom of the header, integrated with all AngularJS POST requests (heavily inspired by [ngProgress](http://victorbjelkholm.github.io/ngProgress/)\)
* Profile page for linking / unlinking Facebook, and chaging usernames, passwords, and emails

Let's get started...

### First, let's set up the environment locally
1.  Clone this environment locally to /var/www/[project_name] in a virtualenv (I recommend [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/))
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

6.  Change the following block in /app/templates/index.html to your Google Analytics account information

        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-45881225-1', 'fafafa.co');
        </script>
7.  Test your application by running the following and going to [localhost:5555](http://localhost:5555)

        python runserver.py

### Now, let's set up deployment
1.  Spin up your droplet on DigitalOcean (I used Ubuntu 13.10 x64) or other VPS provider. If you already have a VPS set up (login as non-root with sudo access), you can skip steps 3-6. Make sure you change the user in ansible/provision.yml and ansible/deploy.yml.  
2.  Replace the link in ansible/hosts with your remote host ip
3.  Set up passwordless root login to the remote host. On a Linux machine, this can be done using
    
        ssh-keygen
        ssh-copy-id [ip address of remote host]

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

### Other Notes
* SASS is used here, but is not necessary in the least. Feel free to simply modify the css files in app/static/css. Otherwise, while developing locally, use the following command to generate the appropriate css. 

        sass -w /var/www/fafafa/app/static/sass/:/var/www/fafafa/app/static/css/
