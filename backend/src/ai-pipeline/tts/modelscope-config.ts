/**
 * 魔搭社区 TTS 配置
 */
export interface ModelscopeTTSConfig {
  apiKey: string;
  model: string;
  voice: string;
  speed: number;
  format: string;
}

/**
 * 从环境变量获取魔搭配置
 */
export function getModelscopeConfig(): ModelscopeTTSConfig {
  return {
    apiKey: process.env.MODELSCOPE_API_KEY || '',
    model:
      process.env.MODELSCOPE_TTS_MODEL ||
      'damo/speech_sambert-hifigan_tts_zh-cn_en-us_pretrain_16k',
    voice: process.env.MODELSCOPE_TTS_VOICE || 'xiaoxiao',
    speed: parseFloat(process.env.MODELSCOPE_TTS_SPEED || '1.0'),
    format: process.env.MODELSCOPE_TTS_FORMAT || 'wav',
  };
}

/**
 * 语速档位映射
 */
export const SPEED_LEVELS = {
  SLOW: 0.75, // 慢速
  NORMAL: 1.0, // 正常
  FAST: 1.25, // 快速
  VERY_FAST: 1.5, // 很快
};

/**
 * 支持的音色列表
 */
export const AVAILABLE_VOICES = {
  XIAOXIAO: 'xiaoxiao', // 女声-晓晓
  YUNXI: 'yunxi', // 男声-云溪
  XIAOBEI: 'xiaobei', // 女声-晓北
  XIAOMO: 'xiaomo', // 女声-晓墨
};

/**
 * 音频格式配置
 */
export const AUDIO_FORMATS = {
  WAV: 'wav',
  MP3: 'mp3',
  PCM: 'pcm',
};
