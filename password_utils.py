import base64
import hashlib
import hmac
import secrets

_HASH_SCHEME = "pbkdf2_sha256"
_HASH_ITERATIONS = 600_000
_SALT_LENGTH = 16


def hash_password(password: str) -> str:
  salt = secrets.token_bytes(_SALT_LENGTH)
  digest = hashlib.pbkdf2_hmac(
      "sha256", password.encode("utf-8"), salt, _HASH_ITERATIONS
  )
  encoded_salt = base64.urlsafe_b64encode(salt).decode("ascii")
  encoded_digest = base64.urlsafe_b64encode(digest).decode("ascii")
  return f"{_HASH_SCHEME}${_HASH_ITERATIONS}${encoded_salt}${encoded_digest}"


def verify_password(password: str, password_hash: str) -> bool:
  try:
    scheme, iterations, encoded_salt, encoded_digest = password_hash.split("$")
    if scheme != _HASH_SCHEME:
      return False

    salt = base64.b64decode(encoded_salt, altchars=b"-_", validate=True)
    expected_digest = base64.b64decode(
        encoded_digest, altchars=b"-_", validate=True
    )
    actual_digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, int(iterations)
    )
  except (ValueError, TypeError):
    return False

  return hmac.compare_digest(actual_digest, expected_digest)
