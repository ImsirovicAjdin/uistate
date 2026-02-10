# Publishing Guide for @uistate/core

This package uses **Trusted Publishers** (OIDC) via GitHub Actions for secure, token-free publishing.

## How to Publish a New Version

### 1. Update Version Number

```bash
# Patch release (5.5.0 -> 5.5.1)
npm version patch

# Minor release (5.5.0 -> 5.6.0)
npm version minor

# Major release (5.5.0 -> 6.0.0)
npm version major
```

This will:
- Update `package.json`
- Create a git commit
- Create a git tag

### 2. Push to GitHub

```bash
git push origin main --tags
```

### 3. Create a GitHub Release

1. Go to: https://github.com/ImsirovicAjdin/uistate/releases/new
2. Select the tag you just pushed (e.g., `v5.5.1`)
3. Add release notes (describe changes)
4. Click **"Publish release"**

### 4. Automatic Publishing

The GitHub Action will automatically:
- ✅ Run on release creation
- ✅ Authenticate via OIDC (no tokens needed!)
- ✅ Publish to npm with provenance attestation
- ✅ Complete in ~2-3 minutes

### 5. Verify

Check that your package was published:
```bash
npm view @uistate/core version
```

## Manual Trigger (if needed)

You can also trigger the workflow manually:

1. Go to: https://github.com/ImsirovicAjdin/uistate/actions
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Confirm

## Security Benefits

✅ **No tokens to manage** - OIDC uses temporary credentials
✅ **Provenance attestation** - Cryptographic proof of origin
✅ **Audit trail** - Full transparency via GitHub Actions logs
✅ **Maximum security** - Only GitHub Actions can publish

## Troubleshooting

### Error: "OIDC token not found"

**Cause**: Workflow doesn't have `id-token: write` permission

**Fix**: Already included in `publish.yml` - should not occur

### Error: "Permission denied"

**Cause**: Trusted publisher not configured correctly on npm

**Fix**: 
1. Go to: https://www.npmjs.com/package/@uistate/core/settings
2. Verify trusted publisher settings:
   - Repository: `ImsirovicAjdin/uistate`
   - Workflow: `publish.yml`

### Error: "Version already exists"

**Cause**: You're trying to publish a version that already exists

**Fix**: Bump the version number before publishing

## Legacy Token Usage (NOT RECOMMENDED)

If you absolutely need to publish manually with a token:

1. This is now **disallowed** if you selected "Require two-factor authentication and disallow tokens"
2. You would need to change the publishing access setting
3. We strongly recommend keeping trusted publishers only

## Notes

- **2FA is required** for your npm account (already enabled ✓)
- **Granular tokens are now limited** to 90-day expiration
- **Trusted publishers are the recommended approach** for 2025+
- This workflow includes `--provenance` flag for supply chain transparency

Last updated: February 2026
