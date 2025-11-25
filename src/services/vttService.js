const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const { selectedByUser } = require('../../src/globalBuffer')
require('dotenv').config()


module.exports.getVTT = async function (filePath, tgId) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at path ${filePath}`)
      return null
    }

    const language = selectedByUser[tgId]?.voiceSynthesisLanguage || process.env.LANG4VOICE || 'pl'
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))
    form.append('clientId', tgId)
    form.append('segment_number', '1')
    form.append('language', language)

    const formHeaders = form.getHeaders()

    const URL_VTT = process.env.SP_TO_TXT_URL
    const response = await axios.post(URL_VTT, form, {
      headers: {
        ...formHeaders
      }
    })
    fs.unlinkSync(filePath)
    const translatedText = response?.data?.translated_text || '⚠️❌ [Error: No text returned]'
    return translatedText
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}