"""Tarteel Whisper арқылы Құран оқуын тексеру.

Қолдану:  python check_recitation.py <аудио.mp3> <сүре:аят>
Мысал:    python check_recitation.py 001001.mp3 1:1
"""
import re
import sys
import difflib

import librosa
from transformers import pipeline

MODEL = "tarteel-ai/whisper-base-ar-quran"

# Тексеруге арналған эталон мәтіндер (шын жобада бүкіл Құран мәтінін JSON-нан аласыз)
AYAHS = {
    "1:1": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "1:2": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    "112:1": "قُلْ هُوَ اللَّهُ أَحَدٌ",
}


def normalize(text):
    """Харакаттарды алып тастап, әріп түрлерін біріздендіреді."""
    text = re.sub(r"[ؐ-ًؚ-ٰٟۖ-ۭـ]", "", text)
    text = re.sub("[إأآٱ]", "ا", text)
    text = text.replace("ى", "ي").replace("ة", "ه")
    return text.split()


def compare(expected, heard):
    exp, got = normalize(expected), normalize(heard)
    sm = difflib.SequenceMatcher(a=exp, b=got)
    errors = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "replace":
            errors.append(f"ауыстырылды: {' '.join(exp[i1:i2])} → {' '.join(got[j1:j2])}")
        elif op == "delete":
            errors.append(f"түсіп қалды: {' '.join(exp[i1:i2])}")
        elif op == "insert":
            errors.append(f"артық сөз: {' '.join(got[j1:j2])}")
    return round(sm.ratio() * 100), errors


LETTER_NAMES = {
    "ا": "әлиф", "ب": "ба", "ت": "та", "ث": "са", "ج": "жим", "ح": "ха (ح)",
    "خ": "хо (خ)", "د": "дәл", "ذ": "зәл", "ر": "ро", "ز": "зәй", "س": "син",
    "ش": "шин", "ص": "сод", "ض": "дод", "ط": "то", "ظ": "зо", "ع": "айн (ع)",
    "غ": "ғайн (غ)", "ف": "фа", "ق": "қоф", "ك": "кәф", "ل": "ләм", "م": "мим",
    "ن": "нун", "ه": "һа", "و": "уау", "ي": "йа", "ء": "һамза",
}


def name(chars):
    return " + ".join(LETTER_NAMES.get(ch, ch) for ch in chars if ch != " ")


def compare_letters(expected, heard):
    """Әріп деңгейінде салыстыру: қай сөзде қай әріп қате айтылғанын көрсетеді."""
    exp, got = " ".join(normalize(expected)), " ".join(normalize(heard))
    sm = difflib.SequenceMatcher(a=exp, b=got, autojunk=False)
    errors = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            continue
        # қате болған сөзді табу
        start = exp.rfind(" ", 0, i1) + 1
        end = exp.find(" ", i2) if exp.find(" ", i2) != -1 else len(exp)
        word = exp[start:end]
        a, b = exp[i1:i2].strip(), got[j1:j2].strip()
        if op == "replace":
            errors.append(f"«{word}» сөзінде: {name(a)} орнына {name(b)} айтылды")
        elif op == "delete" and a:
            errors.append(f"«{word}» сөзінде: {name(a)} түсіп қалды")
        elif op == "insert" and b:
            errors.append(f"«{word}» сөзінде: артық {name(b)} айтылды")
    letters = len(exp.replace(" ", ""))
    wrong = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal")
    return round(max(0, letters - wrong) / letters * 100), errors


def main():
    audio_path, ref = sys.argv[1], sys.argv[2]
    asr = pipeline("automatic-speech-recognition", model=MODEL)
    audio, _ = librosa.load(audio_path, sr=16000)  # Whisper 16 кГц күтеді
    heard = asr(audio)["text"]  # модель тек арабшаға бапталған, тіл көрсетудің қажеті жоқ

    score, errors = compare(AYAHS[ref], heard)
    print(f"Аят:      {ref}")
    print(f"Эталон:   {AYAHS[ref]}")
    print(f"Естілді:  {heard}")
    print(f"Сөз бойынша:   {score}%")
    letter_score, letter_errors = compare_letters(AYAHS[ref], heard)
    print(f"Әріп бойынша:  {letter_score}%")
    print("Қателер:" + (" жоқ ✅" if not letter_errors else ""))
    for e in letter_errors:
        print(f"  ❌ {e}")


if __name__ == "__main__":
    main()
