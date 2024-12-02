const alreadyClicked = new Set()

main()

async function main() {
  await expandComments()

  await waitFor(1000)
  const comments = collectComments(document)

  if (!comments.length && window.location.href !== 'https://www.jefftk.com/test') {
    document.title = 'no comments'
    return
  }

  const commentCount = countComments(comments)
  document.title = `${commentCount} comment${commentCount === 1 ? '' : 's'}`

  var location_parts = document.location.href.split('/')
  var slug = location_parts[location_parts.length - 1]

  chrome.runtime.sendMessage(
    /* extension id not needed */ undefined,
    [ slug, makeDataUrl(comments) ],
  )

  alreadyClicked.clear()
}

function waitFor (ms) {
  // Isolates the scope of the setTimeout, which is a common source of memory leaks
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function expandComments() {
  const elements = getExpandableComments()
    .filter((element) => !alreadyClicked.has(element) && document.body.contains(element))
    .map((element) => {
      element.click()
      alreadyClicked.add(element)
      return element
    })
  if (elements.length) {
    await waitFor(100)
  }
}

function getExpandableComments() {
  return [
    ...[ document.querySelector('div[aria-label="Close"][role="button"]') ]
      .filter(Boolean),
      
    ...Array.from(document.querySelectorAll('div > span:only-child') ?? [])
      .filter((element) => element.textContent.trim() === 'Most relevant'),
      
    ...Array.from(document.querySelectorAll('div > span:only-child') ?? [])
      .filter((element) => element.textContent.trim() === 'Oldest'),
      
    ...Array.from(document.querySelectorAll('div > span:only-child > span:only-child') ?? [])
      .filter((element) => /^\d+ Repl(ies|y)$/.test(element.textContent.trim())),

    ...Array.from(document.querySelectorAll('div > div:only-child > div:only-child') ?? [])
      .filter((element) => element.textContent.trim() === 'See more'),
  ]
}

function getName(comment_div) {
  return [
    ...Array.from(comment_div.querySelectorAll('div > span > a > span:only-child > span:only-child') ?? []),
    ...Array.from(comment_div.querySelectorAll('div > div:only-child > span > span:only-child') ?? [])
  ]
    .find((element) => element.dir === 'auto')
    ?.textContent.trim() ?? ''
}

function getHtml(comment_div) {
  return Array.from(comment_div.querySelectorAll('div > span > div > div') ?? [])
    .filter((div) => div.dir === 'auto' && div.getAttribute('style') === 'text-align: start')
    .map((div) => div.innerHTML)
    .join('\n')
}

function collectComments(element) {
  return Array.from(element.querySelectorAll('div') ?? [])
    .filter((div) => (div.ariaLabel ?? '').test(/^(Comment|Reply) by /))
    .map((div) => ({
      name: getName(div),
      html: getHtml(div),
      replies: collectComments(div)
    }))
}

function countComments({ replies }) {
  return replies.reduce((acc, reply) => acc + countComments(reply), 1)
}

function serializeComment({ name, html, replies }) {
  return [ name, null, null, null, html, replies.map(serializeComment) ]
}

function makeDataUrl(comments) {
  const body = JSON.stringify(comments.map(serializeComment))
  
  return 'data:application/jsonbase64,' + btoa(unescape(encodeURIComponent(body)))
}
