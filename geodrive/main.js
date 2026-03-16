// GeoDrive - 3D Map Racing Game

console.log('GeoDrive loaded');

// ==================== Configuration ====================
var CONFIG = {
    maxSpeed: 300,
    maxReverse: 20,
    acceleration: 30,
    turnSpeed: 1.5,
    friction: 0.98,
    visualScale: 3,
    zoom: 20,
    pitch: 100
};

// ==================== Global State ====================
var map;
var carLngLat;
var carSpeed = 0;
var carRotation = 0;
var keys = {};
var lastTime = 0;
var inputFocused = false; // Disable controls when typing
var isNavigating = false; // Navigation state

// ==================== Initialize ====================
function initGame() {
    if (typeof maplibregl === 'undefined') {
        console.log('Waiting for MapLibre...');
        setTimeout(initGame, 200);
        return;
    }

    // Try to get user's location
    var startCenter = [13.405, 52.52]; // Berlin default

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                startCenter = [position.coords.longitude, position.coords.latitude];
                console.log('Using user location:', startCenter);
                createMap(startCenter);
            },
            function(err) {
                console.log('Using default location, error:', err.message);
                createMap(startCenter);
            },
            {timeout: 10000, enableHighAccuracy: true}
        );
    } else {
        createMap(startCenter);
    }
}

function createMap(center) {
    console.log('Starting game at:', center);

    // Check if mobile and show warning
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile || window.innerWidth < 768) {
        document.getElementById('mobile-warning').style.display = 'flex';
    }

    // Initialize car position
    carLngLat = [center[0], center[1]];

    // Create map
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: center,
        zoom: CONFIG.zoom || 20,
        pitch: CONFIG.pitch || 100,
        interactive: false
    });

    map.on('load', function() {
        document.getElementById('loading').style.display = 'none';
        setupControls();
        gameLoop();
    });
}

// ==================== Controls ====================
function setupControls() {
    // Mobile buttons
    var btnAccel = document.getElementById('btn-accel');
    var btnBrake = document.getElementById('btn-brake');
    var btnLeft = document.getElementById('btn-left');
    var btnRight = document.getElementById('btn-right');
    var btnZoomIn = document.getElementById('btn-zoom-in');
    var btnZoomOut = document.getElementById('btn-zoom-out');

    // Accelerate
    btnAccel.ontouchstart = function(e) { e.preventDefault(); keys['w'] = true; };
    btnAccel.ontouchend = function(e) { e.preventDefault(); keys['w'] = false; };
    btnAccel.onmousedown = function() { keys['w'] = true; };
    btnAccel.onmouseup = function() { keys['w'] = false; };
    btnAccel.onmouseleave = function() { keys['w'] = false; };

    // Brake/Reverse
    btnBrake.ontouchstart = function(e) { e.preventDefault(); keys['s'] = true; };
    btnBrake.ontouchend = function(e) { e.preventDefault(); keys['s'] = false; };
    btnBrake.onmousedown = function() { keys['s'] = true; };
    btnBrake.onmouseup = function() { keys['s'] = false; };
    btnBrake.onmouseleave = function() { keys['s'] = false; };

    // Left
    btnLeft.ontouchstart = function(e) { e.preventDefault(); keys['a'] = true; };
    btnLeft.ontouchend = function(e) { e.preventDefault(); keys['a'] = false; };
    btnLeft.onmousedown = function() { keys['a'] = true; };
    btnLeft.onmouseup = function() { keys['a'] = false; };
    btnLeft.onmouseleave = function() { keys['a'] = false; };

    // Right
    btnRight.ontouchstart = function(e) { e.preventDefault(); keys['d'] = true; };
    btnRight.ontouchend = function(e) { e.preventDefault(); keys['d'] = false; };
    btnRight.onmousedown = function() { keys['d'] = true; };
    btnRight.onmouseup = function() { keys['d'] = false; };
    btnRight.onmouseleave = function() { keys['d'] = false; };

    // Zoom
    btnZoomIn.onmousedown = function() { keys['zoom_in'] = true; };
    btnZoomIn.onmouseup = function() { keys['zoom_in'] = false; };
    btnZoomIn.onmouseleave = function() { keys['zoom_in'] = false; };
    btnZoomIn.ontouchstart = function(e) { e.preventDefault(); keys['zoom_in'] = true; };
    btnZoomIn.ontouchend = function(e) { e.preventDefault(); keys['zoom_in'] = false; };

    btnZoomOut.onmousedown = function() { keys['zoom_out'] = true; };
    btnZoomOut.onmouseup = function() { keys['zoom_out'] = false; };
    btnZoomOut.onmouseleave = function() { keys['zoom_out'] = false; };
    btnZoomOut.ontouchstart = function(e) { e.preventDefault(); keys['zoom_out'] = true; };
    btnZoomOut.ontouchend = function(e) { e.preventDefault(); keys['zoom_out'] = false; };

    // Keyboard controls
    document.onkeydown = function(e) {
        keys[e.key.toLowerCase()] = true;
    };
    document.onkeyup = function(e) {
        keys[e.key.toLowerCase()] = false;
    };

    console.log('Controls ready');
}

