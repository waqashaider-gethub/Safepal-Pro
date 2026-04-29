document.addEventListener('DOMContentLoaded', () => {
    // ============ THEME / DARK MODE ============
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            document.getElementById('themeToggle').textContent = '☀️';
        }
    }
    initTheme();

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
    });

    // ============ TAB SWITCHING ============
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // ============ SOS BUTTON ============
    document.getElementById('sosBtn')?.addEventListener('click', async () => {
        const contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
        const location = localStorage.getItem('userLocationNote') || 'Location unknown';
        const template = localStorage.getItem('sosTemplate') || 'I need help! This is an emergency. My location: [LOCATION]';
        const message = template.replace('[LOCATION]', location);
        
        if (contacts.length === 0) {
            alert('No emergency contacts saved. Add contacts first.');
            return;
        }
        
        // For each contact, try to send SMS (mobile only)
        for (const contact of contacts) {
            const smsUrl = `sms:${contact.number}?body=${encodeURIComponent(message)}`;
            window.open(smsUrl, '_blank');
        }
        alert(`SOS sent to ${contacts.length} contact(s)`);
    });

    // ============ ONE-TAP DIAL ============
    document.querySelectorAll('.dial-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.contact-card');
            const number = card?.dataset.number;
            if (number) {
                window.location.href = `tel:${number}`;
            }
        });
    });

    // ============ EMERGENCY CONTACTS ============
    let personalContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    
    function renderPersonalContacts() {
        const container = document.getElementById('personalContacts');
        if (!container) return;
        if (personalContacts.length === 0) {
            container.innerHTML = '<p style="color:var(--text-light); text-align:center;">No contacts added.</p>';
            return;
        }
        container.innerHTML = personalContacts.map((contact, index) => `
            <div class="personal-contact">
                <div><strong>${escapeHtml(contact.name)}</strong><br><small>${escapeHtml(contact.number)}</small></div>
                <button class="delete-contact" data-index="${index}">🗑️</button>
            </div>
        `).join('');
        document.querySelectorAll('.delete-contact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                personalContacts.splice(idx, 1);
                localStorage.setItem('emergencyContacts', JSON.stringify(personalContacts));
                renderPersonalContacts();
                updateLastUpdated('contactsLastUpdated');
            });
        });
    }
    
    document.getElementById('addContactBtn')?.addEventListener('click', () => {
        const name = prompt('Contact name:', 'Family Member');
        const number = prompt('Phone number:', '');
        if (name && number) {
            personalContacts.push({ name, number });
            localStorage.setItem('emergencyContacts', JSON.stringify(personalContacts));
            renderPersonalContacts();
            updateLastUpdated('contactsLastUpdated');
        }
    });
    renderPersonalContacts();

    // ============ SOS TEMPLATE ============
    const savedTemplate = localStorage.getItem('sosTemplate') || 'I need help! This is an emergency. My location: [LOCATION]';
    document.getElementById('sosTemplate').value = savedTemplate;
    
    document.getElementById('saveSosTemplateBtn')?.addEventListener('click', () => {
        const newTemplate = document.getElementById('sosTemplate').value;
        localStorage.setItem('sosTemplate', newTemplate);
        updateSosPreview();
        alert('Template saved!');
    });
    
    function updateSosPreview() {
        const template = localStorage.getItem('sosTemplate') || 'I need help! This is an emergency. My location: [LOCATION]';
        const location = localStorage.getItem('userLocationNote') || 'Unknown location';
        const preview = template.replace('[LOCATION]', location);
        document.getElementById('sosPreview').innerHTML = preview;
    }
    updateSosPreview();

    // ============ EVACUATION DATA (Expanded) ============
    const evacuationData = {
        fire: { title: '🔥 Fire Evacuation', steps: ['Stay calm and alert others', 'Crawl low under smoke', 'Feel doors before opening', 'Use stairs, NEVER elevators', 'Go to meeting point'] },
        earthquake: { title: '🌍 Earthquake', steps: ['DROP to hands/knees', 'COVER head/neck', 'HOLD ON until shaking stops', 'Avoid windows', 'Evacuate after shaking stops'] },
        flood: { title: '🌊 Flood', steps: ['Move to higher ground', 'Turn off electricity if safe', 'NEVER walk/drive through water', 'Call for help if trapped'] },
        hurricane: { title: '🌀 Hurricane', steps: ['Board up windows', 'Fill water containers', 'Go to interior room', 'Avoid candles, use flashlights'] },
        tsunami: { title: '🌊 Tsunami', steps: ['Move to high ground immediately', 'At least 100 feet above sea level', 'Do not wait for warning', 'Stay away from coast until all-clear'] },
        tornado: { title: '🌪️ Tornado', steps: ['Go to basement or interior room', 'Avoid windows', 'Get under sturdy table', 'Cover head with hands'] },
        landslide: { title: '⛰️ Landslide', steps: ['Stay awake and alert', 'Listen for rumbling sounds', 'Move perpendicular to slide path', 'After slide, watch for flooding'] }
    };
    
    document.querySelectorAll('.disaster-item').forEach(item => {
        item.addEventListener('click', () => {
            const disaster = item.dataset.disaster;
            const data = evacuationData[disaster];
            if (data) {
                document.getElementById('disasterTitle').textContent = data.title;
                document.getElementById('disasterSteps').innerHTML = `<ul class="disaster-steps">${data.steps.map(s => `<li>${s}</li>`).join('')}</ul>`;
                document.querySelector('#evacuation .disaster-list').classList.add('hidden');
                document.getElementById('evacuationDetail').classList.remove('hidden');
            }
        });
    });
    document.querySelector('.evac-back')?.addEventListener('click', () => {
        document.querySelector('#evacuation .disaster-list').classList.remove('hidden');
        document.getElementById('evacuationDetail').classList.add('hidden');
    });

    // ============ FIRST AID DATA (Expanded) ============
    const firstAidData = {
        burn: { title: '🔥 Burns', steps: ['Cool with running water 10-15 min', 'Remove jewelry', 'Cover with sterile gauze', 'DO NOT apply ice or butter'] },
        cut: { title: '🩸 Cuts & Bleeding', steps: ['Apply direct pressure', 'Elevate above heart', 'Clean with water', 'Cover with bandage'] },
        cpr: { title: '🫀 CPR', steps: ['Call emergency first', 'Push hard/fast 100-120/min', 'Press 2 inches deep', 'Allow chest to rise'] },
        fracture: { title: '🦴 Fracture', steps: ['Keep area still', 'Apply ice wrapped in cloth', 'Splint if trained', 'Seek medical help'] },
        choking: { title: '🫁 Choking', steps: ['Ask "Are you choking?"', 'Stand behind, fist above navel', 'Thrust inward/upward', 'Repeat until object expelled'] },
        heartattack: { title: '❤️ Heart Attack', steps: ['Call emergency immediately', 'Have person sit and rest', 'Give aspirin if not allergic', 'Loosen tight clothing'] },
        stroke: { title: '🧠 Stroke (FAST)', steps: ['Face: Ask to smile (drooping?)', 'Arms: Ask to raise both', 'Speech: Say simple sentence', 'Time: Call emergency NOW'] },
        seizure: { title: '⚡ Seizure', steps: ['Clear area of hazards', 'Cushion head', 'Do NOT restrain', 'Time the seizure', 'Call ambulance if >5 min'] },
        snakebite: { title: '🐍 Snake Bite', steps: ['Keep victim calm and still', 'Remove jewelry', 'Keep bite below heart', 'DO NOT suck venom or apply ice', 'Get medical help'] },
        hypothermia: { title: '❄️ Hypothermia', steps: ['Move to warm area', 'Remove wet clothes', 'Warm center of body first', 'Give warm drinks if conscious'] }
    };
    
    document.querySelectorAll('.firstaid-item').forEach(item => {
        item.addEventListener('click', () => {
            const aid = item.dataset.aid;
            const data = firstAidData[aid];
            if (data) {
                document.getElementById('aidTitle').textContent = data.title;
                document.getElementById('aidSteps').innerHTML = `<ul class="aid-steps">${data.steps.map(s => `<li>${s}</li>`).join('')}</ul>`;
                document.querySelector('#firstaid .firstaid-list').classList.add('hidden');
                document.getElementById('firstaidDetail').classList.remove('hidden');
            }
        });
    });
    document.querySelector('.aid-back')?.addEventListener('click', () => {
        document.querySelector('#firstaid .firstaid-list').classList.remove('hidden');
        document.getElementById('firstaidDetail').classList.add('hidden');
    });

    // ============ CHECKLIST ============
    const checklistItemsList = [
        "💧 Water (3 days)", "🍫 Non-perishable food", "🔦 Flashlight", "📻 Radio", "🩹 First aid kit",
        "💊 Medications", "📄 Important documents", "💰 Cash", "🔑 Spare keys", "📱 Power bank",
        "🧥 Blankets", "😷 Masks", "🧴 Sanitizer", "🔪 Multi-tool", "📞 Emergency contact list"
    ];
    let checklistStatus = JSON.parse(localStorage.getItem('checklistStatus') || '{}');
    
    function renderChecklist() {
        const container = document.getElementById('checklistItems');
        if (!container) return;
        let completed = 0;
        container.innerHTML = checklistItemsList.map((item, idx) => {
            const checked = checklistStatus[idx] || false;
            if (checked) completed++;
            return `<div class="checklist-item ${checked ? 'completed' : ''}" data-index="${idx}">
                <input type="checkbox" ${checked ? 'checked' : ''}>
                <label>${escapeHtml(item)}</label>
            </div>`;
        }).join('');
        const percent = Math.round((completed / checklistItemsList.length) * 100);
        document.getElementById('checklistProgress').textContent = percent;
        document.getElementById('checklistProgressBar').style.width = `${percent}%`;
        document.querySelectorAll('.checklist-item').forEach(item => {
            const cb = item.querySelector('input');
            const idx = parseInt(item.dataset.index);
            cb.addEventListener('change', (e) => {
                checklistStatus[idx] = e.target.checked;
                localStorage.setItem('checklistStatus', JSON.stringify(checklistStatus));
                renderChecklist();
                updateLastUpdated('checklistLastUpdated');
            });
        });
    }
    renderChecklist();
    
    document.getElementById('resetChecklistBtn')?.addEventListener('click', () => {
        if (confirm('Reset all checklist items?')) {
            checklistStatus = {};
            localStorage.setItem('checklistStatus', JSON.stringify(checklistStatus));
            renderChecklist();
            updateLastUpdated('checklistLastUpdated');
        }
    });

    // ============ GPS LOCATION ============
    document.getElementById('getGpsBtn')?.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(pos => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                const coords = `📍 Latitude: ${lat}\n📍 Longitude: ${lng}\n🔗 Maps: https://maps.google.com/?q=${lat},${lng}`;
                document.getElementById('gpsCoords').innerHTML = coords;
                document.getElementById('locationNote').value += `\nGPS: ${lat}, ${lng}`;
            }, () => alert('Unable to get location. Enable GPS.'));
        } else alert('GPS not supported');
    });
    
    const savedLocationNote = localStorage.getItem('userLocationNote') || '';
    if (document.getElementById('locationNote')) document.getElementById('locationNote').value = savedLocationNote;
    
    document.getElementById('saveLocationBtn')?.addEventListener('click', () => {
        const note = document.getElementById('locationNote').value;
        localStorage.setItem('userLocationNote', note);
        const msg = document.getElementById('savedLocationMsg');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 2000);
        updateSosPreview();
    });
    
    document.getElementById('shareLocationBtn')?.addEventListener('click', () => {
        const location = localStorage.getItem('userLocationNote') || 'Location unknown';
        const contacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
        if (contacts.length === 0) alert('No contacts saved');
        else contacts.forEach(c => window.open(`sms:${c.number}?body=I'm at: ${location}`, '_blank'));
    });

    // ============ SETTINGS: Export/Import ============
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
        const data = {
            emergencyContacts: personalContacts,
            checklistStatus: checklistStatus,
            userLocationNote: localStorage.getItem('userLocationNote') || '',
            sosTemplate: localStorage.getItem('sosTemplate') || '',
            theme: localStorage.getItem('theme') || ''
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'safepal_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    });
    
    document.getElementById('importDataBtn')?.addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    
    document.getElementById('importFileInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.emergencyContacts) localStorage.setItem('emergencyContacts', JSON.stringify(data.emergencyContacts));
                    if (data.checklistStatus) localStorage.setItem('checklistStatus', JSON.stringify(data.checklistStatus));
                    if (data.userLocationNote) localStorage.setItem('userLocationNote', data.userLocationNote);
                    if (data.sosTemplate) localStorage.setItem('sosTemplate', data.sosTemplate);
                    if (data.theme) localStorage.setItem('theme', data.theme);
                    alert('Import successful! Refresh to see changes.');
                    location.reload();
                } catch (err) { alert('Invalid file'); }
            };
            reader.readAsText(file);
        }
    });
    
    document.getElementById('resetAllDataBtn')?.addEventListener('click', () => {
        if (confirm('⚠️ THIS WILL DELETE ALL SAVED DATA. Continue?')) {
            localStorage.clear();
            alert('All data reset. Refresh the page.');
            location.reload();
        }
    });

    // ============ Helper Functions ============
    function updateLastUpdated(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
    
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m] || m));
    }
});