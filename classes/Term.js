// import { default as partMatch } from "./match"
// import Part from "./Part.js"

class Term {
    #term
    #number
    #numerator
    #denominator
    #variables
    #variablesSimplified
    #variablesStretched

    static #matches = {
        _varExp: /^[-+]?([a-z]\^?((?<=\^)-\d+|\d+)?)+/, // -x3 | -x^3 | -x^3y34 | x4y^-5 | -xy
        _mixExp: /^[-+]?\d+(\^?((?<=\^)[-+]?\d+)?([a-z]\^?((?<=\^)-\d+|\d+)?)+)?/, // -+digits + x3 | x^3 | x^3y34 | x4y^-5 | xy
    }

    constructor(term) {
        if (!term) return
        this.#term = term.toString()
        let parts = this.#term.match(/^([\+-]?\d+(\.\d+)?)? ?(.+)?$/)
        this.#number = parts[1] ? Number(parts[1]) : ""
        this.setVariables(parts[3])
    }
    setVariables(input) {
        if (!input || (typeof input == "object" && ((Array.isArray(input) && input.length === 0)||!Object.keys(input).length))) {
            this.#variables = {}
            this.#variablesSimplified = ""
            this.#variablesStretched = ""
            this.#term = this.#number+this.#variablesSimplified
            return
        }
        if (typeof input === "object" && !Array.isArray(input)) {
            this.#setFromVarObj(input)
            this.#term = this.#number+this.#variablesSimplified
            return
        }
        if (typeof input === "string") {
            input = input.match(/[a-z](\^\d+)?/g)
        }
        if (Array.isArray(input)) {
            const obj = this.#rawVarArrToObj(input)
            this.#variables = obj
            this.#setFromVarObj(this.#variables)
            this.#term = this.#number+this.#variablesSimplified
            return
        }
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
    get variablesStretched() {
        return this.#variablesStretched
    }

    #rawVarArrToObj(varArr) {
        if (!varArr) return
        const vars = {}
        varArr.forEach(a=>{
            const varToPow = a.split("^")
            vars[varToPow[0]] ??= 0
            vars[varToPow[0]] += Number(varToPow[1]) || 1
        })
        return vars
    }

    #setFromVarObj(varObj) {
        const keys = Object.keys(varObj)
        const vals = Object.values(varObj)
        const simplified = new Array(keys.length).fill().map((a,b)=>keys[b]+(vals[b]>1?"^"+vals[b]:"")).join("")
        // console.log(keys,vals)
        const stretched = new Array(keys.length).fill().map((a,b)=>keys[b].repeat(vals[b])).join("")
        this.#variables = varObj
        this.#variablesSimplified = simplified
        this.#variablesStretched = stretched
    }
    #simplifyFraction() {
        this.#numerator
    }
    static #getSimplifiedVarsFromObj(varObj) {
        const keys = Object.keys(varObj)
        const vals = Object.values(varObj)
        return new Array(keys.length).fill().map((a,b)=>keys[b]+(vals[b]>1?"^"+vals[b]:"")).join("")
    }
    #simplifyVars (varString) {
        const vars = {}
        varString.split("").forEach(a=>{
            vars[a] ??= 0
            vars[a]++
        })
        this.variablesMap = vars
        return Object.entries(vars).map(a=>a[0]+(a[1]>1?"^"+a[1]:"")).join("")
    }
    static findGCDofNumber(num1,num2) {
        while (num1 != num2 && counter < 1000) {
            num1 > num2 ? num1-=num2 : num2-=num1
            counter++
        }
        return num1
    }
    static #variablesMatch(term1,term2) {
        console.log(term1,term2)
        const entries1 = Object.entries(term1.variables)
        const entries2 = Object.entries(term2.variables)
        console.log(entries1,entries2)
        const oneHasTwo = entries1.every(a=>term2.variables[a[0]] === a[1])
        if (!oneHasTwo) return false
        const twoHasOne = entries2.every(a=>term1.variables[a[0]] === a[1])
        if (!twoHasOne) return false
        return true
    }
    static getResult(termArr) {
        console.log(termArr)
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
        if (!this.isLike(term1,term2)) throw "These are not like terms"
        // console.log(term1,term2)
        const newNum = term1.number + term2.number
        return new Term(newNum+term1.variablesSimplified)
    }

    static multiply(term1,term2) {
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
        console.log(term1,term2)
        const newVars = {}
        const newNum = term1.number / term2.number
        console.log(term1.number, term2.number)
        const newTerm = new Term(newNum)
        for (const i in term1.variables) {
            newVars[i] ??= 0
            newVars[i] -= term1.variables[i]
        }
        for (const i in term2.variables) {
            newVars[i] ??= 0
            newVars[i] -= term2.variables[i]
        }
        newTerm.setVariables(newVars)
        return newTerm
    }

    // static match = partMatch(
    //     {
    //         _varExp: /^[-+]?([a-z]\^?((?<=\^)-\d+|\d+)?)+/, // -x3 | -x^3 | -x^3y34 | x4y^-5 | -xy
    //         _mixExp: /^[-+]?\d+(\^?((?<=\^)[-+]?\d+)?([a-z]\^?((?<=\^)-\d+|\d+)?)+)?/, // -+digits + x3 | x^3 | x^3y34 | x4y^-5 | xy
    //     },
    //     equation
    // )
    static match(equation) {
        const matches = {
            _varExp: /^[-+]?([a-z]\^?((?<=\^)-\d+|\d+)?)+/, // -x3 | -x^3 | -x^3y34 | x4y^-5 | -xy
            _mixExp: /^[-+]?\d+(\^?((?<=\^)[-+]?\d+)?([a-z]\^?((?<=\^)-\d+|\d+)?)+)?/, // -+digits + x3 | x^3 | x^3y34 | x4y^-5 | xy
        }

        for (let i in matches) {
            const match = equation.match(matches[i])
            if (match) {
                return [new this(match[0]),equation.replace(match[0],"")]
            }
        }
        return false
    }
}

export default Term