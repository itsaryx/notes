const editor = document.getElementById('editor');

const tabs = [{
    id: Date.now(),
    name: 'untitled.txt',
    content: '',
    isModified: false
}];

let activeTab = tabs[0];

const SUPPORTED_FILES = {
    'js': { name: 'JavaScript', mime: 'text/javascript', icon: 'fab fa-js' },
    'html': { name: 'HTML', mime: 'text/html', icon: 'fab fa-html5' },
    'css': { name: 'CSS', mime: 'text/css', icon: 'fab fa-css3-alt' },
    'txt': { name: 'Plain Text', mime: 'text/plain', icon: 'far fa-file-alt' }
};

const LANGUAGE_SNIPPETS = {
    'js': {
        'func': 'function name() {\n    \n}',
        'if': 'if (condition) {\n    \n}',
        'for': 'for (let i = 0; i < length; i++) {\n    \n}',
        'log': 'console.log();',
        'const': 'const name = value;',
        'let': 'let name = value;',
        'arrow': '() => {\n    \n}',
        'class': 'class Name {\n    constructor() {\n        \n    }\n}',
        'async': 'async function name() {\n    \n}',
        'try': 'try {\n    \n} catch (error) {\n    \n}',
        'imp': 'import { } from "";'
    },
    'html': {
        'div': '<div></div>',
        'span': '<span></span>',
        'class': 'class=""',
        'id': 'id=""',
        'link': '<link rel="stylesheet" href="">',
        'script': '<script src=""></script>',
        'meta': '<meta name="" content="">',
        'img': '<img src="" alt="">',
        'form': '<form action="" method="">\n    \n</form>',
        'input': '<input type="text" name="">',
        'btn': '<button type="button"></button>'
    },
    'css': {
        'flex': 'display: flex;',
        'grid': 'display: grid;',
        'pad': 'padding: ;',
        'mar': 'margin: ;',
        'bg': 'background: ;',
        'col': 'color: ;',
        'pos': 'position: relative;',
        'abs': 'position: absolute;',
        'med': '@media (max-width: ) {\n    \n}',
        'ani': '@keyframes name {\n    from {\n        \n    }\n    to {\n        \n    }\n}'
    }
};

const FILE_TEMPLATES = {
    'html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`,
    'css': `:root {
}

body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}`,
    'js': `document.addEventListener('DOMContentLoaded', () => {
});`
};

const DEFAULT_TAB = {
    id: Date.now(),
    name: 'untitled.txt',
    content: '',
    isModified: false,
    type: 'txt',
    icon: SUPPORTED_FILES['txt'].icon
};

tabs.length = 0;
tabs.push({...DEFAULT_TAB});
activeTab = tabs[0];

updateTabs();

function createTab() {
    const dialog = document.createElement('div');
    dialog.className = 'new-tab-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>New File</h3>
            <div class="input-group">
                <input type="text" id="new-file-name" placeholder="File name" value="untitled">
                <select id="new-file-type">
                    <option value="txt" selected>.txt</option>
                    <option value="js">.js</option>
                    <option value="html">.html</option>
                    <option value="css">.css</option>
                </select>
            </div>
            <div class="dialog-buttons">
                <button onclick="createNewFile()">Create</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
    document.getElementById('new-file-name').focus();
}

function createNewFile() {
    const name = document.getElementById('new-file-name').value;
    const type = document.getElementById('new-file-type').value;
    const fileName = `${name}.${type}`;
    
    const tab = {
        id: Date.now(),
        name: fileName,
        content: FILE_TEMPLATES[type] || '',
        isModified: false,
        type: type,
        icon: SUPPORTED_FILES[type]?.icon || 'far fa-file'
    };
    
    tabs.push(tab);
    switchToTab(tab);
    document.querySelector('.new-tab-dialog').remove();
}

function switchToTab(tab) {
    if (activeTab) {
        activeTab.content = editor.value;
    }
    
    activeTab = tab;
    editor.value = tab.content;
    updateTabs();
    updateStats();
    updateLineNumbers();
    updateToolbar();
}

