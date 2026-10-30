#!/usr/bin/env bash
#
# Registers what the site's GA4 events need (src/lib/analytics.js) on the Nón Lá
# Express property (527598938):
#   - the event-scoped custom dimensions, so the events' parameters show in reports;
#   - the 6 key events, created by name, so events that have never fired yet (and so
#     can't be starred in the GA4 screens) count from their first hit.
# It reads the property first, prints what is missing, and creates nothing until you
# answer "y". Safe to re-run: anything already registered is skipped.
# Copied from the iDeal Auto Collision repo (docs/GA4-EVENT-TRACKING-PLAYBOOK.md,
# Appendix B).
#
# The analytics-mcp connection is read-only, so this runs with a short-lived token
# from a GA4 admin instead:
#   1. https://developers.google.com/oauthplayground, signed in as a login with
#      Editor on GA account 386972374 — the account Site Kit was connected with,
#      NOT admin@xocontinental.com's portfolio (CLAUDE.md, "Google Analytics 4 MCP").
#   2. Step 1 → "Input your own scopes":
#        https://www.googleapis.com/auth/analytics.edit
#      → Authorize APIs → Allow.
#   3. Step 2 → "Exchange authorization code for tokens" → copy the access token.
#   4. bash scripts/ga4-register-events.sh   (paste the token when asked)
#      bash scripts/ga4-register-events.sh --dimensions-only   (skip key events)
#
# The token expires on its own after about an hour.

set -euo pipefail

ADMIN="https://analyticsadmin.googleapis.com/v1beta/properties"

WITH_KEY_EVENTS=1
[ "${1:-}" = "--dimensions-only" ] && WITH_KEY_EVENTS=0

# property id|site (CLAUDE.md, "Google Analytics 4 MCP")
PROPERTIES=(
	"527598938|Nón Lá Express"
)

# parameter|display name|description (GA4 allows 150 characters)
DIMENSIONS=(
	"link_location|Link location|Where a link was clicked: header, menu (mobile panel), hero, find_us, page or footer."
	"platform|Platform|Ordering or social platform clicked: snackpass, grubhub… (order_online); instagram, yelp… (social_click)."
	"form_name|Form name|Which form an event came from: newsletter (the footer signup)."
	"error_type|Form error type|Why a form submit failed (form_error): validation (email missing or malformed) or server."
	"cta_text|CTA text|Label of the button-styled link clicked (cta_click)."
)

# GA4 matches key events by name; these must stay identical to src/lib/analytics.js.
KEY_EVENTS=(
	order_online
	click_to_call
	get_directions
	click_to_email
	newsletter_form_start
	newsletter_form_submit
)

read -rsp "Paste the OAuth Playground access token: " TOKEN
echo
[ -n "$TOKEN" ] || { echo "No token given."; exit 1; }

# GET or POST; prints the body, then the HTTP status on its own last line.
call() {
	curl -sS -w '\n%{http_code}' -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"
}
body() { sed '$d' <<<"$1"; }
status() { tail -n1 <<<"$1"; }
# Prints one field of every item in a list response, one per line.
names() {
	python3 -c 'import json,sys; print("\n".join(i[sys.argv[2]] for i in json.load(sys.stdin).get(sys.argv[1], [])))' "$1" "$2"
}

# --- 1. Read every property and work out what is missing --------------------------
# One line per thing to create: "property id|site|dim|<dimension entry>" or "…|key|<event>".
# A property this token can't read is skipped (nothing is created on it); the rest go ahead.
TODO=()
SKIPPED=()
skip() {
	echo "• $site ($pid): can't read it (HTTP $(status "$res")), skipped"
	body "$res" | python3 -c 'import json,sys; print("    " + json.load(sys.stdin)["error"]["message"])' 2>/dev/null || true
	SKIPPED+=("$site ($pid)")
}
for prop in "${PROPERTIES[@]}"; do
	IFS='|' read -r pid site <<<"$prop"

	res=$(call "$ADMIN/$pid/customDimensions?pageSize=200")
	if [ "$(status "$res")" != "200" ]; then
		skip
		continue
	fi
	have_dims=$(body "$res" | names customDimensions parameterName)

	have_keys=""
	if [ "$WITH_KEY_EVENTS" = 1 ]; then
		res=$(call "$ADMIN/$pid/keyEvents?pageSize=200")
		if [ "$(status "$res")" != "200" ]; then
			skip
			continue
		fi
		have_keys=$(body "$res" | names keyEvents eventName)
	fi

	missing=()
	for entry in "${DIMENSIONS[@]}"; do
		param=${entry%%|*}
		if ! grep -qx "$param" <<<"$have_dims"; then
			TODO+=("$pid|$site|dim|$entry")
			missing+=("dimension $param")
		fi
	done
	if [ "$WITH_KEY_EVENTS" = 1 ]; then
		for event in "${KEY_EVENTS[@]}"; do
			if ! grep -qx "$event" <<<"$have_keys"; then
				TODO+=("$pid|$site|key|$event")
				missing+=("key event $event")
			fi
		done
	fi

	if [ "${#missing[@]}" -eq 0 ]; then
		echo "• $site ($pid): everything already registered"
	else
		echo "• $site ($pid): to create —"
		printf '    %s\n' "${missing[@]}"
	fi
done

echo
if [ "${#SKIPPED[@]}" -gt 0 ]; then
	echo "Skipped (the token has expired, or its Google account has no Editor access there):"
	printf '    %s\n' "${SKIPPED[@]}"
	echo "Re-run with a token from an account that has it; already-registered items are skipped."
	echo
fi
if [ "${#TODO[@]}" -eq 0 ]; then
	echo "Nothing to do."
	[ "${#SKIPPED[@]}" -eq 0 ]
	exit
fi
read -rp "Create these ${#TODO[@]} items? [y/N] " answer
[ "$answer" = "y" ] || [ "$answer" = "Y" ] || { echo "Nothing was changed."; exit 0; }

# --- 2. Create them -----------------------------------------------------------------
created=0 failed=0
for item in "${TODO[@]}"; do
	IFS='|' read -r pid site kind rest <<<"$item"
	if [ "$kind" = "dim" ]; then
		IFS='|' read -r param name desc <<<"$rest"
		label="$site: dimension $param"
		payload=$(python3 -c 'import json,sys; print(json.dumps({"parameterName": sys.argv[1], "displayName": sys.argv[2], "description": sys.argv[3], "scope": "EVENT"}))' "$param" "$name" "$desc")
		res=$(call -X POST -d "$payload" "$ADMIN/$pid/customDimensions")
	else
		label="$site: key event $rest"
		payload=$(python3 -c 'import json,sys; print(json.dumps({"eventName": sys.argv[1], "countingMethod": "ONCE_PER_EVENT"}))' "$rest")
		res=$(call -X POST -d "$payload" "$ADMIN/$pid/keyEvents")
	fi
	if [ "$(status "$res")" = "200" ]; then
		echo "✓ $label"
		created=$((created + 1))
	else
		echo "✗ $label — failed (HTTP $(status "$res")):"
		body "$res" | sed 's/^/    /'
		failed=$((failed + 1))
	fi
done

echo
echo "Done: $created created, $failed failed, ${#SKIPPED[@]} properties skipped."
[ "$failed" -eq 0 ] && [ "${#SKIPPED[@]}" -eq 0 ]
