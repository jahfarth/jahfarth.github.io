/* Raksha — scam detection engine.
 * Pure client-side pattern engine for Indian phone/SMS/WhatsApp scams.
 * Works in the browser (window.RakshaEngine) and in Node (module.exports)
 * so the same code that ships is the code that gets tested.
 */
(function (global) {
  'use strict';

  // Each category: weight (points added once if ANY pattern in it matches),
  // plus the human-facing reason key used by the UI translations.
  var CATEGORIES = [
    {
      id: 'digital_arrest_phrase', weight: 45,
      patterns: [
        /digital\s*arrest/i,
        /डिजिटल\s*अरेस्ट/,
        /ഡിജിറ്റൽ\s*അറസ്റ്റ്/
      ]
    },
    {
      id: 'credential_request', weight: 35,
      patterns: [
        /share\s+(your\s+)?(otp|pin|cvv|password|code)/i,
        /tell\s+(me\s+)?(your\s+)?(otp|pin|cvv|password)/i,
        /send\s+(me\s+)?(your\s+)?(otp|pin|cvv|password|code)/i,
        /(otp|pin|cvv)\s*(batao|bataiye|bhej|bhejo|bolo)/i,
        /otp[^.]{0,30}(batao|bataiye|bata\s*do|bhej\s*do)/i,
        /(batao|bataiye)[^.]{0,25}(otp|pin|code)/i,
        /(share|send|enter)\s*(your\s*)?(bank\s*details|card\s*number|account\s*number)/i,
        /(enter|type|dial)\s+(your\s+)?(otp|pin|cvv|password)/i,
        /otp\s*(paray|parayu|paranj)/i,
        /otp\s*പറയ/i,
        /ഒടിപി/,
        /(otp|pin|cvv)\s*പറയ(ൂ|ുക|ണം)/i,
        /(otp|pin)\s*बता(ओ|इए| दो)/,
        /(otp|pin)\s*भेज(ो|िए| दो)/
      ]
    },
    {
      id: 'arrest_threat', weight: 35,
      patterns: [
        /arrest\s*warrant/i,
        /you\s*(will|may|can)\s*be\s*arrested/i,
        /money\s*laundering/i,
        /criminal\s*case\s*(is\s*)?(against|on|registered|filed)/i,
        /fir\s*(has been\s*)?(registered|filed)\s*(against)?/i,
        /जेल\s*(जाओगे|भेज)/,
        /गिरफ्तार/,
        /मनी\s*लॉन्ड्रिंग/,
        /അറസ്റ്റ്\s*വാറണ്ട്/,
        /അറസ്റ്റ്\s*ചെയ്യും/,
        /ജയിലിൽ\s*അടയ്ക്കും/,
        /കള്ളപ്പണം/
      ]
    },
    {
      id: 'authority_impersonation', weight: 25,
      patterns: [
        /\b(cbi|enforcement directorate|\bed\b|narcotics|cyber\s*cell|cybercrime\s*(department|cell)?)\b/i,
        /(police|inspector|officer)\s*(speaking|here|calling|department|station)/i,
        /calling\s*from\s*(the\s*)?(police|cbi|trai|rbi|bank|customs|court|income\s*tax)/i,
        /(telecom\s*regulatory|trai)\s*(department|office|officer)?/i,
        /reserve\s*bank\s*(officer|department|verification)/i,
        /पुलिस\s*(बोल\s*रहा|विभाग|अधिकारी)/,
        /सीबीआई/,
        /प्रवर्तन\s*निदेशालय/,
        /പോലീസ്\s*(സ്റ്റേഷൻ|ആണ്|വിളിക്കുന്നു)/,
        /ബാങ്ക്\s*ഓഫീസർ/,
        /customs\s*(department|officer)/i,
        /(contact|call)\s*(our|the)\s*(officer|department)/i,
        /സിബിഐ/,
        /(bank\s*)?(manager|officer)\s*(speaking|calling|here)/i
      ]
    },
    {
      id: 'remote_access_app', weight: 30,
      patterns: [
        /any\s?desk/i,
        /team\s?viewer/i,
        /rust\s?desk/i,
        /quick\s?support/i,
        /(install|download)\s*(this|the|an?)\s*(app|application)/i,
        /screen\s*shar(e|ing)/i,
        /സ്‌ക്രീൻ\s*ഷെയർ/,
        /ആപ്പ്\s*ഇൻസ്റ്റാൾ/
      ]
    },
    {
      id: 'parcel_scam', weight: 25,
      patterns: [
        /parcel\s*(has been\s*)?(seized|held|booked|caught)/i,
        /(package|parcel|delivery)\s*(has\s*)?(failed|held|pending|undelivered)/i,
        /(drugs|contraband|illegal\s*items?)\s*(found|in)\s*(your\s*)?(parcel|package|courier)/i,
        /(fedex|dhl|customs)\s*(parcel|package|shipment)/i,
        /customs\s*(clearance|duty|officer|department)/i,
        /पार्सल\s*(में|जब्त|पकड़ा)/,
        /കസ്റ്റംസ്/,
        /പാഴ്‌സൽ/
      ]
    },
    {
      id: 'prize_lottery', weight: 25,
      patterns: [
        /(won|winner|winning)\s*(a\s*)?(lottery|prize|cash|₹|rs\.?|lakh|crore|gift)/i,
        /lottery\s*(winner|won|prize|result)/i,
        /lucky\s*draw/i,
        /\bkbc\b.*(won|prize|winner|lottery)/i,
        /claim\s*(your\s*)?(prize|reward|cashback|amount)/i,
        /congratulations.*(won|winner|selected)/i,
        /लॉटरी/,
        /इनाम\s*(जीता|मिला)/,
        /ലോട്ടറി/,
        /സമ്മാനം\s*(ലഭിച്ചു|അടിച്ചു)/
      ]
    },
    {
      id: 'account_threat', weight: 20,
      patterns: [
        /(account|kyc|sim|card|wallet|number)\s*(will be\s*)?(blocked|frozen|suspended|deactivated|closed|expired)/i,
        /account\s*(block|band)\s*ho\s*(jayega|jaayega|gaya)/i,
        /block\s*ho\s*jayega/i,
        /(blocked|frozen|suspended|deactivated)\s*(within|in)\s*\d+\s*(hours?|hrs?|minutes?)/i,
        /kyc\s*(expired|pending|update|incomplete)/i,
        /(update|complete|verify)\s*(your\s*)?kyc\s*(immediately|now|today)/i,
        /sim\s*(will be\s*)?(deactivat|disconnect|block)/i,
        /electricity\s*(will be\s*)?(disconnect|cut)/i,
        /खाता\s*(बंद|ब्लॉक)/,
        /केवाईसी/,
        /അക്കൗണ്ട്\s*ബ്ലോക്ക്/,
        /കെവൈസി/
      ]
    },
    {
      id: 'payment_demand', weight: 25,
      patterns: [
        /(transfer|send|pay|deposit)\s*(₹|rs\.?|inr|money|amount|fees?)?\s*\d/i,
        /pay\s*(a\s*)?(fee|charge|penalty|fine)\s*(to|for)\s*(verify|release|claim|unblock|clear)/i,
        /(verification|processing|clearance|registration)\s*(fee|charge|amount)/i,
        /gift\s*card/i,
        /(buy|send|share)\s*(a\s*)?(crypto|bitcoin|voucher)/i,
        /upi\s*(collect|request)\s*(of\s*)?(₹|rs)/i,
        /पैसे\s*(भेजो|ट्रांसफर|जमा)/,
        /शुल्क\s*(जमा|भरो|दो)/,
        /പണം\s*(അയക്ക|അടക്ക|ട്രാൻസ്ഫർ)/,
        /ഫീസ്\s*അടയ്ക്ക/
      ]
    },
    {
      id: 'secrecy_pressure', weight: 20,
      patterns: [
        /don'?t\s*(tell|inform|share\s*(this|it)\s*with)\s*(anyone|anybody|your\s*family)/i,
        /keep\s*(this|it)\s*(a\s*)?secret/i,
        /do\s*not\s*(disconnect|cut|end)\s*(the\s*)?(call|video\s*call)/i,
        /stay\s*(on|online|in)\s*(the\s*)?(call|line|video\s*call)/i,
        /किसी\s*को\s*(मत\s*बताना|न\s*बताएं)/,
        /गुप्त\s*रखो/,
        /ആരോടും\s*പറയരുത്/,
        /രഹസ്യമായി\s*വെക്ക/
      ]
    },
    {
      id: 'video_call_official', weight: 15,
      patterns: [
        /(video\s*call|skype|whatsapp\s*video)\s*(interrogation|inquiry|statement|verification|investigation)/i,
        /(join|come|appear)\s*on\s*(a\s*)?(video\s*call|skype)/i,
        /interrogation\s*(on|over|via)\s*(video|skype|call)/i,
        /वीडियो\s*कॉल\s*(पर\s*आओ|जुड़ो|पूछताछ)/,
        /വീഡിയോ\s*കോളിൽ\s*(വരണം|ചേരണം)/
      ]
    },
    {
      id: 'urgency', weight: 10,
      patterns: [
        /\b(immediately|urgent(ly)?|right\s*now|asap)\b/i,
        /within\s*\d+\s*(hours?|hrs?|minutes?)/i,
        /last\s*(chance|warning|opportunity)/i,
        /तुरंत/,
        /अभी\s*करो/,
        /ഉടൻ\s*(തന്നെ)?/,
        /അടിയന്തരമായി/
      ]
    },
    {
      id: 'suspicious_link', weight: 10,
      patterns: [
        /(bit\.ly|tinyurl\.com|t\.me\/|rb\.gy|cutt\.ly|shorturl)/i,
        /(click|tap)\s*(on\s*)?(this|the)\s*link/i,
        /https?:\/\/[^\s]+\.(xyz|top|click|live|site|online)\b/i
      ]
    }
  ];

  // Phrases that appear in GENUINE bank/security messages. A genuine OTP SMS
  // contains the word OTP — what makes a message a scam is the REQUEST to
  // share it, never the code itself. These markers reduce false alarms.
  var LEGIT_MARKERS = [
    /do\s*not\s*share/i,
    /never\s*share/i,
    /don'?t\s*share/i,
    /bank\s*never\s*asks/i,
    /we\s*never\s*ask/i,
    /किसी\s*के\s*साथ\s*साझा\s*न\s*करें/,
    /ആരുമായും\s*പങ്കിടരുത്/
  ];

  function normalize(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function analyze(rawText) {
    var text = normalize(rawText);
    var result = { score: 0, verdict: 'SAFE', hits: [], digitalArrest: false, legitShield: false };
    if (!text) return result;

    var matched = {};
    CATEGORIES.forEach(function (cat) {
      for (var i = 0; i < cat.patterns.length; i++) {
        if (cat.patterns[i].test(text)) {
          matched[cat.id] = true;
          result.score += cat.weight;
          result.hits.push(cat.id);
          break; // one hit per category
        }
      }
    });

    // The digital-arrest signature: an authority figure + an arrest/case
    // threat (or the literal phrase). This is India's highest-loss scam
    // pattern, so it forces the strongest verdict on its own.
    if (
      matched['digital_arrest_phrase'] ||
      (matched['authority_impersonation'] && matched['arrest_threat']) ||
      (matched['authority_impersonation'] && matched['parcel_scam'] && matched['payment_demand'])
    ) {
      result.digitalArrest = true;
      if (result.score < 85) result.score = 85;
      if (result.hits.indexOf('digital_arrest_combo') === -1) {
        result.hits.push('digital_arrest_combo');
      }
    }

    // A prize that demands a fee is always a scam — the combination is
    // worth more than either signal alone.
    if (matched['prize_lottery'] && matched['payment_demand']) {
      result.score += 15;
      result.hits.push('prize_fee_combo');
    }

    // Genuine-message shield: safety warnings from a real bank reduce the
    // score — but never below a real request/threat pattern's verdict.
    var hasLegitMarker = LEGIT_MARKERS.some(function (re) { return re.test(text); });
    var hardSignals =
      matched['credential_request'] || matched['arrest_threat'] ||
      matched['remote_access_app'] || matched['digital_arrest_phrase'];
    if (hasLegitMarker && !hardSignals) {
      result.legitShield = true;
      result.score = Math.max(0, result.score - 25);
    }

    if (result.score >= 55) result.verdict = 'SCAM';
    else if (result.score >= 25) result.verdict = 'SUSPICIOUS';
    else result.verdict = 'SAFE';

    return result;
  }

  var api = { analyze: analyze, CATEGORIES: CATEGORIES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.RakshaEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
