import Parenthesis from "./classes/Parenthesis.js"
import Exponent from "./classes/Exponent.js";
import Operation from "./classes/Operation.js";
import Term from "./classes/Term.js"
import Split from "./classes/Split.js"
import {checkBalancedBrackets, getClosingBracketIndex} from "./classes/Brackets.js"

// Split.term("x-5")
// console.log(Term.match("-4x"))
// console.log(Term.findGCDofNumber(228,21))

const operationMatch = /^[/+*-]$/
const termMatch = "(([\\+-]?(\\d+)([a-z]+)?)|([\\+-]?(\\d+)?([a-z]+))(\^\d+)?)"
const compoundMatch = `\\(${termMatch}.`
// const termMatch = /^(([\+-]?\d+ ? \/? ?)?[\+-]?\d+ ?\(.+\))|([\+-]?\d+)([a-z]+)?$/
// const termMatch = /^(([\+-]?\d+ ? \/? ?)?[\+-]?\d+ ?\(.+\))|\1([a-z]+)?$/

const parenthesisMatch = /\(.*\)+?/

// console.log(new Term("xy"))
let equation = ""
equation = "180x=2(30/3)+15-5*11+2/1"
equation = "-12*4-5x*6/3"
equation = "6/(2/3)x"
equation = "(2/3) + (4/5)x + x(3) + 3x + 4/5x + 2(4xy/3) + 10 + ys"
equation = "(2/3)"
// equation = "2 (30))"

/*
180x=2(30/3)+15-5*11+2/1
180x=2(10)+15-5*11+2/1
180x=20+15-5*11+2/1
180x=20+15-55+2/1
180x=20+15-55+2
180x=35-55+2
180x=-20+2
180x=-18
180x/180=-16/180
x = -0.1
*/

// console.log("solved",solve(equation))
document.querySelector("#equation").addEventListener("input",function(e){
    const eq = solve(e.target.value)
    document.querySelector("#result").innerText = eq
})

globalThis.solve = solve

function solve(e) {
    checkInvalid(e)
    const cleaned = cleanUp(e)
    console.log(cleaned)
    const split = splitParts(cleaned)
    console.log(split)
    if (split.includes("=")) return solveAlgebra(split)
    else return simplify(split)
}

function solveBasic(split) {
    simplify(split)
}

function solveAlgebra(split) {
    let [leftRaw,rightRaw] = getLeftAndRightOfEquals(split)
    let left = simplify(leftRaw)
    let right = simplify(rightRaw)
}

