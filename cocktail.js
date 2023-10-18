'use strict'
/*cocktail (typeScript version) library created at 3/10/2023 - Devloped by yousef sayed*/
export function $(root) {
  return document.querySelector(root);
}

export function $m(...roots) {
  return roots.map(e => document.querySelector(e))
}

export function $a(roots) {
  return document.querySelectorAll(roots);
}

//handling Dom
const _containerOFCocktailEvents_ = {};
let _CocktailRoutes_;

function excuteEvents(root = '*') {
  const allEls = document.querySelectorAll(root);
  allEls.forEach((el) => {
    if (el.getAttribute('excuted') === 'true') return;
    const { attributes } = el;
    [...attributes].filter(attr => attr.name.startsWith('@')).forEach((attr) => {
      el.addEventListener(`${attr.name.replace('@', '')}`, _containerOFCocktailEvents_[el.getAttribute(attr.name)])
      el.setAttribute('excuted', 'true');
      el.removeAttribute(attr.name)
      delete _containerOFCocktailEvents_[el.getAttribute(attr.name)]
    })
  })
}

function parseAndExcuteEventWhileInsert(HTML) {
  const parsedHTML = parseToHTML(HTML).body;
  [...parsedHTML.querySelectorAll('*')].map((el) => {
    const { attributes } = el;
    for (const attr of [...attributes]) {
      if (attr.name.startsWith('@')) {
        el.setAttribute('excuted', 'false');
        return el;
      }
    }
    return el;
  })
  return parsedHTML.innerHTML;
}

export function useMap(array, callback) {
  return parseToHTML(array.map((e, i) => {
    return callback(e, i)
  }).join('')).body.innerHTML;
}

export function dff(cb) {
  const id = encode(uniqueID());
  _containerOFCocktailEvents_[id] = cb;
  return id;
}

export function insertInBegin(root, HTML) {
  const el = document.querySelector(root);
  const parsedHTML = parseAndExcuteEventWhileInsert(HTML);
  el?.insertAdjacentHTML('afterbegin', parsedHTML);
  excuteEvents(`${root} [excuted="false"]`);
}

export function insertInEnd(root, HTML) {
  const el = document.querySelector(root);
  const parsedHTML = parseAndExcuteEventWhileInsert(HTML)
  el?.insertAdjacentHTML('beforeend', parsedHTML);
  excuteEvents(`${root} [excuted="false"]`);
}

const arr = [1, 2, 5, 3, 4].splice(1);
console.log(arr);

export function replaceAndCommitAll(elementRoots, oldHTML, newHTML) {
  const els = document.querySelectorAll(elementRoots);
  if (!els) throw new Error(`Your element root "${elementRoots}" is ${els}`)
  els.forEach((el) => {
    const inner = el.innerHTML.replace(oldHTML, newHTML);
    render(elementRoots, inner);
  })
}

export function replaceAndCommit(elementRoot, oldHTML, newHTML) {
  const el = document.querySelector(elementRoot);
  if (!el) throw new Error(`Your element root "${elementRoot}" is ${el}`)
  const inner = el.innerHTML.replace(oldHTML, newHTML);
  render(elementRoot, inner);
}

export function parseToHTML(text) {
  return new DOMParser().parseFromString(text, 'text/html');
}

//set render class 
export function render(elementRoot, component) {
  const element = document.querySelector(elementRoot);
  if (!element) throw new Error(`Your element root "${elementRoot}" is ${element}`)
  const fragment = document.createElement('template');

  if (typeof component === 'object') {
    fragment.innerHTML += component.html;
    if (component.onBeforeMounted) component.onBeforeMounted();
    element.innerHTML = fragment.innerHTML;
    if (component.onAfterMounted) component.onAfterMounted();
  }
  else { fragment.innerHTML += component; element.innerHTML = fragment.innerHTML; }
  excuteEvents(`${elementRoot} *`);
}

