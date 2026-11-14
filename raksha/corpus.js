/* Shared test corpus: real-world scam scripts (patterns from publicly
 * reported Indian scam cases) and genuine messages that must NOT be
 * flagged. Used by the Node test (test.js) and by the in-app self-test,
 * so the "proven impact" numbers on the page are the real test results.
 */
(function (global) {
  'use strict';
  var CORPUS = [
    { expect: 'SCAM', label: 'Digital arrest — CBI + Skype interrogation',
      text: 'I am Inspector Sharma calling from CBI. A money laundering case is registered against you. An arrest warrant has been issued. Join on Skype for video call interrogation and do not disconnect the call. Do not tell anyone about this.' },
    { expect: 'SCAM', label: 'Digital arrest — literal phrase',
      text: 'This is TRAI department. Your number is involved in illegal activities. You are under digital arrest. Transfer the amount for verification immediately.' },
    { expect: 'SCAM', label: 'FedEx parcel + customs + payment',
      text: 'This is FedEx customs department. Your parcel has been seized, drugs found in your parcel. A criminal case is registered. Pay the clearance fee to release it, transfer Rs 45000 now.' },
    { expect: 'SCAM', label: 'Bank KYC + OTP request',
      text: 'Dear customer, your KYC has expired and your account will be blocked within 24 hours. Call our bank officer immediately and share your OTP to verify your account.' },
    { expect: 'SCAM', label: 'KBC lottery',
      text: 'Congratulations! You have won a lottery prize of Rs 25 lakh in KBC lucky draw. To claim your prize, pay the processing fee of Rs 6500 and send your bank details.' },
    { expect: 'SCAM', label: 'AnyDesk remote access',
      text: 'I am calling from the bank. Your refund is pending. Please install AnyDesk app and share your screen so we can process it. Also tell me the OTP you receive.' },
    { expect: 'SCAM', label: 'SIM deactivation + link',
      text: 'ALERT: Your SIM will be deactivated today. Complete your KYC immediately, click this link bit.ly/kyc-update and enter your PIN.' },
    { expect: 'SCAM', label: 'Electricity bill threat',
      text: 'Your electricity will be disconnected tonight at 9 pm because your bill is unpaid. Contact our officer immediately on this number to avoid disconnection.' },
    { expect: 'SCAM', label: 'Hindi — police arrest threat',
      text: 'मैं पुलिस विभाग से बोल रहा हूँ। आपके नाम पर गिरफ्तारी का वारंट है, मनी लॉन्ड्रिंग केस में। किसी को मत बताना, तुरंत पैसे ट्रांसफर करो।' },
    { expect: 'SCAM', label: 'Malayalam — OTP + account block',
      text: 'നിങ്ങളുടെ അക്കൗണ്ട് ബ്ലോക്ക് ചെയ്യും. ഉടൻ തന്നെ ബാങ്ക് ഓഫീസറെ വിളിച്ച് OTP പറയുക. ആരോടും പറയരുത്.' },
    { expect: 'SCAM', label: 'Hinglish — OTP batao',
      text: 'Sir main bank manager speaking. Aapka account block ho jayega. Jo OTP aaya hai woh mujhe batao, turant verify karna hai.' },
    { expect: 'SCAM', label: 'Job fee / task scam',
      text: 'Congratulations you are selected for part time job. Pay a registration fee of Rs 999 to start and earn Rs 5000 daily. Click this link to join.' },
    { expect: 'SUSPICIOUS', label: 'Unknown prize claim',
      text: 'You have been selected. Claim your reward before it expires, click the link now.' },
    { expect: 'SUSPICIOUS', label: 'Urgency + short link only',
      text: 'Urgent! Your package delivery failed. Update your address within 12 hours: https://track-post.xyz/claim' },
    { expect: 'SAFE', label: 'Genuine OTP SMS',
      text: 'Your OTP for net banking login is 483920. Valid for 10 minutes. Do not share this OTP with anyone. Bank never asks for OTP.' },
    { expect: 'SAFE', label: 'Genuine debit alert',
      text: 'Rs 1,250.00 debited from your A/c XX4521 on 12-Nov-2026 at AMAZON. Avl Bal: Rs 8,430.20. If not done by you, call our official helpline.' },
    { expect: 'SAFE', label: 'Genuine delivery message',
      text: 'Your order has been delivered. Thank you for shopping with us. Rate your delivery experience in the app.' },
    { expect: 'SAFE', label: 'Family message',
      text: 'Amma, I reached hostel safely. Will call you in the evening after class.' },
    { expect: 'SAFE', label: 'College notice',
      text: 'Dear students, tomorrow is the last date to submit your project synopsis to the department office.' },
    { expect: 'SAFE', label: 'Genuine KYC reminder with safety line',
      text: 'Please update your KYC at your nearest branch before 30 Nov. We never ask for your PIN or password. Do not share your details with anyone.' }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CORPUS;
  global.RAKSHA_CORPUS = CORPUS;
})(typeof window !== 'undefined' ? window : globalThis);
