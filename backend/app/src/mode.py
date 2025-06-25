import os

def is_dev_mode():
    """
    Returns True if the environment is set to development mode.
    Checks the ENV or MODE environment variable for 'dev' or 'development'.
    """
    env = os.getenv('ENV', '').lower()
    mode = os.getenv('MODE', '').lower()
    return env in ('dev', 'development') or mode in ('dev', 'development')

def is_prod_mode():
    """
    Returns True if the environment is set to production mode.
    Checks the ENV or MODE environment variable for 'prod' or 'production'.
    """
    env = os.getenv('ENV', '').lower()
    mode = os.getenv('MODE', '').lower()
    return env in ('prod', 'production') or mode in ('prod', 'production')

def get_url():
    """
    Returns the base URL for the application.
    Checks the URL environment variable or defaults to 'http://localhost:8000'.
    """
    if is_dev_mode():
        return os.getenv('URL', 'http://localhost:8000')
    else:
        return os.getenv('URL', 'https://api.dance2move.com')