export function useRouter(root, routes) {
  const rgx = /(\/)?(\:)?(\w+)?/ig;
  _CocktailRoutes_ = cloneObject(routes);

  const getAllCa = () => {
    const routesEls = document.querySelectorAll('c-a');
    const { pathname } = location;
    routesEls.forEach((routeEl) => {
      routeEl.addEventListener('click', () => {
        const route = routeEl.getAttribute('to') || '';
        if (!route) { throw new Error(`Route not founded , try to set "to" attribute at "<c-a>" element`) }
        if (pathname == route) { return };
        routes['/404'] = !routes[route] && !routes['/404'] ? `404 page not founded..:(` : routes['/404'];

        for (const key in routes) {
          const keyMatch = key?.match(rgx) || [], routeMatch = route.match(rgx) || [];
          if (keyMatch[0] !== routeMatch[0]) { continue; }
          history.pushState(null, '', route);
          render(root, isFunction(routes[key]) ? routes[key]() : routes[key]);
        }

        getAllCa();
      })
    });
  }
  getAllCa();

  function popAndLoadHandler() {
    const { pathname } = location;
    routes['/404'] = !routes[pathname] && !routes['/404'] ? `404 page not founded..:(` : routes['/404'];
    for (const key in routes) {
      const keyMatch = key?.match(rgx) || [], pathMatch = pathname.match(rgx) || [];
      if (keyMatch[0] != pathMatch[0]) { continue; }
      render(root, isFunction(routes[key]) ? routes[key]() : routes[key]);
    }
    getAllCa();
    return;
  }

  window.addEventListener('popstate', () => {
    popAndLoadHandler()
  });

  window.addEventListener('load', () => {
    popAndLoadHandler()
  })
};

export function useParams() {
  const rgx = /\/(\:)?(\w+)?/ig;
  const routes = cloneObject(_CocktailRoutes_);
  const { pathname } = location;
  const params = {};
  Object.keys(routes).map(key => {
    const keyMatchs = key.match(rgx) || [], routeMatches = pathname.match(rgx) || [];
    if (keyMatchs[0] != routeMatches[0]) return;
    keyMatchs.forEach((param, i) => {
      if (i == 0) return;
      params[param.replace(/\/(\:)?/ig, '')] = routeMatches[i]?.replace('/', '');;
    });
  });
  return params;
}

export function useQueries() {
  const queries = new URLSearchParams(window.location.search);
  return {
    get: (name) => queries.get(name)
  }
}

/*******************@Start_Array_prototypes ==========================*/
Array.prototype.at = function (index) {
  if (index >= 0) { return this[index] }
  return this[this.length + index]
}

Array.prototype.remove = function (...indexs) {
  for (let i = 0; i < indexs.length; i++) {
    if (indexs[i] >= 0) {
      this[indexs[i]] = null;
    } else {
      this[this.length + indexs[i]] = null;
    }
  }
  return this.filter(e => e !== null)
}

/*******************@End_Array_prototypes ==========================*/

/*******************@Start_functions ==========================*/
export function random(num) {
  return Math.trunc(Math.random() * num)
}

export function cloneObject(obj) {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    newObj[key] = obj[key]
  })
  return newObj;
}

export function OTP(length) {
  const code = []
  for (let i = 0; i < length; i++) {
    code.push(random(10))
  }
  return code.join('')
}

export function uniqueID() {
  return crypto.randomUUID();
}

export function scrollTo(element) {
  if (element.id) {
    location.href = `#${element.id}`
  } else {
    element.id = `scrollTo-function`;
    location.href = `#${element.id}`;
    element.removeAttribute('id');
  }
}

export function scrollToRoot(id) {
  location.href = `#${id}`
}

