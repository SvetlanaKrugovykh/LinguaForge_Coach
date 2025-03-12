const { selectedByUser } = require('../globalBuffer')
const fs = require('fs')
const util = require('util')
const moment = require('moment')

module.exports.createHtml = async function (bot, chatId, lang) {
  try {
    const currentTest = selectedByUser[chatId].currentTest

    if (!currentTest) {
      throw new Error('No current test found for user')
    }

    const HTML_CATALOG = process.env.TEMP_DOWNLOADS_CATALOG
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

    content.push({
      text: currentTest.text,
      style: 'defaultStyle',
      fontSize: '14px'
    })

    content.push({
      text: currentTest.options,
      style: 'defaultStyle',
      fontSize: '14px'
    })

    const htmlContent = createHtmlContent(content)
    await writeHtmlToFile(htmlContent, `${HTML_CATALOG}${chatId}.html`)
    return true
  } catch (error) {
    console.error('Error in function createHtml:', error)
    return null
  }
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
      htmlContent += `<p>${item.text}</p>`
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