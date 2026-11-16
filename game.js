/**
 * PaGamO Castle Conquest Simulator (城堡爭奪賽 - 總決賽)
 * 中排灣語競賽特別版 - 雙隊 (6人) / 四隊 (12人) 實戰競賽系統
 * 每隊 3 人 · 初始積分為 0 分 · GitHub Pages 零配置純前端支援
 * Author: Antigravity AI
 */

// ==================== Global Game State ====================
const Game = {
    config: {
        totalDuration: 1200, // 20 minutes = 1200 seconds
        correctEnergyCost: 6,
        wrongEnergyCost: 15,
        maxEnergy: 500, // 每位隊員各自獨立 500 點個人能量
        specialPoints: {
            castle: 100,
            bunker: 80,
            cannon: 50,
            island: 3,
            water: 3
        },
        correctAnswerPoints: 7,
        territoryPoints: 3
    },

    timeRemaining: 1200,
    timerInterval: null,
    isRunning: false,
    hasStarted: false,
    gameSpeed: 1,

    // Real-Time Room & Networking (1-5 區選項，預設第 1 區)
    roomId: 'room1',
    roomStates: {},
    floatingTexts: [],
    mqttClient: null,

    // Play Mode: 'TOURNAMENT' (預設: 比賽模式，按下開始比賽才可以開始進行占地、作答、計分) or 'PRACTICE' (練習模式: 隨時可作答)
    playMode: 'TOURNAMENT',

    // Match Mode: '1VS1' (2人), '2VS2' (4人), '2TEAMS' (6人), '4TEAMS' (12人)
    matchMode: '2TEAMS',
    activeTeamIds: ['T1', 'T5'], // Default: 望嘉勇士隊 vs 族夢隊

    // Current local player identity (0 = unseated before selecting)
    myPlayer: {
        name: '選手',
        teamId: '',
        slot: 0
    },
    currentTeamId: '',

    // 6 Teams (預設順序：望嘉勇士隊、望嘉小尖兵、望嘉先鋒隊、風那裡女團、族夢隊、戰鬥瘋隊)
    teams: {
        'T1': {
            id: 'T1',
            name: '望嘉勇士隊',
            alliance: '望嘉聯隊',
            allianceId: 'ALLIANCE_A',
            color: '#6c5ce7',
            lightColor: '#a29bfe',
            darkColor: '#2c2c54',
            badgeClass: 'badge-t1',
            icon: '🏹',
            energy: 1500,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 0,
            islandName: '北方海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null, energy: 500 },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null, energy: 500 },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null, energy: 500 }
            ]
        },
        'T2': {
            id: 'T2',
            name: '望嘉小尖兵',
            alliance: '望嘉聯隊',
            allianceId: 'ALLIANCE_A',
            color: '#27ae60',
            lightColor: '#2ecc71',
            darkColor: '#145a32',
            badgeClass: 'badge-t2',
            icon: '🛡️',
            energy: 1500,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 1,
            islandName: '東北海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null, energy: 500 },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null, energy: 500 },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null, energy: 500 }
            ]
        },
        'T3': {
            id: 'T3',
            name: '望嘉先鋒隊',
            alliance: '望嘉聯隊',
            allianceId: 'ALLIANCE_A',
            color: '#0984e3',
            lightColor: '#74b9ff',
            darkColor: '#0a3d62',
            badgeClass: 'badge-t3',
            icon: '⚡',
            energy: 1500,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 2,
            islandName: '東南海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null, energy: 500 },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null, energy: 500 },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null, energy: 500 }
            ]
        },
        'T4': {
            id: 'T4',
            name: '風那裡女團',
            alliance: '部落聯隊',
            allianceId: 'ALLIANCE_B',
            color: '#9b59b6',
            lightColor: '#e056fd',
            darkColor: '#512e5f',
            badgeClass: 'badge-t4',
            icon: '🌸',
            energy: 1500,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 3,
            islandName: '南方海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null, energy: 500 },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null, energy: 500 },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null, energy: 500 }
            ]
        },
        'T5': {
            id: 'T5',
            name: '族夢隊',
            alliance: '部落聯隊',
            allianceId: 'ALLIANCE_B',
            color: '#d63031',
            lightColor: '#ff7675',
            darkColor: '#78281f',
            badgeClass: 'badge-t5',
            icon: '🌟',
            energy: 1500,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 4,
            islandName: '西南海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null, energy: 500 },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null, energy: 500 },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null, energy: 500 }
            ]
        },
        'T6': {
            id: 'T6',
            name: '戰鬥瘋隊',
            alliance: '部落聯隊',
            allianceId: 'ALLIANCE_B',
            color: '#e67e22',
            lightColor: '#f39c12',
            darkColor: '#7e3805',
            badgeClass: 'badge-t6',
            icon: '⚔️',
            energy: 1500,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 5,
            islandName: '西北海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null, energy: 500 },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null, energy: 500 },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null, energy: 500 }
            ]
        }
    },

    // Map & Tiles
    map: null,
    tileOwners: {}, // key: "q,r" -> { teamId: "T1" }

    // Viewport camera
    camera: {
        x: 0,
        y: 0,
        zoom: 1.0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0
    },

    hoveredTileKey: null,
    selectedTargetKey: null,
    currentQuestion: null,

    // Dynamic Question Engine state (依據 25中排灣語_句型練習.pdf)
    questionPool: [],
    questionQueue: [],
    usedQuestionIds: new Set(),
    questionBankRound: 1,

    // Sprites
    sprites: {}
};
if (typeof window !== 'undefined') window.Game = Game;

// ==================== Cross-Device Real-Time Sync (MQTT over WebSocket + BroadcastChannel) ====================
let myClientId = '';
try {
    if (typeof sessionStorage !== 'undefined') {
        myClientId = sessionStorage.getItem('pagamo_client_id');
        if (!myClientId) {
            myClientId = 'C_' + Math.random().toString(36).substring(2, 9);
            sessionStorage.setItem('pagamo_client_id', myClientId);
        }
    } else {
        myClientId = 'C_' + Math.random().toString(36).substring(2, 9);
    }
} catch (e) {
    myClientId = 'C_' + Math.random().toString(36).substring(2, 9);
}
Game.myClientId = myClientId;
if (typeof window !== 'undefined') window.myClientId = myClientId;
let syncChannel = null;

// Utility: Shuffle Array
function shuffleArray(arr) {
    if (!arr || !arr.length) return [];
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a;
}

// 動態更新本局題庫（每次開局隨機全新抽選，題目絕不重複）
function refreshGameQuestionBank(silent = false) {
    if (typeof window.generatePaiwanQuestionBank === 'function') {
        Game.questionPool = window.generatePaiwanQuestionBank();
        window.QUESTION_BANK = Game.questionPool;
    } else {
        Game.questionPool = window.QUESTION_BANK || [];
    }
    Game.questionQueue = shuffleArray(Game.questionPool);
    Game.usedQuestionIds = new Set();
    Game.questionBankRound = (Game.questionBankRound || 1) + 1;

    if (!silent) {
        logBattle(`🎲 本局題庫已依據《25中排灣語_句型練習.pdf》全新隨機抽換完成（共 ${Game.questionPool.length} 題 · 無重複出題）！`);
    }

    const countBadge = document.getElementById('qbankCountBadge');
    if (countBadge) {
        countBadge.textContent = `共 ${Game.questionPool.length} 題（100% 依據《25中排灣語_句型練習.pdf》出題 · 第 ${Game.questionBankRound} 輪全新隨機抽題）`;
    }

    if (document.getElementById('qbankModal') && document.getElementById('qbankModal').style.display !== 'none') {
        renderQBankList('全部', '');
    }
}

function userRefreshQuestionBank() {
    refreshGameQuestionBank(false);
    broadcastSync({
        type: 'REFRESH_QUESTIONS'
    });
    if (window.soundManager) window.soundManager.playClick();
}

function addFloatingText(x, y, text, color = '#f1c40f', isBig = false) {
    if (!Game.floatingTexts) Game.floatingTexts = [];
    Game.floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        alpha: 1.0,
        scale: isBig ? 1.35 : 1.0,
        isBig: isBig,
        vy: -1.4,
        life: 65
    });
}

function updateSyncBadge(status, brokerName = '') {
    const badge = document.getElementById('syncStatusBadge');
    if (!badge) return;
    if (status === 'connected') {
        badge.innerHTML = `🟢 雲端競賽中 (${brokerName})`;
        badge.title = `已連線至雲端競賽伺服器 (${brokerName})，所有裝置即時同步！`;
        badge.style.background = 'rgba(46, 204, 113, 0.2)';
        badge.style.borderColor = '#2ecc71';
        badge.style.color = '#2ecc71';
    } else if (status === 'connecting') {
        badge.innerHTML = `🟡 連線伺服器中...`;
        badge.title = '正在連線雲端競賽伺服器...';
        badge.style.background = 'rgba(243, 156, 18, 0.2)';
        badge.style.borderColor = '#f39c12';
        badge.style.color = '#f1c40f';
    } else {
        badge.innerHTML = `🟠 區域/分頁模式`;
        badge.title = '目前處於本機/同網域分頁模式';
        badge.style.background = 'rgba(230, 126, 34, 0.2)';
        badge.style.borderColor = '#e67e22';
        badge.style.color = '#f39c12';
    }
}

function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        console.warn('MQTT library not loaded, falling back to local BroadcastChannel.');
        updateSyncBadge('local');
        return;
    }

    const brokers = [
        { url: 'wss://broker.emqx.io:8084/mqtt', name: 'EMQX' },
        { url: 'wss://broker.hivemq.com:8884/mqtt', name: 'HiveMQ' }
    ];
    let brokerIdx = 0;

    function tryConnect() {
        const target = brokers[brokerIdx];
        updateSyncBadge('connecting');

        try {
            const client = mqtt.connect(target.url, {
                clientId: 'pagamo_' + myClientId,
                clean: true,
                connectTimeout: 5000,
                reconnectPeriod: 4000
            });

            Game.mqttClient = client;

            client.on('connect', () => {
                console.log('Connected to MQTT Broker:', target.name, target.url);
                updateSyncBadge('connected', target.name);
                const topic = `pagamo/room/${Game.roomId}`;
                client.subscribe(topic, { qos: 0 }, (err) => {
                    if (!err) {
                        // Request state from peers in the room
                        broadcastSync({ type: 'REQUEST_SYNC_STATE' });
                        if (!Game.isSpectator && Game.myPlayer.slot > 0 && Game.teams[Game.currentTeamId]) {
                            broadcastSync({
                                type: 'JOIN_SLOT',
                                teamId: Game.currentTeamId,
                                slot: Game.myPlayer.slot,
                                playerName: Game.myPlayer.name,
                                clientId: myClientId
                            });
                        }
                    }
                });
            });

            client.on('message', (topic, message) => {
                try {
                    const payload = JSON.parse(message.toString());
                    if (payload && payload.senderId !== myClientId) {
                        handleIncomingSync(payload);
                    }
                } catch (e) {
                    console.error('MQTT message parse error:', e);
                }
            });

            client.on('error', (err) => {
                console.warn(`MQTT error on ${target.name}:`, err);
                client.end(true);
                if (brokerIdx < brokers.length - 1) {
                    brokerIdx++;
                    setTimeout(tryConnect, 1200);
                } else {
                    updateSyncBadge('offline');
                }
            });

            client.on('offline', () => {
                updateSyncBadge('offline');
            });
        } catch (e) {
            console.error('MQTT initialization error:', e);
            updateSyncBadge('offline');
        }
    }

    tryConnect();
}

function initNetworkSync() {
    // 1. BroadcastChannel for fast local inter-tab sync
    try {
        if (syncChannel) {
            try { syncChannel.close(); } catch(e){}
        }
        syncChannel = new BroadcastChannel('pagamo_finals_' + Game.roomId);
        syncChannel.onmessage = (event) => {
            if (event.data && event.data.senderId !== myClientId) {
                handleIncomingSync(event.data);
            }
        };
    } catch (e) {
        console.warn('BroadcastChannel not supported in this environment');
    }

    // 2. Storage event listener for legacy tab sync
    window.addEventListener('storage', (e) => {
        if (e.key === 'pagamo_sync_action' && e.newValue) {
            try {
                const data = JSON.parse(e.newValue);
                if (data && data.senderId !== myClientId && (!data.roomId || data.roomId === Game.roomId)) {
                    handleIncomingSync(data);
                }
            } catch (err) {}
        }
    });

    // 3. Connect to MQTT Cloud for cross-device live tournament
    connectMQTT();
}

function broadcastSync(data) {
    const payload = {
        ...data,
        senderId: myClientId,
        roomId: Game.roomId,
        ts: Date.now()
    };

    // 1. MQTT Publish
    if (Game.mqttClient && Game.mqttClient.connected) {
        try {
            const topic = `pagamo/room/${Game.roomId}`;
            Game.mqttClient.publish(topic, JSON.stringify(payload));
        } catch (e) {
            console.warn('MQTT publish error:', e);
        }
    }

    // 2. BroadcastChannel
    if (syncChannel) {
        try {
            syncChannel.postMessage(payload);
        } catch (e) {}
    }

    // 3. LocalStorage
    try {
        localStorage.setItem('pagamo_sync_action', JSON.stringify(payload));
    } catch (e) {}
}

function getRoomLabel(roomId) {
    const map = {
        'room1': '第 1 區',
        'room2': '第 2 區',
        'room3': '第 3 區',
        'room4': '第 4 區',
        'room5': '第 5 區',
        '1': '第 1 區',
        '2': '第 2 區',
        '3': '第 3 區',
        '4': '第 4 區',
        '5': '第 5 區'
    };
    return map[roomId] || `${roomId} 區`;
}

function promptChangeRoomId() {
    const cur = Game.roomId || 'room1';
    const num = prompt('請選擇競賽區域 (1-5 區)：', cur.replace('room', ''));
    if (num && num.trim()) {
        switchRoom(num.trim());
    }
}

function saveCurrentRoomState() {
    if (!Game.roomId) return;
    if (!Game.roomStates) Game.roomStates = {};
    Game.roomStates[Game.roomId] = {
        playMode: Game.playMode,
        matchMode: Game.matchMode,
        activeTeamIds: [...Game.activeTeamIds],
        isRunning: Boolean(Game.isRunning),
        hasStarted: Boolean(Game.hasStarted),
        timeRemaining: typeof Game.timeRemaining === 'number' ? Game.timeRemaining : (Game.config.totalDuration || 1200),
        tileOwners: { ...Game.tileOwners },
        teams: JSON.parse(JSON.stringify(Game.teams)),
        savedAt: Date.now()
    };
    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('pagamo_room_state_' + Game.roomId, JSON.stringify(Game.roomStates[Game.roomId]));
        }
    } catch (e) {}
}

function loadRoomState(roomId) {
    if (!roomId) return null;
    if (Game.roomStates && Game.roomStates[roomId]) {
        return Game.roomStates[roomId];
    }
    try {
        if (typeof sessionStorage !== 'undefined') {
            const raw = sessionStorage.getItem('pagamo_room_state_' + roomId);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (!Game.roomStates) Game.roomStates = {};
                Game.roomStates[roomId] = parsed;
                return parsed;
            }
        }
    } catch (e) {}
    return null;
}

function switchRoom(newRoomId) {
    if (!newRoomId) return;
    if (/^[1-5]$/.test(newRoomId)) newRoomId = 'room' + newRoomId;
    if (newRoomId === Game.roomId) return;

    // 1. Save old room's state snapshot before departing
    const oldRoomId = Game.roomId;
    saveCurrentRoomState();

    // 2. STOP running timer interval from old room immediately
    if (Game.timerInterval) {
        clearInterval(Game.timerInterval);
        Game.timerInterval = null;
    }

    // 3. Switch active roomId
    const oldTopic = `pagamo/room/${oldRoomId}`;
    Game.roomId = newRoomId;

    try {
        localStorage.setItem('pagamo_room_id', newRoomId);
        const url = new URL(window.location.href);
        url.searchParams.set('room', newRoomId);
        window.history.replaceState({}, '', url.toString());
    } catch (e) {}

    // 4. Close any opened modals from previous room
    const resModal = document.getElementById('resultsModal');
    if (resModal) resModal.style.display = 'none';
    const qModal = document.getElementById('questionModal');
    if (qModal) qModal.style.display = 'none';

    // Vacate previous seat in old room if leaving
    if (!Game.isSpectator && isCurrentUserSeated() && Game.currentTeamId && Game.myPlayer.slot > 0) {
        const oldTeam = Game.teams[Game.currentTeamId];
        if (oldTeam && oldTeam.members && oldTeam.members[Game.myPlayer.slot - 1]) {
            if (oldTeam.members[Game.myPlayer.slot - 1].clientId === myClientId) {
                oldTeam.members[Game.myPlayer.slot - 1].isOccupied = false;
                oldTeam.members[Game.myPlayer.slot - 1].clientId = null;
            }
        }
    }

    // 5. Load or Initialize the new room's state as an independent match!
    const savedState = loadRoomState(newRoomId);

    if (!savedState) {
        // ==========================================
        // BRAND NEW MATCH FOR THIS ZONE (全新的獨立比賽)
        // ==========================================
        Game.isRunning = false;
        Game.hasStarted = false;
        Game.timeRemaining = Game.config.totalDuration || 1200;
        Game.playMode = 'TOURNAMENT';

        // Reset play button
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) {
            playBtn.innerHTML = '▶️ 開始比賽';
            playBtn.className = 'wood-btn btn-gold';
            playBtn.title = '裁判/老師點擊可同步啟動全體選手倒數計時';
        }

        // Reset all teams, scores to 0, member energies to 500
        Object.values(Game.teams).forEach(t => {
            t.correctCount = 0;
            t.wrongCount = 0;
            if (t.members) {
                t.members.forEach(m => {
                    m.energy = 500;
                    m.isOccupied = false;
                    m.clientId = null;
                });
            }
            t.energy = 500 * (t.members ? t.members.length : 3);
        });

        // In a brand new zone: DO NOT preset player to Team 1 Slot 1! Player starts unseated.
        if (!Game.isSpectator) {
            Game.myPlayer.slot = 0;
            Game.currentTeamId = '';
            Game.myPlayer.teamId = '';
            try {
                localStorage.removeItem('pagamo_logged_in_team');
                localStorage.removeItem('pagamo_logged_in_slot');
            } catch (e) {}
        }

        // Initialize fresh map state for this zone
        initMapState(false);

        // Shuffle a fresh question bank
        refreshGameQuestionBank(true);
    } else {
        // ==========================================
        // RESTORE SAVED MATCH FOR THIS ZONE
        // ==========================================
        Game.playMode = savedState.playMode || 'TOURNAMENT';
        Game.matchMode = savedState.matchMode || '2TEAMS';
        if (Array.isArray(savedState.activeTeamIds) && savedState.activeTeamIds.length > 0) {
            Game.activeTeamIds = [...savedState.activeTeamIds];
        }
        Game.tileOwners = { ...savedState.tileOwners };
        if (savedState.teams) {
            Game.teams = JSON.parse(JSON.stringify(savedState.teams));
        }
        Game.timeRemaining = typeof savedState.timeRemaining === 'number' ? savedState.timeRemaining : (Game.config.totalDuration || 1200);
        Game.hasStarted = Boolean(savedState.hasStarted);
        Game.isRunning = false; // Always paused on arrival, user can resume or start

        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) {
            if (Game.playMode === 'TOURNAMENT') {
                playBtn.innerHTML = Game.hasStarted ? '▶️ 繼續比賽' : '▶️ 開始比賽';
                playBtn.className = 'wood-btn btn-gold';
            } else {
                playBtn.innerHTML = '📖 練習中(隨時作答)';
                playBtn.className = 'wood-btn';
            }
        }

        // In restored zone: only re-seat if this client was already seated here before!
        if (!Game.isSpectator) {
            let foundTeam = null;
            let foundSlot = 0;
            if (savedState.teams) {
                Object.values(savedState.teams).forEach(t => {
                    if (t.members) {
                        t.members.forEach((m, idx) => {
                            if (m.clientId === myClientId && m.isOccupied) {
                                foundTeam = t.id;
                                foundSlot = idx + 1;
                            }
                        });
                    }
                });
            }
            if (foundTeam && foundSlot > 0) {
                Game.currentTeamId = foundTeam;
                Game.myPlayer.teamId = foundTeam;
                Game.myPlayer.slot = foundSlot;
            } else {
                Game.myPlayer.slot = 0;
                Game.currentTeamId = '';
                Game.myPlayer.teamId = '';
                try {
                    localStorage.removeItem('pagamo_logged_in_team');
                    localStorage.removeItem('pagamo_logged_in_slot');
                } catch (e) {}
            }
        }
    }

    // 6. Update UI, dropdowns, and timer display
    const roomSelect = document.getElementById('roomSelect');
    if (roomSelect) roomSelect.value = newRoomId;
    const cfgRoomSelect = document.getElementById('cfgRoomSelect');
    if (cfgRoomSelect) cfgRoomSelect.value = newRoomId;

    const navPlayModeSel = document.getElementById('playModeSelect');
    if (navPlayModeSel) navPlayModeSel.value = Game.playMode;
    const cfgPlayModeSel = document.getElementById('cfgPlayMode');
    if (cfgPlayModeSel) cfgPlayModeSel.value = Game.playMode;

    const roomBtns = document.querySelectorAll('.room-toggle-btn');
    roomBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-room') === newRoomId);
    });

    updateTimerDisplay();
    updateUI();
    renderTeamSelectCards();
    renderTeamSelectorBar();
    renderCfgTeamSelector();
    resetCamera();

    // 7. Subscribe to new MQTT topic
    if (Game.mqttClient && Game.mqttClient.connected) {
        try { Game.mqttClient.unsubscribe(oldTopic); } catch(e){}
        const newTopic = `pagamo/room/${Game.roomId}`;
        Game.mqttClient.subscribe(newTopic, () => {
            broadcastSync({ type: 'REQUEST_SYNC_STATE' });
            if (!Game.isSpectator && isCurrentUserSeated() && Game.myPlayer.slot > 0 && Game.teams[Game.currentTeamId]) {
                broadcastSync({
                    type: 'JOIN_SLOT',
                    teamId: Game.currentTeamId,
                    slot: Game.myPlayer.slot,
                    playerName: Game.myPlayer.name,
                    clientId: myClientId
                });
            }
        });
    }

    // 8. Open new BroadcastChannel
    if (syncChannel) {
        try { syncChannel.close(); } catch(e){}
    }
    try {
        syncChannel = new BroadcastChannel('pagamo_finals_' + Game.roomId);
        syncChannel.onmessage = (event) => {
            if (event.data && event.data.senderId !== myClientId) {
                handleIncomingSync(event.data);
            }
        };
    } catch(e){}

    const label = getRoomLabel(newRoomId);
    const mins = Math.floor(Game.timeRemaining / 60);
    const secs = Game.timeRemaining % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    logBattle(`🏟️ 已切換進入競賽區域：【${label}】！此區域為獨立競賽場，比賽時間【${timeFormatted}】！`);

    // 9. Request state from any existing peers in this zone
    broadcastSync({ type: 'REQUEST_SYNC_STATE' });
    if (!Game.isSpectator && isCurrentUserSeated() && Game.myPlayer.slot > 0 && Game.teams[Game.currentTeamId]) {
        broadcastSync({
            type: 'JOIN_SLOT',
            teamId: Game.currentTeamId,
            slot: Game.myPlayer.slot,
            playerName: Game.myPlayer.name,
            clientId: myClientId
        });
    }
}

