/**
 * Monitor Complex - Master Application Controller
 * Connects Modules, UI State, Canvas Graphs, Sound FX, Navigation & Command Deck.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Audio and Global State
    // ----------------------------------------------------
    const soundBtn = document.getElementById('btn-sound-toggle');
    const updateSoundIcon = () => {
        const isMuted = window.SoundEngine ? window.SoundEngine.isMuted() : false;
        if (soundBtn) {
            soundBtn.innerHTML = isMuted 
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg><span>Muted</span>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg><span>SFX On</span>`;
            soundBtn.classList.toggle('muted', isMuted);
        }
    };
    if (soundBtn) {
        updateSoundIcon();
        soundBtn.addEventListener('click', () => {
            if (window.SoundEngine) {
                window.SoundEngine.toggleMute();
                updateSoundIcon();
            }
        });
    }

    // Toast Notifications
    window.showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        } else {
            iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `<span class="toast-icon">${iconSvg}</span><span class="toast-text">${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    };

    // Digital Clock & Status
    const clockEl = document.getElementById('system-clock');
    const clockDateEl = document.getElementById('system-date');
    let useUtc = false;

    function updateClock() {
        const now = new Date();
        if (useUtc) {
            clockEl.textContent = now.toUTCString().slice(17, 25) + ' UTC';
            clockDateEl.textContent = now.toUTCString().slice(0, 16);
        } else {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${hours}:${minutes}:${seconds}`;
            clockDateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
    if (clockEl) {
        updateClock();
        setInterval(updateClock, 1000);
        clockEl.parentElement.addEventListener('click', () => {
            useUtc = !useUtc;
            updateClock();
            if (window.SoundEngine) window.SoundEngine.click();
            window.showToast(useUtc ? 'Switched to UTC Time' : 'Switched to Local Time', 'info');
        });
    }

    // Online / Offline monitor
    const statusBadge = document.getElementById('system-status-indicator');
    function updateOnlineStatus() {
        if (!statusBadge) return;
        if (navigator.onLine) {
            statusBadge.className = 'status-pill online';
            statusBadge.innerHTML = `<span class="pulse-dot"></span><span class="status-label">ONLINE</span>`;
        } else {
            statusBadge.className = 'status-pill offline';
            statusBadge.innerHTML = `<span class="pulse-dot"></span><span class="status-label">OFFLINE</span>`;
            window.showToast('Network connection lost! Running offline.', 'error');
        }
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // ----------------------------------------------------
    // 2. Navigation Tabs
    // ----------------------------------------------------
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function switchTab(tabId, updateHash = true) {
        if (!document.getElementById(`tab-${tabId}`)) return;

        navButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        tabPanels.forEach(panel => {
            const isActive = panel.id === `tab-${tabId}`;
            panel.classList.toggle('active', isActive);
        });

        if (window.SoundEngine) window.SoundEngine.tabSwitch();
        if (updateHash && window.location.hash !== `#${tabId}`) {
            history.pushState(null, '', `#${tabId}`);
        }

        // Trigger resize event for canvases
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Hash listener & on load
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) switchTab(hash, false);
    });

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(`tab-${initialHash}`)) {
        switchTab(initialHash, false);
    }

    // Global Keybindings: 1: Overview, 2: Speedtest, 3: QR, 4: Weather, 5: Links, 6: NetConfig, 7: News
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        if (e.key === '1') switchTab('overview');
        if (e.key === '2') switchTab('speedtest');
        if (e.key === '3') switchTab('qrcode');
        if (e.key === '4') switchTab('weather');
        if (e.key === '5') switchTab('links');
        if (e.key === '6') switchTab('netconfig');
        if (e.key === '7') switchTab('news');
    });

    // ----------------------------------------------------
    // 3. Overview Hub Connections
    // ----------------------------------------------------
    const overviewRunSpeed = document.getElementById('overview-btn-speed');
    if (overviewRunSpeed) {
        overviewRunSpeed.addEventListener('click', () => {
            switchTab('speedtest');
            setTimeout(() => {
                const startBtn = document.getElementById('speed-start-btn');
                if (startBtn && !speedEngine.isRunning) startBtn.click();
            }, 300);
        });
    }

    const overviewQuickQrInput = document.getElementById('overview-qr-input');
    const overviewQuickQrBtn = document.getElementById('overview-qr-btn');
    if (overviewQuickQrBtn && overviewQuickQrInput) {
        overviewQuickQrBtn.addEventListener('click', () => {
            const val = overviewQuickQrInput.value.trim();
            if (val) {
                switchTab('qrcode');
                const mainQrText = document.getElementById('qr-input-text');
                if (mainQrText) {
                    mainQrText.value = val;
                    mainQrText.dispatchEvent(new Event('input'));
                }
            }
        });
    }

    // ----------------------------------------------------
    // 4. Speed Test Implementation
    // ----------------------------------------------------
    const speedStartBtn = document.getElementById('speed-start-btn');
    const speedGaugeValue = document.getElementById('speed-gauge-number');
    const speedGaugeUnit = document.getElementById('speed-gauge-unit');
    const speedGaugePhase = document.getElementById('speed-gauge-phase');
    const speedGaugeArc = document.getElementById('speed-gauge-progress');
    const speedGaugeNeedle = document.getElementById('speed-gauge-needle');

    const pingValEl = document.getElementById('speed-stat-ping');
    const jitterValEl = document.getElementById('speed-stat-jitter');
    const downloadValEl = document.getElementById('speed-stat-download');
    const uploadValEl = document.getElementById('speed-stat-upload');
    const ipValEl = document.getElementById('speed-stat-ip');
    const connTypeEl = document.getElementById('speed-stat-type');
    const speedVerdictCard = document.getElementById('speed-verdict-card');
    const speedHistoryList = document.getElementById('speed-history-list');
    const speedClearHistoryBtn = document.getElementById('speed-clear-history');

    // Canvas Real-Time Graph
    const speedCanvas = document.getElementById('speed-graph-canvas');
    let speedCtx = speedCanvas ? speedCanvas.getContext('2d') : null;

    function resizeSpeedCanvas() {
        if (!speedCanvas) return;
        const rect = speedCanvas.getBoundingClientRect();
        speedCanvas.width = rect.width * window.devicePixelRatio || 600;
        speedCanvas.height = rect.height * window.devicePixelRatio || 160;
    }
    window.addEventListener('resize', resizeSpeedCanvas);
    resizeSpeedCanvas();

    function drawSpeedGraph(samples, color = '#00f0ff') {
        if (!speedCtx || !speedCanvas) return;
        const width = speedCanvas.width;
        const height = speedCanvas.height;

        speedCtx.clearRect(0, 0, width, height);

        // Grid lines
        speedCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        speedCtx.lineWidth = 1;
        for (let y = 0; y < height; y += height / 4) {
            speedCtx.beginPath();
            speedCtx.moveTo(0, y);
            speedCtx.lineTo(width, y);
            speedCtx.stroke();
        }

        if (samples.length < 2) return;

        const maxVal = Math.max(10, ...samples) * 1.15;
        const step = width / (Math.max(samples.length - 1, 30));

        // Area Gradient
        const grad = speedCtx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

        speedCtx.beginPath();
        speedCtx.moveTo(0, height);

        for (let i = 0; i < samples.length; i++) {
            const x = i * step;
            const y = height - (samples[i] / maxVal) * height;
            if (i === 0) speedCtx.lineTo(x, y);
            else {
                // smooth curve
                const prevX = (i - 1) * step;
                const prevY = height - (samples[i - 1] / maxVal) * height;
                const cpX = (prevX + x) / 2;
                speedCtx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
            }
        }

        speedCtx.lineTo((samples.length - 1) * step, height);
        speedCtx.closePath();
        speedCtx.fillStyle = grad;
        speedCtx.fill();

        // Stroke line
        speedCtx.beginPath();
        for (let i = 0; i < samples.length; i++) {
            const x = i * step;
            const y = height - (samples[i] / maxVal) * height;
            if (i === 0) speedCtx.moveTo(x, y);
            else {
                const prevX = (i - 1) * step;
                const prevY = height - (samples[i - 1] / maxVal) * height;
                const cpX = (prevX + x) / 2;
                speedCtx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
            }
        }
        speedCtx.strokeStyle = color;
        speedCtx.lineWidth = 2.5 * (window.devicePixelRatio || 1);
        speedCtx.stroke();
    }

    function updateGauge(speed, maxScale = 100) {
        if (!speedGaugeValue) return;
        speedGaugeValue.textContent = speed.toFixed(speed < 10 ? 2 : 1);

        // Needle rotation: -135deg to +135deg (270 deg total arc matching SVG)
        const ratio = Math.min(Math.max(speed / maxScale, 0), 1);
        const angle = -135 + ratio * 270;
        if (speedGaugeNeedle) {
            speedGaugeNeedle.style.transform = `rotate(${angle}deg)`;
        }

        // SVG Arc strokeDashoffset (424 total dash for 270 deg)
        if (speedGaugeArc) {
            const totalDash = 424;
            const offset = totalDash - (totalDash * ratio);
            speedGaugeArc.style.strokeDashoffset = offset;
        }
    }

    const renderSpeedHistory = (history) => {
        if (!speedHistoryList) return;
        if (!history || history.length === 0) {
            speedHistoryList.innerHTML = `<div class="empty-state">No test history recorded yet. Hit 'Start Test' above!</div>`;
            return;
        }
        speedHistoryList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="hist-time">
                    <span class="hist-hour">${item.date}</span>
                    <span class="hist-day">${item.fullDate}</span>
                </div>
                <div class="hist-metric">
                    <span class="hist-label">PING</span>
                    <span class="hist-val">${item.ping} <small>ms</small></span>
                </div>
                <div class="hist-metric">
                    <span class="hist-label">DOWNLOAD</span>
                    <span class="hist-val cyan">${item.download} <small>Mbps</small></span>
                </div>
                <div class="hist-metric">
                    <span class="hist-label">UPLOAD</span>
                    <span class="hist-val lime">${item.upload} <small>Mbps</small></span>
                </div>
                <div class="hist-badge badge-${item.rating ? item.rating.badge : 'standard'}">
                    ${item.rating ? item.rating.label : 'Test OK'}
                </div>
            </div>
        `).join('');
    };

    const speedEngine = new SpeedTestEngine({
        onStart: () => {
            speedStartBtn.innerHTML = `<span class="spinner-dot"></span><span>ABORT TEST</span>`;
            speedStartBtn.classList.add('running');
            speedVerdictCard.style.display = 'none';
            speedGaugePhase.textContent = 'INITIALIZING...';
            updateGauge(0);
        },
        onStop: () => {
            speedStartBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>START TEST</span>`;
            speedStartBtn.classList.remove('running');
            speedGaugePhase.textContent = 'READY';
        },
        onPhaseChange: (phase) => {
            if (phase === 'ping') speedGaugePhase.textContent = 'MEASURING LATENCY...';
            if (phase === 'download') speedGaugePhase.textContent = 'TESTING DOWNLOAD...';
            if (phase === 'upload') speedGaugePhase.textContent = 'TESTING UPLOAD...';
        },
        onPingUpdate: (ping, current, total) => {
            pingValEl.textContent = ping;
            speedGaugeValue.textContent = ping;
            speedGaugeUnit.textContent = 'ms';
            if (speedGaugePhase) speedGaugePhase.textContent = `PING SAMPLE ${current}/${total}`;
        },
        onPingComplete: (ping, jitter) => {
            pingValEl.textContent = ping;
            jitterValEl.textContent = jitter;
            speedGaugeUnit.textContent = 'Mbps';
        },
        onProgress: (info) => {
            speedGaugeUnit.textContent = 'Mbps';
            updateGauge(info.speed, info.phase === 'download' ? 100 : 50);
            if (info.phase === 'download') {
                downloadValEl.textContent = info.speed.toFixed(1);
                drawSpeedGraph(info.samples, '#00f0ff');
            } else {
                uploadValEl.textContent = info.speed.toFixed(1);
                drawSpeedGraph(info.samples, '#10b981');
            }
        },
        onDownloadComplete: (speed) => {
            downloadValEl.textContent = speed.toFixed(1);
        },
        onUploadComplete: (speed) => {
            uploadValEl.textContent = speed.toFixed(1);
        },
        onComplete: (record) => {
            speedStartBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>RE-RUN TEST</span>`;
            speedStartBtn.classList.remove('running');
            speedGaugePhase.textContent = 'COMPLETED';
            updateGauge(record.download);

            if (window.SoundEngine) window.SoundEngine.success();
            window.showToast(`Speed Test Finished: ${record.download} Mbps Download`, 'success');

            // Show verdict
            if (speedVerdictCard) {
                speedVerdictCard.style.display = 'flex';
                speedVerdictCard.innerHTML = `
                    <div class="verdict-icon badge-${record.rating.badge}">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <div class="verdict-info">
                        <div class="verdict-title">${record.rating.label}</div>
                        <div class="verdict-desc">${record.rating.desc}</div>
                    </div>
                `;
            }

            // Also update Overview Hub Speed Card
            const overviewSpeedVal = document.getElementById('overview-stat-speed');
            const overviewPingVal = document.getElementById('overview-stat-ping');
            if (overviewSpeedVal) overviewSpeedVal.textContent = record.download + ' Mbps';
            if (overviewPingVal) overviewPingVal.textContent = record.ping + ' ms';
        },
        onNetworkInfo: (info) => {
            if (ipValEl) ipValEl.textContent = info.ip;
            if (connTypeEl) connTypeEl.textContent = info.connectionType;

            const overviewIp = document.getElementById('overview-stat-ip');
            if (overviewIp) overviewIp.textContent = info.ip;
        },
        onHistoryUpdate: (hist) => {
            renderSpeedHistory(hist);
        }
    });

    renderSpeedHistory(speedEngine.data.history);

    if (speedStartBtn) {
        speedStartBtn.addEventListener('click', () => {
            if (speedEngine.isRunning) {
                speedEngine.stop();
            } else {
                speedEngine.start();
            }
        });
    }

    if (speedClearHistoryBtn) {
        speedClearHistoryBtn.addEventListener('click', () => {
            if (confirm('Clear all network speed history?')) {
                speedEngine.clearHistory();
                window.showToast('Test history cleared', 'info');
            }
        });
    }

    // ----------------------------------------------------
    // 5. QR Code Studio Implementation
    // ----------------------------------------------------
    const qrCanvas = document.getElementById('qr-output-canvas');
    const qrTextarea = document.getElementById('qr-input-text');
    const qrTypeButtons = document.querySelectorAll('.qr-type-btn');
    const qrColorDark = document.getElementById('qr-color-dark');
    const qrColorLight = document.getElementById('qr-color-light');
    const qrTransparentCheck = document.getElementById('qr-transparent-bg');
    const qrSizeSlider = document.getElementById('qr-size-slider');
    const qrSizeLabel = document.getElementById('qr-size-label');
    const qrEccButtons = document.querySelectorAll('.ecc-btn');
    const qrDotButtons = document.querySelectorAll('.dot-style-btn');
    const qrLogoPresets = document.querySelectorAll('.logo-preset-btn');
    const qrLogoUpload = document.getElementById('qr-logo-upload');
    const qrBtnDownloadPng = document.getElementById('qr-btn-download-png');
    const qrBtnDownloadSvg = document.getElementById('qr-btn-download-svg');
    const qrBtnCopy = document.getElementById('qr-btn-copy');

    let currentQrType = 'url';
    let currentEcc = 'M';
    let currentDotStyle = 'square';
    let currentLogoImg = null;

    // Helper: generate type-specific payload
    function getQrPayload() {
        if (currentQrType === 'url') {
            const input = document.getElementById('qr-type-url-input');
            return input ? input.value.trim() : 'https://google.com';
        } else if (currentQrType === 'wifi') {
            const ssid = document.getElementById('qr-wifi-ssid')?.value.trim() || 'MyNetwork';
            const pass = document.getElementById('qr-wifi-pass')?.value || '';
            const enc = document.getElementById('qr-wifi-enc')?.value || 'WPA';
            const hidden = document.getElementById('qr-wifi-hidden')?.checked ? 'true' : 'false';
            return `WIFI:S:${ssid};T:${enc};P:${pass};H:${hidden};;`;
        } else if (currentQrType === 'vcard') {
            const name = document.getElementById('qr-vcard-name')?.value.trim() || 'John Doe';
            const phone = document.getElementById('qr-vcard-phone')?.value.trim() || '';
            const email = document.getElementById('qr-vcard-email')?.value.trim() || '';
            const org = document.getElementById('qr-vcard-org')?.value.trim() || '';
            return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
        } else if (currentQrType === 'email') {
            const to = document.getElementById('qr-email-to')?.value.trim() || '';
            const sub = document.getElementById('qr-email-sub')?.value.trim() || '';
            const body = document.getElementById('qr-email-body')?.value.trim() || '';
            return `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
        } else if (currentQrType === 'phone') {
            const tel = document.getElementById('qr-phone-num')?.value.trim() || '';
            return `tel:${tel}`;
        } else {
            return qrTextarea ? qrTextarea.value.trim() : 'Monitor Complex';
        }
    }

    function renderCurrentQR() {
        if (!qrCanvas || !window.QRCodeEngine) return;
        const text = getQrPayload();
        if (!text) return;

        const size = parseInt(qrSizeSlider ? qrSizeSlider.value : 320, 10);
        const darkColor = qrColorDark ? qrColorDark.value : '#00f0ff';
        const lightColor = qrColorLight ? qrColorLight.value : '#0e121a';
        const transparent = qrTransparentCheck ? qrTransparentCheck.checked : false;

        try {
            window.QRCodeEngine.renderToCanvas(qrCanvas, {
                text: text,
                size: size,
                darkColor: darkColor,
                lightColor: lightColor,
                transparent: transparent,
                eccLevel: currentEcc,
                dotStyle: currentDotStyle,
                logoImage: currentLogoImg,
                margin: 2
            });

            // Also render mini preview on overview deck if element exists
            const overviewCanvas = document.getElementById('overview-qr-canvas');
            if (overviewCanvas) {
                window.QRCodeEngine.renderToCanvas(overviewCanvas, {
                    text: text,
                    size: 160,
                    darkColor: darkColor,
                    lightColor: lightColor,
                    transparent: transparent,
                    eccLevel: currentEcc,
                    dotStyle: currentDotStyle,
                    margin: 2
                });
            }
        } catch (e) {
            console.error('QR Render failed:', e);
        }
    }

    // QR Type switcher
    qrTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            qrTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentQrType = btn.dataset.type;

            document.querySelectorAll('.qr-type-fields').forEach(f => {
                f.style.display = f.dataset.for === currentQrType ? 'block' : 'none';
            });

            if (window.SoundEngine) window.SoundEngine.click();
            renderCurrentQR();
        });
    });

    // Inputs listener
    document.querySelectorAll('.qr-input-field').forEach(input => {
        input.addEventListener('input', () => renderCurrentQR());
    });

    if (qrColorDark) qrColorDark.addEventListener('input', () => renderCurrentQR());
    if (qrColorLight) qrColorLight.addEventListener('input', () => renderCurrentQR());
    if (qrTransparentCheck) qrTransparentCheck.addEventListener('change', () => renderCurrentQR());

    if (qrSizeSlider && qrSizeLabel) {
        qrSizeSlider.addEventListener('input', () => {
            qrSizeLabel.textContent = `${qrSizeSlider.value}px`;
            renderCurrentQR();
        });
    }

    // Preset color buttons
    document.querySelectorAll('.qr-preset-color').forEach(btn => {
        btn.addEventListener('click', () => {
            if (qrColorDark) {
                qrColorDark.value = btn.dataset.color;
                renderCurrentQR();
                if (window.SoundEngine) window.SoundEngine.click();
            }
        });
    });

    // ECC buttons
    qrEccButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            qrEccButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentEcc = btn.dataset.ecc;
            if (window.SoundEngine) window.SoundEngine.click();
            renderCurrentQR();
        });
    });

    // Dot style buttons
    qrDotButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            qrDotButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDotStyle = btn.dataset.style;
            if (window.SoundEngine) window.SoundEngine.click();
            renderCurrentQR();
        });
    });

    // Logo Presets
    qrLogoPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            qrLogoPresets.forEach(b => b.classList.remove('active'));
            const logoType = btn.dataset.logo;

            if (logoType === 'none') {
                currentLogoImg = null;
                btn.classList.add('active');
                renderCurrentQR();
                return;
            }

            btn.classList.add('active');
            // Create in-memory canvas for SVG icon
            const iconSvg = btn.querySelector('svg');
            if (iconSvg) {
                const svgString = new XMLSerializer().serializeToString(iconSvg);
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const img = new Image();
                img.onload = () => {
                    currentLogoImg = img;
                    renderCurrentQR();
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            }
        });
    });

    // Logo file upload
    if (qrLogoUpload) {
        qrLogoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    currentLogoImg = img;
                    qrLogoPresets.forEach(b => b.classList.remove('active'));
                    renderCurrentQR();
                    window.showToast('Custom logo applied to QR!', 'success');
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Downloads
    if (qrBtnDownloadPng && qrCanvas) {
        qrBtnDownloadPng.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `monitor-complex-qr-${Date.now()}.png`;
            link.href = qrCanvas.toDataURL('image/png');
            link.click();
            if (window.SoundEngine) window.SoundEngine.success();
            window.showToast('QR Code downloaded as PNG', 'success');
        });
    }

    if (qrBtnDownloadSvg) {
        qrBtnDownloadSvg.addEventListener('click', () => {
            const text = getQrPayload();
            const svgContent = window.QRCodeEngine.generateSVG({
                text: text,
                size: parseInt(qrSizeSlider ? qrSizeSlider.value : 320, 10),
                darkColor: qrColorDark ? qrColorDark.value : '#00f0ff',
                lightColor: qrColorLight ? qrColorLight.value : '#0e121a',
                transparent: qrTransparentCheck ? qrTransparentCheck.checked : false,
                eccLevel: currentEcc
            });

            const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `monitor-complex-qr-${Date.now()}.svg`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            if (window.SoundEngine) window.SoundEngine.success();
            window.showToast('QR Code downloaded as SVG', 'success');
        });
    }

    if (qrBtnCopy && qrCanvas) {
        qrBtnCopy.addEventListener('click', async () => {
            try {
                qrCanvas.toBlob(async (blob) => {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    if (window.SoundEngine) window.SoundEngine.success();
                    window.showToast('QR Code image copied to clipboard!', 'success');
                });
            } catch (err) {
                // Fallback copy text
                await navigator.clipboard.writeText(getQrPayload());
                window.showToast('QR payload text copied!', 'info');
            }
        });
    }

    // Initial QR render
    renderCurrentQR();

    // ----------------------------------------------------
    // 6. Weather Station Implementation
    // ----------------------------------------------------
    const weatherLocName = document.getElementById('weather-loc-name');
    const weatherLocCountry = document.getElementById('weather-loc-country');
    const weatherTemp = document.getElementById('weather-current-temp');
    const weatherUnit = document.getElementById('weather-unit-symbol');
    const weatherCondition = document.getElementById('weather-current-condition');
    const weatherFeelsLike = document.getElementById('weather-feels-like');
    const weatherHighLow = document.getElementById('weather-high-low');
    const weatherIconContainer = document.getElementById('weather-main-icon');

    const weatherHumidity = document.getElementById('weather-stat-humidity');
    const weatherWindSpeed = document.getElementById('weather-stat-wind');
    const weatherWindCompass = document.getElementById('weather-stat-compass');
    const weatherCompassArrow = document.getElementById('weather-compass-arrow');
    const weatherUvVal = document.getElementById('weather-stat-uv');
    const weatherUvBadge = document.getElementById('weather-uv-badge');
    const weatherPressure = document.getElementById('weather-stat-pressure');
    const weatherSunrise = document.getElementById('weather-sunrise-time');
    const weatherSunset = document.getElementById('weather-sunset-time');

    const hourlyContainer = document.getElementById('weather-hourly-list');
    const dailyContainer = document.getElementById('weather-daily-list');

    const citySearchInput = document.getElementById('weather-search-city');
    const citySearchDropdown = document.getElementById('weather-search-dropdown');
    const detectLocationBtn = document.getElementById('weather-btn-detect');
    const unitToggleBtn = document.getElementById('weather-btn-unit');

    // Weather Icon SVG renderer
    function getWeatherSvg(iconName) {
        switch (iconName) {
            case 'sun':
                return `<svg class="weather-icon-svg icon-sun" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
            case 'moon':
                return `<svg class="weather-icon-svg icon-moon" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
            case 'cloud-sun':
                return `<svg class="weather-icon-svg icon-cloud-sun" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41"/><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>`;
            case 'cloud':
                return `<svg class="weather-icon-svg icon-cloud" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;
            case 'cloud-drizzle':
            case 'cloud-rain':
            case 'cloud-heavy-rain':
                return `<svg class="weather-icon-svg icon-rain" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`;
            case 'cloud-lightning':
                return `<svg class="weather-icon-svg icon-thunder" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polygon points="13 11 9 17 15 17 11 23"/></svg>`;
            case 'snowflake':
            case 'snow-shower':
                return `<svg class="weather-icon-svg icon-snow" viewBox="0 0 24 24" fill="none" stroke="#e0f2fe" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>`;
            default:
                return `<svg class="weather-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
        }
    }

    const weatherStation = new WeatherStation({
        onLoading: (isLoading) => {
            if (detectLocationBtn) {
                detectLocationBtn.classList.toggle('loading', isLoading);
            }
        },
        onUpdate: (data) => {
            const cur = data.current;
            const unitSymbol = data.unit === 'f' ? '°F' : '°C';
            const speedSymbol = data.unit === 'f' ? 'mph' : 'km/h';

            // Top Hero
            if (weatherLocName) weatherLocName.textContent = data.location.name;
            if (weatherLocCountry) weatherLocCountry.textContent = data.location.country ? `• ${data.location.country}` : '';
            if (weatherTemp) weatherTemp.textContent = cur.temperature;
            if (weatherUnit) weatherUnit.textContent = unitSymbol;
            if (weatherCondition) weatherCondition.textContent = cur.condition;
            if (weatherFeelsLike) weatherFeelsLike.textContent = `Feels like ${cur.feelsLike}${unitSymbol}`;
            if (weatherHighLow && cur.tempMax !== null && cur.tempMin !== null) {
                weatherHighLow.textContent = `H: ${cur.tempMax}° / L: ${cur.tempMin}°`;
            }
            if (weatherIconContainer) {
                weatherIconContainer.innerHTML = getWeatherSvg(cur.icon);
            }

            // Weather telemetry
            if (weatherHumidity) weatherHumidity.textContent = `${cur.humidity}%`;
            if (weatherWindSpeed) weatherWindSpeed.textContent = `${cur.windSpeed} ${speedSymbol}`;
            if (weatherWindCompass) weatherWindCompass.textContent = `${cur.windCompass} (${cur.windDirection}°)`;
            if (weatherCompassArrow) {
                weatherCompassArrow.style.transform = `rotate(${cur.windDirection}deg)`;
            }
            if (weatherUvVal) weatherUvVal.textContent = cur.uvIndex;
            if (weatherUvBadge) {
                weatherUvBadge.textContent = cur.uvCategory.text;
                weatherUvBadge.style.color = cur.uvCategory.color;
            }
            if (weatherPressure) weatherPressure.textContent = `${cur.pressure} hPa`;

            // Sunrise / Sunset
            if (weatherSunrise && cur.sunrise) {
                weatherSunrise.textContent = new Date(cur.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            if (weatherSunset && cur.sunset) {
                weatherSunset.textContent = new Date(cur.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Hourly Slider
            if (hourlyContainer && data.hourly) {
                hourlyContainer.innerHTML = data.hourly.map(item => `
                    <div class="hourly-item">
                        <span class="hourly-time">${item.time}</span>
                        <div class="hourly-icon">${getWeatherSvg(item.icon)}</div>
                        <span class="hourly-temp">${item.temp}°</span>
                        ${item.pop > 0 ? `<span class="hourly-pop">${item.pop}%</span>` : ''}
                    </div>
                `).join('');
            }

            // 7-Day Forecast
            if (dailyContainer && data.daily) {
                const maxWeekTemp = Math.max(...data.daily.map(d => d.tempMax));
                const minWeekTemp = Math.min(...data.daily.map(d => d.tempMin));
                const tempRange = Math.max(1, maxWeekTemp - minWeekTemp);

                dailyContainer.innerHTML = data.daily.map(day => {
                    const leftPct = ((day.tempMin - minWeekTemp) / tempRange) * 100;
                    const widthPct = Math.max(8, ((day.tempMax - day.tempMin) / tempRange) * 100);

                    return `
                        <div class="daily-item">
                            <div class="daily-day-col">
                                <span class="daily-day-name">${day.day}</span>
                                <span class="daily-day-date">${day.date}</span>
                            </div>
                            <div class="daily-icon-col">
                                ${getWeatherSvg(day.icon)}
                                <span class="daily-condition-label">${day.condition}</span>
                            </div>
                            <div class="daily-bar-col">
                                <span class="daily-min-temp">${day.tempMin}°</span>
                                <div class="daily-temp-track">
                                    <div class="daily-temp-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
                                </div>
                                <span class="daily-max-temp">${day.tempMax}°</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Also update Overview Hub Weather Card
            const overviewWeatherCity = document.getElementById('overview-weather-city');
            const overviewWeatherTemp = document.getElementById('overview-weather-temp');
            const overviewWeatherTempLg = document.getElementById('overview-weather-temp-lg');
            const overviewWeatherDesc = document.getElementById('overview-weather-desc');
            const overviewWeatherIcon = document.getElementById('overview-weather-icon');
            if (overviewWeatherCity) overviewWeatherCity.textContent = data.location.name;
            if (overviewWeatherTemp) overviewWeatherTemp.textContent = `${cur.temperature}${unitSymbol}`;
            if (overviewWeatherTempLg) overviewWeatherTempLg.textContent = `${cur.temperature}${unitSymbol}`;
            if (overviewWeatherDesc) overviewWeatherDesc.textContent = cur.condition;
            if (overviewWeatherIcon) overviewWeatherIcon.innerHTML = getWeatherSvg(cur.icon);
        },
        onError: (err) => {
            window.showToast(`Weather error: ${err}`, 'error');
        }
    });

    weatherStation.init();

    // City search autocomplete
    let searchTimeout = null;
    if (citySearchInput && citySearchDropdown) {
        citySearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = citySearchInput.value.trim();
            if (query.length < 2) {
                citySearchDropdown.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(async () => {
                const results = await weatherStation.searchCity(query);
                if (results && results.length > 0) {
                    citySearchDropdown.innerHTML = results.map(r => `
                        <div class="search-result-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}" data-country="${r.country || ''}">
                            <div class="search-res-name">${r.name}</div>
                            <div class="search-res-sub">${[r.admin1, r.country].filter(Boolean).join(', ')}</div>
                        </div>
                    `).join('');
                    citySearchDropdown.style.display = 'block';

                    citySearchDropdown.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const lat = parseFloat(item.dataset.lat);
                            const lon = parseFloat(item.dataset.lon);
                            const name = item.dataset.name;
                            const country = item.dataset.country;
                            citySearchDropdown.style.display = 'none';
                            citySearchInput.value = '';
                            weatherStation.fetchWeather(lat, lon, name, country);
                            if (window.SoundEngine) window.SoundEngine.click();
                            window.showToast(`Loading weather for ${name}...`, 'info');
                        });
                    });
                } else {
                    citySearchDropdown.innerHTML = `<div class="search-empty">No matching cities found</div>`;
                    citySearchDropdown.style.display = 'block';
                }
            }, 250);
        });

        document.addEventListener('click', (e) => {
            if (!citySearchInput.contains(e.target) && !citySearchDropdown.contains(e.target)) {
                citySearchDropdown.style.display = 'none';
            }
        });
    }

    if (detectLocationBtn) {
        detectLocationBtn.addEventListener('click', () => {
            if (window.SoundEngine) window.SoundEngine.click();
            window.showToast('Detecting location...', 'info');
            weatherStation.detectLocation();
        });
    }

    if (unitToggleBtn) {
        unitToggleBtn.textContent = weatherStation.unit.toUpperCase();
        unitToggleBtn.addEventListener('click', () => {
            const nextUnit = weatherStation.unit === 'c' ? 'f' : 'c';
            weatherStation.setUnit(nextUnit);
            unitToggleBtn.textContent = nextUnit.toUpperCase();
            if (window.SoundEngine) window.SoundEngine.click();
            window.showToast(`Switched units to °${nextUnit.toUpperCase()}`, 'info');
        });
    }

    // ----------------------------------------------------
    // 7. Link Aggregator Implementation
    // ----------------------------------------------------
    const linksGrid = document.getElementById('links-grid');
    const linksCategoryList = document.getElementById('links-category-list');
    const linksSearchInput = document.getElementById('links-search-input');
    const linksSortSelect = document.getElementById('links-sort-select');
    const linksAddModal = document.getElementById('modal-add-link');
    const linksOpenAddModalBtn = document.getElementById('links-btn-add-modal');
    const linksCloseModalBtn = document.getElementById('modal-close-btn');
    const linksAddForm = document.getElementById('form-add-link');
    const linksExportBtn = document.getElementById('links-btn-export');
    const linksImportBtn = document.getElementById('links-btn-import');
    const linksImportFile = document.getElementById('links-import-file');
    const linksOpenCategoryBtn = document.getElementById('links-btn-open-category');

    const renderLinks = (filteredLinks) => {
        if (!linksGrid) return;
        if (!filteredLinks || filteredLinks.length === 0) {
            linksGrid.innerHTML = `
                <div class="empty-links-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <h3>No bookmarks match your criteria</h3>
                    <p>Try searching something else or add a new link to your command center.</p>
                </div>
            `;
            return;
        }

        linksGrid.innerHTML = filteredLinks.map(link => {
            const favicon = link.customIcon || linkAggregator.getFaviconUrl(link.url);
            const domain = linkAggregator.getDomain(link.url);

            return `
                <div class="link-card ${link.isFavorite ? 'favorite' : ''}" data-id="${link.id}">
                    <div class="link-card-header">
                        <div class="link-icon-wrap">
                            <img src="${favicon}" alt="" class="link-favicon" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'24\\' height=\\'24\\' fill=\\'none\\' stroke=\\'%2300f0ff\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\'/></svg>'">
                        </div>
                        <div class="link-meta-head">
                            <h4 class="link-title" title="${link.title}">${link.title}</h4>
                            <span class="link-domain">${domain}</span>
                        </div>
                        <button class="btn-star-link ${link.isFavorite ? 'active' : ''}" title="${link.isFavorite ? 'Unstar' : 'Star'}" data-id="${link.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="${link.isFavorite ? '#f59e0b' : 'none'}" stroke="${link.isFavorite ? '#f59e0b' : 'currentColor'}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </button>
                    </div>

                    ${link.description ? `<p class="link-desc">${link.description}</p>` : ''}

                    <div class="link-tags">
                        ${(link.tags || []).map(t => `<span class="link-tag">#${t}</span>`).join('')}
                    </div>

                    <div class="link-card-footer">
                        <div class="link-clicks" title="Total clicks">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>${link.clicks || 0}</span>
                        </div>
                        <div class="link-actions">
                            <button class="btn-delete-link" data-id="${link.id}" title="Delete Bookmark">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn-launch-link" data-id="${link.id}">
                                <span>LAUNCH</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Card action listeners
        linksGrid.querySelectorAll('.btn-star-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                linkAggregator.toggleFavorite(id);
                if (window.SoundEngine) window.SoundEngine.click();
            });
        });

        linksGrid.querySelectorAll('.btn-delete-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('Delete this bookmark?')) {
                    linkAggregator.deleteLink(id);
                    if (window.SoundEngine) window.SoundEngine.click();
                    window.showToast('Bookmark deleted', 'info');
                }
            });
        });

        linksGrid.querySelectorAll('.btn-launch-link').forEach(linkEl => {
            linkEl.addEventListener('click', () => {
                const id = linkEl.dataset.id;
                linkAggregator.recordClick(id);
                if (window.SoundEngine) window.SoundEngine.click();
            });
        });

        // Overview Deck Starred Links updates
        const overviewLinksList = document.getElementById('overview-starred-links');
        if (overviewLinksList) {
            const starred = linkAggregator.links.filter(l => l.isFavorite).slice(0, 6);
            if (starred.length === 0) {
                overviewLinksList.innerHTML = `<div class="empty-state">No starred bookmarks yet. Star items in the Link Hub!</div>`;
            } else {
                overviewLinksList.innerHTML = starred.map(l => `
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="overview-link-item">
                        <img src="${linkAggregator.getFaviconUrl(l.url)}" alt="" class="overview-link-favicon">
                        <div class="overview-link-text">
                            <span class="overview-link-title">${l.title}</span>
                            <span class="overview-link-sub">${linkAggregator.getDomain(l.url)}</span>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </a>
                `).join('');
            }
        }
    };

    const linkAggregator = new LinkAggregator({
        onUpdate: (links) => {
            renderLinks(links);
            updateCategoryBadges();
        }
    });

    function updateCategoryBadges() {
        if (!linksCategoryList) return;
        linksCategoryList.querySelectorAll('.category-pill').forEach(pill => {
            const catId = pill.dataset.category;
            pill.classList.toggle('active', catId === linkAggregator.activeCategory);

            let count = 0;
            if (catId === 'all') count = linkAggregator.links.length;
            else if (catId === 'favorites') count = linkAggregator.links.filter(l => l.isFavorite).length;
            else count = linkAggregator.links.filter(l => l.category === catId).length;

            const badge = pill.querySelector('.cat-count');
            if (badge) badge.textContent = count;
        });
    }

    if (linksCategoryList) {
        linksCategoryList.innerHTML = linkAggregator.categories.map(cat => `
            <button class="category-pill ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
                <span>${cat.label}</span>
                <span class="cat-count">0</span>
            </button>
        `).join('');

        linksCategoryList.querySelectorAll('.category-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                linkAggregator.setCategory(pill.dataset.category);
                if (window.SoundEngine) window.SoundEngine.click();
            });
        });
    }

    if (linksSearchInput) {
        linksSearchInput.addEventListener('input', () => {
            linkAggregator.setSearch(linksSearchInput.value);
        });
    }

    if (linksSortSelect) {
        linksSortSelect.addEventListener('change', () => {
            linkAggregator.setSort(linksSortSelect.value);
            if (window.SoundEngine) window.SoundEngine.click();
        });
    }

    // Add Link Modal
    if (linksOpenAddModalBtn && linksAddModal) {
        linksOpenAddModalBtn.addEventListener('click', () => {
            linksAddModal.style.display = 'flex';
            if (window.SoundEngine) window.SoundEngine.click();
        });
    }

    if (linksCloseModalBtn && linksAddModal) {
        linksCloseModalBtn.addEventListener('click', () => {
            linksAddModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === linksAddModal) {
            linksAddModal.style.display = 'none';
        }
    });

    if (linksAddForm) {
        linksAddForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('link-form-title').value;
            const url = document.getElementById('link-form-url').value;
            const category = document.getElementById('link-form-category').value;
            const tags = document.getElementById('link-form-tags').value;
            const description = document.getElementById('link-form-desc').value;
            const isFavorite = document.getElementById('link-form-favorite').checked;

            if (!url) return;

            linkAggregator.addLink({
                title, url, category, tags, description, isFavorite
            });

            linksAddForm.reset();
            linksAddModal.style.display = 'none';
            if (window.SoundEngine) window.SoundEngine.success();
            window.showToast('Bookmark successfully added!', 'success');
        });
    }

    // Export & Import
    if (linksExportBtn) {
        linksExportBtn.addEventListener('click', () => {
            linkAggregator.exportJSON();
            if (window.SoundEngine) window.SoundEngine.success();
            window.showToast('Bookmarks JSON exported', 'success');
        });
    }

    if (linksImportBtn && linksImportFile) {
        linksImportBtn.addEventListener('click', () => {
            linksImportFile.click();
        });

        linksImportFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const res = linkAggregator.importJSON(evt.target.result);
                if (res.success) {
                    if (window.SoundEngine) window.SoundEngine.success();
                    window.showToast(`Imported ${res.count} bookmarks!`, 'success');
                } else {
                    window.showToast(`Import error: ${res.error}`, 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    if (linksOpenCategoryBtn) {
        linksOpenCategoryBtn.addEventListener('click', () => {
            const visible = linkAggregator.getFilteredLinks();
            if (visible.length === 0) return;
            if (confirm(`Open all ${visible.length} links in new tabs?`)) {
                visible.forEach(l => window.open(l.url, '_blank'));
            }
        });
    }

    // ----------------------------------------------------
    // 8. Network Configuration Hub Controller
    // ----------------------------------------------------
    const netPublicIpEl = document.getElementById('net-stat-public-ip');
    const netIspEl = document.getElementById('net-stat-isp');
    const netAsnEl = document.getElementById('net-stat-asn');
    const netCountryEl = document.getElementById('net-stat-country');
    const netLocalIpEl = document.getElementById('net-stat-local-ip');
    const netGatewayEl = document.getElementById('net-stat-gateway');
    const netIpv6El = document.getElementById('net-stat-ipv6');
    const netEffectiveTypeEl = document.getElementById('net-stat-effective-type');
    const netDownlinkEl = document.getElementById('net-stat-downlink');
    const netRttEl = document.getElementById('net-stat-rtt');
    const btnLaunchGateway = document.getElementById('btn-launch-gateway');

    const dnsProvidersList = document.getElementById('dns-providers-list');
    const dnsCmdDisplay = document.getElementById('dns-cmd-display');
    const dnsOsTabs = document.querySelectorAll('.os-tab-btn');
    const btnCopyDnsCmd = document.getElementById('btn-copy-dns-cmd');
    const btnRetestDns = document.getElementById('btn-retest-dns');

    const subnetIpInput = document.getElementById('subnet-input-ip');
    const subnetCidrSelect = document.getElementById('subnet-input-cidr');
    const subnetResultsBox = document.getElementById('subnet-results-box');
    const routerRefTbody = document.getElementById('router-ref-tbody');

    let selectedDnsProviderId = 'cloudflare';
    let selectedDnsOs = 'windows';

    function updateDnsScriptDisplay() {
        if (!dnsCmdDisplay || !window.networkConfigHub) return;
        const cmd = window.networkConfigHub.generateDnsCommands(selectedDnsProviderId, selectedDnsOs);
        dnsCmdDisplay.textContent = cmd;
    }

    function renderDnsBenchmark(providers) {
        if (!dnsProvidersList) return;
        const minLatency = Math.min(...providers.map(p => p.latency));

        dnsProvidersList.innerHTML = providers.map((p, idx) => {
            const isFastest = p.latency === minLatency;
            const isSelected = p.id === selectedDnsProviderId;
            const barWidth = Math.min(100, Math.max(15, (p.latency / 60) * 100));

            return `
                <div class="dns-prov-card ${isSelected ? 'selected' : ''}" data-id="${p.id}">
                    <div class="dns-card-top">
                        <span class="dns-name">${p.name}</span>
                        <span class="dns-tag-badge">${isFastest ? '#1 FASTEST' : p.tag}</span>
                    </div>
                    <div class="dns-latency-row">
                        <span class="dns-latency-val font-mono ${isFastest ? 'text-cyan' : ''}">${p.latency}</span>
                        <span class="metric-unit">ms</span>
                    </div>
                    <div class="dns-latency-bar-track">
                        <div class="dns-latency-bar-fill" style="width: ${barWidth}%;"></div>
                    </div>
                    <div class="dns-ips font-mono">${p.primary} • ${p.secondary}</div>
                </div>
            `;
        }).join('');

        dnsProvidersList.querySelectorAll('.dns-prov-card').forEach(card => {
            card.addEventListener('click', () => {
                selectedDnsProviderId = card.dataset.id;
                dnsProvidersList.querySelectorAll('.dns-prov-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                updateDnsScriptDisplay();
                if (window.SoundEngine) window.SoundEngine.click();
            });
        });

        // Overview Deck fastest DNS update
        const overviewDns = document.getElementById('overview-net-dns');
        if (overviewDns && providers.length > 0) {
            overviewDns.textContent = `${providers[0].name} (${providers[0].latency}ms)`;
        }
    }

    function renderSubnetCalculation() {
        if (!subnetResultsBox || !subnetIpInput || !subnetCidrSelect || !window.networkConfigHub) return;
        const res = window.networkConfigHub.calculateSubnet(subnetIpInput.value, subnetCidrSelect.value);
        if (!res.valid) {
            subnetResultsBox.innerHTML = `<div class="text-amber">Invalid IP format. Example: 192.168.1.0</div>`;
            return;
        }

        subnetResultsBox.innerHTML = `
            <div class="subnet-res-item">
                <span class="subnet-res-lbl">SUBNET MASK</span>
                <span class="subnet-res-val text-cyan">${res.subnetMask}</span>
            </div>
            <div class="subnet-res-item">
                <span class="subnet-res-lbl">WILDCARD MASK</span>
                <span class="subnet-res-val">${res.wildcardMask}</span>
            </div>
            <div class="subnet-res-item">
                <span class="subnet-res-lbl">NETWORK ADDRESS</span>
                <span class="subnet-res-val">${res.networkAddress}</span>
            </div>
            <div class="subnet-res-item">
                <span class="subnet-res-lbl">BROADCAST IP</span>
                <span class="subnet-res-val text-amber">${res.broadcastAddress}</span>
            </div>
            <div class="subnet-res-item">
                <span class="subnet-res-lbl">USABLE HOST RANGE</span>
                <span class="subnet-res-val text-lime">${res.firstHost} - ${res.lastHost}</span>
            </div>
            <div class="subnet-res-item">
                <span class="subnet-res-lbl">USABLE HOSTS / CLASS</span>
                <span class="subnet-res-val font-mono">${res.usableHosts} (${res.ipClass})</span>
            </div>
        `;
    }

    if (subnetIpInput) subnetIpInput.addEventListener('input', renderSubnetCalculation);
    if (subnetCidrSelect) subnetCidrSelect.addEventListener('change', renderSubnetCalculation);

    // OS selector tabs
    dnsOsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dnsOsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedDnsOs = tab.dataset.os;
            updateDnsScriptDisplay();
            if (window.SoundEngine) window.SoundEngine.click();
        });
    });

    if (btnCopyDnsCmd && dnsCmdDisplay) {
        btnCopyDnsCmd.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(dnsCmdDisplay.textContent);
                if (window.SoundEngine) window.SoundEngine.success();
                window.showToast('DNS setup script copied to clipboard!', 'success');
            } catch (e) {
                window.showToast('Failed to copy to clipboard', 'error');
            }
        });
    }

    // Repair action command copiers
    document.querySelectorAll('.btn-action-copy').forEach(btn => {
        btn.addEventListener('click', async () => {
            const cmd = btn.dataset.copy;
            try {
                await navigator.clipboard.writeText(cmd);
                if (window.SoundEngine) window.SoundEngine.success();
                window.showToast(`Command copied: "${cmd}"`, 'success');
            } catch (e) {
                window.showToast('Failed to copy', 'error');
            }
        });
    });

    if (btnRetestDns) {
        btnRetestDns.addEventListener('click', () => {
            if (window.networkConfigHub) {
                window.showToast('Testing DNS latencies...', 'info');
                if (window.SoundEngine) window.SoundEngine.click();
                window.networkConfigHub.runDnsBenchmark();
            }
        });
    }

    // Initialize Network Config Hub instance
    window.networkConfigHub = new NetworkConfigHub({
        onNetworkDetected: (data) => {
            if (netPublicIpEl) netPublicIpEl.textContent = data.publicIp;
            if (netIspEl) netIspEl.textContent = `ISP: ${data.isp}`;
            if (netAsnEl) netAsnEl.textContent = `ASN: ${data.asn}`;
            if (netCountryEl) netCountryEl.textContent = `Region: ${[data.city, data.country].filter(Boolean).join(', ')}`;
            if (netLocalIpEl) netLocalIpEl.textContent = data.localIp;
            if (netGatewayEl) netGatewayEl.textContent = data.gatewayIp;
            if (netIpv6El) netIpv6El.textContent = data.ipv6Supported ? 'IPv6: Active' : 'IPv6: Inactive';
            if (netEffectiveTypeEl) netEffectiveTypeEl.textContent = data.effectiveType;
            if (netDownlinkEl) netDownlinkEl.textContent = `Downlink: ${data.downlink}`;
            if (netRttEl) netRttEl.textContent = `RTT: ${data.rtt}`;
            if (btnLaunchGateway) btnLaunchGateway.href = `http://${data.gatewayIp}`;

            // Overview Deck updates
            const overviewLocalIp = document.getElementById('overview-net-local-ip');
            const overviewGateway = document.getElementById('overview-net-gateway');
            if (overviewLocalIp) overviewLocalIp.textContent = data.localIp;
            if (overviewGateway) overviewGateway.textContent = data.gatewayIp;

            // Also pass location info to News Hub
            if (window.newsHubEngine && data.country) {
                window.newsHubEngine.setLocation(data.country, data.country, data.city);
            }
        },
        onDnsBenchUpdate: (benchList) => {
            renderDnsBenchmark(benchList);
            updateDnsScriptDisplay();
        },
        onDnsBenchComplete: (benchList) => {
            renderDnsBenchmark(benchList);
            updateDnsScriptDisplay();
        }
    });

    // Populate Router default logins table
    if (routerRefTbody && window.networkConfigHub) {
        routerRefTbody.innerHTML = window.networkConfigHub.routerDatabase.map(r => `
            <tr>
                <td><strong>${r.brand}</strong></td>
                <td><code class="font-mono text-cyan">${r.gateway}</code></td>
                <td><code class="font-mono text-lime">${r.user}</code></td>
                <td><code class="font-mono text-amber">${r.pass}</code></td>
            </tr>
        `).join('');
    }

    renderSubnetCalculation();
    updateDnsScriptDisplay();

    // ----------------------------------------------------
    // 9. News Hub & Live Streaming Feeds Controller
    // ----------------------------------------------------
    const newsIframe = document.getElementById('news-live-iframe');
    const currentChannelName = document.getElementById('current-channel-name');
    const currentChannelCountry = document.getElementById('current-channel-country');
    const currentChannelDesc = document.getElementById('current-channel-desc');
    const liveChannelsList = document.getElementById('live-channels-list');
    const btnTheaterMode = document.getElementById('btn-theater-mode');
    const streamFrameContainer = document.getElementById('stream-frame-container');
    const customStreamInput = document.getElementById('custom-stream-input');
    const btnLoadCustomStream = document.getElementById('btn-load-custom-stream');

    const newsCardsGrid = document.getElementById('news-cards-grid');
    const newsCategoryPills = document.querySelectorAll('.news-cat-pill');
    const newsSearchInput = document.getElementById('news-search-input');
    const btnRefreshNews = document.getElementById('btn-refresh-news');
    const newsDetectedRegion = document.getElementById('news-detected-region');
    const breakingTickerMarquee = document.getElementById('breaking-ticker-marquee');
    const overviewNewsHeadline = document.getElementById('overview-news-headline');

    function renderLiveChannels(channels, activeId) {
        if (!liveChannelsList) return;
        liveChannelsList.innerHTML = channels.map(chan => {
            const isActive = chan.id === activeId;
            return `
                <div class="channel-card-item ${isActive ? 'active' : ''}" data-id="${chan.id}">
                    <span class="chan-flag">${chan.flag}</span>
                    <div class="chan-info">
                        <div class="chan-name">${chan.name}</div>
                        <div class="chan-country">${chan.country}</div>
                    </div>
                    <span class="chan-viewers">${chan.viewers}</span>
                </div>
            `;
        }).join('');

        liveChannelsList.querySelectorAll('.channel-card-item').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                if (window.newsHubEngine) {
                    window.newsHubEngine.setActiveChannel(id);
                    if (window.SoundEngine) window.SoundEngine.click();
                }
            });
        });
    }

    function renderNewsArticles(articles) {
        if (!newsCardsGrid) return;
        if (!articles || articles.length === 0) {
            newsCardsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No articles matching criteria</h3>
                    <p>Try searching another keyword or switch categories.</p>
                </div>
            `;
            return;
        }

        newsCardsGrid.innerHTML = articles.map(art => {
            const isBreaking = art.isBreaking;
            const isLocal = art.isLocal;
            const badgeClass = isBreaking ? 'badge-breaking' : (isLocal ? 'badge-local-art' : '');
            const badgeText = isBreaking ? 'BREAKING' : (isLocal ? 'LOCAL SPOTLIGHT' : art.category);

            return `
                <article class="news-card">
                    <div class="news-card-img-wrap">
                        <img src="${art.image}" alt="" class="news-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'">
                        <span class="news-cat-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="news-card-content">
                        <div class="news-meta-top">
                            <span class="news-source">${art.source}</span>
                            <span class="news-time font-mono">${art.timeAgo}</span>
                        </div>
                        <h4 class="news-card-title">${art.title}</h4>
                        <p class="news-card-summary">${art.summary || ''}</p>
                        <div class="news-card-footer">
                            <a href="${art.url}" target="_blank" rel="noopener noreferrer" class="btn-read-article">
                                <span>READ FULL STORY</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    function updateBreakingTicker(articles) {
        if (!breakingTickerMarquee || !articles || articles.length === 0) return;
        const headlines = articles.slice(0, 4).map(a => `<span class="ticker-item">⚡ ${a.title}</span>`).join(' &nbsp;&bull;&nbsp; ');
        breakingTickerMarquee.innerHTML = headlines;

        if (overviewNewsHeadline && articles.length > 0) {
            overviewNewsHeadline.textContent = articles[0].title;
        }
    }

    // Initialize News Hub Engine
    window.newsHubEngine = new NewsHubEngine({
        onLoading: (isLoading) => {
            if (btnRefreshNews) btnRefreshNews.classList.toggle('loading', isLoading);
        },
        onChannelChanged: (chan) => {
            if (newsIframe) newsIframe.src = chan.streamUrl;
            if (currentChannelName) currentChannelName.textContent = chan.name;
            if (currentChannelCountry) currentChannelCountry.textContent = `${chan.flag} ${chan.country}`;
            if (currentChannelDesc) currentChannelDesc.textContent = chan.desc;
            renderLiveChannels(window.newsHubEngine.liveChannels, chan.id);
            window.showToast(`Switched stream: ${chan.name}`, 'info');
        },
        onArticlesUpdated: (articles) => {
            renderNewsArticles(articles);
            updateBreakingTicker(window.newsHubEngine.articles);
            if (newsDetectedRegion) {
                newsDetectedRegion.textContent = window.newsHubEngine.userLocation.country;
            }
        }
    });

    // Theater mode toggle
    if (btnTheaterMode && streamFrameContainer) {
        btnTheaterMode.addEventListener('click', () => {
            streamFrameContainer.parentElement.classList.toggle('theater-mode');
            const isTheater = streamFrameContainer.parentElement.classList.contains('theater-mode');
            btnTheaterMode.querySelector('span').textContent = isTheater ? 'Default View' : 'Theater Mode';
            if (window.SoundEngine) window.SoundEngine.click();
        });
    }

    // Custom stream load
    if (btnLoadCustomStream && customStreamInput) {
        btnLoadCustomStream.addEventListener('click', () => {
            const url = customStreamInput.value.trim();
            if (url) {
                window.newsHubEngine.setCustomStream(url);
                customStreamInput.value = '';
                if (window.SoundEngine) window.SoundEngine.success();
                window.showToast('Loading custom stream feed...', 'success');
            }
        });
    }

    // News category filters
    newsCategoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            newsCategoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            window.newsHubEngine.setFilter(pill.dataset.category);
            if (window.SoundEngine) window.SoundEngine.click();
        });
    });

    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', () => {
            window.newsHubEngine.setSearch(newsSearchInput.value);
        });
    }

    if (btnRefreshNews) {
        btnRefreshNews.addEventListener('click', () => {
            window.showToast('Refreshing news wire...', 'info');
            if (window.SoundEngine) window.SoundEngine.click();
            window.newsHubEngine.fetchRealTimeArticles();
        });
    }

    renderLiveChannels(window.newsHubEngine.liveChannels, window.newsHubEngine.activeChannelId);
    renderNewsArticles(window.newsHubEngine.getFilteredArticles());
    updateBreakingTicker(window.newsHubEngine.articles);

    // Initial render
    renderLinks(linkAggregator.getFilteredLinks());
    updateCategoryBadges();
});
