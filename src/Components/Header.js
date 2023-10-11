import { useParams } from "../modules/cocktail";

function Header(name = '') {
    return ( /*html*/`
        <header class="px-3 py-3 flex justify-between bg-slate-200">
            <div class="logo font-bold text-2xl uppercase">Logo</div>
            <ul class="links flex gap-4 items-center">
                <c-a class="font-bold hover:text-red-500 transition-all cursor-pointer" to="/">Home</c-a>
                <c-a class="font-bold hover:text-red-500 transition-all"  to="/about">About</c-a>
                <c-a class="font-bold hover:text-red-500 transition-all" to="/ourProjs">OurProjs</c-a>
                <c-a to="/nes">nested</c-a>
                <c-a class="font-bold hover:text-red-500 hover:bg-slate-800 hover:p-3 transition-all" href="#" to="">Contact us</c-a>
            </ul>
        </header>
    ` );
}

export default Header;