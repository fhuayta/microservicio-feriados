const test  = require('ava')
const path = require('path')
const util = require('../../src/tools/util')

let workspacePath = __dirname
let cli = 'node ../../src/cli/doc.js'

test.before(async t => {
  await util.cmd(`rm -rf ../app`, __dirname)
  await util.cmd(`cp -r ../example/app ../app`, __dirname)
})

test.after(async t => {
  // await util.cmd(`rm -rf ../app`, __dirname)
})

test('Comando version', async t => {
  try {
    await execute(`--version`)
    t.pass()
  } catch (e) { console.log(e) }
})

test('Comando init', async t => {
  try {
    workspacePath = path.resolve(__dirname, '../app')
    cli = 'node ../../src/cli/doc.js'
    await execute(`init`)
    t.pass()
  } catch (e) { console.log(e) }
})

async function execute (command) {
  return util.cmd(`${cli} ${command}`, workspacePath)
}

// function verifyDir (dirPath) {
//   const DIR_PATH = path.resolve(workspacePath, dirPath)
//   expect(util.isDir(DIR_PATH)).to.equal(true)
// }
//
// function verifyFile (filePath, content, result = true) {
//   const FILE_PATH = path.resolve(workspacePath, filePath)
//   expect(util.isFile(FILE_PATH)).to.equal(true)
//   if (content) {
//     const FILE_CONTENT = util.readFile(FILE_PATH)
//     expect(FILE_CONTENT.includes(content)).to.equals(result)
//   }
// }
