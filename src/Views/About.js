import Header from "../Components/Header";
import { useParams } from "../modules/cocktail";

function About() {
    useParams()
    return ( /*html*/`
        ${Header()}
        <div>this About page...</div>
    ` );
}

export default About;