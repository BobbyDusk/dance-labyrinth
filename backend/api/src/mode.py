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