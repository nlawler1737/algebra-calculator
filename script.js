import Equation from "./classes/Equation.js"

const errorMessage = document.querySelector("#errorMessage")
const equationInput = document.querySelector("#equation")

equationInput.addEventListener("input",onInput)
equationInput.value = "147/3"
// equationInput.value = "12x+4x"
// equationInput.value = "12x+4x+6x-2y-1y"
// equationInput.value = "4x=12"
// equationInput.value = "12x+3y-45z=34x"
// equationInput.value = "2w-10x+20y*3=17x-2z-46w/2"
onInput({target:equationInput})

function onInput(e) {
    errorMessage.innerText = ""
    const eq = new Equation(e.target.value).solve()
    if (Array.isArray(eq)) displayResults(eq)
    else {
        displayResults([
            {
                name: "Result",
                value: eq || "waiting..."
            }
        ])
    }   
}

/**
 * 
 * @param {{name:string,value:string}[]} results 
 */
function displayResults(results) {
    const resultsDiv = document.querySelector("#results")
    while(resultsDiv.firstChild) {
        resultsDiv.firstChild.remove()
    }
    for (const i of results) {

        const resultDiv = document.createElement("div")
        resultDiv.classList = "result"

        const resultName = document.createElement("div")
        resultName.classList = "resultName"
        resultName.appendChild(document.createTextNode(i.name))

        const resultValue = document.createElement("div")
        resultValue.classList = "resultValue"
        resultValue.appendChild(document.createTextNode(i.value))

        resultDiv.append(resultName,resultValue)
        resultsDiv.append(resultDiv)
    }
}