// ==================== Game Loop ====================
function gameLoop(time) {
    var deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (deltaTime > 0 && deltaTime < 0.1) {
        // Only process car controls when not typing in input fields
        if (!inputFocused) {
            // Acceleration / Reverse
            if (keys['w']) {
                carSpeed += CONFIG.acceleration * deltaTime;
            } else if (keys['s']) {
                carSpeed -= CONFIG.acceleration * deltaTime;
            } else {
                carSpeed *= CONFIG.friction;
            }

            // Clamp speed
            carSpeed = Math.max(-CONFIG.maxReverse, Math.min(CONFIG.maxSpeed, carSpeed));

            // Turning - reverse when going backwards
            var turnDir = (carSpeed < 0) ? -1 : 1;
            if (keys['a']) {
                carRotation -= CONFIG.turnSpeed * deltaTime * turnDir;
            }
            if (keys['d']) {
                carRotation += CONFIG.turnSpeed * deltaTime * turnDir;
            }
        } else {
            // Slow down when typing
            carSpeed *= 0.9;
        }

        // Move car
        var speedMps = (carSpeed * 1000) / 3600;
        var metersMoved = speedMps * deltaTime * CONFIG.visualScale;

        var latPerMeter = 1 / 111320;
        var lngPerMeter = 1 / (111320 * Math.cos(carLngLat[1] * Math.PI / 180));

        var moveAngle = carRotation;
        var dLat = Math.cos(moveAngle) * metersMoved * latPerMeter;
        var dLng = Math.sin(moveAngle) * metersMoved * lngPerMeter;

        carLngLat[0] += dLng;
        carLngLat[1] += dLat;

        // Update map
        map.setCenter(carLngLat);
        map.setBearing(carRotation * (180 / Math.PI));

        // Update UI
        document.getElementById('speed').textContent = Math.round(carSpeed);

        // Update arrow (with null check)
        var arrowEl = document.getElementById('arrow');
        if (arrowEl) {
            arrowEl.style.transform = 'translateX(-50%) rotate(' + (carRotation * 180 / Math.PI) + 'deg)';
        }

        // Handle zoom
        if (keys['zoom_in'] || keys['='] || keys['+']) {
            map.zoomIn();
        }
        if (keys['zoom_out'] || keys['-']) {
            map.zoomOut();
        }

        // Update car size based on zoom
        var carMarkerEl = document.getElementById('car-marker');
        if (carMarkerEl) {
            var z = map.getZoom();
            var s = Math.max(0.3, Math.min(6, (0.5 + (z - 20) * 0.15) * 1));
            carMarkerEl.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
        }
    }

    requestAnimationFrame(gameLoop);
}

