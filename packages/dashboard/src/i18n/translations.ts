/**
 * All user-visible strings, keyed by semantic path.
 * Keep keys stable — change values, not keys.
 */
export const translations = {
  en: {
    // Sidebar / bottom nav
    'nav.dashboard': 'Dashboard',
    'nav.devices': 'Devices',
    'nav.scenes': 'Scenes',
    'nav.automations': 'Automations',
    'nav.history': 'History',
    'nav.orbital': 'Orbital',
    'nav.features': 'Features',
    'nav.home': 'Home',

    // Header
    'header.entities': 'entities',
    'header.connected': 'Connected',
    'header.offline': 'Offline',
    'header.dashboard': 'Dashboard',
    'header.devices': 'Devices',
    'header.scenes': 'Scenes',
    'header.automations': 'Automations',
    'header.history': 'History',
    'header.orbital': 'Orbital LED Sphere',
    'header.features': 'Features & Advantages',

    // Dashboard welcome
    'welcome.title': 'Welcome home',
    'welcome.body': 'Tap the 🎤 button to control by voice — try saying',
    'welcome.example1': 'turn on the living room lights',
    'welcome.example2': 'good night',
    'welcome.or': 'or',

    // Scenes
    'scenes.quickTitle': 'Quick Scenes',
    'scenes.tapHint': 'Tap to activate',
    'scenes.activate': 'Activate',
    'scenes.activating': 'Activating…',
    'scenes.activated': 'Activated',
    'scenes.shareTitle': 'Scene shared',
    'scenes.shareCopied': 'Link copied',
    'scenes.shareOpened': 'Shared scene opened',
    'scenes.device': 'device',
    'scenes.devices': 'devices',

    // Voice
    'voice.title': 'Voice Assistant',
    'voice.listening': 'Listening…',
    'voice.executing': 'Executing…',
    'voice.idle': 'Tap the button and speak',
    'voice.speak': 'Say something…',
    'voice.confidence': 'confidence',
    'voice.start': 'Start speaking',
    'voice.stop': 'Stop',
    'voice.remembers': 'Remembers',
    'voice.tryHint': 'Say things like "brighter" / "turn it off" / "it"',
    'voice.clearContext': 'Clear',
    'voice.examples': 'Try saying:',
    'voice.example.turnOnLivingRoom': 'turn on the living room light',
    'voice.example.brighter': 'brighter',
    'voice.example.turnOff': 'turn it off',
    'voice.example.goodNight': 'good night',
    'voice.example.whatsTemperature': "what's the temperature",
    'voice.unsupported': 'Voice not supported',
    'voice.unsupportedBody': 'Please use Chrome / Edge / Safari',
    'voice.error': 'Error',
    'voice.notUnderstood': 'Not understood',
    'voice.commandReceived': 'Voice command',

    // Orbital
    'orbital.title': 'Orbital LED Sphere',
    'orbital.subtitle': '8×8 LED matrix reacts to your smart home in real-time',
    'orbital.autoMode': 'Smart Auto Mode',
    'orbital.autoModeDesc': 'LED reacts to door, motion, lights, temperature',
    'orbital.animations': 'Animations',
    'orbital.brightness': 'Brightness',
    'orbital.hue': 'Color Hue',
    'orbital.play': 'Play',
    'orbital.pause': 'Pause',
    'orbital.quickActions': 'Quick Test Actions',
    'orbital.liveFeed': 'Live Sensor Feed',
    'orbital.bridgeConnected': 'ESP32 bridge: connected',
    'orbital.bridgeOffline': 'ESP32 bridge: offline',
    'orbital.auto': 'Auto',
    'orbital.reasonDoor': 'opened',
    'orbital.reasonMotion': 'Motion at',
    'orbital.reasonHot': 'Temperature',
    'orbital.reasonHumid': 'Humidity',
    'orbital.reasonNight': 'All lights off — night mode',
    'orbital.reasonAmbient': 'Lights on — ambient mode',
    'orbital.reasonIdle': 'Idle — standby',

    // Quick test actions
    'qa.openFridge': 'Open Fridge',
    'qa.openFridgeDesc': 'Triggers Welcome animation',
    'qa.turnOnLights': 'Turn On Lights',
    'qa.turnOnLightsDesc': 'Triggers Rainbow mode',
    'qa.allOff': 'All Lights Off',
    'qa.allOffDesc': 'Triggers Night mode',

    // Settings
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.themeDark': 'Dark',
    'settings.themeLight': 'Light',

    // Features page
    'features.title': 'HomeAI — What makes us different',
    'features.subtitle': 'Privacy-first smart home control that remembers what you said',
    'features.section.core': 'Core Features',
    'features.section.compare': 'How we compare',
    'features.ctaTry': 'Try it now',

    // Scene auto-activation via URL
    'scenes.autoActivating': 'Activating',

    // Common
    'common.loading': 'Loading…',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
  },

  zh: {
    // Sidebar / bottom nav
    'nav.dashboard': '首页',
    'nav.devices': '设备',
    'nav.scenes': '场景',
    'nav.automations': '自动化',
    'nav.history': '历史',
    'nav.orbital': 'Orbital',
    'nav.features': '功能',
    'nav.home': '首页',

    // Header
    'header.entities': '个设备',
    'header.connected': '已连接',
    'header.offline': '离线',
    'header.dashboard': '首页',
    'header.devices': '设备',
    'header.scenes': '场景',
    'header.automations': '自动化',
    'header.history': '历史',
    'header.orbital': 'Orbital LED 球',
    'header.features': '功能与优势',

    // Dashboard welcome
    'welcome.title': '欢迎回家',
    'welcome.body': '点 🎤 按钮用语音控制 — 试试说',
    'welcome.example1': '打开客厅的灯',
    'welcome.example2': '晚安',
    'welcome.or': '或',

    // Scenes
    'scenes.quickTitle': '快捷场景',
    'scenes.tapHint': '点击激活',
    'scenes.activate': '激活',
    'scenes.activating': '激活中…',
    'scenes.activated': '已激活',
    'scenes.shareTitle': '分享场景',
    'scenes.shareCopied': '链接已复制',
    'scenes.shareOpened': '打开共享场景',
    'scenes.device': '个设备',
    'scenes.devices': '个设备',

    // Voice
    'voice.title': '语音助手',
    'voice.listening': '正在聆听…',
    'voice.executing': '执行中…',
    'voice.idle': '点下方按钮开始说话',
    'voice.speak': '说话吧…',
    'voice.confidence': '置信度',
    'voice.start': '开始说话',
    'voice.stop': '停止',
    'voice.remembers': '记得',
    'voice.tryHint': '试试 "再亮一点" / "关掉" / "它"',
    'voice.clearContext': '清除',
    'voice.examples': '试试说：',
    'voice.example.turnOnLivingRoom': '打开客厅的灯',
    'voice.example.brighter': '再亮一点',
    'voice.example.turnOff': '关掉',
    'voice.example.goodNight': '晚安',
    'voice.example.whatsTemperature': '温度多少度',
    'voice.unsupported': '不支持语音',
    'voice.unsupportedBody': '请使用 Chrome / Edge / Safari',
    'voice.error': '错误',
    'voice.notUnderstood': '未识别',
    'voice.commandReceived': '语音指令',

    // Orbital
    'orbital.title': 'Orbital LED 球',
    'orbital.subtitle': '8×8 LED 矩阵实时响应你的智能家居',
    'orbital.autoMode': '智能自动模式',
    'orbital.autoModeDesc': 'LED 根据门窗、人体、灯光、温度切换动画',
    'orbital.animations': '动画',
    'orbital.brightness': '亮度',
    'orbital.hue': '色调',
    'orbital.play': '播放',
    'orbital.pause': '暂停',
    'orbital.quickActions': '快捷测试',
    'orbital.liveFeed': '实时传感器',
    'orbital.bridgeConnected': 'ESP32 桥：已连接',
    'orbital.bridgeOffline': 'ESP32 桥：离线',
    'orbital.auto': '自动',
    'orbital.reasonDoor': '打开',
    'orbital.reasonMotion': '人体感应：',
    'orbital.reasonHot': '温度',
    'orbital.reasonHumid': '湿度',
    'orbital.reasonNight': '所有灯关 — 夜间模式',
    'orbital.reasonAmbient': '灯亮着 — 环境模式',
    'orbital.reasonIdle': '待机',

    // Quick test actions
    'qa.openFridge': '打开冰箱',
    'qa.openFridgeDesc': '触发欢迎动画',
    'qa.turnOnLights': '开启灯光',
    'qa.turnOnLightsDesc': '触发彩虹模式',
    'qa.allOff': '全部关灯',
    'qa.allOffDesc': '触发夜间模式',

    // Settings
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.themeDark': '暗色',
    'settings.themeLight': '亮色',

    // Features page
    'features.title': 'HomeAI — 我们的不同之处',
    'features.subtitle': '记得你说过什么的隐私优先智能家居控制',
    'features.section.core': '核心功能',
    'features.section.compare': '对比',
    'features.ctaTry': '立即试用',

    // Scene auto-activation via URL
    'scenes.autoActivating': '激活中',

    // Common
    'common.loading': '加载中…',
    'common.retry': '重试',
    'common.cancel': '取消',
    'common.save': '保存',
  },
} as const

export type TranslationKey = keyof typeof translations.en
export type Locale = keyof typeof translations
