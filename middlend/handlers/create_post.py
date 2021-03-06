
import time
from uuid import uuid4
from http import HTTPStatus
from botocore.exceptions import ClientError

from lambda_decorators import (
    cors_headers, json_http_resp, load_json_body
)

from common.util import (
    event_body, dynamo_table
)

"""
Author: Ron Nathaniel
Release: Candidate
Course: CS 490: 101
"""


@cors_headers
@load_json_body
@json_http_resp
def main(event, _):
    status_code = HTTPStatus.CREATED
    message = 'success'

    body = event_body(event)

    user_id = body.get('user_id')
    text = body.get('text')
    img_url = body.get('img_url')
    song_url = body.get('song_url')

    tags = body.get('tags', [])
    tags = ','.join(tags)

    post_id = str(uuid4())
    message_id = str(uuid4())

    item = {
        'type': 'post',
        'message_id': message_id,
        'post_id': post_id,
        'user_id': user_id,
        'text': text,
        'tags': tags,
        'img_url': img_url,
        'song_url': song_url,
        'created_at': int(time.time()),
        'is_hidden': False,
    }

    try:
        dynamo_table.put_item(
            **{
                'Item': item
            }
        )
    except ClientError as err:
        print('Client Error:', err)
        status_code = HTTPStatus.INTERNAL_SERVER_ERROR
        message = 'Create-Post failed.'

    return {
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'message': message,
        'statusCode': status_code,
        **item,
    }
