/*cocktail library created at 2/3/2023 - Devloped by yousef sayed*/
export function $(element = "string") {
  let el = document.querySelector(element);
  return el;
}

export function $m(...elements) {
  return elements.map(e => document.querySelector(e))
}

export function $a(elements = "string") {
  return document.querySelectorAll(elements);
}

export class MakeAudioRecorder {
  constructor() {

    const stream = navigator.mediaDevices.getUserMedia({ audio: true });
    let record, blob, url;

    this.getStream = async function getStream() {
      return await stream;
    }

    this.startRecord = async function startRecord() {
      record = new MediaRecorder(await stream);
      record.start();
      this.isStream = record.state == 'recording' ? true : false;
    }

    async function stopStream() {
      let stream2 = await stream;
      const tracks = stream2.getTracks();
      record.addEventListener("stop", () => {
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].stop();
        }
      });
    }

    this.stopRecord = async function stopRecord(arrayToSavePartsOfRecord) {
      this.isStream = record.state == 'inactive' ? false : true;
      if (record.state == 'inactive') { return false }
      record.stop();
      record.addEventListener("dataavailable", (e) => {
        if (arrayToSavePartsOfRecord) {
          arrayToSavePartsOfRecord.push(e.data);
          blob = new Blob(arrayToSavePartsOfRecord, { type: "audio/webm" });
        }
      });
      stopStream();
      this.getBlobURL(arrayToSavePartsOfRecord);
    }

    this.getBlobURL = async function getBlobURL(arrayOfpartsOfRecord) {
      if (record.state == "recording") {
        //recording
        record.stop();
        stopStream();
        this.isStream = record.state == 'inactive' ? false : true;
        record.addEventListener("dataavailable", (e) => {
          arrayOfpartsOfRecord.push(e.data);
          blob = new Blob(arrayOfpartsOfRecord, { type: "audio/webm" });
          url = URL.createObjectURL(blob);
        }); //dataavailable
        const prom = new Promise((res, rej) => {
          setTimeout(() => {
            if (url) {
              res(url);
            } else {
              rej("No Url");
            }
          }, 1);
        });
        return await prom;
      } else {
        blob = new Blob(arrayOfpartsOfRecord, { type: "audio/webm" });
        return URL.createObjectURL(blob);
      }
    }


  }
}

export class MakeLiveSoundWave {
  constructor({ canvas = document, waveColor = "String" }) {

    let audio, ctx, width, height, audCtx, analyser, srcG;

    this.loadAudio = function (src = "string", isStreamUrl = true) {
      audio = new Audio();
      audio.load();
      ctx = canvas.getContext("2d");
      ({ width, height } = canvas);
      audCtx = new AudioContext();
      analyser = audCtx.createAnalyser();

      if (isStreamUrl) {
        srcG = audCtx.createMediaStreamSource(src)
        audio.srcObject = src;
      } else {
        audio.src = src;
      }
      srcG.connect(analyser);
      // analyser.connect(audCtx.destination);
      console.log(srcG);
      return audio;
    }
    this.drawOnCanvas = function drawOnCanvas() {
      let unitArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(unitArray);
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < unitArray.length; i++) {
        ctx.fillStyle = waveColor;
        let unit = unitArray[i] <= 0 ? 2 : unitArray[i] - Math.trunc(unitArray[i] * 0.9);
        if (unitArray[i]) {
          ctx.fillRect(2.4 * i, height / 2, width / unitArray.length, unit);
          ctx.fillRect(2.4 * i, height / 2, width / unitArray.length, -unit);
        }
      }
      window.requestAnimationFrame(drawOnCanvas);
    }

    this.playAudio = function playAudio() {
      audio.play();
    }

    this.stopAudio = function stopAudio() {
      audio.pause();
    }
  }
}