export function repeatAsArray(data, length) {
  return Array(length).fill(data)
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

export function createBlobFileAs(data, mimeType) {
  try {
    return new Blob([data], { type: mimeType });
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

export function transformToNumInput(inputElement) {
  inputElement.value = inputElement.value.split(/\D+/ig).join('')
}

export function makeAppResponsive(root) {
  const el = document.querySelector(root);
  if (!el) throw new Error(`Your element root "${root}" is ${el}`)
  el.style.height = `${window.innerHeight}px`;
  window.addEventListener('resize', () => el.style.height = `${window.innerHeight}px`)
}

export function addClickClass(element, clickClass) {
  element.classList.add(clickClass);
  element.addEventListener('animationend', () => {
    element.classList.remove(clickClass);
  })
}

export function getCurrentDate() {
  const currentDate = new Date();
  return currentDate.toLocaleString()
}

export function isHTMLElement(element) {
  return element instanceof HTMLElement;
}

export function isHTMLInputElement(element) {
  return element instanceof HTMLInputElement
}

export function isFragment(fragment) {
  return fragment instanceof DocumentFragment;
}

export function isFunction(data) {
  return typeof data === 'function';
}

export function isString(string) {
  return typeof string == typeof 'string'
}

export function isArray(data) {
  return data instanceof Array;
}

export function isUndefined(data) {
  return typeof data === 'undefined'
}
/*******************@End_functions ==========================*/

//send to server
export async function post({ url, data = {}, json = true, headers = { 'content-type': 'Application/json' } }) {
  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
    return json ? await response.json() : await response.text()
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function get({ url, headers }) {
  try {
    return await fetch(url, { method: 'GET', headers });

  } catch (error) {
    throw new Error(error.message)
  }
}

export async function put({ url, headers, data }) {
  try {
    return await fetch(url, { method: "PUT", headers, body: JSON.stringify(data) })
  } catch (error) {
    throw new Error(error.message);
  }
}

//Email validation
export function isValidEmail(emailText) {
  const matching = emailText?.trim().match(/\w+(\.\w+)?@\w+\.\w+$/ig);
  const dotComMatch = matching?.join("")?.match(/\.\w+/ig);

  if (!matching) {
    return { valid: false, msg: "Email is not a valid" }
  }
  else if (dotComMatch && dotComMatch[dotComMatch.length - 1] != ".com") {
    return { valid: false, msg: "We just accept .com" }
  }
  else { return { valid: true, type: "email", msg: "Email is valid" } }
}

//Name validation
export function isValidName(text) {
  const specialCharMatch = text?.trim().match(/[\s+|\W+]/g);
  if (specialCharMatch || text?.trim() === "" || !text) {
    return { valid: false, msg: "Invalid name" };
  }
  else { return { valid: true, type: "name", data: name, msg: "Valid name" }; }
}

//Date validation
export function isValidDate(date) {
  const userDate = new Date(date);
  if (+userDate.getFullYear > +new Date().getFullYear() || userDate.toLocaleDateString() === 'Invalid Date') return { valid: false, msg: `Invalid Date..!` };
  return { valid: true, msg: 'Valid Date' };
}

//Password validation
export function isValidPassword(text) {
  const password = text.trim();
  const specialCharMatch = password?.match(/[^a-z0-9\.\s+]/ig);
  const numsMatch = password?.match(/[0-9]/ig);
  const upperCharMatch = password?.match(/[A-Z]/ig);
  const lowerrCharMatch = password?.match(/[a-z]/ig);
  const spaces = password?.match(/[\s+]/ig);

  switch (true) {
    case !password:
      return { valid: false, msg: "Password must not be empty" };

    case !upperCharMatch || upperCharMatch.length < 1:
      return { valid: false, msg: "Password must be at least 1 capital letter" };

    case !lowerrCharMatch || lowerrCharMatch.length < 1:
      return { valid: false, msg: "Password must be at least 1 small letter" };

    case !numsMatch || numsMatch.length < 4:
      return { valid: false, msg: "Password must be at least 4 digits" };

    case !specialCharMatch:
      return { valid: false, msg: "Password must have special characters" };

    case spaces !== null:
      return { valid: false, msg: "Password must not have spaces" };

    case password.length < 8:
      return { valid: false, msg: "Password must be at least 8 characters" };

    default:
      return { valid: true, msg: "Password is valid" }
  }
}

//Re password validation
export function isValidRePassword(mainPassword, rePassword) {
  return rePassword == mainPassword ? { valid: true, data: rePassword.trim(), msg: "valid" } : { valid: false, msg: "Re password does not match" };
}

//encode & decode
export function encode(text, password = '') {
  text += password;
  const textEncoder = new TextEncoder().encode(encodeURIComponent(text));
  const ys7 = textEncoder.reduce((num1, num2) => {
    return num1 + num2;
  });

  return btoa(encodeURI(ys7.toString()))
};

export function compare({ comparedText, comparedEncodedText, password = "" }) {
  return encode(comparedText, password) === comparedEncodedText ? { ok: true, msg: "It is matched" } : { ok: false, msg: "It is not matched" }
}

export class CocktailDB {
  constructor(dbname = "string") {
    this.updateI = 1;
    this.dbname = dbname;
    this.handlers = {
      doRequest: async (callback = () => { }) => {
        const request = indexedDB.open(dbname, this.updateI - 1);
        let db = new Promise((res, rej) => {
          request.addEventListener('success', function (ev) {
            let dbHandlerCallback = callback(this.result);
            res(dbHandlerCallback)
          })

          request.addEventListener('error', function () {
            rej(new Error('Error : ' + this.error))
          });
        });

        return db;
      },

      createObjectStore: async (name, request) => {
        request.addEventListener('upgradeneeded', function (ev) {
          this.result.createObjectStore(name, { keyPath: 'id', autoIncrement: true })
        })

        // close request if it seccesded and to if we wanna to create new collection
        request.addEventListener('success', function () {
          this.result.close();
        });
      },

      returnData: async (data) => {
        try {
          return new Promise((res, rej) => {
            data.addEventListener('success', function () {
              res(this.result)
            })
            data.addEventListener('error', function () {
              rej(this.errorCode);
            })

          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findHandler: async (name, key, cb) => {
        try {
          return await this.handlers.doRequest(async (db) => {
            const objectStore = db.transaction(name, 'readwrite').objectStore(name).getAll();
            const data = await this.handlers.returnData(objectStore), matches = [];
            if (key) {
              data.forEach((val) => {
                for (const prop1 in val) {
                  for (const prop2 in key) {
                    if (prop1 == prop2 && val[prop1] == key[prop2]) {
                      matches.push(val)
                    }
                  }
                }
              })
              return cb(matches);
            } else { return cb(data) }
          });
        } catch (error) {
          throw new Error(error.message);

        }
      }

    }

  };

  async createCollction(name) {
    const request = indexedDB.open(this.dbname, this.updateI);
    this.updateI++; //to update version to create new objectStore (collection)
    this.handlers.createObjectStore(name, request); //to create new objectStore (collection)

    const methods = {
      set: async (query) => {
        try {
          await this.handlers.doRequest(async (db) => {
            let lastId = await methods.find();
            query.id = lastId.at(-1) ? lastId[lastId.length - 1].id + 1 : 0;
            db.transaction(name, 'readwrite').objectStore(name).add(query);
            db.close();
          });
          return await methods.find()
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findOne: async (query) => {
        try {
          if (query instanceof Object && !Object.entries(query)[0]) { throw new Error(`query must not be an empty`) }
          if (typeof query !== typeof {}) { throw new Error(`query type must be an object`) }
          return await this.handlers.findHandler(name, query, matches => matches[0])
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findOneAndUpdate: async (oldQuery, newQuery) => {
        try {
          this.handlers.doRequest(async (db) => {
            let key = await methods.findOne(oldQuery);
            newQuery.id = key.id;
            db.transaction(name, 'readwrite').objectStore(name).put(newQuery)
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      find: async (query) => {
        try {
          if (query && typeof query !== typeof {}) { throw new Error(`Query type must be an object like that => {Query}`) };
          return await this.handlers.findHandler(name, query, matches => matches)
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findAndUpdate: async (oldQuery, newQuery) => {
        try {
          this.handlers.doRequest(async (db) => {
            let key = await methods.find(oldQuery);
            for (let i = 0; i < key.length; i++) {
              newQuery.id = key[i].id;
              db.transaction(name, 'readwrite').objectStore(name).put(newQuery)
            }
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      delete: async (query) => {
        try {
          this.handlers.doRequest(async (db) => {
            let targetQuery = await methods.find(query);
            for (let i = 0; i < targetQuery.length; i++) {
              db.transaction(name, 'readwrite').objectStore(name).delete(targetQuery[i].id)
            }
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

      deleteOne: async (query) => {
        try {
          return await this.handlers.doRequest(async (db) => {
            let targetQuery = await methods.findOne(query);
            const res = db.transaction(name, 'readwrite').objectStore(name).delete(targetQuery.id);
            return await methods.find()
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

    }

    return methods
  };

  deleteDatabase() {
    indexedDB.deleteDatabase(dbname)
  }
}

export class TelegramBot {
  constructor(token = "string", chatId = "string") {
    this.token = token;
    this.chatId = chatId;
  }

  //compress url to more sequrity
  async compressURL(fileId) {
    const tinyUrl = `https://tinyurl.com/api-create.php?url=${await this.getFileFromBot(fileId)}`;
    const compresedURl = await (await fetch(tinyUrl)).text();
    return { compresedURl: compresedURl, normalUrl: await this.getFileFromBot(fileId), id: fileId, ok: true };
  }

  async getFileFromBot(fileId) {
    try {
      const url1 = `https://api.telegram.org/bot${this.token}/getFile?file_id=${fileId}`;
      const getFile = await (await fetch(url1)).json();
      const file_path = getFile.result.file_path;
      const fileURL = `https://api.telegram.org/file/bot${token}/${file_path}`;
      return fileURL
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async sendFile(blob = Blob) {
    try {
      const formData = new FormData();
      formData.append('document', blob, `${blob.name}`);
      formData.append('chat_id', this.chatId)
      const options = { method: 'POST', body: formData };
      const data = await (await fetch(`https://api.telegram.org/bot${this.token}/sendDocument`, options)).json();
      const fileId = data.result.document.file_id;

      return { ok: true, id: fileId, fileUrl: await this.getFileFromBot(fileId) }
    } catch (error) {
      return { ok: false, msg: `Faild to upload : ${error.message}`, url: "No url Fethced" }
    }
  }

  async sendImage(blob = Blob) {
    return await this.sendFile(blob)
  }

  //send video
  async sendVideo(blob = Blob) {
    try {
      const formData = new FormData();
      formData.append('video', blob, `${blob.name}`);
      const sendVideoURL = `https://api.telegram.org/bot${this.token}/sendVideo?chat_id=${this.chatId}`;
      const response = await (await fetch(sendVideoURL, { method: "POST", body: formData })).json();
      const fileId = response.result.video.file_id;
      return { ok: true, id: fileId, url: await this.getFileFromBot(fileId) };
    } catch (error) {
      return { ok: false, msg: `Faild to upload  : ${error.message}`, url: "No url Fethced" }
    }
  }

  //send audio
  async sendAudio(blob = Blob) {
    try {
      const sendAudioURL = `https://api.telegram.org/bot${this.token}/sendAudio?chat_id=${this.chatId}`;
      const formData = new FormData();
      formData.append('audio', blob, `${blob.name}`);
      const response = await (await fetch(sendAudioURL, { method: "POST", body: formData })).json();
      const fileId = response.result.audio.file_id
      return { ok: true, id: fileId, url: await this.compressURL(fileId) };
    } catch (error) {
      return { ok: false, msg: `Faild to upload : ${error.message}`, url: "No url Fethced" }
    }
  }

  //sendMessage
  async sendMessage(text = "string") {
    try {
      const url = `https://api.telegram.org/bot${this.token}/sendMessage?chat_id=${this.chatId}&text=${text}`;
      const message = await (await fetch(url)).json();
      return message;
    } catch (error) {
      return { ok: false, msg: `Faild to upload : ${error.message}`, url: "No url Fethced" }
    }
  };

  //get updates
  async getUpdates() {
    return await (await fetch(`https://api.telegram.org/bot${this.token}/getUpdates`)).json();
  }

  //get messages
  async getMessages() {
    return (await this.getUpdates()).result[0].message
  }
}

