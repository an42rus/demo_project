__author__ = 'andrew'

from django import template

register = template.Library()

def field_attr(value, arg):
    attrs = value.field.widget.attrs

    # data = arg.replace(' ', '')
    # print data

    kvs = arg.split(',')

    for string in kvs:
        kv = string.split(':')
        attrs[kv[0]] = kv[1]

    rendered = str(value)

    return rendered


register.filter('field_attr', field_attr)
