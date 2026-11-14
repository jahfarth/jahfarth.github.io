# 🛡️ Raksha — Scam Shield for India

**Check any suspicious call or message — before you lose money.**

Raksha is a free, open-source, multilingual scam checker built for India's most vulnerable phone users: senior citizens, first-time smartphone users, and anyone whose first language is not English. Paste a suspicious SMS/WhatsApp message, or speak/type what a caller said — Raksha returns a plain-language verdict (**SCAM / SUSPICIOUS / LOOKS SAFE**) with the exact reasons, a spoken verdict for users who can't read comfortably, and a one-tap action card (call **1930**, report at cybercrime.gov.in, alert family on WhatsApp).

🔗 **Live:** https://jahfarth.github.io/raksha/

Built for **Code for a Billion — Bharat Agentic-AI Hackathon 2026**, Track 9: *Livelihood for the Uneducated* — because protecting what poor and elderly Indians earn and save *is* livelihood protection.

---

## The problem

**Size.** Indians lost a reported **₹22,800+ crore to online fraud in 2024** alone (Indian Cybercrime Coordination Centre figures reported nationally), across crores of victims. Fraud now reaches every village with a smartphone.

**Severity.** The fastest-growing pattern is the **"digital arrest"** scam — fake police/CBI/customs officers on video calls who terrify victims (mostly senior citizens) into transferring their life savings. Digital-arrest scams alone account for a reported **₹1,700+ crore** of losses, and cases have ended in victims taking their own lives. The victims are disproportionately elderly, less educated, and non-English-speaking — exactly the people every existing English-only, text-only safety tool leaves behind.

**The gap.** Victims don't fail because they're careless. They fail because, in the moment of panic, there is *nobody to ask*. Raksha is that somebody: instant, in their language, on the phone already in their hand.

## The solution

- **Paste or speak.** Type/paste a message, or dictate what the caller said (browser speech recognition, `en-IN` / `hi-IN` / `ml-IN`). No sign-up, no app install.
- **A verdict with reasons.** A weighted pattern engine checks 14 scam-signal families — credential requests (OTP/PIN/CVV), arrest threats, authority impersonation, AnyDesk/screen-share demands, parcel fraud, prize/lottery bait, KYC/account-block threats, payment demands, secrecy pressure ("tell nobody, stay on the call"), video-call "interrogation", urgency, and look-alike links — across **English, Hindi (Devanagari + Hinglish), and Malayalam (script + Manglish)**.
- **A dedicated digital-arrest detector.** The combination *authority figure + arrest/case threat* (or the phrase itself) triggers the strongest alert: *"Police, CBI and courts NEVER arrest anyone on a phone or video call."*
- **Built to not cry wolf.** A genuine-message shield recognises real bank safety language ("do not share", "bank never asks"), so a real OTP SMS reads as safe. A scam is the *request* to share the OTP — never the code itself.
- **Spoken verdicts.** One tap reads the verdict and the helpline step aloud in the user's language (browser text-to-speech).
- **Family share.** One tap sends the verdict + reasons to a family WhatsApp chat — because the person most likely to stop a scam in progress is a family member.
- **Action, not just warning.** Every scam verdict ends in a 5-step card: cut the call, pay nothing, call **1930**, report at **cybercrime.gov.in**, tell family.

## Proven impact — the self-test

Raksha ships with a public test corpus (`corpus.js`): 12 real-world scam scripts (patterns from publicly reported Indian cases, incl. 3 digital-arrest variants, Hindi, Hinglish and Malayalam cases), 2 borderline cases, and 6 genuine messages. The **same corpus** runs in CI (`node test.js`) and live on the page (the "Run the self-test" button), so the numbers below are reproducible by anyone, including judges:

| Metric | Result |
|---|---|
| Overall verdict accuracy | **20 / 20** |
| Scam scripts caught | **12 / 12** |
| False alarms on genuine messages | **0 / 6** |

## Privacy & architecture

Raksha is **100% client-side**. The entire engine (`engine.js`) runs in the browser; messages are never uploaded, stored, or sent to any server. There is no backend to breach and no account to create — the safest possible design for frightened users on shared phones. Hosting is a static GitHub Pages site, so it costs nothing to run at national scale.

```
index.html   page structure
styles.css   mobile-first, big-type, high-contrast UI (elderly-first)
engine.js    the scam-pattern engine (browser + Node, so shipped code == tested code)
corpus.js    the public test corpus (shared by the test suite and the in-page self-test)
i18n.js      all UI + explanation strings in English / Hindi / Malayalam
app.js       wiring: voice in/out, WhatsApp share, self-test
test.js      node test.js  →  20/20
```

## Run it locally

```bash
git clone https://github.com/jahfarth/raksha-scam-shield
cd raksha-scam-shield
node test.js                 # engine test suite
python3 -m http.server 8000  # then open http://localhost:8000
```

## Roadmap

- More languages (Tamil, Telugu, Kannada, Bengali) and dialect phrase banks
- One-tap "forward to Raksha" via WhatsApp for families to check on behalf of elders
- Community-reported scam script feed (with the same open test discipline)

## License

MIT — see `LICENSE`. Built by **Jahfar T H** (final-year BTech, Cyber Security & Cyber Forensics, SUIET Mukka) for Code for India, Code for a Billion 2026. Free for any NGO, government body, or family in India to use, copy, and deploy.
