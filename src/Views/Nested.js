import Header from "../Components/Header";

function Nested() {
    return ( /*html*/`
        ${Header()}
        <c-a to="/obj">Nested obj</c-a>
        <div id="nested-route"></div>
    ` );
}

export default Nested;