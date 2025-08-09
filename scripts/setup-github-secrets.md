# GitHub Repository Secrets Setup

After generating the secrets on your VPS, add these to your GitHub repository:

## Go to: Repository Settings → Secrets and Variables → Actions

Add these **Repository Secrets**:

### VPS Connection Secrets
- `VPS_HOST` - Your VPS IP address (from `curl -s ifconfig.me`)
- `VPS_USER` - `deploy`
- `VPS_SSH_KEY` - Contents of your **private** SSH key (the one you generated locally)
- `DOMAIN` - `modernapi.dev`

### Application Secrets (generated on VPS)
- `POSTGRES_PASSWORD` - From `openssl rand -base64 32`
- `REDIS_PASSWORD` - From `openssl rand -base64 32`
- `JWT_SECRET` - From `openssl rand -base64 64`
- `DATABASE_CONNECTION` - The full connection string generated

### Optional Email Secrets (for production notifications)
- `SMTP_USERNAME` - Your SMTP username
- `SMTP_PASSWORD` - Your SMTP password/app password

## Environment Setup

The workflow uses GitHub Environments for additional security:

1. Go to: Repository Settings → Environments
2. Create environment named: `production`
3. Optional: Add protection rules (require reviews, specific branches)

## SSH Key Setup Reminder

Make sure you've added your **public** SSH key to the deploy user on the VPS:

```bash
# On your VPS as the deploy user
mkdir -p ~/.ssh
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## Test Deployment

Once secrets are configured:

1. Create a GitHub release (or use workflow_dispatch)
2. Monitor the Actions tab for deployment progress
3. Check https://modernapi.dev/health after deployment

## Troubleshooting

If deployment fails:
- Check Actions logs for specific errors
- Verify all secrets are correctly set
- Ensure VPS services are running: `docker compose ps`
- Check VPS logs: `docker compose logs -f`