function handleIncomingSync(data) {
    if (!data || !data.type) return;
    if (data.roomId && data.roomId !== Game.roomId) return;

    if (data.type === 'CAPTURE') {
        const { teamId, tileKey, memberSlot, memberEnergy, energy, correctCount, playerName, pointsAdded } = data;
        if (Game.teams[teamId]) {
            if (typeof memberSlot === 'number' && Game.teams[teamId].members && Game.teams[teamId].members[memberSlot - 1]) {
                Game.teams[teamId].members[memberSlot - 1].energy = (typeof memberEnergy === 'number') ? memberEnergy : Math.max(0, (Game.teams[teamId].members[memberSlot - 1].energy || 500) - Game.config.correctEnergyCost);
            }
            Game.teams[teamId].energy = Game.teams[teamId].members.reduce((sum, m) => sum + (m.energy || 0), 0);
            if (typeof correctCount === 'number') Game.teams[teamId].correctCount = correctCount;
        }
        Game.tileOwners[tileKey] = {
            teamId,
            memberSlot: (typeof memberSlot === 'number') ? memberSlot : 1
        };
        const team = Game.teams[teamId];
        const tile = Game.map ? Game.map.tiles[tileKey] : null;
        let typeName = '領地';
        if (tile) {
            if (tile.type === 'castle') {
                typeName = '👑 核心城堡';
                window.soundManager.playCaptureCastle();
                showCastleCaptureBanner(team ? team.name : teamId, playerName || '選手');
            } else if (tile.type === 'bunker') {
                typeName = '🏯 碉堡';
                window.soundManager.playCorrect();
            } else if (tile.type === 'cannon') {
                typeName = '🎯 砲台';
                window.soundManager.playCorrect();
            } else {
                window.soundManager.playCorrect();
            }
            const [tq, tr] = tileKey.split(',').map(Number);
            const worldPos = hexToWorld(tq, tr);
            const pts = pointsAdded || (tile.type === 'castle' ? 107 : (tile.type === 'bunker' ? 87 : (tile.type === 'cannon' ? 57 : 10)));
            addFloatingText(worldPos.x, worldPos.y - 20, `+${pts}分!`, team ? team.lightColor : '#f1c40f', pts >= 50);
        }
        logBattle(`⚔️【${team ? team.name : teamId}】${playerName ? `(${playerName})` : ''} 攻佔了 ${typeName}！`);
        updateUI();
    } else if (data.type === 'WRONG_ANSWER') {
        const { teamId, memberSlot, memberEnergy, energy, wrongCount, playerName, tileKey } = data;
        if (Game.teams[teamId]) {
            if (typeof memberSlot === 'number' && Game.teams[teamId].members && Game.teams[teamId].members[memberSlot - 1]) {
                Game.teams[teamId].members[memberSlot - 1].energy = (typeof memberEnergy === 'number') ? memberEnergy : Math.max(0, (Game.teams[teamId].members[memberSlot - 1].energy || 500) - Game.config.wrongEnergyCost);
            }
            Game.teams[teamId].energy = Game.teams[teamId].members.reduce((sum, m) => sum + (m.energy || 0), 0);
            if (typeof wrongCount === 'number') Game.teams[teamId].wrongCount = wrongCount;
        }
        if (tileKey && Game.map && Game.map.tiles[tileKey]) {
            const [tq, tr] = tileKey.split(',').map(Number);
            const worldPos = hexToWorld(tq, tr);
            addFloatingText(worldPos.x, worldPos.y - 15, '⚡ -15 答錯', '#ff7675', false);
        }
        window.soundManager.playWrong();
        logBattle(`❌【${Game.teams[teamId] ? Game.teams[teamId].name : teamId}】${playerName ? `(${playerName})` : ''} 答錯題目 (-15個人能量)`);
        updateUI();
    } else if (data.type === 'START_MATCH') {
        if (Game.playMode === 'PRACTICE') {
            Game.playMode = 'TOURNAMENT';
            const navSel = document.getElementById('playModeSelect');
            if (navSel) navSel.value = 'TOURNAMENT';
            const cfgSel = document.getElementById('cfgPlayMode');
            if (cfgSel) cfgSel.value = 'TOURNAMENT';
        }
        if (!Game.isRunning) {
            startMatch(false);
        }
        if (typeof data.timeRemaining === 'number') {
            Game.timeRemaining = data.timeRemaining;
            updateTimerDisplay();
        }
        window.soundManager.playCorrect();
        logBattle('📢 比賽正式開始！全體選手同步倒數！');
    } else if (data.type === 'PAUSE_MATCH') {
        if (Game.isRunning) {
            pauseMatch(false);
        }
        if (typeof data.timeRemaining === 'number') {
            Game.timeRemaining = data.timeRemaining;
            updateTimerDisplay();
        }
        logBattle('⏸️ 比賽由裁判暫停');
    } else if (data.type === 'TIMER_TICK') {
        if (typeof data.timeRemaining === 'number') {
            if (Math.abs(Game.timeRemaining - data.timeRemaining) > 1) {
                Game.timeRemaining = data.timeRemaining;
                updateTimerDisplay();
            }
        }
    } else if (data.type === 'JOIN_SLOT') {
        const { teamId, slot, playerName, prevTeamId, prevSlot, clientId } = data;
        const targetTeam = Game.teams[teamId];
        const targetMember = (targetTeam && targetTeam.members) ? targetTeam.members[slot - 1] : null;

        // Anti-Hijack Guard: If this slot is ALREADY occupied by another client, REJECT!
        if (targetMember && targetMember.isOccupied && targetMember.clientId && targetMember.clientId !== clientId) {
            console.warn(`[Anti-Hijack] Rejected unauthorized JOIN_SLOT from ${clientId} for occupied slot ${teamId}-${slot}`);
            if (targetMember.clientId === myClientId) {
                broadcastSync({
                    type: 'JOIN_SLOT',
                    teamId: teamId,
                    slot: slot,
                    playerName: Game.myPlayer.name,
                    clientId: myClientId
                });
            }
            return;
        }

        // Capacity Guard: If the match is already full of other players, reject new joins!
        if (clientId && (!targetMember || (!targetMember.isOccupied && isMatchFull()))) {
            console.warn(`[Capacity-Guard] Rejected JOIN_SLOT from ${clientId} because match is full!`);
            return;
        }

        // 1. Vacate previous slot if provided
        if (prevTeamId && prevSlot && Game.teams[prevTeamId] && Game.teams[prevTeamId].members && Game.teams[prevTeamId].members[prevSlot - 1]) {
            Game.teams[prevTeamId].members[prevSlot - 1].isOccupied = false;
            Game.teams[prevTeamId].members[prevSlot - 1].clientId = null;
        }
        // 2. Also if this clientId already occupied any other slot, vacate that slot to avoid duplicate ghost seats
        if (clientId) {
            Object.values(Game.teams).forEach(t => {
                if (t.members) {
                    t.members.forEach(m => {
                        if (m.clientId === clientId && (t.id !== teamId || m.slot !== slot)) {
                            m.isOccupied = false;
                            m.clientId = null;
                        }
                    });
                }
            });
        }
        // 3. Occupy the new slot
        if (Game.teams[teamId] && Game.teams[teamId].members && Game.teams[teamId].members[slot - 1]) {
            Game.teams[teamId].members[slot - 1].name = playerName || `選手 ${slot}`;
            Game.teams[teamId].members[slot - 1].isOccupied = true;
            Game.teams[teamId].members[slot - 1].clientId = clientId || null;
        }
        // If this device was default-pointing or sitting in this slot, but another client legitimately claimed it, evict local player from this slot
        if (!Game.isSpectator && Game.currentTeamId === teamId && Game.myPlayer.slot === slot && clientId && clientId !== myClientId) {
            Game.myPlayer.slot = 0;
            try { localStorage.removeItem('pagamo_logged_in_slot'); } catch(e){}
        }
        renderTeamSelectCards();
        updateUI();
        if (playerName && Game.teams[teamId]) {
            logBattle(`👤【${Game.teams[teamId].name}】席位 ${slot} 已由選手【${playerName}】選定入座！`);
        }
    } else if (data.type === 'VACATE_SLOT') {
        const { teamId, slot, clientId } = data;
        if (teamId && slot && Game.teams[teamId] && Game.teams[teamId].members && Game.teams[teamId].members[slot - 1]) {
            Game.teams[teamId].members[slot - 1].isOccupied = false;
            Game.teams[teamId].members[slot - 1].clientId = null;
        }
        if (clientId) {
            Object.values(Game.teams).forEach(t => {
                if (t.members) {
                    t.members.forEach(m => {
                        if (m.clientId === clientId) {
                            m.isOccupied = false;
                            m.clientId = null;
                        }
                    });
                }
            });
        }
        renderTeamSelectCards();
        updateUI();
    } else if (data.type === 'RESET_ALL_SEATS') {
        resetAllSeats(false);
    } else if (data.type === 'PLAY_MODE_CHANGE') {
        if (data.playMode && data.playMode !== Game.playMode) {
            switchPlayMode(data.playMode, false);
        }
    } else if (data.type === 'MODE_CHANGE') {
        if (Array.isArray(data.activeTeamIds) && data.activeTeamIds.length > 0) {
            Game.activeTeamIds = data.activeTeamIds;
        }
        switchMatchMode(data.mode, false);
    } else if (data.type === 'TEAMS_CHANGE') {
        if (Array.isArray(data.activeTeamIds) && data.activeTeamIds.length > 0) {
            Game.activeTeamIds = data.activeTeamIds;
            if (isCurrentUserSeated() && !Game.activeTeamIds.includes(Game.currentTeamId)) {
                Game.currentTeamId = '';
                Game.myPlayer.teamId = '';
                Game.myPlayer.slot = 0;
            } else if (!isCurrentUserSeated()) {
                Game.currentTeamId = '';
                Game.myPlayer.teamId = '';
                Game.myPlayer.slot = 0;
            }
            initMapState(false);
            updateUI();
            renderTeamSelectorBar();
            renderCfgTeamSelector();
            renderTeamSelectCards();
            logBattle('🚩 同區域已同步出戰隊伍設定！');
        }
    } else if (data.type === 'RESET_MATCH') {
        restartMatch(false);
    } else if (data.type === 'REFRESH_QUESTIONS') {
        refreshGameQuestionBank(true);
        logBattle(`🔄 題庫已依據《25中排灣語_句型練習.pdf》同步重新抽題！全場本局題目已煥然一新！`);
    } else if (data.type === 'END_MATCH') {
        endMatch(false);
    } else if (data.type === 'REQUEST_SYNC_STATE') {
        const snapshot = {
            playMode: Game.playMode,
            matchMode: Game.matchMode,
            activeTeamIds: Game.activeTeamIds,
            isRunning: Game.isRunning,
            timeRemaining: Game.timeRemaining,
            tileOwners: Game.tileOwners,
            teams: {}
        };
        Object.entries(Game.teams).forEach(([id, t]) => {
            snapshot.teams[id] = {
                energy: t.energy,
                correctCount: t.correctCount,
                wrongCount: t.wrongCount,
                members: t.members ? t.members.map(m => ({
                    slot: m.slot,
                    name: m.name,
                    energy: m.energy,
                    isOccupied: Boolean(m.isOccupied),
                    clientId: m.clientId || null
                })) : []
            };
        });
        broadcastSync({
            type: 'SYNC_STATE_RESPONSE',
            targetId: data.senderId,
            snapshot: snapshot
        });
    } else if (data.type === 'SYNC_STATE_RESPONSE') {
        if (data.targetId && data.targetId !== myClientId) return;
        const s = data.snapshot;
        if (!s) return;
        if (s.playMode && s.playMode !== Game.playMode) {
            switchPlayMode(s.playMode, false);
        }
        if (s.matchMode && s.matchMode !== Game.matchMode) {
            switchMatchMode(s.matchMode, false);
        }
        if (s.tileOwners) {
            Game.tileOwners = { ...s.tileOwners };
        }
        if (s.teams) {
            Object.entries(s.teams).forEach(([id, tData]) => {
                if (Game.teams[id]) {
                    if (tData.members && Array.isArray(tData.members)) {
                        tData.members.forEach((remoteMem, idx) => {
                            const localMem = Game.teams[id].members ? Game.teams[id].members[idx] : null;
                            if (localMem) {
                                const isMyLocalSlot = !Game.isSpectator && Game.currentTeamId === id && Game.myPlayer.slot === (idx + 1);
                                if (!isMyLocalSlot) {
                                    localMem.isOccupied = Boolean(remoteMem.isOccupied);
                                    localMem.clientId = remoteMem.clientId || null;
                                    if (remoteMem.name) localMem.name = remoteMem.name;
                                }
                                if (typeof remoteMem.energy === 'number') {
                                    localMem.energy = remoteMem.energy;
                                }
                            }
                        });
                    }
                    Game.teams[id].energy = Game.teams[id].members ? Game.teams[id].members.reduce((sum, m) => sum + (m.energy || 0), 0) : tData.energy;
                    Game.teams[id].correctCount = tData.correctCount;
                    Game.teams[id].wrongCount = tData.wrongCount;
                }
            });
        }
        if (typeof s.timeRemaining === 'number') {
            Game.timeRemaining = s.timeRemaining;
            updateTimerDisplay();
        }
        if (s.isRunning && !Game.isRunning) {
            startMatch(false);
        } else if (!s.isRunning && Game.isRunning) {
            pauseMatch(false);
        }
        renderTeamSelectCards();
        updateUI();
        logBattle('🌐 已成功與同區域比賽進度即時同步！');
    }
}

// ==================== Asset Loading (With Embedded Fallback) ====================
function initAssets(callback) {
    // 1. Immediately preload from window.EMBEDDED_SPRITES so sprites are NEVER undefined
    if (typeof window !== 'undefined' && window.EMBEDDED_SPRITES) {
        for (const [key, dataUri] of Object.entries(window.EMBEDDED_SPRITES)) {
            const fbImg = new Image();
            fbImg.src = dataUri;
            Game.sprites[key] = fbImg;
        }
    }

    // 2. Also attempt loading high-res assets from assets/ if available on server
    const assetsToLoad = {
        'bunker': 'assets/bunker_transparent.png',
        'cannon': 'assets/cannon_transparent.png',
        'castle_cluster': 'assets/castle_cluster_clean.png',
        'shovel_pin': 'assets/shovel_pin_transparent.png',
        'battle_icon': 'assets/battle_icon_transparent.png',
        'water_tile': 'assets/water_clean.png',
        'hourglass': 'assets/hourglass_timer_transparent.png'
    };

    let loaded = 0;
    const total = Object.keys(assetsToLoad).length;

    for (const [key, src] of Object.entries(assetsToLoad)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            Game.sprites[key] = img;
            loaded++;
            if (loaded === total && callback) callback();
        };
        img.onerror = () => {
            // External file 404: use embedded data URI
            if (!Game.sprites[key] && window.EMBEDDED_SPRITES && window.EMBEDDED_SPRITES[key]) {
                const fbImg = new Image();
                fbImg.src = window.EMBEDDED_SPRITES[key];
                Game.sprites[key] = fbImg;
            }
            loaded++;
            if (loaded === total && callback) callback();
        };
    }
}

