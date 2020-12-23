### set up env
```bash
    virtualenv -p python3 venv
    source venv/bin/activate
    pip3 install -r requirements.txt
```

### generate data
```bash
    python3 generate_data.py
```

### simulate traffic
```bash
    python3 simulate_traffic.py
```

### update requirements
```bash
    pip3 freeze > requirements.txt
```