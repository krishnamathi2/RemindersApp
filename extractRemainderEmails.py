from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import os.path

# If modifying these SCOPES, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def main():
    creds = None
    # The file token.json stores the user's access and refresh tokens
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('gmail', 'v1', credentials=creds)

    # Call the Gmail API to fetch reminder emails
    results = service.users().messages().list(
        userId='me',
        q='subject:reminder OR subject:"follow up" OR label:reminder'
    ).execute()

    messages = results.get('messages', [])
    
    if not messages:
        print("No reminder emails found.")
    else:
        print("Reminder emails:")
        for message in messages:
            msg = service.users().messages().get(userId='me', id=message['id']).execute()
            print(f"Subject: {msg['payload']['headers'][0]['value']}")
            print(f"Snippet: {msg['snippet']}\n")

if __name__ == '__main__':
    main()