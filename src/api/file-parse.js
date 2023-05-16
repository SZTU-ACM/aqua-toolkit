/* File parse module */

// From CSV to array
const fromCsv = (text)=>{
  return text.split('\n').map((v)=>v.split(','))
}

// From array to CSV
const toCsv = (arr)=>{
  return arr.map((v)=>v.join(',')).join('\n')
}

// From array to JSON
const toJson = (arr, keys)=>{
  return JSON.stringify(arr.map((v)=>{
    const ret = {}
    v.forEach((v, i)=>ret[keys[i]] = v)
    return ret
  }))
}

// From array to YAML
const toYaml = (arr, keys)=>{
  return arr.map((v)=>{
    let ret = '- '
    v.forEach((v, i)=>{
      if (i > 0)
        ret += '\n  '
      ret += `${keys[i]}: ${v}`
    })
    return ret
  }).join('\n')
}

// From array to TXT
const toTxt = (arr)=>{
  return arr.map((v)=>v.join('#')).join('\n')
}

// Download file
const dlFile = (text, filename, type)=>{
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export
export { fromCsv }
export { toCsv, toJson, toYaml, toTxt }
export { dlFile }
