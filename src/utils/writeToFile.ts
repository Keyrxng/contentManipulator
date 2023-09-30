import * as fs from 'fs'
import { ChainValues } from 'langchain/dist/schema'
import path from 'path'

export function writeToFile(
    filename: string,
    data: { content: string; metadata: ChainValues }
): void {
    const randomId = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0')

    filename = path.resolve(__dirname, `../../data/${filename}-${randomId}.md`)

    if (!data) throw new Error('No data to write')

    const metadataObj = JSON.parse(data.metadata.text)

    let metadataTable = '| Key | Value |\n| --- | --- |\n'

    for (const [key, value] of Object.entries(metadataObj)) {
        const displayValue = Array.isArray(value) ? value.join(', ') : value
        metadataTable += `| ${key} | ${displayValue} |\n`
    }

    const dataToWrite = `
# Metadata
${metadataTable}

---

# Content
${data.content}
`

    fs.writeFile(filename, dataToWrite, (err) => {
        if (err) throw err
        console.log(`Data written to ${filename}`)
    })
}
