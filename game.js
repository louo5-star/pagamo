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
        maxEnergy: 1000,
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
    gameSpeed: 1,

    // Real-Time Room & Networking
    roomId: 'wangjia2026',
    floatingTexts: [],
    mqttClient: null,

    // Match Mode: '2TEAMS' (2隊6人, 一隊3人) or '4TEAMS' (4隊12人, 一隊3人)
    matchMode: '2TEAMS',
    activeTeamIds: ['T1', 'T4'], // Default: 望嘉小尖兵 vs 族夢團

    // Current local player identity
    myPlayer: {
        name: '選手 1',
        teamId: 'T1',
        slot: 1
    },
    currentTeamId: 'T1',

    // 6 Teams (Each has 3 Player Slots)
    teams: {
        'T1': {
            id: 'T1',
            name: '望嘉小尖兵',
            alliance: '望嘉聯隊',
            allianceId: 'ALLIANCE_A',
            color: '#27ae60',
            lightColor: '#2ecc71',
            darkColor: '#145a32',
            badgeClass: 'badge-t1',
            icon: '🛡️',
            energy: 1000,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 0,
            islandName: '北方海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null }
            ]
        },
        'T2': {
            id: 'T2',
            name: '望嘉先鋒隊',
            alliance: '望嘉聯隊',
            allianceId: 'ALLIANCE_A',
            color: '#0984e3',
            lightColor: '#74b9ff',
            darkColor: '#0a3d62',
            badgeClass: 'badge-t2',
            icon: '⚡',
            energy: 1000,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 1,
            islandName: '東北海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null }
            ]
        },
        'T3': {
            id: 'T3',
            name: '望嘉勇士隊',
            alliance: '望嘉聯隊',
            allianceId: 'ALLIANCE_A',
            color: '#6c5ce7',
            lightColor: '#a29bfe',
            darkColor: '#2c2c54',
            badgeClass: 'badge-t3',
            icon: '🏹',
            energy: 1000,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 2,
            islandName: '東南海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null }
            ]
        },
        'T4': {
            id: 'T4',
            name: '族夢團',
            alliance: '部落聯隊',
            allianceId: 'ALLIANCE_B',
            color: '#d63031',
            lightColor: '#ff7675',
            darkColor: '#78281f',
            badgeClass: 'badge-t4',
            icon: '🌟',
            energy: 1000,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 3,
            islandName: '南方海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null }
            ]
        },
        'T5': {
            id: 'T5',
            name: '風那裡女團',
            alliance: '部落聯隊',
            allianceId: 'ALLIANCE_B',
            color: '#9b59b6',
            lightColor: '#e056fd',
            darkColor: '#512e5f',
            badgeClass: 'badge-t5',
            icon: '🌸',
            energy: 1000,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 4,
            islandName: '西南海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null }
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
            energy: 1000,
            correctCount: 0,
            wrongCount: 0,
            islandIdx: 5,
            islandName: '西北海域島嶼',
            members: [
                { slot: 1, name: '隊長', isOccupied: false, clientId: null },
                { slot: 2, name: '隊員 2', isOccupied: false, clientId: null },
                { slot: 3, name: '隊員 3', isOccupied: false, clientId: null }
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

    // Sprites
    sprites: {}
};

// ==================== Cross-Device Real-Time Sync (MQTT over WebSocket + BroadcastChannel) ====================
const myClientId = 'C_' + Math.random().toString(36).substring(2, 9);
let syncChannel = null;

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

function promptChangeRoomId() {
    const cur = Game.roomId || 'wangjia2026';
    const newRoom = prompt('請輸入競賽房間代碼 (所有選手與裁判輸入相同代碼即可跨裝置即時比賽與計分)：', cur);
    if (newRoom && newRoom.trim() && newRoom.trim() !== cur) {
        switchRoom(newRoom.trim());
    }
}

function switchRoom(newRoomId) {
    if (!newRoomId || newRoomId === Game.roomId) return;
    const oldTopic = `pagamo/room/${Game.roomId}`;
    Game.roomId = newRoomId;

    try {
        localStorage.setItem('pagamo_room_id', newRoomId);
        const url = new URL(window.location.href);
        url.searchParams.set('room', newRoomId);
        window.history.replaceState({}, '', url.toString());
    } catch (e) {}

    const navRoomEl = document.getElementById('navRoomId');
    if (navRoomEl) navRoomEl.textContent = newRoomId;

    if (Game.mqttClient && Game.mqttClient.connected) {
        try { Game.mqttClient.unsubscribe(oldTopic); } catch(e){}
        const newTopic = `pagamo/room/${Game.roomId}`;
        Game.mqttClient.subscribe(newTopic, () => {
            broadcastSync({ type: 'REQUEST_SYNC_STATE' });
        });
    }

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

    logBattle(`🏟️ 已切換進入競賽房間：【${newRoomId}】`);
    broadcastSync({ type: 'REQUEST_SYNC_STATE' });
}

function handleIncomingSync(data) {
    if (!data || !data.type) return;
    if (data.roomId && data.roomId !== Game.roomId) return;

    if (data.type === 'CAPTURE') {
        const { teamId, tileKey, energy, correctCount, playerName, pointsAdded } = data;
        if (Game.teams[teamId]) {
            Game.teams[teamId].energy = energy;
            Game.teams[teamId].correctCount = correctCount;
        }
        Game.tileOwners[tileKey] = { teamId };
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
        const { teamId, energy, wrongCount, playerName, tileKey } = data;
        if (Game.teams[teamId]) {
            Game.teams[teamId].energy = energy;
            Game.teams[teamId].wrongCount = wrongCount;
        }
        if (tileKey && Game.map && Game.map.tiles[tileKey]) {
            const [tq, tr] = tileKey.split(',').map(Number);
            const worldPos = hexToWorld(tq, tr);
            addFloatingText(worldPos.x, worldPos.y - 15, '⚡ -15 答錯', '#ff7675', false);
        }
        window.soundManager.playWrong();
        logBattle(`❌【${Game.teams[teamId] ? Game.teams[teamId].name : teamId}】${playerName ? `(${playerName})` : ''} 答錯題目 (-15能量)`);
        updateUI();
    } else if (data.type === 'START_MATCH') {
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
        const { teamId, slot, playerName } = data;
        if (Game.teams[teamId] && Game.teams[teamId].members[slot - 1]) {
            Game.teams[teamId].members[slot - 1].name = playerName;
            Game.teams[teamId].members[slot - 1].isOccupied = true;
        }
        renderTeamSelectCards();
        updateUI();
    } else if (data.type === 'MODE_CHANGE') {
        switchMatchMode(data.mode, false);
    } else if (data.type === 'RESET_MATCH') {
        restartMatch(false);
    } else if (data.type === 'END_MATCH') {
        endMatch(false);
    } else if (data.type === 'REQUEST_SYNC_STATE') {
        const snapshot = {
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
                members: t.members
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
        if (s.matchMode && s.matchMode !== Game.matchMode) {
            switchMatchMode(s.matchMode, false);
        }
        if (s.tileOwners) {
            Game.tileOwners = { ...s.tileOwners };
        }
        if (s.teams) {
            Object.entries(s.teams).forEach(([id, tData]) => {
                if (Game.teams[id]) {
                    Game.teams[id].energy = tData.energy;
                    Game.teams[id].correctCount = tData.correctCount;
                    Game.teams[id].wrongCount = tData.wrongCount;
                    if (tData.members) Game.teams[id].members = tData.members;
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
        logBattle('🌐 已成功與同房間比賽進度即時同步！');
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

// ==================== Match Mode & Island Allocation ====================
function switchMatchMode(mode, shouldBroadcast = true) {
    if (mode !== '2TEAMS' && mode !== '4TEAMS') return;
    Game.matchMode = mode;

    if (mode === '2TEAMS') {
        // 2 Teams (3 players per team = 6 players)
        Game.activeTeamIds = ['T1', 'T4']; // 望嘉小尖兵 VS 族夢團
    } else {
        // 4 Teams (3 players per team = 12 players)
        Game.activeTeamIds = ['T1', 'T2', 'T4', 'T5']; // 4 Teams
    }

    if (!Game.activeTeamIds.includes(Game.currentTeamId)) {
        Game.currentTeamId = Game.activeTeamIds[0];
        Game.myPlayer.teamId = Game.activeTeamIds[0];
    }

    // Update Mode Select Dropdown & Buttons
    const selectEl = document.getElementById('matchModeSelect');
    if (selectEl) selectEl.value = mode;

    const cfgModeEl = document.getElementById('cfgMatchMode');
    if (cfgModeEl) cfgModeEl.value = mode;

    const btn2 = document.getElementById('modeBtn2');
    const btn4 = document.getElementById('modeBtn4');
    if (btn2 && btn4) {
        btn2.classList.toggle('active', mode === '2TEAMS');
        btn4.classList.toggle('active', mode === '4TEAMS');
    }

    initMapState(false);
    updateUI();
    renderTeamSelectCards();

    const modeName = mode === '2TEAMS' ? '雙隊對決 (2隊 · 6人同場)' : '四隊爭霸 (4隊 · 12人同場)';
    logBattle(`⚙️ 賽制切換為：【${modeName}】，一隊3人，初始總積分皆為 0 分！`);

    if (shouldBroadcast) {
        broadcastSync({ type: 'MODE_CHANGE', mode });
    }
}

function initMapState(reroll = false) {
    Game.map = window.MAP_PRESET;
    Game.tileOwners = {};

    const activeTeams = Game.activeTeamIds.map(id => Game.teams[id]);

    if (Game.matchMode === '2TEAMS') {
        // 2 Teams symmetrically placed on North (Island 0) and South (Island 3)
        const islandAssignments = [0, 3];
        activeTeams.forEach((team, idx) => {
            const islIdx = islandAssignments[idx];
            team.islandIdx = islIdx;
            const island = Game.map.islands[islIdx];
            if (island) {
                team.islandName = island.name || (islIdx === 0 ? '北方海域島嶼' : '南方海域島嶼');
                island.assignedTeam = team.id;
                island.hexes.forEach(([q, r]) => {
                    Game.tileOwners[`${q},${r}`] = { teamId: team.id };
                });
            }
        });
    } else {
        // 4 Teams symmetrically placed on North (0), Northeast (1), South (3), Southwest (4)
        const islandAssignments = [0, 1, 3, 4];
        activeTeams.forEach((team, idx) => {
            const islIdx = islandAssignments[idx];
            team.islandIdx = islIdx;
            const island = Game.map.islands[islIdx];
            if (island) {
                island.assignedTeam = team.id;
                island.hexes.forEach(([q, r]) => {
                    Game.tileOwners[`${q},${r}`] = { teamId: team.id };
                });
            }
        });
    }

    logBattle(`🏁 比賽地圖就緒！${activeTeams.length} 支參賽隊伍已入駐各自外圍島嶼，初始積分為 0 分！`);
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
    // Each island initially has 7 hexes. Only newly conquered territories beyond initial island grant +3 points!
    const newTerritories = Math.max(0, territories - 7);
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

// ==================== Game Loop & Timer ====================
function startMatch(shouldBroadcast = true) {
    if (Game.isRunning) return;
    Game.isRunning = true;
    window.soundManager.init();

    const btn = document.getElementById('playPauseBtn');
    if (btn) btn.innerHTML = '⏸️ 暫停計時';

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
        logBattle('▶️ 比賽正式開始！全體選手倒數計時啟動！');
    }
}

function pauseMatch(shouldBroadcast = true) {
    Game.isRunning = false;
    const btn = document.getElementById('playPauseBtn');
    if (btn) btn.innerHTML = '▶️ 繼續比賽';
    if (Game.timerInterval) {
        clearInterval(Game.timerInterval);
        Game.timerInterval = null;
    }
    if (shouldBroadcast) {
        broadcastSync({ type: 'PAUSE_MATCH', timeRemaining: Game.timeRemaining });
        logBattle('⏸️ 比賽由裁判暫停');
    }
}

function togglePlayPause() {
    if (Game.isRunning) {
        pauseMatch(true);
    } else {
        startMatch(true);
    }
}

function updateTimerDisplay() {
    const mins = Math.floor(Game.timeRemaining / 60);
    const secs = Game.timeRemaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const el = document.getElementById('timerDigits');
    if (el) el.textContent = formatted;
}

// ==================== Interactive Human Answering ====================
function openQuestionModal(tileKey) {
    if (Game.isSpectator) {
        alert('🎙️ 您目前是「裁判 / 大螢幕觀戰席」，僅供全場戰況觀看與發令計時。\n如需親自攻佔領地與答題，請點選上方「選隊入座」選擇您的隊伍席位！');
        return;
    }
    const team = Game.teams[Game.currentTeamId];
    if (!team) return;

    if (team.energy < Game.config.correctEnergyCost) {
        alert('⚡ 能量不足！答對一題需要消耗 6 點能量，貴隊能量已耗盡！');
        window.soundManager.playWarning();
        return;
    }

    const targetTile = Game.map.tiles[tileKey];
    if (!targetTile) return;

    // Pick random question from 中排灣語題庫 (300題)
    const questions = window.QUESTION_BANK;
    if (!questions || questions.length === 0) {
        alert('題庫載入中，請稍候！');
        return;
    }

    const q = questions[Math.floor(Math.random() * questions.length)];
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

    document.getElementById('qTargetBanner').innerHTML = `
        <span>目標: <strong>${targetName}</strong> (+${pts}分) ｜ ${ownerTip}</span>
        <span class="q-energy-tip">⚡ 答對 -6 能量 (+7分) ｜ 答錯 -15 能量</span>
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
    const q = Game.currentQuestion;
    if (!q) return;

    const team = Game.teams[Game.currentTeamId];
    const isCorrect = selectedIdx === q.answer;
    const optionBtns = document.querySelectorAll('.q-option-btn');

    optionBtns.forEach(btn => btn.disabled = true);

    const explanationEl = document.getElementById('qExplanation');
    explanationEl.innerHTML = `<strong>【族語解析】</strong> ${q.explanation}`;
    explanationEl.style.display = 'block';

    const targetKey = q.targetKey;
    const targetTile = Game.map.tiles[targetKey];
    const prevOwner = Game.tileOwners[targetKey];

    if (isCorrect) {
        optionBtns[selectedIdx].classList.add('selected-correct');
        window.soundManager.playCorrect();

        team.energy = Math.max(0, team.energy - Game.config.correctEnergyCost);
        team.correctCount++;

        Game.tileOwners[targetKey] = {
            teamId: team.id
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
            energy: team.energy,
            correctCount: team.correctCount,
            playerName: Game.myPlayer.name,
            pointsAdded: pts
        });

        setTimeout(() => {
            closeQuestionModal();
        }, 1600);
    } else {
        optionBtns[selectedIdx].classList.add('selected-wrong');
        optionBtns[q.answer].classList.add('selected-correct');
        window.soundManager.playWrong();

        team.energy = Math.max(0, team.energy - Game.config.wrongEnergyCost);
        team.wrongCount++;

        const [tq, tr] = targetKey.split(',').map(Number);
        const worldPos = hexToWorld(tq, tr);
        addFloatingText(worldPos.x, worldPos.y - 15, '⚡ -15 答錯', '#ff7675', false);

        logBattle(`❌ 【${team.name}】(${Game.myPlayer.name}) 答錯題目！攻打失敗，扣除 15 點能量！`);

        broadcastSync({
            type: 'WRONG_ANSWER',
            teamId: team.id,
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
        const h = p && p.clientHeight > 0 ? p.clientHeight : (window.innerHeight - 48);
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
    let lastTouchX = 0, lastTouchY = 0;
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            const dx = e.touches[0].clientX - lastTouchX;
            const dy = e.touches[0].clientY - lastTouchY;
            Game.camera.x += dx;
            Game.camera.y += dy;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }
    }, { passive: true });
}

function resetCamera() {
    if (!canvas) return;
    const p = canvas.parentElement;
    const w = (p && p.clientWidth > 300) ? p.clientWidth : (window.innerWidth || 1200);
    const h = (p && p.clientHeight > 300) ? p.clientHeight : (Math.max(600, window.innerHeight - 48));
    // Center of map (0,0) in playable area (offset slightly for right leaderboard)
    Game.camera.x = Math.round((w - 200) / 2);
    Game.camera.y = Math.round(h / 2);
    Game.camera.zoom = 1.0;
}

function focusMyIsland() {
    const team = Game.teams[Game.currentTeamId];
    if (!team || !Game.map || !Game.map.islands) return;

    const island = Game.map.islands[team.islandIdx] || Game.map.islands[0];
    const { x, y } = hexToWorld(island.center[0], island.center[1]);

    const rect = canvas.getBoundingClientRect();
    Game.camera.x = rect.width / 2 - x * Game.camera.zoom;
    Game.camera.y = rect.height / 2 - y * Game.camera.zoom;
}

function onMouseDown(e) {
    if (e.button === 0) {
        Game.camera.isDragging = true;
        Game.camera.dragStartX = e.clientX - Game.camera.x;
        Game.camera.dragStartY = e.clientY - Game.camera.y;
    }
}

function onMouseMove(e) {
    if (Game.camera.isDragging) {
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

function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hit = screenToHex(mouseX, mouseY);
    if (!hit) return;

    const k = `${hit.q},${hit.r}`;
    const tile = Game.map.tiles[k];
    if (!tile) return;

    const team = Game.teams[Game.currentTeamId];
    if (!team) return;

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

    // 6. Draw Shovel Pin on Target / Hover
    if (Game.hoveredTileKey && expandableTiles.has(Game.hoveredTileKey)) {
        const [hq, hr] = Game.hoveredTileKey.split(',').map(Number);
        const { x, y } = hexToWorld(hq, hr);
        drawShovelPin(ctx, x, y);
    }

    // 7. Draw Floating Score Numbers & Animations (World Coordinates)
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
        ownerText = op ? `【${op.alliance}】${op.name}` : owner.teamId;
    }
    document.getElementById('ttOwner').textContent = ownerText;

    const actionHint = document.getElementById('ttAction');
    if (isExpandable) {
        if (owner && owner.teamId !== currentTeam.id) {
            actionHint.textContent = '⚔️ 點擊發動攻打（奪取敵方領地）！';
            actionHint.className = 'tooltip-action-hint hint-attack';
        } else {
            actionHint.textContent = '✨ 點擊回答中排灣語題目進行開拓！';
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

    // Header Title
    const titleEl = document.getElementById('lbHeaderTitle');
    if (titleEl) {
        titleEl.textContent = Game.matchMode === '2TEAMS' ? '👑 即時戰況排行榜 (2隊對決)' : '👑 即時戰況排行榜 (4隊爭霸)';
    }

    // Top Comparison Bar
    const asbA = document.getElementById('asbTitleA');
    const asbB = document.getElementById('asbTitleB');
    const scA = document.getElementById('allianceAScore');
    const scB = document.getElementById('allianceBScore');

    if (Game.matchMode === '2TEAMS') {
        const tA = Game.teams[Game.activeTeamIds[0]] || Game.teams['T1'];
        const tB = Game.teams[Game.activeTeamIds[1]] || Game.teams['T4'];
        const statsA = computeTeamStats(tA.id);
        const statsB = computeTeamStats(tB.id);
        if (asbA) asbA.innerHTML = `${tA.name}: <strong id="allianceAScore">${statsA.totalScore}</strong> 分`;
        if (asbB) asbB.innerHTML = `${tB.name}: <strong id="allianceBScore">${statsB.totalScore}</strong> 分`;

        const total = (statsA.totalScore + statsB.totalScore);
        const pctA = total > 0 ? Math.round((statsA.totalScore / total) * 100) : 50;
        document.getElementById('allianceAFill').style.width = `${pctA}%`;
        document.getElementById('allianceBFill').style.width = `${100 - pctA}%`;
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
            selectTeam(t.id, Game.myPlayer.slot);
            focusMyIsland();
        };

        const rankIcon = idx === 0 ? '👑' : `${idx + 1}.`;

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
                <span class="pr-energy">⚡ ${t.energy}</span>
            </div>
        `;
        listContainer.appendChild(row);
    });

    // Update Nav Banner Pill
    const bannerPill = document.getElementById('matchAlliancePill');
    if (bannerPill) {
        if (Game.matchMode === '2TEAMS') {
            const teamA = Game.teams[Game.activeTeamIds[0]] || Game.teams['T1'];
            const teamB = Game.teams[Game.activeTeamIds[1]] || Game.teams['T4'];
            bannerPill.innerHTML = `
                <span class="team-badge ${teamA.badgeClass}">${teamA.name} (3人)</span>
                <span style="font-size:12px; font-weight:bold; color:#f1c40f;">VS</span>
                <span class="team-badge ${teamB.badgeClass}">${teamB.name} (3人)</span>
            `;
        } else {
            bannerPill.innerHTML = `
                <span class="team-badge badge-alliance-a">望嘉聯隊 (2隊)</span>
                <span style="font-size:12px; font-weight:bold; color:#f1c40f;">VS</span>
                <span class="team-badge badge-alliance-b">部落聯隊 (2隊)</span>
            `;
        }
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

    const t = Game.teams[Game.currentTeamId];
    if (!t) return;

    const slotName = `隊員 ${Game.myPlayer.slot}`;
    document.getElementById('hudPlayerName').textContent = `${Game.myPlayer.name} (${t.name} · ${slotName})`;

    const teamBadge = document.getElementById('hudTeamBadge');
    teamBadge.textContent = t.name;
    teamBadge.className = `hud-team-tag ${t.badgeClass}`;

    const avatarRing = document.querySelector('.hud-avatar-wrapper');
    if (avatarRing) avatarRing.style.borderColor = t.color;
    const avatarBg = document.getElementById('hudAvatarBg');
    if (avatarBg) avatarBg.setAttribute('fill', t.color);

    // Energy Bar
    const energyPct = Math.max(0, Math.min(100, (t.energy / Game.config.maxEnergy) * 100));
    document.getElementById('hudEnergyFill').style.width = `${energyPct}%`;
    document.getElementById('hudEnergyLabel').textContent = `⚡ 團隊能量: ${t.energy} / ${Game.config.maxEnergy}`;

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

// ==================== Team & Seat Selection Modal (一隊3人) ====================
function openTeamLoginModal() {
    renderTeamSelectCards();
    document.getElementById('teamLoginModal').style.display = 'flex';
}

function closeTeamLoginModal() {
    document.getElementById('teamLoginModal').style.display = 'none';
}

function updateMyPlayerName(name) {
    if (!name || !name.trim()) return;
    Game.myPlayer.name = name.trim();
    try {
        localStorage.setItem('pagamo_player_name', Game.myPlayer.name);
    } catch (e) {}
    updateUI();
}

function renderTeamSelectCards() {
    const container = document.getElementById('teamSelectCards');
    if (!container) return;
    container.innerHTML = '';

    const nameInput = document.getElementById('playerNameInput');
    if (nameInput) nameInput.value = Game.myPlayer.name;

    // Show active teams based on match mode
    const displayTeamIds = Game.activeTeamIds;

    displayTeamIds.forEach(tId => {
        const t = Game.teams[tId];
        const stats = computeTeamStats(t.id);
        const isCurrentTeam = t.id === Game.currentTeamId;

        const card = document.createElement('div');
        card.className = `team-select-card ${isCurrentTeam ? 'active-login' : ''}`;

        card.innerHTML = `
            <div class="tsc-header">
                <span class="tsc-alliance ${t.allianceId === 'ALLIANCE_A' ? 'badge-alliance-a' : 'badge-alliance-b'}">${t.alliance}</span>
                <span class="tsc-status-badge" style="color:${isCurrentTeam ? '#27ae60' : '#888'};">
                    ${isCurrentTeam ? '🟢 您在此隊' : '參賽隊伍'}
                </span>
            </div>
            <div class="tsc-title-row">
                <div class="tsc-icon" style="background:${t.color}">${t.icon}</div>
                <div class="tsc-name">${t.name}</div>
            </div>
            <div class="tsc-details">
                <div>📍 初始島嶼：${t.islandName}</div>
                <div>⚡ 團隊能量：${t.energy} / 1000</div>
                <div>🚩 領地：${stats.territories} 塊 (初始7塊) ｜ 總積分：<strong>${stats.totalScore}</strong> 分</div>
            </div>

            <!-- 3 Player Seats (一隊 3 人) -->
            <div class="tsc-slots-wrap">
                <div class="tsc-slots-title">
                    <span>👥 隊員席位 (3人席)：</span>
                    <span style="color:#7f5539;">點選席位加入</span>
                </div>
                <div class="tsc-slots-grid">
                    ${[1, 2, 3].map(slot => {
                        const isMySlot = isCurrentTeam && Game.myPlayer.slot === slot;
                        const member = t.members[slot - 1];
                        const label = isMySlot ? `🟢 本人 (${Game.myPlayer.name})` : (member.isOccupied ? `👤 ${member.name}` : `席位 ${slot}`);
                        const btnClass = isMySlot ? 'tsc-slot-btn my-slot' : (member.isOccupied ? 'tsc-slot-btn occupied' : 'tsc-slot-btn');
                        return `
                            <button class="${btnClass}" onclick="selectTeamSlot('${t.id}', ${slot})">
                                <span>席位 ${slot}</span>
                                <span class="slot-badge">${isMySlot ? '您' : (member.isOccupied ? '已佔' : '空位')}</span>
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
    Game.isSpectator = false;

    // Vacate previous slot
    const prevTeam = Game.teams[Game.currentTeamId];
    if (prevTeam && prevTeam.members[Game.myPlayer.slot - 1]) {
        prevTeam.members[Game.myPlayer.slot - 1].isOccupied = false;
    }

    Game.currentTeamId = teamId;
    Game.myPlayer.teamId = teamId;
    Game.myPlayer.slot = slot;

    // Occupy new slot
    const targetTeam = Game.teams[teamId];
    if (targetTeam.members[slot - 1]) {
        targetTeam.members[slot - 1].name = Game.myPlayer.name;
        targetTeam.members[slot - 1].isOccupied = true;
    }

    try {
        localStorage.setItem('pagamo_logged_in_team', teamId);
        localStorage.setItem('pagamo_logged_in_slot', slot);
    } catch (e) {}

    broadcastSync({
        type: 'JOIN_SLOT',
        teamId: teamId,
        slot: slot,
        playerName: Game.myPlayer.name
    });

    logBattle(`👤 您已成功加入【${targetTeam.name}】（席位 ${slot}：${Game.myPlayer.name}）！`);
    window.soundManager.playClick();
    updateUI();
    renderTeamSelectCards();
    focusMyIsland();
}

function selectSpectatorMode() {
    const prevTeam = Game.teams[Game.currentTeamId];
    if (prevTeam && prevTeam.members[Game.myPlayer.slot - 1]) {
        prevTeam.members[Game.myPlayer.slot - 1].isOccupied = false;
    }

    Game.isSpectator = true;
    Game.myPlayer.slot = 0;
    Game.myPlayer.name = '裁判 / 大螢幕觀戰';

    try {
        localStorage.setItem('pagamo_logged_in_team', 'SPECTATOR');
        localStorage.setItem('pagamo_logged_in_slot', 0);
    } catch (e) {}

    logBattle(`🎙️ 您已切換為【裁判 / 觀戰大螢幕模式】，不佔用任何選手席位，可專注全場計分與發令！`);
    window.soundManager.playClick();
    renderTeamSelectCards();
    updateUI();
    closeTeamLoginModal();
}

function selectTeam(teamId, slot = 1) {
    selectTeamSlot(teamId, slot);
}

function logBattle(msg) {
    const logBox = document.getElementById('battleLogList');
    if (!logBox) return;

    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = msg;
    logBox.prepend(item);

    while (logBox.children.length > 6) {
        logBox.removeChild(logBox.lastChild);
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

    activeTeams.forEach((t, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx === 0 ? '👑 總冠軍' : idx + 1}</td>
            <td><strong style="color:${t.color}">${t.name} (3人)</strong></td>
            <td><span class="team-badge ${t.allianceId === 'ALLIANCE_A' ? 'badge-alliance-a' : 'badge-alliance-b'}">${t.alliance}</span></td>
            <td><strong style="color:#b87b00; font-size:16px">${t.stats.totalScore}</strong></td>
            <td>${t.stats.castles} 座 (${t.stats.castles * 100}分)</td>
            <td>${t.stats.bunkers} 座 (${t.stats.bunkers * 80}分)</td>
            <td>${t.stats.cannons} 座 (${t.stats.cannons * 50}分)</td>
            <td>${t.correctCount} 題 (${t.correctCount * 7}分)</td>
            <td>${t.stats.newTerritories} 塊 (${t.stats.newTerritories * 3}分)</td>
            <td>⚡ ${t.energy} / 1000</td>
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
    Game.timeRemaining = Game.config.totalDuration;
    updateTimerDisplay();

    Object.values(Game.teams).forEach(t => {
        t.energy = 1000;
        t.correctCount = 0;
        t.wrongCount = 0;
    });

    initMapState(false);
    updateUI();
    resetCamera();
    logBattle(`🔄 比賽已重設開局，所有隊伍總積分已歸 0 分！`);

    if (shouldBroadcast) {
        broadcastSync({ type: 'RESET_MATCH' });
    }
}

function exportResultsCSV() {
    let csv = '\uFEFF';
    csv += 'PaGamO 城堡爭奪賽 - 總決賽中排灣語競賽成績單\n';
    csv += `競賽時長,20 分鐘\n`;
    csv += `賽制模式,${Game.matchMode === '2TEAMS' ? '雙隊對決 (2隊 · 6人)' : '四隊爭霸 (4隊 · 12人)'} (一隊3人)\n`;
    csv += `團隊總積分採計公式,特殊地形積分加總 + Σ [ (答對數 × 7) + (新佔領地數 × 3) ] (初始積分為0)\n\n`;
    csv += `名次,隊伍名稱,所屬陣營,總積分,城堡數,碉堡數,砲台數,答對數,答錯數,新佔領地數,剩餘能量\n`;

    const activeTeams = Game.activeTeamIds.map(id => ({
        ...Game.teams[id],
        stats: computeTeamStats(id)
    })).sort((a, b) => b.stats.totalScore - a.stats.totalScore);

    activeTeams.forEach((t, idx) => {
        csv += `${idx + 1},${t.name},${t.alliance},${t.stats.totalScore},${t.stats.castles},${t.stats.bunkers},${t.stats.cannons},${t.correctCount},${t.wrongCount},${t.stats.newTerritories},${t.energy}\n`;
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

    document.getElementById('qbankCountBadge').textContent = `篩選顯示 ${filtered.length} 題 / 全題庫共 ${questions.length} 題`;

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
                <strong>解析:</strong> ${q.explanation}
            </div>
        `;
        listEl.appendChild(card);
    });
}

// ==================== Game Settings Modal ====================
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function applySettings() {
    const durationMins = parseInt(document.getElementById('cfgMatchDuration').value) || 20;
    Game.config.totalDuration = durationMins * 60;
    Game.timeRemaining = Game.config.totalDuration;
    updateTimerDisplay();

    const selectedMode = document.getElementById('cfgMatchMode').value;
    if (selectedMode !== Game.matchMode) {
        switchMatchMode(selectedMode);
    }

    closeSettingsModal();
    logBattle(`⚙️ 設定已套用：競賽時長 ${durationMins} 分鐘 ｜ 賽制模式: ${Game.matchMode === '2TEAMS' ? '雙隊對決' : '四隊爭霸'}`);
    updateUI();
}

// ==================== Bootstrapping ====================
window.addEventListener('DOMContentLoaded', () => {
    // Restore saved settings
    try {
        const savedName = localStorage.getItem('pagamo_player_name');
        if (savedName) Game.myPlayer.name = savedName;

        const savedTeam = localStorage.getItem('pagamo_logged_in_team');
        if (savedTeam && Game.teams[savedTeam]) {
            Game.currentTeamId = savedTeam;
            Game.myPlayer.teamId = savedTeam;
        }

        const savedSlot = parseInt(localStorage.getItem('pagamo_logged_in_slot')) || 1;
        Game.myPlayer.slot = savedSlot;
        if (Game.teams[Game.currentTeamId]) {
            Game.teams[Game.currentTeamId].members[savedSlot - 1].isOccupied = true;
            Game.teams[Game.currentTeamId].members[savedSlot - 1].name = Game.myPlayer.name;
        }
    } catch (e) {}

    // Initialize Room ID
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const rParam = urlParams.get('room');
        if (rParam && rParam.trim()) {
            Game.roomId = rParam.trim();
        } else {
            const savedRoom = localStorage.getItem('pagamo_room_id');
            if (savedRoom && savedRoom.trim()) Game.roomId = savedRoom.trim();
        }
    } catch (e) {}

    const navRoomEl = document.getElementById('navRoomId');
    if (navRoomEl) navRoomEl.textContent = Game.roomId;

    // Connect to MQTT & Local Network Sync
    initNetworkSync();

    // Initialize Map, Canvas, and UI synchronously
    initMapState(false);
    initCanvas();
    updateTimerDisplay();
    updateUI();

    // Load sprite assets asynchronously in background
    initAssets(() => {});

    logBattle(`🏆 歡迎來到 PaGamO 城堡爭奪戰 總決賽！`);
    logBattle(`💡 一隊 3 人，初始總積分為 0 分！請點選「選隊入座」選擇您的隊伍與席位！`);

    // URL Hash / Query router
    const hash = (window.location.hash || '').replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const modalParam = hash || params.get('modal');

    if (modalParam === 'none') {
        closeTeamLoginModal();
    } else if (modalParam === 'qmodal') {
        closeTeamLoginModal();
        openQuestionModal('0,-1');
    } else if (modalParam === 'results') {
        closeTeamLoginModal();
        endMatch();
    } else if (modalParam === 'qbank') {
        closeTeamLoginModal();
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
    resetCamera();
});
