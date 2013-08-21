from google.appengine.api import mail

class MailMessage(object):

    def __init__(self,
                    subject='Oppdatering fra NTNUI Telemark-Alpint',
                    sender='NTNUI Telemark-Alpint <webmaster@ntnuita.no>',
                    to=None,
                    body=''
                    ):
        self.message = mail.EmailMessage(sender=sender, subject=subject, to=to, body=body)

    def send(self):
        self.message.send()