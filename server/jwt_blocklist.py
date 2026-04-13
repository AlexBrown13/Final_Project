"""In-memory JWT identifier blocklist for logout (revoked until process restart)."""

BLOCKLIST = set()


def revoke_jti(jti):
    if jti:
        BLOCKLIST.add(jti)


def is_jti_revoked(jti):
    return jti in BLOCKLIST if jti else False
