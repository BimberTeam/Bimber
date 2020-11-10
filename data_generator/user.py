from gql import Client
from gql.transport.aiohttp import AIOHTTPTransport
from faker import Faker
import random
import json
from mutations import register, login
from queries import me
fake = Faker()
alcohols = ["BEER", "WINE", "VODKA", "OTHER"]
genders = ["MALE", "FEMALE"]
gender_preferences = ["MALE", "FEMALE", None]

class User(object):
    def __init__(self):
        self.name = fake.name()
        self.email = fake.email()
        self.password = "123456"
        self.age = random.randint(18, 99)
        self.favoriteAlcoholName = fake.word()
        self.favoriteAlcoholType = random.choice(alcohols)
        self.description = fake.text()
        self.gender = random.choice(genders)
        self.genderPreference = random.choice(gender_preferences)
        self.alcoholPreference = random.choice(alcohols)
        self.agePreferenceFrom = random.randint(18, 98)
        self.agePreferenceTo = random.randint(self.agePreferenceFrom, 99)
        self.token = None

    def getClient(self):
        transport = AIOHTTPTransport(url="http://192.168.68.239:4001/graphql")
        if self.token != None:
            transport = AIOHTTPTransport(url="http://192.168.68.239:4001/graphql", headers={'Authorization': str(self.token)})
        client = Client(transport=transport, fetch_schema_from_transport=True)
        return client

    def toJson(self):
        return json.dumps(self.__dict__)

    def register(self):
        data = self.getClient().execute(register, variable_values=self.toJson())
        print(data)
    
    def login(self):
        data = self.getClient().execute(login, variable_values=self.toJson())
        self.token = data['login']['token']
        print(self.token)

    def queryMe(self):
        data = self.getClient().execute(me)
        print(data)
