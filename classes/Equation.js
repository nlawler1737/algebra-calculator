import Expression from "./Expression.js"
import Term from "./Term.js"
import Operation from "./Operation.js"
import { checkBalancedBrackets } from "./Brackets.js"
import { equationError } from "./utils.js"

// console.log(new Expression([new Term(12),new Operation("/"),new Term(4)]))

class Equation {
    #isEquation
    #equationString
    #parsed
    #equation = []

    constructor(equation) {
        this.#equationString = equation
        this.parseEquationString()
    }

    get equation() {
        return this.#equation
    }

    solve() {
        console.log(this.#equation)
        this.#equation.forEach(a=>a.simplify())
        if (this.#isEquation) return this.#solveAlgebra()
        if (!this.#isEquation) return this.#equation[0].simplified
        if (this.#isEquation) return this.#equation.map(a=>a.simplified).join("=")
        // else return this.#equation.map(a=>a.simplified).join("=")
    }

    parseEquationString() {
        this.#checkInvalid()
        this.#clean()
        this.#splitParts()
        this.#isEquation = this.#parsed.some(e=>e instanceof Operation && e.value == "=")
        this.#equation = this.#isEquation ? getLeftAndRightOfEquals(this.#parsed).map(a=>new Expression(a,true)) : [new Expression(this.#parsed,true)]
    }

    #checkInvalid() {
        checkBalancedBrackets(this.#equationString)
        console.log(this.#equationString)
        if (this.#equationString.match("  ")) equationError("Too many spaces")
        if (this.#equationString.match(/=/g)?.length > 1) equationError("Too many '=' signs")
        if (this.#equationString.match(/\.\./)) equationError("Too many '.' in a row")
        if (this.#equationString.match(/(?<!\d)\./)) equationError("'.' must follow digit")
        if (this.#equationString.match(/\*\*/)) equationError("Too many '*' in a row")
        if (this.#equationString.match(/[*/+-][*/]/)) equationError("Operations are written incorrectly")
        if (this.#equationString.match(/\/\//)) equationError("Too many '/' in a row")
        if (this.#equationString.match(/\^\^/)) equationError("Too many '^' in a row")
        let extraPlusMinus = this.#equationString.match(/[\+-](?![ \da-z\+-])/)
        if (extraPlusMinus) {
            const {index,input} = extraPlusMinus
            equationError("extra '+' or '-' at index " + index + "; " + input.slice(Math.max(index-2,0),Math.min(index+3,input.length)))
        }
    }

    #clean() {
        this.#parsed = this.#equationString.replaceAll(/\s/g,"")
        while (this.#parsed.match(/--|\+\+|-\+|\+-/)) {
            this.#parsed = this.#parsed.replace(/\++|(--)+/,"+")
            this.#parsed = this.#parsed.replace(/\+-|-\+/,"-")
        }
    }

    #splitParts() {
        this.#parsed = this.#parsed.trim()
        const parts = []
        const expressionQueue = []
        const innerExpressionQueue = []

        const methods = [
            Term,
            Operation,
            Expression
        ]

        let counter = 0
        while (this.#parsed.length && counter < 5000) {
            let foundMatch = false
            for (const i of methods) {
                const match = i.match(this.#parsed)
                if (match) {
                    if (match[0] === "expression") {
                        if (match[2] === "(") expressionQueue.push(new Expression([]))
                        else if (match[2] === ")") {
                            let toReturn
                            const expression = expressionQueue.pop()
                            const expParts = expression.parts
                            expParts.splice(0,0,...innerExpressionQueue.splice(0))
                            expression.simplify()
                            if (expression.parts.length === 1) toReturn = expression.parts[0]
                            else toReturn = expression
                            console.log(toReturn)
                            if (expressionQueue.length) innerExpressionQueue.push(toReturn)
                            else parts.push(toReturn)
                        }
                    } else if (expressionQueue.length) {
                        innerExpressionQueue.push(match[0])
                    } else {
                        parts.push(match[0])
                    }
                    this.#parsed = match[1].trim()
                    foundMatch = true
                    break
                }
            }
            if (!foundMatch) equationError("Unexpected Expression")
            if (counter >= 4999) equationError("'splitParts' exceeded max call amount")
            counter++
        }
        this.#parsed = parts
    }

    #solveAlgebra() {
        let left = this.#equation[0].parts
        let right = this.#equation[1].parts
        const negativeOneTerm = new Term("-1")
        const varMap = {
            left: {},
            right: {}
        }
        const variablesUsed = []
        const results = []
        left.forEach(a=>{
            if (!(a instanceof Term)) return

            const entries = Object.entries(a.variables)

            for(const i of entries) {
                varMap.left[i[0]] ??= 0
                varMap.left[i[0]] += i[1]
                if (!variablesUsed.includes(i[0])) variablesUsed.push(i[0])
            }
        })
        right.forEach(a=>{
            if (!(a instanceof Term)) return

            const entries = Object.entries(a.variables)

            for(const i of entries) {
                varMap.right[i[0]] ??= 0
                varMap.right[i[0]] += i[1]
                if (!variablesUsed.includes(i[0])) variablesUsed.push(i[0])
            }
        })
        for (const variable of variablesUsed) {
            const equation = []
            const sidesWithVar = [varMap.left.hasOwnProperty(variable),varMap.right.hasOwnProperty(variable)]
            const leftDuplicate = new Equation(this.#equation[0].value).equation[0].parts
            const rightDuplicate = new Equation(this.#equation[1].value).equation[0].parts
            let mostTerms = []

            if (sidesWithVar[0]&&sidesWithVar[1]) {
                mostTerms = [leftDuplicate,rightDuplicate].sort((a,b)=>a.length-b.length)
            } else if (sidesWithVar[0]) {
                mostTerms = [leftDuplicate,rightDuplicate]
            } else {
                mostTerms = [rightDuplicate,leftDuplicate]
            }

            const termsToRemove = [[],[]]

            for (let term of mostTerms[0]) {
                if (term.variables.hasOwnProperty(variable)) continue
                termsToRemove[0].push(term)
                mostTerms[1] = [...mostTerms[1],Term.multiply(term,negativeOneTerm)]
            }

            termsToRemove[0].forEach(a=>mostTerms[0].splice(mostTerms[0].indexOf(a),1))

            for (let term of mostTerms[1]) {
                if (!term.variables.hasOwnProperty(variable)) continue
                termsToRemove[1].push(term)
                mostTerms[0] = [...mostTerms[0],Term.multiply(term,negativeOneTerm)]
            }

            termsToRemove[1].forEach(a=>mostTerms[1].splice(mostTerms[1].indexOf(a),1))

            let leftExpression = new Expression(mostTerms[0])
            let rightExpression = new Expression(mostTerms[1])

            if (leftExpression.parts.length === 1) {
                const firstTerm = leftExpression.parts[0]
                const toDivideTerm = new Term(firstTerm.number)
                const vars = {...firstTerm.variables}
                vars[variable] -= 1
                if (vars[variable] === 0) delete vars[variable]
                toDivideTerm.setVariables(vars)
                const toDivideExpression = new Expression([toDivideTerm])
                leftExpression = Expression.divide(leftExpression,toDivideExpression)
                rightExpression = Expression.divide(rightExpression,toDivideExpression)
            }

            equation[0] = new Expression(leftExpression)
            equation[1] = new Expression(rightExpression)
            results.push({name:variable,value:equation[1].value})
        }
        return results
    }
}

function getLeftAndRightOfEquals(equation) {
    equation = [...equation]
    let equalsIndex = equation.findIndex((a)=>a instanceof Operation && a.value == "=")
    let left = equation.splice(0,equalsIndex)
    equation.shift()
    return [left,equation]
}

export default Equation