module.exports.sendTgMsg = async function (bot, chatId, message) {

  const MAX_MESSAGE_LENGTH = 3999

  if (message.length <= MAX_MESSAGE_LENGTH) {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
  } else {
    const messageParts = []
    let currentPart = ''
    message.split('\n\n').forEach(part => {
      if ((currentPart + '\n\n' + part).length > MAX_MESSAGE_LENGTH) {
        messageParts.push(currentPart)
        currentPart = part
      } else {
        currentPart += '\n\n' + part
      }
    })
    if (currentPart) {
      messageParts.push(currentPart)
    }

    for (const part of messageParts) {
      await bot.sendMessage(chatId, part, { parse_mode: 'HTML' })
    }
  }

}