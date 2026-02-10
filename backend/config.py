import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
