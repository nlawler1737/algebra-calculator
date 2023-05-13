import Expression from "./Expression.js"
import Operation from "./Operation.js"
import { equationError, simplifyFraction } from "./utils.js"

class Term {
    #term
    #sign
    #number
    #variables
    #variablesSimplified

    static #matches = {
        // -x3 | -x^3 | -x^3y34 | x4y^-5 | -xy
        _varExp: /^[-+]?([a-z]\^?(((?<=\^)-?\d+(\.\d+)?)|(\d+(\.\d+)))?)+/,
        // -+digits.digits + x3 | x^3 | x^3y34 | x4y^-5 | xy
        _mixExp: /^[-+]?\d+(\.\d+)?\^?((?<=\^)[-+]?\d+)?([a-z]\^?(?:(?:(?<=\^)-?)?\d+(\.\d+)?)?)*/,
        // _mixExp: /^[-+]?\d+(\.\d+)?(\^?((?<=\^)[-+]?\d+)?([a-z]\^?(((?<=\^)-?\d+(\.\d+)?)|(\d+.(\.\d+)?))?)*)?/,                                                                                                     
    }

    constructor(term) {
        if (term === undefined || term === null || term === "") return
        this.#term = term.toString()
        let parts = this.#term.match(/^([\+-])?((\d+)(\.(\d+))?)?(\^(\d+(?:\.\d+)?))? ?(.+)?$/)
        // [ 0: match, 1: sign, 2: float, 3: int, 4: dec, 5: decInt, 6: exp, 7: expFloat, 8: vars]
        this.#sign = parts[1] === "-" ? -1 : 1
        this.#number = parts[2] ? Number(parts[2]) : 1
        this.#number *= this.#sign
        if (parts[6]) this.#number**Number(parts[7])
        this.setVariables(parts[8])
    }
    setVariables(input) {
        const setTerm = ()=>{
            if (!this.#variablesSimplified) return this.#number
            return (this.#number===1?"":this.#number===-1?"-":this.#number)+this.#variablesSimplified
        }
        if (!input || (typeof input == "object" && ((Array.isArray(input) && input.length === 0)||!Object.keys(input).length))) {
            this.#variables = {}
            this.#variablesSimplified = ""
            this.#term = setTerm()
            return
        }
        if (typeof input === "object" && !Array.isArray(input)) {
            this.#setFromVarObj(input)
            this.#term = setTerm()
            return
        }
        if (typeof input === "string") {
            input = input.match(/[a-z](\^?-?\d+(\.\d+))?/g)
        }
        if (Array.isArray(input)) {
            const obj = this.#stringVarArrToObj(input)
            this.#variables = obj
            this.#setFromVarObj(this.#variables)
            this.#term = setTerm()
            return
        }

    }
    get value() {
        return this.#term
    }
    get term() {
        return this.#term
    }
    get number() {
        return this.#number
    }
    get variables() {
        return this.#variables
    }
    get variablesSimplified() {
        return this.#variablesSimplified
    }

    static get matches() {
        return this.#matches
    }

    #stringVarArrToObj(varArr) {
        if (!varArr) return
        const vars = {}
        varArr.forEach(a=>{
            const varToPow = a.split(/\^|(?<=[a-z])/)
            vars[varToPow[0]] ??= 0
            vars[varToPow[0]] += Number(varToPow[1]) || 1
        })
        return vars
    }

    #setFromVarObj(varObj) {
        const keys = Object.keys(varObj)
        const vals = Object.values(varObj)
        const simplified = new Array(keys.length).fill().map((a,b)=>keys[b]+(vals[b]!==0&&vals[b]!==1?"^"+vals[b]:"")).join("")
        this.#variables = varObj
        this.#variablesSimplified = simplified
    }


    static findGCDofNumber(num1,num2) {
        while (num1 != num2 && counter < 1000) {
            num1 > num2 ? num1-=num2 : num2-=num1
            counter++
        }
        return num1
    }
    static #variablesMatch(term1,term2) {
        const entries1 = Object.entries(term1.variables)
        const entries2 = Object.entries(term2.variables)
        const oneHasTwo = entries1.every(a=>term2.variables[a[0]] === a[1])
        if (!oneHasTwo) return false
        const twoHasOne = entries2.every(a=>term1.variables[a[0]] === a[1])
        if (!twoHasOne) return false
        return true
    }

    static isSimplifiedFraction(term1,term2) {
        const isLike = Term.isLike(term1,term2)
        const simplifiedCoefficient = simplifyFraction(term1.number,term2.number)
        const isSimplifiedCoefficient = simplifiedCoefficient[0] === term1.number && simplifiedCoefficient[1] === term2.number
        const keys1 = Object.keys(term1.variables)
        const keys2 = Object.keys(term2.variables)
        const shareVariables = keys1.some(a=>keys2.includes(a))
        return (simplifiedCoefficient[1] === 1 || simplifiedCoefficient) && !shareVariables
    }

    static getResult(termArr) {
        return termArr.map((a,b)=>{
            let res = ""
            if (b!==0 && a.number>0) res+="+"
            res += a.number+a.variablesSimplified
            return res
        }).join("")
    }

    static isLike(term1,term2) {
        return this.#variablesMatch(term1,term2)
    }
    static add(term1,term2) {
        if (term1.number === 0) return term2
        if (term2.number === 0) return term1
        if (!this.isLike(term1,term2)) throw "These are not like terms"
        const newNum = term1.number + term2.number
        return new Term(newNum+term1.variablesSimplified)
    }

    static multiply(term1,term2) {
        if (term1.number === 0 || term2.number === 0) return new Term(0)
        const newVars = {}
        const newNum = term1.number * term2.number
        const newTerm = new Term(newNum)
        for (const i in term1.variables) {
            newVars[i] ??= 0
            newVars[i] += term1.variables[i]
        }
        for (const i in term2.variables) {
            newVars[i] ??= 0
            newVars[i] += term2.variables[i]
        }
        newTerm.setVariables(newVars)
        return newTerm
    }

    static divide(term1,term2) {
        if (term2.number === 0) equationError("Cannot divide by zero")
        if (term1.number === 0) return new Term(0)
        const isLike = Term.isLike(term1,term2)
        const simplifiedCoefficients = simplifyFraction(term1.number,term2.number)

        if (isLike && simplifiedCoefficients[1] === 1) {
            return new Term(simplifiedCoefficients[0])
        }
        if (term2.number === 1 && !Object.keys(term2.variables).length) {
            return term1
        }

        const term1Vars = {...term1.variables}
        const term2Vars = {...term2.variables}

        for (const i in term1Vars) {
            if (!term1Vars[i] || !term2Vars[i]) continue
            const min = Math.min(term1Vars[i],term2Vars[i])
            term1Vars[i]-=min
            term2Vars[i]-=min
            if (!term1Vars[i]) delete term1Vars[i]
            if (!term2Vars[i]) delete term2Vars[i]
        }

        const newTerm1 = new Term(simplifiedCoefficients[0])
        const newTerm2 = new Term(simplifiedCoefficients[1])
        newTerm1.setVariables(term1Vars)
        newTerm2.setVariables(term2Vars)
        if (newTerm2.number === 1 && !Object.keys(term2Vars).length) return newTerm1
        const expression = new Expression([newTerm1,new Operation("/"),newTerm2])
        expression.isSimplified = true
        return expression
    }

    static match(equation) {

        for (let i in this.matches) {
            const match = equation.match(this.matches[i])
            if (match) {
                return [new this(match[0]),equation.replace(match[0],"")]
            }
        }
        return false
    }
}

export default Term