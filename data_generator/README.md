### set up env
```bash
    virtualenv -p python3 venv
    source venv/bin/activate
    pip3 install -r requirements.txt
```

### run
```bash
    python3 generate_data.py
```

### update requirements
```bash
    pip3 freeze > requirements.txt
```