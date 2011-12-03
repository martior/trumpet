from src.models import Message, Site

def main():
    message = Message()
    message.title ="Site maintenance tonight from 10:00 CET"
    message.put()
if __name__ == '__main__':
    main()