// ==================== Play Mode (比賽模式 vs 練習模式) ====================
function switchPlayMode(mode, shouldBroadcast = true) {
    if (mode !== 'TOURNAMENT' && mode !== 'PRACTICE') return;
    Game.playMode = mode;

    // 同步更新導航列與設定下拉選單
    const navSel = document.getElementById('playModeSelect');
    if (navSel) navSel.value = mode;

    const cfgSel = document.getElementById('cfgPlayMode');
    if (cfgSel) cfgSel.value = mode;

    // 同步更新選隊彈窗中的分頁按鈕樣式
    const btnTourn = document.getElementById('playModeBtnTourn');
    const btnPract = document.getElementById('playModeBtnPract');
    if (btnTourn && btnPract) {
        btnTourn.classList.toggle('active', mode === 'TOURNAMENT');
        btnPract.classList.toggle('active', mode === 'PRACTICE');
    }

    const timerTitle = document.querySelector('.timer-title');
    const timerDigits = document.getElementById('timerDigits');
    const timerUnit = document.querySelector('.timer-unit');
    const playBtn = document.getElementById('playPauseBtn');

    if (mode === 'PRACTICE') {
        // 練習模式：暫停比賽倒數，允許隨時作答
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        Game.isRunning = false;

        if (timerTitle) timerTitle.textContent = '練習狀態';
        if (timerDigits) {
            timerDigits.textContent = '自由練習';
            timerDigits.style.fontSize = '14px';
        }
        if (timerUnit) timerUnit.style.display = 'none';

        if (playBtn) {
            playBtn.innerHTML = '📖 練習中(隨時作答)';
            playBtn.className = 'wood-btn';
            playBtn.title = '練習模式：隨時點擊相鄰領地即可作答。點擊可切換至比賽模式';
        }

        logBattle('📖 已切換至【練習模式】！全體選手可隨時點選相鄰土地自由作答、開拓領地！');
    } else {
        // 比賽模式（預設）：按下「開始比賽」方可開始進行占地、作答與計分
        Game.isRunning = false;
        Game.hasStarted = false;
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }

        if (timerTitle) timerTitle.textContent = '比賽剩餘';
        if (timerDigits) {
            timerDigits.style.fontSize = '';
        }
        if (timerUnit) timerUnit.style.display = '';
        updateTimerDisplay();

        if (playBtn) {
            playBtn.innerHTML = '▶️ 開始比賽';
            playBtn.className = 'wood-btn btn-gold';
            playBtn.title = '裁判/老師點擊可同步啟動全體選手倒數計時';
        }

        logBattle('🏆 已切換至【比賽模式】！按下右上角「▶️ 開始比賽」後方可開始進行占地、作答與計分！');
    }

    updateUI();

    if (shouldBroadcast) {
        broadcastSync({
            type: 'PLAY_MODE_CHANGE',
            playMode: mode
        });
    }
}

// ==================== Match Mode & Pre-Match Team Selection ====================
const ALL_TEAMS_ORDER = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
if (typeof window !== 'undefined') {
    window.ALL_TEAMS_ORDER = ALL_TEAMS_ORDER;
}

function getModeMaxSlots(mode = Game.matchMode) {
    if (mode === '1VS1') return 1;
    if (mode === '2VS2') return 2;
    return 3;
}

function getMatchSeatCapacity() {
    const maxSlots = getModeMaxSlots();
    return maxSlots * (Game.activeTeamIds ? Game.activeTeamIds.length : 2);
}

function getOccupiedSeatsCount() {
    const maxSlots = getModeMaxSlots();
    let count = 0;
    (Game.activeTeamIds || []).forEach(tId => {
        const t = Game.teams[tId];
        if (t && t.members) {
            for (let i = 0; i < maxSlots; i++) {
                if (t.members[i] && t.members[i].isOccupied) count++;
            }
        }
    });
    return count;
}

function isMatchFull() {
    return getOccupiedSeatsCount() >= getMatchSeatCapacity();
}

function isCurrentUserSeated() {
    if (Game.isSpectator) return false;
    if (!Game.currentTeamId || !Game.myPlayer || !Game.myPlayer.slot || Game.myPlayer.slot < 1) return false;
    const t = Game.teams[Game.currentTeamId];
    if (!t || !t.members) return false;
    const m = t.members[Game.myPlayer.slot - 1];
    return Boolean(m && m.isOccupied && m.clientId === myClientId);
}

function switchMatchMode(mode, shouldBroadcast = true) {
    if (mode !== '1VS1' && mode !== '2VS2' && mode !== '2TEAMS' && mode !== '4TEAMS') return;
    Game.matchMode = mode;

    if (mode === '4TEAMS') {
        // 4 Teams (3 players per team = 12 players)
        if (!Array.isArray(Game.activeTeamIds) || Game.activeTeamIds.length !== 4) {
            Game.activeTeamIds = ['T1', 'T2', 'T3', 'T4'];
        }
    } else {
        // 2 Teams (1VS1: 2 players; 2VS2: 4 players; 2TEAMS: 6 players)
        if (!Array.isArray(Game.activeTeamIds) || Game.activeTeamIds.length !== 2) {
            Game.activeTeamIds = ['T1', 'T5']; // 望嘉勇士隊 VS 族夢隊
        }
    }

    const maxSlots = getModeMaxSlots(mode);

    // When switching match mode, DO NOT preset user into Team 1 Slot 1!
    if (isCurrentUserSeated()) {
        if (!Game.activeTeamIds.includes(Game.currentTeamId) || Game.myPlayer.slot > maxSlots) {
            const prevTeam = Game.teams[Game.currentTeamId];
            if (prevTeam && prevTeam.members && prevTeam.members[Game.myPlayer.slot - 1]) {
                prevTeam.members[Game.myPlayer.slot - 1].isOccupied = false;
                prevTeam.members[Game.myPlayer.slot - 1].clientId = null;
            }
            Game.currentTeamId = '';
            Game.myPlayer.teamId = '';
            Game.myPlayer.slot = 0;
            try {
                localStorage.removeItem('pagamo_logged_in_team');
                localStorage.removeItem('pagamo_logged_in_slot');
            } catch (e) {}
        }
    } else {
        Game.currentTeamId = '';
        Game.myPlayer.teamId = '';
        Game.myPlayer.slot = 0;
    }

    // Update Mode Select Dropdown & Buttons
    const selectEl = document.getElementById('matchModeSelect');
    if (selectEl) selectEl.value = mode;

    const cfgModeEl = document.getElementById('cfgMatchMode');
    if (cfgModeEl) cfgModeEl.value = mode;

    const btn1v1 = document.getElementById('modeBtn1v1');
    const btn2v2 = document.getElementById('modeBtn2v2');
    const btn2 = document.getElementById('modeBtn2');
    const btn4 = document.getElementById('modeBtn4');
    if (btn1v1) btn1v1.classList.toggle('active', mode === '1VS1');
    if (btn2v2) btn2v2.classList.toggle('active', mode === '2VS2');
    if (btn2) btn2.classList.toggle('active', mode === '2TEAMS');
    if (btn4) btn4.classList.toggle('active', mode === '4TEAMS');

    initMapState(false);
    updateUI();
    renderTeamSelectorBar();
    renderCfgTeamSelector();
    renderTeamSelectCards();

    let modeDesc = '';
    if (mode === '1VS1') modeDesc = '1對1 模式 (2隊 · 各1人單挑 · 2座島嶼 · 2人同場)';
    else if (mode === '2VS2') modeDesc = '2對2 模式 (2隊 · 各2人同心 · 4座島嶼 · 4人同場)';
    else if (mode === '2TEAMS') modeDesc = '雙隊對決 (2隊 · 各3人標準 · 6座島嶼 · 6人同場)';
    else modeDesc = '四隊爭霸 (4隊 · 各3人共鬥 · 12座島嶼 · 12人同場)';

    logBattle(`⚙️ 賽制切換為：【${modeDesc}】，每位選手能量 500 點，初始總積分皆為 0 分！`);

    if (shouldBroadcast) {
        broadcastSync({
            type: 'MODE_CHANGE',
            mode: mode,
            activeTeamIds: Game.activeTeamIds
        });
    }
}

function changeActiveTeam(teamIndex, newTeamId, shouldBroadcast = true) {
    if (!Game.teams[newTeamId]) return;
    if (Game.activeTeamIds[teamIndex] === newTeamId) return;

    // Prevent duplicate team: Swap if newTeamId already selected by another slot
    const existingIndex = Game.activeTeamIds.indexOf(newTeamId);
    if (existingIndex !== -1) {
        const oldTeamId = Game.activeTeamIds[teamIndex];
        Game.activeTeamIds[existingIndex] = oldTeamId;
    }
    Game.activeTeamIds[teamIndex] = newTeamId;

    // When changing active teams for the matchup, DO NOT preset user into Team 1 Slot 1!
    // If player was seated in a team that was replaced, vacate and reset to unseated.
    if (isCurrentUserSeated() && !Game.activeTeamIds.includes(Game.currentTeamId)) {
        const prevTeam = Game.teams[Game.currentTeamId];
        if (prevTeam && prevTeam.members && prevTeam.members[Game.myPlayer.slot - 1]) {
            prevTeam.members[Game.myPlayer.slot - 1].isOccupied = false;
            prevTeam.members[Game.myPlayer.slot - 1].clientId = null;
        }
        Game.currentTeamId = '';
        Game.myPlayer.teamId = '';
        Game.myPlayer.slot = 0;
        try {
            localStorage.removeItem('pagamo_logged_in_team');
            localStorage.removeItem('pagamo_logged_in_slot');
        } catch (e) {}
    } else if (!isCurrentUserSeated()) {
        Game.currentTeamId = '';
        Game.myPlayer.teamId = '';
        Game.myPlayer.slot = 0;
    }

    initMapState(false);
    updateUI();
    renderTeamSelectorBar();
    renderCfgTeamSelector();
    renderTeamSelectCards();

    logBattle(`🚩 出戰隊伍已更新：【${Game.teams[newTeamId].name}】已就位出戰！`);

    if (shouldBroadcast) {
        broadcastSync({
            type: 'TEAMS_CHANGE',
            activeTeamIds: Game.activeTeamIds
        });
    }
}