function closeTab(tabId) {
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;
    
    if (tabs[index].isModified) {
        if (!confirm('This file has unsaved changes. Close anyway?')) {
            return;
        }
    }
    
    tabs.splice(index, 1);
    if (tabs.length === 0) {
        createTab();
    } else if (activeTab.id === tabId) {
        switchToTab(tabs[index - 1] || tabs[0]);
    }
    updateTabs();
}

function updateTabs() {
    const tabBar = document.querySelector('.tab-bar');
    tabBar.innerHTML = tabs.map(tab => `
        <div class="tab ${tab === activeTab ? 'active' : ''}" onclick="switchToTab(tabs.find(t => t.id === ${tab.id}))">
            <i class="${tab.icon || 'far fa-file'}" aria-hidden="true"></i>
            <span class="tab-name" ondblclick="renameTab(${tab.id})">${tab.name}${tab.isModified ? '*' : ''}</span>
            <button class="tab-close" onclick="event.stopPropagation(); closeTab(${tab.id})">×</button>
        </div>
    `).join('') + '<button class="new-tab" onclick="createTab()"><i class="fas fa-plus"></i></button>';
    
    const fileType = activeTab.type || 'txt';
    const typeInfo = SUPPORTED_FILES[fileType] || SUPPORTED_FILES.txt;
    document.querySelector('.file-type-indicator').innerHTML = 
        `<i class="${typeInfo.icon}"></i> ${typeInfo.name}`;
}

function renameTab(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    const newName = prompt('Enter new name:', tab.name);
    if (newName && newName !== tab.name) {
        tab.name = newName;
        updateTabs();
    }
}

function newFile() {
    createTab();
}

function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.js,.html,.css';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const text = await file.text();
        const fileType = file.name.split('.').pop().toLowerCase();
        
        const tab = {
            id: Date.now(),
            name: file.name,
            content: text,
            isModified: false,
            type: fileType,
            icon: SUPPORTED_FILES[fileType]?.icon || 'far fa-file'
        };
        tabs.push(tab);
        switchToTab(tab);
        highlightSyntax(tab);
    };
    input.click();
}

