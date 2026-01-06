import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
google_api = os.environ.get("GEMINI_API_KEY")
google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
google_client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")


llm = genai.Client(api_key=google_api)

def get_prompt_tokens(response):
    return response.usage_metadata.prompt_token_count

def get_response_tokens(response):
    return response.usage_metadata.candidates_token_count