export class MakeMinAndSecInterval {
  constructor({ minuts = document, seconds = document }) {
    let interval;
    this.startInterval = function () {
      clearInterval(interval);
      if (this.min || this.sec) { minuts.textContent = this.min; seconds.textContent = this.sec; } //becuse if user start interval while playing record
      interval = setInterval(() => {
        seconds.textContent++;
        if (seconds.textContent >= 60) {
          seconds.textContent = 0;
          minuts.textContent++;
        }
        this.min = minuts.textContent;
        this.sec = seconds.textContent;
      }, 1000);
    };

    this.stopInterval = function () {
      clearInterval(interval);
    };

    this.clearMin = function () {
      minuts.textContent = 0;
    };

    this.clearSec = function () {
      seconds.textContent = 0;
    };

    this.clearMinAndSec = function () {
      minuts.textContent = 0;
      seconds.textContent = 0;
    };

    this.makeIntervalWithAudioTime = function (audio) {
      clearInterval(interval)
      console.log(seconds.textContent);
      interval = setInterval(() => {
        let currentTime = Math.trunc(audio.getCurrentTime()) || audio.currentTime;
        if (Math.trunc(currentTime / 60) || Math.trunc(currentTime - +minuts.textContent * 60)) {
          minuts.textContent = Math.trunc(currentTime / 60);
          seconds.textContent = Math.trunc(currentTime - +minuts.textContent * 60);
        }
      }, 100)
    }
  }
};

const _containerOFCocktailEvents_ = {};


export function store(data) {
  return {
    data,
    ref: (key) => {
      return `<span cstoreref>${data[key]}</span>`
    },
    commit: (key, newVal) => {
      data[key] = newVal;
      const cstorerefEls = document.querySelectorAll('[cstoreref]');
      cstorerefEls.forEach((cstorerefEl) => {
        if (cstorerefEl.innerHTML == data[key]) return;
        cstorerefEl.innerHTML = data[key]
      })
    }
  }
}

export function useLocalStore(data) {
  const id = uniqueID();
  return {
    data,
    valueOf:(key)=>{
      return data[key]
    },
    ref: (key) => {
      return `${data[key]}<template id="${key}${id}">${data[key]}</template>`
    },
    commit: (key, newVal) => {
      const oldVal = data[key];
      data[key] = newVal;
      const allEls = document.querySelectorAll(`#${key}${id}`);
      allEls.forEach((el) => {
        const parentEl = el.parentElement;
        const oldInner = el.parentElement.innerHTML;
        const newInner = oldInner.replace(oldVal, data[key])
        parentEl.innerHTML = ''
        parentEl.render(newInner)
      })
    }
  }
}

//Hooks
export function useMap(array = [],callback=(e,i)=>{}) {
  return array.map((e,i)=>{
    return callback(e,i)
  }).join('');
}

//handling Dom
export function parseToHTML(text = '') {
  return new DOMParser().parseFromString(text, 'text/html');
}

export function useEvents(events = {}) {
  const id = uniqueID();
  _containerOFCocktailEvents_[id] = events;
  return `cev=${id}`
}

export function useState(value) {

}

//set render class 
export class Render {
  constructor(element, [...components]) {
    const vDom = document.createElement('template');
    for (let i = 0; i < components.length; i++) {
      vDom.innerHTML += components[i]
    }
    element.insertAdjacentHTML('beforeend', vDom.innerHTML);

    //excuteAllEvents
    function excuteEvents() {
      const allEls = document.body.querySelectorAll('[cev]');
      allEls.forEach((el) => {
        const events = _containerOFCocktailEvents_[el.getAttribute('cev')];
        for (const key in events) {
          el.addEventListener(key, events[key]);
          el.removeAttribute('cev')
        }
      })
    }
    excuteEvents()
  }
}

/*******************@Start_Element_prototypes ==========================*/

Element.prototype.on = function (type = "string", callback = () => { }) {
  this.addEventListener(type, callback)
}


Element.prototype.render = function (...components) {
  return new Render(this, components)
}

Element.prototype.changeContentWith = function (element) {
  this.innerHTML = '';
  this.render(element)
}

/*******************@End_Element_prototypes ==========================*/




/*******************@Start_Array_prototypes ==========================*/
Array.prototype.at = function (num) {
  if (num >= 0) { return this[num] }
  return this[this.length + num]
}

Array.prototype.remove = function (...num) {
  for (let i = 0; i < num.length; i++) {
    if (num[i] > 0) {
      this[num[i] - 1] = null;
    } else {
      this[this.length + num[i]] = null;
    }
  }
  return this.filter(e => e != null)
}

