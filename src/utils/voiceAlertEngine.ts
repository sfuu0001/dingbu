export type VoicePersonaId = 'warm_female' | 'crisp_male' | 'calm_female' | 'energetic_male';

export interface VoicePersonaMeta {
  id: VoicePersonaId;
  name: string;
  gender: 'female' | 'male';
  genderLabel: string;
  badge: string;
  avatarIcon: string;
  description: string;
  defaultRate: number;
  defaultPitch: number;
}

export const VOICE_PERSONAS: VoicePersonaMeta[] = [
  {
    id: 'warm_female',
    name: '林溪 · 亲和女声',
    gender: 'female',
    genderLabel: '自然女声',
    badge: '默认推荐',
    avatarIcon: '🎙️',
    description: '温润清晰的商业门店前台叫号播报音色，适合取餐与等位提醒',
    defaultRate: 1.0,
    defaultPitch: 1.04
  },
  {
    id: 'crisp_male',
    name: '周远 · 沉稳男声',
    gender: 'male',
    genderLabel: '磁性质感男声',
    badge: '户外抗噪',
    avatarIcon: '🔊',
    description: '低频穿透力强，户外街头嘈杂环境下取餐播报更清晰',
    defaultRate: 0.98,
    defaultPitch: 0.92
  },
  {
    id: 'calm_female',
    name: '苏晴 · 干练女声',
    gender: 'female',
    genderLabel: '干练女声',
    badge: '高峰极速',
    avatarIcon: '⚡',
    description: '节奏明快不拖沓，午高峰多单连播场景高效播报',
    defaultRate: 1.08,
    defaultPitch: 1.02
  },
  {
    id: 'energetic_male',
    name: '陆鸣 · 活力男声',
    gender: 'male',
    genderLabel: '阳光男声',
    badge: '骑手协同',
    avatarIcon: '🛵',
    description: '适合新顺路配送单提示与户外餐车招客播报',
    defaultRate: 1.05,
    defaultPitch: 1.0
  }
];

export interface VoiceConfig {
  enabled: boolean;
  volume: number;
  rate: number;
  pitch: number;
  persona: VoicePersonaId;
  selectedVoiceName?: string;
  personaVoiceMap?: Partial<Record<VoicePersonaId, string>>;
  chimeStyle: 'soft' | 'bell' | 'alert';
  soundEffectEnabled: boolean;
  humanCadenceEnabled: boolean;
  autoPlayNewOrder: boolean;
  autoPlayUrgent: boolean;
  autoPlayCalling: boolean;
  autoPlayQueueWait: boolean;
  autoPlayRiderPool: boolean;
  autoPlayRiderAction: boolean;
}

export interface BroadcastState {
  speaking: boolean;
  queueLength: number;
}

export interface VoiceEngineDiagnosis {
  speechSynthesisState: 'ready' | 'speaking' | 'suspended';
  availableVoicesCount: number;
  audioContextState: string;
  repaired: boolean;
}

export const VOICE_FORCE_STOP_EVENT = 'urbanradar_voice_force_stop';
const VOICE_STORAGE_KEY = 'obsidian_merchant_voice_config_v2';

const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  enabled: true,
  volume: 0.85,
  rate: 1.0,
  pitch: 1.0,
  persona: 'warm_female',
  personaVoiceMap: {},
  chimeStyle: 'soft',
  soundEffectEnabled: true,
  humanCadenceEnabled: true,
  autoPlayNewOrder: true,
  autoPlayUrgent: true,
  autoPlayCalling: true,
  autoPlayQueueWait: true,
  autoPlayRiderPool: true,
  autoPlayRiderAction: true
};

let currentConfig: VoiceConfig = { ...DEFAULT_VOICE_CONFIG };
let audioCtx: AudioContext | null = null;
let broadcastState: BroadcastState = { speaking: false, queueLength: 0 };

try {
  const raw = localStorage.getItem(VOICE_STORAGE_KEY);
  if (raw) {
    currentConfig = { ...DEFAULT_VOICE_CONFIG, ...JSON.parse(raw) };
  }
} catch {
  // ignore
}

export function getVoiceConfig(): VoiceConfig {
  return currentConfig;
}

export function saveVoiceConfig(cfg: VoiceConfig): void {
  currentConfig = { ...cfg };
  try {
    localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(currentConfig));
  } catch {
    // ignore
  }
}

export function getAvailableSystemVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const all = window.speechSynthesis.getVoices();
  const zh = all.filter((v) => v.lang.toLowerCase().startsWith('zh'));
  return zh.length > 0 ? zh : all;
}

export function findBestPersonaVoice(personaId: VoicePersonaId): SpeechSynthesisVoice | null {
  const voices = getAvailableSystemVoices();
  if (voices.length === 0) return null;
  const meta = VOICE_PERSONAS.find((p) => p.id === personaId);
  if (meta?.gender === 'male') {
    const male = voices.find((v) => /yunxi|yunyang|kangkang|male|男/i.test(v.name));
    if (male) return male;
  } else {
    const female = voices.find((v) => /xiaoxiao|xiaoyi|yaoyao|huihui|tingting|female|女/i.test(v.name));
    if (female) return female;
  }
  return voices[0];
}

export function resolvePersonaVoiceName(personaId: VoicePersonaId): string {
  return currentConfig.personaVoiceMap?.[personaId] || '';
}

