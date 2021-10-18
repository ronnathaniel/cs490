
import json
import boto3
from botocore.exceptions import ClientError
from lambda_decorators import (
    cors_headers, json_http_resp, load_json_body
)


@cors_headers
@load_json_body
@json_http_resp
def auth(event, context):

    dynamo_client = boto3.resource('dynamodb', region_name='us-east-2')
    dynamo_table= dynamo_client.Table('cs490_backend')

    status_code = 200
    message = 'success'

    print('event')
    print(event)
    print('context')
    print(context)

    body = event.get('body', {})
    if body:
        event = body

    user = event.get('user')
    passwd = event.get('pass')


    print(user, '-', passwd)

    if not user or not passwd:
        print('No user found.')
        status_code = 400
        message = 'Bad Request. No User Specified'
    else:
        try:
            res = dynamo_table.get_item(
                Key={
                    'user': user,
                }
            )
            print('res:')
            print(res)
            print(res.get('Item'))
        except ClientError as err:
            print('Client Error:', err)
            print('input:', {'Key': {'user': user}})
            status_code = 500
            message = err.response.get('Error', {}).get('Message', '')
            res = {}
        else:
            res = res.get('Item', {})

        passwd_item = res.get('pass', '')
        if passwd != passwd_item:
            status_code = 403
            message = 'Incorrect Credentials'
            print('real:', passwd_item)
            print('passed:', passwd)

    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Credentials': True,
        },
        'body': {
            'message': message,
            'statusCode': status_code,
            'admin': False,
            'logged_in': status_code == 200,
        },
    }