"""Жеке әріптің айтылуын тексеру.

Қолдану:  python check_letter.py <аудио> <әріп>
Мысал:    python check_letter.py ha.ogg ح

Модельден «не естідің» деп сұрамаймыз. Оның орнына шатастырылатын
әріптер тобындағы әр нұсқаның ықтималдығын есептеп, ең ықтималын таңдаймыз.
"""
import sys

import librosa
import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor

MODEL = "tarteel-ai/whisper-base-ar-quran"

NAMES = {
    "ح": "ха (ح)", "خ": "хо (خ)", "ه": "һа (ه)",
    "ع": "айн (ع)", "غ": "ғайн (غ)", "ء": "һамза (ء)",
    "س": "син (س)", "ص": "сод (ص)", "ث": "са (ث)",
    "ت": "та (ت)", "ط": "то (ط)",
    "د": "дәл (د)", "ض": "дод (ض)",
    "ذ": "зәл (ذ)", "ز": "зәй (ز)", "ظ": "зо (ظ)",
    "ك": "кәф (ك)", "ق": "қоф (ق)",
}

# Бір-бірімен жиі шатастырылатын әріптер тобы
GROUPS = [
    ["ح", "خ", "ه"],
    ["ع", "غ", "ء"],
    ["س", "ص", "ث"],
    ["ت", "ط"],
    ["د", "ض"],
    ["ذ", "ز", "ظ"],
    ["ك", "ق"],
]

processor = WhisperProcessor.from_pretrained(MODEL)
model = WhisperForConditionalGeneration.from_pretrained(MODEL).eval()


def score(features, text):
    """Аудио осы мәтін болуының орташа log-ықтималдығы."""
    labels = processor.tokenizer(text, return_tensors="pt").input_ids
    with torch.no_grad():
        out = model(input_features=features, labels=labels)
    return -out.loss.item()


def check(audio_path, target):
    group = next(g for g in GROUPS if target in g)
    audio, _ = librosa.load(audio_path, sr=16000)
    features = processor(audio, sampling_rate=16000, return_tensors="pt").input_features

    # Әріпті фатхамен (ха, хо, һа...) айтады деп есептейміз
    scores = {ch: score(features, ch + "َ") for ch in group}
    best = max(scores, key=scores.get)
    probs = torch.softmax(torch.tensor(list(scores.values())) * 5, 0)
    return best, {ch: round(p.item() * 100) for ch, p in zip(scores, probs)}


def main():
    audio_path, target = sys.argv[1], sys.argv[2]
    best, probs = check(audio_path, target)
    print(f"Тексерілетін әріп: {NAMES[target]}")
    print("Ұқсастық:  " + ",  ".join(f"{NAMES[c]} {p}%" for c, p in probs.items()))
    if best == target:
        print("Нәтиже:    ✅ Дұрыс")
    else:
        print(f"Нәтиже:    ❌ Қате: {NAMES[best]} сияқты естілді")


if __name__ == "__main__":
    main()
