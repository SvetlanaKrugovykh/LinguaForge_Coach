const { selectedByUser } = require('../globalBuffer')
const fs = require('fs')
const util = require('util')
const moment = require('moment')
const fT = require('../utils/formattedTexts')

module.exports.createHtml = async function (bot, chatId, lang) {
  try {
    const currentTest = selectedByUser[chatId].currentTest

    if (!currentTest) {
      throw new Error('No current test found for user')
    }

    const HTML_CATALOG = process.env.TEMP_DOWNLOADS_CATALOG
    const filePath = `${HTML_CATALOG}${chatId}.html`
    const content = []

    moment.updateLocale(lang, {
      week: {
        dow: 1,
        doy: 7
      }
    })

    content.push(
      { text: `${currentTest?.topic || 'test'}`, style: 'header', fontSize: '18px' },
    )

    let { formattedText, formattedOptions } = fT.formatTextAndOptions(currentTest.text, currentTest.options)
    // formattedText = formattedText.replace(/\n/g, '<br>')
    formattedOptions = formattedOptions.replace(/\n/g, '<br>')

    content.push({
      text: formattedText,
      style: 'defaultStyle',
      fontSize: '16px',
      marginLeft: '20px'
    })

    const formattedOptionsHTML = formatOptionsHTML(formattedOptions)
    content.push({
      text: formattedOptionsHTML,
      style: 'defaultStyle',
      fontSize: '16px'
    })

    const htmlContent = createHtmlContent(content)
    await writeHtmlToFile(htmlContent, filePath)
    await bot.sendDocument(chatId, filePath)
    fs.unlink(filePath, () => console.log(`File ${filePath} deleted`))

    return true
  } catch (error) {
    console.error('Error in function createHtml:', error)
    return null
  }
}

function formatOptionsHTML(options) {
  const questionRegex = /\d+\.\s/g
  const questions = options.split(questionRegex).filter(Boolean)
  const questionNumbers = options.match(questionRegex) || []

  let formattedOptions = ''
  questions.forEach((question, index) => {
    formattedOptions += `<p style="margin-left: 20px;"><span style="color: blue;">${questionNumbers[index] || `${index + 1}.`}</span> ${question.trim()}</p>`
  })

  const optionRegex = /([a-z]\)\s)/g
  formattedOptions = formattedOptions.replace(optionRegex, match => `<br>&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: green;">${match}</span>`)

  return formattedOptions
}

function createHtmlContent(content) {
  let htmlContent = '<html><head>'
  htmlContent += '<meta charset="utf-8">'
  htmlContent += '<meta name="viewport" content="width=device-width, initial-scale=1">'
  htmlContent += '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap">'
  htmlContent += '<style>'
  htmlContent += 'body { font-family: "Roboto", sans-serif; margin: 20px; }'
  htmlContent += 'h1 { font-weight: bold; font-size: 18px; text-align: center; }'
  htmlContent += 'p { font-size: 14px; }'
  htmlContent += '</style>'
  htmlContent += '</head><body>'

  for (const item of content) {
    if (item.style === 'header') {
      htmlContent += `<h1>${item.text}</h1>`
    } else {
      htmlContent += `<p style="margin-left: ${item.marginLeft || '0px'}; font-size: ${item.fontSize};">${item.text}</p>`
    }
  }

  htmlContent += '</body></html>'
  return htmlContent
}

async function writeHtmlToFile(htmlContent, filePath) {
  try {
    await util.promisify(fs.writeFile)(filePath, htmlContent, 'utf-8')
    console.log(`HTML successfully written to ${filePath}`)
  } catch (error) {
    console.error('Error writing HTML to file:', error)
  }
}