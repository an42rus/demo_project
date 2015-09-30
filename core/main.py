import time
from tornadio2 import SocketConnection, event


class GameConnection(SocketConnection):
    """
        Connection for transfer game events from user to user.
    """

    # Todo: add database
    db = {}
    random_games = []

    @event('get_game')
    def on_get_game(self, game_id, user_id):
        """
        Method for create game when both users was connected.

        :param game_id: game id
        :param user_id: user id
        :return: None
        """
        if not game_id:
            if self.random_games:
                other_user_rand_games = filter(lambda x: x[1] != user_id, self.random_games)
                user_rand_games = filter(lambda x: x[1] == user_id, self.random_games)
                if other_user_rand_games:
                    _game = other_user_rand_games.pop()
                    game_id = _game[0]
                    self.random_games.remove(_game)
                if user_rand_games:
                    game_id = user_rand_games.pop()[0]
            else:
                game_id = str(int(time.time()*1000))
                self.random_games.append((game_id, user_id))

        if not self.db.get(game_id) or not game_id:
            self.db[game_id] = {
                "status": 0,
                "user1_id": None,
                "user2_id": None,
                "user1_session": None,
                "user2_session": None,
            }
        game = self.db.get(game_id)
        user1 = game.get('user1_session')
        user2 = game.get('user2_session')

        if not user1:
            game['user1_id'] = user_id
            game['user1_session'] = self
        elif not user2 and user_id != game['user1_id']:
            game['user2_id'] = user_id
            game['user2_session'] = self
        elif user_id == game['user1_id']:
            game['user1_session'] = self
        elif user_id == game['user2_id']:
            game['user2_session'] = self

        user1 = game.get('user1_session')
        user2 = game.get('user2_session')
        game_status = game.get('status')

        if user1 and user2 and game_status == 0:
            user1.emit('settings', {"user": 1, "game_id": game_id})
            user2.emit('settings', {"user": 2, "game_id": game_id})
            game[user1.session.session_id] = user2
            game[user2.session.session_id] = user1
            game['status'] = 1

    @event('step')
    def on_step(self, game_id, x, y):
        """
        Method for transfer step to the opponent.

        :param game_id: game id
        :param x: x coordinate of step
        :param y: y coordinate of step
        :return: None
        """
        opponent = self.db.get(game_id).get(self.session.session_id)
        opponent.emit("step", x=x, y=y)

    @event('end_game')
    def on_end_game(self, game_id):
        """
        Method for clear db variable when game was ended.

        :param game_id: game id
        :return: None
        """
        if game_id in self.db:
            del self.db[game_id]

    def on_close(self):
        """
        Method for notify user when opponent has disconnected.

        :return: None
        """
        games = filter(lambda x: self.session.session_id in self.db[x], self.db)
        for game in games:
            opponent = self.db.get(game).get(self.session.session_id)
            opponent.emit('opponent_disconnected', 'Opponent disconected')

            # remove games where opponent was disconnected
            # if self.db.get(game):
            #     del self.db[game]


class UserEventsConnection(SocketConnection):
    """
        Connection for transfer user events from user to user.
    """
    db = {}

    @event('authenticate')
    def on_authenticate(self, user_id, username):
        """
        Method for save info about user

        :param user_id: user id
        :param username: username
        :return: None
        """
        self.db[user_id] = {
            'session': self,
            'username': username
        }

    def get_user_dict(self, user_id):
        """
        Method for get user info from db.

        :param user_id: user id
        :return: user dict
        """
        user_dict = {}
        user = self.db.get(user_id)
        if user:
            user_dict['id'] = user_id
            user_dict['username'] = user.get('username')
        return user_dict

    @event('invite')
    def on_invite(self, from_user, to_user):
        """
        Method for emit "invite" event to the opponent

        :param from_user: user who send invite
        :param to_user: user who receive invite
        :return: None
        """
        _to_user = self.db.get(to_user)
        if _to_user:
            _to_user.get('session').emit(
                'invite',
                {
                    'from_user': self.get_user_dict(from_user),
                    'to_user': self.get_user_dict(to_user)
                }
            )

    @event('text_message')
    def on_text_message(self, from_user, to_user):
        """
        Method for emit "message" event to the opponent

        :param from_user: user who send message
        :param to_user: user who receive message
        :return: None
        """
        _to_user = self.db.get(to_user)
        if _to_user:
            _to_user.get('session').emit(
                'text_message',
                {
                    'from_user': from_user,
                    'to_user': to_user
                }
            )

    @event('invite_accept')
    def on_invite_accept(self, from_user, to_user):
        """
        Method for emit "invite_accepted" event to both users.
        After "invite_accepted" event both users should be replaced to game page.

        :param from_user: user who send invite
        :param to_user: user who receive invite
        :return: None
        """
        _to_user = self.db.get(to_user)
        game_id = int(time.time()*1000)
        if _to_user:
            _to_user.get('session').emit(
                'invite_accepted',
                {
                    'from_user': from_user,
                    'to_user': to_user,
                    'game_id': game_id
                }
            )
        _from_user = self.db.get(from_user)
        if _from_user:
            _from_user.get('session').emit(
                'invite_accepted',
                {
                    'from_user': from_user,
                    'to_user': to_user,
                    'game_id': game_id
                }
            )


class MyRouterConnection(SocketConnection):
    """
        Router for GameConnection and UserEventsConnection.
    """
    __endpoints__ = {'/game/': GameConnection,
                     '/events/': UserEventsConnection}
