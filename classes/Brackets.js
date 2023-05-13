import { equationError } from "./utils.js"

const brackets = {
    "(":")",
    "{":"}",
    "[":"]"
}
const openBrackets = Object.keys(brackets)
const closeBrackets = Object.values(brackets)
const bracketChars = [...openBrackets,...closeBrackets]

function loop(bracketArr,callback) {
    bracketArr.forEach((a,b)=>{
        const err = () => {
            const msg = `Invalid '${a}' at index ${b}`
            equationError(msg)
        }
        if (openBrackets.includes(a)) {
            bracketLog.push(a)
        } else if (closeBrackets.includes(a)) {
            let pop = bracketLog.pop()
            if (!pop || brackets[pop] !== a) callback(a,b,c)
        }
    })
}

function checkBalancedBrackets(e) {
    
    const bracketArr = e.split("").filter(a=>bracketChars.includes(a))
    const bracketLog = []
    if (!bracketArr.length) return
    bracketArr.forEach((a,b)=>{
        const err = () => {throw `Invalid '${a}' at index ${b}`}
        if (openBrackets.includes(a)) {
            bracketLog.push(a)
        } else if (closeBrackets.includes(a)) {
            let pop = bracketLog.pop()
            if (!pop || brackets[pop] !== a) equationError(`Invalid '${a}'`)
        }
    })
    if (bracketLog.length) throw "Invalid bracket"
}

function getClosingBracketIndex(e){
    const openBracket = e[0]
    const bLog = []
    b.forEach((a,b)=>{
        if (["(","{","["].includes(a)) bLog.push(a)
        else {
            let pop = blog.pop()
        }
    })
    return
}


export {getClosingBracketIndex, checkBalancedBrackets}