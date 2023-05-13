import Expression from "./Expression.js"
import Term from "./Term.js"
import Operation from "./Operation.js"

function simplifyFraction(numerator,denominator) {
    const gcd = getGCD(numerator,denominator)
    return [numerator/gcd, denominator/gcd]    
}

function getGCD(a,b) {
    return b ? getGCD(b, a%b) : a
}

function equationError(message) {
    errorMessage.innerText = message
    throw new Error(message)
}

function simplifyRoot(root,num) {
    // simplified 30240^(1/3) -> 6(140^(1/3))
    // unsimplified 6(140^(1/3)) -> 6^3*140 = 30240
    let multiplier = 1
    let radicand = 1
    const bd = breakDown(root,num)

    if (!bd.length) return [1,root,num]

    const map = bd.reduce((a,b)=>{
        a[b] ??= 0
        a[b]++
        return a
    },{})

    for (const key in map) {
        if (map[key] >= root) {
            multiplier *= key**Math.floor(map[key]/root)
            map[key]-=root
        }
        if (map[key]!==0) radicand *= key**map[key]
    }
    
    let resStart = ""
    let resEnd = ""
    if(multiplier!==1) {
        resStart += `${multiplier}(`
        resEnd += ")"
    }
    // let expression
    // const parts = []
    // if (radicand === 1) expression = new Term(multiplier)
    // else {
    //     if (multiplier!==1) parts.push(new Term(multiplier),new Operation("/"),new Term(`${radicand}^(1/${root})`))
    // }
    return [multiplier,root,radicand,`${resStart}${radicand}^(1/${root})${resEnd}`]
    
    function breakDown(root,num) {
        if (!num || num < 0) throw "Number must be greater than zero" 
        const primeNumbers = [2,3,5,7,11,13,17]
        let spn = primeNumbers.find(a=>{
            return num / a % 1 === 0
        })
        return !spn ? [] : [spn,...breakDown(root,num/spn)]
    }
}

export {
    simplifyFraction,
    getGCD,
    equationError,
    simplifyRoot
}