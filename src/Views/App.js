import { get, useEvents, useLocalStore, useMap } from "../modules/cocktail";
import store from "../modules/store";

function App() {
    const { ref, commit, valueOf } = useLocalStore({
        name: 'yousef',
        age: 21,
        data: [
            { name: 'yousef', color: 'Gold', job: 'frontEnd' },
            { name: 'mohamed', color: 'green', job: 'student' },
            { name: 'ahmed', color: 'blue', job: 'student & hack' },
        ]

    });

    const loger = () => { console.log(true, 'clicked'); };
    const change = () => { commit('name', 'Thunder') };
    async function handelData(from, to) {
        const data = await (await get({ url: `https://jsonplaceholder.typicode.com/todos/` })).slice(from, to);
        console.log(data);
        commit('data', useMap((data), (e, i) => {
            return /*html*/`
                <br>
                <div class="name">${e.title}</div>
                <div class="color" style="background-color:red; padding:10px; color:#fff">${e.id}</div>
                <div class="job">${e.completed}</div>
                <br>
            `
        }));
        commit('dataLength', (valueOf('dataLength') || data.length) + 10)
        console.log(valueOf('dataLength'));
    }
    handelData(0, 10);

    return /*html*/`
        <div class="welcome">Welcome At app ${ref('name')}</div>
        <button ${useEvents({ click: () => { handelData(valueOf('dataLength'), valueOf('dataLength') + 10) } })}>Commit new data</button>
        <div id="data">${ref('data')}</div>
        <button ${useEvents({ click: loger })}>Click me</button>
        <button ${useEvents({ click: change, contextmenu: loger })}>Change me</button>
    `;
}

export default App;