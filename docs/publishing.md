# Publishing to npm

How to publish `nepali-date-pro-max` to the npm registry.

## First-time publish

### 1. Pre-flight checks

```bash
# Confirm the name is available (404 = free)
npm view nepali-date-pro-max

# Confirm you're logged in
npm whoami

# If not logged in
npm login
```

### 2. See exactly what will ship

```bash
npm pack --dry-run
```

You should see only: `dist/`, `README.md`, `llms.txt`, `LICENSE`, `package.json`.
The `files` field in `package.json` controls this — `src/` and tests are excluded.

### 3. Publish

```bash
npm publish --access public
```

`prepublishOnly` runs `typecheck → test → build` first. If any step fails, nothing
publishes.

After success the version is **immutable** — you cannot republish the same
version number.

---

## Updating (every release after the first)

```bash
# 1. Commit your changes
git add -A && git commit -m "feat: ..."

# 2. Bump the version (edits package.json AND creates a git tag)
npm version patch    # 1.0.0 → 1.0.1   bug fix
npm version minor    # 1.0.0 → 1.1.0   new feature, backward compatible
npm version major    # 1.0.0 → 2.0.0   breaking change

# 3. Publish
npm publish

# 4. Push commits + the version tag to GitHub
git push --follow-tags
```

### Picking the bump

| Bump  | When                                      | Example                                    |
| ----- | ----------------------------------------- | ------------------------------------------ |
| patch | Bug fix, no API change                    | `subDays` returns wrong result             |
| minor | New feature, existing code keeps working  | Added new instance methods like `setYear`  |
| major | Breaking change                           | Renamed/removed a method, changed a type   |

### Notes

- `npm version` refuses to run on a dirty working tree — commit first.
- Preview without committing: `npm version patch --no-git-tag-version`
  (just edits `package.json`).
- If `prepublishOnly` fails after the version bump, fix the issue, commit, then
  re-run `npm publish` — no need to bump again.

---

## Pre-releases (beta / rc)

```bash
npm version prerelease --preid=beta    # 1.1.0 → 1.1.1-beta.0
npm publish --tag beta
```

Users get it via `npm install nepali-date-pro-max@beta`. The `@latest` dist-tag
stays on the stable version.

---

## Sanity checks

After publishing:

```bash
# Confirm the new version is live
npm view nepali-date-pro-max version

# Install in a scratch project to verify imports work
mkdir /tmp/check && cd /tmp/check && npm init -y
npm install nepali-date-pro-max
node -e "import('nepali-date-pro-max').then(m => console.log(m.NepaliDate.now().toString()))"
```

Before a first publish, also run a local install from a tarball:

```bash
npm pack                                          # creates nepali-date-pro-max-X.Y.Z.tgz
cd /tmp/check && npm install /path/to/that.tgz   # check it actually works
```

---

## Unpublishing (avoid)

You have a 72-hour window to `npm unpublish` a version, but npm strongly
discourages it because it breaks anyone who installed it. Prefer to publish a
patch with the fix.

```bash
# Only as a last resort
npm unpublish nepali-date-pro-max@1.0.1
```

---

## Quick reference

| Task                           | Command                                  |
| ------------------------------ | ---------------------------------------- |
| Check name availability        | `npm view nepali-date-pro-max`           |
| Log in                         | `npm login`                              |
| See what will ship             | `npm pack --dry-run`                     |
| First publish                  | `npm publish --access public`            |
| Bump + publish update          | `npm version <patch\|minor\|major> && npm publish && git push --follow-tags` |
| Confirm published version      | `npm view nepali-date-pro-max version`   |
