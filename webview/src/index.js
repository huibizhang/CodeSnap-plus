import { $, $$, setVar } from './util.js';
import { pasteCode } from './code.js';
import { takeSnap, cameraFlashAnimation } from './snap.js';

const navbarNode = $('#navbar');
const windowControlsNode = $('#window-controls');
const windowTitleNode = $('#window-title');
const btnSave = $('#save');
const btnCopy = $('#secondMainBtn');

const showLineNumBtn = $('#showLineNumBtn');
const showWindowControlsBtn = $('#showWindowControlsBtn');
const modeChangeBtn = $("#modeChangeBtn")

let _toolMode;

let config;

// btnSave.addEventListener('click', () => takeSnap(config));

document.addEventListener('copy', () => takeSnap({ ...config, shutterAction: 'copy' }));

document.addEventListener('paste', (e) => pasteCode(config, e.clipboardData));

window.addEventListener('message', ({ data: { type, ...cfg } }) => {
  if (type === 'setup-ui') {
    config = cfg;

    const {
      showWindowTitle,
      shutterAction,
      toolMode
    } = config;

    _toolMode = toolMode

    let actions = []
    if (shutterAction === "save") {
      actions = [
        () => takeSnap(config), 
        () => takeSnap({ ...config, shutterAction: 'copy' }),
      ]
      btnCopy.textContent = "Copy"
    } else {
      actions = [
        () => takeSnap(config),
        () => takeSnap({ ...config, shutterAction: 'save' }), 
      ]
      btnCopy.textContent = "Save As..."
    }

    btnSave.addEventListener('click', actions[0])
    btnCopy.addEventListener('click', actions[1])

    showLineNumBtn.addEventListener('click', () => {
      document.getElementById('showLineNumBtn').children[0].children[0].classList.toggle('opacity-0');

      // showLineNumBtn.firstChild.classList.toggle('opacity-100');

      const lineNums = $$('.line-number');
    
      lineNums.forEach(lineNum => {
        lineNum.classList.toggle("hidden")
      })
    })


    showWindowControlsBtn.addEventListener('click', () => {
      document.getElementById('showWindowControlsBtn').children[0].children[0].classList.toggle('opacity-0');
      windowControlsNode.hidden = !windowControlsNode.hidden
      navbarNode.hidden = windowControlsNode.hidden && !showWindowTitle;
    })

    toolModeToggled()

    modeChangeBtn.addEventListener('click', () => {
      _toolMode = _toolMode==='advanced' ? 'simple': 'advanced'
      toolModeToggled()
    })
  }
  else if (type === 'update') {
    config = cfg;

    const {
      fontLigatures,
      tabSize,
      backgroundColor,
      boxShadow,
      containerPadding,
      roundedCorners,
      showWindowControls,
      showWindowTitle,
      windowTitle,
      showLineNumbers,
      toolMode
    } = config;

    _toolMode = toolMode

    setVar('ligatures', fontLigatures ? 'normal' : 'none');
    if (typeof fontLigatures === 'string') setVar('font-features', fontLigatures);
    setVar('tab-size', tabSize);
    setVar('container-background-color', backgroundColor);
    setVar('box-shadow', boxShadow);
    setVar('container-padding', containerPadding);
    setVar('window-border-radius', roundedCorners ? '4px' : 0);

    navbarNode.hidden = !showWindowControls && !showWindowTitle;
    windowControlsNode.hidden = !showWindowControls;
    windowTitleNode.hidden = !showWindowTitle;

    windowTitleNode.textContent = windowTitle;

    if (!showLineNumbers) {
      document.getElementById('showLineNumBtn').children[0].children[0].classList.toggle('opacity-0');
    }

    if (!showWindowControls){
      document.getElementById('showWindowControlsBtn').children[0].children[0].classList.toggle('opacity-0');
    }

    document.execCommand('paste');
  } else if (type === 'flash') {
    cameraFlashAnimation();
  }
});

const toolModeToggled = () => {
  if(_toolMode === 'advanced') {
    btnCopy.classList.remove("hidden")
    $('#showLineNumBtn').classList.remove("hidden")
    $('#showWindowControlsBtn').classList.remove("hidden")
    $("#rightPanel").classList.remove("justify-end")
    modeChangeBtn.textContent = "Simple Mode"
  } else {
    btnCopy.classList.add("hidden")
    $('#showLineNumBtn').classList.add("hidden")
    $('#showWindowControlsBtn').classList.add("hidden")
    $("#rightPanel").classList.add("justify-end")
    modeChangeBtn.textContent = "Advanced Mode"
  }
}