from src.models import Feed, Station

def main():

    station = Station.all().fetch(limit=1)[0]
    for feed in Feed.all().fetch(limit=100):
        station.feeds.append(feed.key())
    station.put()
if __name__ == '__main__':
    main()
