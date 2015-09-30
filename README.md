# Tick-tack-toe #

 Tick-tack-toe (also known as Noughts and crosses or Xs and Os) is a game for two players, X and O, who take turns marking the spaces in infinite grid.
 The player who succeeds in placing five of their marks in a horizontal, vertical, or diagonal row wins the game.

##Quick start
Install all required packages:

    pip install -r requirements.txt

Put to your settings_local.py:
    
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_USE_TLS = True
    EMAIL_HOST = 'smtp.gmail.com'
    EMAIL_HOST_USER = 'example@gmail.com'
    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
    EMAIL_HOST_PASSWORD = 'example_password'
    EMAIL_PORT = 587
    ACCOUNT_ACTIVATION_DAYS = 1

Install all migrations:

    python manage.py migrate

Start django server:

    python manage.py runserver
    
Start tornado server:

    python manage.py async_server


## Back-End
* Django - using for register, auth, serve static files, show pages.
* TornadIO2 - using for transfer events from user to user on websocket.

## Front-End
* Bootstrap framework
* Socket.io.js

### Current bugs ###
* variable db (GameConnection, UserEventsConnection) not cleared
* does not work websocket (works only polling connection).
* the game is lost if the page has reloaded

### Plans ###
* Fix bugs
* Add the ability to view old games
* Add the rating system
* Add ability to save user's to favorite list
