class Operation {
    #type
    
    static #matches = {
        _operations: /^[*/+-=]/
    }

    constructor(operation) {
        if (!operation.match(/^[*/+-=]/)) throw "Invalid Operation"
        this.#type = operation
    }

    set value(operation) {
        if (!Operation.match(operation)) throw "Invalid Operation"
        this.#type = operation
    }
    get value() {
        return this.#type
    }

    static get matches() {
        return this.#matches
    }
    
    static match(equation) {

        for (let i in this.#matches) {
            const match = equation.match(this.#matches[i])
            if (match) {
                return [new this(match[0]),equation.replace(match[0],"")]
            }
        }
        return false
    }
}

export default Operation