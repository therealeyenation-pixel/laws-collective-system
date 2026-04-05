# Backup Configuration Presets

## Quick Setup Guide

The system includes pre-configured backup settings. Here's how to configure each storage provider:

## Provider Configuration

### Amazon S3

1. Create an S3 bucket in your AWS account
2. Create an IAM user with S3 access
3. Add these environment variables:

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_BUCKET_NAME=laws-collective-backups
AWS_REGION=us-east-1
```

**IAM Policy (minimum required):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::laws-collective-backups",
        "arn:aws:s3:::laws-collective-backups/*"
      ]
    }
  ]
}
```

### Google Drive

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable Google Drive API
3. Create OAuth 2.0 credentials
4. Add these environment variables:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_BACKUP_FOLDER_ID=folder-id-from-drive-url
```

**To get refresh token:**
1. Use OAuth Playground: https://developers.google.com/oauthplayground
2. Select Drive API v3 scopes
3. Authorize and exchange for tokens

### Dropbox

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Create an app with "Full Dropbox" access
3. Generate an access token
4. Add these environment variables:

```env
DROPBOX_ACCESS_TOKEN=your-access-token
DROPBOX_BACKUP_PATH=/Apps/LAWSCollective/backups
```

### Local Storage

For local backups (not recommended for production):

```env
LOCAL_BACKUP_PATH=/var/backups/laws-collective
LOCAL_BACKUP_RETENTION_DAYS=30
```

## Recommended Backup Schedules

### Small Organization (< 100 users)

| Backup Type | Schedule | Retention | Contents |
|-------------|----------|-----------|----------|
| Daily | 2:00 AM | 7 days | Database + Settings |
| Weekly | Sunday 3:00 AM | 30 days | Full (DB + Files + Settings) |

### Medium Organization (100-500 users)

| Backup Type | Schedule | Retention | Contents |
|-------------|----------|-----------|----------|
| Daily | 2:00 AM | 14 days | Database + Settings |
| Weekly | Sunday 3:00 AM | 60 days | Full |
| Monthly | 1st of month | 1 year | Full Archive |

### Large Organization (500+ users)

| Backup Type | Schedule | Retention | Contents |
|-------------|----------|-----------|----------|
| Hourly | Every hour | 24 hours | Database only |
| Daily | 2:00 AM | 30 days | Database + Settings |
| Weekly | Sunday 3:00 AM | 90 days | Full |
| Monthly | 1st of month | 2 years | Full Archive |

## One-Click Setup Commands

### AWS S3 Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure

# Create bucket
aws s3 mb s3://laws-collective-backups --region us-east-1

# Enable versioning (recommended)
aws s3api put-bucket-versioning --bucket laws-collective-backups --versioning-configuration Status=Enabled
```

### Google Cloud Storage Setup
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Create bucket
gsutil mb -l us-east1 gs://laws-collective-backups

# Set lifecycle policy (auto-delete after 90 days)
gsutil lifecycle set lifecycle.json gs://laws-collective-backups
```

### Backblaze B2 (Budget Alternative)
```env
B2_APPLICATION_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_BUCKET_NAME=laws-collective-backups
```

## Restore Procedures

### From S3
```bash
# List available backups
aws s3 ls s3://laws-collective-backups/

# Download specific backup
aws s3 cp s3://laws-collective-backups/backup-2026-01-28.tar.gz ./

# Extract
tar -xzf backup-2026-01-28.tar.gz

# Restore database
mysql -u user -p database < backup/database.sql
```

### From Google Drive
```bash
# Use rclone for easy access
rclone copy gdrive:backups/backup-2026-01-28.tar.gz ./
```

### From Local
```bash
# Find latest backup
ls -la /var/backups/laws-collective/

# Restore
tar -xzf /var/backups/laws-collective/backup-latest.tar.gz -C /tmp/restore/
mysql -u user -p database < /tmp/restore/database.sql
```

## Verification Checklist

After configuring backups, verify:

- [ ] Test backup runs successfully
- [ ] Backup file appears in destination
- [ ] File size is reasonable (not 0 bytes)
- [ ] Test restore works on separate environment
- [ ] Email notifications configured and working
- [ ] Retention policy deleting old backups
- [ ] Monitoring alerts set up for failures

## Troubleshooting

### Backup Fails with Permission Error
- Check IAM/OAuth permissions
- Verify bucket/folder exists
- Ensure credentials are not expired

### Backup Size Too Large
- Enable compression in settings
- Exclude large file types
- Consider incremental backups

### Restore Fails
- Verify backup integrity with checksum
- Check database version compatibility
- Ensure sufficient disk space

---

*Last Updated: January 2026*
