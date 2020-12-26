from gql import Client
from gql.transport.aiohttp import AIOHTTPTransport
from faker import Faker
import pycristoforo as pyc
import random
import json
from mutations import *
from queries import *
import urllib.request
import os
import requests

GRAPHQL_URL="http://0.0.0.0:4001/graphql"
IMAGE_SERVER="http://0.0.0.0:8080/images/"
fake = Faker()
locations = []
alcohols = ["BEER", "WINE", "VODKA"]
genders = ["MALE", "FEMALE"]
gender_preferences = ["MALE", "FEMALE", None]

def get_random_cords(country):
    country_shape = pyc.get_shape(country)
    points = pyc.geoloc_generation(country_shape, 1, country)
    return points[0]['geometry']['coordinates']

class User():
    @classmethod
    def from_dict(cls, dict_user):
        user = cls.__new__(cls) 
        user.name = dict_user['name']
        user.email = dict_user['email']
        user.password = "123456"
        user.token = None
        return user

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
        transport = AIOHTTPTransport(url=GRAPHQL_URL)
        if self.token != None:
            transport = AIOHTTPTransport(url=GRAPHQL_URL, headers={'Authorization': str(self.token)})
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
        global locations
        [lat, lng] = get_random_cords("Poland")
        while [lat, lng]  in locations:
            [lat, lng]  = fake.local_latlng(country_code='PL', coords_only=True)
        locations.append([lat, lng] )
        variable = {"longitude": float(lng), "latitude": float(lat)}
        data = self.getClient().execute(updateLocation, variable_values=json.dumps(variable))
        print(data)

    def uploadImage(self):
        urllib.request.urlretrieve("https://picsum.photos/500/700", "user.jpg")
        files = {'file': open('user.jpg', 'rb')}
        headers = {'Authorization': self.token}
        response = requests.post(IMAGE_SERVER + self.id, files=files, headers=headers)
        print(response)
        os.remove("user.jpg")

    def queryMe(self):
        data = self.getClient().execute(me)
        return data['me']

    def groupSuggestions(self, limit, suggestions_range):
        variable = {"limit": limit, "range": suggestions_range}
        data = self.getClient().execute(groupSuggestions, variable_values=json.dumps(variable))
        return data['suggestGroups']

    def swipeToLike(self, id):
        variable = {"groupId": id}
        data = self.getClient().execute(swipeToLike, variable_values=json.dumps(variable))
        print(data)

    def swipeToDislike(self, id):
        variable = {"groupId": id}
        data = self.getClient().execute(swipeToDislike, variable_values=json.dumps(variable))
        print(data)

    def addFriend(self, id):
        variable = {"input": {"id": id}}
        data = self.getClient().execute(addFriend, variable_values=json.dumps(variable))
        print(data)

    def acceptFriendRequest(self, id):
        variable = {"input": {"id": str(id)}}
        data = self.getClient().execute(acceptFriendRequest, variable_values=json.dumps(variable))
        print(data)

    def denyFriendRequest(self, id):
        variable = {"input": {"id": str(id)}}
        data = self.getClient().execute(denyFriendRequest, variable_values=json.dumps(variable))
        print(data)

    def createGroup(self, user_ids):
        variable = {"usersId": user_ids}
        data = self.getClient().execute(createGroup, variable_values=json.dumps(variable))
        print(data)

    def acceptGroupRequest(self, id):
        variable = {"input": {"groupId": id}}
        data = self.getClient().execute(acceptGroupRequest, variable_values=json.dumps(variable))
        print(data)

    def rejectGroupRequest(self, id):
        variable = {"input": {"groupId": id}}
        data = self.getClient().execute(rejectGroupRequest, variable_values=json.dumps(variable))
        print(data)

    def vote_for(self, group_id, user_id):
        variable = {"groupId": group_id, "userId": user_id}
        data = self.getClient().execute(voteFor, variable_values=json.dumps(variable))
        print(data)

    def vote_against(self, group_id, user_id):
        variable = {"groupId": group_id, "userId": user_id}
        data = self.getClient().execute(voteAgainst, variable_values=json.dumps(variable))
        print(data)

    def sendChatMessage(self, group_id):
        variable = {"groupId": group_id, "message": fake.sentence()}
        data = self.getClient().execute(sendChatMessage, variable_values=json.dumps(variable))
        print(data)

    def showGroupCandidate(self, group_id):
        variable = {"id": group_id}
        data = self.getClient().execute(groupCandidates, variable_values=json.dumps(variable))
        return data['groupCandidates']