function saveFile() {
    if (!activeTab) return;
    
    const blob = new Blob([editor.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.name;
    a.click();
    URL.revokeObjectURL(url);
    
    activeTab.isModified = false;
    activeTab.content = editor.value;
    updateTabs();
}

function updateStats() {
    const text = editor.value;
    document.getElementById('char-count').textContent = `Characters: ${text.length}`;
    document.getElementById('line-count').textContent = `Lines: ${text.split('\n').length}`;
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
}

function changeFontSize() {
    const size = document.getElementById('font-size').value;
    editor.style.fontSize = `${size}px`;
}

function toggleWordWrap() {
    const wrap = editor.getAttribute('wrap') === 'off' ? 'soft' : 'off';
    editor.setAttribute('wrap', wrap);
    document.getElementById('word-wrap-status').textContent = wrap === 'off' ? 'No Wrap' : 'Wrap';
}

function toggleLineNumbers() {
    const numbers = document.getElementById('line-numbers');
    numbers.style.display = numbers.style.display === 'none' ? 'block' : 'none';
    updateLineNumbers();
}

function updateLineNumbers() {
    const lines = editor.value.split('\n');
    const numbers = document.getElementById('line-numbers');
    numbers.innerHTML = lines.map((_, i) => i + 1).join('\n');
}

function updateCursorPosition(e) {
    const text = editor.value;
    const pos = editor.selectionStart;
    const lines = text.substr(0, pos).split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    document.getElementById('char-count').textContent = `Ln ${currentLine}, Col ${currentCol}`;
}

function toggleFindDialog() {
    const dialog = document.getElementById('findDialog');
    dialog.style.display = dialog.style.display === 'none' ? 'block' : 'none';
    if (dialog.style.display === 'block') {
        document.getElementById('findInput').focus();
    }
}

function findNext() {
    const searchText = document.getElementById('findInput').value;
    const matchCase = document.getElementById('matchCase').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    
    let text = editor.value;
    let searchPos = editor.selectionEnd;
    
    if (!matchCase) {
        text = text.toLowerCase();
        searchText = searchText.toLowerCase();
    }
    
    let index = text.indexOf(searchText, searchPos);
    if (index !== -1) {
        if (wholeWord) {
            const before = text[index - 1] || ' ';
            const after = text[index + searchText.length] || ' ';
            if (/\w/.test(before) || /\w/.test(after)) {
                return;
            }
        }
        editor.setSelectionRange(index, index + searchText.length);
        editor.focus();
    }
}

function replace() {
    const searchText = document.getElementById('findInput').value;
    const replaceText = document.getElementById('replaceInput').value;
    if (editor.selectionStart !== editor.selectionEnd) {
        const selected = editor.value.substring(editor.selectionStart, editor.selectionEnd);
        if (selected === searchText) {
            document.execCommand('insertText', false, replaceText);
        }
    }
    findNext();
}

function replaceAll() {
    const searchText = document.getElementById('findInput').value;
    const replaceText = document.getElementById('replaceInput').value;
    editor.value = editor.value.split(searchText).join(replaceText);
    updateStats();
    updateLineNumbers();
}

let autoSaveTimeout;
const AUTO_SAVE_DELAY = 2000;

function autoSave() {
    clearTimeout(autoSaveTimeout);
    const indicator = document.querySelector('.auto-save-indicator');
    indicator.classList.add('saving');
    indicator.textContent = 'Saving...';
    
    autoSaveTimeout = setTimeout(() => {
        if (activeTab && activeTab.isModified) {
            const savedData = JSON.stringify({
                tabs: tabs.map(t => ({...t, content: t.content}))
            });
            localStorage.setItem('notepad_autosave', savedData);
            indicator.classList.remove('saving');
            indicator.classList.add('saved');
            indicator.textContent = 'All changes saved';
            
            setTimeout(() => {
                indicator.classList.remove('saved');
                indicator.textContent = 'AutoSave enabled';
            }, 2000);
        }
    }, AUTO_SAVE_DELAY);
}

function loadAutoSaved() {
    const saved = localStorage.getItem('notepad_autosave');
    if (saved) {
        const data = JSON.parse(saved);
        tabs.length = 0;
        tabs.push(...data.tabs);
        activeTab = tabs[0];
        updateTabs();
        editor.value = activeTab.content;
        updateStats();
    }
}

function detectFileType(filename) {
    const extensions = {
        'js': 'JavaScript',
        'html': 'HTML',
        'css': 'CSS',
        'md': 'Markdown',
        'txt': 'Plain Text',
        'json': 'JSON'
    };
    const ext = filename.split('.').pop().toLowerCase();
    return extensions[ext] || 'Plain Text';
}

function updateMinimap() {
    const minimap = document.querySelector('.minimap');
    const content = editor.value;
    const lines = content.split('\n').slice(0, 500);
    minimap.innerHTML = lines.map(line => 
        `<div class="minimap-line">${line}</div>`
    ).join('');
}

function updateDocumentStats() {
    const text = editor.value;
    const chars = text.length;
    const words = text.trim().split(/\s+/).length;
    const lines = text.split('\n').length;
    const stats = document.querySelector('.stats-panel');
    stats.innerHTML = `
        <div>Characters: ${chars}</div>
        <div>Words: ${words}</div>
        <div>Lines: ${lines}</div>
        <div>File type: ${detectFileType(activeTab.name)}</div>
    `;
}

function zoom(direction) {
    const currentSize = parseInt(getComputedStyle(editor).fontSize);
    const newSize = direction === 'in' ? currentSize + 2 : currentSize - 2;
    if (newSize >= 8 && newSize <= 32) {
        editor.style.fontSize = `${newSize}px`;
        document.getElementById('zoom').textContent = `${Math.round((newSize/14)*100)}%`;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        switch(e.key.toLowerCase()) {
            case 'n': e.preventDefault(); newFile(); break;
            case 'o': e.preventDefault(); openFile(); break;
            case 's': e.preventDefault(); saveFile(); break;
            case 'f': e.preventDefault(); toggleFindDialog(); break;
            case 'h': e.preventDefault(); toggleFindDialog(); break;
            case '=': e.preventDefault(); zoom('in'); break;
            case '-': e.preventDefault(); zoom('out'); break;
            case 'b': e.preventDefault(); document.querySelector('.stats-panel').classList.toggle('visible'); break;
        }
    }
});

editor.addEventListener('input', () => {
    updateStats();
    updateLineNumbers();
});

editor.addEventListener('scroll', () => {
    document.getElementById('line-numbers').scrollTop = editor.scrollTop;
});

editor.addEventListener('keyup', updateCursorPosition);
editor.addEventListener('click', updateCursorPosition);

editor.addEventListener('input', () => {
    updateStats();
    updateLineNumbers();
    if (activeTab) {
        activeTab.isModified = true;
        updateTabs();
    }
    autoSave();
    updateMinimap();
    updateDocumentStats();
    if (activeTab) {
        highlightSyntax(activeTab);
    }
    updateStatus();
    const cursorPos = editor.selectionStart;
    const content = editor.value;
    const wordStart = content.lastIndexOf(' ', cursorPos - 1) + 1;
    const currentWord = content.substring(wordStart, cursorPos);

    if (currentWord.length >= 2) {
        showSuggestions(currentWord, cursorPos);
    } else {
        hideSuggestions();
    }
});
updateStats();
updateLineNumbers();
updateTabs();
loadAutoSaved();
updateMinimap();
updateDocumentStats();

editor.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('#context-menu')) {
        document.getElementById('context-menu').style.display = 'none';
    }
});

