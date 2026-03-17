# Goldfish

Static site for small, repetitive LLM tasks. No server — your API key is stored by your browser's password manager and used directly from the client.

## Local development

```
python3 -m http.server 8000
```

### Password manager testing

To test the password manager autofill flow locally, map a fake domain to localhost:

```
sudo sh -c 'echo "127.0.0.1  goldfish.local" >> /etc/hosts'
```

Then visit `http://goldfish.local:8000`. Your password manager will treat this as a real site and offer to save/fill the provider + API key pair.

To undo:

```
sudo sed -i '' '/goldfish\.local/d' /etc/hosts
```
