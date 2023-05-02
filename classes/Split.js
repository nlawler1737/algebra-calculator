function term(equation) {
    /*
        -23
        23x
        23xy
        23xy^2
        23xy^-2
        23xy2
        23x^2y2
        x
    */
    equation = "-4x^-5y^-5"
    equation = "-3^3x4y^-04"
    const matches = {
        _varExp: /^[-+]?([a-z]\^?((?<=\^)-\d+|\d+)?)+/, // -x3 | -x^3 | -x^3y34 | x4y^-5 | -xy
        _mixExp: /^[-+]?\d+(\^?((?<=\^)[-+]?\d+)?([a-z]\^?((?<=\^)-\d+|\d+)?)+)?/, // -+digits + x3 | x^3 | x^3y34 | x4y^-5 | xy
        // _varExpNegative: /^[-+]?([a-z]\^-\d+)+/, // -x^-3
        // _var: /^[-+]?[a-z]+/, // -xy
        // _numVar: /^[-+]?\d+[a-z]+?/, // -23 | 23xy
        // _numVarExp: /^[-+]?\d+()[a-z]/
        // _
    }
    for (let i in matches) {
        const match = equation.match(matches[i])
        if (match) {
            console.log(i,match)
            break
        }
    }
    // const _

}

function match() {

}

export default {match,term}