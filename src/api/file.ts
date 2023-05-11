/* File parsing & converting module */
import _ from 'lodash'

// From array to plain text
const toText = (arr: string[][])=>{
  return arr.map((x)=>x.join('#')).join('\n')
}

// From array to CSV
const toCsv = (arr: string[][])=>{
  return arr.map((x)=>x.join(',')).join('\n')
}

// From array to JSON
const toJson = (arr: string[][], cols: string[])=>{
  return JSON.stringify(arr.map((x)=>_.zipObject(cols, x)))
}

// From array to YAML
const toYaml = (arr: string[][], cols: string[])=>{
  return arr.map((x)=>_.zip(cols, x).map((x, y)=>y ? `  ${x[0]}: ${x[1]}\n` : `- ${x[0]}: ${x[1]}\n`).join('')).join('')
}

// Download file
const download = (str: string, name: string, type: string)=>{
  const blob = new Blob([str], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = name
  link.click()

  URL.revokeObjectURL(url)
}

// Export
export { toText, toCsv, toJson, toYaml, download }