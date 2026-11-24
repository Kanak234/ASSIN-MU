/* =====================================================================
   rules.js — SCAM RED-FLAG RULES (the "knowledge" of the website)
   ---------------------------------------------------------------------
   WHY:  Scam messages in India repeat the same tricks: fear, urgency,
         KYC, prize, OTP, unknown links. Each trick = one rule here.
         Keeping rules in their own file means we can add a new scam
         type without touching the logic in app.js.
   USE:  each rule has
           id      → short name
           label   → title shown to the user
           pattern → RegExp (search pattern); "gi" = global + ignore case
           weight  → how dangerous (added to risk score)
           why     → simple Hinglish explanation for normal people
   FLOW: loaded FIRST in index.html → app.js loops over RULES.
   ===================================================================== */

const RULES = [
  {
    id: "otp", label: "OTP / PIN maanga ja raha hai", weight: 35,
    pattern: /\b(otp|one[\s-]?time[\s-]?password|upi\s?pin|atm\s?pin|cvv|pin\s?(number|no)?)\b/gi,
    why: "Bank, police ya koi bhi company kabhi OTP, PIN ya CVV nahi maangti. Jo maange, wo 100% fraud hai."
  },
  {
    id: "kyc", label: "KYC / account band ki dhamki", weight: 25,
    pattern: /\b(kyc|pan\s?card|aadhaa?r)\b.{0,40}?\b(update|expire[ds]?|block(ed)?|suspend(ed)?|band|link)\b|\baccount\b.{0,30}?\b(block(ed)?|suspend(ed)?|band|freeze|frozen|deactivat\w*)\b/gi,
    why: "KYC kabhi SMS link se update nahi hota. Account band hone ka dar dikhakar log link khulwate hain."
  },
  {
    id: "urgent", label: "Jaldi karne ka pressure", weight: 15,
    pattern: /\b(urgent(ly)?|immediately|turant|abhi|jaldi|within\s\d+\s?(hours?|hrs?|minutes?|mins?)|\d+\s?(ghante|ghanta|minute)\s?(me|mein|ke andar)|today\s?only|last\s?chance|aaj\s?raat)\b/gi,
    why: "Scammer time ka pressure banata hai taaki aap sochne se pehle click kar do."
  },
  {
    id: "prize", label: "Inaam / lottery / free offer", weight: 20,
    pattern: /\b(won|winner|congratulations|lottery|lucky\s?draw|prize|reward|cashback|jeet(a|e)?|inaam|free\s?(gift|recharge|iphone))\b/gi,
    why: "Aapne koi lottery ya contest join hi nahi kiya, to inaam kaise? Ye 'fee bharo, inaam lo' wala fraud hota hai."
  },
  {
    id: "electricity", label: "Bijli kaatne ki dhamki", weight: 25,
    pattern: /\b(electricity|bijli|light)\b.{0,40}?\b(disconnect\w*|cut|kat|kaat\w*)\b/gi,
    why: "Bijli vibhag kisi personal mobile number se 'call karo warna bijli kategi' message nahi bhejta."
  },
  {
    id: "police", label: "Police / CBI / 'digital arrest' ka dar", weight: 30,
    pattern: /\b(digital\s?arrest|cbi|police|cyber\s?cell|customs|narcotics|court|warrant|fir|ed\s?officer)\b/gi,
    why: "'Digital arrest' naam ki koi cheez kanoon me nahi hai. Police video call par paise nahi maangti."
  },
  {
    id: "courier", label: "Courier / parcel ka bahana", weight: 15,
    pattern: /\b(parcel|courier|package|shipment|fedex|india\s?post)\b.{0,40}?\b(held|stuck|pending|return(ed)?|ruka|address)\b/gi,
    why: "Fake 'parcel ruka hai' message se log link par address/payment daal dete hain."
  },
  {
    id: "money", label: "Paise / payment ki maang", weight: 15,
    pattern: /(₹|rs\.?|inr)\s?\d[\d,]*|\b(pay|payment|transfer|bhejo|refund|processing\s?fee|registration\s?fee)\b/gi,
    why: "Kisi anjaan message par paise bhejne ya 'fee' bharne ko kaha jaye to ruk jaiye."
  },
  {
    id: "collect", label: "UPI 'receive' ke liye PIN daalna", weight: 30,
    pattern: /\b(collect\s?request|receive\s?money|paise\s?(lene|receive)|scan\s?(the\s?)?qr)\b/gi,
    why: "Paise LENE ke liye kabhi UPI PIN ya QR scan nahi karna padta. PIN sirf paise DENE ke liye hota hai."
  },
  {
    id: "job", label: "Ghar baithe kamai / task job", weight: 30,
    pattern: /\b(work\s?from\s?home|part[\s-]?time\s?job|daily\s?earn(ing)?|ghar\s?baithe|like\s?(and|&)\s?earn|youtube\s?like|task\s?job)\b/gi,
    why: "'Video like karo, ₹500 kamao' task scam hai. Pehle chhota paisa dete hain, phir badi 'investment' maangte hain."
  },
  {
    id: "app", label: "Remote app install karwana", weight: 30,
    pattern: /\b(anydesk|teamviewer|quick\s?support|rustdesk|apk|download\s?(this\s?)?app)\b/gi,
    why: "AnyDesk / APK install karwake scammer aapka poora phone control kar leta hai."
  },
  {
    id: "link", label: "Anjaan link", weight: 15,
    pattern: /\b(https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly\/[^\s]+|[a-z0-9-]+\.(xyz|top|click|info|live|in\.net|co)\/?[^\s]*)/gi,
    why: "Link par click karne se pehle sochiye. Asli bank links hamesha unke official domain par hote hain."
  },
  {
    id: "phone", label: "Personal mobile number par call karne ko kaha", weight: 10,
    pattern: /(\+91[\s-]?)?\b[6-9]\d{9}\b/g,
    why: "Badi companies 10-digit personal mobile number se contact nahi karti. Number official website se verify karein."
  }
];
// NEXT → app.js runs every rule's pattern on the pasted message.
