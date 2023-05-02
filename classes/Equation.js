class Equation {
    #outputElement
    constructor(equation) {

    }

    setOutputElement(element) {
        if (!(element instanceof HTMLElement)) throw new Error("Not An Element")
        this.#outputElement = element
    }
}