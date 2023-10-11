import App from "./Views/App";
import { $,useRouter} from "./modules/cocktail";
import './main.css';
import Header from "./Components/Header";
import Nested from "./Views/Nested";
import About from "./Views/About";


$('#app').render(App())

const routes = {
    '/404': `${Header()} This 404 Page :(`,
    '/': App,
    '/about/:id/:name': About,
    '/ourProjs': `${Header()} this is portfolio page`,
    '/nes':Nested,
}



useRouter('#app', routes)




