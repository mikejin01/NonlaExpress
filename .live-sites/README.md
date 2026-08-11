# `.live-sites/`

Per-site SSH and deploy credentials, kept out of git.

- `_template.mk` — the documented template. **Committed. No real values.**
- `<site_key>.mk` — one per live WordPress install. **Gitignored.**

```bash
cp .live-sites/_template.mk .live-sites/nonla.mk
$EDITOR .live-sites/nonla.mk        # fill in user / domain / port / key path

make test-connection                # SITE= is implied while only one exists
make build-and-push
make list-sites                     # see what's configured
```

Content sync is per install, because each one has its own database:

```bash
make check-content-drift
make pull-content
```

The private key itself lives outside the repo (`~/.ssh/…`, `chmod 600`) — only
its path is recorded here. Nón Lá is on the shared `~/.ssh/siteground` key that
serves the whole `jeffl2NN` SiteGround account family.

## A note on the domain

nonlaexpress.com is still served by **Wix** at launch-minus-one. If this install
was created against a temporary SiteGround hostname (`jeffl2NN.sg-host.com`),
SiteGround usually **keeps the original docroot folder name** when the real
domain is finally attached — so run `ls ~/www` over SSH and confirm before
changing `SITEGROUND_DOMAIN` here, or `make push` will silently deploy into a
path that nothing serves.