function highlightSyntax(tab) {
    if (!tab.type || tab.type === 'txt') return;
    
    const code = editor.value;
    const highlighted = Prism.highlight(
        code,
        Prism.languages[tab.type],
        tab.type
    );
    
    const minimap = document.querySelector('.minimap');
    minimap.innerHTML = `<pre><code class="language-${tab.type}">${highlighted}</code></pre>`;
}

function createDefaultTabs() {
    const defaultFiles = [
        { name: 'script.js', type: 'js', content: '// JavaScript code here\n' },
        { name: 'styles.css', type: 'css', content: '/* CSS styles here */\n' },
        { name: 'index.html', type: 'html', content: '<!-- HTML code here -->\n' }
    ];
    
    tabs.length = 0;
    defaultFiles.forEach(file => {
        tabs.push({
            id: Date.now() + Math.random(),
            name: file.name,
            content: file.content,
            isModified: false,
            type: file.type,
            icon: SUPPORTED_FILES[file.type].icon
        });
    });
    
    activeTab = tabs[0];
    updateTabs();
    editor.value = activeTab.content;
    highlightSyntax(activeTab);
    updateStats();
}

if (!localStorage.getItem('notepad_autosave')) {
    createDefaultTabs();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-expand"></i>';
    }
}

function setLanguage(lang) {
    if (!activeTab) return;
    
    const extensions = {
        'javascript': 'js',
        'html': 'html',
        'css': 'css',
        'plaintext': 'txt'
    };
    
    activeTab.type = extensions[lang];
    activeTab.name = activeTab.name.split('.')[0] + '.' + extensions[lang];
    activeTab.icon = SUPPORTED_FILES[extensions[lang]].icon;
    
    updateTabs();
    highlightSyntax(activeTab);
}

editor.addEventListener('keyup', (e) => {
    const line = editor.value.substr(0, editor.selectionStart).split('\n').length - 1;
    document.documentElement.style.setProperty('--active-line', line);
});

editor.addEventListener('dragover', (e) => {
    e.preventDefault();
    editor.classList.add('drag-over');
});

editor.addEventListener('dragleave', () => {
    editor.classList.remove('drag-over');
});

editor.addEventListener('drop', async (e) => {
    e.preventDefault();
    editor.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        const text = await file.text();
        const fileType = file.name.split('.').pop().toLowerCase();
        
        const tab = {
            id: Date.now(),
            name: file.name,
            content: text,
            isModified: false,
            type: fileType,
            icon: SUPPORTED_FILES[fileType]?.icon || 'far fa-file'
        };
        tabs.push(tab);
        switchToTab(tab);
        highlightSyntax(tab);
    }
});

