### Setup env
```bash
    virtualenv -p python3 venv
    source venv/bin/activate
    pip3 install -r requirements.txt
```

### Generate data
```bash
    venv/bin/python3 generate_data.py --users number_of_users
```

### Simulate traffic
```bash
    venv/bin/python3 simulate_traffic.py --users number_of_users --swipes number_of_swipes
```

### Update requirements
```bash
    pip3 freeze > requirements.txt
```
