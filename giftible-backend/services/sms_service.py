import boto3
import os

def format_phone_number(phone_number: str) -> str:
    """
    Ensures the phone number is in E.164 format with +91 as the default country code.
    """
    # Remove any spaces, dashes, or parentheses
    cleaned_number = phone_number.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")

    # If the number doesn't start with '+', add '+91'
    if not cleaned_number.startswith("+"):
        cleaned_number = f"+91{cleaned_number}"

    return cleaned_number


def send_reset_sms(phone_number: str, reset_link: str):
    """
    Sends an SMS with the password reset link using AWS SNS.
    """
    # Format the phone number
    formatted_number = format_phone_number(phone_number)

    sns_client = boto3.client(
        "sns",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION", "us-east-1"),
    )

    try:
        response = sns_client.publish(
            PhoneNumber=formatted_number,
            Message=f"Reset your password using the link: {reset_link}",
        )
        print(f"SMS sent successfully to {formatted_number}. Message ID: {response['MessageId']}")

    except Exception as e:
        raise Exception(f"SMS sending failed: {e}")
