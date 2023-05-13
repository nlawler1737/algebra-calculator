import Equation from "./classes/Equation.js"

const errorMessage = document.querySelector("#errorMessage")
const equationInput = document.querySelector("#equation")

equationInput.addEventListener("input",onInput)
// equationInput.value = "12x+3y-45z=34x"
equationInput.value = "12x+3y*3-8z=23x+4y"
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

