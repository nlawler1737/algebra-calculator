class Operation {
    constructor(operation) {
        if (!operation.match(/[\/\+\*-]/)) throw "Invalid Operation"
        this.type = operation
    }
    
    static match(equation) {
        const matches = {
            _operations: /^[*/+-]/
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

export default Operation