import App from "./Views/App";
import { $, makeAppResponsive } from "./modules/cocktail";
import './main.css';


$('#app').render(App())  
makeAppResponsive('body')