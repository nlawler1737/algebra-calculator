export default (matches, equation) => {
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
    // equation = "-4x^-5y^-5"
    // equation = "-3^3x4y^-04"
    // const matches = {
    //     _varExp: /^[-+]?([a-z]\^?((?<=\^)-\d+|\d+)?)+/, // -x3 | -x^3 | -x^3y34 | x4y^-5 | -xy
    //     _mixExp: /^[-+]?\d+(\^?((?<=\^)[-+]?\d+)?([a-z]\^?((?<=\^)-\d+|\d+)?)+)?/, // -+digits + x3 | x^3 | x^3y34 | x4y^-5 | xy
    // }
    return function(equation) {

        const matches = matches

        for (let i in matches) {
            const match = equation.match(matches[i])
            if (match) {
                // console.log(i,match)
                return [new this(match[0]),equation.replace(match[0],"") || null]
            }
        }
        return false
    }
    // const _

}