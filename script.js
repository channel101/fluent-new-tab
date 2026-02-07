document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. LÓGICA DA BARRA DE PESQUISA
    // ==========================================
    // --- LÓGICA DE CONFIGURAÇÕES (Nova Adição) ---
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPopup = document.getElementById('settingsPopup');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const toggleShortcuts = document.getElementById('toggleShortcuts');
    const rowsSelect = document.getElementById('rowsSelect');
    const shortcutsGrid = document.getElementById('shortcutsGrid') || document.querySelector('.shortcuts-grid');
    const rowsInputGroup = document.getElementById('rowsInputGroup');

    // 1. Abrir/Fechar Popup
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPopup.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (settingsPopup && !settingsPopup.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPopup.classList.remove('active');
        }
    });

    // 2. Gerenciamento de Temas
    const savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('theme', theme);
        });
    });

    function applyTheme(theme) {
        // Atualiza UI dos botões
        themeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
        
        // Remove atributo anterior
        document.body.removeAttribute('data-theme');

        if (theme === 'auto') {
            // Verifica preferência do sistema
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.setAttribute('data-theme', 'dark');
            }
        } else {
            document.body.setAttribute('data-theme', theme);
        }
    }

    // Listener para mudanças no sistema (apenas se estiver em auto)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'auto') {
            document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    // 3. Toggle de Atalhos
    const shortcutsVisible = localStorage.getItem('shortcutsVisible') !== 'false'; // Padrão true
    toggleShortcuts.checked = shortcutsVisible;
    updateShortcutsVisibility(shortcutsVisible);

    toggleShortcuts.addEventListener('change', (e) => {
        const isVisible = e.target.checked;
        updateShortcutsVisibility(isVisible);
        localStorage.setItem('shortcutsVisible', isVisible);
    });

    function updateShortcutsVisibility(visible) {
        if (shortcutsGrid) {
            shortcutsGrid.style.display = visible ? 'grid' : 'none';
        }
        if (rowsInputGroup) {
            rowsInputGroup.style.display = visible ? 'block' : 'none';
        }
    }

    // 4. Configuração de Linhas (Grid)
    let allowedRows = parseInt(localStorage.getItem('shortcutsRows')) || 2; // Padrão 2 linhas
    if (rowsSelect) {
        rowsSelect.value = allowedRows;
        rowsSelect.addEventListener('change', (e) => {
            allowedRows = parseInt(e.target.value);
            localStorage.setItem('shortcutsRows', allowedRows);
            renderShortcuts();
        });
    }

    const engineBtn = document.getElementById('engineBtn');
    const dropdown = document.getElementById('engineDropdown');
    const currentIcon = document.getElementById('currentEngineIcon');
    const searchForm = document.getElementById('searchForm');
    const items = document.querySelectorAll('.dropdown-item');

    const engines = {
        google: { url: 'https://www.google.com/search', icon: 'assets/google.svg' },
        bing: { url: 'https://www.bing.com/search', icon: 'assets/bing.svg' }
    };

    // Alternar menu
    if (engineBtn) {
        engineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (engineBtn && dropdown && !engineBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Selecionar buscador
    items.forEach(item => {
        item.addEventListener('click', () => {
            const selectedEngine = item.getAttribute('data-engine');
            const config = engines[selectedEngine];
            if (currentIcon) currentIcon.src = config.icon;
            if (searchForm) searchForm.action = config.url;
            dropdown.classList.remove('active');
        });
    });


    // ==========================================
    // 2. LÓGICA DOS ATALHOS (SHORTCUTS)
    // ==========================================
    
    // Ícones SVG embutidos
    const ICON_ADD = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13V3.754a.75.75 0 0 0-1.5 0V13H3.754a.75.75 0 0 0 0 1.5H13v9.252a.75.75 0 0 0 1.5 0V14.5l9.25.003a.75.75 0 0 0 0-1.5z" fill="currentColor"/></svg>`;
    const ICON_REMOVE = `<svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 7.25a5.75 5.75 0 0 1 5.746 5.53l.004.22H37a1.25 1.25 0 0 1 .128 2.494L37 15.5h-1.091l-1.703 22.57A4.25 4.25 0 0 1 29.968 42H18.032a4.25 4.25 0 0 1-4.238-3.93L12.09 15.5H11a1.25 1.25 0 0 1-1.244-1.122l-.006-.128c0-.647.492-1.18 1.122-1.244L11 13h7.25A5.75 5.75 0 0 1 24 7.25m9.402 8.25H14.598l1.69 22.382a1.75 1.75 0 0 0 1.744 1.618h11.936a1.75 1.75 0 0 0 1.745-1.618zm-6.152 5.25c.647 0 1.18.492 1.244 1.122L28.5 22v11a1.25 1.25 0 0 1-2.494.128L26 33V22c0-.69.56-1.25 1.25-1.25m-6.5 0c.647 0 1.18.492 1.244 1.122L22 22v11a1.25 1.25 0 0 1-2.494.128L19.5 33V22c0-.69.56-1.25 1.25-1.25m3.25-11a3.25 3.25 0 0 0-3.245 3.066L20.75 13h6.5A3.25 3.25 0 0 0 24 9.75" fill="#e74c3c"/></svg>`;
    const ICON_GLOBE_FALLBACK = `data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDEuOTk5YzUuNTI0IDAgMTAuMDAyIDQuNDc4IDEwLjAwMiAxMC4wMDIgMCA1LjUyMy00LjQ3OCAxMC4wMDEtMTAuMDAyIDEwLjAwMVMxLjk5OCAxNy41MjQgMS45OTggMTIuMDAxQzEuOTk4IDYuNDc3IDYuNDc2IDEuOTk5IDEyIDEuOTk5TTE0LjkzOSAxNi41SDkuMDZjLjY1MiAyLjQxNCAxLjc4NSA0LjAwMiAyLjkzOSA0LjAwMnMyLjI4Ny0xLjU4OCAyLjkzOS00LjAwMm0tNy40MyAwSDQuNzg1YTguNTMgOC41MyAwIDAgMCA0LjA5NCAzLjQxMWMtLjUyMi0uODItLjk1My0xLjg0Ni0xLjI3LTMuMDE1em0xMS43MDUgMGgtMi43MjJjLS4zMjQgMS4zMzUtLjc5MiAyLjUtMS4zNzMgMy40MTFhOC41MyA4LjUzIDAgMCAwIDMuOTEtMy4xMjd6TTcuMDk0IDEwSDMuNzM1bC0uMDA1LjAxN2E4LjUgOC41IDAgMCAwLS4yMzMgMS45ODRjMCAxLjA1Ni4xOTMgMi4wNjcuNTQ1IDNoMy4xNzNhMjAgMjAgMCAwIDEtLjIxOC0zYzAtLjY4NC4wMzMtMS4zNTQuMDk1LTIuMDAxbTguMzAzIDBIOC42MDNhMTkgMTkgMCAwIDAgLjEzNSA1aDYuNTI0YTE5IDE5IDAgMCAwIC4xMzUtNW00Ljg2OC0uMDAxaC0zLjM1OHEuMDk0Ljk3NC4wOTUgMi4wMDJhMjAgMjAgMCAwIDEtLjIxOCAzaDMuMTczYTguNSA4LjUgMCAwIDAgLjU0NS0zYzAtLjY5LS4wODMtMS4zNi0uMjM3LTIuMDAyTTguODggNC4wODlsLS4wMjMuMDFBOC41MyA4LjUzIDAgMCAwIDQuMjUgOC41aDMuMDQ4Yy4zMTQtMS43NTIuODYtMy4yNzggMS41ODMtNC40MU0xMiAzLjVsLS4xMTYuMDA1QzEwLjYyIDMuNjIgOS4zOTYgNS42MjIgOC44MyA4LjVoNi4zNDJjLS41NjYtMi44Ny0xLjc4My00Ljg2OS0zLjA0NS00Ljk5NXptMy4xMi41OS4xMDcuMTc1Yy42NyAxLjExMiAxLjE3NyAyLjU3MiAxLjQ3NSA0LjIzN2gzLjA0OGE4LjUzIDguNTMgMCAwIDAtNC4zMzktNC4yOXoiIGZpbGw9IiMyMTIxMjEiLz48L3N2Zz4=`;

    // Elementos DOM
    const addModal = document.getElementById('addModal') || document.querySelector('.modal-overlay');
    const shortcutForm = document.getElementById('shortcutForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toggleCustomIcon = document.getElementById('toggleCustomIcon');
    const customIconGroup = document.getElementById('customIconGroup');

    // Carregar do localStorage
    let shortcuts = [];
    try {
        shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    } catch (e) {
        console.error('Erro ao ler atalhos:', e);
        shortcuts = [];
    }

function renderShortcuts() {
        if (!shortcutsGrid) return;
        shortcutsGrid.innerHTML = '';

        // --- CONFIGURAÇÃO DE COLUNAS ---
        const COLUMNS = 10; // Agora suporta 10 colunas (Estilo Edge)
        
        // 1. Definir Limites
        // Pega o valor do Select, ou do Storage, ou usa o padrão 2 linhas
        let currentRows = rowsSelect ? parseInt(rowsSelect.value) : (parseInt(localStorage.getItem('shortcutsRows')) || 2);
        
        // Limite absoluto (Ex: 2 linhas * 10 colunas = 20 slots)
        const maxSlots = currentRows * COLUMNS;

        // 2. Fatiar os atalhos para respeitar o limite visual
        const visibleShortcuts = shortcuts.slice(0, maxSlots);

        // 3. Renderizar Atalhos
        visibleShortcuts.forEach((site, index) => {
            const iconSrc = site.customIcon || `https://www.google.com/s2/favicons?sz=64&domain_url=${site.url}`;

            const link = document.createElement('a');
            link.href = site.url;
            link.className = 'shortcut-item';
            
            link.innerHTML = `
                <div class="shortcut-card">
                    <button class="remove-btn" data-index="${index}">${ICON_REMOVE}</button>
                    <img src="${iconSrc}" class="shortcut-icon" onerror="this.src='${ICON_GLOBE_FALLBACK}'" alt="${site.name}">
                </div>
                <span class="shortcut-title">${site.name}</span>
            `;

            shortcutsGrid.appendChild(link);
        });

        // 4. Lógica do Botão Adicionar (Firefox Style)
        // Se ainda tem espaço no grid visual (menos que o máximo de slots), mostra o botão.
        // Graças ao CSS Grid (repeat 10), ele vai automaticamente para a linha correta.
        if (visibleShortcuts.length < maxSlots) {
            const addBtn = document.createElement('div');
            addBtn.className = 'shortcut-item add-card-wrapper';
            addBtn.onclick = openModal; 
            addBtn.innerHTML = `
                <div class="shortcut-card">
                    ${ICON_ADD}
                </div>
                <span class="shortcut-title">Adicionar</span>
            `;
            shortcutsGrid.appendChild(addBtn);
        }

        // Listeners de Remover
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation();
                deleteShortcut(btn.dataset.index);
            });
        });
    }

    function deleteShortcut(index) {
        shortcuts.splice(index, 1);
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
        renderShortcuts();
    }

    // --- FUNÇÕES DO MODAL (ESTAVAM FALTANDO) ---

    function openModal() {
        if (addModal) {
            addModal.classList.add('active');
            // Limpa campos
            document.getElementById('inputName').value = '';
            document.getElementById('inputUrl').value = '';
            document.getElementById('inputIcon').value = '';
            if(customIconGroup) customIconGroup.classList.add('hidden');
            
            setTimeout(() => document.getElementById('inputName').focus(), 100);
        }
    }

    function closeModal() {
        if (addModal) addModal.classList.remove('active');
    }

    // Listeners do Modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    if (addModal) {
        addModal.addEventListener('click', (e) => {
            if (e.target === addModal) closeModal();
        });
    }

    if (toggleCustomIcon) {
        toggleCustomIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if(customIconGroup) customIconGroup.classList.toggle('hidden');
        });
    }

    if (shortcutForm) {
        shortcutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let url = document.getElementById('inputUrl').value;
            if (!url.startsWith('http')) url = 'https://' + url;

            const newShortcut = {
                name: document.getElementById('inputName').value,
                url: url,
                customIcon: document.getElementById('inputIcon').value || null
            };

            shortcuts.push(newShortcut);
            saveAndRender();
            closeModal();
        });
    }

    // --- LÓGICA DO CLIMA (WeatherAPI.com) ---
    
    // API Key fornecida
    const API_KEY = 'f4dfa0b32bd44ce7af2175310260702'; 

    const weatherWidget = document.getElementById('weatherWidget');
    const toggleWeather = document.getElementById('toggleWeather');
    const cityInputGroup = document.getElementById('cityInputGroup');
    const cityInput = document.getElementById('cityInput');
    const saveCityBtn = document.getElementById('saveCityBtn');
    
    // Elementos do Widget
    const weatherCity = document.getElementById('weatherCity');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherTemp = document.getElementById('weatherTemp');

    // Estado Inicial
    let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true'; // Padrão false
    
    // Migração: Verifica se o valor salvo é o JSON antigo ou a nova String
    let storedCity = localStorage.getItem('weatherCity');
    let currentCity = 'São Paulo';

    if (storedCity) {
        if (storedCity.startsWith('{')) {
            try {
                // Tenta converter do formato antigo
                const parsed = JSON.parse(storedCity);
                currentCity = parsed.name || 'São Paulo';
                localStorage.setItem('weatherCity', currentCity); // Atualiza para o novo formato
            } catch (e) {
                currentCity = 'São Paulo';
            }
        } else {
            currentCity = storedCity;
        }
    }

    // Configuração Inicial
    if (toggleWeather) {
        toggleWeather.checked = weatherEnabled;
        toggleWeather.addEventListener('change', (e) => {
            weatherEnabled = e.target.checked;
            localStorage.setItem('weatherEnabled', weatherEnabled);
            updateWeatherVisibility();
            if(weatherEnabled) fetchWeather();
        });
    }

    if (cityInput) cityInput.value = currentCity;
    
    updateWeatherVisibility();
    if(weatherEnabled) fetchWeather();

    function updateWeatherVisibility() {
        if(!weatherWidget || !cityInputGroup) return;
        
        if(weatherEnabled) {
            weatherWidget.style.display = 'flex';
            cityInputGroup.style.display = 'flex';
        } else {
            weatherWidget.style.display = 'none';
            cityInputGroup.style.display = 'none';
        }
    }

    // Salvar Nova Cidade
    if(saveCityBtn) {
        saveCityBtn.addEventListener('click', searchCity);
    }
    
    if(cityInput) {
        cityInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') searchCity();
        });
    }

    async function searchCity() {
        if (!API_KEY) {
            alert('Por favor, adicione sua API Key no script.js');
            return;
        }

        const query = cityInput.value.trim();
        if(!query) return;

        saveCityBtn.innerHTML = '...'; 
        
        try {
            // Usa a Search API para validar se a cidade existe
            const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`);
            const data = await res.json();

            if(data && data.length > 0) {
                // Pega o primeiro resultado
                const bestMatch = data[0];
                currentCity = `${bestMatch.name}`; 
                
                // Salva e atualiza
                localStorage.setItem('weatherCity', currentCity);
                cityInput.value = currentCity; 
                fetchWeather(); 
            } else {
                alert('Cidade não encontrada.');
            }
        } catch (error) {
            console.error('Erro ao buscar cidade:', error);
            alert('Erro de conexão ou API Key inválida.');
        } finally {
            saveCityBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        }
    }

    async function fetchWeather() {
        if(!weatherEnabled) return;
        if (!API_KEY) return;

        try {
            // Busca o clima atual
            const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${currentCity}&lang=pt`);
            const data = await res.json();

            if (data.error) {
                console.error('Erro API:', data.error.message);
                return;
            }

            const temp = Math.round(data.current.temp_c);
            const conditionText = data.current.condition.text;
            let iconUrl = data.current.condition.icon;

            // O ícone vem como "//cdn.weatherapi.com...", precisamos adicionar "https:"
            if (iconUrl.startsWith('//')) {
                iconUrl = 'https:' + iconUrl;
            }

            // Atualiza DOM
            weatherCity.textContent = data.location.name;
            weatherTemp.textContent = `${temp}°C`;
            
            // Renderiza o ícone PNG
            weatherIcon.innerHTML = `<img src="${iconUrl}" alt="${conditionText}" title="${conditionText}">`;
            
            // Link para site de clima (MSN Weather ou Google)
            weatherWidget.href = `https://www.bing.com/weather/forecast?q=${data.location.name}`;
            
        } catch (error) {
            console.error('Erro ao atualizar clima:', error);
            weatherTemp.textContent = '--';
        }
    }

    // ==========================================
    // 5. APP LAUNCHER (SERVIÇOS)
    // ==========================================
    
    // Dados dos Ecossistemas (Específico para o Menu 3x3)
    const launcherData = {
        proton: {
            apps: [
                { name: 'Proton Mail', url: 'https://mail.proton.me', icon: 'assets/apps/proton/mail.svg' },
                { name: 'Proton Calendar', url: 'https://calendar.proton.me', icon: 'assets/apps/proton/calendar.svg' },
                { name: 'Proton Drive', url: 'https://drive.proton.me', icon: 'assets/apps/proton/drive.svg' },
                { name: 'Proton Pass', url: 'https://pass.proton.me', icon: 'assets/apps/proton/pass.svg' },
                { name: 'Proton VPN', url: 'https://account.protonvpn.com', icon: 'assets/apps/proton/vpn.svg' },
                { name: 'Proton Wallet', url: 'https://wallet.proton.me', icon: 'assets/apps/proton/wallet.svg' },
                { name: 'LumoAI', url: 'https://app.simplelogin.io', icon: 'assets/apps/proton/lumo.svg' },
                { name: 'Proton Docs', url: 'https://docs.proton.me', icon: 'assets/apps/proton/docs.svg' },
                { name: 'Proton Sheets', url: 'https://sheets.proton.me', icon: 'assets/apps/proton/sheets.svg' }
            ],
            allAppsLink: 'https://account.proton.me/apps'
        },
        microsoft: {
            apps: [
                { name: 'Copilot', url: 'https://copilot.microsoft.com', icon: 'assets/apps/microsoft/copilot.svg' },
                { name: 'Outlook', url: 'https://outlook.live.com', icon: 'assets/apps/microsoft/outlook.svg' },
                { name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'assets/apps/microsoft/onedrive.svg' },
                { name: 'Word', url: 'https://www.office.com/launch/word', icon: 'assets/apps/microsoft/word.svg' },
                { name: 'Excel', url: 'https://www.office.com/launch/excel', icon: 'assets/apps/microsoft/excel.svg' },
                { name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', icon: 'assets/apps/microsoft/ppt.svg' },
                { name: 'OneNote', url: 'https://www.onenote.com', icon: 'assets/apps/microsoft/onenote.svg' },
                { name: 'Teams', url: 'https://teams.live.com', icon: 'assets/apps/microsoft/teams.svg' },
                { name: 'ClipChamp', url: 'https://app.clipchamp.com/', icon: 'assets/apps/microsoft/clip.svg' }
            ],
            allAppsLink: 'https://www.microsoft365.com/apps'
        },
        google: {
            apps: [
                { name: 'Gemini', url: 'https://gemini.google.com', icon: 'assets/apps/google/gemini.svg' },
                { name: 'Gmail', url: 'https://mail.google.com', icon: 'assets/apps/google/mail.svg' },
                { name: 'YouTube', url: 'https://youtube.com', icon: 'assets/apps/google/youtube.svg' },
                { name: 'Drive', url: 'https://drive.google.com', icon: 'assets/apps/google/drive.svg' },
                { name: 'Docs', url: 'https://docs.google.com', icon: 'assets/apps/google/docs.svg' },
                { name: 'Meet', url: 'https://meet.google.com', icon: 'assets/apps/google/meet.svg' },
                { name: 'Music', url: 'https://music.google.com', icon: 'assets/apps/google/music.svg' },
                { name: 'Meet', url: 'https://meet.google.com', icon: 'assets/apps/google/meet.svg' },
                { name: 'Web Store', url: 'https://chromewebstore.google.com', icon: 'assets/apps/google/store.svg' }
            ],
            allAppsLink: 'https://about.google/products/'
        }
    };

    // Elementos DOM
    const appLauncherWrapper = document.getElementById('appLauncherWrapper');
    const appLauncherBtn = document.getElementById('appLauncherBtn');
    const launcherPopup = document.getElementById('launcherPopup');
    const launcherGrid = document.getElementById('launcherGrid');
    const launcherAllAppsLink = document.getElementById('launcherAllAppsLink');
    
    // Configurações
    const toggleLauncher = document.getElementById('toggleLauncher');
    const launcherProvider = document.getElementById('launcherProvider');
    const launcherSelectGroup = document.getElementById('launcherSelectGroup');

    // Estado Inicial
    let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true'; // Padrão false
    let currentProvider = localStorage.getItem('launcherProvider') || 'proton'; // Padrão Proton para teste

    // Inicialização
    if(toggleLauncher) toggleLauncher.checked = launcherEnabled;
    if(launcherProvider) launcherProvider.value = currentProvider;
    
    updateLauncherVisibility();
    if(launcherEnabled) renderLauncher(currentProvider);

    // Evento: Toggle On/Off
    if(toggleLauncher) {
        toggleLauncher.addEventListener('change', (e) => {
            launcherEnabled = e.target.checked;
            localStorage.setItem('launcherEnabled', launcherEnabled);
            updateLauncherVisibility();
            if(launcherEnabled) renderLauncher(currentProvider);
        });
    }

    // Evento: Mudar Provider (Microsoft, Google, Proton)
    if(launcherProvider) {
        launcherProvider.addEventListener('change', (e) => {
            currentProvider = e.target.value;
            localStorage.setItem('launcherProvider', currentProvider);
            renderLauncher(currentProvider);
        });
    }

    // Função de Visibilidade
    function updateLauncherVisibility() {
        if(launcherEnabled) {
            appLauncherWrapper.style.display = 'block';
            if(launcherSelectGroup) launcherSelectGroup.style.display = 'block';
        } else {
            appLauncherWrapper.style.display = 'none';
            if(launcherSelectGroup) launcherSelectGroup.style.display = 'none';
        }
    }

    // Função Principal: Renderizar o Grid 3x3
    function renderLauncher(providerKey) {
        const data = launcherData[providerKey];
        if(!data) return;

        // Limpa grid atual
        launcherGrid.innerHTML = '';

        // Cria os 9 ícones
        data.apps.forEach(app => {
            const link = document.createElement('a');
            link.href = app.url;
            link.className = 'launcher-item';
            
            // Ícone + Tooltip (Label)
            link.innerHTML = `
                <img src="${app.icon}" class="launcher-icon" alt="${app.name}">
                <span class="launcher-label">${app.name}</span>
            `;
            
            launcherGrid.appendChild(link);
        });

        // Atualiza Link do Footer
        if(launcherAllAppsLink) {
            launcherAllAppsLink.href = data.allAppsLink;
        }
    }

    // Abrir/Fechar Popup do Launcher
    if(appLauncherBtn) {
        appLauncherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            launcherPopup.classList.toggle('active');
            appLauncherBtn.classList.toggle('active');
        });
    }

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if(launcherPopup && launcherPopup.classList.contains('active')) {
            if(!launcherPopup.contains(e.target) && !appLauncherBtn.contains(e.target)) {
                launcherPopup.classList.remove('active');
                appLauncherBtn.classList.remove('active');
            }
        }
    });
    // ==========================================
    // 6. RODAPÉ (VERSÃO)
    // ==========================================
    const versionDisplay = document.getElementById('versionDisplay');
    
    if (versionDisplay) {
        try {
            // Tenta pegar a versão da API do navegador (Chrome/Edge)
            const manifest = chrome.runtime.getManifest();
            versionDisplay.textContent = `v${manifest.version}`;
        } catch (e) {
            // Fallback caso esteja testando fora de uma extensão (localhost)
            console.log('Não foi possível ler a versão do manifesto (contexto local).');
            versionDisplay.textContent = 'v1.0'; 
        }
    }

    // Inicialização
    renderShortcuts();
});