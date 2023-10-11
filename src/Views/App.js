import Header from "../Components/Header";
import { dff, commit, uniqueID, useMap, scrollToRoot, insertInBegin, replaceAndCommit, post, } from "../modules/cocktail";
import store from "../modules/store";




const apiKey = `ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SndjbTltYVd4bFgzQnJJam8zTURjek5qRXNJbU5zWVhOeklqb2lUV1Z5WTJoaGJuUWlMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkubk5DUkdWMGowREc5WHYxSkwxN1JwRWxCM0g1cmNaMkFPaXc1aHJDaUhqbjhranoyVkNEODNwMzJ4QW9DUXRydVVoRUItLXNCZmt0N2Rvb056cG9pRHc=`;
const items = [
    {
        "name": "ASC1515",
        "amount_cents": "500000",
        "description": "Smart Watch",
        "quantity": "1"
    },
    {
        "name": "ERT6565",
        "amount_cents": "200000",
        "description": "Power Bank",
        "quantity": "1"
    }
];

const billing_data = {
    "apartment": "NA",
    "email": "yousef.sayed2342@gmail.com",
    "floor": "42",
    "first_name": "yousef",
    "street": "helmie el daly",
    "building": "56",
    "phone_number": "+201120020790",
    "shipping_method": "NA",
    "postal_code": "NA",
    "city": "giza",
    "country": "egypt",
    "last_name": "sayed",
    "state": "NA"
};

function App() {
    const loger = (msg) => {
        console.log(msg);
        commit('#container', uniqueID())

    }

    const data = [];
    for (let i = 0; i < 20; i++) {
        data.push({ id: uniqueID(), text: 'scrollTO' })
    }

    const content = useMap(data,
        (el, i) => {
            return /*html*/`
            <div id="${el.id}"><span>Just scroll</span> <button @click=${dff(() => { scrollToRoot(data[0].id) })} class="p-2 bg-blue-500 font-bold text-white m-2">scrollTo</button></div>
        `
        });




    const replaceContent = () => {
        replaceAndCommit('#data', content,/*html*/`
            <button class="p-2 bg-blue-500 font-bold text-white m-2" @click=${dff(() => {
            console.log(uniqueID());
        })}>log</button>
        `)
    }

    return {
        html:/*html*/`
        ${Header('App')}
        <button class="p-2 bg-blue-500 font-bold text-white m-2" @click=${dff(function () { getPaymopToken({ apiKey, items, billing_data, amount_cents: "500", integration_id: 3467794 }); })}>PAY</button>
        <div class=" bg-black pt-3 pl-3 pb-3 text-2xl text-red-200 ">App</div>
        <button class="p-2 bg-blue-500 font-bold text-white m-2" @click=${dff((e) => loger(e))}  >Log me</button>
                <button class="bg-black text-red-600 font-bold p-2" @click=${dff(() => { replaceContent() })}>Replace</button>
        <div id="container" ref='name'>
            text
        </div>
        <div id="container" ref='name'>
            text
        </div>
        <div id="data">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quia in aspernatur dignissimos dolore esse eum neque eaque velit mollitia a et ut quam, magni odio ad, assumenda illo, explicabo rerum.
        </div>
    `,
        onAfterMounted() {
            insertInBegin('#data', content);
        }
    }
}


async function getPaymopToken({ apiKey, items, amount_cents, currency = "EGP", billing_data, integration_id }) {
    const authToken = await (await post({
        url: 'https://accept.paymob.com/api/auth/tokens',
        data: {
            "api_key": apiKey
        }
    })).token;

    const oreder_id = await (await post({
        url: 'https://accept.paymob.com/api/ecommerce/orders',
        data: {
            "auth_token": authToken,
            "delivery_needed": "false",
            amount_cents,
            currency,
            items,
        }
    })).id;

    const paymentKey = await (await post({
        url: 'https://accept.paymob.com/api/acceptance/payment_keys',
        data: {
            "auth_token": authToken,
            "expiration": 3600,
            amount_cents,
            oreder_id,
            billing_data,
            currency,
            integration_id
        }
    })).token;

    const iframe = `https://accept.paymob.com/api/acceptance/iframes/736356?payment_token=${paymentKey}`;
    location.href = iframe

    console.log(paymentKey);
}

// getPaymopToken({ apiKey, items, billing_data, amount_cents: "500", integration_id: 3467794 });

export default App;