/*******************@End_Array_prototypes ==========================*/

/*******************@Start_functions ==========================*/
export function transformTo(from, to = "string") {
  if (to == 'object' || to == 'Object' || to == 'obj' || to == 'Obj') {
    return { from }
  } else if (to == 'number' || to == 'Number') {
    let matching = /\d+/ig.test(from) ? from.match(/\d+/ig) : undefined;
    if (matching) { return +matching.join("") }

  } else if (to == 'boolean' || to == 'Boolean') {
    return Boolean(from)
  } else if (to == 'string' || to == 'String') {
    if (typeof from == 'object') {
      return JSON.stringify(from);
    } else {
      return String(from);
    }
  }
}

export function switchLang(prop) {
  if (!prop) throw new Error('prop lang is null')
  localStorage.setItem('lang', prop)
  langsElemement.forEach((val, key) => {
    key.innerHTML = '';
    key.insertAdjacentHTML('beforeend', val[prop])
  })
}

export function random(num) {
  return Math.trunc(Math.random() * num)
}

export function numCode(length) {
  const code = []
  for (let i = 0; i < length; i++) {
    code.push(random(10))
  }
  return code.join('')
}

export function uniqueID() {
  const letters = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ];

  const l = letters.length;
  return (random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(7) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)) + random(10) + letters.at(random(l)))
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

export function onMobile(cb = function () { }) {
  if (navigator.userAgentData.platform == 'mobile' || navigator.userAgentData.platform == 'Mobile') {
    cb();
  }
}

