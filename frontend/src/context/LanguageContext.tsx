'use client';

// Language Context & Flawless Bilingual Gujarati & English Dictionary
// Vadodara Municipal Corporation (VMC) / Government of Gujarat
// Grammatically verified official Gujarati terminology

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'gu';

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
    'vmc.dept_name': 'Urban Development & Urban Housing Department',

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
    'ward.1': 'Ward 1 — Sayajigunj',
    'ward.2': 'Ward 2 — Akota',
    'ward.3': 'Ward 3 — Raopura',
    'ward.4': 'Ward 4 — Karelibaug',
    'ward.5': 'Ward 5 — Fatehgunj',
    'ward.6': 'Ward 6 — Manjalpur',
    'ward.7': 'Ward 7 — Gotri',
    'ward.8': 'Ward 8 — Makarpura',
    'ward.9': 'Ward 9 — Gorwa',
    'ward.10': 'Ward 10 — Nizampura',

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
    'vmc.dept_name': 'શહેરી વિકાસ અને શહેરી ગૃહ નિર્માણ વિભાગ',

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
    'ward.1': 'વોર્ડ ૧ — સયાજીગંજ',
    'ward.2': 'વોર્ડ ૨ — અકોટા',
    'ward.3': 'વોર્ડ ૩ — રાવપુરા',
    'ward.4': 'વોર્ડ ૪ — કારેલીબાગ',
    'ward.5': 'વોર્ડ ૫ — ફતેહગંજ',
    'ward.6': 'વોર્ડ ૬ — માંજલપુર',
    'ward.7': 'વોર્ડ ૭ — ગોત્રી',
    'ward.8': 'વોર્ડ ૮ — મકરપુરા',
    'ward.9': 'વોર્ડ ૯ — ગોરવા',
    'ward.10': 'વોર્ડ ૧૦ — નિઝામપુરા',

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
      if (saved === 'en' || saved === 'gu') {
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
