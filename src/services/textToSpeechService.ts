/**
 * PLAYNEXUS Tactical Voice-to-Voice Speech Synthesis Service
 * Provides audio responses for voice and text commands.
 */

let speechEnabled = true;
try {
  const stored = localStorage.getItem('playnexus_voice_to_voice');
  if (stored !== null) {
    speechEnabled = stored === 'true';
  }
} catch {
  // Ignored
}

export function isVoiceToVoiceEnabled(): boolean {
  return speechEnabled;
}

export function setVoiceToVoiceEnabled(enabled: boolean): void {
  speechEnabled = enabled;
  try {
    localStorage.setItem('playnexus_voice_to_voice', String(enabled));
  } catch {
    // Ignored
  }
}

/**
 * Speak back text with a tactical, crisp AI tone
 */
export function speakTacticalResponse(text: string): void {
  if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  try {
    // Cancel any currently speaking utterance to keep feedback instant
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.12; // Snappy tactical military cadence
    utterance.pitch = 0.98;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    // Prefer crisp English voices
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Alex'))) ||
        v.lang === 'en-US'
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[VOICE_TO_VOICE] Speech synthesis error:', err);
  }
}
