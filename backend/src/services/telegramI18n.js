/**
 * Trilingual Translation Dictionary for VMC Telegram Bot
 * Supported Languages:
 *   - 'en': English
 *   - 'gu': Gujarati (ગુજરાતી)
 *   - 'hi': Hindi (हिन्दी)
 */

const I18N = {
  en: {
    lang_name: 'English',
    welcome_header: '👋 <b>Namaste / Welcome to Vadodara Municipal Corporation (VMC)</b>\nCivic Infrastructure & Grievance Redressal Portal.\n\nPlease select the civic issue you would like to report:',
    category_menu_title: 'Please select the type of civic issue you would like to report:',
    change_language_btn: '🌐 Change Language / ભાષા બદલો',
    cancel_btn: '❌ Cancel Report',
    location_off_btn: '⚙️ My Location is OFF (Help Guide)',
    share_gps_btn: '📍 Share Live / Current GPS Location',
    take_photo_btn: '📷 Take / Attach Photo',
    skip_photo_btn: '⏭️ Skip Photo & Register Directly',
    yes_verified_btn: '✅ Yes, Verified Fixed',
    no_broken_btn: '❌ No, Still Broken',
    categories: {
      pothole: '🕳️ Road Pothole',
      water_leak: '💧 Water Leakage',
      broken_streetlight: '💡 Broken Streetlight',
      garbage_overflow: '🗑️ Garbage Dump',
      open_manhole: '⚠️ Open Manhole',
      exposed_wiring: '⚡ Exposed Wiring',
      gas_leak: '🔥 Gas Pipeline Leak',
      traffic_signal: '🚦 Traffic Signal Issue',
    },
    wards: [
      { id: 1, label: '📍 Ward 1 (Sayajigunj & Fatehgunj)', name: 'Ward 1 — Sayajigunj & Fatehgunj' },
      { id: 2, label: '📍 Ward 2 (Harni & Warasia)', name: 'Ward 2 — Harni & Warasia' },
      { id: 3, label: '📍 Ward 3 (Waghodia Road & Bapod)', name: 'Ward 3 — Waghodia Road & Bapod' },
      { id: 4, label: '📍 Ward 4 (Karelibaug & Sangam)', name: 'Ward 4 — Karelibaug & Sangam' },
      { id: 5, label: '📍 Ward 5 (Raopura & Mandvi)', name: 'Ward 5 — Raopura & Mandvi' },
      { id: 6, label: '📍 Ward 6 (Akota & Gotri)', name: 'Ward 6 — Akota & Gotri' },
      { id: 7, label: '📍 Ward 7 (Nizampura & Chhani)', name: 'Ward 7 — Nizampura & Chhani' },
      { id: 8, label: '📍 Ward 8 (Nagarwada)', name: 'Ward 8 — Nagarwada' },
      { id: 9, label: '📍 Ward 9 (Ajwa Road)', name: 'Ward 9 — Ajwa Road' },
      { id: 10, label: '📍 Ward 10 (Subhanpura & Gorwa)', name: 'Ward 10 — Subhanpura & Gorwa' },
      { id: 11, label: '📍 Ward 11 (Vasna-Bhayli & Diwalipura)', name: 'Ward 11 — Vasna-Bhayli & Diwalipura' },
      { id: 12, label: '📍 Ward 12 (Makarpura & Maneja)', name: 'Ward 12 — Makarpura & Maneja' },
      { id: 13, label: '📍 Ward 13 (Wadi & Ghadiali Pole)', name: 'Ward 13 — Wadi & Ghadiali Pole' },
      { id: 14, label: '📍 Ward 14 (Tarsali & Danteshwar)', name: 'Ward 14 — Tarsali & Danteshwar' },
      { id: 15, label: '📍 Ward 15 (Bapod & Ajwa Outer)', name: 'Ward 15 — Bapod & Ajwa Outer' },
      { id: 16, label: '📍 Ward 16 (Kishanwadi & Soma Talav)', name: 'Ward 16 — Kishanwadi & Soma Talav' },
      { id: 17, label: '📍 Ward 17 (Manjalpur & Atladra)', name: 'Ward 17 — Manjalpur & Atladra' },
      { id: 18, label: '📍 Ward 18 (Tandalja & Vasna Road)', name: 'Ward 18 — Tandalja & Vasna Road' },
      { id: 19, label: '📍 Ward 19 (Kapurai-Tarsali South)', name: 'Ward 19 — Kapurai-Tarsali (South)' },
    ],
    location_prompt: (categoryTitle) =>
      `Issue selected: <b>${categoryTitle}</b>\n\n📍 <b>Please choose your Location:</b>\n\n1️⃣ <b>Tap "📍 Share Live / Current GPS Location"</b> button below 👇\n2️⃣ <b>Or tap your Ward button</b>\n3️⃣ <b>Or type your area/landmark</b> (e.g. <i>Sayajigunj, Akota, Gotri, MSU, Alkapuri</i>)\n\n<i>💡 If your phone location is OFF, tap your Ward button above or tap "⚙️ My Location is OFF".</i>`,
    location_keyboard_hint: '👇 Tap below to send 1-click GPS location from your phone:',
    photo_prompt: (locationName, lat, lng) =>
      `📍 <b>Location Set:</b> ${locationName}\n⚡ <b>Coordinates:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}\n\n📷 <b>Attach Photo Evidence (Optional):</b>\n• 1️⃣ Tap <b>"📷 Take / Attach Photo"</b> below to snap a picture\n• 2️⃣ Or tap <b>"⏭️ Skip Photo & Register Directly"</b> to submit without a photo:`,
    photo_help:
      `📸 <b>Ready to Take / Attach Photo:</b>\n\n1️⃣ Tap the <b>Camera 📷</b> or <b>Paperclip 📎</b> icon next to the message bar.\n2️⃣ Snap a live photo of the issue or choose from your gallery.\n3️⃣ Tap <b>Send</b> — your complaint will be registered immediately with the photo attached!`,
    photo_received_choose_cat: '📸 <b>Photo received!</b>\nPlease select what issue is shown in the photo:',
    photo_received_choose_loc: '📸 <b>Photo received!</b>\nPlease select the location:',
    unrecognized_location: (text) =>
      `⚠️ Location <b>"${text}"</b> was not recognized in Vadodara.\n\nPlease <b>tap your Ward button</b> above or send a GPS location pin:`,
    cancelled: '❌ Report cancelled. Send "hi" or /start anytime to begin.',
    success_registration: (complaint, locationName, lat, lng, hasPhoto) =>
      `🎉 <b>Your Complaint is Successfully Registered!</b>\n\n` +
      `📋 <b>Ticket ID:</b> #${complaint.id}\n` +
      `🕳️ <b>Issue:</b> ${complaint.category}\n` +
      `📍 <b>Location:</b> ${locationName || `Ward ${complaint.ward_id}`}\n` +
      `⚡ <b>Coordinates:</b> ${lat.toFixed(5)}, ${lng.toFixed(5)}\n` +
      `🏢 <b>Assigned Team:</b> VMC Field Response Squad\n` +
      `🖼️ <b>Evidence:</b> ${hasPhoto ? '📸 Photo Attached ✓' : '📷 No Photo Attached'}\n\n` +
      `⏱️ <i>You will receive live status notifications here as VMC crews inspect and resolve your issue.</i>`,
    closed_loop_caption: (complaintId, category) =>
      `🔧 <b>VMC Resolution Verification</b>\n\nYour civic grievance report #${complaintId} regarding <b>${category}</b> has been marked as <b>Resolved</b> by VMC engineering crews.\n\n<i>Did this repair meet municipal standards? Please confirm below:</i>`,
    verification_yes_ack: (complaintId) =>
      `✅ <b>Thank you for confirming!</b> Report #${complaintId} is now permanently closed as <b>Resolved</b> in VMC audit records.`,
    verification_no_ack: (complaintId) =>
      `⚠️ <b>We apologize for the inconvenience.</b> Report #${complaintId} has been <b>RE-OPENED</b> and escalated with high priority to executive engineers.`,
    location_off_help:
      `⚙️ <b>How to Turn ON Location on Your Device:</b>\n\n` +
      `📱 <b>Android:</b> Swipe down from top ➔ Tap <b>Location 📍</b> icon to Turn ON (or Settings ➔ Location ➔ Turn On).\n` +
      `🍏 <b>iPhone / iOS:</b> Go to <b>Settings ➔ Privacy & Security ➔ Location Services ➔ Turn ON</b>.\n\n` +
      `💡 <b>Fastest Option:</b> You don't even need GPS turned on! Simply <b>tap your Ward button</b> in the menu above to proceed immediately!`,
  },

  gu: {
    lang_name: 'ગુજરાતી',
    welcome_header: '👋 <b>નમસ્તે! વડોદરા મહાનગરપાલિકા (VMC) માં આપનું સ્વાગત છે</b>\nનાગરિક ફરિયાદ નિવારણ પોર્ટલ.\n\nકૃપા કરીને આપ જે સમસ્યા નોંધાવવા માંગો છો તે પસંદ કરો:',
    category_menu_title: 'કૃપા કરીને આપ જે નાગરિક સમસ્યા નોંધાવવા માંગો છો તે પસંદ કરો:',
    change_language_btn: '🌐 ભાષા બદલો (Change Language)',
    cancel_btn: '❌ ફરિયાદ રદ કરો (Cancel)',
    location_off_btn: '⚙️ મારું લોકેશન બંધ છે (મદદ માર્ગદર્શિકા)',
    share_gps_btn: '📍 લાઇવ GPS લોકેશન મોકલો',
    take_photo_btn: '📷 ફોટો પાડો / જોડો',
    skip_photo_btn: '⏭️ ફોટો છોડો અને સીધી નોંધણી કરો',
    yes_verified_btn: '✅ હા, કામ યોગ્ય રીતે પૂર્ણ થયેલ છે',
    no_broken_btn: '❌ ના, હજુ પણ સમસ્યા છે',
    categories: {
      pothole: '🕳️ રસ્તા પર ખાડો (Pothole)',
      water_leak: '💧 પાણીની પાઇપલાઇન લીકેજ',
      broken_streetlight: '💡 સ્ટ્રીટલાઇટ બંધ / ખરાબ',
      garbage_overflow: '🗑️ કચરાનો ઢગલો / ગંદકી',
      open_manhole: '⚠️ ખુલ્લું ગટરનું ઢાંકણું (Manhole)',
      exposed_wiring: '⚡ ખુલ્લા વીજળીના વાયર',
      gas_leak: '🔥 ગેસ પાઇપલાઇન લીકેજ',
      traffic_signal: '🚦 ટ્રાફિક સિગ્નલ બંધ / ખરાબ',
    },
    wards: [
      { id: 1, label: '📍 વોર્ડ ૧ (સયાજીગંજ-ફતેહગંજ)', name: 'વોર્ડ ૧ — સયાજીગંજ અને ફતેહગંજ' },
      { id: 2, label: '📍 વોર્ડ ૨ (હરણી-વારસિયા)', name: 'વોર્ડ ૨ — હરણી અને વારસિયા' },
      { id: 3, label: '📍 વોર્ડ ૩ (વાઘોડિયા રોડ-બાપોદ)', name: 'વોર્ડ ૩ — વાઘોડિયા રોડ અને બાપોદ' },
      { id: 4, label: '📍 વોર્ડ ૪ (કારેલીબાગ-સંગમ)', name: 'વોર્ડ ૪ — કારેલીબાગ અને સંગમ' },
      { id: 5, label: '📍 વોર્ડ ૫ (રાવપુરા-માંડવી)', name: 'વોર્ડ ૫ — રાવપુરા અને માંડવી' },
      { id: 6, label: '📍 વોર્ડ ૬ (અકોટા-ગોત્રી)', name: 'વોર્ડ ૬ — અકોટા અને ગોત્રી' },
      { id: 7, label: '📍 વોર્ડ ૭ (નિઝામપુરા-છાણી)', name: 'વોર્ડ ૭ — નિઝામપુરા અને છાણી' },
      { id: 8, label: '📍 વોર્ડ ૮ (નાગરવાડા)', name: 'વોર્ડ ૮ — નાગરવાડા' },
      { id: 9, label: '📍 વોર્ડ ૯ (આજવા રોડ)', name: 'વોર્ડ ૯ — આજવા રોડ' },
      { id: 10, label: '📍 વોર્ડ ૧૦ (સુભાનપુરા-ગોરવા)', name: 'વોર્ડ ૧૦ — સુભાનપુરા અને ગોરવા' },
      { id: 11, label: '📍 વોર્ડ ૧૧ (વાસણા-ભાયલી-દિવાળીપુરા)', name: 'વોર્ડ ૧૧ — વાસણા-ભાયલી અને દિવાળીપુરા' },
      { id: 12, label: '📍 વોર્ડ ૧૨ (મકરપુરા-માણેજા)', name: 'વોર્ડ ૧૨ — મકરપુરા અને માણેજા (GIDC)' },
      { id: 13, label: '📍 વોર્ડ ૧૩ (વાડી-ઘડિયાળી પોળ)', name: 'વોર્ડ ૧૩ — વાડી અને ઘડિયાળી પોળ' },
      { id: 14, label: '📍 વોર્ડ ૧૪ (તરસાલી-દાંતેશ્વર)', name: 'વોર્ડ ૧૪ — તરસાલી અને દાંતેશ્વર' },
      { id: 15, label: '📍 વોર્ડ ૧૫ (બાપોદ-આજવા આઉટર)', name: 'વોર્ડ ૧૫ — બાપોદ અને આજવા આઉટર' },
      { id: 16, label: '📍 વોર્ડ ૧૬ (કિશનવાડી-સોમા તળાવ)', name: 'વોર્ડ ૧૬ — કિશનવાડી અને સોમા તળાવ' },
      { id: 17, label: '📍 વોર્ડ ૧૭ (માંજલપુર-અટલાદરા)', name: 'વોર્ડ ૧૭ — માંજલપુર અને અટલાદરા' },
      { id: 18, label: '📍 વોર્ડ ૧૮ (તાંદલજા-વાસણા રોડ)', name: 'વોર્ડ ૧૮ — તાંદલજા અને વાસણા રોડ' },
      { id: 19, label: '📍 વોર્ડ ૧૯ (કપુરાઈ-તરસાલી દક્ષિણ)', name: 'વોર્ડ ૧૯ — કપુરાઈ-તરસાલી (દક્ષિણ)' },
    ],
    location_prompt: (categoryTitle) =>
      `પસંદ કરેલ ફરિયાદ: <b>${categoryTitle}</b>\n\n📍 <b>કૃપા કરીને આપનું સ્થળ પસંદ કરો:</b>\n\n1️⃣ નીચે આપેલ <b>"📍 લાઇવ GPS લોકેશન મોકલો"</b> બટન દબાવો 👇\n2️⃣ <b>અથવા આપનો વોર્ડ બટન પસંદ કરો</b>\n3️⃣ <b>અથવા આપના વિસ્તાર/લેન્ડમાર્કનું નામ લખો</b> (દા.ત. <i>સયાજીગંજ, અકોટા, ગોત્રી, કારેલીબાગ, એમએસયુ</i>)\n\n<i>💡 જો ફોનનું લોકેશન બંધ હોય તો ઉપર આપેલ વોર્ડ બટન દબાવો અથવા "⚙️ મારું લોકેશન બંધ છે" દબાવો.</i>`,
    location_keyboard_hint: '👇 આપના ફોનમાંથી 1-ક્લિક GPS લોકેશન મોકલવા નીચે દબાવો:',
    photo_prompt: (locationName, lat, lng) =>
      `📍 <b>સ્થળ:</b> ${locationName}\n⚡ <b>કોઓર્ડિનેટ્સ:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}\n\n📷 <b>ફોટો પુરાવો જોડો (મરજિયાત):</b>\n• 1️⃣ ફોટો પાડવા નીચે <b>"📷 ફોટો પાડો / જોડો"</b> દબાવો\n• 2️⃣ અથવા ફોટો વગર ફરિયાદ નોંધવા <b>"⏭️ ફોટો છોડો અને સીધી નોંધણી કરો"</b> દબાવો:`,
    photo_help:
      `📸 <b>ફોટો જોડવા માટે તૈયાર:</b>\n\n1️⃣ મેસેજ બાર પાસે આપેલ <b>કેમેરા 📷</b> અથવા <b>પિન 📎</b> આયકન દબાવો.\n2️⃣ લાઈવ ફોટો પાડો અથવા ગેલેરીમાંથી પસંદ કરો.\n3️⃣ <b>Send</b> દબાવો — આપની ફરિયાદ ફોટો સાથે તરત જ નોંધાઈ જશે!`,
    photo_received_choose_cat: '📸 <b>ફોટો પ્રાપ્ત થયો!</b>\nકૃપા કરીને આ ફોટામાં કઈ સમસ્યા છે તે પસંદ કરો:',
    photo_received_choose_loc: '📸 <b>ફોટો પ્રાપ્ત થયો!</b>\nકૃપા કરીને સ્થળ પસંદ કરો:',
    unrecognized_location: (text) =>
      `⚠️ <b>"${text}"</b> વડોદરામાં ઓળખાયું નથી.\n\nકૃપા કરીને ઉપર આપેલ <b>વોર્ડ બટન</b> પસંદ કરો અથવા GPS લોકેશન મોકલો:`,
    cancelled: '❌ ફરિયાદ રદ કરવામાં આવી છે. ફરી શરૂ કરવા "hi" અથવા /start મોકલો.',
    success_registration: (complaint, locationName, lat, lng, hasPhoto) =>
      `🎉 <b>આપની ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે!</b>\n\n` +
      `📋 <b>ટોકન નંબર (Ticket ID):</b> #${complaint.id}\n` +
      `🕳️ <b>સમસ્યા:</b> ${complaint.category}\n` +
      `📍 <b>સ્થળ:</b> ${locationName || `વોર્ડ ${complaint.ward_id}`}\n` +
      `⚡ <b>કોઓર્ડિનેટ્સ:</b> ${lat.toFixed(5)}, ${lng.toFixed(5)}\n` +
      `🏢 <b>નિમણૂક કરેલ ટીમ:</b> VMC ફિલ્ડ રિસ્પોન્સ ટીમ\n` +
      `🖼️ <b>પુરાવો:</b> ${hasPhoto ? '📸 ફોટો જોડાયેલ છે ✓' : '📷 ફોટો જોડાયેલ નથી'}\n\n` +
      `⏱️ <i>VMC એન્જિનિયરિંગ ટીમ દ્વારા તપાસ અને સમારકામ કરવામાં આવશે ત્યારે આપને અહીં લાઇવ અપડેટ્સ મળશે.</i>`,
    closed_loop_caption: (complaintId, category) =>
      `🔧 <b>VMC ફરિયાદ નિરાકરણ ચકાસણી</b>\n\nઆપની ફરિયાદ #${complaintId} (<b>${category}</b>) VMC ટીમ દ્વારા <b>નિરાકરણ (Resolved)</b> કરવામાં આવી છે.\n\n<i>શું આ સમારકામ યોગ્ય રીતે પૂર્ણ થયેલ છે? કૃપા કરીને નીચે પુષ્ટિ કરો:</i>`,
    verification_yes_ack: (complaintId) =>
      `✅ <b>પુષ્ટિ કરવા બદલ આભાર!</b> ફરિયાદ #${complaintId} VMC રેકોર્ડમાં કાયમી ધોરણે <b>સફળતાપૂર્વક પૂર્ણ (Resolved)</b> તરીકે બંધ કરવામાં આવી છે.`,
    verification_no_ack: (complaintId) =>
      `⚠️ <b>અસુવિધા બદલ દિલગીર છીએ.</b> ફરિયાદ #${complaintId} ફરીથી <b>ચાલુ (RE-OPENED)</b> કરવામાં આવી છે અને ઉચ્ચ અધિકારીઓને તાત્કાલિક મોકલી દેવામાં આવી છે.`,
    location_off_help:
      `⚙️ <b>આપના ફોનમાં લોકેશન કેવી રીતે ચાલુ કરવું:</b>\n\n` +
      `📱 <b>Android:</b> ઉપરથી નીચે સ્વાઇપ કરો ➔ <b>Location 📍</b> આયકન પર ટેપ કરો.\n` +
      `🍏 <b>iPhone / iOS:</b> <b>Settings ➔ Privacy & Security ➔ Location Services ➔ Turn ON</b> કરો.\n\n` +
      `💡 <b>સૌથી સરળ રીત:</b> લોકેશન ચાલુ કર્યા વગર પણ આપ ઉપર આપેલ <b>વોર્ડ બટન</b> દબાવીને આગળ વધી શકો છો!`,
  },

  hi: {
    lang_name: 'हिन्दी',
    welcome_header: '👋 <b>नमस्ते! वडोदरा महानगर पालिका (VMC) में आपका स्वागत है</b>\nनागरिक शिकायत निवारण पोर्टल।\n\nकृपया वह समस्या चुनें जिसकी आप शिकायत दर्ज करना चाहते हैं:',
    category_menu_title: 'कृपया वह नागरिक समस्या चुनें जिसकी आप शिकायत दर्ज करना चाहते हैं:',
    change_language_btn: '🌐 भाषा बदलें (Change Language)',
    cancel_btn: '❌ शिकायत रद्द करें (Cancel)',
    location_off_btn: '⚙️ मेरा लोकेशन बंद है (सहायता निर्देशिका)',
    share_gps_btn: '📍 लाइव GPS लोकेशन भेजें',
    take_photo_btn: '📷 फोटो खींचें / संलग्न करें',
    skip_photo_btn: '⏭️ फोटो छोड़ें और सीधे दर्ज करें',
    yes_verified_btn: '✅ हाँ, काम ठीक से पूरा हो गया है',
    no_broken_btn: '❌ नहीं, अभी भी समस्या है',
    categories: {
      pothole: '🕳️ सड़क पर गड्ढा (Pothole)',
      water_leak: '💧 पानी की पाइपलाइन लीकेज',
      broken_streetlight: '💡 स्ट्रीटलाइट खराब / बंद',
      garbage_overflow: '🗑️ कचरे का ढेर / गंदगी',
      open_manhole: '⚠️ खुला गटर / मैनहोल',
      exposed_wiring: '⚡ खुले बिजली के तार',
      gas_leak: '🔥 गैस पाइपलाइन लीकेज',
      traffic_signal: '🚦 ट्रैफिक सिग्नल खराब / बंद',
    },
    wards: [
      { id: 1, label: '📍 वार्ड १ (सयाजीगंज-फतेहगंज)', name: 'वार्ड १ — सयाजीगंज और फतेहगंज' },
      { id: 2, label: '📍 वार्ड २ (हरणी-वारसिया)', name: 'वार्ड २ — हरणी और वारसिया' },
      { id: 3, label: '📍 वार्ड ३ (वाघोडिया रोड-बापोद)', name: 'वार्ड ३ — वाघोडिया रोड और बापोद' },
      { id: 4, label: '📍 वार्ड ४ (कारेलीबाग-संगम)', name: 'वार्ड ४ — कारेलीबाग और संगम' },
      { id: 5, label: '📍 वार्ड ५ (रावपुरा-मांडवी)', name: 'वार्ड ५ — रावपुरा और मांडवी' },
      { id: 6, label: '📍 वार्ड ६ (अकोटा-गोत्री)', name: 'वार्ड ६ — अकोटा और गोत्री' },
      { id: 7, label: '📍 वार्ड ७ (निजामपुरा-छाणी)', name: 'वार्ड ७ — निजामपुरा और छाणी' },
      { id: 8, label: '📍 वार्ड ८ (नागरवाड़ा)', name: 'वार्ड ८ — नागरवाड़ा' },
      { id: 9, label: '📍 वार्ड ९ (आजवा रोड)', name: 'वार्ड ९ — आजवा रोड' },
      { id: 10, label: '📍 वार्ड १० (सुभानपुरा-गोरवा)', name: 'वार्ड १० — सुभानपुरा और गोरवा' },
      { id: 11, label: '📍 वार्ड ११ (वासणा-भायली-दिवालीपुरा)', name: 'वार्ड ११ — वासणा-भायली और दिवालीपुरा' },
      { id: 12, label: '📍 वार्ड १२ (मकरपुरा-मानेजा)', name: 'वार्ड १२ — मकरपुरा और मानेजा (GIDC)' },
      { id: 13, label: '📍 वार्ड १३ (वाडी-घडियाली पोल)', name: 'वार्ड १३ — वाडी और घडियाली पोल' },
      { id: 14, label: '📍 वार्ड १४ (तरसाली-दांतेश्वर)', name: 'वार्ड १४ — तरसाली और दांतेश्वर' },
      { id: 15, label: '📍 वार्ड १५ (बापोद-आजवा आउटर)', name: 'वार्ड १५ — बापोद और आजवा आउटर' },
      { id: 16, label: '📍 वार्ड १६ (किशनवाड़ी-सोमा तालाब)', name: 'वार्ड १६ — किशनवाड़ी और सोमा तालाब' },
      { id: 17, label: '📍 वार्ड १७ (मांजलपुर-अटलादरा)', name: 'वार्ड १७ — मांजलपुर और अटलादरा' },
      { id: 18, label: '📍 वार्ड १८ (तांदलजा-वासणा रोड)', name: 'वार्ड १८ — तांदलजा और वासणा रोड' },
      { id: 19, label: '📍 वार्ड १९ (कपुराई-तरसाली दक्षिण)', name: 'वार्ड १९ — कपुराई-तरसाली (दक्षिण)' },
    ],
    location_prompt: (categoryTitle) =>
      `चयनित शिकायत: <b>${categoryTitle}</b>\n\n📍 <b>कृपया अपना स्थान चुनें:</b>\n\n1️⃣ नीचे दिया गया <b>"📍 लाइव GPS लोकेशन भेजें"</b> बटन दबाएं 👇\n2️⃣ <b>या अपना वार्ड बटन चुनें</b>\n3️⃣ <b>या अपने क्षेत्र/लैंडमार्क का नाम लिखें</b> (उदा. <i>सयाजीगंज, अकोटा, गोत्री, कारेलीबाग, एमएसयू</i>)\n\n<i>💡 यदि फोन का लोकेशन बंद है तो ऊपर दिया गया वार्ड बटन दबाएं या "⚙️ मेरा लोकेशन बंद है" चुनें।</i>`,
    location_keyboard_hint: '👇 अपने फोन से 1-क्लिक GPS लोकेशन भेजने के लिए नीचे दबाएं:',
    photo_prompt: (locationName, lat, lng) =>
      `📍 <b>स्थान:</b> ${locationName}\n⚡ <b>निर्देशांक:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}\n\n📷 <b>फोटो साक्ष्य संलग्न करें (वैकल्पिक):</b>\n• 1️⃣ फोटो खींचने के लिए नीचे <b>"📷 फोटो खींचें / संलग्न करें"</b> दबाएं\n• 2️⃣ या बिना फोटो दर्ज करने के लिए <b>"⏭️ फोटो छोड़ें और सीधे दर्ज करें"</b> दबाएं:`,
    photo_help:
      `📸 <b>फोटो संलग्न करने के लिए तैयार:</b>\n\n1️⃣ मैसेज बार के पास दिए गए <b>कैमरा 📷</b> या <b>पिन 📎</b> आइकन को दबाएं।\n2️⃣ लाइव फोटो खींचें या गैलरी से चुनें।\n3️⃣ <b>Send</b> दबाएं — आपकी शिकायत फोटो के साथ तुरंत दर्ज हो जाएगी!`,
    photo_received_choose_cat: '📸 <b>फोटो प्राप्त हुआ!</b>\nकृपया चुनें कि इस फोटो में क्या समस्या है:',
    photo_received_choose_loc: '📸 <b>फोटो प्राप्त हुआ!</b>\nकृपया स्थान चुनें:',
    unrecognized_location: (text) =>
      `⚠️ <b>"${text}"</b> वडोदरा में पहचाना नहीं गया।\n\nकृपया ऊपर दिया गया <b>वार्ड बटन</b> चुनें या GPS लोकेशन पिन भेजें:`,
    cancelled: '❌ शिकायत रद्द कर दी गई है। पुनः शुरू करने के लिए "hi" या /start भेजें।',
    success_registration: (complaint, locationName, lat, lng, hasPhoto) =>
      `🎉 <b>आपकी शिकायत सफलतापूर्वक दर्ज हो गई है!</b>\n\n` +
      `📋 <b>टोकन नंबर (Ticket ID):</b> #${complaint.id}\n` +
      `🕳️ <b>समस्या:</b> ${complaint.category}\n` +
      `📍 <b>स्थान:</b> ${locationName || `वार्ड ${complaint.ward_id}`}\n` +
      `⚡ <b>निर्देशांक:</b> ${lat.toFixed(5)}, ${lng.toFixed(5)}\n` +
      `🏢 <b>नियुक्त टीम:</b> VMC फील्ड रिस्पांस टीम\n` +
      `🖼️ <b>साक्ष्य:</b> ${hasPhoto ? '📸 फोटो संलग्न है ✓' : '📷 कोई फोटो संलग्न नहीं'}\n\n` +
      `⏱️ <i>VMC इंजीनियरिंग टीम द्वारा निरीक्षण और मरम्मत किए जाने पर आपको यहाँ लाइव अपडेट मिलेंगे।</i>`,
    closed_loop_caption: (complaintId, category) =>
      `🔧 <b>VMC शिकायत निवारण सत्यापन</b>\n\nआपकी शिकायत #${complaintId} (<b>${category}</b>) VMC टीम द्वारा <b>हल (Resolved)</b> कर दी गई है।\n\n<i>क्या यह मरम्मत सही तरीके से पूरी हुई है? कृपया नीचे पुष्टि करें:</i>`,
    verification_yes_ack: (complaintId) =>
      `✅ <b>पुष्टि करने के लिए धन्यवाद!</b> शिकायत #${complaintId} VMC रिकॉर्ड में स्थायी रूप से <b>सफलतापूर्वक हल (Resolved)</b> के रूप में बंद कर दी गई है।`,
    verification_no_ack: (complaintId) =>
      `⚠️ <b>असुविधा के लिए खेद है।</b> शिकायत #${complaintId} को फिर से <b>सक्रिय (RE-OPENED)</b> कर दिया गया है और उच्च अधिकारियों को तत्काल भेज दिया गया है।`,
    location_off_help:
      `⚙️ <b>अपने डिवाइस में लोकेशन कैसे चालू करें:</b>\n\n` +
      `📱 <b>Android:</b> ऊपर से नीचे स्वाइप करें ➔ <b>Location 📍</b> आइकन पर टैप करें।\n` +
      `🍏 <b>iPhone / iOS:</b> <b>Settings ➔ Privacy & Security ➔ Location Services ➔ Turn ON</b> करें।\n\n` +
      `💡 <b>सबसे तेज़ तरीका:</b> लोकेशन चालू किए बिना भी आप ऊपर दिया गया <b>वार्ड बटन</b> दबाकर आगे बढ़ सकते हैं!`,
  },
};

function getT(lang = 'en') {
  return I18N[lang] || I18N.en;
}

module.exports = {
  I18N,
  getT,
};