export function repeatAsArray(data, length) {
  if (!data) throw new Error('data is null!');
  if (!length) throw new Error('length is null!');
  let empArr = [];
  for (let i = 0; i < length; i++) {
    empArr.push(data)
  }
  return empArr
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

export function createFileAs(data, mimeType) {
  try {
    return new Blob([data], { type: mimeType });
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

export function transformToNumInput(e) {
  e.target.value = e.target.value.split(/\D+/ig).join('')
}

export function makeAppResponsive(root) {
  const el = document.querySelector(root);
  el.style.height = `${window.innerHeight}px`;
  window.addEventListener('resize', () => el.style.height = `${window.innerHeight}px`)
}

//log asynchronous and synchronous
export async function log(data) {
  try {
    console.log(await data);
  } catch (error) {
    throw new Error(error.message)
  }
}

export function addClickClass(e) {
  const target = e.currentTarget
  target.classList.add('click');
  target.addEventListener('animationend', () => {
    target.classList.remove('click');
  })
}

export function getCurrentDate() {
  const currentDate = new Date();
  return currentDate.toLocaleString()
}

export function getKeys(obj = {}) {
  return Object.getOwnPropertyNames(obj)
}

export function getValues(obj = {}) {
  return Object.values(obj);
}

export function isElement(element) {
  return element instanceof Element;
}

export function isFragment(fragment) {
  return fragment instanceof DocumentFragment;
}

export function isFunction(data) {
  return data instanceof Function;
}

export function isObject(object) {
  return object instanceof Object
}

export function isString(string) {
  return typeof string == typeof ''
}

export function isArray(data) {
  return data instanceof Array;
}

export function isNull(data) {
  return typeof data === 'null'
}
export function isUndefined(data) {
  return typeof data === 'undefined'
}
/*******************@End_functions ==========================*/


//send to server
export async function post({ url, data = {}, json = false, headers = { 'content-type': 'Application/json' } }) {
  let response = await fetch(url, { method: "POST", headers, body: JSON.stringify(data) });
  return json ? await response.json() : await response.text()
}

export async function get({ url, headers, resType = 'json' }) {
  try {
    return await (await (await fetch(url, { method: 'GET', headers }))[resType]());

  } catch (error) {
    throw new Error(error.message)
  }
}

export async function put({ url, headers, data }) {
  return await fetch(url, { method: "PUT", headers, body: JSON.stringify(data) })
}

//Email validation
export function isValidEmail(elRootOrText = "string") {
  let email = isElement(document.querySelector(elRootOrText)) ? document.querySelector(elRootOrText).value.trim() : elRootOrText.trim();

  let matching = email?.trim().match(/\w+(\.\w+)?@\w+\.\w+$/ig);
  if (!matching) {
    return { valid: false, msg: "Email is not a valid" }
  } else if (matching.join("").match(/\.\w+/ig)[matching.join("").match(/\.\w+/ig).length - 1] != ".com") {
    return { valid: false, msg: "We just accept .com" }
  }
  else { return { valid: true, type: "email", data: email.trim(), msg: "Email is valid" } }
}

//Name validation
export function isValidName(elRootOrText) {
  let name = isElement(document.querySelector(elRootOrText)) ? document.querySelector(elRootOrText).value.trim() : elRootOrText.trim();
  let specialCharMatch = name?.trim().match(/[\s+|\W+]/g);
  if (specialCharMatch || name?.trim() === "" || !name) {
    return { valid: false, msg: "Invalid name" };
  } else { return { valid: true, type: "name", data: name, msg: "Valid name" }; }
}

//Date validation
export function isValidDate(date = "", callback = () => { }) {
  let myDate = new Date(date), dateNow = new Date(),
    trulyDate = `${myDate.getFullYear()}/${myDate.getMonth() + 1}/${myDate.getDate()}`;
  callback(dateNow)
  if (myDate.getFullYear() <= dateNow.getFullYear() && myDate.getFullYear() > 1930 && date === trulyDate && myDate.getFullYear() > 1930) { return { valid: true, type: "date", data: date, msg: "Valid date" } } else { return { valid: false, msg: "Invalied date" } }
}

//Password validation
export function isValidPassword(elRootOrText = "") {
  let password = isElement(document.querySelector(elRootOrText)) ? document.querySelector(elRootOrText).value.trim() : elRootOrText.trim();
  let specialCharMatch = password?.match(/[^a-z0-9\.\s+]/ig);
  let numsMatch = password?.match(/[0-9]/ig);
  let upperCharMatch = password?.match(/[A-Z]/g);
  let lowerrCharMatch = password?.match(/[a-z]/g);
  let spaceMatch = password?.match(/[\s+]/g);
  if (!password) { return { valid: false, msg: "Password must not be empty" }; }
  else if (!specialCharMatch) {
    return { valid: false, msg: "Password must have special characters" };
  } else if (!numsMatch || numsMatch.length < 4) {
    return { valid: false, msg: "Password must be at least 4 digits" };
  } else if (!upperCharMatch || upperCharMatch.length < 1) {
    return { valid: false, msg: "Password must be at least 1 capital letter" };
  } else if (!lowerrCharMatch || lowerrCharMatch.length < 1) {
    return { valid: false, msg: "Password must be at least 1 small letter" };
  } else if (spaceMatch) {
    return { valid: false, msg: "Password must not have spaces" };
  }
  else if (password.length < 8) { return { valid: false, msg: "Password must be at least 8 characters" }; }
  else { return { valid: true, type: "password", data: password, msg: "Password is valid" } }
}

//Re password validation
export function isValidRePassword(mainElRootOrText, elRootOrTextRe) {
  let rePassword = isElement(document.querySelector(elRootOrTextRe)) ? document.querySelector(elRootOrTextRe).value.trim() : elRootOrTextRe.trim();
  let mainPassword = isElement(document.querySelector(mainElRootOrText)) ? document.querySelector(mainElRootOrText).value.trim() : mainElRootOrText.trim();
  console.log(rePassword, mainPassword);
  return rePassword == mainPassword ? { valid: true, data: rePassword.trim(), msg: "valid" } : { valid: false, msg: "Re password does not match" };
}

//Gender validation
export function isValidGender([...genders]) {
  for (let i = 0; i < genders.length; i++) {
    if (genders[i].checked) { return { valid: true, type: "gender", data: genders[i].id, msg: "Valid gender" }; };
  }
  return { valid: false, data: false, msg: "Please select a your gender" }
}

//transform text input value to number format
export function makeItNumsInput(input) {
  input.value = input.value.match(/\d+/ig);
  let dateNow = new Date();
  if (input.id == "year" && +input.value > dateNow.getFullYear() || input.id == "year" && +input.value < 1930) { return { valid: false, msg: "Invalid year", type: "year" } }
  if (input.id == "month" && +input.value > 12) { console.log(input);; return { valid: false, msg: "Maximum : 12", type: "month" } }
  if (input.id == "day" && +input.value > 31) { return { valid: false, msg: "Maximum : 31", type: "day" } }
  return { valid: true, msg: "All is valid", type: "All inputs" }
}


//encode & decode
export function encode(text = "string") {
  const complexChars = [
    "∆", "¬", "œ", "€", "®", "ø", "π", "å", "ß", "∂", "ƒ", "©",
    "˚", "¬", "µ", "+", "Ω", "œ", "®", "≠", "–",
    "÷", "Ω", "µ", "∞", "¥", "§", "Π", "∫",
    "‰", "∏", "≤", "≥", "⁄", "©",
    "~", "Π", "‹", "›", "ﬂ", "·", "‚", "£", "‰",
    "œ", "®", "ø", "π", "å", "ß", "∂", "ƒ", "©", "∆",
    "¬", "µ", "Ω", "≠", "œ", "®", "∑", "´", "´´", "–",
    "÷", "Ω", "µ", "∞", "§", "Π", "∫", "∑", "∆", "ø", "ˆ", "¨", "‰",
    "∏", "∑", "ƒ", "©", "∆", "«",
    "𝕼", "𝕽", "𝕾", "𝕿", "𝖀", "𝖁", "𝖂", "𝖃", "𝖄", "𝖅", "𝖆", "𝖇", "𝖈", "𝖉", "𝖊", "𝖋",
    "𝖌", "𝖍", "𝖎", "𝖏", "𝖐", "𝖑", "𝖒", "𝖓", "𝖔", "𝖕", "𝖖", "𝖗", "𝖘", "𝖙", "𝖚", "𝖛",
    "𝖜", "𝖝", "𝖞", "𝖟", "𝛢", "𝛣", "𝛤", "𝛥", "𝛦", "𝛧", "𝛨", "𝛩", "𝛪", "𝛫", "𝛬", "𝛭",
    "𝛮", "𝛯", "𝛰", "𝛱", "𝛲", "𝛳", "𝛴", "𝛵", "𝛶", "𝛷", "𝛸", "𝛹", "𝛺", "𝛻", "𝛼", "𝛽",
    "𝛾", "𝛿", "𝜀", "𝜁", "𝜂", "𝜃", "𝜄", "𝜅", "𝜆", "𝜇", "𝜈", "𝜉", "𝜊", "𝜋", "𝜌", "𝜎",
    "𝜏", "𝜐", "𝜑", "𝜒", "𝜓", "𝜔", "ℂ", "ℍ", "𝕃", "ℕ", "ℙ", "𝕊", "𝕋", "𝕌", "𝕍", "𝕎",
    "𝕏", "𝕐", "𝕒", "𝕓", "𝕔", "𝕕", "𝕖", "𝕗", "𝕘", "𝕙", "𝕚", "𝕛", "𝕜", "𝕝", "𝕞", "𝕟",
    "𝕠", "𝕡", "𝕢", "𝕣", "𝕤", "𝕥", "𝕦", "𝕧", "𝕨", "𝕩", "𝕪", "𝕫", "𝟙", "𝟚", "𝟛", "𝟜",
    "𝟝", "𝟞", "𝟟", "𝟠", "𝟡", "𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡", "ℑ",
    "ℜ", "𝒜", "ℬ", "𝒞"
  ];

  let encodedCode = [...encodeURIComponent(text)];
  let reader = new FileReader(), textEncoder = new TextEncoder().encode(encodedCode.join("")), blob = new Blob(textEncoder);
  const myData = new Promise((res, rej) => {
    reader.readAsBinaryString(blob);
    reader.addEventListener('load', () => {
      if (reader.result) {
        const firstChar = reader.result.slice(0, 3), middleChar = reader.result[Math.trunc(reader.result.length / 2)], lastChar = reader.result.slice(-5);
        const yS7 = (+firstChar + +middleChar + +lastChar) * 700;
        let dataArray = [...yS7.toString()];

        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] += complexChars[i + 1 + i] + complexChars[i + 2 + 3 + i] + complexChars[i + 2 + 3 + 1 + i]
        }
        res(dataArray.join("").split(" ").join(""))
      } else {
        rej(new Error("Worng Data!"));
      }
    })
  })

  return myData;
};


export async function compare({ comparedText = "string", comparedEncodedText = "string", password = "" }) {
  return await encode(comparedText, password) === comparedEncodedText ? { ok: true, msg: "It is matched" } : { ok: false, msg: "It is not matched" }
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

      findHandler: async (name, key, cb = () => { }) => {
        try {
          return await this.handlers.doRequest(async (db) => {
            let objectStore = db.transaction(name, 'readwrite').objectStore(name).getAll();
            let data = await this.handlers.returnData(objectStore), matches = [];
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

  createCollction = async function (name) {
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
let i = 0;




export class TelegramBot {
  constructor(token = "string", chatId = "string") {
    this.getFileFromBot = async function (fileId) {
      try {
        const url1 = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
        const getFile = await (await fetch(url1)).json();
        const file_path = getFile.result.file_path;
        const fileURL = `https://api.telegram.org/file/bot${token}/${file_path}`;
        return fileURL
      } catch (error) {
        throw new Error(error.message);
      }
    }

    //compress url to more sequrity
    this.compressURL = async function (fileId) {
      let tinyUrl = `https://tinyurl.com/api-create.php?url=${await this.getFileFromBot(fileId)}`;
      let compresedURl = await (await fetch(tinyUrl)).text();
      return { compresedURl: compresedURl, normalUrl: await this.getFileFromBot(fileId), id: fileId, ok: true };
    }


    // Base function

    //sendImage
    this.sendFile = async function (blob = Blob) {
      try {
        let formData = new FormData();
        formData.append('document', blob, `${blob.name}`);
        formData.append('chat_id', chatId)
        const options = { method: 'POST', body: formData };
        let data = await (await fetch(`https://api.telegram.org/bot${token}/sendDocument`, options)).json();
        const fileId = data.result.document.file_id;

        return { ok: true, id: fileId, fileUrl: await this.compressURL(fileId) }
      } catch (error) {
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    }

    //send Image
    this.sendImage = async function (blob = Blob) {
      return await this.sendFile(blob)
    }

    //send video
    this.sendVideo = async function (blob = Blob) {
      try {
        const formData = new FormData();
        formData.append('video', blob, `${blob.name}`);
        let sendVideoURL = `https://api.telegram.org/bot${token}/sendVideo?chat_id=${chatId}`;
        let response = await (await fetch(sendVideoURL, { method: "POST", body: formData })).json();
        let fileId = response.result.video.file_id;
        return { ok: true, id: fileId, url: await this.compressURL(fileId) };
      } catch (error) {
        console.error(error);
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    }

    //send audio
    this.sendAudio = async function (blob = Blob) {
      try {
        let sendAudioURL = `https://api.telegram.org/bot${token}/sendAudio?chat_id=${chatId}`;
        const formData = new FormData();
        formData.append('audio', blob, `${blob.name}`);
        let response = await (await fetch(sendAudioURL, { method: "POST", body: formData })).json();
        let fileId = response.result.audio.file_id
        console.log(response);

        return { ok: true, id: fileId, url: await this.compressURL(fileId) };
      } catch (error) {
        console.error(error);
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    }

    //sendMessage
    this.sendMessage = async function (text = "string") {
      try {
        let url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;
        let message = await (await fetch(url)).json();
        return message;
      } catch (error) {
        console.error(error);
        return { ok: false, msg: "Faild to upload", url: "No url Fethced" }
      }
    };

    //get updates
    this.getUpdates = async function () {
      return await (await fetch(`https://api.telegram.org/bot${token}/getUpdates`)).json()
    }

    //get messages
    this.getMessages = async function () {
      return (await this.getUpdates()).result[0].message
    }

    //get chat history
    this.getChatHistory = async function (params) {
      const res = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-1`)).json();
      console.log(res);
    }
    //delete webhook
    this.deleteWebhook = async function () {
      return await (await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`)).json()
    }
  }
}


const cocktail = 'Welcome in cocktail library';
export default cocktail;