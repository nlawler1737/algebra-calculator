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
        // console.log(a)
        const err = () => {throw `Invalid '${a}' at index ${b}`}
        if (openBrackets.includes(a)) {
            bracketLog.push(a)
        } else if (closeBrackets.includes(a)) {
            let pop = bracketLog.pop()
            if (!pop || brackets[pop] !== a) callback(a,b,c)
            // switch (pop) {
            //     case undefined:
            //         err()
            //         break;
            //     case "(":
            //         if (a !== ")") err()
            //         break;
            //     case "{":
            //         if (a !== "}") err()
            //         break;
            //     case "[":
            //         if (a !== "]") err()
            //         break;
            //     default:
            //         break;
            // }
        }
    })
}

function checkBalancedBrackets(e) {
    
    const bracketArr = e.split("").filter(a=>bracketChars.includes(a))
    const bracketLog = []
    if (!bracketArr.length) return
    bracketArr.forEach((a,b)=>{
        // console.log(a)
        const err = () => {throw `Invalid '${a}' at index ${b}`}
        if (openBrackets.includes(a)) {
            bracketLog.push(a)
        } else if (closeBrackets.includes(a)) {
            let pop = bracketLog.pop()
            if (!pop || brackets[pop] !== a) err()
            // switch (pop) {
            //     case undefined:
            //         err()
            //         break;
            //     case "(":
            //         if (a !== ")") err()
            //         break;
            //     case "{":
            //         if (a !== "}") err()
            //         break;
            //     case "[":
            //         if (a !== "]") err()
            //         break;
            //     default:
            //         break;
            // }
        }
    })
    if (bracketLog.length) throw "Invalid bracket"
}

function getClosingBracketIndex(e){
    const openBracket = e[0]
    const bLog = []
    // const b = e.match(/[\(\)\{\}\[\]]/g)
    // if (!b) return
    b.forEach((a,b)=>{
        if (["(","{","["].includes(a)) bLog.push(a)
        else {
            let pop = blog.pop()
            // if ()
        }
    })
    return
    b.forEach((a,b)=>{
        const err = () => {throw `Invalid '${a}' at index ${b}`}
        if (["(","{","["].includes(a)) bLog.push(a)
        else {
            let pop = bLog.pop()
            switch (pop) {
                case "(":
                    if (a !== ")") err()
                    break;
                case "{":
                    if (a !== "}") err()
                    break;
                case "[":
                    if (a !== "]") err()
                    break;
                default:
                    break;
            }
        }
    })
}


export {getClosingBracketIndex, checkBalancedBrackets}