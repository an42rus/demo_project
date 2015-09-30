from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import ListView, TemplateView
from django.contrib.auth.models import User


class IndexPage(TemplateView):
    template_name = 'index.html'

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(IndexPage, self).dispatch(*args, **kwargs)


class PlayerList(ListView):
    model = User
    template_name = 'core/player_list.html'
    paginate_by = 15

    def get_queryset(self):
        # exclude request.user from player list
        return self.model.objects.exclude(id=self.request.user.id)

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(PlayerList, self).dispatch(*args, **kwargs)


class Game(TemplateView):
    template_name = 'core/game.html'

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(Game, self).dispatch(*args, **kwargs)
