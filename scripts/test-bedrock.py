#!/usr/bin/env python3
"""Smoke-test AWS Bedrock connectivity and model access.

Usage:
    python scripts/test-bedrock.py
    AWS_PROFILE=my-profile python scripts/test-bedrock.py
"""
import json
import os
import sys


def check(label: str, ok: bool, detail: str = "") -> bool:
    status = "✓" if ok else "✗"
    print(f"  {status}  {label}" + (f": {detail}" if detail else ""))
    return ok


def main() -> int:
    print("\n── AWS Bedrock connectivity test ─────────────────────────────\n")

    # ── 1. boto3 import ───────────────────────────────────────────────────────
    try:
        import boto3
        import botocore
        check("boto3 importable", True, boto3.__version__)
    except ImportError as e:
        check("boto3 importable", False, str(e))
        print("\n  Run: make ai-install\n")
        return 1

    # ── 2. AWS session ────────────────────────────────────────────────────────
    profile = os.getenv("AWS_PROFILE")
    region  = os.getenv("AWS_REGION", "us-west-2")

    try:
        session = boto3.Session(
            profile_name=profile or None,
            region_name=region,
        )
        identity = session.client("sts").get_caller_identity()
        check("AWS credentials", True, f"account={identity['Account']}  arn={identity['Arn']}")
    except botocore.exceptions.NoCredentialsError:
        check("AWS credentials", False, "no credentials found — set AWS_PROFILE or AWS_ACCESS_KEY_ID")
        return 1
    except botocore.exceptions.ProfileNotFound as e:
        check("AWS credentials", False, str(e))
        return 1
    except Exception as e:
        check("AWS credentials", False, str(e))
        return 1

    # ── 3. Bedrock client ─────────────────────────────────────────────────────
    try:
        bedrock = session.client("bedrock-runtime", region_name=region)
        check("bedrock-runtime client", True, f"region={region}")
    except Exception as e:
        check("bedrock-runtime client", False, str(e))
        return 1

    # ── 4. Model access ───────────────────────────────────────────────────────
    models = [
        ("us.anthropic.claude-haiku-4-5-20251001-v1:0", "ai-assistant + editorial"),
    ]

    all_ok = True
    for model_id, service in models:
        try:
            response = bedrock.converse(
                modelId=model_id,
                messages=[{
                    "role": "user",
                    "content": [{"text": "Reply with exactly: ok"}],
                }],
                inferenceConfig={"maxTokens": 10, "temperature": 0},
            )
            reply = response["output"]["message"]["content"][0]["text"].strip()
            check(f"{service} ({model_id})", True, f'response="{reply}"')
        except botocore.exceptions.ClientError as e:
            code = e.response["Error"]["Code"]
            check(f"{service} ({model_id})", False, f"{code} — request model access in the AWS console for {region}")
            all_ok = False
        except Exception as e:
            check(f"{service} ({model_id})", False, str(e))
            all_ok = False

    print()
    if all_ok:
        print("  All checks passed — Bedrock is ready.\n")
        return 0
    else:
        print("  Some checks failed — see above.\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