// ==================== Sidebar ====================
function initSidebar() {
    var sidebar = document.getElementById('sidebar');
    var sidebarToggle = document.getElementById('sidebar-toggle');
    var sidebarClose = document.getElementById('sidebar-close');
    var searchInput = document.getElementById('search-input');
    var btnSearch = document.getElementById('btn-search');
    var searchResults = document.getElementById('search-results');
    var navFrom = document.getElementById('nav-from');
    var navTo = document.getElementById('nav-to');
    var btnNavigate = document.getElementById('btn-navigate');
    var navInfo = document.getElementById('nav-info');
    var btnGps = document.getElementById('btn-gps');
    var btnCancelNav = document.getElementById('btn-cancel-nav');

    // Track input focus - disable car controls when typing
    var allInputs = [searchInput, navFrom, navTo];
    allInputs.forEach(function(input) {
        input.addEventListener('focus', function() {
            inputFocused = true;
        });
        input.addEventListener('blur', function() {
            inputFocused = false;
        });
    });

    // Toggle sidebar
    sidebarToggle.onclick = function() {
        sidebar.classList.toggle('open');
    };

    sidebarClose.onclick = function() {
        sidebar.classList.remove('open');
    };

    // Search location using Nominatim
    function searchLocation(query, callback) {
        var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query);

        fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                callback(data);
            })
            .catch(function(err) {
                console.error('Search error:', err);
                callback([]);
            });
    }

    // Handle search
    function doSearch() {
        var query = searchInput.value.trim();
        if (!query) return;

        searchResults.innerHTML = '<div class="search-result-item">搜索中...</div>';

        searchLocation(query, function(results) {
            searchResults.innerHTML = '';
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-result-item">未找到结果</div>';
                return;
            }

            results.forEach(function(result) {
                var item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = result.display_name;
                item.onclick = function() {
                    var lng = parseFloat(result.lon);
                    var lat = parseFloat(result.lat);
                    goToLocation([lng, lat]);
                    searchResults.innerHTML = '';
                    searchInput.value = '';
                    sidebar.classList.remove('open');
                };
                searchResults.appendChild(item);
            });
        });
    }

    btnSearch.onclick = doSearch;
    searchInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
            doSearch();
        }
    };

    // Navigate to location
    function navigateTo() {
        var to = navTo.value.trim();
        if (!to) {
            navInfo.textContent = '请输入终点';
            return;
        }

        navInfo.textContent = '正在查找路线...';

        var from = navFrom.value.trim();

        // First get destination coordinates
        searchLocation(to, function(toResults) {
            if (toResults.length === 0) {
                navInfo.textContent = '未找到终点';
                return;
            }

            var dest = toResults[0];
            var destLng = parseFloat(dest.lon);
            var destLat = parseFloat(dest.lat);

            // If no start point, use current location
            if (from) {
                searchLocation(from, function(fromResults) {
                    if (fromResults.length === 0) {
                        navInfo.textContent = '未找到起点';
                        return;
                    }
                    var src = fromResults[0];
                    var srcLng = parseFloat(src.lon);
                    var srcLat = parseFloat(src.lat);
                    showRoute([srcLng, srcLat], [destLng, destLat], dest.display_name);
                });
            } else {
                // Use current position
                if (carLngLat) {
                    showRoute(carLngLat, [destLng, destLat], dest.display_name);
                } else {
                    navInfo.textContent = '正在定位，请稍后...';
                }
            }
        });
    }

    // Show route on map using OSRM
    function showRoute(start, end, destName) {
        // Use OSRM for proper road routing
        var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' +
            start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] +
            '?overview=full&geometries=geojson';

        navInfo.textContent = '正在计算路线...';

        fetch(osrmUrl)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                    // Fallback to straight line if OSRM fails
                    showStraightLine(start, end, destName);
                    return;
                }

                var route = data.routes[0];
                var distance = route.distance / 1000; // meters to km
                var duration = route.duration / 60; // seconds to minutes
                var geometry = route.geometry;

                // Update UI with route info
                navInfo.innerHTML = '目的地: ' + destName + '<br>' +
                    '距离: ' + distance.toFixed(1) + ' km<br>' +
                    '预计时间: ' + Math.round(duration) + ' 分钟';

                // Clear existing route
                clearRoute();

                // Add route line from OSRM
                var routeData = {
                    type: 'Feature',
                    properties: {},
                    geometry: geometry
                };

                map.addSource('route', {
                    type: 'geojson',
                    data: routeData
                });

                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#00ff88',
                        'line-width': 5,
                        'line-opacity': 0.9
                    }
                });

                // Add destination marker
                map.addSource('dest-marker', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: { name: destName },
                        geometry: {
                            type: 'Point',
                            coordinates: end
                        }
                    }
                });

                map.addLayer({
                    id: 'dest-marker',
                    type: 'circle',
                    source: 'dest-marker',
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#ff4444',
                        'circle-stroke-width': 3,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                // Add start marker
                map.addSource('start-marker', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: { name: '起点' },
                        geometry: {
                            type: 'Point',
                            coordinates: start
                        }
                    }
                });

                map.addLayer({
                    id: 'start-marker',
                    type: 'circle',
                    source: 'start-marker',
                    paint: {
                        'circle-radius': 8,
                        'circle-color': '#00ff88',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                // Set navigation state
                isNavigating = true;
                document.getElementById('btn-navigate').style.display = 'none';
                document.getElementById('btn-cancel-nav').style.display = 'block';

                // Go to start location
                map.fitBounds([
                    [Math.min(start[0], end[0]), Math.min(start[1], end[1])],
                    [Math.max(start[0], end[0]), Math.max(start[1], end[1])]
                ], { padding: 50 });

                goToLocation(start);
            })
            .catch(function(err) {
                console.error('Route error:', err);
                showStraightLine(start, end, destName);
            });
    }

    // Fallback straight line route
    function showStraightLine(start, end, destName) {
        var lat1 = start[1] * Math.PI / 180;
        var lat2 = end[1] * Math.PI / 180;
        var dLat = (end[1] - start[1]) * Math.PI / 180;
        var dLon = (end[0] - start[0]) * Math.PI / 180;

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = 6371 * c;

        navInfo.innerHTML = '目的地: ' + destName + '<br>距离: ' + distance.toFixed(1) + ' km<br>(直线)';

        clearRoute();

        var routeData = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: [start, end]
            }
        };

        map.addSource('route', {
            type: 'geojson',
            data: routeData
        });

        map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            paint: {
                'line-color': '#00ff88',
                'line-width': 4,
                'line-opacity': 0.8,
                'line-dasharray': [2, 2]
            }
        });

        isNavigating = true;
        document.getElementById('btn-navigate').style.display = 'none';
        document.getElementById('btn-cancel-nav').style.display = 'block';

        goToLocation(start);
    }

    // Clear route
    function clearRoute() {
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getSource('route')) map.removeSource('route');
        if (map.getLayer('dest-marker')) map.removeLayer('dest-marker');
        if (map.getSource('dest-marker')) map.removeSource('dest-marker');
        if (map.getLayer('start-marker')) map.removeLayer('start-marker');
        if (map.getSource('start-marker')) map.removeSource('start-marker');
    }

    // Cancel navigation
    function cancelNavigation() {
        clearRoute();
        isNavigating = false;
        document.getElementById('btn-navigate').style.display = 'block';
        document.getElementById('btn-cancel-nav').style.display = 'none';
        navInfo.textContent = '导航已取消';
    }

    btnCancelNav.onclick = cancelNavigation;

    // Go to location
    function goToLocation(lnglat) {
        carLngLat = [lnglat[0], lnglat[1]];
        map.setCenter(carLngLat);
        carSpeed = 0;
        carRotation = 0;
    }

    btnNavigate.onclick = navigateTo;

    // GPS button
    btnGps.onclick = function() {
        if (navigator.geolocation) {
            navInfo.textContent = '正在定位...';
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    var lng = position.coords.longitude;
                    var lat = position.coords.latitude;
                    goToLocation([lng, lat]);
                    navInfo.textContent = '已定位到当前GPS位置';
                },
                function(err) {
                    navInfo.textContent = '定位失败: ' + err.message;
                },
                {timeout: 10000, enableHighAccuracy: true}
            );
        } else {
            navInfo.textContent = '浏览器不支持定位';
        }
    };

    console.log('Sidebar initialized');
}

