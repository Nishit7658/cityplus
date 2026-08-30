'use client';

// Language Context & Trilingual (English / ગુજરાતી / हिन्दी) Dictionary
// Vadodara Municipal Corporation (VMC) / Government of Gujarat

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'gu' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar & Branding
    'vmc.title': 'Vadodara Municipal Corporation',
    'vmc.subtitle': 'CityPulse • Civic Infrastructure & Public Grievance Redressal Control Room',
    'vmc.crms_active': 'CRMS Portal Active',
    'vmc.active_issues': 'Active Issues',
    'vmc.control_officer': 'Control Officer',
    'vmc.vadodara_central': 'Vadodara Central',
    'vmc.all_wards': 'All Wards (Vadodara)',
    'vmc.jurisdiction': 'Jurisdiction',
    'vmc.system_status': 'System Status',
    'vmc.operational': '100% Operational',
    'vmc.gov_gujarat': 'Government of Gujarat',
    'vmc.state_label': 'Government of Gujarat',
    'vmc.dept_name': 'Urban Development & Urban Housing Department',
    'vmc.dept_label': 'Urban Development & Urban Housing',
    'vmc.officer_title': 'Control Officer',
    'vmc.officer_sub': 'Vadodara Central',

    // Navigation Tabs
    'nav.overview': 'Overview',
    'nav.map': 'Live GIS Map',
    'nav.queue': 'Grievance Queue',
    'nav.hotspots': 'Failure Hotspots',
    'nav.officers': 'Field Officers',
    'nav.transparency': 'Public Transparency',
    'nav.settings': 'System Settings',

    // Common Actions & Labels
    'common.select_all': 'Select All',
    'common.clear_filters': 'Clear Filters',
    'common.search': 'Search',
    'common.action': 'Action',
    'common.status': 'Status',
    'common.category': 'Category',
    'common.severity': 'Severity',
    'common.ward': 'Ward',
    'common.location': 'Location',
    'common.date': 'Date',
    'common.close': 'Close',
    'common.inspect': 'Inspect',
    'common.verified': 'Verified',
    'common.tickets': 'Tickets',
    'common.loading': 'Loading...',
    'common.no_data': 'No records found matching the active criteria.',
    'common.language': 'Language',

    // Categories
    'cat.all': 'All Categories',
    'cat.pothole': 'Road Potholes',
    'cat.water_leak': 'Water Pipeline Leakage',
    'cat.broken_streetlight': 'Streetlight Defect',
    'cat.garbage_overflow': 'Garbage Overflow',
    'cat.open_manhole': 'Open Drainage / Manhole',
    'cat.exposed_wiring': 'Exposed Electrical Wiring',
    'cat.drainage_overflow': 'Drainage Overflow',
    'cat.drainage': 'Drainage Overflow',
    'cat.gas_leak': 'Gas Pipeline Leak',
    'cat.traffic_signal': 'Traffic Signal Failure',
    'cat.road_damage': 'Road Structural Damage',
    'cat.other': 'Other Civic Issue',

    // Status
    'status.pending': 'Pending',
    'status.assigned': 'Assigned',
    'status.in_progress': 'In Progress',
    'status.resolved': 'Resolved',

    // Severities
    'sev.low': 'Low Priority',
    'sev.medium': 'Medium Priority',
    'sev.critical': 'Critical Priority',

    // Wards
    'ward.1': 'Ward 1 — Sayajigunj & Fatehgunj',
    'ward.2': 'Ward 2 — Harni & Warasia',
    'ward.3': 'Ward 3 — Waghodia Road & Bapod',
    'ward.4': 'Ward 4 — Karelibaug & Sangam',
    'ward.5': 'Ward 5 — Raopura & Mandvi',
    'ward.6': 'Ward 6 — Akota & Gotri',
    'ward.7': 'Ward 7 — Nizampura & Chhani',
    'ward.8': 'Ward 8 — Nagarwada',
    'ward.9': 'Ward 9 — Ajwa Road',
    'ward.10': 'Ward 10 — Subhanpura & Gorwa',
    'ward.11': 'Ward 11 — Vasna-Bhayli & Diwalipura',
    'ward.12': 'Ward 12 — Makarpura & Maneja',
    'ward.13': 'Ward 13 — Wadi & Ghadiali Pole',
    'ward.14': 'Ward 14 — Tarsali & Danteshwar',
    'ward.15': 'Ward 15 — Bapod & Ajwa Outer',
    'ward.16': 'Ward 16 — Kishanwadi & Soma Talav',
    'ward.17': 'Ward 17 — Manjalpur & Atladra',
    'ward.18': 'Ward 18 — Tandalja & Vasna Road',
    'ward.19': 'Ward 19 — Kapurai-Tarsali (South)',

    // Departments
    'dept.all': 'All Departments',
    'dept.road': 'Road & Building Dept',
    'dept.drainage': 'Drainage & Sewerage Dept',
    'dept.waste': 'Solid Waste Management',
    'dept.electric': 'Electrical & Lighting Dept',
    'dept.water': 'Water Supply Department',
    'dept.health': 'Health & Sanitation Dept',

    // Overview Page
    'overview.title': 'Municipal Operations & Citizen Grievance Dashboard',
    'overview.total_logged': 'Total Grievances Logged',
    'overview.total_logged_sub': 'Citizen intake via WhatsApp Cloud API & Web Portal',
    'overview.pending_dispatch': 'Pending Zonal Dispatch',
    'overview.pending_dispatch_sub': 'Awaiting officer assignment and field inspection',
    'overview.active_progress': 'Active Work In Progress',
    'overview.active_progress_sub': 'Field repair crews and engineering teams dispatched',
    'overview.closed_verified': 'Closed & Verified Fixes',
    'overview.closed_verified_sub': 'Audited with citizen WhatsApp confirmation',
    'overview.gis_map_title': 'VMC GIS Spatial Incident Map',
    'overview.gis_map_sub': '18m Spatial Clustering Enabled',
    'overview.closed_loop_title': 'Citizen Closed-Loop Verification Protocol',
    'overview.closed_loop_mandatory': 'Mandatory',
    'overview.closed_loop_desc': 'Per VMC Citizen Charter guidelines, no grievance is permanently closed until the reporting citizen confirms the repair quality via WhatsApp Quick-Reply prompt.',
    'overview.verification_rate': 'Verification Rate',
    'overview.auto_reopen': 'Auto-Reopen on \'No\'',
    'overview.dept_dist_title': 'Departmental Workload Distribution',
    'overview.active_tickets': 'Active Tickets',
    'overview.high_priority_alert': '⚠️ High-Priority Municipal Alert',
    'overview.chronic_spot': 'Chronic Spot #103',
    'overview.location': 'Location:',
    'overview.defect_category': 'Defect Category:',
    'overview.failure_recurrence': 'Failure Recurrence:',
    'overview.exec_note': 'Executive Engineering Note: Sub-base erosion detected. Temporary asphalt patch insufficient. Requires capital structural reinforcement by Drainage & Sewerage Department.',
    'overview.recent_inbound': 'Recent Inbound Citizen Grievances',
    'overview.live_stream': 'Live Stream',

    // Queue Page
    'queue.title': 'Municipal Work Orders & Citizen Task Queue',
    'queue.desc': 'Active intake queue for zonal triage, priority escalation, and field engineering dispatch.',
    'queue.filter_status': 'Filter by Status:',
    'queue.select_all': 'Select All',
    'queue.clear_filters': 'Clear Filters',
    'queue.th_ticket': 'Ticket & Category',
    'queue.th_status': 'Status',
    'queue.th_priority': 'Priority Urgency',
    'queue.th_ward': 'Jurisdiction Ward',
    'queue.th_density': 'Citizen Density',
    'queue.th_reported': 'Reported Date',
    'queue.th_action': 'Action',
    'queue.review': 'Review →',

    // Map Page
    'map.pinned_issues': 'Pinned Issues on Map',
    'map.live_feed': 'Live VMC GIS Feed',
    'map.spots_count': '{filtered} of {total} spots',
    'map.toggle_pins': 'Toggle Markers',
    'map.toggle_heatmap': 'Toggle Heatmap',
    'map.toggle_wards': 'Toggle Ward Boundaries',

    // Officers Page
    'officers.title': 'Zonal Field Engineers & Departmental Officers',
    'officers.desc': 'Official roster of designated ward engineers, active municipal work orders, and jurisdiction assignments.',
    'officers.total_officers': 'Total Officers',
    'officers.active_orders': 'Active Work Orders',
    'officers.total_resolved': 'Total Resolved',
    'officers.search_placeholder': 'Search by officer, ward, dept...',
    'officers.cards_view': 'Cards View',
    'officers.table_view': 'Table View',
    'officers.assigned_ward': 'Assigned Ward:',
    'officers.official_contact': 'Official Contact:',
    'officers.active_tasks': 'Active Tasks',
    'officers.total_cleared': 'Total Cleared',
    'officers.direct_contact': 'Direct Contact',
    'officers.executive_engineer': 'Executive Engineer',

    // Transparency Page
    'transparency.title': 'Transparency, Civic Performance & Ward Audit',
    'transparency.desc': 'Real-time public record of civic complaints, resolution turnaround times, and departmental accountability under the Citizen Charter.',
    'transparency.open_access': 'Verified Open Access',
    'transparency.sop_title': 'Standard Operating Procedure (SOP) — Citizen Grievance Redressal',
    'transparency.sop_sub': 'Automated 4-tier lifecycle ensuring spatial accuracy, rapid field dispatch, and citizen-verified closure.',
    'transparency.circular': 'VMC Circular 2026/04',
    'transparency.stage1_title': 'Citizen Grievance Intake',
    'transparency.stage1_desc': 'Citizens report civic defects via official VMC WhatsApp Helpline or web portal with photos and GPS geo-location.',
    'transparency.stage2_title': 'Spatial De-duplication',
    'transparency.stage2_desc': 'PostGIS spatial engine automatically clusters multi-citizen reports within 18m into a consolidated work order.',
    'transparency.stage3_title': 'Zonal Officer Dispatch',
    'transparency.stage3_desc': 'Tickets are dynamically prioritized and routed to designated ward executive engineers with strict turnaround SLAs.',
    'transparency.stage4_title': 'Citizen Verification',
    'transparency.stage4_desc': 'Automated verification message sent to citizen upon completion. Citizen confirms fix quality before final ticket closure.',
    'transparency.ward_ledger_title': 'Ward-Level Resolution Performance Ledger (10 VMC Wards)',
    'transparency.ward_ledger_sub': 'Audited complaint volume, resolution count, and SLA performance across all administrative zones.',
    'transparency.sla_compliant': 'SLA Compliant',
    'transparency.under_review': 'Under Review',

    // Hotspots Page
    'hotspots.title': 'Urban Infrastructure Vulnerability & Failure Hotspots',
    'hotspots.desc': 'GIS spatial density analysis identifying chronic civic failure clusters requiring capital engineering intervention.',
    'hotspots.critical_spots': 'Critical Risk Spots',
    'hotspots.chronic_recurring': 'Chronic Recurring',
    'hotspots.heatmap_title': 'Citywide Infrastructure Density & Risk Heatmap',
    'hotspots.heatmap_sub': 'Spatial PostGIS Interpolation (Vadodara Metro)',
    'hotspots.ledger_title': 'Ranked Infrastructure Defect Ledger',
    'hotspots.ledger_sub': 'Priority order based on citizen report density, failure recurrence frequency, and severity risk index.',
    'hotspots.all_spots': 'All Spots',
    'hotspots.high_risk': 'High Risk (80+)',
    'hotspots.recurring_spots': 'Recurring Spots',
    'hotspots.inspect': 'Inspect',

    // Drawer Component
    'drawer.location_coords': 'Location Coordinates',
    'drawer.confirmations': 'Citizen Confirmations',
    'drawer.evidence_title': 'Civic Evidence & Resolution Proof',
    'drawer.intake_photo': 'Citizen Intake Photo',
    'drawer.repair_photo': 'Field Resolution Proof',
    'drawer.no_photo': 'No photo submitted with report',
    'drawer.upload_resolution_photo': 'Upload Resolution Proof (Photo)',
    'drawer.click_to_expand': 'Click to inspect in full resolution',
    'drawer.uploading': 'Uploading evidence photo…',
    'drawer.timeline': 'Resolution Timeline',
    'drawer.assign_officer': 'Assign Field Officer',
    'drawer.choose_officer': 'Choose officer…',
    'drawer.assign_button': 'Assign',
    'drawer.in_progress_button': 'In Progress',
    'drawer.mark_resolved_button': 'Mark Resolved',
    'drawer.reopened_notice': '↩ Reopened {count}× by citizen verification',

    // Settings Page
    'settings.title': 'System Settings & Developer Console',
    'settings.dev_tools': 'DEVELOPER TOOLS',
    'settings.simulator_title': 'WhatsApp Chatbot Simulator',
    'settings.simulator_desc': 'Simulates incoming WhatsApp citizen messages, runs through the state machine, and tests PostGIS deduplication.',
    'settings.phone_label': 'Citizen Phone Number',
    'settings.message_label': 'Citizen Message / Payload',
    'settings.send_button': '↗ Send Simulated Message',
    'settings.sending': 'Sending...',
    'settings.response': 'API Response',
    'settings.environment': 'Environment Configuration',
  },

  gu: {
    // Top Bar & Branding
    'vmc.title': 'વડોદરા મહાનગરપાલિકા',
    'vmc.subtitle': 'સિટીપલ્સ • નાગરિક ઇન્ફ્રાસ્ટ્રક્ચર અને જાહેર ફરિયાદ નિવારણ કંટ્રોલ રૂમ',
    'vmc.crms_active': 'CRMS પોર્ટલ સક્રિય',
    'vmc.active_issues': 'સક્રિય ફરિયાદો',
    'vmc.control_officer': 'કંટ્રોલ ઓફિસર',
    'vmc.vadodara_central': 'વડોદરા સેન્ટ્રલ',
    'vmc.all_wards': 'બધા વોર્ડ (વડોદરા)',
    'vmc.jurisdiction': 'અધિકારક્ષેત્ર',
    'vmc.system_status': 'સિસ્ટમ સ્થિતિ',
    'vmc.operational': '૧૦૦% કાર્યરત',
    'vmc.gov_gujarat': 'ગુજરાત સરકાર',
    'vmc.state_label': 'ગુજરાત સરકાર',
    'vmc.dept_name': 'શહેરી વિકાસ અને શહેરી ગૃહ નિર્માણ વિભાગ',
    'vmc.dept_label': 'શહેરી વિકાસ અને શહેરી ગૃહ નિર્માણ',
    'vmc.officer_title': 'કંટ્રોલ ઓફિસર',
    'vmc.officer_sub': 'વડોદરા સેન્ટ્રલ',

    // Navigation Tabs
    'nav.overview': 'વિહંગાવલોકન',
    'nav.map': 'લાઈવ GIS નકશો',
    'nav.queue': 'ફરિયાદ કતાર',
    'nav.hotspots': 'હોટસ્પોટ્સ',
    'nav.officers': 'વોર્ડ ઇજનેરો',
    'nav.transparency': 'જાહેર પારદર્શિતા',
    'nav.settings': 'સિસ્ટમ સેટિંગ્સ',

    // Common Actions & Labels
    'common.select_all': 'બધા પસંદ કરો',
    'common.clear_filters': 'ફિલ્ટર સાફ કરો',
    'common.search': 'શોધો',
    'common.action': 'ક્રિયા',
    'common.status': 'સ્થિતિ',
    'common.category': 'શ્રેણી',
    'common.severity': 'તીવ્રતા',
    'common.ward': 'વોર્ડ',
    'common.location': 'સ્થળ',
    'common.date': 'તારીખ',
    'common.close': 'બંધ કરો',
    'common.inspect': 'તપાસો',
    'common.verified': 'ચકાસાયેલ',
    'common.tickets': 'ફરિયાદો',
    'common.loading': 'લોડ થઈ રહ્યું છે...',
    'common.no_data': 'પસંદ કરેલ માપદંડ મુજબ કોઈ રેકોર્ડ મળેલ નથી.',
    'common.language': 'ભાષા',

    // Categories
    'cat.all': 'બધી શ્રેણીઓ',
    'cat.pothole': 'રોડ પર ખાડા',
    'cat.water_leak': 'પાણીની પાઇપલાઇન લીકેજ',
    'cat.broken_streetlight': 'બંધ સ્ટ્રીટલાઇટ',
    'cat.garbage_overflow': 'કચરાના ઢગલા / ગંદકી',
    'cat.open_manhole': 'ખુલ્લી ગટર / મેનહોલ',
    'cat.exposed_wiring': 'વીજળીના ખુલ્લા વાયરો',
    'cat.drainage_overflow': 'ગટરનું પાણી ઉભરાવવું',
    'cat.drainage': 'ગટરનું પાણી ઉભરાવવું',
    'cat.gas_leak': 'ગેસ પાઇપલાઇન લીકેજ',
    'cat.traffic_signal': 'ટ્રાફિક સિગ્નલ ખામી',
    'cat.road_damage': 'રસ્તાનું માળખાકીય નુકસાન',
    'cat.other': 'અન્ય નાગરિક ફરિયાદ',

    // Status
    'status.pending': 'પેન્ડિંગ',
    'status.assigned': 'સોંપેલ',
    'status.in_progress': 'ચાલુ છે',
    'status.resolved': 'ઉકેલાયેલ',

    // Severities
    'sev.low': 'સામાન્ય અગ્રતા',
    'sev.medium': 'મધ્યમ અગ્રતા',
    'sev.critical': 'અતિ ગંભીર અગ્રતા',

    // Wards
    'ward.1': 'વોર્ડ ૧ — સયાજીગંજ અને ફતેહગંજ',
    'ward.2': 'વોર્ડ ૨ — હરણી અને વારસિયા',
    'ward.3': 'વોર્ડ ૩ — વાઘોડિયા રોડ અને બાપોદ',
    'ward.4': 'વોર્ડ ૪ — કારેલીબાગ અને સંગમ',
    'ward.5': 'વોર્ડ ૫ — રાવપુરા અને માંડવી',
    'ward.6': 'વોર્ડ ૬ — અકોટા અને ગોત્રી',
    'ward.7': 'વોર્ડ ૭ — નિઝામપુરા અને છાણી',
    'ward.8': 'વોર્ડ ૮ — નાગરવાડા',
    'ward.9': 'વોર્ડ ૯ — આજવા રોડ',
    'ward.10': 'વોર્ડ ૧૦ — સુભાનપુરા અને ગોરવા',
    'ward.11': 'વોર્ડ ૧૧ — વાસણા-ભાયલી અને દિવાળીપુરા',
    'ward.12': 'વોર્ડ ૧૨ — મકરપુરા અને માણેજા (GIDC)',
    'ward.13': 'વોર્ડ ૧૩ — વાડી અને ઘડિયાળી પોળ',
    'ward.14': 'વોર્ડ ૧૪ — તરસાલી અને દાંતેશ્વર',
    'ward.15': 'વોર્ડ ૧૫ — બાપોદ અને આજવા આઉટર',
    'ward.16': 'વોર્ડ ૧૬ — કિશનવાડી અને સોમા તળાવ',
    'ward.17': 'વોર્ડ ૧૭ — માંજલપુર અને અટલાદરા',
    'ward.18': 'વોર્ડ ૧૮ — તાંદલજા અને વાસણા રોડ',
    'ward.19': 'વોર્ડ ૧૯ — કપુરાઈ-તરસાલી (દક્ષિણ)',

    // Departments
    'dept.all': 'બધા વિભાગો',
    'dept.road': 'માર્ગ અને મકાન વિભાગ',
    'dept.drainage': 'ડ્રેનેજ અને ગટર વ્યવસ્થા શાખા',
    'dept.waste': 'ઘન કચરો વ્યવસ્થાપન શાખા',
    'dept.electric': 'વીજળી અને લાઇટિંગ શાખા',
    'dept.water': 'પાણી પુરવઠા શાખા',
    'dept.health': 'આરોગ્ય અને સ્વચ્છતા શાખા',

    // Overview Page
    'overview.title': 'મ્યુનિસિપલ કામગીરી અને નાગરિક ફરિયાદ નિવારણ ડેશબોર્ડ',
    'overview.total_logged': 'કુલ નોંધાયેલ ફરિયાદો',
    'overview.total_logged_sub': 'WhatsApp અને વેબ પોર્ટલ દ્વારા નાગરિક નોંધણી',
    'overview.pending_dispatch': 'પેન્ડિંગ ઝોનલ ડિસ્પેચ',
    'overview.pending_dispatch_sub': 'અધિકારીની સોંપણી અને સ્થળ તપાસ બાકી',
    'overview.active_progress': 'સક્રિય ચાલુ કામગીરી',
    'overview.active_progress_sub': 'ફીલ્ડ રીપેર ટીમો અને એન્જિનિયરિંગ સ્ટાફ સ્થળ પર',
    'overview.closed_verified': 'ઉકેલાયેલ અને ચકાસાયેલ',
    'overview.closed_verified_sub': 'નાગરિક WhatsApp પુષ્ટિ દ્વારા ઓડિટ થયેલ',
    'overview.gis_map_title': 'VMC GIS ભૌગોલિક ફરિયાદ નકશો',
    'overview.gis_map_sub': '૧૮ મીટર સ્પેસિયલ ક્લસ્ટરિંગ સક્રિય',
    'overview.closed_loop_title': 'નાગરિક ક્લોઝ્ડ-લૂપ વેરિફિકેશન પ્રોટોકોલ',
    'overview.closed_loop_mandatory': 'ફરજિયાત',
    'overview.closed_loop_desc': 'VMC સિટીઝન ચાર્ટર મુજબ, જ્યાં સુધી ફરિયાદ કરનાર નાગરિક WhatsApp દ્વારા ગુણવત્તાની પુષ્ટિ ન કરે ત્યાં સુધી કોઈ ફરિયાદ કાયમી બંધ થતી નથી.',
    'overview.verification_rate': 'ચકાસણી દર',
    'overview.auto_reopen': '\'ના\' પર ઓટો-રીઓપન',
    'overview.dept_dist_title': 'વિભાગવાર કામગીરીનું વિતરણ',
    'overview.active_tickets': 'સક્રિય ફરિયાદો',
    'overview.high_priority_alert': '⚠️ અતિ અગત્યનું મ્યુનિસિપલ એલર્ટ',
    'overview.chronic_spot': 'વારંવાર ખામી સ્પોટ #૧૦૩',
    'overview.location': 'સ્થળ:',
    'overview.defect_category': 'ખામી શ્રેણી:',
    'overview.failure_recurrence': 'વારંવાર પુનરાવર્તન:',
    'overview.exec_note': 'કાર્યપાલક ઇજનેર નોંધ: પાયામાં ધોવાણ જણાયેલ છે. માત્ર ડામર પેચ પૂરતો નથી. ડ્રેનેજ વિભાગ દ્વારા માળખાકીય મજબૂતીકરણ જરૂરી છે.',
    'overview.recent_inbound': 'તાજેતરમાં આવેલી નાગરિક ફરિયાદો',
    'overview.live_stream': 'લાઈવ સ્ટ્રીમ',

    // Queue Page
    'queue.title': 'મ્યુનિસિપલ વર્ક ઓર્ડર અને નાગરિક ફરિયાદ કતાર',
    'queue.desc': 'ઝોનલ વર્ગીકરણ, અગ્રતા વધારવા અને ફિલ્ડ એન્જિનિયરિંગ ડિસ્પેચ માટેની સક્રિય કતાર.',
    'queue.filter_status': 'સ્થિતિ મુજબ ફિલ્ટર:',
    'queue.select_all': 'બધા પસંદ કરો',
    'queue.clear_filters': 'ફિલ્ટર સાફ કરો',
    'queue.th_ticket': 'ટિકિટ અને શ્રેણી',
    'queue.th_status': 'સ્થિતિ',
    'queue.th_priority': 'અગ્રતા જોખમ',
    'queue.th_ward': 'અધિકારક્ષેત્ર વોર્ડ',
    'queue.th_density': 'નાગરિક પુષ્ટિ',
    'queue.th_reported': 'નોંધણી તારીખ',
    'queue.th_action': 'ક્રિયા',
    'queue.review': 'સમીક્ષા →',

    // Map Page
    'map.pinned_issues': 'નકશા પર નોંધાયેલ ફરિયાદો',
    'map.live_feed': 'લાઈવ VMC GIS ફીડ',
    'map.spots_count': '{total} માંથી {filtered} સ્પોટ્સ',
    'map.toggle_pins': 'માર્કર ચાલુ/બંધ',
    'map.toggle_heatmap': 'હીટમેપ ચાલુ/બંધ',
    'map.toggle_wards': 'વોર્ડ સીમાઓ ચાલુ/બંધ',

    // Officers Page
    'officers.title': 'ઝોનલ ફિલ્ડ એન્જિનિયરો અને વિભાગીય અધિકારીઓ',
    'officers.desc': 'નિયુક્ત વોર્ડ એન્જિનિયરો, સક્રિય મ્યુનિસિપલ વર્ક ઓર્ડર્સ અને અધિકારક્ષેત્રની સત્તાવાર યાદી.',
    'officers.total_officers': 'કુલ અધિકારીઓ',
    'officers.active_orders': 'સક્રિય વર્ક ઓર્ડર્સ',
    'officers.total_resolved': 'કુલ ઉકેલાયેલ',
    'officers.search_placeholder': 'અધિકારી, વોર્ડ, વિભાગ દ્વારા શોધો...',
    'officers.cards_view': 'કાર્ડ્સ દૃશ્ય',
    'officers.table_view': 'કોષ્ટક દૃશ્ય',
    'officers.assigned_ward': 'સોંપાયેલ વોર્ડ:',
    'officers.official_contact': 'સત્તાવાર સંપર્ક:',
    'officers.active_tasks': 'સક્રિય કામગીરી',
    'officers.total_cleared': 'કુલ પૂર્ણ થયેલ',
    'officers.direct_contact': 'સીધો સંપર્ક',
    'officers.executive_engineer': 'કાર્યપાલક ઇજનેર',

    // Transparency Page
    'transparency.title': 'પારદર્શિતા, નાગરિક કામગીરી અને વોર્ડ ઓડિટ',
    'transparency.desc': 'સિટીઝન ચાર્ટર હેઠળ નાગરિક ફરિયાદો, નિવારણ સમય અને વિભાગીય જવાબદારીનો સત્તાવાર જાહેર રેકોર્ડ.',
    'transparency.open_access': 'સત્તાવાર ઓપન એક્સેસ',
    'transparency.sop_title': 'સ્ટાન્ડર્ડ ઓપરેટિંગ પ્રોસિજર (SOP) — ફરિયાદ નિવારણ',
    'transparency.sop_sub': 'ભૌગોલિક ચોકસાઈ, ઝડપી ફિલ્ડ ડિસ્પેચ અને નાગરિક ચકાસણીની ૪-સ્તરીય પ્રક્રિયા.',
    'transparency.circular': 'VMC પરિપત્ર ૨૦૨૬/૦૪',
    'transparency.stage1_title': 'નાગરિક ફરિયાદ નોંધણી',
    'transparency.stage1_desc': 'નાગરિકો સત્તાવાર VMC WhatsApp હેલ્પલાઇન અથવા વેબ પોર્ટલ પર ફોટા અને GPS લોકેશન સાથે ફરિયાદ નોંધાવે છે.',
    'transparency.stage2_title': 'સ્પેસિયલ ડી-ડુપ્લિકેશન',
    'transparency.stage2_desc': 'PostGIS સ્પેસિયલ એન્જિન ૧૮ મીટરની અંદરની બહુવિધ ફરિયાદોને આપમેળે એકીકૃત કરે છે.',
    'transparency.stage3_title': 'ઝોનલ અધિકારી ડિસ્પેચ',
    'transparency.stage3_desc': 'ફરિયાદોને અગ્રતા આપીને નિયુક્ત વોર્ડ એક્ઝિક્યુટિવ એન્જિનિયરોને કડક SLA સાથે સોંપવામાં આવે છે.',
    'transparency.stage4_title': 'નાગરિક ચકાસણી',
    'transparency.stage4_desc': 'કામ પૂર્ણ થતાં નાગરિકને WhatsApp મેસેજ મોકલાય છે. નાગરિક ગુણવત્તા મંજૂર કરે પછી જ ફાઇનલ ક્લોઝ થાય છે.',
    'transparency.ward_ledger_title': 'વોર્ડવાર નિવારણ કામગીરી લેજર (૧૦ VMC વોર્ડ)',
    'transparency.ward_ledger_sub': 'તમામ વહીવટી ઝોનમાં ઓડિટ થયેલ ફરિયાદ જથ્થો, ઉકેલ ગણતરી અને SLA પાલન.',
    'transparency.sla_compliant': 'SLA પાલન થયેલ',
    'transparency.under_review': 'સમીક્ષા હેઠળ',

    // Hotspots Page
    'hotspots.title': 'શહેરી ઇન્ફ્રાસ્ટ્રક્ચર ખામી અને હોટસ્પોટ્સ',
    'hotspots.desc': 'કાયમી ઇજનેરી સુધારણા જરૂરી હોય તેવા વારંવાર બનતા ખામી ક્લસ્ટરોનું GIS સ્પેસિયલ વિશ્લેષણ.',
    'hotspots.critical_spots': 'અતિ ગંભીર સ્પોટ્સ',
    'hotspots.chronic_recurring': 'વારંવાર થતી ખામીઓ',
    'hotspots.heatmap_title': 'શહેરવ્યાપી ઇન્ફ્રાસ્ટ્રક્ચર ડેન્સિટી અને રિસ્ક હીટમેપ',
    'hotspots.heatmap_sub': 'સ્પેસિયલ PostGIS ઇન્ટરપોલેશન (વડોદરા મેટ્રો)',
    'hotspots.ledger_title': 'રેન્ક્ડ ઇન્ફ્રાસ્ટ્રક્ચર ખામી લેજર',
    'hotspots.ledger_sub': 'નાગરિક ઘનતા, પુનરાવર્તન આવર્તન અને જોખમ ઇન્ડેક્સના આધારે અગ્રતા ક્રમ.',
    'hotspots.all_spots': 'બધા સ્પોટ્સ',
    'hotspots.high_risk': 'ઉચ્ચ જોખમ (૮૦+)',
    'hotspots.recurring_spots': 'વારંવાર થતી ખામીઓ',
    'hotspots.inspect': 'તપાસો',

    // Drawer Component
    'drawer.location_coords': 'સ્થળના ભૌગોલિક નિર્દેશાંકો (GPS)',
    'drawer.confirmations': 'નાગરિક પુષ્ટિ અને સમર્થન',
    'drawer.evidence_title': 'નાગરિક પુરાવા અને સમાધાન પુરાવા',
    'drawer.intake_photo': 'નાગરિક દ્વારા મોકલેલ ફોટો',
    'drawer.repair_photo': 'સમારકામ પૂર્ણતા પુરાવો',
    'drawer.no_photo': 'ફરિયાદ સાથે કોઈ ફોટો મોકલેલ નથી',
    'drawer.upload_resolution_photo': 'સમારકામ પૂર્ણતા ફોટો અપલોડ કરો',
    'drawer.click_to_expand': 'સંપૂર્ણ રીઝોલ્યુશનમાં જોવા માટે ક્લિક કરો',
    'drawer.uploading': 'પુરાવા ફોટો અપલોડ થઈ રહ્યો છે…',
    'drawer.timeline': 'નિવારણ સમયરેખા (Timeline)',
    'drawer.assign_officer': 'ફિલ્ડ અધિકારીની નિમણૂક',
    'drawer.choose_officer': 'અધિકારી પસંદ કરો…',
    'drawer.assign_button': 'સોંપણી કરો',
    'drawer.in_progress_button': 'કામ ચાલુ કરો',
    'drawer.mark_resolved_button': 'ઉકેલાયેલ તરીકે ચિહ્નિત કરો',
    'drawer.reopened_notice': '↩ નાગરિક ચકાસણી દ્વારા {count}× વખત ફરી ખોલવામાં આવેલ છે',

    // Settings Page
    'settings.title': 'સિસ્ટમ સેટિંગ્સ અને ડેવલપર કન્સોલ',
    'settings.dev_tools': 'ડેવલપર ટૂલ્સ',
    'settings.simulator_title': 'WhatsApp ચેટબોટ સિમ્યુલેટર',
    'settings.simulator_desc': 'આવતા WhatsApp નાગરિક સંદેશાઓનું અનુકરણ કરો, સ્ટેટ મશીન ચકાસો અને PostGIS ડી-ડુપ્લિકેશન ટેસ્ટ કરો.',
    'settings.phone_label': 'નાગરિક મોબાઈલ નંબર',
    'settings.message_label': 'નાગરિક મેસેજ / પેલોડ',
    'settings.send_button': '↗ સિમ્યુલેટેડ મેસેજ મોકલો',
    'settings.sending': 'મોકલી રહ્યું છે...',
    'settings.response': 'API પ્રતિસાદ (Response)',
    'settings.environment': 'સિસ્ટમ એન્વાયર્નમેન્ટ રૂપરેખાંકન',
  },

  hi: {
    // Top Bar & Branding
    'vmc.title': 'वडोदरा नगर निगम',
    'vmc.subtitle': 'सिटीपल्स • नागरिक बुनियादी ढांचा एवं सार्वजनिक शिकायत निवारण नियंत्रण कक्ष',
    'vmc.crms_active': 'CRMS पोर्टल सक्रिय',
    'vmc.active_issues': 'सक्रिय शिकायतें',
    'vmc.control_officer': 'नियंत्रण अधिकारी',
    'vmc.vadodara_central': 'वडोदरा सेंट्रल',
    'vmc.all_wards': 'सभी वार्ड (वडोदरा)',
    'vmc.jurisdiction': 'अधिकार क्षेत्र',
    'vmc.system_status': 'सिस्टम स्थिति',
    'vmc.operational': '१००% क्रियाशील',
    'vmc.gov_gujarat': 'गुजरात सरकार',
    'vmc.state_label': 'गुजरात सरकार',
    'vmc.dept_name': 'शहरी विकास एवं शहरी आवास विभाग',
    'vmc.dept_label': 'शहरी विकास एवं शहरी आवास',
    'vmc.officer_title': 'नियंत्रण अधिकारी',
    'vmc.officer_sub': 'वडोदरा सेंट्रल',

    // Navigation Tabs
    'nav.overview': 'अवलोकन',
    'nav.map': 'लाइव GIS नक्शा',
    'nav.queue': 'शिकायत कतार',
    'nav.hotspots': 'हॉटस्पॉट्स',
    'nav.officers': 'वार्ड अभियंता',
    'nav.transparency': 'सार्वजनिक पारदर्शिता',
    'nav.settings': 'सिस्टम सेटिंग्स',

    // Common Actions & Labels
    'common.select_all': 'सभी चुनें',
    'common.clear_filters': 'फ़िल्टर हटाएं',
    'common.search': 'खोजें',
    'common.action': 'कार्रवाई',
    'common.status': 'स्थिति',
    'common.category': 'श्रेणी',
    'common.severity': 'प्राथमिकता',
    'common.ward': 'वार्ड',
    'common.location': 'स्थान',
    'common.date': 'तारीख',
    'common.close': 'बंद करें',
    'common.inspect': 'जांचें',
    'common.verified': 'सत्यापित',
    'common.tickets': 'शिकायतें',
    'common.loading': 'लोड हो रहा है...',
    'common.no_data': 'सक्रिय मापदंड के अनुसार कोई रिकॉर्ड नहीं मिला।',
    'common.language': 'भाषा',

    // Categories
    'cat.all': 'सभी श्रेणियां',
    'cat.pothole': 'सड़क के गड्ढे',
    'cat.water_leak': 'पानी की पाइपलाइन लीकेज',
    'cat.broken_streetlight': 'स्ट्रीटलाइट खराबी',
    'cat.garbage_overflow': 'कचरे का ढेर / गंदगी',
    'cat.open_manhole': 'खुला मैनहोल / नाला',
    'cat.exposed_wiring': 'बिजली के खुले तार',
    'cat.drainage_overflow': 'सीवर / नाला ओवरफ्लो',
    'cat.drainage': 'सीवर / नाला ओवरफ्लो',
    'cat.gas_leak': 'गैस पाइपलाइन लीकेज',
    'cat.traffic_signal': 'ट्रैफिक सिग्नल खराबी',
    'cat.road_damage': 'सड़क संरचनात्मक क्षति',
    'cat.other': 'अन्य नागरिक शिकायत',

    // Status
    'status.pending': 'लंबित',
    'status.assigned': 'असाइन किया गया',
    'status.in_progress': 'प्रगति पर',
    'status.resolved': 'निवारित',

    // Severities
    'sev.low': 'सामान्य प्राथमिकता',
    'sev.medium': 'मध्यम प्राथमिकता',
    'sev.critical': 'अति गंभीर प्राथमिकता',

    // Wards
    'ward.1': 'वार्ड १ — सयाजीगंज और फतेहगंज',
    'ward.2': 'वार्ड २ — हरणी और वारसिया',
    'ward.3': 'वार्ड ३ — वाघोडिया रोड और बापोद',
    'ward.4': 'वार्ड ४ — कारेलीबाग और संगम',
    'ward.5': 'वार्ड ५ — रावपुरा और मांडवी',
    'ward.6': 'वार्ड ६ — अकोटा और गोत्री',
    'ward.7': 'वार्ड ७ — निजामपुरा और छाणी',
    'ward.8': 'वार्ड ८ — नागरवाड़ा',
    'ward.9': 'वार्ड ९ — आजवा रोड',
    'ward.10': 'वार्ड १० — सुभानपुरा और गोरवा',
    'ward.11': 'वार्ड ११ — वासणा-भायली और दिवालीपुरा',
    'ward.12': 'वार्ड १२ — मकरपुरा और मानेजा (GIDC)',
    'ward.13': 'वार्ड १३ — वाडी और घडियाली पोल',
    'ward.14': 'वार्ड १४ — तरसाली और दांतेश्वर',
    'ward.15': 'वार्ड १५ — बापोद और आजवा आउटर',
    'ward.16': 'वार्ड १६ — किशनवाड़ी और सोमा तालाब',
    'ward.17': 'वार्ड १७ — मांजलपुर और अटलादरा',
    'ward.18': 'वार्ड १८ — तांदलजा और वासणा रोड',
    'ward.19': 'वार्ड १९ — कपुराई-तरसाली (दक्षिण)',

    // Departments
    'dept.all': 'सभी विभाग',
    'dept.road': 'सड़क एवं भवन निर्माण विभाग',
    'dept.drainage': 'जल निकासी एवं सीवरेज विभाग',
    'dept.waste': 'ठोस अपशिष्ट प्रबंधन शाखा',
    'dept.electric': 'विद्युत एवं प्रकाश व्यवस्था विभाग',
    'dept.water': 'जल आपूर्ति विभाग',
    'dept.health': 'स्वास्थ्य एवं स्वच्छता विभाग',

    // Overview Page
    'overview.title': 'नगर निगम संचालन एवं नागरिक शिकायत निवारण डैशबोर्ड',
    'overview.total_logged': 'कुल दर्ज शिकायतें',
    'overview.total_logged_sub': 'WhatsApp और वेब पोर्टल के माध्यम से नागरिक पंजीकरण',
    'overview.pending_dispatch': 'लंबित जोनल प्रेषण',
    'overview.pending_dispatch_sub': 'अधिकारी आवंटन एवं स्थल निरीक्षण प्रतीक्षित',
    'overview.active_progress': 'सक्रिय प्रगति पर कार्य',
    'overview.active_progress_sub': 'फील्ड मरम्मत दल और इंजीनियरिंग टीम स्थल पर तैनात',
    'overview.closed_verified': 'निवारित एवं सत्यापित',
    'overview.closed_verified_sub': 'नागरिक WhatsApp पुष्टि द्वारा ऑडिट किया गया',
    'overview.gis_map_title': 'VMC GIS भौगोलिक घटना मानचित्र',
    'overview.gis_map_sub': '१८ मीटर स्थानिक क्लस्टरिंग सक्षम',
    'overview.closed_loop_title': 'नागरिक क्लोज्ड-लूप सत्यापन प्रोटोकॉल',
    'overview.closed_loop_mandatory': 'अनिवार्य',
    'overview.closed_loop_desc': 'VMC सिटीजन चार्टर के अनुसार, जब तक शिकायतकर्ता नागरिक WhatsApp के माध्यम से मरम्मत गुणवत्ता की पुष्टि नहीं करता, तब तक कोई शिकायत स्थायी रूप से बंद नहीं होती।',
    'overview.verification_rate': 'सत्यापन दर',
    'overview.auto_reopen': '\'नहीं\' पर स्वतः री-ओपन',
    'overview.dept_dist_title': 'विभागवार कार्यभार वितरण',
    'overview.active_tickets': 'सक्रिय शिकायतें',
    'overview.high_priority_alert': '⚠️ उच्च प्राथमिकता नगर निगम अलर्ट',
    'overview.chronic_spot': 'बारंबार खराबी स्पॉट #१०३',
    'overview.location': 'स्थान:',
    'overview.defect_category': 'दोष श्रेणी:',
    'overview.failure_recurrence': 'खराबी की पुनरावृत्ति:',
    'overview.exec_note': 'कार्यपालक अभियंता टिप्पणी: सब-बेस क्षरण पाया गया है। केवल डामर पैच पर्याप्त नहीं है। जल निकासी विभाग द्वारा संरचनात्मक सुदृढ़ीकरण आवश्यक है।',
    'overview.recent_inbound': 'हाल ही में प्राप्त नागरिक शिकायतें',
    'overview.live_stream': 'लाइव स्ट्रीम',

    // Queue Page
    'queue.title': 'नगर निगम कार्य आदेश एवं नागरिक शिकायत कतार',
    'queue.desc': 'जोनल वर्गीकरण, प्राथमिकता वृद्धि और फील्ड इंजीनियरिंग प्रेषण के लिए सक्रिय कतार।',
    'queue.filter_status': 'स्थिति अनुसार फ़िल्टर:',
    'queue.select_all': 'सभी चुनें',
    'queue.clear_filters': 'फ़िल्टर हटाएं',
    'queue.th_ticket': 'टिकट एवं श्रेणी',
    'queue.th_status': 'स्थिति',
    'queue.th_priority': 'प्राथमिकता स्तर',
    'queue.th_ward': 'अधिकार क्षेत्र वार्ड',
    'queue.th_density': 'नागरिक पुष्टि',
    'queue.th_reported': 'दर्ज करने की तारीख',
    'queue.th_action': 'कार्रवाई',
    'queue.review': 'समीक्षा करें →',

    // Map Page
    'map.pinned_issues': 'मानचित्र पर दर्ज शिकायतें',
    'map.live_feed': 'लाइव VMC GIS फ़ीड',
    'map.spots_count': '{total} में से {filtered} स्पॉट',
    'map.toggle_pins': 'मार्कर चालू/बंद',
    'map.toggle_heatmap': 'हीटमैप चालू/बंद',
    'map.toggle_wards': 'वार्ड सीमाएं चालू/बंद',

    // Officers Page
    'officers.title': 'जोनल फील्ड इंजीनियर्स एवं विभागीय अधिकारी',
    'officers.desc': 'नामित वार्ड अभियंताओं, सक्रिय नगर निगम कार्य आदेशों और अधिकार क्षेत्र की आधिकारिक सूची।',
    'officers.total_officers': 'कुल अधिकारी',
    'officers.active_orders': 'सक्रिय कार्य आदेश',
    'officers.total_resolved': 'कुल निवारित',
    'officers.search_placeholder': 'अधिकारी, वार्ड, विभाग द्वारा खोजें...',
    'officers.cards_view': 'कार्ड्स दृश्य',
    'officers.table_view': 'तालिका दृश्य',
    'officers.assigned_ward': 'आवंटित वार्ड:',
    'officers.official_contact': 'आधिकारिक संपर्क:',
    'officers.active_tasks': 'सक्रिय कार्य',
    'officers.total_cleared': 'कुल पूर्ण किए गए',
    'officers.direct_contact': 'सीधा संपर्क',
    'officers.executive_engineer': 'कार्यपालक अभियंता',

    // Transparency Page
    'transparency.title': 'पारदर्शिता, नागरिक प्रदर्शन एवं वार्ड ऑडिट',
    'transparency.desc': 'सिटीजन चार्टर के तहत नागरिक शिकायतों, निवारण समय और विभागीय जवाबदेही का आधिकारिक सार्वजनिक रिकॉर्ड।',
    'transparency.open_access': 'आधिकारिक ओपन एक्सेस',
    'transparency.sop_title': 'मानक संचालन प्रक्रिया (SOP) — शिकायत निवारण',
    'transparency.sop_sub': 'स्थानिक सटीकता, त्वरित फील्ड प्रेषण और नागरिक सत्यापन का ४-स्तरीय जीवन चक्र।',
    'transparency.circular': 'VMC परिपत्र २०२६/०४',
    'transparency.stage1_title': 'नागरिक शिकायत पंजीकरण',
    'transparency.stage1_desc': 'नागरिक आधिकारिक VMC WhatsApp हेल्पलाइन या वेब पोर्टल पर फोटो और GPS लोकेशन के साथ शिकायत दर्ज करते हैं।',
    'transparency.stage2_title': 'स्थानिक डी-डुप्लीकेशन',
    'transparency.stage2_desc': 'PostGIS स्थानिक इंजन १८ मीटर के भीतर की कई शिकायतों को स्वतः एक समेकित कार्य आदेश में बदल देता है।',
    'transparency.stage3_title': 'जोनल अधिकारी प्रेषण',
    'transparency.stage3_desc': 'शिकायतों को प्राथमिकता देकर कड़े SLA के साथ नामित वार्ड कार्यपालक अभियंताओं को सौंपा जाता है।',
    'transparency.stage4_title': 'नागरिक सत्यापन',
    'transparency.stage4_desc': 'कार्य पूर्ण होने पर नागरिक को WhatsApp संदेश भेजा जाता है। नागरिक द्वारा गुणवत्ता अनुमोदित करने पर ही अंतिम क्लोजर होता है।',
    'transparency.ward_ledger_title': 'वार्ड-स्तरीय निवारण प्रदर्शन खाता (१० VMC वार्ड)',
    'transparency.ward_ledger_sub': 'सभी प्रशासनिक क्षेत्रों में ऑडिट की गई शिकायत संख्या, समाधान संख्या और SLA अनुपालन।',
    'transparency.sla_compliant': 'SLA अनुपालित',
    'transparency.under_review': 'समीक्षाधीन',

    // Hotspots Page
    'hotspots.title': 'शहरी बुनियादी ढांचा सुभेद्यता एवं हॉटस्पॉट्स',
    'hotspots.desc': 'स्थायी इंजीनियरिंग सुधार की आवश्यकता वाले दीर्घकालिक खराबी क्लस्टरों का GIS स्थानिक घनत्व विश्लेषण।',
    'hotspots.critical_spots': 'गंभीर जोखिम स्पॉट',
    'hotspots.chronic_recurring': 'बारंबार खराबी',
    'hotspots.heatmap_title': 'शहरव्यापी बुनियादी ढांचा घनत्व एवं जोखिम हीटमैप',
    'hotspots.heatmap_sub': 'स्थानिक PostGIS इंटरपोलेशन (वडोदरा मेट्रो)',
    'hotspots.ledger_title': 'रैंक किया गया बुनियादी ढांचा दोष लेजर',
    'hotspots.ledger_sub': 'नागरिक घनत्व, पुनरावृत्ति आवृत्ति और जोखिम सूचकांक के आधार पर प्राथमिकता क्रम।',
    'hotspots.all_spots': 'सभी स्पॉट',
    'hotspots.high_risk': 'उच्च जोखिम (८०+)',
    'hotspots.recurring_spots': 'बारंबार खराबी वाले स्पॉट',
    'hotspots.inspect': 'जांचें',

    // Drawer Component
    'drawer.location_coords': 'स्थान के भौगोलिक निर्देशांक (GPS)',
    'drawer.confirmations': 'नागरिक पुष्टि एवं समर्थन',
    'drawer.evidence_title': 'नागरिक साक्ष्य एवं निवारण प्रमाण',
    'drawer.intake_photo': 'नागरिक द्वारा भेजी गई फोटो',
    'drawer.repair_photo': 'मरम्मत पूर्णता प्रमाण',
    'drawer.no_photo': 'शिकायत के साथ कोई फोटो संलग्न नहीं है',
    'drawer.upload_resolution_photo': 'मरम्मत पूर्णता फोटो अपलोड करें',
    'drawer.click_to_expand': 'पूर्ण रिज़ॉल्यूशन में देखने के लिए क्लिक करें',
    'drawer.uploading': 'साक्ष्य फोटो अपलोड हो रहा है…',
    'drawer.timeline': 'निवारण समयरेखा (Timeline)',
    'drawer.assign_officer': 'फील्ड अधिकारी नियुक्त करें',
    'drawer.choose_officer': 'अधिकारी चुनें…',
    'drawer.assign_button': 'असाइन करें',
    'drawer.in_progress_button': 'कार्य प्रारंभ करें',
    'drawer.mark_resolved_button': 'निवारित चिह्नित करें',
    'drawer.reopened_notice': '↩ नागरिक सत्यापन द्वारा {count}× बार पुनः खोला गया',

    // Settings Page
    'settings.title': 'सिस्टम सेटिंग्स एवं डेवलपर कंसोल',
    'settings.dev_tools': 'डेवलपर टूल्स',
    'settings.simulator_title': 'WhatsApp चैटबॉट सिम्युलेटर',
    'settings.simulator_desc': 'आने वाले WhatsApp नागरिक संदेशों का अनुकरण करें, स्टेट मशीन का परीक्षण करें और PostGIS डी-डुप्लीकेशन जांचें।',
    'settings.phone_label': 'नागरिक मोबाइल नंबर',
    'settings.message_label': 'नागरिक संदेश / पेलोड',
    'settings.send_button': '↗ सिम्युलेटेड संदेश भेजें',
    'settings.sending': 'भेजा जा रहा है...',
    'settings.response': 'API प्रतिक्रिया (Response)',
    'settings.environment': 'सिस्टम वातावरण विन्यास',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vmc_language') as Language;
      if (saved === 'en' || saved === 'gu' || saved === 'hi') {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('vmc_language', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = DICTIONARY[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
