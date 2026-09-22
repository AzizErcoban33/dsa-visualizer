# DSA Visualizer

DSA Visualizer is an interactive Django website for exploring common data
structures and algorithms. It animates comparisons, swaps, searches, and graph
traversals so that each step is easier to understand.

The project currently includes visualizations for:

- Bubble sort
- Selection sort
- Insertion sort
- Quick sort
- Merge sort
- Linear search
- Binary search
- Breadth-first search (BFS)
- Depth-first search (DFS)

## Requirements

Install the following software before setting up the project:

- Python 3.10 or newer
- pip, which is normally included with Python
- Git, if you want to clone the repository instead of downloading a ZIP file
- A modern browser such as Chrome, Edge, Firefox, or Safari

Node.js, npm, and a separate database server are not required. The project uses
Django's built-in development server and a local SQLite database.

## Download the project

### Option 1: Clone with Git

Open a terminal and run:

```bash
git clone https://github.com/AzizErcoban33/dsa-visualizer.git
cd dsa-visualizer
```

### Option 2: Download a ZIP file

1. Open the repository on GitHub.
2. Select **Code**, then **Download ZIP**.
3. Extract the downloaded ZIP file.
4. Open a terminal inside the extracted `dsa-visualizer` folder.

## Windows setup

### PowerShell

Create a virtual environment:

```powershell
py -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the project dependency:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Prepare and validate the project:

```powershell
python manage.py migrate
python manage.py check
```

Start the website:

```powershell
python manage.py runserver
```

### Command Prompt

If you use Command Prompt instead of PowerShell, activate the virtual
environment with:

```bat
.venv\Scripts\activate.bat
```

Then use the same `python -m pip` and `python manage.py` commands shown above.

## macOS setup

Open Terminal in the project folder and create a virtual environment:

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

Install the dependency, prepare the database, and validate the project:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py check
```

Start the website:

```bash
python manage.py runserver
```

## Linux setup

Open a terminal in the project folder and create a virtual environment:

```bash
python3 -m venv .venv
```

If that command reports that the `venv` module is unavailable on Ubuntu or
Debian, install it first:

```bash
sudo apt update
sudo apt install python3-venv
```

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Install the dependency, prepare the database, and validate the project:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py check
```

Start the website:

```bash
python manage.py runserver
```

## Open the website

After starting the server, open this address in your browser:

```text
http://127.0.0.1:8000/
```

Keep the terminal window open while using the site. Stop the server by pressing
`Ctrl+C` in that terminal.

## Run without activating the virtual environment

Activating the environment is convenient but optional. You can call its Python
executable directly.

On Windows:

```powershell
.\.venv\Scripts\python.exe manage.py runserver
```

On macOS or Linux:

```bash
.venv/bin/python manage.py runserver
```

## Use a different port

Port `8000` is Django's default. If it is already being used, choose another
port, such as `8080`:

```bash
python manage.py runserver 8080
```

Then open `http://127.0.0.1:8080/`.

## Updating an existing clone

From the project folder, download the latest committed changes:

```bash
git pull
```

Activate the virtual environment and reinstall the requirements in case they
changed:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py check
```

## Project structure

```text
dsa-visualizer/
├── dsa_lab/                  # Django project settings and root routes
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── visualizer/               # Visualizer app, views, and API routes
│   ├── apps.py
│   ├── urls.py
│   └── views.py
├── templates/visualizer/
│   └── dashboard.html        # Main page template
├── static/
│   ├── css/app.css           # Application styles
│   └── js/app.js             # Visualizations and interactions
├── manage.py                 # Django command-line entry point
└── requirements.txt          # Python dependencies
```

## Useful development commands

Check the Django configuration:

```bash
python manage.py check
```

Run the server on all local network interfaces:

```bash
python manage.py runserver 0.0.0.0:8000
```

The current development settings only allow `localhost` and `127.0.0.1` as
hostnames. To access the site from another device, add the computer's local IP
address to `ALLOWED_HOSTS` in `dsa_lab/settings.py`. Only expose the development
server on a trusted private network.

## Troubleshooting

### `python` or `py` is not recognized

Install Python from [python.org](https://www.python.org/downloads/) and make sure
the installer adds Python to your system path. On macOS and Linux, use
`python3` when `python` is unavailable.

### PowerShell blocks virtual-environment activation

You can use Command Prompt with `.venv\Scripts\activate.bat`, or skip activation
and run `.\.venv\Scripts\python.exe` directly as shown above.

### `No module named django`

Make sure the virtual environment is active, then run:

```bash
python -m pip install -r requirements.txt
```

### Port 8000 is already in use

Start Django on a different port:

```bash
python manage.py runserver 8080
```

### Static files are missing

Make sure Django was started from the repository root—the folder containing
`manage.py`. In development, Django serves the files from the `static` folder
automatically.

## Development note

This configuration uses Django's development server, a development secret key,
and `DEBUG = True`. It is intended for local learning and development, not for
a public production deployment.