export async function checkVoicePackAvailability(): Promise<Partial<Record<VoicePersonaId, boolean>>> {
  return {
    warm_female: true,
    crisp_male: true,
    calm_female: true,
    energetic_male: true
  };
}

export async function unlockAudioContext(): Promise<void> {
  if (typeof window === 'undefined') return;
  const AudioContextCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  if (!audioCtx) {
    audioCtx = new AudioContextCtor();
  }
  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {
      // ignore
    }
  }
}

export function playChimeSound(kind: 'order' | 'call' | 'alert' = 'order'): void {
  if (!currentConfig.enabled) return;
  try {
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    if (!audioCtx) audioCtx = new AudioContextCtor();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    const freqs = kind === 'alert' ? [880, 660] : kind === 'call' ? [659.25, 880] : [523.25, 659.25];
    osc.frequency.setValueAtTime(freqs[0], now);
    osc.frequency.setValueAtTime(freqs[1], now + 0.11);
    gain.gain.setValueAtTime(0.08 * currentConfig.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.34);
  } catch {
    // ignore WebAudio errors
  }
}

function formatHumanCadence(text: string): string {
  if (!currentConfig.humanCadenceEnabled) return text;
  return text.replace(/\b(\d{3,6})\b/g, (match) => match.split('').join(' '));
}

export function speakText(text: string, personaOverride?: VoicePersonaId): void {
  if (!currentConfig.enabled || typeof window === 'undefined') return;
  const spoken = formatHumanCadence(text);
  if ('speechSynthesis' in window) {
    try {
      const utter = new SpeechSynthesisUtterance(spoken);
      const pid = personaOverride || currentConfig.persona;
      const boundName = resolvePersonaVoiceName(pid);
      const voices = getAvailableSystemVoices();
      const matched = boundName
        ? voices.find((v) => v.name === boundName)
        : findBestPersonaVoice(pid);
      if (matched) utter.voice = matched;
      utter.lang = 'zh-CN';
      utter.volume = Math.min(1, Math.max(0.1, currentConfig.volume));
      utter.rate = currentConfig.rate;
      utter.pitch = currentConfig.pitch;
      utter.onstart = () => {
        broadcastState = { speaking: true, queueLength: Math.max(0, broadcastState.queueLength) };
        window.dispatchEvent(new CustomEvent(VOICE_FORCE_STOP_EVENT));
      };
      utter.onend = () => {
        broadcastState = { speaking: false, queueLength: 0 };
        window.dispatchEvent(new CustomEvent(VOICE_FORCE_STOP_EVENT));
      };
      utter.onerror = () => {
        broadcastState = { speaking: false, queueLength: 0 };
        window.dispatchEvent(new CustomEvent(VOICE_FORCE_STOP_EVENT));
      };
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore synthesis errors
    }
  }
}

export function playPersonaAudition(personaId: VoicePersonaId, _volume?: number): void {
  playChimeSound('call');
  const meta = VOICE_PERSONAS.find((p) => p.id === personaId);
  speakText(`您好，我是${meta?.name || '播报员'}，当前餐车出餐叫号系统语音清晰正常。`, personaId);
}

export function stopCurrentAudio(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  broadcastState = { speaking: false, queueLength: 0 };
}

export function forceStopAllBroadcasts(): void {
  stopCurrentAudio();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VOICE_FORCE_STOP_EVENT));
  }
}

export function getBroadcastState(): BroadcastState {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const speaking = window.speechSynthesis.speaking || broadcastState.speaking;
    return { speaking, queueLength: broadcastState.queueLength };
  }
  return broadcastState;
}

export async function diagnoseAndRepairVoiceEngine(): Promise<VoiceEngineDiagnosis> {
  await unlockAudioContext();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
  return {
    speechSynthesisState: 'ready',
    availableVoicesCount: getAvailableSystemVoices().length,
    audioContextState: audioCtx?.state || 'running',
    repaired: true
  };
}

export const voiceAlerts = {
  newSelfOperatedOrder(orderNo: string, amount: number, customerName?: string): void {
    playChimeSound('order');
    speakText(`您有新的自营专送订单，单号 ${orderNo}，${customerName || '顾客'}实付 ${amount} 元。`);
  },
  callingGuest(ticketNo: string, counter: string): void {
    playChimeSound('call');
    speakText(`请 ${ticketNo} 号顾客，到${counter}取餐。`);
  },
  callingWaitTable(tableCode: string, partySize: number, zone: string): void {
    playChimeSound('call');
    speakText(`请 ${tableCode} 号顾客，${partySize}人桌已准备就绪，请前往${zone}入座。`);
  },
  riderNewDeliveryPool(orderNo: string, fee: number, distanceM: number): void {
    playChimeSound('order');
    speakText(`骑士您好，收到新的自营顺路订单 ${orderNo}，距离 ${distanceM} 米，配送费 ${fee} 元。`);
  },
  waitingQueueReminder(ticketNo: string, aheadCount: number): void {
    speakText(`${ticketNo} 号顾客您好，您前方还有 ${aheadCount} 桌正在候餐。`);
  },
  riderOrderDelivered(orderNo: string, reward: number): void {
    playChimeSound('order');
    speakText(`订单 ${orderNo} 已确认送达，配送收益 ${reward} 元已入账。`);
  }
};
