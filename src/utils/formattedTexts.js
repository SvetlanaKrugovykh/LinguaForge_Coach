module.exports.formatTextAndOptions = function (text, options) {
  let optionsWithPrawdaFalsz = options ? options.replace(/prawda\/fałsz/g, 'a) prawda b) fałsz') : 'a) b) c)'

  const formattedText = text.replace(/(\d{1,3}\.)/g, '\n\n$1')
  const formattedOptions = optionsWithPrawdaFalsz.split(/(?=\s[a-z]\))/).map(option => `<b>${option.trim()}</b>`).join('\n').replace('a)', '\na)')

  return {
    formattedText,
    formattedOptions: formattedOptions.replace(/(\d{1,3}\.)/g, '\n\n$1')
  }
}

module.exports.extractNumbersAndLetters = function (formattedText, formattedOptions) {
  const numberMatchesText = formattedText.match(/\d{1,3}\./g)
  const numberMatchesOptions = formattedOptions.match(/\d{1,3}\./g)
  const numberMatches = [...new Set([...(numberMatchesText || []), ...(numberMatchesOptions || [])])]
  let numbers = numberMatches.map(num => num.trim().replace('.', '')).sort((a, b) => a - b)

  const letterMatchesText = formattedText.match(/[a-z]\)/g)
  const letterMatchesOptions = formattedOptions.match(/[a-z]\)/g)
  const letterMatches = [...new Set([...(letterMatchesText || []), ...(letterMatchesOptions || [])])]
  let letters = letterMatches.map(letter => letter[0]).sort()

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
  letters = alphabet.filter(letter => {
    const lastLetter = letters[letters.length - 1]
    return letter <= lastLetter && !letters.includes(letter)
  }).concat(letters)

  if (numbers.length === 0 && letters.length > 0) {
    numbers = ['1']
  }

  if (letters.length === 0 && numbers.length > 0) {
    letters = ['a', 'b', 'c']
  }

  return { numbers, letters }
}