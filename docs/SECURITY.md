# Security Baseline

- Store access and refresh tokens only through SecureStore.
- Never put secrets in `EXPO_PUBLIC_*` variables or source control.
- Treat backend authorization as authoritative.
- Validate notification and deep-link payloads before routing.
- Use explicit external URL scheme allowlists.
- Request permissions in response to user intent and explain their purpose.
- Avoid tokens, personal data, and raw server responses in logs.
- Review EAS credentials, channels, and runtime compatibility before release.