function renderTeamSelectorBar() {
    const bar = document.getElementById('teamSelectorBar');
    if (!bar) return;

    const is4 = Game.matchMode === '4TEAMS';
    const activeIds = Game.activeTeamIds;

    let html = `
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; width:100%;">
            <span style="font-weight:bold; color:#5c381e; font-size:13px;">🚩 出戰隊伍選擇：</span>
    `;

    if (!is4) {
        // 2 Teams picker (隊伍 A vs 隊伍 B)
        const teamA = Game.teams[activeIds[0]] || Game.teams['T1'];
        const teamB = Game.teams[activeIds[1]] || Game.teams['T5'];

        html += `
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:bold; color:${teamA.color};">隊伍 A：</span>
                <select class="team-picker-select" onchange="changeActiveTeam(0, this.value)">
                    ${ALL_TEAMS_ORDER.map(tid => {
                        const t = Game.teams[tid];
                        return `<option value="${tid}" ${tid === teamA.id ? 'selected' : ''}>${t.icon} ${t.name}</option>`;
                    }).join('')}
                </select>
            </div>
            <span style="font-weight:bold; color:#d35400; font-size:13px;">VS</span>
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:bold; color:${teamB.color};">隊伍 B：</span>
                <select class="team-picker-select" onchange="changeActiveTeam(1, this.value)">
                    ${ALL_TEAMS_ORDER.map(tid => {
                        const t = Game.teams[tid];
                        return `<option value="${tid}" ${tid === teamB.id ? 'selected' : ''}>${t.icon} ${t.name}</option>`;
                    }).join('')}
                </select>
            </div>
            <span style="font-size:11px; color:#7f5539; margin-left:auto;">（自由選6隊，選同隊自動對調）</span>
        `;
    } else {
        // 4 Teams picker (隊伍 1 ~ 4)
        html += `
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                ${[0, 1, 2, 3].map(i => {
                    const tid = activeIds[i] || ALL_TEAMS_ORDER[i];
                    const t = Game.teams[tid];
                    return `
                        <div style="display:flex; align-items:center; gap:4px;">
                            <span style="font-size:12px; font-weight:bold; color:${t.color};">隊伍${i + 1}：</span>
                            <select class="team-picker-select" onchange="changeActiveTeam(${i}, this.value)">
                                ${ALL_TEAMS_ORDER.map(optId => {
                                    const optTeam = Game.teams[optId];
                                    return `<option value="${optId}" ${optId === tid ? 'selected' : ''}>${optTeam.icon} ${optTeam.name}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    `;
                }).join('')}
            </div>
            <span style="font-size:11px; color:#7f5539; margin-left:auto;">（選同隊自動對調）</span>
        `;
    }

    html += `</div>`;
    bar.innerHTML = html;
}

function renderCfgTeamSelector() {
    const grid = document.getElementById('cfgTeamSelectGrid');
    if (!grid) return;

    const is4 = Game.matchMode === '4TEAMS';
    const activeIds = Game.activeTeamIds;

    let html = '';
    if (!is4) {
        const teamA = Game.teams[activeIds[0]] || Game.teams['T1'];
        const teamB = Game.teams[activeIds[1]] || Game.teams['T5'];
        html = `
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:bold; color:${teamA.color};">隊伍 A：</span>
                <select class="team-picker-select" onchange="changeActiveTeam(0, this.value)">
                    ${ALL_TEAMS_ORDER.map(tid => {
                        const t = Game.teams[tid];
                        return `<option value="${tid}" ${tid === teamA.id ? 'selected' : ''}>${t.icon} ${t.name}</option>`;
                    }).join('')}
                </select>
            </div>
            <span style="font-weight:bold; color:#d35400; font-size:13px;">VS</span>
            <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:12px; font-weight:bold; color:${teamB.color};">隊伍 B：</span>
                <select class="team-picker-select" onchange="changeActiveTeam(1, this.value)">
                    ${ALL_TEAMS_ORDER.map(tid => {
                        const t = Game.teams[tid];
                        return `<option value="${tid}" ${tid === teamB.id ? 'selected' : ''}>${t.icon} ${t.name}</option>`;
                    }).join('')}
                </select>
            </div>
        `;
    } else {
        html = [0, 1, 2, 3].map(i => {
            const tid = activeIds[i] || ALL_TEAMS_ORDER[i];
            const t = Game.teams[tid];
            return `
                <div style="display:flex; align-items:center; gap:4px;">
                    <span style="font-size:12px; font-weight:bold; color:${t.color};">隊伍${i + 1}：</span>
                    <select class="team-picker-select" onchange="changeActiveTeam(${i}, this.value)">
                        ${ALL_TEAMS_ORDER.map(optId => {
                            const optTeam = Game.teams[optId];
                            return `<option value="${optId}" ${optId === tid ? 'selected' : ''}>${optTeam.icon} ${optTeam.name}</option>`;
                        }).join('')}
                    </select>
                </div>
            `;
        }).join('');
    }
    grid.innerHTML = html;
}

function initMapState(reroll = false) {
    Game.map = window.MAP_PRESET;
    Game.tileOwners = {};

    const hexDirs = [[0, 0], [0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]];
    const allPossibleCenters = [
        [0, -8],   // 0 (北)
        [4, -8],   // 1
        [8, -8],   // 2 (東北)
        [8, -4],   // 3
        [8, 0],    // 4 (東南/東)
        [4, 4],    // 5
        [0, 8],    // 6 (南)
        [-4, 8],   // 7
        [-8, 8],   // 8 (西南)
        [-8, 4],   // 9
        [-8, 0],   // 10 (西北/西)
        [-4, -4]   // 11
    ];

    // Clean all 12 potential island centers to water tiles first
    if (Game.map && Game.map.tiles) {
        allPossibleCenters.forEach(c => {
            hexDirs.forEach(([dq, dr]) => {
                const k = `${c[0] + dq},${c[1] + dr}`;
                if (Game.map.tiles[k]) {
                    Game.map.tiles[k].type = 'water';
                }
            });
        });
    }

    const activeTeams = Game.activeTeamIds.map(id => Game.teams[id]);

    let islandLayout = [];

    if (Game.matchMode === '1VS1') {
        // 1對1 模式 (2隊 · 各1人單挑 · 2座島嶼對峙)
        // Island 0: Team A · 隊長 (北 [0, -8])
        // Island 1: Team B · 隊長 (南 [0, 8])
        islandLayout = [
            { teamIdx: 0, slot: 1, center: [0, -8], locName: '北方海域基地 (北)' },
            { teamIdx: 1, slot: 1, center: [0, 8], locName: '南方海域基地 (南)' }
        ];
    } else if (Game.matchMode === '2VS2') {
        // 2對2 模式 (2隊 · 各2人同心 · 4座島嶼十字對稱交錯 A-B-A-B)
        // Island 0: Team A · 隊員 1 (北 [0, -8])
        // Island 1: Team B · 隊員 1 (東 [8, 0])
        // Island 2: Team A · 隊員 2 (南 [0, 8])
        // Island 3: Team B · 隊員 2 (西 [-8, 0])
        islandLayout = [
            { teamIdx: 0, slot: 1, center: [0, -8], locName: '北方海域基地 (北)' },
            { teamIdx: 1, slot: 1, center: [8, 0], locName: '東方海域基地 (東)' },
            { teamIdx: 0, slot: 2, center: [0, 8], locName: '南方海域基地 (南)' },
            { teamIdx: 1, slot: 2, center: [-8, 0], locName: '西方海域基地 (西)' }
        ];
    } else if (Game.matchMode === '2TEAMS') {
        // 雙隊對決 (2隊 · 各3人官方規格 · 6座島嶼交錯 A-B-A-B-A-B)
        islandLayout = [
            { teamIdx: 0, slot: 1, center: [0, -8], locName: '北方海域基地 (北)' },
            { teamIdx: 1, slot: 1, center: [8, -8], locName: '東北海域基地 (東北)' },
            { teamIdx: 0, slot: 2, center: [8, 0], locName: '東南海域基地 (東南)' },
            { teamIdx: 1, slot: 2, center: [0, 8], locName: '南方海域基地 (南)' },
            { teamIdx: 0, slot: 3, center: [-8, 8], locName: '西南海域基地 (西南)' },
            { teamIdx: 1, slot: 3, center: [-8, 0], locName: '西北海域基地 (西北)' }
        ];
    } else {
        // 四隊爭霸 (4隊 · 各3人共鬥 · 12座島嶼時鐘交錯 1-2-3-4-1-2-3-4-1-2-3-4)
        islandLayout = [
            { teamIdx: 0, slot: 1, center: [0, -8], locName: '北方海域基地 (北)' },
            { teamIdx: 1, slot: 1, center: [4, -8], locName: '東北偏北海域基地' },
            { teamIdx: 2, slot: 1, center: [8, -8], locName: '東北海域基地 (東北)' },
            { teamIdx: 3, slot: 1, center: [8, -4], locName: '東偏北海域基地' },
            { teamIdx: 0, slot: 2, center: [8, 0], locName: '東南海域基地 (東南)' },
            { teamIdx: 1, slot: 2, center: [4, 4], locName: '東南偏南海域基地' },
            { teamIdx: 2, slot: 2, center: [0, 8], locName: '南方海域基地 (南)' },
            { teamIdx: 3, slot: 2, center: [-4, 8], locName: '西南偏南海域基地' },
            { teamIdx: 0, slot: 3, center: [-8, 8], locName: '西南海域基地 (西南)' },
            { teamIdx: 1, slot: 3, center: [-8, 4], locName: '西偏南海域基地' },
            { teamIdx: 2, slot: 3, center: [-8, 0], locName: '西北海域基地 (西北)' },
            { teamIdx: 3, slot: 3, center: [-4, -4], locName: '西北偏北海域基地' }
        ];
    }

    Game.map.islands = islandLayout.map((item, idx) => {
        const team = activeTeams[item.teamIdx] || activeTeams[0];
        const hexes = hexDirs.map(([dq, dr]) => [item.center[0] + dq, item.center[1] + dr]);
        return {
            id: idx,
            name: `${team.name} · 隊員 ${item.slot} 基地 (${item.locName})`,
            locName: item.locName,
            center: item.center,
            assignedTeam: team.id,
            assignedMemberSlot: item.slot,
            hexes: hexes
        };
    });

    Game.map.islands.forEach(island => {
        const team = Game.teams[island.assignedTeam];
        if (team && team.members && team.members[island.assignedMemberSlot - 1]) {
            team.members[island.assignedMemberSlot - 1].islandName = island.locName;
            team.members[island.assignedMemberSlot - 1].islandIdx = island.id;
            team.members[island.assignedMemberSlot - 1].islandCenter = island.center;
        }
        island.hexes.forEach(([q, r]) => {
            const key = `${q},${r}`;
            Game.tileOwners[key] = {
                teamId: island.assignedTeam,
                memberSlot: island.assignedMemberSlot
            };
            if (!Game.map.tiles[key]) {
                Game.map.tiles[key] = { q, r, type: 'island', points: 3 };
            } else {
                Game.map.tiles[key].type = 'island';
            }
        });
    });

    if (activeTeams[0]) activeTeams[0].islandIdx = 0;
    if (activeTeams[1]) activeTeams[1].islandIdx = 1;

    logBattle(`🏁 比賽就緒！當前模式共 ${Game.map.islands.length} 座獨立島嶼（相鄰島皆為敵隊，絕非隊友），初始積分皆為 0 分！`);
}

if (typeof window !== 'undefined') {
    window.switchMatchMode = switchMatchMode;
    window.changeActiveTeam = changeActiveTeam;
    window.getModeMaxSlots = getModeMaxSlots;
    window.getMatchSeatCapacity = getMatchSeatCapacity;
    window.getOccupiedSeatsCount = getOccupiedSeatsCount;
    window.isMatchFull = isMatchFull;
    window.isCurrentUserSeated = isCurrentUserSeated;
    window.initMapState = initMapState;
}

// ==================== Adjacency & Reachability ====================
function getHexNeighbors(q, r) {
    const directions = [
        [0, -1], [1, -1], [1, 0],
        [0, 1], [-1, 1], [-1, 0]
    ];
    return directions.map(([dq, dr]) => `${q + dq},${r + dr}`);
}

function getTeamOwnedTiles(teamId) {
    const keys = [];
    for (const [k, info] of Object.entries(Game.tileOwners)) {
        if (info.teamId === teamId) {
            keys.push(k);
        }
    }
    return keys;
}

function getExpandableTilesForTeam(teamId) {
    const teamTiles = getTeamOwnedTiles(teamId);
    const reachable = new Set();

    teamTiles.forEach(tk => {
        const [q, r] = tk.split(',').map(Number);
        const neighbors = getHexNeighbors(q, r);
        neighbors.forEach(nk => {
            if (Game.map.tiles[nk]) {
                const owner = Game.tileOwners[nk];
                // Can attack if neutral or owned by opponent team
                if (!owner || owner.teamId !== teamId) {
                    reachable.add(nk);
                }
            }
        });
    });

    return Array.from(reachable);
}

// ==================== Score Calculations (Initial Score = 0) ====================
function computeTeamStats(teamId) {
    const t = Game.teams[teamId];
    let territories = 0;
    let castles = 0;
    let bunkers = 0;
    let cannons = 0;
    let specialScore = 0;

    for (const [k, info] of Object.entries(Game.tileOwners)) {
        if (info.teamId === teamId) {
            territories++;
            const tile = Game.map.tiles[k];
            if (tile) {
                if (tile.type === 'castle') {
                    castles++;
                    specialScore += Game.config.specialPoints.castle;
                } else if (tile.type === 'bunker') {
                    bunkers++;
                    specialScore += Game.config.specialPoints.bunker;
                } else if (tile.type === 'cannon') {
                    cannons++;
                    specialScore += Game.config.specialPoints.cannon;
                }
            }
        }
    }

    // Official Formula (Starting score is strictly 0):
    // 團隊總積分 = 特殊地形積分加總 + Σ [ (答對數 × 7) + (新佔領地數 × 3) ]
    // Each team member starts on their own 7-hex island (3 members = 21 initial hexes per team)
    const startingTerritories = 21;
    const newTerritories = Math.max(0, territories - startingTerritories);
    const correctScore = t.correctCount * Game.config.correctAnswerPoints;
    const territoryScore = newTerritories * Game.config.territoryPoints;
    const totalScore = specialScore + correctScore + territoryScore;

    return {
        territories,
        newTerritories,
        castles,
        bunkers,
        cannons,
        specialScore,
        correctScore,
        territoryScore,
        totalScore
    };
}

if (typeof window !== 'undefined') {
    window.computeTeamStats = computeTeamStats;
}

// ==================== Game Loop & Timer ====================
function startMatch(shouldBroadcast = true) {
    if (Game.playMode === 'PRACTICE') {
        // 若在練習模式按下開始比賽，自動切換至比賽模式
        Game.playMode = 'TOURNAMENT';
        const navSel = document.getElementById('playModeSelect');
        if (navSel) navSel.value = 'TOURNAMENT';
        const cfgSel = document.getElementById('cfgPlayMode');
        if (cfgSel) cfgSel.value = 'TOURNAMENT';
    }
    Game.hasStarted = true;
    if (Game.isRunning) return;
    Game.isRunning = true;
    window.soundManager.init();

    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.innerHTML = '⏸️ 暫停計時';
        btn.className = 'wood-btn';
    }

    const timerTitle = document.querySelector('.timer-title');
    if (timerTitle) timerTitle.textContent = '比賽剩餘';
    const timerDigits = document.getElementById('timerDigits');
    if (timerDigits) timerDigits.style.fontSize = '';
    const timerUnit = document.querySelector('.timer-unit');
    if (timerUnit) timerUnit.style.display = '';

    if (Game.timerInterval) clearInterval(Game.timerInterval);
    Game.timerInterval = setInterval(() => {
        if (!Game.isRunning) return;

        Game.timeRemaining -= 1;
        if (Game.timeRemaining % 3 === 0) {
            broadcastSync({ type: 'TIMER_TICK', timeRemaining: Game.timeRemaining });
        }

        if (Game.timeRemaining <= 0) {
            Game.timeRemaining = 0;
            updateTimerDisplay();
            endMatch(true);
            return;
        }
        updateTimerDisplay();
    }, 1000);

    if (shouldBroadcast) {
        broadcastSync({ type: 'START_MATCH', timeRemaining: Game.timeRemaining });
        logBattle('▶️ 比賽正式開始！全體選手倒數計時啟動，可開始占地作答與計分！');
    }
}

function pauseMatch(shouldBroadcast = true) {
    Game.isRunning = false;
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.innerHTML = '▶️ 繼續比賽';
        btn.className = 'wood-btn btn-gold';
    }
    if (Game.timerInterval) {
        clearInterval(Game.timerInterval);
        Game.timerInterval = null;
    }
    if (shouldBroadcast) {
        broadcastSync({ type: 'PAUSE_MATCH', timeRemaining: Game.timeRemaining });
        logBattle('⏸️ 比賽由裁判暫停，作答與計分已鎖定');
    }
}

function togglePlayPause() {
    if (Game.playMode === 'PRACTICE') {
        if (confirm('目前為【練習模式】（可隨時自由作答）。\n\n是否切換至【🏆 比賽模式】並立即開始比賽？')) {
            switchPlayMode('TOURNAMENT', true);
            startMatch(true);
        }
        return;
    }

    if (Game.isRunning) {
        pauseMatch(true);
    } else {
        startMatch(true);
    }
}

function updateTimerDisplay() {
    if (Game.playMode === 'PRACTICE') {
        const el = document.getElementById('timerDigits');
        if (el) {
            el.textContent = '自由練習';
            el.style.fontSize = '14px';
        }
        return;
    }
    const mins = Math.floor(Game.timeRemaining / 60);
    const secs = Game.timeRemaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const el = document.getElementById('timerDigits');
    if (el) {
        el.textContent = formatted;
        el.style.fontSize = '';
    }
}

// ==================== Interactive Human Answering ====================
function openQuestionModal(tileKey, force = false) {
    if (Game.isSpectator) {
        if (typeof alert === 'function') alert('🎙️ 您目前是「裁判 / 大螢幕觀戰席」，僅供全場戰況觀看與發令計時。\n如需親自攻佔領地與答題，請點選上方「選隊入座」選擇您的隊伍席位！');
        return;
    }

    if (!isCurrentUserSeated()) {
        if (typeof alert === 'function') alert('⚠️ 您尚未加入任何隊伍席位！\n請先點選「👤 選隊」加入出戰席位或觀戰席。');
        openTeamLoginModal();
        return;
    }

    // 比賽模式限制：按下「開始比賽」才可以開始進行占地、作答、計分！
    if (Game.playMode === 'TOURNAMENT' && !Game.isRunning && !force) {
        const msg = !Game.hasStarted
            ? '⚠️ 目前為【比賽模式】，比賽尚未開始！\n請由老師或裁判點擊右上角「▶️ 開始比賽」後，方可開始進行占地、作答與計分！\n\n（若需隨時自由作答，請在上方將模式切換為「📖 練習模式」）'
            : '⏸️ 目前比賽處於暫停狀態！\n請由老師或裁判點擊右上角「▶️ 繼續比賽」後，方可繼續作答！';
        if (typeof alert === 'function') alert(msg);
        if (window.soundManager) window.soundManager.playWarning();
        return;
    }

    const team = Game.teams[Game.currentTeamId];
    if (!team) return;

    const mySlot = Game.myPlayer.slot || 1;
    const myMember = (team.members && team.members[mySlot - 1]) ? team.members[mySlot - 1] : { energy: 500 };
    let curEnergy = typeof myMember.energy === 'number' ? myMember.energy : 500;

    if (curEnergy < Game.config.correctEnergyCost) {
        if (Game.playMode === 'PRACTICE') {
            // 練習模式：能量用盡時自動補充，保證可隨時繼續練習
            myMember.energy = 500;
            curEnergy = 500;
            team.energy = team.members ? team.members.reduce((sum, m) => sum + (m.energy || 0), 0) : 500;
            updateUI();
            logBattle(`⚡ 練習模式：已為【${team.name}】(${Game.myPlayer.name}) 自動補充能量至 500 點！`);
        } else {
            if (typeof alert === 'function') alert(`⚡ 個人能量不足！答對一題需消耗 6 點能量，您目前個人能量僅剩 ${curEnergy} 點，無法出征！\n同隊其他隊員有其獨立的 500 點個人能量，可由隊友繼續出題攻佔。`);
            if (window.soundManager) window.soundManager.playWarning();
            return;
        }
    }

    const targetTile = Game.map.tiles[tileKey];
    if (!targetTile) return;

    // 從《25中排灣語_句型練習.pdf》題庫隊列依序抽取不重複題目（保證單局絕不重複）
    if (!Game.questionQueue || Game.questionQueue.length === 0) {
        if (!Game.questionPool || Game.questionPool.length === 0) {
            refreshGameQuestionBank(true);
        } else {
            Game.questionQueue = shuffleArray(Game.questionPool);
        }
    }

    const q = Game.questionQueue.pop() || window.QUESTION_BANK[0];
    if (Game.usedQuestionIds) Game.usedQuestionIds.add(q.id);
    Game.currentQuestion = { ...q, targetKey: tileKey };

    let targetName = '🌊 海域領地';
    let pts = 3;
    if (targetTile.type === 'castle') { targetName = '👑 核心城堡 (高分核心)'; pts = 100; }
    else if (targetTile.type === 'bunker') { targetName = '🏯 碉堡要塞'; pts = 80; }
    else if (targetTile.type === 'cannon') { targetName = '🎯 砲台哨站'; pts = 50; }
    else if (targetTile.type === 'island') { targetName = '🏝️ 外圍島嶼'; pts = 3; }

    const prevOwner = Game.tileOwners[tileKey];
    let ownerTip = '中立土地';
    if (prevOwner) {
        const prevTeam = Game.teams[prevOwner.teamId];
        ownerTip = `原佔領者: 【${prevTeam ? prevTeam.name : prevOwner.teamId}】`;
    }

    document.getElementById('qSubjectBadge').textContent = q.subject || '中排灣語';
    const catBadge = document.getElementById('qCategoryBadge');
    if (catBadge) catBadge.textContent = q.category || '情境族語';

    const modeBadge = Game.playMode === 'PRACTICE'
        ? '<span class="team-badge" style="background:#27ae60; font-size:11px; margin-right:4px;">📖 練習模式</span>'
        : '<span class="team-badge" style="background:#d35400; font-size:11px; margin-right:4px;">🏆 比賽模式</span>';

    document.getElementById('qTargetBanner').innerHTML = `
        <span>${modeBadge}目標: <strong>${targetName}</strong> (+${pts}分) ｜ ${ownerTip}</span>
        <span class="q-energy-tip">⚡ 個人能量: ${curEnergy}/500 (答對 -6 ｜ 答錯 -15)</span>
    `;

    document.getElementById('qText').innerHTML = q.question.replace(/\n/g, '<br>');

    const optsContainer = document.getElementById('qOptionsGrid');
    optsContainer.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];

    q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'q-option-btn';
        btn.innerHTML = `<span class="opt-label">${labels[idx]}</span> <span>${optText}</span>`;
        btn.onclick = () => submitPlayerAnswer(idx);
        optsContainer.appendChild(btn);
    });

    document.getElementById('qExplanation').style.display = 'none';
    document.getElementById('questionModal').style.display = 'flex';
}

function submitPlayerAnswer(selectedIdx) {
    if (Game.playMode === 'TOURNAMENT' && !Game.isRunning) {
        if (typeof alert === 'function') alert('⚠️ 目前比賽處於暫停或尚未開始狀態，作答無效！');
        return;
    }
    const q = Game.currentQuestion;
    if (!q) return;

    const team = Game.teams[Game.currentTeamId];
    const isCorrect = selectedIdx === q.answer;
    const optionBtns = document.querySelectorAll('.q-option-btn');

    optionBtns.forEach(btn => btn.disabled = true);

    const explanationEl = document.getElementById('qExplanation');
    explanationEl.innerHTML = `<strong>【族語解析】</strong><br>${q.explanation.replace(/\n/g, '<br>')}`;
    explanationEl.style.display = 'block';
    setTimeout(() => {
        try {
            explanationEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {}
    }, 60);

    const targetKey = q.targetKey;
    const targetTile = Game.map.tiles[targetKey];
    const prevOwner = Game.tileOwners[targetKey];

    const mySlot = Game.myPlayer.slot || 1;
    const myMember = (team.members && team.members[mySlot - 1]) ? team.members[mySlot - 1] : null;

    if (isCorrect) {
        if (optionBtns[selectedIdx]) optionBtns[selectedIdx].classList.add('selected-correct');
        window.soundManager.playCorrect();

        if (myMember) {
            myMember.energy = Math.max(0, (myMember.energy || 500) - Game.config.correctEnergyCost);
        }
        team.energy = team.members.reduce((sum, m) => sum + (m.energy || 0), 0);
        team.correctCount++;

        Game.tileOwners[targetKey] = {
            teamId: team.id,
            memberSlot: mySlot
        };

        let typeName = '領地';
        let pts = 10;
        if (targetTile.type === 'castle') {
            typeName = '👑 核心城堡';
            pts = 107;
            window.soundManager.playCaptureCastle();
            showCastleCaptureBanner(team.name, Game.myPlayer.name);
        } else if (targetTile.type === 'bunker') {
            typeName = '🏯 碉堡';
            pts = 87;
        } else if (targetTile.type === 'cannon') {
            typeName = '🎯 砲台';
            pts = 57;
        }

        const [tq, tr] = targetKey.split(',').map(Number);
        const worldPos = hexToWorld(tq, tr);
        addFloatingText(worldPos.x, worldPos.y - 20, `+${pts}分!`, team.lightColor || '#f1c40f', pts >= 50);

        if (prevOwner) {
            const opponent = Game.teams[prevOwner.teamId];
            logBattle(`⚔️ 【${team.name}】(${Game.myPlayer.name}) 奪取了【${opponent ? opponent.name : prevOwner.teamId}】的${typeName}！(+${pts}分)`);
        } else {
            logBattle(`🎉 【${team.name}】(${Game.myPlayer.name}) 答對題目，佔領了${typeName}！(+${pts}分)`);
        }

        broadcastSync({
            type: 'CAPTURE',
            teamId: team.id,
            tileKey: targetKey,
            memberSlot: mySlot,
            memberEnergy: myMember ? myMember.energy : 500,
            energy: team.energy,
            correctCount: team.correctCount,
            playerName: Game.myPlayer.name,
            pointsAdded: pts
        });

        setTimeout(() => {
            closeQuestionModal();
        }, 1600);
    } else {
        if (optionBtns[selectedIdx]) optionBtns[selectedIdx].classList.add('selected-wrong');
        if (optionBtns[q.answer]) optionBtns[q.answer].classList.add('selected-correct');
        window.soundManager.playWrong();

        if (myMember) {
            myMember.energy = Math.max(0, (myMember.energy || 500) - Game.config.wrongEnergyCost);
        }
        team.energy = team.members.reduce((sum, m) => sum + (m.energy || 0), 0);
        team.wrongCount++;

        const remEnergy = myMember ? myMember.energy : 500;
        const [tq, tr] = targetKey.split(',').map(Number);
        const worldPos = hexToWorld(tq, tr);
        addFloatingText(worldPos.x, worldPos.y - 15, '⚡ -15 答錯', '#ff7675', false);

        logBattle(`❌ 【${team.name}】(${Game.myPlayer.name}) 答錯題目！攻打失敗，扣除個人能量 15 點 (剩餘 ${remEnergy} 點)`);

        broadcastSync({
            type: 'WRONG_ANSWER',
            teamId: team.id,
            memberSlot: mySlot,
            memberEnergy: remEnergy,
            energy: team.energy,
            wrongCount: team.wrongCount,
            playerName: Game.myPlayer.name,
            tileKey: targetKey
        });

        setTimeout(() => {
            closeQuestionModal();
        }, 2600);
    }

    updateUI();
}

function closeQuestionModal() {
    document.getElementById('questionModal').style.display = 'none';
    Game.currentQuestion = null;
}

function showCastleCaptureBanner(teamName, playerName) {
    const banner = document.getElementById('castleCaptureBanner');
    if (!banner) return;
    banner.innerHTML = `👑【${teamName}】${playerName} 成功攻佔了中央核心城堡！(+100分)`;
    banner.style.display = 'flex';
    banner.style.animation = 'none';
    // Trigger reflow
    void banner.offsetWidth;
    banner.style.animation = 'bannerSweep 3.2s ease forwards';
    setTimeout(() => {
        banner.style.display = 'none';
    }, 3200);
}

// ==================== Canvas Rendering & Controls ====================
let canvas, ctx;

function initCanvas() {
    canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    function resize() {
        const p = canvas.parentElement;
        const w = p && p.clientWidth > 0 ? p.clientWidth : window.innerWidth;
        const navEl = document.querySelector('.top-nav');
        const navH = navEl ? navEl.offsetHeight : 48;
        const h = p && p.clientHeight > 0 ? p.clientHeight : (window.innerHeight - navH);
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
    }

    window.addEventListener('resize', resize);
    resize();

    resetCamera();

    // Event listeners
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onCanvasClick);

    // Touch controls for tablets
    initTouchControls();

    renderLoop();
}

function initTouchControls() {
    if (!canvas) return;

    let touchMode = 'NONE'; // 'NONE' | 'PAN' | 'PINCH'
    let lastPanX = 0, lastPanY = 0;
    let touchStartX = 0, touchStartY = 0;
    let touchMoved = false;

    // Pinch zoom state
    let pinchStartDist = 0;
    let pinchStartZoom = 1.0;
    let pinchStartWorldX = 0, pinchStartWorldY = 0;

    function getLocalPos(touch) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    canvas.addEventListener('touchstart', (e) => {
        // Prevent default browser gesture (like page-level pinch zoom or pull refresh)
        e.preventDefault();

        if (e.touches.length === 1) {
            touchMode = 'PAN';
            const pos = getLocalPos(e.touches[0]);
            lastPanX = pos.x;
            lastPanY = pos.y;
            touchStartX = pos.x;
            touchStartY = pos.y;
            touchMoved = false;
        } else if (e.touches.length >= 2) {
            touchMode = 'PINCH';
            touchMoved = true;

            const pos1 = getLocalPos(e.touches[0]);
            const pos2 = getLocalPos(e.touches[1]);
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            pinchStartDist = Math.max(10, Math.hypot(dx, dy));
            pinchStartZoom = Game.camera.zoom;

            // Focal midpoint between the two fingers in canvas coordinates
            const midX = (pos1.x + pos2.x) / 2;
            const midY = (pos1.y + pos2.y) / 2;

            // Corresponding world coordinates directly under the midpoint
            pinchStartWorldX = (midX - Game.camera.x) / pinchStartZoom;
            pinchStartWorldY = (midY - Game.camera.y) / pinchStartZoom;
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();

        if (e.touches.length === 1 && touchMode === 'PAN') {
            const pos = getLocalPos(e.touches[0]);
            const dx = pos.x - lastPanX;
            const dy = pos.y - lastPanY;

            if (Math.hypot(pos.x - touchStartX, pos.y - touchStartY) > 6) {
                touchMoved = true;
                Game.camera.dragDist = 20;
            }

            Game.camera.x += dx;
            Game.camera.y += dy;
            lastPanX = pos.x;
            lastPanY = pos.y;
        } else if (e.touches.length >= 2) {
            touchMode = 'PINCH';
            touchMoved = true;

            const pos1 = getLocalPos(e.touches[0]);
            const pos2 = getLocalPos(e.touches[1]);
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const curDist = Math.hypot(dx, dy);

            if (pinchStartDist > 0) {
                const scale = curDist / pinchStartDist;
                const newZoom = Math.max(0.4, Math.min(2.5, pinchStartZoom * scale));

                // Current midpoint between the two fingers
                const curMidX = (pos1.x + pos2.x) / 2;
                const curMidY = (pos1.y + pos2.y) / 2;

                // Lock world point under current midpoint (zooms around fingers & pans smoothly)
                Game.camera.zoom = newZoom;
                Game.camera.x = curMidX - pinchStartWorldX * newZoom;
                Game.camera.y = curMidY - pinchStartWorldY * newZoom;
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();

        if (e.touches.length === 0) {
            if (!touchMoved && e.changedTouches.length > 0) {
                const pos = getLocalPos(e.changedTouches[0]);
                handleTileAction(pos.x, pos.y);
            }
            touchMode = 'NONE';
            pinchStartDist = 0;
        } else if (e.touches.length === 1) {
            // Smooth transition back to 1-finger panning from current position
            touchMode = 'PAN';
            const pos = getLocalPos(e.touches[0]);
            lastPanX = pos.x;
            lastPanY = pos.y;
            touchStartX = pos.x;
            touchStartY = pos.y;
        }
    }, { passive: false });

    canvas.addEventListener('touchcancel', (e) => {
        touchMode = 'NONE';
        pinchStartDist = 0;
    });
}

// ==================== On-Screen Zoom Controls (平板縮放快捷按鈕) ====================
function zoomIn() {
    changeZoom(1.2);
}

function zoomOut() {
    changeZoom(0.833);
}

function changeZoom(factor) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (rect && rect.width > 100) ? (rect.width / 2) : (window.innerWidth / 2);
    const cy = (rect && rect.height > 100) ? (rect.height / 2) : (window.innerHeight / 2);
    const oldZoom = Game.camera.zoom;
    const newZoom = Math.max(0.4, Math.min(2.5, oldZoom * factor));
    if (Math.abs(newZoom - oldZoom) < 0.001) return;

    // Keep center of screen fixed in world space
    const wx = (cx - Game.camera.x) / oldZoom;
    const wy = (cy - Game.camera.y) / oldZoom;

    Game.camera.zoom = newZoom;
    Game.camera.x = Math.round(cx - wx * newZoom);
    Game.camera.y = Math.round(cy - wy * newZoom);
}

function viewOverview() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = (rect && rect.width > 300) ? rect.width : window.innerWidth;
    const h = (rect && rect.height > 300) ? rect.height : (window.innerHeight - 48);

    const isSmall = (w < 600 || h < 600);
    Game.camera.zoom = isSmall ? 0.46 : (w < 1024 ? 0.56 : 0.65);
    Game.camera.x = Math.round(w / 2);
    Game.camera.y = Math.round(h / 2);
    logBattle(`🌐 已切換為【全景鳥瞰視野】，展示六島與中央城堡全景！`);
}

function centerCameraView() {
    if (!canvas) return;
    const p = canvas.parentElement;
    const w = (p && p.clientWidth > 300) ? p.clientWidth : (window.innerWidth || 1200);
    const h = (p && p.clientHeight > 300) ? p.clientHeight : (Math.max(600, window.innerHeight - 48));
    const isSmall = (w < 600 || h < 600);
    const offsetRight = (w > 900) ? 200 : 0;
    Game.camera.x = Math.round((w - offsetRight) / 2);
    Game.camera.y = Math.round(h / 2);
    Game.camera.zoom = isSmall ? 0.75 : 1.0;
}

function resetCamera() {
    if (!Game.isSpectator && isCurrentUserSeated()) {
        focusMyIsland();
        return;
    }
    centerCameraView();
}

function focusMyIsland() {
    if (Game.isSpectator || !isCurrentUserSeated()) {
        centerCameraView();
        return;
    }

    const team = Game.teams[Game.currentTeamId];
    if (!team || !Game.map || !Game.map.islands) return;

    const mySlot = Game.myPlayer.slot || 1;
    let targetIsland = Game.map.islands.find(isl => isl.assignedTeam === team.id && isl.assignedMemberSlot === mySlot);
    if (!targetIsland) {
        targetIsland = Game.map.islands.find(isl => isl.assignedTeam === team.id) || Game.map.islands[0];
    }
    if (!targetIsland) return;

    const { x, y } = hexToWorld(targetIsland.center[0], targetIsland.center[1]);

    let w = 1200;
    let h = 800;
    if (canvas) {
        try {
            const rect = canvas.getBoundingClientRect();
            if (rect && rect.width > 100) w = rect.width;
            if (rect && rect.height > 100) h = rect.height;
        } catch (e) {}
    } else if (typeof window !== 'undefined' && window.innerWidth) {
        w = window.innerWidth;
        h = window.innerHeight ? (window.innerHeight - 48) : 800;
    }

    // Adaptive zoom: phone (0.82), tablet (0.95), desktop (1.05)
    Game.camera.zoom = (w < 600) ? 0.82 : (w < 1024 ? 0.95 : 1.05);
    Game.camera.x = Math.round(w / 2 - x * Game.camera.zoom);
    Game.camera.y = Math.round(h / 2 - y * Game.camera.zoom);
}

function onMouseDown(e) {
    if (e.button === 0) {
        Game.camera.isDragging = true;
        Game.camera.dragStartX = e.clientX - Game.camera.x;
        Game.camera.dragStartY = e.clientY - Game.camera.y;
        Game.camera.downX = e.clientX;
        Game.camera.downY = e.clientY;
        Game.camera.dragDist = 0;
    }
}

function onMouseMove(e) {
    if (Game.camera.isDragging) {
        Game.camera.dragDist = Math.hypot(e.clientX - Game.camera.downX, e.clientY - Game.camera.downY);
        Game.camera.x = e.clientX - Game.camera.dragStartX;
        Game.camera.y = e.clientY - Game.camera.dragStartY;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hit = screenToHex(mouseX, mouseY);
    if (hit) {
        Game.hoveredTileKey = `${hit.q},${hit.r}`;
        updateTooltip(e.clientX, e.clientY, hit);
    } else {
        Game.hoveredTileKey = null;
        hideTooltip();
    }
}

function onMouseUp() {
    Game.camera.isDragging = false;
}

function onWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.4, Math.min(2.5, Game.camera.zoom * zoomFactor));

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    Game.camera.x = mouseX - (mouseX - Game.camera.x) * (newZoom / Game.camera.zoom);
    Game.camera.y = mouseY - (mouseY - Game.camera.y) * (newZoom / Game.camera.zoom);
    Game.camera.zoom = newZoom;
}

function handleTileAction(mouseX, mouseY) {
    const hit = screenToHex(mouseX, mouseY);
    if (!hit) return;

    const k = `${hit.q},${hit.r}`;
    const tile = Game.map.tiles[k];
    if (!tile) return;

    if (Game.isSpectator) {
        logBattle(`ℹ️ 裁判觀戰模式：點選領地 (${k}) · ${tile.type}`);
        return;
    }

    if (!isCurrentUserSeated()) {
        logBattle(`⚠️ 尚未入座：請先點選「👤 選隊」加入出戰席位或觀戰席！`);
        openTeamLoginModal();
        return;
    }

    const team = Game.teams[Game.currentTeamId];
    if (!team) return;

    // 比賽模式限制：按下「開始比賽」才可以開始進行占地、作答、計分！
    if (Game.playMode === 'TOURNAMENT' && !Game.isRunning) {
        const msg = !Game.hasStarted
            ? '⚠️ 目前為【比賽模式】，比賽尚未開始！\n請由老師或裁判點擊右上角「▶️ 開始比賽」後，方可開始進行占地、作答與計分！\n\n（若需隨時自由作答，請在上方將模式切換為「📖 練習模式」）'
            : '⏸️ 目前比賽處於暫停狀態！\n請由老師或裁判點擊右上角「▶️ 繼續比賽」後，方可繼續作答！';
        if (typeof alert === 'function') alert(msg);
        if (window.soundManager) window.soundManager.playWarning();
        logBattle(msg.replace(/\n/g, ' '));
        return;
    }

    // Check if tile is expandable for current team
    const expandable = getExpandableTilesForTeam(team.id);
    if (expandable.includes(k)) {
        Game.selectedTargetKey = k;
        window.soundManager.playClick();
        openQuestionModal(k);
    } else {
        const owner = Game.tileOwners[k];
        if (owner && owner.teamId === team.id) {
            logBattle(`ℹ️ 此領地為貴隊【${team.name}】所有（安全防線）`);
        } else {
            logBattle(`⚠️ 無法開拓此地：必須與貴隊現有領地相鄰！`);
            window.soundManager.playWarning();
        }
    }
}

function onCanvasClick(e) {
    if (Game.camera.dragDist > 8) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    handleTileAction(mouseX, mouseY);
}

// Convert screen (x, y) to hex (q, r)
function screenToHex(screenX, screenY) {
    const worldX = (screenX - Game.camera.x) / Game.camera.zoom;
    const worldY = (screenY - Game.camera.y) / Game.camera.zoom;

    const R = Game.map.grid_config.hex_radius;
    const dx = 1.5 * R;
    const dy = Math.sqrt(3) * R;

    const q = Math.round(worldX / dx);
    const r = Math.round(worldY / dy - q * 0.5);

    const k = `${q},${r}`;
    if (Game.map.tiles[k]) {
        return { q, r, tile: Game.map.tiles[k] };
    }
    return null;
}

// Convert hex (q, r) to world (x, y)
function hexToWorld(q, r) {
    const R = Game.map.grid_config.hex_radius;
    const dx = 1.5 * R;
    const dy = Math.sqrt(3) * R;
    return {
        x: q * dx,
        y: (r + q * 0.5) * dy
    };
}

// Render Loop
function renderLoop() {
    drawMap();
    requestAnimationFrame(renderLoop);
}

function drawMap() {
    if (!canvas || !ctx || !Game.map) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(Game.camera.x, Game.camera.y);
    ctx.scale(Game.camera.zoom, Game.camera.zoom);

    const R = Game.map.grid_config.hex_radius;
    const currentTeam = Game.teams[Game.currentTeamId];
    const expandableTiles = currentTeam ? new Set(getExpandableTilesForTeam(currentTeam.id)) : new Set();

    // 1. Water background is clean ocean (no wireframe mesh across entire sea, matching PaGamO screenshot)
    // Only expandable/hovered tiles have interactive highlights

    // 2. Sort tiles by Y for 2.5D depth
    const tileKeys = Object.keys(Game.map.tiles);
    tileKeys.sort((a, b) => {
        const [qa, ra] = a.split(',').map(Number);
        const [qb, rb] = b.split(',').map(Number);
        const ya = (ra + qa * 0.5);
        const yb = (rb + qb * 0.5);
        return ya - yb;
    });

    // 3. Draw Base Hex Tiles
    tileKeys.forEach(k => {
        const tile = Game.map.tiles[k];
        const { x, y } = hexToWorld(tile.q, tile.r);
        const owner = Game.tileOwners[k];
        const isHovered = k === Game.hoveredTileKey;
        const isExpandable = expandableTiles.has(k);

        drawHexTile(ctx, x, y, R, tile, owner, isHovered, isExpandable);
    });

    // 4. Draw Special Buildings (Bunkers & Cannons)
    tileKeys.forEach(k => {
        const tile = Game.map.tiles[k];
        if (tile.type === 'bunker' || tile.type === 'cannon') {
            const { x, y } = hexToWorld(tile.q, tile.r);
            drawSpecialSprite(ctx, x, y, R, tile.type);
        }
    });

    // 5. Draw Central 7 Castles Fortress
    const { x: cx, y: cy } = hexToWorld(0, 0);
    const cw = R * 5.8;
    const ch = R * 6.8;
    const castleSprite = Game.sprites['castle_cluster'];

    if (castleSprite && castleSprite.complete && castleSprite.naturalWidth > 0) {
        ctx.drawImage(castleSprite, cx - cw / 2, cy - ch / 2 - R * 0.45, cw, ch);
    } else {
        // High-Quality Procedural 2.5D Castle Fortress Fallback (Never Missing!)
        drawProceduralCastleFortress(ctx, cx, cy, R);
    }

    // Draw owner flags for castle cluster
    const castleHexes = [
        [0, 0], [0, -1], [1, -1], [1, 0],
        [0, 1], [-1, 1], [-1, 0]
    ];
    castleHexes.forEach(([cq, cr]) => {
        const ck = `${cq},${cr}`;
        const castleOwner = Game.tileOwners[ck];
        if (castleOwner) {
            const { x, y } = hexToWorld(cq, cr);
            drawOwnerFlag(ctx, x, y - R * 0.5, castleOwner);
        }
    });

    // 6. Draw Member Base Badges over Starting Islands
    if (Game.map && Game.map.islands) {
        ctx.save();
        Game.map.islands.forEach(isl => {
            if (isl.assignedTeam && isl.assignedMemberSlot) {
                const team = Game.teams[isl.assignedTeam];
                if (!team) return;
                const { x, y } = hexToWorld(isl.center[0], isl.center[1]);
                const member = team.members ? team.members[isl.assignedMemberSlot - 1] : null;
                const isMyIsland = (!Game.isSpectator && team.id === Game.currentTeamId && isl.assignedMemberSlot === Game.myPlayer.slot);
                const isTeammateIsland = (!Game.isSpectator && team.id === Game.currentTeamId && !isMyIsland);
                const playerName = (member && member.isOccupied && member.name) ? member.name : (isl.assignedMemberSlot === 1 ? '隊長' : `隊員 ${isl.assignedMemberSlot}`);

                // Draw perimeter boundary ring around island
                ctx.save();
                ctx.strokeStyle = isMyIsland ? '#f1c40f' : (isTeammateIsland ? '#2ecc71' : 'rgba(231, 76, 60, 0.6)');
                ctx.lineWidth = isMyIsland ? 3 : 1.5;
                ctx.setLineDash(isMyIsland ? [6, 4] : [4, 4]);
                ctx.beginPath();
                ctx.arc(x, y, R * 2.6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                let labelText = '';
                if (isMyIsland) {
                    labelText = `⭐ 我的基地 (${playerName} · 7塊)`;
                } else if (isTeammateIsland) {
                    labelText = `🤝 隊友基地 (${playerName} · 7塊)`;
                } else {
                    labelText = `⚔️ 敵方基地 (${team.name} · ${playerName})`;
                }

                ctx.font = isMyIsland ? 'bold 13px "Microsoft JhengHei", Arial, sans-serif' : 'bold 11px "Microsoft JhengHei", Arial, sans-serif';
                const metrics = ctx.measureText(labelText);
                const pillW = metrics.width + 24;
                const pillH = isMyIsland ? 24 : 20;
                const pillY = y - 36;

                ctx.save();
                ctx.translate(x, pillY);

                if (isMyIsland) {
                    ctx.shadowColor = '#f1c40f';
                    ctx.shadowBlur = 10;
                }

                ctx.fillStyle = isMyIsland ? 'rgba(25, 25, 25, 0.92)' : 'rgba(15, 15, 15, 0.8)';
                ctx.strokeStyle = isMyIsland ? '#f1c40f' : (team.lightColor || '#fff');
                ctx.lineWidth = isMyIsland ? 2.5 : 1.5;
                ctx.beginPath();
                ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, pillH / 2);
                ctx.fill();
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.fillStyle = team.color;
                ctx.beginPath();
                ctx.arc(-pillW / 2 + 10, 0, 4.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = isMyIsland ? '#ffd166' : '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(labelText, 5, 0);

                ctx.restore();
            }
        });
        ctx.restore();
    }

    // 7. Draw Shovel Pin on Target / Hover
    if (Game.hoveredTileKey && expandableTiles.has(Game.hoveredTileKey)) {
        const [hq, hr] = Game.hoveredTileKey.split(',').map(Number);
        const { x, y } = hexToWorld(hq, hr);
        drawShovelPin(ctx, x, y);
    }

    // 8. Draw Floating Score Numbers & Animations (World Coordinates)
    if (Game.floatingTexts && Game.floatingTexts.length > 0) {
        ctx.save();
        for (let i = Game.floatingTexts.length - 1; i >= 0; i--) {
            const ft = Game.floatingTexts[i];
            ft.y += ft.vy;
            ft.life--;
            ft.alpha = Math.max(0, ft.life / 65);

            ctx.globalAlpha = ft.alpha;
            ctx.font = `bold ${Math.round((ft.isBig ? 24 : 17) * ft.scale)}px "Microsoft JhengHei", Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // High-contrast outline
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.lineWidth = ft.isBig ? 5 : 4;
            ctx.strokeText(ft.text, ft.x, ft.y);

            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);

            if (ft.life <= 0) {
                Game.floatingTexts.splice(i, 1);
            }
        }
        ctx.restore();
    }

    ctx.restore();
}