function checkInvalid(e) {
    checkBalancedBrackets(e)
    if (e.match("  ")) throw new Error("Too many spaces")
    if (e.match(/=/g)?.length > 1) throw new Error("Too many '=' signs")
    if (e.match(/\*\*/)) throw new Error("Too many '*' in a row")
    if (e.match(/[*/+-][*/+-]/)) throw new Error("Operations are written incorrectly")
    if (e.match(/\/\//)) throw new Error("Too many '/' in a row")
    if (e.match(/\^\^/)) throw new Error("Too many '^' in a row")
    let extraPlusMinus = e.match(/[\+-](?![ \d\+-])/)
    if (extraPlusMinus) {
        const {index,input} = extraPlusMinus
        throw new Error("extra '+' or '-' at index " + index + "; " + input.slice(Math.max(index-2,0),Math.min(index+3,input.length)))
    }
}

function cleanUp(e) {
    e = e.replaceAll(/\s/g,"")
    while (e.match(/--|\+\+|-\+|\+-/)) {
        e = e.replace(/\++|(--)+/,"+")
        e = e.replace(/\+-|-\+/,"-")
    }
    return e
}

function splitParts(e) {
    const parts = []
    // console.log(Term.match(e))
    const methods = [
        Term,
        Operation
    ]
    let counter = 0
    while (e.length && counter < 5000) {
        for (const i of methods) {
            const match = i.match(e)
            if (match) {
                parts.push(match[0])
                e = match[1]
                break
            }
        }
        if (counter >= 4999) throw new Error("'splitParts' exceeded max call amount")
        counter++
    }
    console.log(parts)
    return parts
    // console.log(e)
    // return e.match(/([\+-]?\d+(\.\d+)? ?\(.+\))|([\+-]?\d+)(\.\d+)?([a-z]+)?|(?!=[\s])[a-z]+|\(.+\)|=|\*|\//g)
    //                      term                       term                          term      parenthesis ...operations
}

function getLeftAndRightOfEquals(e) {
    e = [...e]
    let equalsIndex = e.findIndex((a)=>a==="=")
    let left = e.splice(0,equalsIndex)
    e.shift()

    return [left,e]
}

function simplify(e) {
    e = [...e]
    // let components = e.map(a=>getType(a))
    let components = e
    
    // if (e.includes("*")) simplifyMultiplication(e)
    components = simplifyMultiplication(components)
    components = simplifyDivision(components)
    components = simplifyAddition(components)
    return Term.getResult(components)
    

    // const simplified = e.reduce((a,b)=>{
    //     if (!(a instanceof Term)) return a
    //     b = new Term(b)
    //     if (!a.length) return [b]
    //     const likeIndex = a.findIndex(e=>e.isLike(b))
    //     if (likeIndex === -1) return [...a,b]
    //     a[likeIndex] = a[likeIndex].add(b)
    //     return a
    // },[])
    // const likeTerms = 
}

function simplifyAddition(e) {
    e = [...e]
    const simplified = e.reduce((a,b)=>{
        if (!a.length) return [b]
        const likeIndex = a.findIndex(c=>Term.isLike(c,b))
        if (likeIndex === -1) return [...a,b]
        a[likeIndex] = Term.add(a[likeIndex],b)
        return a
    },[])
    return simplified
}

function simplifyDivision(e) {
    e = [...e]
    const simplified = e.reduce((a,b)=>{
        if (!a.length) return [b]
        const prev = a[a.length-1]
        const prevIsDiv = prev instanceof Operation && prev.type === "/"
        if (!prevIsDiv) return [...a,b]
        a.pop()
        const term = a.pop()
        return [...a,Term.divide(term,b)]
    },[])
    return simplified
}

function simplifyMultiplication(e) {
    e = [...e]
    const simplified = e.reduce((a,b)=>{
        if (!a.length) return [b]
        const prev = a[a.length-1]
        // if (prev instanceof Operation && prev.type !== "*") return [...a,b]
        const prevIsMult = prev instanceof Operation && prev.type === "*"
        if (!prevIsMult) return [...a,b]
        a.pop()
        const term = a.pop()
        return [...a,Term.multiply(term,b)]
    },[])
    return simplified

}

function getType(part) {
    console.log(part)
    if (part.match(operationMatch)) return new Operation(part)
    if (part.match(termMatch)) return new Term(part)
    if (part.match(parenthesisMatch)) return new Parenthesis(part)
    if (part.match(exponentMatch)) return new Exponent(part)
}

// function getClosingBracketIndex(e) {
//     const openBracket = e[0]
//     const bLog = []
//     // const b = e.match(/[\(\)\{\}\[\]]/g)
//     // if (!b) return
//     b.forEach((a,b)=>{
//         if (["(","{","["].includes(a)) bLog.push(a)
//         else {
//             let pop = blog.pop()
//             // if ()
//         }
//     })
//     return
//     b.forEach((a,b)=>{
//         const err = () => {throw `Invalid '${a}' at index ${b}`}
//         if (["(","{","["].includes(a)) bLog.push(a)
//         else {
//             let pop = bLog.pop()
//             switch (pop) {
//                 case "(":
//                     if (a !== ")") err()
//                     break;
//                 case "{":
//                     if (a !== "}") err()
//                     break;
//                 case "[":
//                     if (a !== "]") err()
//                     break;
//                 default:
//                     break;
//             }
//         }
//     })
// }

// function checkBalancedBrackets(e) {
//     const brackets = {
//         "(":")",
//         "{":"}",
//         "[":"]"
//     }
//     const openBrackets = Object.keys(brackets)
//     const closeBrackets = Object.values(brackets)
//     const bracketChars = [...openBrackets,...closeBrackets]
//     const bracketArr = e.split("").filter(a=>bracketChars.includes(a))
//     const bracketLog = []
//     if (!bracketArr.length) return
//     bracketArr.forEach((a,b)=>{
//         // console.log(a)
//         const err = () => {throw `Invalid '${a}' at index ${b}`}
//         if (openBrackets.includes(a)) {
//             bracketLog.push(a)
//         } else if (closeBrackets.includes(a)) {
//             let pop = bracketLog.pop()
//             if (!pop || brackets[pop] !== a) err()
//             // switch (pop) {
//             //     case undefined:
//             //         err()
//             //         break;
//             //     case "(":
//             //         if (a !== ")") err()
//             //         break;
//             //     case "{":
//             //         if (a !== "}") err()
//             //         break;
//             //     case "[":
//             //         if (a !== "]") err()
//             //         break;
//             //     default:
//             //         break;
//             // }
//         }
//     })
//     if (bracketLog.length) throw "Invalid bracket"
// }
