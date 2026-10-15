/* =============================================================================
                    Turkish Tag Title Helper
============================================================================= */
/**
 * Generates a compound Turkish title for tag pages.
 *
 * Example: "Şeftali" -> "Şeftali Tarifleri / Şeftalili Tarifler"
 */
export function generateTagTitleVariants(tag?: string | null): string {
	if (!tag) return ""

	const trimmed = tag.trim()
	if (!trimmed) return ""

	// Use the last word for suffix attachment (handles multi-word tags).
	const lastSpace = trimmed.lastIndexOf(" ")
	const lastWord = lastSpace === -1 ? trimmed : trimmed.slice(lastSpace + 1)
	const prefix = lastSpace === -1 ? "" : trimmed.slice(0, lastSpace) + " "

	// Find the last vowel in the last word to apply Turkish vowel harmony.
	const lower = lastWord.toLocaleLowerCase("tr").normalize("NFC")
	const vowels = "aıoueiöü"
	let lastVowel = ""
	for (let i = lower.length - 1; i >= 0; i--) {
		const ch = lower[i]
		if (vowels.includes(ch)) {
			lastVowel = ch
			break
		}
	}

	// Map last vowel to the correct suffix vowel for -lI suffix.
	let suffixVowel = "i"
	if (lastVowel === "a" || lastVowel === "ı") suffixVowel = "ı"
	else if (lastVowel === "o" || lastVowel === "u") suffixVowel = "u"
	else if (lastVowel === "e" || lastVowel === "i") suffixVowel = "i"
	else if (lastVowel === "ö" || lastVowel === "ü") suffixVowel = "ü"

	const suffix = "l" + suffixVowel
	const modifiedLastWord = lastWord + suffix
	const secondVariant = prefix + modifiedLastWord

	return `${trimmed} Tarifleri / ${secondVariant} Tarifler`
}