// ==================== Settings ====================
function initSettings() {
    var settingsSidebar = document.getElementById('settings-sidebar');
    var settingsToggle = document.getElementById('settings-toggle');
    var settingsClose = document.getElementById('settings-close');
    var configStatus = document.getElementById('config-status');

    // Default config
    var defaultConfig = {
        maxSpeed: 300,
        maxReverse: 20,
        acceleration: 30,
        turnSpeed: 1.5,
        friction: 0.98,
        visualScale: 3,
        zoom: 20,
        pitch: 100
    };

    // Load config from localStorage or use default
    function loadConfig() {
        var saved = localStorage.getItem('geodrive_config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch(e) {
                return defaultConfig;
            }
        }
        return defaultConfig;
    }

    // Apply config to game
    function applyConfig(config) {
        CONFIG.maxSpeed = config.maxSpeed;
        CONFIG.maxReverse = config.maxReverse;
        CONFIG.acceleration = config.acceleration;
        CONFIG.turnSpeed = config.turnSpeed;
        CONFIG.friction = config.friction;
        CONFIG.visualScale = config.visualScale;

        // Update UI sliders
        document.getElementById('config-maxSpeed').value = config.maxSpeed;
        document.getElementById('val-maxSpeed').textContent = config.maxSpeed;
        document.getElementById('config-maxReverse').value = config.maxReverse;
        document.getElementById('val-maxReverse').textContent = config.maxReverse;
        document.getElementById('config-acceleration').value = config.acceleration;
        document.getElementById('val-acceleration').textContent = config.acceleration;
        document.getElementById('config-turnSpeed').value = config.turnSpeed;
        document.getElementById('val-turnSpeed').textContent = config.turnSpeed;
        document.getElementById('config-friction').value = config.friction;
        document.getElementById('val-friction').textContent = config.friction;
        document.getElementById('config-visualScale').value = config.visualScale;
        document.getElementById('val-visualScale').textContent = config.visualScale;
        document.getElementById('config-zoom').value = config.zoom;
        document.getElementById('val-zoom').textContent = config.zoom;
        document.getElementById('config-pitch').value = config.pitch;
        document.getElementById('val-pitch').textContent = config.pitch;

        // Apply to map if map exists
        if (map) {
            map.setZoom(config.zoom);
            map.setPitch(config.pitch);
        }
    }

    // Get current config from UI
    function getCurrentConfig() {
        return {
            maxSpeed: parseInt(document.getElementById('config-maxSpeed').value),
            maxReverse: parseInt(document.getElementById('config-maxReverse').value),
            acceleration: parseInt(document.getElementById('config-acceleration').value),
            turnSpeed: parseFloat(document.getElementById('config-turnSpeed').value),
            friction: parseFloat(document.getElementById('config-friction').value),
            visualScale: parseFloat(document.getElementById('config-visualScale').value),
            zoom: parseFloat(document.getElementById('config-zoom').value),
            pitch: parseInt(document.getElementById('config-pitch').value)
        };
    }

    // Toggle sidebar
    settingsToggle.onclick = function() {
        settingsSidebar.classList.toggle('open');
    };

    settingsClose.onclick = function() {
        settingsSidebar.classList.remove('open');
    };

    // Slider value updates
    var sliders = ['maxSpeed', 'maxReverse', 'acceleration', 'turnSpeed', 'friction', 'visualScale', 'zoom', 'pitch'];
    sliders.forEach(function(name) {
        var slider = document.getElementById('config-' + name);
        var valueSpan = document.getElementById('val-' + name);
        slider.oninput = function() {
            valueSpan.textContent = this.value;
        };
    });

    // Save button
    document.getElementById('btn-save-config').onclick = function() {
        var config = getCurrentConfig();
        localStorage.setItem('geodrive_config', JSON.stringify(config));
        applyConfig(config);
        configStatus.textContent = '配置已保存';
        setTimeout(function() { configStatus.textContent = ''; }, 2000);
    };

    // Restore button
    document.getElementById('btn-restore-config').onclick = function() {
        applyConfig(defaultConfig);
        configStatus.textContent = '已恢复默认配置';
        setTimeout(function() { configStatus.textContent = ''; }, 2000);
    };

    // Delete button
    document.getElementById('btn-delete-config').onclick = function() {
        localStorage.removeItem('geodrive_config');
        applyConfig(defaultConfig);
        configStatus.textContent = '已删除保存的配置';
        setTimeout(function() { configStatus.textContent = ''; }, 2000);
    };

    // Initialize with saved or default config
    var initialConfig = loadConfig();
    applyConfig(initialConfig);

    // Check if there's saved config
    if (localStorage.getItem('geodrive_config')) {
        configStatus.textContent = '已加载保存的配置';
        setTimeout(function() { configStatus.textContent = ''; }, 2000);
    }

    console.log('Settings initialized');
}

// ==================== Start ====================
window.onload = function() {
    initSidebar();
    initSettings();
    setTimeout(initGame, 100);
};