function showShortcutHints() {
    const hints = document.createElement('div');
    hints.className = 'shortcut-hints';
    hints.innerHTML = `
        <div class="hints-content">
            <h3>Keyboard Shortcuts</h3>
            <div class="hint-grid">
                <div>New File</div><div>Ctrl + N</div>
                <div>Open File</div><div>Ctrl + O</div>
                <div>Save File</div><div>Ctrl + S</div>
                <div>Find/Replace</div><div>Ctrl + F</div>
                <div>Toggle Theme</div><div>Ctrl + K</div>
                <div>Toggle Stats</div><div>Ctrl + B</div>
                <div>Zoom In/Out</div><div>Ctrl +/-</div>
                <div>Fullscreen</div><div>F11</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
        </div>
    `;
    document.body.appendChild(hints);
    setTimeout(() => hints.classList.add('visible'), 100);
}

function updateStatus() {
    const text = editor.value;
    const selection = editor.selectionEnd - editor.selectionStart;
    const pos = editor.selectionStart;
    const lines = text.substr(0, pos).split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    
    document.getElementById('char-count').textContent = 
        `Ln ${currentLine}, Col ${currentCol}${selection > 0 ? ` (${selection} selected)` : ''}`;
    
    const langIndicator = document.querySelector('.language-indicator');
    if (activeTab && activeTab.type) {
        const lang = SUPPORTED_FILES[activeTab.type]?.name || 'Plain Text';
        langIndicator.innerHTML = `<i class="${SUPPORTED_FILES[activeTab.type]?.icon || 'far fa-file'}"></i> ${lang}`;
    }
}

window.addEventListener('load', () => {
    if (!localStorage.getItem('notepad_autosave')) {
        tabs.length = 0;
        tabs.push({...DEFAULT_TAB});
        activeTab = tabs[0];
        editor.value = '';
    }
    
    updateTabs();
    updateStatus();
    updateStats();
    updateLineNumbers();
    
    const tabBar = document.querySelector('.tab-bar');
    tabBar.style.display = 'flex';
    
    document.querySelector('.file-type-indicator').innerHTML = 
        `<i class="${SUPPORTED_FILES['txt'].icon}"></i> ${SUPPORTED_FILES['txt'].name}`;
    
    showShortcutHints();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});

let suggestionsBox = null;
let currentSuggestions = [];
let selectedSuggestionIndex = -1;

function showSuggestions(word, cursorPos) {
    if (!activeTab?.type || !LANGUAGE_SNIPPETS[activeTab.type]) return;
    
    const suggestions = Object.keys(LANGUAGE_SNIPPETS[activeTab.type])
        .filter(key => key.startsWith(word.toLowerCase()))
        .concat(getContextualSuggestions(word, activeTab.type));
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    if (!suggestionsBox) {
        suggestionsBox = document.createElement('div');
        suggestionsBox.className = 'suggestions-box';
        document.querySelector('.editor-container').appendChild(suggestionsBox);
    }

    const coords = getCaretCoordinates(editor, cursorPos);
    suggestionsBox.style.left = `${coords.left}px`;
    suggestionsBox.style.top = `${coords.top + 20}px`;

    currentSuggestions = suggestions;
    selectedSuggestionIndex = -1;
    
    suggestionsBox.innerHTML = suggestions
        .map((s, i) => `<div class="suggestion" data-index="${i}">${s}</div>`)
        .join('');
    
    suggestionsBox.style.display = 'block';
}

function hideSuggestions() {
    if (suggestionsBox) {
        suggestionsBox.style.display = 'none';
    }
    currentSuggestions = [];
    selectedSuggestionIndex = -1;
}

function insertSnippet(suggestion) {
    const snippet = LANGUAGE_SNIPPETS[activeTab.type][suggestion];
    const cursorPos = editor.selectionStart;
    const content = editor.value;
    const wordStart = content.lastIndexOf(' ', cursorPos - 1) + 1;
    
    editor.value = content.substring(0, wordStart) + 
                   snippet +
                   content.substring(cursorPos);
    
    hideSuggestions();
    editor.focus();
}

editor.addEventListener('keydown', (e) => {
    if (!suggestionsBox || suggestionsBox.style.display === 'none') return;

    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, currentSuggestions.length - 1);
            updateSelectedSuggestion();
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
            updateSelectedSuggestion();
            break;
        case 'Enter':
            if (selectedSuggestionIndex >= 0) {
                e.preventDefault();
                insertSnippet(currentSuggestions[selectedSuggestionIndex]);
            }
            break;
        case 'Escape':
            hideSuggestions();
            break;
    }
});

