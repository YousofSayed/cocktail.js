/*cocktail library created at 2/3/2023 - Devloped by yousef sayed*/
export function $(element = "string") {
  return document.querySelector(element);
}

export function $a(elements = "string") {
  return document.querySelectorAll(elements);
}

export function cre({ elementType, className, id, src, href, type = "", placeholder, where = document, prepend = false, replace = false }) {
  let el = document.createElement(elementType)
  console.log(el);
  if (className) { el.className = className };
  if (id) { el.id = id };
  if (src) { el.src = src };
  if (href) { el.href = href };
  if (placeholder) { el.placeholder = placeholder };
  if (where) { where.appendChild(el) };
  if (prepend) { where.prepend(el); }
  if (type) { el.type = type; }
  return el;
}

export function setOnInObjectProto() {
  Element.prototype.on = function (type = "string", callback = () => { }) {
    this.addEventListener(type, callback)
  }
}

Element.prototype.on = function (type = "string", callback = () => { }) {
  this.addEventListener(type, callback)
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

class MakeAudioWaveOnLoad {
  constructor(loadSrc, drawCanvas) {
    this.laodSrc = loadSrc;
    this.drawCanvas = drawCanvas;

    async function loadSrc(src) {
      let buffer = (await fetch(src)).arrayBuffer(),
        audCtx = new AudioContext(),
        audioBuffer = await audCtx.decodeAudioData(await buffer),
        float32Array = audioBuffer.getChannelData(0);
      return float32Array
    }

    async function drawCanvas({ src, canvas, waveColor }) {
      let channelData = await loadSrc(src),
        ctx = canvas.getContext('2d');
      let { width, height } = canvas;
      let step = Math.ceil(channelData.length / width)
      ctx.fillStyle = waveColor;
      for (let i = 0; i < width; i++) {
        ctx.fillRect(2.4 * i, height / 2, 2, channelData[i]);
        ctx.fillRect(2.4 * i, height / 2, 2, -channelData[i]);
      }
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

//make component function
export function component({ type, attr, events, style, $for, push, content, children }) {
  const el = !type ? document.createDocumentFragment() : document.createElement(type);
  //function to do same element creation
  function createForElement(children, parent) {
    if (children) {
      for (let i = 0; i < children.loop; i++) {
        let item = document.createElement(children.type);
        //start set attrtibutes
        if (children.attr) {
          for (const key of Object.keys(children.attr)) {
            if (!children.attr[key][i]) { continue; }
            item.setAttribute(key, children.attr[key][i])
          }
        }
        //end set attrtibutes

        //start set contents
        if (children.content) {
          item.append(children.content[i])
        }
        //end set contents

        //now append the child
        parent.appendChild(item)
      }
      //finally append child in the parent
      // el.appendChild(parent);
    }
  }

  const handlers = {
    createForElement: (children, parent) => {
      if (children) {
        for (let i = 0; i < children.loop; i++) {
          let item = document.createElement(children.type);
          //start set attrtibutes
          if (children.attr) {
            for (const key of Object.keys(children.attr)) {
              if (!children.attr[key][i]) { continue; }
              item.setAttribute(key, children.attr[key][i])
            }
          }
          //end set attrtibutes

          //start set contents
          if (children.content) {
            item.append(children.content[i])
          }
          //end set contents

          //now append the child
          parent.appendChild(item)
        }
      }
    },

    eventsHandler: (events, element) => {
      for (const key in events) {
        if (events.hasOwnProperty(key)) {
          element.addEventListener(key, events[key])
        }
      }
    },

    styleHandler: (styles, element) => {
      for (const key in styles) {
        if (styles.hasOwnProperty(key)) {
          element.style[key] = styles[key];
        }
      }
    }
  }
  // set attributes for parent element
  if (attr) {
    for (const key of Object.keys(attr)) {
      if (attr.hasOwnProperty(key)) {
        el.setAttribute(key, attr[key]);
      }
    }
  }

  if (events) {
    handlers.eventsHandler(events, el);
  }

  if (style) {
    handlers.styleHandler(style, el)
  }

  //start for in parent element
  createForElement($for, el);

  //if he chose push way
  if (push) {
    const types = push.types, attrs = push.attrs, contents = push.contents;
    for (let i = 0; i < types.length; i++) {
      let chiledPush = document.createElement(types[i]);

      //set attributes 
      if (attrs) {
        for (const key in attrs) {
          if (attrs.hasOwnProperty(key)) {
            chiledPush.setAttribute(key, attrs[key][i]);
          }
        }
      }

      //set contents
      if (contents) {
        contents[i] instanceof Element ? chiledPush.appendChild(contents[i]) : chiledPush.insertAdjacentHTML('beforeend', contents[i]);
      }
      el.appendChild(chiledPush)
    }
  }

  //set the content as textNode in parent
  if (content) {
    el.insertAdjacentHTML('beforeend', content);
  }
  //set childeren
  if (children) {
    for (const key of Object.keys(children)) {
      let childType = children[key].type, childAttr = children[key].attr,
        childContent = children[key].content,
        childrepeat = children[key].repeat,
        childEvent = children[key].events,
        childStyle = children[key].style,
        childFor = children[key].$for;

      const childEl = document.createElement(childType);
      //set attributes of child
      if (childAttr) {
        for (const key of Object.keys(childAttr)) {
          if (childAttr.hasOwnProperty(key)) {
            childEl.setAttribute(key, childAttr[key]);
          }
        }
      }

      if (childContent) {
        if (Array.isArray(childContent)) {
          for (let i = 0; i < childContent.length; i++) {
            childContent[i] instanceof Element ? childEl.appendChild(childContent[i]) : childEl.insertAdjacentHTML('beforeEnd', childContent[i]);
          }
        } else { childContent instanceof Element ? childEl.appendChild(childContent) : childEl.insertAdjacentHTML('beforeEnd', childContent) }
      }

      //if some love to reapet same child
      if (childrepeat) {
        for (let i = 0; i < childrepeat; i++) {
          if (childContent instanceof Element) {
            let cloneNode = childContent.cloneNode(true);
            childEl.appendChild(cloneNode)
          } else { childEl.insertAdjacentHTML('beforeend', childContent) }
        }
        // el.appendChild(childEl);
      }

      if (childEvent) {
        handlers.eventsHandler(childEvent, childEl);
      }

      if (childStyle) {
        handlers.styleHandler(childStyle, childEl)
      }

      //to for on items
      handlers.createForElement(childFor, childEl)
      el.appendChild(childEl)
    }
  }
  return el;
}

let myComponent = component({
  type: 'section',
  attr: {
    class: "parent",
    id: "parent"
  },
  content: 'Welcome in first test',
  events: {
    click: (ev) => { console.log(ev) },
    input: (ev) => { console.log(ev); }
  },
  //children
  children: {
    child1: {
      type: 'div',
      attr: { class: "child1" },
      content: component({
        type: 'div', attr: { class: "nestedChild" }, children: {
          child1: { type: "div", attr: { class: "nestdNestedChild" }, content: "welcome bro" }
        },
      }),
      repeat: 4,
      events: {
        mousemove: (ev) => { console.log(true); }
      }
    },
    child2: {
      type: 'div',
      attr: { class: "child2" },
      content: component({
        type: 'div', attr: { class: "nestedChild2" }, children: {
          child1: { type: "div", attr: { class: "nestdNestedChild2" }, content: "welcome bro2" }
        },
      }),
      repeat: 4,
    },
    child3: {
      type: 'ul',
      attr: { class: "many-items", id: "k=list" },
      $for: { loop: 4, type: 'li', attr: { class: ['i1', 'i2', 'i3', 'i4'], id: ['i1', 'i2', 'i3', 'i4'] }, content: ['welcom1', 'welcome2', 'welcome3', 'welcome4'] }
    }
  }
});

let my2comp = component({
  $for: { loop: 4, type: 'li', attr: { class: ['li1', 'li1', 'li3'] }, content: ['well1', 'well2', 'well3', 'well4'] },
  children: {
    ch1: {
      type: 'h1',
      attr: { class: 'h1c2', id: 'h1c2' },
      content: 'h1c2',
      repeat: 3
    }
  }
})

let my3comp = component({
  push: {
    types: ['h1', 'div', 'section'],
    attrs: {
      class: ['h1', 'div', 'section'],
      id: ['h1', 'div', 'section']
    },
    contents: ['hello h1', 'hello div', 'hello section']
  }
})

console.log(myComponent);
console.log(my2comp);
console.log(my3comp);


//set render function to render component
export class Render {
  constructor(element, [components=document]) {
    const vDom = document.createDocumentFragment();
    for (let i = 0; i < components.length; i++) {
      isElement(components[i]) ? vDom.appendChild(components[i]) : vDom.appendChild(component({ type: 'div', content: components[i] }))
    }
    element.appendChild(vDom);
  }
}

/*******************@Start_Element_prototypes ==========================*/
Element.prototype.render = async function (...components) {
  return new Render(this, components)
}
/*******************@End_Element_prototypes ==========================*/


/*******************@Start_Array_prototypes ==========================*/
Array.prototype.at = function (num) {
  if(num >= 0) {throw new Error('Number must be less than 0')}
  return this[this.length + num]
}
/*******************@End_Array_prototypes ==========================*/


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

export function onMobile(cb = function () { }) {
  if (navigator.userAgentData.platform == 'mobile' || navigator.userAgentData.platform == 'Mobile') {
    cb();
  }
}

//send to server
export async function sendToServer(api = "string", data = {}, json = false) {
  let response = await fetch(api, { method: "POST", headers: { 'content-type': 'Application/json' }, body: JSON.stringify(data) });

  return json ? JSON.parse(await response.json()) : await response.text()
}

//Email validation
export function isValidEmail(email = "string") {
  let matching = email.trim().match(/\w+(\.\w+)?@\w+\.\w+$/ig);
  if (!matching) {
    return { valid: false, msg: "Email is not a valid" }
  } else if (matching.join("").match(/\.\w+/ig)[matching.join("").match(/\.\w+/ig).length - 1] != ".com") {
    return { valid: false, msg: "We just accept .com" }
  }
  else { return { valid: true, type: "email", data: email.trim(), msg: "Email is valid" } }
}

//Name validation
export function isValidName(name = "") {
  let specialCharMatch = name.trim().match(/[\s+|\W+]/g);
  if (specialCharMatch || name.trim() === "") {
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
export function isValidPassword(password = "") {
  password = password.trim();
  let specialCharMatch = password.match(/[^a-z0-9\.\s+]/ig);
  let numsMatch = password.match(/[0-9]/ig);
  let upperCharMatch = password.match(/[A-Z]/g);
  let lowerrCharMatch = password.match(/[a-z]/g);
  let spaceMatch = password.match(/[\s+]/g);
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
export function isValidRePassword(mainPassword, rePassword) {
  return rePassword.trim() == mainPassword.trim() ? { valid: true, data: rePassword.trim(), msg: "valid" } : { valid: false, msg: "Re password does not match" };
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


//submitting form
export function isValidForm({ fName = "", lName = "", date = [document], email, password, rePassword, genders = [document] }) {
  //check names
  let fNameValidation = isValidName(fName.value), lNameValidation = isValidName(lName.value);

  //check date
  let dateValidation = isValidDate(`${date[0].value}/${date[1].value}/${date[2].value}`);

  //check email 
  let emailValidation = isValidEmail(email);

  //check password
  let passwordValidation = isValidPassword(password);

  //check re password
  let rePasswordValidation = isValidRePassword(password, rePassword);

  //check gender
  let genderValidation = isValidGender(genders);

  //start checking
  let checker = [fNameValidation, lNameValidation, dateValidation, emailValidation, passwordValidation, rePasswordValidation, genderValidation];
  let result, ok;
  for (let i = 0; i < checker.length; i++) {
    if (!checker[i].valid) { result = checker[i].msg, ok = false; break; } else {
      result = {
        name: `${fName.value.trim()} ${lName.value.trim()}`,
        gender: genderValidation.data,
        age: dateValidation.data,
        email: email.trim(),
        password: password.trim()
      }
      ok = true;
    }
  }

  return { ok, result }
}

//encode & decode
export function encode(text = "string", password = "") {
  const complexChars = [
    "∆", "¬", "œ", "€", "®", "¨", "ø", "π", "å", "ß", "∂", "ƒ", "©",
    "˚", "¬", "µ", "+", "Ω", "œ", "®", "´", "´´", "≠", "–",
    "≤", "≥", "÷", "Ω", "µ", "∞", "¥", "§", "Π", "∫",
    "‰", "∏", "“", "”", "’", "‘", "≤", "≥", "⁄", "©",
    "~", "Π", "‹", "›", "ﬂ", "·", "‚", "£", "„", "‰",
    "", "œ", "®", "†", "¨", "ø", "π", "å", "ß", "∂", "ƒ", "©", "∆", "˚",
    "¬", "µ", "Ω", "≠", "œ", "®", "∑", "´", "´´", "–", "≤", "≥",
    "÷", "Ω", "µ", "∞", "§", "Π", "∫", "∑", "∆", "ø", "ˆ", "¨", "‰",
    "∏", "“", "”", "’", "‘", "≤", "≥", "⁄", "∑", "ƒ", "©", "∆", "«",
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

  let encodedCode = [...encodeURIComponent(text) + encodeURIComponent("SSpassword:" + password)];
  for (let i = 0; i < encodedCode.length; i++) { encodedCode[i] = encodedCode[i] + complexChars[i + 3 + 4 + 1] + complexChars[i + 1 + 2] + complexChars[i + 1] + complexChars[i + 5] + complexChars[i] + complexChars[i + 3 + 1] + complexChars[i + 1 + 5]; };

  let reader = new FileReader(), textEncoder = new TextEncoder().encode(encodedCode.join("")), blob = new Blob(textEncoder);

  const myData = new Promise((res, rej) => {
    reader.readAsBinaryString(blob);
    reader.on('load', () => {
      if (reader.result) {
        let dataArray = [...reader.result.replace("data:application/octet-stream;base64,", "")]
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] += complexChars[i + 1 + i] + complexChars[i + 2 + 3 + i] + complexChars[i + 2 + 3 + 1 + i]
          if (i >= 15) { dataArray[i] = " "; }
        }
        res(dataArray.join("").split(" ").join("") + btoa(`*^Password$#${password}`))
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

//log asynchronous and synchronous
export async function log(data) {
  try {
    console.log(await data);
  } catch (error) {
    throw new Error(error.message)
  }
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

export class CocktailDB {
  constructor(dbname = "string") {
    this.updateI = 1;
    this.dbname = dbname;
    this.handlers = {
      doRequest: async (callback = () => { }) => {
        const request = indexedDB.open(dbname, this.updateI - 1);
        let returnData = new Promise((res, rej) => {
          request.addEventListener('success', function (ev) {
            let cb = callback(this.result);
            res(cb)
          })

          request.addEventListener('error', function () {
            rej(new Error('Error : ' + this.error))
          });
        });

        return returnData;
      },

      createObjectStore: async (name, request) => {
        request.addEventListener('upgradeneeded', function (ev) {
          this.result.createObjectStore(name, { keyPath: 'id' })
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
            let objectStore = db.transaction(name, 'readonly').objectStore(name).getAll();;
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

  }
  createCollction = async function (name) {
    const request = indexedDB.open(this.dbname, this.updateI);
    this.updateI++; //to update version to create new objectStore (collection)
    this.handlers.createObjectStore(name, request); //to create new objectStore (collection)

    const methods = {
      set: async (query) => {
        try {
          return await this.handlers.doRequest(async (db) => {
            let lastId = await methods.find();
            console.log(lastId[lastId.length - 1].id);
            query.id = lastId[lastId.length - 1].id + 1 || 0;
            db.transaction(name, 'readwrite').objectStore(name).add(query);
            db.close();
          });
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findOne: async (query) => {
        try {
          if (query instanceof Object && !Object.entries(query)[0]) { throw new Error(`findeOne must not be an empty`) }
          if (typeof query !== typeof {}) { throw new Error(`findeOne key type must not be an object`) }
          return await this.handlers.findHandler(name, query, (matches) => matches[0])
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
          if (query && typeof query !== typeof {}) { throw new Error(`findeOne key type must not be an object`) };
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
          this.handlers.doRequest(async (db) => {
            let targetQuery = await methods.findOne(query);
            console.log(targetQuery);
            db.transaction(name, 'readwrite').objectStore(name).delete(targetQuery.id)
          })
        } catch (error) {
          throw new Error(error.message);
        }
      },

    }

    return methods
  }
}
let i = 0;

async function testDB() {
  let db = new CocktailDB('db');
  let coll = await db.createCollction('users')
  let coll2 = await db.createCollction('msgs')
  // coll.set({ id: '1', name: 'yousef', age: 21 });
  // let i = 2;
  // coll.findOneAndUpdate({ id: '1', name: 'yousef', age: 25 },2)
  console.log(await coll.findOne({ age: 21 }))
  console.log(await coll.findOne({ name: 'yousefSayedNew' }));
  console.log(await coll.find());
  // log(coll.findOne())
  // log(coll.findOne())
  window.onclick = () => {
    i++
    // console.log(i);

    // db.createCollction('msgs' + i, 'id')
    console.log(coll);

    // coll.set({ name: 'yousefSayedNew', age: 21 });
    // coll.delete({age:21})
    // coll.findAndUpdate({ age: 21 }, { name: ' ءآلاء ناصر', age: 'خالدين في الجنه بفبضل الله عز و جل' });
    // coll.deleteOne({age:22})
  }

}
testDB()
const cocktail = 'Welcome in cocktail library';
export default cocktail;