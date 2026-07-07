#!/usr/bin/env python3
"""
Google Forms Creator - สร้าง Google Form จากไฟล์ JSON config
ต้องติดตั้ง: pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
"""

import json
import sys
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/forms', 'https://www.googleapis.com/auth/drive']

def load_config(config_file):
    """โหลด form configuration จากไฟล์ JSON"""
    with open(config_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_google_form(config):
    """สร้าง Google Form จาก config"""
    
    # Authenticate
    service = build('forms', 'v1')
    drive_service = build('drive', 'v3')
    
    # Create new form
    form_body = {
        'info': {
            'title': config['title'],
            'description': config['description'],
        }
    }
    
    result = service.forms().create(body=form_body).execute()
    form_id = result['formId']
    
    print(f"✅ Google Form created!")
    print(f"📄 Form ID: {form_id}")
    print(f"🔗 URL: https://docs.google.com/forms/d/{form_id}")
    
    # Add items (questions)
    requests = []
    item_index = 0
    
    for item in config['items']:
        if item['type'] == 'section':
            # Add section header
            section_request = {
                'createItem': {
                    'item': {
                        'title': item['title'],
                        'description': item.get('description', ''),
                        'itemType': 'SECTION_HEADER',
                    },
                    'location': {'index': item_index}
                }
            }
            requests.append(section_request)
            item_index += 1
            
        elif item['type'] == 'multiple_choice':
            # Add multiple choice question
            options = [{'value': opt} for opt in item['options']]
            mc_request = {
                'createItem': {
                    'item': {
                        'title': item['title'],
                        'itemType': 'MULTIPLE_CHOICE',
                        'multipleChoiceQuestion': {
                            'options': options,
                            'type': 'RADIO',
                        },
                        'required': item.get('required', False),
                    },
                    'location': {'index': item_index}
                }
            }
            requests.append(mc_request)
            item_index += 1
            
        elif item['type'] == 'linear_scale':
            # Add linear scale question
            scale_request = {
                'createItem': {
                    'item': {
                        'title': item['title'],
                        'itemType': 'SCALE',
                        'scaleQuestion': {
                            'low': item['scale_min'],
                            'high': item['scale_max'],
                        },
                        'required': item.get('required', False),
                    },
                    'location': {'index': item_index}
                }
            }
            requests.append(scale_request)
            item_index += 1
            
        elif item['type'] == 'short_answer':
            # Add short answer question
            sa_request = {
                'createItem': {
                    'item': {
                        'title': item['title'],
                        'itemType': 'SHORT_TEXT',
                        'required': item.get('required', False),
                    },
                    'location': {'index': item_index}
                }
            }
            requests.append(sa_request)
            item_index += 1
            
        elif item['type'] == 'paragraph':
            # Add paragraph text question
            para_request = {
                'createItem': {
                    'item': {
                        'title': item['title'],
                        'description': item.get('description', ''),
                        'itemType': 'PARAGRAPH_TEXT',
                        'required': item.get('required', False),
                    },
                    'location': {'index': item_index}
                }
            }
            requests.append(para_request)
            item_index += 1
    
    # Batch update to add all items
    if requests:
        body = {'requests': requests}
        response = service.forms().batchUpdate(formId=form_id, body=body).execute()
        print(f"✅ Added {len(requests)} items to form")
    
    # Set form settings
    settings_request = {
        'updateFormInfo': {
            'info': {
                'title': config['title'],
                'description': config['description'],
            },
            'updateMask': 'title,description'
        }
    }
    
    settings = {
        'requests': [settings_request]
    }
    
    # Make form accept responses
    print(f"✅ Form is ready to accept responses!")
    print(f"\n📋 Next steps:")
    print(f"1. Open: https://docs.google.com/forms/d/{form_id}")
    print(f"2. Click 'Settings' (gear icon)")
    print(f"3. Enable 'Collect email addresses'")
    print(f"4. Share the link with students")
    
    return form_id

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python create_google_form.py <config_file.json>")
        print("\nExample: python create_google_form.py KAAG474_PreTest_GoogleForm_Config.json")
        sys.exit(1)
    
    config_file = sys.argv[1]
    config = load_config(config_file)
    form_id = create_google_form(config)