function drawWaterHexGrid(R) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let q = -10; q <= 10; q++) {
        for (let r = -10; r <= 10; r++) {
            const { x, y } = hexToWorld(q, r);
            drawFlatHexPath(ctx, x, y, R);
            ctx.stroke();
        }
    }
}

function drawFlatHexPath(ctx, cx, cy, R) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * Math.PI / 180;
        const hx = cx + R * Math.cos(angle);
        const hy = cy + R * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
}

function drawHexTile(ctx, x, y, R, tile, owner, isHovered, isExpandable) {
    if (tile.type === 'water' && !owner) {
        if (isExpandable || isHovered) {
            ctx.save();
            drawFlatHexPath(ctx, x, y, R);
            ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.4)' : 'rgba(46, 204, 113, 0.2)';
            ctx.fill();
            ctx.strokeStyle = isHovered ? '#f1c40f' : '#2ecc71';
            ctx.lineWidth = isHovered ? 2.5 : 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.restore();
        }
        return;
    }

    ctx.save();

    const bevelHeight = 10;
    const team = owner ? Game.teams[owner.teamId] : null;
    const baseColor = getTileColor(tile, owner);

    // 1. 3D Base Shadow/Extrusion
    ctx.beginPath();
    ctx.moveTo(x + R * Math.cos(0), y + R * Math.sin(0));
    for (let i = 0; i <= 3; i++) {
        const angle = (i * 60) * Math.PI / 180;
        ctx.lineTo(x + R * Math.cos(angle), y + R * Math.sin(angle) + bevelHeight);
    }
    for (let i = 3; i >= 0; i--) {
        const angle = (i * 60) * Math.PI / 180;
        ctx.lineTo(x + R * Math.cos(angle), y + R * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fillStyle = team ? team.darkColor : '#1e332a';
    ctx.fill();

    // 2. Top Surface
    drawFlatHexPath(ctx, x, y, R);
    ctx.fillStyle = baseColor;
    ctx.fill();

    // 3. Tile Border
    ctx.strokeStyle = team ? team.lightColor : 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = team ? 2.5 : 1;
    ctx.stroke();

    // 4. Highlight if Expandable / Hovered
    if (isHovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();
    }

    if (isExpandable) {
        ctx.save();
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.restore();
    }

    // 5. Draw Flag / Owner Badge if owned
    if (owner && tile.type !== 'castle') {
        drawOwnerFlag(ctx, x, y - R * 0.3, owner);
    }

    ctx.restore();
}

function getTileColor(tile, owner) {
    if (owner) {
        const team = Game.teams[owner.teamId];
        return team ? team.color : '#27ae60';
    }

    switch (tile.type) {
        case 'castle': return '#2f3542';
        case 'bunker': return '#333333';
        case 'cannon': return '#8bbd38';
        case 'island': return '#408285';
        default: return 'rgba(38, 140, 150, 0.2)';
    }
}

function drawOwnerFlag(ctx, x, y, owner) {
    const team = Game.teams[owner.teamId];
    const teamColor = team ? team.color : '#f1c40f';

    ctx.save();
    // Flag pole
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 10);
    ctx.lineTo(x - 6, y + 6);
    ctx.stroke();

    // Pennant
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 10);
    ctx.lineTo(x + 9, y - 5);
    ctx.lineTo(x - 6, y);
    ctx.closePath();
    ctx.fillStyle = teamColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    if (owner && owner.memberSlot) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(owner.memberSlot, x - 1, y - 5);
    }

    ctx.restore();
}

