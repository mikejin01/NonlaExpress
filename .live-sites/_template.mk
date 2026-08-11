# Per-site SiteGround SSH + deploy config TEMPLATE.
#
# HOW TO USE
#   1. Copy this file to .live-sites/<site_key>.mk (e.g. .live-sites/nonla.mk).
#   2. Fill in the real values for that install.
#   3. Use it:   make test-connection SITE=<site_key>
#                make build-and-push  SITE=<site_key>
#
#   With exactly one fragment present, SITE= can be omitted entirely.
#
# SECURITY
#   - Only this _template.mk is committed. Real .live-sites/*.mk files are
#     gitignored. Never paste real credentials into this file.
#   - Key auth only. Never put passwords here. The private key lives outside
#     the repo at SITEGROUND_IDENTITY_FILE, chmod 600.

# ----- SSH connection -----
# Site Tools → Devs → SSH Keys Manager shows user, host and port.
SITEGROUND_USER           := REPLACE_WITH_SSH_USER
SITEGROUND_DOMAIN         := REPLACE_WITH_DOMAIN.com
SITEGROUND_HOST           := ssh.$(SITEGROUND_DOMAIN)
SITEGROUND_PORT           := 18765
SITEGROUND_IDENTITY_FILE  := ~/.ssh/siteground

# ----- WordPress paths on the server -----
# Docroot is almost always www/<domain>/public_html on SiteGround.
SITEGROUND_DOCROOT        := www/$(SITEGROUND_DOMAIN)/public_html

# Theme folder name under wp-content/themes/.
SITEGROUND_THEME_NAME     := nonla-express
SITEGROUND_REMOTE_PATH    := $(SITEGROUND_DOCROOT)/wp-content/themes/$(SITEGROUND_THEME_NAME)/
