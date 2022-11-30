import { $, $$, setVar, calcTextWidth } from './util.js';

const snippetNode = $('#snippet');


const trimLines = (rows) => {
  // Trim blank lines from start/end
  const totalLines = rows.length;
  let trimStart = true;
  let trimStartIndex = 0;

  let trimEnd = false;
  let trimEndIndex = 0;
  let lastLineBlank = false;

  for (let idx = 0; idx < totalLines; idx++) {
    const lineIsEmpty = rows[idx].innerText.trim() === ""

    // Keep track of how many lines at the start are blank.
    if (trimStart) {
      if (lineIsEmpty) {
        trimStartIndex++;
        continue;
      } else {
        trimStart = false;
        trimEnd = true;
      }
    }

    // Keep track of first blank line we encounter as we move towards the end
    if (trimEnd) {
      if (lineIsEmpty) {
        if (!lastLineBlank) {
          trimEndIndex = idx;
          lastLineBlank = true;
        }
      } else {
        trimEndIndex = totalLines;
        lastLineBlank = false;
      }
    }
  }

  // Remove all the blank lines from the start
  for (let idx = 0; idx < trimStartIndex; idx++) {
    rows[idx].remove();
  }

  // Remove all the blank lines from the end
  for (let idx = trimEndIndex; idx < totalLines; idx++) {
    rows[idx].remove();
  }


  // Return the number of lines we removed so we can offset the line number.
  return trimStartIndex;
}

const setupLines = (node, config) => {
  $$(':scope > br', node).forEach((row) => (row.outerHTML = '<div>&nbsp;</div>'));

  const rows = $$(':scope > div', node);
  setVar('line-number-width', calcTextWidth(rows.length + config.startLine));

  const startLinesTrimmed = trimLines(rows);

  rows.forEach((row, idx) => {
    const newRow = document.createElement('div');
    newRow.classList.add('line');
    row.replaceWith(newRow);

    if (config.showLineNumbers) {
      const lineNum = document.createElement('div');
      lineNum.classList.add('line-number');
      
      // lineNumber click event
      lineNum.onclick = function (e) {
        if(this.parentNode.classList.contains("line-focus")) {
          
          this.parentNode.classList.remove("line-focus");
          this.parentNode.classList.add("git-add");
          this.classList.add('!text-white')

        } else if (this.parentNode.classList.contains("git-add")) {

          this.parentNode.classList.remove("git-add");
          this.parentNode.classList.add("git-remove");
          this.classList.add('!text-white')

        } else if (this.parentNode.classList.contains("git-remove")) {
          
          this.parentNode.classList.remove("line-focus");
          this.parentNode.classList.remove("git-add");
          this.parentNode.classList.remove("git-remove");
          lineNum.classList.remove('text-white')

        } else {
          this.parentNode.classList.add("line-focus");
          this.parentNode.classList.remove("git-add");
          this.parentNode.classList.remove("git-remove");
          lineNum.classList.add('!text-white')
        }
      };
      lineNum.textContent = idx + 1 + config.startLine - startLinesTrimmed;
      newRow.appendChild(lineNum);
    }

    const span = document.createElement('span');
    span.textContent = ' ';
    row.appendChild(span);

    const lineCodeDiv = document.createElement('div');
    lineCodeDiv.classList.add('line-code');

    if (row.innerText.trim().length === 1 && row.childNodes.length === 2) {
      const char = row.innerText.trim();

      const lineCode = document.createElement('span');
      lineCode.innerHTML = row.innerHTML.split(char).join("");
      lineCodeDiv.appendChild(lineCode);

      const lineCode1 = document.createElement('span');
      lineCode1.innerHTML = row.innerHTML.replace(/&nbsp;/ig, "");
      lineCodeDiv.appendChild(lineCode1);
    } else {
      const lineCode = document.createElement('span');
      lineCode.innerHTML = row.innerHTML;
      lineCodeDiv.appendChild(lineCode);
    }
    newRow.appendChild(lineCodeDiv);
  });
};

const stripInitialIndent = (node) => {
  const regIndent = /^\s+/u;
  let initialSpans = $$(':scope > div > span:first-child', node);
  if (initialSpans.some((span) => !regIndent.test(span.textContent))) return;
  initialSpans = initialSpans.filter((span) => span.textContent.trim() === "");
  const minIndent = Math.min(
    ...initialSpans.map((span) => span.textContent.match(regIndent)[0].length)
  );
  initialSpans.forEach((span) => (span.textContent = span.textContent.slice(minIndent)));
};

const getClipboardHtml = (clip) => {
  const html = clip.getData('text/html');
  if (html) return html;
  const text = clip
    .getData('text/plain')
    .split('\n')
    .map((line) => `<div>${line}</div>`)
    .join('');
  return `<div>${text}</div>`;
};

export const pasteCode = (config, clipboard) => {
  snippetNode.innerHTML = getClipboardHtml(clipboard);
  const code = $('div', snippetNode);
  snippetNode.style.fontSize = code.style.fontSize;
  snippetNode.style.lineHeight = code.style.lineHeight;
  snippetNode.innerHTML = code.innerHTML;
  stripInitialIndent(snippetNode);
  setupLines(snippetNode, config);
};
