from gql import Client
from gql.transport.aiohttp import AIOHTTPTransport
from faker import Faker
import random
import json
from mutations import *
from queries import me
fake = Faker()
alcohols = ["BEER", "WINE", "VODKA"]
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
        self.id = data['register']['id']
        print(data)
    
    def login(self):
        data = self.getClient().execute(login, variable_values=self.toJson())
        self.token = data['login']['token']
        print(self.token)

    def updateLocation(self):
        (lat, lng) = fake.local_latlng(country_code='PL', coords_only=True)
        variable = {"longitude": float(lng), "latitude": float(lat)}
        data = self.getClient().execute(updateLocation, variable_values=json.dumps(variable))
        print(data)

    def queryMe(self):
        data = self.getClient().execute(me)
        print(data)
        return data

    def addFriend(self, id):
        variable = {"input": {"id": id}}
        data = self.getClient().execute(addFriend, variable_values=json.dumps(variable))
        print(data)

    def acceptFriendRequests(self):
        users = self.queryMe()['me']['friendRequests']
        for user in users:
            variable = {"input": {"id": str(user['id'])}}
            data = self.getClient().execute(acceptFriendRequest, variable_values=json.dumps(variable))
            print(data)

    def createGroup(self):
        friends = self.queryMe()['me']['friends']
        friends_id = list(map(lambda x: x['id'], friends))
        variable = {"usersId": friends_id}
        data = self.getClient().execute(createGroup, variable_values=json.dumps(variable))
        print(data)

    def acceptGroupRequests(self):
        groups = self.queryMe()['me']['groupInvitations']
        for group in groups:
            variable = {"input": {"groupId": str(group['id'])}}   
            data = self.getClient().execute(acceptGroupRequest, variable_values=json.dumps(variable))
            print(data)
