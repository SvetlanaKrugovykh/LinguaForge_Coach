
const axios = require('axios')
const { selectedByUser } = require('../globalBuffer')

module.exports.callTranslate = async function (bot, msg) {
  try {
    const text = selectedByUser[msg.chat.id]?.text
    const direction = `${selectedByUser[msg.chat.id]?.language}_${selectedByUser[msg.chat.id]?.direction}`

    if (!text || !direction || text.length < 7 || direction.length < 5) {
      console.log('Invalid text or direction:', { text, direction })
      return
    }

    let translatedText = text
    const directions = [`pl_en`, `en_ru`]
    const startTime = Date.now()
    console.log(`${startTime}: JSON request start`)

    for (const dir of directions) {
      const response = await axios.post(process.env.TRANSLATOR_URL, {
        direction: dir,
        text: translatedText,
      })

      translatedText = response.data.translated_text?.[0] ||
        response.data?.replyData?.translated_text?.[0] ||
        'Default value if not found'

      console.log(translatedText)
      await bot.sendMessage(msg.chat.id, `<b>${dir}:</b>\n${translatedText}`, { parse_mode: 'HTML' })
    }

    const endTime = Date.now()
    console.log(`${endTime}: JSON request duration: ${endTime - startTime}ms`)

  } catch (error) {
    await bot.sendMessage(msg.chat.id, `Sorry. Service under construction`, { parse_mode: 'HTML' })
    console.error('Error translating text:', error)
  }
}