function drawSpecialSprite(ctx, x, y, R, type) {
    let img = null;
    let sw = R * 1.5;
    let sh = R * 1.6;
    let offsetY = -R * 0.35;

    if (type === 'cannon' && Game.sprites['cannon']) {
        img = Game.sprites['cannon'];
    } else if (type === 'bunker' && Game.sprites['bunker']) {
        img = Game.sprites['bunker'];
        sh = R * 1.8;
        offsetY = -R * 0.45;
    }

    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x - sw / 2, y + offsetY, sw, sh);
    } else {
        // High-Quality Procedural 2.5D Fallback for Bunkers & Cannons (Never Missing!)
        if (type === 'cannon') {
            drawProceduralCannon(ctx, x, y, R);
        } else if (type === 'bunker') {
            drawProceduralBunker(ctx, x, y, R);
        }
    }
}

function drawShovelPin(ctx, x, y) {
    const img = Game.sprites['shovel_pin'];
    if (img && img.complete && img.naturalWidth > 0) {
        const sw = 45;
        const sh = 75;
        ctx.drawImage(img, x - 10, y - sh + 15, sw, sh);
    } else {
        drawProceduralShovelPin(ctx, x, y);
    }
}

// ==================== High-Quality Procedural 2.5D Graphics (Zero-Dependency) ====================
function drawProceduralBunker(ctx, x, y, R) {
    ctx.save();
    // 1. Base shadow
    ctx.beginPath();
    ctx.ellipse(x, y + R * 0.1, R * 0.55, R * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Stone Tower Body (cylindrical with gradient)
    const towerW = R * 0.75;
    const towerH = R * 0.9;
    const towerTopY = y - towerH;
    const grad = ctx.createLinearGradient(x - towerW / 2, 0, x + towerW / 2, 0);
    grad.addColorStop(0, '#596275');
    grad.addColorStop(0.3, '#747d8c');
    grad.addColorStop(0.7, '#a4b0be');
    grad.addColorStop(1, '#2f3542');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - towerW / 2, towerTopY);
    ctx.lineTo(x + towerW / 2, towerTopY);
    ctx.lineTo(x + towerW / 2, y);
    ctx.ellipse(x, y, towerW / 2, R * 0.15, 0, 0, Math.PI);
    ctx.lineTo(x - towerW / 2, towerTopY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Arrow Slits / Windows
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(x - 3, towerTopY + towerH * 0.35, 6, 10);
    ctx.strokeStyle = '#2c3e50';
    ctx.strokeRect(x - 3, towerTopY + towerH * 0.35, 6, 10);

    // 4. Conical Roof
    const roofH = R * 0.6;
    const roofGrad = ctx.createLinearGradient(x - towerW * 0.6, 0, x + towerW * 0.6, 0);
    roofGrad.addColorStop(0, '#8e44ad');
    roofGrad.addColorStop(0.5, '#9b59b6');
    roofGrad.addColorStop(1, '#5e2776');

    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(x, towerTopY - roofH);
    ctx.lineTo(x + towerW * 0.55, towerTopY + 2);
    ctx.ellipse(x, towerTopY + 2, towerW * 0.55, R * 0.12, 0, 0, Math.PI);
    ctx.lineTo(x, towerTopY - roofH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#341f97';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Spire & Flag
    ctx.beginPath();
    ctx.moveTo(x, towerTopY - roofH);
    ctx.lineTo(x, towerTopY - roofH - 12);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, towerTopY - roofH - 12);
    ctx.lineTo(x + 10, towerTopY - roofH - 8);
    ctx.lineTo(x, towerTopY - roofH - 4);
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    ctx.restore();
}

function drawProceduralCannon(ctx, x, y, R) {
    ctx.save();
    // 1. Dirt mount shadow
    ctx.beginPath();
    ctx.ellipse(x, y + 2, R * 0.55, R * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // 2. Wooden carriage wheels
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.ellipse(x - 10, y - 2, 7, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(x + 10, y - 2, 7, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wheel hubs
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.arc(x - 10, y - 2, 3, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // 3. Bronze Cannon Barrel (tilted upward)
    ctx.save();
    ctx.translate(x, y - 8);
    ctx.rotate(-Math.PI / 6); // 30 deg up

    const barrelGrad = ctx.createLinearGradient(0, -6, 0, 6);
    barrelGrad.addColorStop(0, '#f39c12');
    barrelGrad.addColorStop(0.4, '#f1c40f');
    barrelGrad.addColorStop(1, '#b7791f');

    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.moveTo(-16, -5);
    ctx.lineTo(18, -3.5);
    ctx.lineTo(18, 3.5);
    ctx.lineTo(-16, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Muzzle ring
    ctx.fillStyle = '#d97706';
    ctx.fillRect(17, -4.5, 4, 9);
    ctx.strokeRect(17, -4.5, 4, 9);

    // Breech sphere
    ctx.beginPath();
    ctx.arc(-16, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // 4. Cannonballs stack
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(x + 18, y + 4, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 4, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 21, y - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawProceduralCastleFortress(ctx, cx, cy, R) {
    ctx.save();

    // 7 connected castle towers
    const castleOffsets = [
        [0, 0, 1.4],      // Center Keep (Taller!)
        [0, -1, 1.0],     // North
        [1, -1, 1.0],     // Northeast
        [1, 0, 1.0],      // Southeast
        [0, 1, 1.0],      // South
        [-1, 1, 1.0],     // Southwest
        [-1, 0, 1.0]      // Northwest
    ];

    const sorted = castleOffsets.map(([dq, dr, scale]) => {
        const { x, y } = hexToWorld(dq, dr);
        return { x, y, scale };
    }).sort((a, b) => a.y - b.y);

    sorted.forEach(({ x, y, scale }) => {
        const tw = R * 0.9 * scale;
        const th = R * 1.3 * scale;
        const topY = y - th;

        // Base shadow
        ctx.beginPath();
        ctx.ellipse(x, y + 2, tw * 0.6, R * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // Tower walls (sandstone)
        const wallGrad = ctx.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0);
        wallGrad.addColorStop(0, '#d4a373');
        wallGrad.addColorStop(0.3, '#faedcd');
        wallGrad.addColorStop(0.7, '#fefae0');
        wallGrad.addColorStop(1, '#ccd5ae');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(x - tw / 2, topY, tw, th);
        ctx.strokeStyle = '#b08968';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - tw / 2, topY, tw, th);

        // Crenellations
        const merlons = 4;
        const mw = tw / (merlons * 2 - 1);
        ctx.fillStyle = '#e9edc9';
        for (let m = 0; m < merlons; m++) {
            ctx.fillRect(x - tw / 2 + m * mw * 2, topY - 6, mw, 6);
            ctx.strokeRect(x - tw / 2 + m * mw * 2, topY - 6, mw, 6);
        }

        // Arched Gate on center keep
        if (scale > 1.1) {
            ctx.fillStyle = '#6f1d1b';
            ctx.beginPath();
            ctx.arc(x, y - 10, 8, Math.PI, 0);
            ctx.lineTo(x + 8, y);
            ctx.lineTo(x - 8, y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffe6a7';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Conical Roof (Ruby fairytale roof)
        const roofH = R * 0.9 * scale;
        const roofGrad = ctx.createLinearGradient(x - tw * 0.6, 0, x + tw * 0.6, 0);
        roofGrad.addColorStop(0, '#c0392b');
        roofGrad.addColorStop(0.4, '#e74c3c');
        roofGrad.addColorStop(0.7, '#ff7675');
        roofGrad.addColorStop(1, '#962d22');

        ctx.fillStyle = roofGrad;
        ctx.beginPath();
        ctx.moveTo(x, topY - roofH);
        ctx.lineTo(x + tw * 0.58, topY - 3);
        ctx.lineTo(x - tw * 0.58, topY - 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#78281f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Golden Spire & Pennant Flag
        ctx.beginPath();
        ctx.moveTo(x, topY - roofH);
        ctx.lineTo(x, topY - roofH - 14 * scale);
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, topY - roofH - 14 * scale);
        ctx.lineTo(x + 12 * scale, topY - roofH - 9 * scale);
        ctx.lineTo(x, topY - roofH - 4 * scale);
        ctx.closePath();
        ctx.fillStyle = '#f39c12';
        ctx.fill();
    });

    ctx.restore();
}

function drawProceduralShovelPin(ctx, x, y) {
    ctx.save();
    // Glowing target circle
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(241, 196, 15, 0.25)';
    ctx.fill();

    // Red Pin
    ctx.beginPath();
    ctx.arc(x, y - 28, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y - 28, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Shovel
    ctx.save();
    ctx.translate(x + 8, y - 10);
    ctx.rotate(Math.PI / 4);

    // Handle
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-2, -28, 4, 24);
    // Blade
    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.lineTo(7, -4);
    ctx.lineTo(5, 12);
    ctx.lineTo(0, 16);
    ctx.lineTo(-5, 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
}

// ==================== Tooltip ====================
function updateTooltip(screenX, screenY, hit) {
    const tooltip = document.getElementById('hexTooltip');
    const tile = hit.tile;
    const k = `${hit.q},${hit.r}`;
    const owner = Game.tileOwners[k];
    const currentTeam = Game.teams[Game.currentTeamId];
    const isExpandable = currentTeam && getExpandableTilesForTeam(currentTeam.id).includes(k);

    let title = '領地';
    let pts = 3;
    if (tile.type === 'castle') { title = '👑 核心城堡 (高分核心)'; pts = 100; }
    else if (tile.type === 'bunker') { title = '🏯 碉堡 (防守要塞)'; pts = 80; }
    else if (tile.type === 'cannon') { title = '🎯 砲台 (前哨戰壘)'; pts = 50; }
    else if (tile.type === 'island') { title = '🏝️ 外圍島嶼'; pts = 3; }
    else { title = '🌊 海域領地 (可開拓)'; pts = 3; }

    document.getElementById('ttTitle').textContent = title;
    document.getElementById('ttCoord').textContent = `(${hit.q}, ${hit.r})`;
    document.getElementById('ttPoints').textContent = `+${pts} 分`;

    let ownerText = '中立 (未佔領)';
    if (owner) {
        const op = Game.teams[owner.teamId];
        const memName = owner.memberSlot ? ` · 隊員 ${owner.memberSlot}` : '';
        ownerText = op ? `【${op.alliance}】${op.name}${memName}` : `${owner.teamId}${memName}`;
    }
    document.getElementById('ttOwner').textContent = ownerText;

    const actionHint = document.getElementById('ttAction');
    if (isExpandable) {
        if (Game.playMode === 'TOURNAMENT' && !Game.isRunning) {
            actionHint.textContent = '⏳ 比賽模式：請先按右上角「▶️ 開始比賽」方可作答！';
            actionHint.className = 'tooltip-action-hint hint-neutral';
        } else if (owner && owner.teamId !== currentTeam.id) {
            actionHint.textContent = Game.playMode === 'PRACTICE'
                ? '📖 練習模式：點擊立即作答奪地！'
                : '⚔️ 比賽進行中：點擊作答奪取敵方領地！';
            actionHint.className = 'tooltip-action-hint hint-attack';
        } else {
            actionHint.textContent = Game.playMode === 'PRACTICE'
                ? '📖 練習模式：點擊立即作答開拓！'
                : '✨ 點擊回答中排灣語題目進行開拓！';
            actionHint.className = 'tooltip-action-hint hint-attack';
        }
    } else if (owner && owner.teamId === currentTeam.id) {
        actionHint.textContent = '🛡️ 我方現有領地';
        actionHint.className = 'tooltip-action-hint hint-defend';
    } else {
        actionHint.textContent = '⛔ 尚未接壤（無法抵達）';
        actionHint.className = 'tooltip-action-hint hint-unreachable';
    }

    tooltip.style.left = `${screenX + 15}px`;
    tooltip.style.top = `${screenY + 15}px`;
    tooltip.style.display = 'block';
}

function hideTooltip() {
    document.getElementById('hexTooltip').style.display = 'none';
}

// ==================== UI Updates ====================
function updateUI() {
    updateLeaderboard();
    updatePlayerHUD();
}

function updateLeaderboard() {
    const activeTeams = Game.activeTeamIds.map(id => {
        const stats = computeTeamStats(id);
        return { ...Game.teams[id], stats };
    });

    // Sort by official total score descending
    activeTeams.sort((a, b) => b.stats.totalScore - a.stats.totalScore);

    const maxSlots = getModeMaxSlots();

    // Header Title
    const titleEl = document.getElementById('lbHeaderTitle');
    if (titleEl) {
        const prefix = Game.playMode === 'PRACTICE' ? '📖 練習模式戰況' : '👑 即時戰況排行榜';
        const modeTitles = {
            '1VS1': '(1對1 單挑)',
            '2VS2': '(2對2 雙人)',
            '2TEAMS': '(2隊對決)',
            '4TEAMS': '(4隊爭霸)'
        };
        titleEl.textContent = `${prefix} ${modeTitles[Game.matchMode] || '(2隊對決)'}`;
    }

    const modeLabelEl = document.getElementById('lbModeLabel');
    if (modeLabelEl) {
        if (Game.playMode === 'PRACTICE') {
            modeLabelEl.textContent = '自由練習 · 隨時作答拓殖 · 500能量自動補充';
        } else {
            const slotsText = maxSlots === 1 ? '每隊1人 (個人500能量)' : `一隊${maxSlots}人 (每人500能量)`;
            modeLabelEl.textContent = `${slotsText} · 初始0分`;
        }
    }

    // Top Comparison Bar
    const asbA = document.getElementById('asbTitleA');
    const asbB = document.getElementById('asbTitleB');
    const scA = document.getElementById('allianceAScore');
    const scB = document.getElementById('allianceBScore');

    if (Game.matchMode !== '4TEAMS') {
        const tA = Game.teams[Game.activeTeamIds[0]] || Game.teams['T1'];
        const tB = Game.teams[Game.activeTeamIds[1]] || Game.teams['T5'];
        const statsA = computeTeamStats(tA.id);
        const statsB = computeTeamStats(tB.id);
        if (asbA) asbA.innerHTML = `<span style="color:${tA.color}">●</span> ${tA.name}: <strong id="allianceAScore">${statsA.totalScore}</strong> 分`;
        if (asbB) asbB.innerHTML = `<span style="color:${tB.color}">●</span> ${tB.name}: <strong id="allianceBScore">${statsB.totalScore}</strong> 分`;

        const total = (statsA.totalScore + statsB.totalScore);
        const pctA = total > 0 ? Math.round((statsA.totalScore / total) * 100) : 50;
        const fillA = document.getElementById('allianceAFill');
        const fillB = document.getElementById('allianceBFill');
        if (fillA) {
            fillA.style.width = `${pctA}%`;
            fillA.style.background = tA.color;
        }
        if (fillB) {
            fillB.style.width = `${100 - pctA}%`;
            fillB.style.background = tB.color;
        }
    } else {
        // 4 Teams Comparison
        if (asbA) asbA.innerHTML = `領先: <strong>${activeTeams[0].name}</strong> (${activeTeams[0].stats.totalScore}分)`;
        if (asbB) asbB.innerHTML = `次名: <strong>${activeTeams[1].name}</strong> (${activeTeams[1].stats.totalScore}分)`;
    }

    // Teams List in Leaderboard
    const listContainer = document.getElementById('teamsList');
    listContainer.innerHTML = '';

    activeTeams.forEach((t, idx) => {
        const row = document.createElement('div');
        row.className = `player-row ${t.id === Game.currentTeamId ? 'active-player' : ''}`;
        row.onclick = () => {
            if (!isCurrentUserSeated()) {
                openTeamLoginModal();
                return;
            }
            selectTeam(t.id, Game.myPlayer.slot);
            focusMyIsland();
        };

        const rankIcon = idx === 0 ? '👑' : `${idx + 1}.`;
        const energyBadgeText = maxSlots === 1 ? '⚡ 500能量' : `⚡ ${maxSlots}人各500`;

        row.innerHTML = `
            <div class="pr-left">
                <span class="pr-rank">${rankIcon}</span>
                <span class="pr-dot" style="background: ${t.color}"></span>
                <div class="pr-info">
                    <span class="pr-name">
                        ${t.name}
                        ${t.id === Game.currentTeamId ? '<span class="pr-tag" style="background:#f39c12">操控中</span>' : ''}
                    </span>
                    <span class="pr-sub">
                        <span>答:${t.correctCount}</span>
                        <span>新地:${t.stats.newTerritories}</span>
                        ${t.stats.castles > 0 ? `<span>🏰${t.stats.castles}</span>` : ''}
                        ${t.stats.bunkers > 0 ? `<span>🏯${t.stats.bunkers}</span>` : ''}
                        ${t.stats.cannons > 0 ? `<span>🎯${t.stats.cannons}</span>` : ''}
                    </span>
                </div>
            </div>
            <div class="pr-right">
                <span class="pr-pts">${t.stats.totalScore} 分</span>
                <span class="pr-energy" title="每位隊員個人能量各500點">${energyBadgeText}</span>
            </div>
        `;
        listContainer.appendChild(row);
    });

    // Update Nav Banner Pill
    const bannerPill = document.getElementById('matchAlliancePill');
    if (bannerPill) {
        if (Game.matchMode !== '4TEAMS') {
            const teamA = Game.teams[Game.activeTeamIds[0]] || Game.teams['T1'];
            const teamB = Game.teams[Game.activeTeamIds[1]] || Game.teams['T5'];
            bannerPill.innerHTML = `
                <span class="team-badge ${teamA.badgeClass}">${teamA.name} (${maxSlots}人)</span>
                <span style="font-size:12px; font-weight:bold; color:#f1c40f;">VS</span>
                <span class="team-badge ${teamB.badgeClass}">${teamB.name} (${maxSlots}人)</span>
            `;
        } else {
            const badges = Game.activeTeamIds.map(id => {
                const team = Game.teams[id] || Game.teams['T1'];
                return `<span class="team-badge ${team.badgeClass}">${team.name} (3人)</span>`;
            }).join(' <span style="font-size:11px; font-weight:bold; color:#f1c40f;">VS</span> ');
            bannerPill.innerHTML = badges;
        }
    }
}

function toggleLeaderboard(forceState) {
    const lb = document.getElementById('leaderboardPanel');
    const btn = document.getElementById('lbCollapseBtn');
    if (!lb) return;
    const isCollapsed = lb.classList.contains('collapsed');
    const shouldCollapse = (typeof forceState === 'boolean') ? forceState : !isCollapsed;
    if (shouldCollapse) {
        lb.classList.add('collapsed');
        if (btn) btn.textContent = '展開 ◀';
    } else {
        lb.classList.remove('collapsed');
        if (btn) btn.textContent = '收合 ▶';
    }
}

function updatePlayerHUD() {
    if (Game.isSpectator) {
        const hudName = document.getElementById('hudPlayerName');
        if (hudName) hudName.textContent = `🎙️ 裁判 / 大螢幕觀戰中`;
        const teamBadge = document.getElementById('hudTeamBadge');
        if (teamBadge) {
            teamBadge.textContent = '裁判觀戰席';
            teamBadge.className = 'hud-team-tag';
            teamBadge.style.background = '#34495e';
        }
        const navBadge = document.getElementById('navCurrentPlayerBadge');
        if (navBadge) {
            navBadge.textContent = '🎙️ 裁判 / 觀戰席';
            navBadge.className = 'team-badge';
            navBadge.style.background = '#34495e';
        }
        const energyLabel = document.getElementById('hudEnergyLabel');
        if (energyLabel) energyLabel.textContent = `⚡ 觀戰全場監控中`;
        const energyFill = document.getElementById('hudEnergyFill');
        if (energyFill) energyFill.style.width = '100%';
        return;
    }

    if (!isCurrentUserSeated()) {
        const hudName = document.getElementById('hudPlayerName');
        if (hudName) hudName.textContent = `⚠️ 尚未入座 (點擊選隊)`;
        const teamBadge = document.getElementById('hudTeamBadge');
        if (teamBadge) {
            teamBadge.textContent = '未入座';
            teamBadge.className = 'hud-team-tag';
            teamBadge.style.background = '#7f8c8d';
        }
        const navBadge = document.getElementById('navCurrentPlayerBadge');
        if (navBadge) {
            navBadge.textContent = '⚠️ 尚未入座 (點此選隊)';
            navBadge.className = 'team-badge';
            navBadge.style.background = '#e67e22';
        }
        const energyLabel = document.getElementById('hudEnergyLabel');
        if (energyLabel) energyLabel.textContent = `⚡ 請先選隊入座`;
        const energyFill = document.getElementById('hudEnergyFill');
        if (energyFill) energyFill.style.width = '0%';
        return;
    }

    const t = Game.teams[Game.currentTeamId];
    if (!t) return;

    const slotName = Game.myPlayer.slot === 1 ? '隊長' : `隊員 ${Game.myPlayer.slot}`;
    document.getElementById('hudPlayerName').textContent = `${Game.myPlayer.name} (${t.name} · ${slotName})`;

    const teamBadge = document.getElementById('hudTeamBadge');
    teamBadge.textContent = t.name;
    teamBadge.className = `hud-team-tag ${t.badgeClass}`;

    const avatarRing = document.querySelector('.hud-avatar-wrapper');
    if (avatarRing) avatarRing.style.borderColor = t.color;
    const avatarBg = document.getElementById('hudAvatarBg');
    if (avatarBg) avatarBg.setAttribute('fill', t.color);

    // Individual Member Energy (500 max per player)
    const mySlot = Game.myPlayer.slot || 1;
    const myMember = (t.members && t.members[mySlot - 1]) ? t.members[mySlot - 1] : { energy: 500 };
    const curEnergy = typeof myMember.energy === 'number' ? myMember.energy : 500;
    const energyPct = Math.max(0, Math.min(100, (curEnergy / Game.config.maxEnergy) * 100));

    const hudEnergyFill = document.getElementById('hudEnergyFill');
    if (hudEnergyFill) hudEnergyFill.style.width = `${energyPct}%`;
    const hudEnergyLabel = document.getElementById('hudEnergyLabel');
    if (hudEnergyLabel) hudEnergyLabel.textContent = `⚡ 個人能量: ${curEnergy} / ${Game.config.maxEnergy}`;

    // Display member's island location in HUD
    const myIsland = (Game.map && Game.map.islands) ? Game.map.islands.find(isl => isl.assignedTeam === t.id && isl.assignedMemberSlot === mySlot) : null;
    const islName = myIsland ? (myIsland.locName || myIsland.name) : (myMember.islandName || '獨立海域基地');
    const locEl = document.getElementById('hudIslandLocation');
    if (locEl) {
        locEl.textContent = `🏝️ 初始基地：${islName} (7塊地)`;
    }

    const stats = computeTeamStats(t.id);
    document.getElementById('hudCorrectCount').textContent = t.correctCount;
    document.getElementById('hudTerritoryCount').textContent = stats.territories;
    document.getElementById('hudSpecialScore').textContent = stats.specialScore;
    document.getElementById('hudTotalScore').textContent = stats.totalScore;

    // Top Navigation Badge
    const navBadge = document.getElementById('navCurrentPlayerBadge');
    if (navBadge) {
        navBadge.textContent = `${t.name} · ${slotName}`;
        navBadge.className = `team-badge ${t.badgeClass}`;
    }
}

// ==================== Team & Seat Selection Modal ====================
function openTeamLoginModal() {
    renderTeamSelectorBar();
    renderTeamSelectCards();
    const btnTourn = document.getElementById('playModeBtnTourn');
    const btnPract = document.getElementById('playModeBtnPract');
    if (btnTourn && btnPract) {
        btnTourn.classList.toggle('active', Game.playMode === 'TOURNAMENT');
        btnPract.classList.toggle('active', Game.playMode === 'PRACTICE');
    }
    const btn1v1 = document.getElementById('modeBtn1v1');
    const btn2v2 = document.getElementById('modeBtn2v2');
    const btn2 = document.getElementById('modeBtn2');
    const btn4 = document.getElementById('modeBtn4');
    if (btn1v1) btn1v1.classList.toggle('active', Game.matchMode === '1VS1');
    if (btn2v2) btn2v2.classList.toggle('active', Game.matchMode === '2VS2');
    if (btn2) btn2.classList.toggle('active', Game.matchMode === '2TEAMS');
    if (btn4) btn4.classList.toggle('active', Game.matchMode === '4TEAMS');

    const roomBtns = document.querySelectorAll('.room-toggle-btn');
    roomBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-room') === Game.roomId);
    });
    document.getElementById('teamLoginModal').style.display = 'flex';
}

function confirmAndEnterGame() {
    if (Game.isSpectator) {
        closeTeamLoginModal(true);
        return;
    }
    if (!isCurrentUserSeated()) {
        if (isMatchFull()) {
            alert(`⛔ 本區域出戰席位已額滿（共 ${getOccupiedSeatsCount()}/${getMatchSeatCapacity()} 人滿座）！\n本組合已無法再加入新選手。\n\n請選擇：\n1. 切換至上方「區域 2 ~ 5」參賽\n2. 點擊下方「🎙️ 裁判 / 大螢幕觀戰席」進入觀戰！`);
        } else {
            alert('⚠️ 請先點選隊伍中任一空位席位入座，或點選下方「🎙️ 裁判 / 大螢幕觀戰席」！');
        }
        return;
    }
    closeTeamLoginModal(true);
}

function closeTeamLoginModal(force = false) {
    if (!force) {
        if (!Game.isSpectator && !isCurrentUserSeated()) {
            if (isMatchFull()) {
                alert(`⛔ 本區域出戰席位已額滿！本組合無法再加入新選手。\n請切換至其他 2~5 區參賽，或點擊「🎙️ 裁判 / 大螢幕觀戰席」進入觀戰。`);
                return;
            } else {
                alert('⚠️ 請先點選隊伍席位入座，或選擇觀戰席！');
                return;
            }
        }
    }
    const modal = document.getElementById('teamLoginModal');
    if (modal) modal.style.display = 'none';
    if (!Game.isSpectator && isCurrentUserSeated()) {
        focusMyIsland();
    } else {
        resetCamera();
    }

    // On mobile devices / portrait tablets (<= 768px or height <= 520px), auto-collapse the leaderboard to maximize map arena
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || window.innerHeight <= 520)) {
        toggleLeaderboard(true);
    }
}

function updateMyPlayerName(name) {
    if (!name || !name.trim()) return;
    Game.myPlayer.name = name.trim();
    try {
        localStorage.setItem('pagamo_player_name', Game.myPlayer.name);
    } catch (e) {}

    // If currently occupying a slot, synchronize new name with teammates and peers
    if (!Game.isSpectator && isCurrentUserSeated() && Game.teams[Game.currentTeamId] && Game.teams[Game.currentTeamId].members) {
        const mem = Game.teams[Game.currentTeamId].members[Game.myPlayer.slot - 1];
        if (mem) {
            mem.name = Game.myPlayer.name;
            mem.isOccupied = true;
            mem.clientId = myClientId;
            broadcastSync({
                type: 'JOIN_SLOT',
                teamId: Game.currentTeamId,
                slot: Game.myPlayer.slot,
                playerName: Game.myPlayer.name,
                clientId: myClientId
            });
        }
    }
    updateUI();
    renderTeamSelectCards();
}

function promptSeatOccupied(occupantName) {
    alert(`⚠️ 此席位已被【${occupantName || '其他選手'}】選定入座！\n同一席位無法重複選取，請選擇其他空位入座。`);
    if (window.soundManager && typeof window.soundManager.playWrong === 'function') {
        window.soundManager.playWrong();
    }
}

function renderTeamSelectCards() {
    const container = document.getElementById('teamSelectCards');
    if (!container) return;
    container.innerHTML = '';

    const nameInput = document.getElementById('playerNameInput');
    if (nameInput) nameInput.value = (Game.myPlayer.name === '選手' || Game.myPlayer.name === '選手 1') ? '' : Game.myPlayer.name;

    renderTeamSelectorBar();

    const maxSlots = getModeMaxSlots();
    const modeLabels = {
        '1VS1': '1對1 單挑 · 每隊 1 人 · 共 2 人',
        '2VS2': '2對2 雙人 · 每隊 2 人 · 共 4 人',
        '2TEAMS': '雙隊對決 · 每隊 3 人 · 共 6 人',
        '4TEAMS': '四隊爭霸 · 每隊 3 人 · 共 12 人'
    };
    const titleEl = document.getElementById('teamModalTitle');
    if (titleEl) {
        titleEl.textContent = `🎮 參賽隊伍與席位選擇 (${modeLabels[Game.matchMode] || '一隊 3 人'})`;
    }
    const hintEl = document.getElementById('teamModalRuleHint');
    if (hintEl) {
        hintEl.innerHTML = `💡 規則：<strong>一隊 ${maxSlots} 人</strong>，每位隊員擁有 <strong>500 點個人能量</strong>，<strong>分佔不同獨立海域島嶼（相鄰皆為敵隊，絕非隊友）</strong>！初始積分為 0 分。`;
    }

    // Match Full Alert Banner
    const fullBanner = document.getElementById('matchFullBannerWrap');
    const isFull = isMatchFull();
    const isSeated = isCurrentUserSeated();
    const occupiedCount = getOccupiedSeatsCount();
    const capacity = getMatchSeatCapacity();

    if (fullBanner) {
        if (isFull && !isSeated) {
            fullBanner.style.display = 'block';
            fullBanner.innerHTML = `
                <div class="match-full-alert-banner">
                    <div class="mf-title">⛔ 本區域出戰席位已額滿（共 ${occupiedCount}/${capacity} 人滿座）！</div>
                    <div class="mf-desc">
                        本組合已無法再加入新選手。請切換上方【區域 2 ~ 5】參賽，或點擊下方【🎙️ 裁判 / 大螢幕觀戰席】以觀戰身分進場。
                    </div>
                </div>
            `;
        } else if (isFull && isSeated) {
            fullBanner.style.display = 'block';
            fullBanner.innerHTML = `
                <div class="match-full-alert-banner" style="background:rgba(46, 204, 113, 0.15); border-color:#2ecc71;">
                    <div class="mf-title" style="color:#27ae60;">🟢 本場賽制出戰席位已全員就緒（共 ${occupiedCount}/${capacity} 人額滿）！</div>
                    <div class="mf-desc" style="color:#2c3e50;">
                        您已成功就座於【${Game.teams[Game.currentTeamId]?.name || ''} 席位 ${Game.myPlayer.slot}】，其他新進玩家已無法搶佔任何席位。
                    </div>
                </div>
            `;
        } else {
            fullBanner.style.display = 'none';
            fullBanner.innerHTML = '';
        }
    }

    const displayTeamIds = Game.activeTeamIds;
    const slotsArray = Array.from({ length: maxSlots }, (_, i) => i + 1);
    const initialTerritories = maxSlots * 7;

    displayTeamIds.forEach(tId => {
        const t = Game.teams[tId];
        if (!t) return;
        const stats = computeTeamStats(t.id);
        const isMyTeam = isCurrentUserSeated() && (t.id === Game.currentTeamId);

        const card = document.createElement('div');
        card.className = `team-select-card ${isMyTeam ? 'active-login' : ''}`;

        card.innerHTML = `
            <div class="tsc-header">
                <span class="tsc-alliance ${t.allianceId === 'ALLIANCE_A' ? 'badge-alliance-a' : 'badge-alliance-b'}">${t.alliance}</span>
                <span class="tsc-status-badge" style="color:${isMyTeam ? '#27ae60' : '#888'};">
                    ${isMyTeam ? '🟢 您在此隊' : '參賽隊伍'}
                </span>
            </div>
            <div class="tsc-title-row">
                <div class="tsc-icon" style="background:${t.color}">${t.icon}</div>
                <div class="tsc-name">${t.name}</div>
            </div>
            <div class="tsc-details">
                <div>📍 基地分配：每位隊員分佔獨立海域島嶼（相鄰皆為敵隊，絕非隊友）</div>
                <div>⚡ 隊員能量：每位隊員個人 500 點（獨立計量，答對-6 / 答錯-15）</div>
                <div>🚩 團隊領地：${stats.territories} 塊（${maxSlots}位隊員各佔一島，共 ${initialTerritories} 塊初始領地）｜ 總積分：<strong>${stats.totalScore}</strong> 分</div>
            </div>

            <!-- Player Seats (根據賽制動態生成席位) -->
            <div class="tsc-slots-wrap">
                <div class="tsc-slots-title">
                    <span>👥 隊員席位與獨立基地 (點選入座)：</span>
                    <span style="color:#7f5539;">點選席位加入</span>
                </div>
                <div class="tsc-slots-grid" style="${maxSlots === 1 ? 'grid-template-columns: 1fr;' : ''}">
                    ${slotsArray.map(slot => {
                        const member = (t.members && t.members[slot - 1]) ? t.members[slot - 1] : { energy: 500 };
                        const memberEnergy = (typeof member.energy === 'number') ? member.energy : 500;
                        const memName = (member && member.name) ? member.name : (slot === 1 ? '隊長' : `隊員 ${slot}`);
                        const isl = (Game.map && Game.map.islands) ? Game.map.islands.find(x => x.assignedTeam === t.id && x.assignedMemberSlot === slot) : null;
                        const islandLoc = isl ? (isl.locName || isl.name) : (member?.islandName || (slot === 1 ? '北方海域基地' : (slot === 2 ? '東南海域基地' : '西南海域基地')));

                        const isOccupiedByOther = Boolean(member.isOccupied && member.clientId && member.clientId !== myClientId);
                        const isMySlot = isCurrentUserSeated() && (t.id === Game.currentTeamId) && (Game.myPlayer.slot === slot);

                        let btnClass = 'tsc-slot-btn';
                        let label = `席位 ${slot} (${slot === 1 ? '隊長' : '隊員'})`;
                        let badgeHtml = `<span class="slot-badge">空位 · ⚡${memberEnergy}</span>`;
                        let disabledAttr = '';
                        let clickAction = `selectTeamSlot('${t.id}', ${slot})`;

                        if (isMySlot) {
                            btnClass = 'tsc-slot-btn my-slot';
                            label = `⭐ 本人 (${memName})`;
                            badgeHtml = `<span class="slot-badge slot-badge-mine">🟢 本人就座 · ⚡${memberEnergy}</span>`;
                        } else if (isOccupiedByOther) {
                            btnClass = 'tsc-slot-btn occupied locked';
                            label = `🔒 ${memName} (已選)`;
                            badgeHtml = `<span class="slot-badge slot-badge-locked">🔴 已有人選 · ⚡${memberEnergy}</span>`;
                            disabledAttr = 'disabled="disabled"';
                            clickAction = `promptSeatOccupied('${memName.replace(/'/g, "\\'")}')`;
                        } else if (isFull && !isSeated) {
                            btnClass = 'tsc-slot-btn locked';
                            label = `⛔ 席位 ${slot} (已額滿)`;
                            badgeHtml = `<span class="slot-badge slot-badge-locked">⛔ 已額滿</span>`;
                            disabledAttr = 'disabled="disabled"';
                            clickAction = `alert('⛔ 本區域出戰席位已額滿（共 ${occupiedCount}/${capacity} 人滿座）！本組合已無法再加入新選手。請切換其他區域或選取觀戰席。')`;
                        }

                        return `
                            <button class="${btnClass}" ${disabledAttr} onclick="${clickAction}" style="display:flex; flex-direction:column; align-items:flex-start; text-align:left; gap:3px; padding:8px 10px;" title="${isOccupiedByOther ? `此席位已被【${memName}】選定入座，無法重複選取` : (isMySlot ? '您目前就座於此席位' : (isFull && !isSeated ? '此區域出戰席位已額滿，無法加入' : '點擊入座此席位'))}">
                                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                                    <strong style="font-size:13px;">${label}</strong>
                                    ${badgeHtml}
                                </div>
                                <div style="font-size:11px; color:#5c381e; font-weight:bold;">
                                    🏝️ 基地：${islandLoc} (7塊)
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function selectTeamSlot(teamId, slot) {
    if (!Game.teams[teamId]) return;
    const targetTeam = Game.teams[teamId];
    const targetMember = targetTeam.members ? targetTeam.members[slot - 1] : null;

    // Mutex Protection: Check if already occupied by another client
    const isMine = !Game.isSpectator && targetMember && targetMember.clientId === myClientId;
    if (targetMember && targetMember.isOccupied && !isMine && targetMember.clientId && targetMember.clientId !== myClientId) {
        promptSeatOccupied(targetMember.name || '其他選手');
        renderTeamSelectCards();
        return;
    }

    // Capacity Lockout: If user is not currently seated and match is full
    if (!isCurrentUserSeated() && isMatchFull()) {
        alert(`⛔ 本區域出戰席位已額滿（共 ${getOccupiedSeatsCount()}/${getMatchSeatCapacity()} 人滿座）！\n本組合已無法再加入新選手。\n\n請選擇：\n1. 切換至其他 2~5 區參賽\n2. 點擊「🎙️ 裁判 / 大螢幕觀戰席」進入大螢幕觀賽！`);
        renderTeamSelectCards();
        return;
    }

    const prevTeamId = Game.isSpectator ? null : Game.currentTeamId;
    const prevSlot = Game.isSpectator ? null : Game.myPlayer.slot;

    // Vacate previous slot if different
    if (prevTeamId && prevSlot && (prevTeamId !== teamId || prevSlot !== slot)) {
        const prevTeam = Game.teams[prevTeamId];
        if (prevTeam && prevTeam.members && prevTeam.members[prevSlot - 1]) {
            prevTeam.members[prevSlot - 1].isOccupied = false;
            prevTeam.members[prevSlot - 1].clientId = null;
        }
    }

    Game.isSpectator = false;
    Game.currentTeamId = teamId;
    Game.myPlayer.teamId = teamId;
    Game.myPlayer.slot = slot;

    // Occupy new slot
    if (targetTeam.members && targetTeam.members[slot - 1]) {
        targetTeam.members[slot - 1].name = Game.myPlayer.name;
        targetTeam.members[slot - 1].isOccupied = true;
        targetTeam.members[slot - 1].clientId = myClientId;
    }

    try {
        localStorage.setItem('pagamo_logged_in_team', teamId);
        localStorage.setItem('pagamo_logged_in_slot', slot);
    } catch (e) {}

    broadcastSync({
        type: 'JOIN_SLOT',
        teamId: teamId,
        slot: slot,
        playerName: Game.myPlayer.name,
        clientId: myClientId,
        prevTeamId: prevTeamId,
        prevSlot: prevSlot
    });

    logBattle(`👤 您已成功加入【${targetTeam.name}】（席位 ${slot}：${Game.myPlayer.name}）！席位已即時鎖定。`);
    if (window.soundManager && typeof window.soundManager.playClick === 'function') {
        window.soundManager.playClick();
    }
    updateUI();
    renderTeamSelectCards();
    focusMyIsland();
}

function selectSpectatorMode() {
    const prevTeamId = Game.currentTeamId;
    const prevSlot = Game.myPlayer.slot;

    if (!Game.isSpectator && prevTeamId && prevSlot && Game.teams[prevTeamId] && Game.teams[prevTeamId].members && Game.teams[prevTeamId].members[prevSlot - 1]) {
        Game.teams[prevTeamId].members[prevSlot - 1].isOccupied = false;
        Game.teams[prevTeamId].members[prevSlot - 1].clientId = null;
    }

    Game.isSpectator = true;
    Game.myPlayer.slot = 0;
    Game.myPlayer.name = '裁判 / 大螢幕觀戰';

    try {
        localStorage.setItem('pagamo_logged_in_team', 'SPECTATOR');
        localStorage.setItem('pagamo_logged_in_slot', 0);
    } catch (e) {}

    broadcastSync({
        type: 'VACATE_SLOT',
        teamId: prevTeamId,
        slot: prevSlot,
        clientId: myClientId
    });

    logBattle(`🎙️ 您已切換為【裁判 / 觀戰大螢幕模式】，不佔用任何選手席位，可專注全場計分與發令！`);
    if (window.soundManager && typeof window.soundManager.playClick === 'function') {
        window.soundManager.playClick();
    }
    renderTeamSelectCards();
    updateUI();
    closeTeamLoginModal();
}

function resetAllSeats(shouldBroadcast = true) {
    if (shouldBroadcast) {
        const ok = confirm('確定要釋放全場席位嗎？\n這將清空所有隊伍選手已佔用的席位，供全體選手重新挑選入座。');
        if (!ok) return;
    }

    Object.values(Game.teams).forEach(t => {
        if (t.members) {
            t.members.forEach(m => {
                m.isOccupied = false;
                m.clientId = null;
            });
        }
    });

    if (shouldBroadcast) {
        broadcastSync({
            type: 'RESET_ALL_SEATS'
        });
    }

    logBattle(`🔄 已執行【釋放全場席位】！所有隊伍席位已清空，開放重新選擇。`);
    if (window.soundManager && typeof window.soundManager.playClick === 'function') {
        window.soundManager.playClick();
    }
    renderTeamSelectCards();
    updateUI();
}

function selectTeam(teamId, slot = 1) {
    selectTeamSlot(teamId, slot);
}

if (typeof window !== 'undefined') {
    window.selectTeamSlot = selectTeamSlot;
    window.selectTeam = selectTeam;
    window.selectSpectatorMode = selectSpectatorMode;
    window.confirmAndEnterGame = confirmAndEnterGame;
    window.closeTeamLoginModal = closeTeamLoginModal;
    window.openTeamLoginModal = openTeamLoginModal;
    window.resetAllSeats = resetAllSeats;
    window.promptSeatOccupied = promptSeatOccupied;
    window.updateMyPlayerName = updateMyPlayerName;
}

function logBattle(msg) {
    const logBox = document.getElementById('battleLogList');
    if (!logBox) return;

    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = msg;
    logBox.prepend(item);

    while (logBox.children && logBox.children.length > 6) {
        const last = logBox.lastChild || logBox.children[logBox.children.length - 1];
        if (last && typeof logBox.removeChild === 'function') {
            logBox.removeChild(last);
        } else {
            break;
        }
    }
}

// ==================== Audio & Fullscreen Utilities ====================
function toggleSound() {
    window.soundManager.enabled = !window.soundManager.enabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
        btn.textContent = window.soundManager.enabled ? '🔊' : '🔇';
    }
    logBattle(`🔊 音效已${window.soundManager.enabled ? '開啟' : '靜音'}`);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }
}

// ==================== End Match & Ceremony ====================
function endMatch(shouldBroadcast = true) {
    pauseMatch(false);
    window.soundManager.playVictory();

    const activeTeams = Game.activeTeamIds.map(id => ({
        ...Game.teams[id],
        stats: computeTeamStats(id)
    }));

    activeTeams.sort((a, b) => b.stats.totalScore - a.stats.totalScore);
    const winner = activeTeams[0];

    document.getElementById('resultsWinnerText').textContent = `🏆 冠軍隊伍：【${winner.name}】榮耀獲勝！`;

    const teamTableBody = document.getElementById('resTeamsStatsBody');
    teamTableBody.innerHTML = '';

    const maxSlots = getModeMaxSlots();

    activeTeams.forEach((t, idx) => {
        const energiesStr = t.members.slice(0, maxSlots).map((m, i) => `P${i + 1}:${typeof m.energy === 'number' ? m.energy : 500}`).join(' ｜ ');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx === 0 ? '👑 總冠軍' : idx + 1}</td>
            <td><strong style="color:${t.color}">${t.name} (${maxSlots}人)</strong></td>
            <td><span class="team-badge ${t.allianceId === 'ALLIANCE_A' ? 'badge-alliance-a' : 'badge-alliance-b'}">${t.alliance}</span></td>
            <td><strong style="color:#b87b00; font-size:16px">${t.stats.totalScore}</strong></td>
            <td>${t.stats.castles} 座 (${t.stats.castles * 100}分)</td>
            <td>${t.stats.bunkers} 座 (${t.stats.bunkers * 80}分)</td>
            <td>${t.stats.cannons} 座 (${t.stats.cannons * 50}分)</td>
            <td>${t.correctCount} 題 (${t.correctCount * 7}分)</td>
            <td>${t.stats.newTerritories} 塊 (${t.stats.newTerritories * 3}分)</td>
            <td>⚡ ${energiesStr}</td>
        `;
        teamTableBody.appendChild(tr);
    });

    document.getElementById('resultsModal').style.display = 'flex';

    if (shouldBroadcast) {
        broadcastSync({ type: 'END_MATCH' });
    }
}

function restartMatch(shouldBroadcast = true) {
    document.getElementById('resultsModal').style.display = 'none';
    if (Game.timerInterval) {
        clearInterval(Game.timerInterval);
        Game.timerInterval = null;
    }
    Game.isRunning = false;
    Game.hasStarted = false;
    Game.timeRemaining = Game.config.totalDuration;

    // Clear saved snapshot for current room so it resets freshly
    if (Game.roomStates && Game.roomStates[Game.roomId]) {
        delete Game.roomStates[Game.roomId];
    }
    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('pagamo_room_state_' + Game.roomId);
        }
    } catch (e) {}

    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn) {
        if (Game.playMode === 'TOURNAMENT') {
            playBtn.innerHTML = '▶️ 開始比賽';
            playBtn.className = 'wood-btn btn-gold';
        } else {
            playBtn.innerHTML = '📖 練習中(隨時作答)';
            playBtn.className = 'wood-btn';
        }
    }

    updateTimerDisplay();

    Object.values(Game.teams).forEach(t => {
        t.correctCount = 0;
        t.wrongCount = 0;
        t.members.forEach(m => {
            m.energy = 500;
        });
        t.energy = 500 * t.members.length;
    });

    initMapState(false);
    refreshGameQuestionBank(false);
    updateUI();
    resetCamera();
    logBattle(`🔄 比賽已重設開局，每位選手能量恢復 500 點，積分歸 0，全新題庫已隨機換抽！`);

    if (shouldBroadcast) {
        broadcastSync({ type: 'RESET_MATCH' });
    }
}

function exportResultsCSV() {
    const maxSlots = getModeMaxSlots();
    const modeLabel = Game.matchMode === '1VS1' ? '1對1 模式 (2隊 · 2人單挑)'
        : (Game.matchMode === '2VS2' ? '2對2 模式 (2隊 · 4人雙人)'
        : (Game.matchMode === '2TEAMS' ? '雙隊對決 (2隊 · 6人官方規格)'
        : '四隊爭霸 (4隊 · 12人全場同賽)'));

    let csv = '\uFEFF';
    csv += 'PaGamO 城堡爭奪賽 - 總決賽中排灣語競賽成績單\n';
    csv += `競賽時長,${Math.round(Game.config.totalDuration / 60)} 分鐘\n`;
    csv += `賽制模式,${modeLabel} (每隊${maxSlots}人 · 每人500能量)\n`;
    csv += `團隊總積分採計公式,特殊地形積分加總 + Σ [ (答對數 × 7) + (新佔領地數 × 3) ] (初始積分為0)\n\n`;
    csv += `名次,隊伍名稱,所屬陣營,總積分,城堡數,碉堡數,砲台數,答對數,答錯數,新佔領地數,隊員剩餘能量\n`;

    const activeTeams = Game.activeTeamIds.map(id => ({
        ...Game.teams[id],
        stats: computeTeamStats(id)
    })).sort((a, b) => b.stats.totalScore - a.stats.totalScore);

    activeTeams.forEach((t, idx) => {
        const memEnergies = t.members.slice(0, maxSlots).map((m, i) => `隊員${i + 1}:${m.energy || 500}`).join(';');
        csv += `${idx + 1},${t.name},${t.alliance},${t.stats.totalScore},${t.stats.castles},${t.stats.bunkers},${t.stats.cannons},${t.correctCount},${t.wrongCount},${t.stats.newTerritories},"${memEnergies}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaGamO_中排灣語決賽成績單_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ==================== Question Bank Manager UI ====================
function openQBankModal() {
    renderQBankList('全部', '');
    document.getElementById('qbankModal').style.display = 'flex';
}

function closeQBankModal() {
    document.getElementById('qbankModal').style.display = 'none';
}

function renderQBankList(categoryFilter, searchTerm) {
    const listEl = document.getElementById('qbankListWrap');
    listEl.innerHTML = '';

    const questions = window.QUESTION_BANK || [];
    const filtered = questions.filter(q => {
        const matchCat = categoryFilter === '全部' || q.category === categoryFilter || q.type === categoryFilter;
        const matchSearch = !searchTerm || q.question.toLowerCase().includes(searchTerm.toLowerCase()) || q.explanation.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    const roundTip = Game.questionBankRound ? ` · 第 ${Game.questionBankRound} 輪隨機抽題` : '';
    document.getElementById('qbankCountBadge').textContent = `篩選顯示 ${filtered.length} 題 / 全局共 ${questions.length} 題（依據《25中排灣語_句型練習.pdf》出題${roundTip}）`;

    filtered.forEach(q => {
        const card = document.createElement('div');
        card.className = 'qbank-card';
        card.innerHTML = `
            <div class="qcard-header">
                <span class="q-badge" style="background:#27ae60">${q.subject || '中排灣語'} · ${q.category} · ${q.type}</span>
                <span style="color:#888">題號 #${q.id}</span>
            </div>
            <div class="qcard-title">${q.question.replace(/\n/g, '<br>')}</div>
            <div class="qcard-opts">
                ${q.options.map((opt, i) => `
                    <div class="${i === q.answer ? 'qcard-correct' : ''}">
                        ${['A','B','C','D'][i]}. ${opt} ${i === q.answer ? '✓' : ''}
                    </div>
                `).join('')}
            </div>
            <div style="font-size:11px; color:#4e342e; background:#f5efe6; padding:6px 10px; border-radius:4px; border:1px solid #e0d0be;">
                <strong>解析:</strong><br>${q.explanation.replace(/\n/g, '<br>')}
            </div>
        `;
        listEl.appendChild(card);
    });
}

// ==================== Game Settings Modal ====================
function openSettingsModal() {
    const cfgRoomSelect = document.getElementById('cfgRoomSelect');
    if (cfgRoomSelect) cfgRoomSelect.value = Game.roomId;
    const cfgPlayMode = document.getElementById('cfgPlayMode');
    if (cfgPlayMode) cfgPlayMode.value = Game.playMode;
    const cfgMatchMode = document.getElementById('cfgMatchMode');
    if (cfgMatchMode) cfgMatchMode.value = Game.matchMode;
    renderCfgTeamSelector();
    const cfgHint = document.getElementById('cfgRuleHint');
    if (cfgHint) {
        cfgHint.innerHTML = `💡 規則提示：一隊 ${getModeMaxSlots()} 人。每位隊員個人能量 500 點（獨立計量），答對消耗 6 點能量，答錯消耗 15 點能量。<br>特殊地形積分：城堡 100 分、碉堡 80 分、砲台 50 分。一開始總積分為 0 分！`;
    }
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function applySettings() {
    const durationMins = parseInt(document.getElementById('cfgMatchDuration').value) || 20;
    Game.config.totalDuration = durationMins * 60;
    if (Game.playMode === 'TOURNAMENT' && !Game.isRunning) {
        Game.timeRemaining = Game.config.totalDuration;
        updateTimerDisplay();
    }

    const selectedRoom = document.getElementById('cfgRoomSelect') ? document.getElementById('cfgRoomSelect').value : Game.roomId;
    if (selectedRoom && selectedRoom !== Game.roomId) {
        switchRoom(selectedRoom);
    }

    const selectedPlayMode = document.getElementById('cfgPlayMode') ? document.getElementById('cfgPlayMode').value : Game.playMode;
    if (selectedPlayMode && selectedPlayMode !== Game.playMode) {
        switchPlayMode(selectedPlayMode);
    }

    const selectedMode = document.getElementById('cfgMatchMode').value;
    if (selectedMode !== Game.matchMode) {
        switchMatchMode(selectedMode);
    }

    closeSettingsModal();
    const modeDesc = Game.matchMode === '1VS1' ? '1對1 (2人)'
        : (Game.matchMode === '2VS2' ? '2對2 (4人)'
        : (Game.matchMode === '2TEAMS' ? '雙隊對決 (6人)'
        : '四隊爭霸 (12人)'));
    logBattle(`⚙️ 設定已套用：區域【${getRoomLabel(Game.roomId)}】｜ 模式【${Game.playMode === 'TOURNAMENT' ? '比賽模式' : '練習模式'}】｜ 競賽時長 ${durationMins} 分鐘 ｜ 賽制: ${modeDesc}`);
    updateUI();
}

// ==================== Bootstrapping ====================
window.addEventListener('DOMContentLoaded', () => {
    // Restore saved settings
    try {
        const savedName = localStorage.getItem('pagamo_player_name');
        if (savedName) Game.myPlayer.name = savedName;

        const savedTeam = localStorage.getItem('pagamo_logged_in_team');
        if (savedTeam === 'SPECTATOR') {
            Game.isSpectator = true;
            Game.myPlayer.slot = 0;
            Game.myPlayer.name = '裁判 / 大螢幕觀戰';
        } else if (savedTeam && Game.teams[savedTeam]) {
            Game.isSpectator = false;
            Game.currentTeamId = savedTeam;
            Game.myPlayer.teamId = savedTeam;
        }

        const rawSlot = localStorage.getItem('pagamo_logged_in_slot');
        const parsedSlot = (rawSlot !== null && rawSlot !== '') ? parseInt(rawSlot, 10) : 0;
        if (!Game.isSpectator && parsedSlot > 0 && parsedSlot <= 3 && savedTeam && Game.teams[savedTeam]) {
            Game.myPlayer.slot = parsedSlot;
            if (Game.teams[Game.currentTeamId] && Game.teams[Game.currentTeamId].members && Game.teams[Game.currentTeamId].members[parsedSlot - 1]) {
                Game.teams[Game.currentTeamId].members[parsedSlot - 1].isOccupied = true;
                Game.teams[Game.currentTeamId].members[parsedSlot - 1].name = Game.myPlayer.name;
                Game.teams[Game.currentTeamId].members[parsedSlot - 1].clientId = myClientId;
            }
        } else if (!Game.isSpectator) {
            Game.myPlayer.slot = 0;
        }
    } catch (e) {}

    // Initialize Room ID (Default: room1, 1-5 區選項)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let rParam = urlParams.get('room');
        if (rParam && rParam.trim()) {
            rParam = rParam.trim();
            if (/^[1-5]$/.test(rParam)) rParam = 'room' + rParam;
            Game.roomId = rParam;
        } else {
            const savedRoom = localStorage.getItem('pagamo_room_id');
            if (savedRoom && savedRoom.trim()) {
                let s = savedRoom.trim();
                if (/^[1-5]$/.test(s)) s = 'room' + s;
                if (s === 'wangjia2026') s = 'room1';
                Game.roomId = s;
            } else {
                Game.roomId = 'room1';
            }
        }
    } catch (e) {
        Game.roomId = 'room1';
    }

    const roomSelect = document.getElementById('roomSelect');
    if (roomSelect) roomSelect.value = Game.roomId;
    const cfgRoomSelect = document.getElementById('cfgRoomSelect');
    if (cfgRoomSelect) cfgRoomSelect.value = Game.roomId;

    // Connect to MQTT & Local Network Sync
    initNetworkSync();

    // Initialize Map, Canvas, Question Pool, and UI synchronously
    initMapState(false);
    refreshGameQuestionBank(true);
    initCanvas();
    // Default to Tournament Mode
    Game.playMode = 'TOURNAMENT';
    const navPlayModeSel = document.getElementById('playModeSelect');
    if (navPlayModeSel) navPlayModeSel.value = 'TOURNAMENT';
    const cfgPlayModeSel = document.getElementById('cfgPlayMode');
    if (cfgPlayModeSel) cfgPlayModeSel.value = 'TOURNAMENT';
    updateTimerDisplay();
    updateUI();
    if (!Game.isSpectator && isCurrentUserSeated()) {
        focusMyIsland();
    } else {
        resetCamera();
    }

    // On mobile devices / portrait tablets (<= 768px or height <= 520px), auto-collapse the leaderboard to maximize map arena
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || window.innerHeight <= 520)) {
        toggleLeaderboard(true);
    }

    // Load sprite assets asynchronously in background
    initAssets(() => {});

    logBattle(`🏆 歡迎來到 PaGamO 城堡爭奪戰 總決賽！`);
    logBattle(`💡 目前為【比賽模式】（預設），按下右上角「▶️ 開始比賽」後方可開始占地、作答與計分；亦可切換為【練習模式】隨時自由作答！`);

    // URL Hash / Query router
    const hash = (window.location.hash || '').replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const modalParam = hash || params.get('modal');

    if (modalParam === 'none') {
        closeTeamLoginModal(true);
    } else if (modalParam === 'qmodal') {
        closeTeamLoginModal(true);
        openQuestionModal('0,-1', true);
    } else if (modalParam === 'results') {
        closeTeamLoginModal(true);
        endMatch();
    } else if (modalParam === 'qbank') {
        closeTeamLoginModal(true);
        openQBankModal();
    } else {
        // First time in session: open team login modal
        if (!sessionStorage.getItem('pagamo_welcomed')) {
            sessionStorage.setItem('pagamo_welcomed', 'true');
            openTeamLoginModal();
        }
    }
});

window.addEventListener('load', () => {
    if (!Game.isSpectator && isCurrentUserSeated()) {
        focusMyIsland();
    } else {
        resetCamera();
    }

    // On mobile devices / portrait tablets (<= 768px or height <= 520px), auto-collapse the leaderboard to maximize map arena
    if (typeof window !== 'undefined' && (window.innerWidth <= 768 || window.innerHeight <= 520)) {
        toggleLeaderboard(true);
    }
});
