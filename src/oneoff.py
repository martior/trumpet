from src.models import Zone

def main():
    message = Zone()
    message.user_zone ="test"
    message.user_token ="test"
    message.message_text ="test"
    message.put()
if __name__ == '__main__':
    main()
