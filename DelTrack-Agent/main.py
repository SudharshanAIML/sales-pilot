import os
from typing import Any, Dict

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage

from funtion_tools.query import check_for_delayed_orders
from funtion_tools.send_mail import send_delay_email

from config import google_api
GOOGLE_API_KEY = google_api


# === LLM (Gemini) ===============================================
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.1,
)

TOOLS = [
    check_for_delayed_orders,   
    send_delay_email,
]