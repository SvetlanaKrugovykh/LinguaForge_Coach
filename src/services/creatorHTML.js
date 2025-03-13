const { selectedByUser } = require('../globalBuffer')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const fT = require('../utils/formattedTexts')

module.exports.createHtml = async function (bot, chatId, lang) {
  try {
    if (!selectedByUser[chatId]) {
      throw new Error(`No test data found for chatId: ${chatId}`)
    }

    const currentTest = selectedByUser[chatId].currentTest
    if (!currentTest) {
      throw new Error('No current test found for user')
    }

    const HTML_CATALOG = process.env.TEMP_DOWNLOADS_CATALOG
    const filePath = path.join(HTML_CATALOG, `${chatId}.html`)
    const content = []

    moment.updateLocale(lang, { week: { dow: 1, doy: 7 } })

    content.push({ text: currentTest?.topic || 'Test', style: 'header', fontSize: '18px' })

    let { formattedText, formattedOptions } = fT.formatTextAndOptions(currentTest.text, currentTest.options)
    formattedOptions = formattedOptions.replace(/\n/g, '<br>')

    const formattedTextHTML = formatTextHTML(formattedText)
    content.push({ text: formattedTextHTML })

    const formattedOptionsHTML = formatOptionsHTML(formattedOptions)
    content.push({ html: formattedOptionsHTML })

    const htmlContent = createHtmlContent(content)
    await writeHtmlToFile(htmlContent, filePath)

    await bot.sendDocument(chatId, filePath)
    await fs.promises.unlink(filePath)

    console.log(`File ${filePath} deleted`)
    return true
  } catch (error) {
    console.error('Error in createHtml:', error)
    return null
  }
}

function formatTextHTML(text) {
  const questionRegex = /(\d{1,3}\.\s)/g
  let formattedText = text.replace(questionRegex, match => `<span style="font-weight: bold; color: blue;">${match}</span>`).replaceAll('[_', '[_______________')
  formattedText = `<p style="font-size: 16px; margin-left: 20px; text-align: justify;">&nbsp;&nbsp;&nbsp;     ${formattedText}</p>`
  return formattedText
}

function formatOptionsHTML(options) {
  const questionRegex = /\d+\.\s/g
  const questions = options.split(questionRegex).filter(Boolean)
  const questionNumbers = options.match(questionRegex) || []

  let formattedOptions = ''

  questions.forEach((question, index) => {
    formattedOptions += `<p style="margin-left: 20px; font-size: 16px; font-weight: normal;">
      ${questionNumbers[index] || `${index + 1}.`}</><br>${question.trim()}
    </p>`
  })

  return formattedOptions.replace(/([a-z]\)\s)/g, match =>
    `<span style="color: blue;">${match}</span>`
  )
}


function createHtmlContent(content) {
  let htmlContent = `
    <html><head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap">
    </head><body style="font-family: 'Roboto', sans-serif; margin: 20px;">
  `

  for (const item of content) {
    if (item.html) {
      htmlContent += item.html
    } else {
      htmlContent += item.style === 'header'
        ? `<h1 style="font-weight: bold; font-size: 18px; text-align: center;">${item.text}</h1>`
        : `<p style="font-size: 16px; margin-left: 20px;">${item.text}</p>`
    }
  }

  htmlContent += '</body></html>'
  return htmlContent
}


async function writeHtmlToFile(htmlContent, filePath) {
  try {
    await fs.promises.writeFile(filePath, htmlContent, 'utf-8')
    console.log(`HTML successfully written to ${filePath}`)
  } catch (error) {
    console.error('Error writing HTML to file:', error)
  }
}
