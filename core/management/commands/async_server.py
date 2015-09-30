__author__ = 'andrew'
# -*- coding: utf-8 -*-

import tornado
import tornadio2 as tornadio
from django.core.management.base import NoArgsCommand

from core.main import MyRouterConnection


class Command(NoArgsCommand):
    def handle_noargs(self, **options):
        router = tornadio.TornadioRouter(MyRouterConnection)
        app = tornado.web.Application(
            router.urls,
            socket_io_port=8989
        )
        tornadio.SocketServer(app)
