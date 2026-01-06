import base64
import os
from email.message import EmailMessage
import sys
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import google_api as GOOGLE_API_KEY
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from google import genai


SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.1,
)


@tool
def send_delay_email(
    customer_email: str,
    customer_name: str,
    order_id: str,
    reason: str,
):
    """
    Drafts a delay email using Gemini and sends it via Gmail API.
    """

    # ---------- STEP 1: Generate Email Content using LLM ----------
    prompt = f"""
You are a professional ecommerce customer support assistant.

Write a polite, reassuring delay notification email.

Customer Name: {customer_name}
Order ID: {order_id}
Delay Reason: {reason}

Tone:
- Apologetic
- Professional
- Trust-building

Return ONLY:
Subject:
Body:
"""


    llm_response = llm.invoke(prompt).content.strip()
    if "Body:" in llm_response:
        subject = llm_response.split("Body:")[0].replace("Subject:", "").strip()
        body = llm_response.split("Body:", 1)[1].strip()
    else:
        # Fallback: treat the whole response as body, subject generic
        subject = f"Order {order_id} Delay Notification"
        body = llm_response

    # ---------- STEP 2: Gmail OAuth ----------
    creds = None

    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_config(
            {
                "installed": {
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            SCOPES,
        )
        creds = flow.run_local_server(port=0)

        with open("token.json", "w") as token:
            token.write(creds.to_json())

    service = build("gmail", "v1", credentials=creds)

    # ---------- STEP 3: Build Email ----------
    message = EmailMessage()
    message["To"] = customer_email
    message["From"] = "me"
    message["Subject"] = subject
    message.set_content(body)

    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    # ---------- STEP 4: Send Email ----------
    service.users().messages().send(
        userId="me",
        body={"raw": encoded_message},
    ).execute()

    return {
        "status": "sent",
        "to": customer_email,
        "order_id": order_id,
        "subject": subject,
    }


                                                                      