function updateSelectedSuggestion() {
    const suggestions = suggestionsBox.querySelectorAll('.suggestion');
    suggestions.forEach(s => s.classList.remove('selected'));
    if (selectedSuggestionIndex >= 0) {
        suggestions[selectedSuggestionIndex].classList.add('selected');
    }
}

function getContextualSuggestions(word, type) {
    const content = editor.value;
    const suggestions = [];
    
    switch(type) {
        case 'js':
            const matches = content.match(/(?:const|let|var|function)\s+(\w+)/g) || [];
            suggestions.push(...matches.map(m => m.split(/\s+/)[1]));
            break;
        case 'css':
            if (tabs.some(t => t.type === 'html')) {
                const htmlContent = tabs.find(t => t.type === 'html').content;
                const classMatches = htmlContent.match(/class="([^"]*)"/g) || [];
                suggestions.push(...classMatches.map(m => m.match(/class="([^"]*)"/)[1]));
            }
            break;
        case 'html':
            const idMatches = content.match(/id="([^"]*)"/g) || [];
            suggestions.push(...idMatches.map(m => m.match(/id="([^"]*)"/)[1]));
            break;
    }
    
    return suggestions.filter(s => s.startsWith(word));
}

function getLinkedFiles(htmlContent) {
    const files = {
        js: [],
        css: []
    };
    
    const scriptMatches = htmlContent.match(/<script.*?src=["'](.*?)["']/g) || [];
    files.js = scriptMatches.map(m => m.match(/src=["'](.*?)["']/)[1]);
    
    const cssMatches = htmlContent.match(/<link.*?href=["'](.*?)["'].*?rel=["']stylesheet["']/g) || [];
    files.css = cssMatches.map(m => m.match(/href=["'](.*?)["']/)[1]);
    
    return files;
}

function previewHTML() {
    if (!activeTab || activeTab.type !== 'html') return;
    
    const previewWindow = window.open('', '_blank');
    const content = activeTab.content;
    const linkedFiles = getLinkedFiles(content);
    
    let modifiedContent = content;
    linkedFiles.js.forEach(file => {
        const linkedTab = tabs.find(t => t.name === file);
        if (linkedTab) {
            modifiedContent = modifiedContent.replace(
                `<script src="${file}"></script>`,
                `<script>${linkedTab.content}</script>`
            );
        }
    });
    
    linkedFiles.css.forEach(file => {
        const linkedTab = tabs.find(t => t.name === file);
        if (linkedTab) {
            modifiedContent = modifiedContent.replace(
                `<link rel="stylesheet" href="${file}">`,
                `<style>${linkedTab.content}</style>`
            );
        }
    });
    
    previewWindow.document.write(modifiedContent);
    previewWindow.document.close();
}

function updateToolbar() {
    const toolbar = document.querySelector('.toolbar-group:first-child');
    const previewButton = document.getElementById('preview-btn');
    
    if (activeTab?.type === 'html') {
        if (!previewButton) {
            const btn = document.createElement('button');
            btn.id = 'preview-btn';
            btn.innerHTML = '<i class="fas fa-play"></i>';
            btn.title = 'Run HTML Preview';
            btn.onclick = previewHTML;
            toolbar.appendChild(btn);
        }
    } else if (previewButton) {
        previewButton.remove();
    }
}

function switchToTab(tab) {
    if (activeTab) {
        activeTab.content = editor.value;
    }
    
    activeTab = tab;
    editor.value = tab.content;
    updateTabs();
    updateStats();
    updateLineNumbers();
    updateToolbar();
}

window.addEventListener('load', () => {
    if (!localStorage.getItem('notepad_autosave')) {
        tabs.length = 0;
        tabs.push({...DEFAULT_TAB});
        activeTab = tabs[0];
        editor.value = '';
    }
    
    updateTabs();
    updateStatus();
    updateStats();
    updateLineNumbers();
    
    const tabBar = document.querySelector('.tab-bar');
    tabBar.style.display = 'flex';
    
    document.querySelector('.file-type-indicator').innerHTML = 
        `<i class="${SUPPORTED_FILES['txt'].icon}"></i> ${SUPPORTED_FILES['txt'].name}`;
    
    showShortcutHints();
    updateToolbar();
});
