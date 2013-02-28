from articles.views import SingleArticlePageQuery
from events.views import NextEventsQuery
from general.constants import STATIC_DIR, LOGIN_URL, MEDIA_DIR, GRAPHICS_DIR, \
    JOIN_URL, LEAVE_URL
from general.feedback import get_feedback
from general.models import SponsorsQuery

def get_feedback_code(get_dict):
    urlcode = None
    if get_dict:
        urlcode = get_dict.keys()[0]
    return urlcode

def default(request):
    feedback_code = get_feedback_code(request.GET)
    feedback = get_feedback(feedback_code)
    context = {
        'sponsors': SponsorsQuery.get_cached(),
        'next_events': NextEventsQuery.get_cached(),
        'STATIC_DIR': STATIC_DIR,
        'MEDIA_DIR': MEDIA_DIR,
        'GRAPHICS_DIR': GRAPHICS_DIR,
        'LOGIN_URL': LOGIN_URL,
        'JOIN_URL': JOIN_URL,
        'LEAVE_URL': LEAVE_URL,
        'subpages': SingleArticlePageQuery.get_cached(),
        'feedback': feedback,
    }
    return context