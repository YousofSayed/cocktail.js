import { get, post, put, TelegramBot } from './cocktail.js';
const headers = {
    "Authorization": `Bearer ${import.meta.env.VITE_DB_APIKEY}`,
    "X-Spreadsheet-Id": import.meta.env.VITE_DB_ID,
    "Content-Type": "application/json",
};
const endPoint = 'https://api.sheetson.com/v2/sheets';
const KEY = import.meta.env.VITE_BOT_APIKEY, chatId = import.meta.env.VITE_CHATID;
const tb = new TelegramBot(KEY, chatId)

const setData = async ({ dbName, data }) => {
    try {
        return JSON.parse(await post({
            url:`${endPoint}/${dbName}`,
            headers,
            data
        }))
    } catch (error) {
        throw new Error(error.message)
    }
}

const getData = async ({ dbName, query }) => {
    try {
        return await get({url:`${endPoint}/${dbName}/?${query}`, headers})
    } catch (error) {
        throw new Error(error.message)
    }
}

const updateData = async ({ dbName, rowNum, oldData, newData }) => {
    try {
        if (!rowNum) {
            const rowData = await getData({ dbName: dbName, query: `where=${JSON.stringify(oldData)}` });
            const row = rowData.results[0].rowIndex;
            return await put({url:`${endPoint}/${dbName}/${row}`, headers, data:newData});
        }
        else {
            return await put({url:`${endPoint}/${dbName}/${rowNum}`, headers,data: newData});
        }
    } catch (error) {
        throw new Error(error.message)
    }
}


const deleteData = async ({ dbName, rowNum, dataTargted }) => {
    if (!rowNum) {
        const rowData = await getData({ dbName: dbName, query: `where=${JSON.stringify(dataTargted)}` });
        const row = rowData.results[0].rowIndex;
        return await fetch(`${endPoint}/${dbName}/${row}`, { method: "DELETE", headers: headers })
    } else {
        return await fetch(`${endPoint}/${dbName}/${rowNum}`, { method: "DELETE", headers: headers })
    }
}

export { setData, getData, updateData, deleteData, tb }