import Term from "./Term.js"
import Operation from "./Operation.js"

class Expression {
    #parts = []
    #simplified

    static #matches = {
        parenthesis: /[()]/
    }


    constructor(partArr,isMain=false) {
        this.isSimplified = false
        this.isMain = isMain
        this.#parts = [...partArr]
        this.simplify()
    }

    get value() {
        return this.#parts.map((a,b,c)=>{
            let resStart = ""
            let resEnd = ""

            if (
                b !== 0
                && (c[b-1] instanceof Term || c[b-1] instanceof Expression)
                && (a.number > 0 || a instanceof Expression)
            ) {
                resStart+="+"
            }

            if (a instanceof Expression) {
                resStart+="("
                resEnd+=")"
            }

            resStart+=a.value
            return resStart + resEnd
        }).join("")
    }

    get parts() {
        return this.#parts
    }

    get simplified() {
        return this.#simplified
    }

    static get matches() {
        return this.#matches
    }

    append(term) {
        this.#parts.push(term)
    }

    simplify() {
        this.#parts = this.#parts.map(a=>{
            if (a instanceof Expression) a.simplify()
            return a
        })
        this.simplifyMultiplication()
        this.simplifyDivision()
        this.simplifyAddition()
        this.#simplified = this.value
    }

    simplifyMultiplication() {
        if (this.#parts.some(a=>a instanceof Operation && a.value === "*"))
        this.#parts = this.#parts.reduce((a,b)=>{
            if (!a.length) return [b]
            const prev = a[a.length-1]
            const prevIsMult = prev instanceof Operation && prev.value === "*"
            if (!prevIsMult) return [...a,b]
            a.pop()
            const term = a.pop()
            return [...a,Term.multiply(term,b)]
        },[])
    }

    simplifyDivision() {
        if (!this.#parts.some(a=>a instanceof Operation && a.value === "/")) return
        if (!this.isMain && this.#parts.length === 3 && this.#parts[1] instanceof Operation && this.#parts[1].value === "/") {
            this.isSimplified = Term.isSimplifiedFraction(this.#parts[0],this.#parts[2])
        }
        if (this.isSimplified) return
        this.#parts = this.#parts.reduce((a,b)=>{
            if (!a.length) return [b]
            const prev = a[a.length-1]
            const prevIsDiv = prev instanceof Operation && prev.value === "/"
            if (!prevIsDiv) return [...a,b]
            a.pop()
            const term = a.pop()
            return [...a,Term.divide(term,b)]
        },[])
    }

    simplifyAddition(e) {
        this.#parts = this.#parts.reduce((a,b)=>{
            if (!a.length) return [b]
            if (!(b instanceof Term)) return [...a,b]
            if (a[a.length-1] instanceof Operation) return [...a,b]
            const likeIndex = a.findIndex(c=>c instanceof Term && (Term.isLike(c,b) || (c.number===0||b.number===0)))
            if (likeIndex === -1) return [...a,b]
            a[likeIndex] = Term.add(a[likeIndex],b)
            return a
        },[])
    }

    static multiply(expression1, expression2) {
        const terms = []
        for (const a of expression1.parts) {
            for (const b of expression2.parts) {
                terms.push(Term.multiply(a,b))
            }
        }
    }

    static divide(expression1,expression2) {
        const terms = []
        for (const a of expression1.parts) {
            for (const b of expression2.parts) {
                terms.push(Term.divide(a,b))
            }
        }
        return terms
    }

    static match(equation) {

        for (let i in this.matches) {
            const match = equation.match(this.matches[i])
            if (match) {
                return ['expression',equation.replace(match[0],""),match[0]]
            }
        }
        return false
    }

}

export default Expression